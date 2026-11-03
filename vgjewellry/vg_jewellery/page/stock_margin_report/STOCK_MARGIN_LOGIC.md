# Stock Margin Report: calculation logic

Source: `stock_margin_report.py` (same folder).
Last updated: 2026-10-26.

The report shows the margin on **stock in hand**. For every label still in stock it works out what the
piece would sell for today and what it cost to buy, then saves the result in the `stock_margin` DocType.

---

## 1. Entry points

| Function | What it does |
|---|---|
| `start_sync()` (whitelisted) | Queues `sync_stock_margin` on the `long` queue. Duplicate jobs are skipped (`job_id="sync_stock_margin"`). |
| `sync_stock_margin()` | Calls `fetch_from_sql_server()`, **deletes every row** in `stock_margin`, then bulk-inserts the new rows. Names run 1, 2, 3 … |
| `get_stock_margin()` (whitelisted) | Returns all rows from `stock_margin` to the page. |

The SQL Server connection string comes from the environment variable `sjodbc`.

---

## 2. Overall flow

```
start_sync ──► sync_stock_margin
                 │
                 ├─ fetch_from_sql_server
                 │    ├─ Load masters: item, trade, variety, branch, supplier,
                 │    │                diamond style, diamond size
                 │    ├─ Load today's rates (TodayRateMst, latest row on or before today)
                 │    ├─ Load wastage slabs (ItemWiseLabour)
                 │    ├─ Load Diamond_Purchase_Rate (from Frappe)
                 │    │
                 │    └─ For each studded row of the latest LabelTransaction
                 │       of each label that is still in LabelBalance:
                 │          1. Find the row type  (gold / platinum / silver / diamond metal / diamond stone / other)
                 │          2. Look up rate, base rate, purity, wastage
                 │          3. Sales amount
                 │          4. Purchase amount
                 │          5. Margin  = Sales − Purchase
                 │             Margin% = Margin ÷ Purchase × 100
                 │
                 └─ Delete all rows in stock_margin → bulk insert
```

Each label can produce **several rows**: one for the metal and one for each stone. Margin is calculated
**per row**. To get the margin of a whole label, add up its Sales and Purchase first and then divide.
Don't average the row percentages.

---

## 3. Row type

Both `ItemTradMstId` (the studded row's trade ID) and `ParentItemTradMstId` (the label's trade ID) are checked.

| Condition (trade ID or parent trade ID) | Type |
|---|---|
| In `SILVER_PURITY` → 4003, 4004, 4005, 6005 | **Silver** |
| = 1006 and `StyleID` = 1006 | **Diamond metal** (the gold in a diamond piece) |
| = 1006 and `StyleID` ≠ 1006 | **Diamond stone** (diamond or colour-stone row) |
| In `GOLD_TRADE_IDS` → 1001, 1002, 1003, 1008, 1009 | **Gold** |
| = `PLATINUM_TRADE_ID` → 5001 | **Platinum** (same formula as gold) |
| Anything else | **Other**: shown in the report, with every amount set to 0 |

The checks run top to bottom, so silver and diamond take priority over gold.

---

## 4. Inputs

### 4.1 Rate per gram (sale side)

All rates in `TodayRateMst` are per 10 g, so they are divided by 10.

| Type | Rate |
|---|---|
| Gold / Platinum / Diamond | `PurRate ÷ 10` of the **rate ID**. If the StyleID is in `PURCHASE_PURITY`, the rate ID is the StyleID; otherwise it's the parent trade ID. If that rate is missing, the row's own trade ID is used. |
| Silver | `SalesRate ÷ 10` of the parent trade ID. If that is 0, it tries 4001 → 4003 → 4005 → 4004. |

### 4.2 Base rate per gram (purchase side)

| Type | Base rate |
|---|---|
| Gold / Diamond | `PurRate ÷ 10` of **1001** |
| Platinum | `PurRate ÷ 10` of **5001** (its own rate, so base = rate) |
| Silver | `PurRate ÷ 10` of **4003**, or 4001 if 4003 is missing |

### 4.3 Purity %

| Trade ID | Purity | Note |
|---|---|---|
| 1001 | 100 | 24K |
| 1002 | 92 | |
| 1003 | 76 | |
| 1008 | 58.5 | 14K |
| 1009 | 95.8 | 23K |
| 5001 | 95 | Platinum PT950, valued on its own 5001 rate |
| 4003, 4004 | 81 | Silver |
| 4005 | 92.5 | Silver |
| 6005 | 100 | Silver |
| Diamond metal | 76 | Fixed |

How it's looked up:
- **Gold / Platinum / Diamond:** `PURCHASE_PURITY` is checked by StyleID, then parent trade ID, then trade ID. If nothing matches, diamond gets 76.
- **Silver:** `SILVER_PURITY` is checked by trade ID, then parent trade ID.
- **Safety net for gold:** if purity is still 0, it is calculated as `rate ÷ base rate × 100`.

### 4.4 Wastage % (`get_wastage`)

```
Does ItemWiseLabour have slabs for this supplier + item + variety?
 ├─ yes → use the rate of the slab where FromWeight ≤ NetWt ≤ ToWeight
 │        (0 if no slab matches)
 └─ no  → Is Location a code? (1 character, or contains - / +)
           ├─ yes → LOCATION_DECODE of the first letter
           │        ("+" location: add up the decode of every part)
           │        A=2 C=3 E=4 G=5 I=6 K=7 M=8 O=9 Q=10 S=11 U=12 W=13 Y=14 B=15 D=16
           └─ no  → highest wastage for item + variety, else 0

Silver only: if the label's PurWastPer is set, it replaces the value above.
```

---

## 5. Formulas by row type

`wt` = NetWt in grams. `rate` and `base` are per-gram values from section 4.

### Margin by metal at a glance

| Metal | Trade IDs | Sale rate | Base rate | Purity % | Wastage goes into | Purchase other charge |
|---|---|---|---|---|---|---|
| **Gold** | 1001, 1002, 1003, 1008, 1009 | gold ID `PurRate` | 1001 `PurRate` | 100 / 92 / 76 / 58.5 / 95.8 | purchase labour | same as the sale other charge |
| **Platinum** | 5001 | 5001 `PurRate` | 5001 `PurRate` | 95 | purchase labour | same as the sale other charge |
| **Silver** | 4003, 4004, 4005, 6005 | silver ID `SalesRate` | 4003 `PurRate` | 81 / 81 / 92.5 / 100 | purchase metal | Location decode (6.1) |
| **Diamond metal** | 1006, StyleID 1006 | 1006 `PurRate` | 1001 `PurRate` | 76 | — (LC chart, 6.2) | Location decode (6.1) |
| **Diamond stone** | 1006, other StyleID | — | — | — | — | — |
| **Other** | anything else | 0 | 0 | 0 | — | 0 |

```
Every metal:   Margin = Sales − Purchase        Margin % = Margin ÷ Purchase × 100
```

### 5.1 Gold and platinum

Platinum uses exactly the same formula. Its rate and base rate are both the 5001 rate, and purity is 95 (PT950).

```
Labour (sale)   = rate × wt × LabourPer / 100          (if 0 → LabourAmount)
Other (sale)    = othersalevalue
Sales           = round( rate × wt + Labour + Other − Discount )

Purchase metal  = wt × purity  × base / 100
Purchase labour = wt × wastage × base / 100
Purchase other  = othersalevalue                       (same as sale, so it cancels out)
Purchase        = metal + labour + other
```

### 5.2 Silver

```
Labour (sale)   = LabourAmount
Other (sale)    = OtherCharge
Sales           = round( rate × wt + Labour + Other − Discount )

Purchase metal  = wt × (purity + wastage) × base / 100   ← wastage is counted here only
Purchase labour = PurLabourAmount                        (0 if empty)
Purchase other  = location_other_charge(Location)        (see 6.1)
Purchase        = metal + labour + other
```

### 5.3 Diamond metal

```
Labour (sale)   = rate × wt × LabourPer / 100          (if 0 → LabourAmount)
Other (sale)    = OtherCharge
Sales           = round( rate × wt + Labour + Other − Discount )

Purchase metal  = wt × 76 × base / 100
Purchase labour = diamond_purchase_labour(Location)      (see 6.2)
Purchase other  = location_other_charge(Location)        (see 6.1)
Purchase        = metal + labour + other
```

### 5.4 Diamond stone

```
Sales    = MetalAmt − Discount
Purchase = diamond_purchase_amount(row)                  (see 6.3)
Labour, purity, rate and other charges are all 0.
```

### 5.5 Other (any trade ID not listed in section 3)

```
The label, branch, item, variety, supplier, weights and pieces are shown as usual.
Rate, base rate, purity, wastage, labour, other charge, discount,
Sales, Purchase, Margin and Margin % are all 0.
```

### 5.6 Margin (all types)

```
Margin   = Sales − Purchase
Margin % = Margin ÷ Purchase × 100      (markup on cost, 0 if Purchase = 0)
```

---

## 6. Helper decodes

### 6.1 Purchase other charge: `location_other_charge`

The Location letters are a code for digits, and the digits are **joined, not added**:

`A=8  B=9  C=0  D=1  E=2  F=3  G=4  H=5  I=6  J=7`

| Location format | Code used | Example |
|---|---|---|
| Has `-` and `/` | Part after `-` in each `/` piece. Each piece is decoded, then the numbers are added | `X-AB/Y-DC` → 89 + 10 = **99** |
| Has `-` only | Part after `-` | `X-AB` → **89** |
| Has `/` only | 2nd piece | `X/AB` → **89** |
| Letters only, 2 or more | Whole Location | `DCA` → **108** |
| No code / no letter matches | 70% of the sale other charge | `A` with sale 1000 → **700** |

This matches `cron/gold_margin_report_new.py` and `cron/silver_margin_report_new.py`.

### 6.2 Diamond purchase labour: `diamond_purchase_labour`

| Location | Code(s) used |
|---|---|
| Contains `+` | every part |
| 2 letters and piece is `DPPANDENT` | 1st letter |
| 2 letters and piece is `DPTOPS` | 2nd letter |
| Otherwise | 1st letter |

| Weight | Charge per code |
|---|---|
| ≤ 2 g | Fixed amount from `LC_CHART_PER_FIX` (V=1300, Y=1200, X=1500, Z=2000, W=1000, F=500, XX=1500, K=550, P=500) |
| > 2 g | `LC_CHART_PER_GRAM` × weight (T=400, S=450, B=500, A=550, D=600, E=650, C=700, G=750, H=800, J=850, R=900, I=950, L=1000, O=1100, N=1200, M=1350, Q=1400, P=1500) |

### 6.3 Diamond / stone purchase value: `diamond_purchase_amount`

```
SizeID is empty / 0 / 1 / 10 / 11?
 ├─ yes → StyleID in DIAMOND_STYLE_IDS → CostAmount
 │        colour stone (EffectToTradOtChrg = 3001) → CostAmount × 0.7
 │        other stone → CostAmount
 └─ no  → size → colour + clarity (DIAMOND_SIZE_MAP_MASTER)
          style → shape (SHAPE_MASTER)
          (if either is missing → CostAmount)
          weight per stone = NetWt ÷ Pcs
          Find a Diamond_Purchase_Rate row where min ≤ weight per stone ≤ max,
          trying these matches in order:
             1. supplier + clarity + colour + shape
             2. clarity + colour + shape   (highest rate)
             3. clarity + colour           (highest rate)
             4. any                        (highest rate)
          found & rate > 0 → rate × NetWt
          not found        → MetalAmt × 0.9 if NetWt ≥ 0.3, else 0
```

---

## 7. Worked examples

### Gold: 10 g, trade 1002 (92%)

Inputs: 1002 PurRate 92,000 per 10 g → rate 9,200/g · 1001 PurRate 100,000 per 10 g → base 10,000/g ·
LabourPer 12 · wastage 3 · othersalevalue 500 · discount 200

| | Calculation | Amount |
|---|---|---|
| Metal (sale) | 9,200 × 10 | 92,000 |
| Labour (sale) | 92,000 × 12% | 11,040 |
| Other | | 500 |
| Discount | | −200 |
| **Sales** | | **103,340** |
| Purchase metal | 10 × 92 × 10,000 / 100 | 92,000 |
| Purchase labour | 10 × 3 × 10,000 / 100 | 3,000 |
| Purchase other | | 500 |
| **Purchase** | | **95,500** |
| **Margin** | 103,340 − 95,500 | **7,840** |
| **Margin %** | 7,840 ÷ 95,500 × 100 | **8.21%** |

### Platinum: 10 g, trade 5001 (95%)

Inputs: 5001 PurRate 60,000 per 10 g → rate and base 6,000/g · LabourPer 12 · wastage 3 ·
othersalevalue 500 · discount 200

| | Calculation | Amount |
|---|---|---|
| Metal (sale) | 6,000 × 10 | 60,000 |
| Labour (sale) | 60,000 × 12% | 7,200 |
| Other | | 500 |
| Discount | | −200 |
| **Sales** | | **67,500** |
| Purchase metal | 10 × 95 × 6,000 / 100 | 57,000 |
| Purchase labour | 10 × 3 × 6,000 / 100 | 1,800 |
| Purchase other | | 500 |
| **Purchase** | | **59,300** |
| **Margin** | 67,500 − 59,300 | **8,200** |
| **Margin %** | 8,200 ÷ 59,300 × 100 | **13.83%** |

### Silver: 100 g, trade 4005 (92.5%), Location `X-AB`

Inputs: rate 120/g · base 100/g · wastage 5 · LabourAmount 1,500 · OtherCharge 300 · no discount ·
PurLabourAmount empty

| | Calculation | Amount |
|---|---|---|
| **Sales** | 120 × 100 + 1,500 + 300 | **13,800** |
| Purchase metal | 100 × (92.5 + 5) × 100 / 100 | 9,750 |
| Purchase labour | PurLabourAmount | 0 |
| Purchase other | `AB` → 89 | 89 |
| **Purchase** | | **9,839** |
| **Margin** | | **3,961** |
| **Margin %** | | **40.26%** |

### Diamond: one piece = 1 metal row + 1 stone row

**Metal row** — 5 g, StyleID 1006. Inputs: 1006 rate 7,500/g · base (1001) 10,000/g · LabourPer 15 ·
OtherCharge 0 · no discount · Location `S` (weight > 2 g, so the per-gram chart is used: S = 450)

| | Calculation | Amount |
|---|---|---|
| **Sales** | 7,500 × 5 + 37,500 × 15% | **43,125** |
| Purchase metal | 5 × 76 × 10,000 / 100 | 38,000 |
| Purchase labour | 450 × 5 | 2,250 |
| Purchase other | single letter, no code → 70% of 0 | 0 |
| **Purchase** | | **40,250** |
| **Margin** | | **2,875 (7.14%)** |

**Stone row** — 0.5 ct, 10 pcs, size `2VVS-VS-FG` (FG, VVS/VS), round. MetalAmt (sale value) 40,000.
Weight per stone 0.05 ct falls in a Diamond_Purchase_Rate row of 50,000 per ct.

| | Calculation | Amount |
|---|---|---|
| **Sales** | MetalAmt − discount | **40,000** |
| **Purchase** | 50,000 × 0.5 | **25,000** |
| **Margin** | | **15,000 (60%)** |

**Whole piece** — add up first, then divide:
Sales 83,125 − Purchase 65,250 = Margin **17,875**, Margin % = 17,875 ÷ 65,250 × 100 = **27.39%**.
(Averaging the two row percentages would wrongly give 33.57%.)

---

## 8. Output fields (`stock_margin`)

| Field | Meaning |
|---|---|
| `label_no` | Label number, spaces around `/` removed |
| `branch_id`, `item_mst_id`, `item_trad_mst_id`, `variety_mst_id`, `supplier_code`, `supplier_name`, `style_id` | Master names (looked up from the IDs) |
| `gross_wt`, `net_wt`, `pcs` | Weights and pieces |
| `metal_rate` | Sale rate per gram |
| `base_rate` | Purchase base rate per gram |
| `gold_amount` | `rate × net_wt` (0 for stone rows) |
| `labour_amount`, `other_charge` | Sale labour and other charge |
| `sales_amount` | Sales |
| `purchase_purity` | Purity used (for silver it includes wastage; diamond metal shows 76) |
| `pur_wastage` | Wastage % used |
| `purchase_rate` | Purchase metal value (or stone purchase value) |
| `purchase_labour` | Purchase labour |
| `purchase_amount` | Purchase total |
| `margin`, `margin_percentage` | Margin and markup % |

---

## 9. Change log

**2026-10-26**
- Silver: wastage is no longer charged twice. It is in purchase purity only, and purchase labour is
  `PurLabourAmount` or 0.
- Gold is now trade IDs 1001, 1002, 1003, 1008 and 1009 only. Any other trade ID is still shown in the
  report, but its sale, purchase and margin are all 0.
- Fixed purities added: 1001 = 100, 1008 = 58.5, 1009 = 95.8. 1009 added to the rate query.
- Gold purity has a safety net (`rate ÷ base × 100`) instead of falling to 0.
- Gold sales now subtract the discount, the same as silver and diamond.
- The purchase other charge decode now joins digits (`AB` = 89) instead of adding them (17), matching
  the gold and silver cron reports.
- Platinum (5001) is calculated like gold, using the 5001 rate as both the sale rate and the base rate,
  with purity 95 (PT950).
- Platinum purity set to 95 (PT950).
- Documented margin logic for each metal, with worked examples for gold, platinum, silver and diamond.
- Removed a branch that could never run (`if diamond_element` inside the non-stone branch).

---

## 10. Known points / open items

- **Margin % is markup on cost** (`÷ Purchase`). For margin on sale price, use `÷ Sales`.
- **Diamond metal other charge** is decoded from Location here, but `cron/diamond_margin_report_new.py`
  always uses 0.
- **Gold sale value uses `PurRate`**, while silver uses `SalesRate`.
- **Margin is per row, not per label.** Group by `label_no` for a margin per piece.
- **The sync replaces the whole table** every time, so there is no history.
