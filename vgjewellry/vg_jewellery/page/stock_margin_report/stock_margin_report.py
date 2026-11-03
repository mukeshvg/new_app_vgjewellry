# vgjewellry/vg_jewellery/page/stock_margin_report/stock_margin_report.py

import os
import re
import time

import frappe
import pyodbc

DOCTYPE = "stock_margin"


QRY = """
SET NOCOUNT ON;
SELECT  
    lts.BranchID, lts.CounterMstId, m.LabelNo, m.VarietyMstId, m.SupplierCode,
    m.LabourOn, m.LabourRate, m.LabourPer,m.LabourAmount, m.PurLabourAmount, m.DiamondPcs, m.SizeNameId,m.OtherCharge,
    m.ItemTradMstId AS ParentItemTradMstId,
    lts.ItemMstID, lts.ItemTradMstId, lts.GrossWt, lts.NetWt, lts.Pcs, lts.StyleID,lts.TradID,
    lts.SizeID, lts.CostAmount, lts.MetalAmt, lts.DiscountAmt, lts.PcsName,
    lts.SalesRate AS othersalerate, lts.SalesAmount AS othersalevalue,
    m.ImagePath1, m.PurWastPer, m.Location, m.PurWastOn
FROM (
    SELECT lt.LabelNo, lt.VarietyMstId, lt.LabelTransID, lt.SupplierCode, lt.ItemTradMstId,
           lt.LabourOn, lt.LabourRate, lt.LabourPer, lt.LabourAmount, lt.PurLabourAmount, lt.DiamondPcs,lt.SizeNameId,
           lt.PurWastPer, lt.Location, lt.PurWastOn, lt.ImagePath1,lt.OtherCharge,
           ROW_NUMBER() OVER (PARTITION BY lt.LabelNo ORDER BY lt.LabelTransID DESC) AS rn
    FROM dbo.LabelTransaction lt
    WHERE EXISTS (SELECT 1 FROM dbo.LabelBalance lb WHERE lb.LabelNo = lt.LabelNo)
) m
JOIN dbo.LabelTransactionStudded lts
    ON lts.LabelTransID = m.LabelTransID
WHERE m.rn = 1 and m.ItemTradMstId=1002 
OPTION (HASH JOIN);
"""

# ItemTradMstID -> (purchase purity %, metal name)
PURCHASE_PURITY = {
    1001: 100,    # 24K
    1002: 92,
    1003: 76,
    1008: 58.5,   # 14K
    1009: 95.8,   # 23K
    5001: 95,     # Platinum PT950, priced on its own 5001 rate
}
SILVER_PURITY = {
    4004: 81,
    4003: 81,
    4005: 92.5,
    6005: 100,
}
GOLD_TRADE_IDS = {1001, 1002, 1003, 1008, 1009}
PLATINUM_TRADE_ID = 5001
DIAMOND_TRADE_ID = 1006
DIAMOND_METAL_STYLE_ID = 1006
DIAMOND_ORNAMENT_ITEM_ID = 85
DIAMOND_STYLE_IDS = {3, 4, 5, 10, 12, 14, 27, 31, 49, 50, 51, 52, 73, 77, 78, 88, 92}
OTHER_CHARGE = {"A": 8, "B": 9, "C": 0, "D": 1, "E": 2, "F": 3, "G": 4, "H": 5, "I": 6, "J": 7}
LC_CHART_PER_GRAM = {
    "T": 400, "S": 450, "B": 500, "A": 550, "D": 600, "E": 650,
    "C": 700, "G": 750, "H": 800, "J": 850, "R": 900, "I": 950,
    "L": 1000, "O": 1100, "N": 1200, "M": 1350, "Q": 1400, "P": 1500,
}
LC_CHART_PER_FIX = {
    "V": 1300, "Y": 1200, "X": 1500, "Z": 2000, "W": 1000,
    "F": 500, "XX": 1500, "K": 550, "P": 500,
}
SHAPE_MASTER = {
    "RD(CT)": "Round",
    "RADIANT(CT)": "Radiant",
    "BR(CT)": "Tapper",
    "CD(CT)": "Cushion",
    "EMD(CT)": "Emerald",
    "HRD(CT)": "Heart",
    "MD(CT)": "Marquise",
    "OVAL.D(CT)": "Oval",
    "PD(CT)": "Princess",
    "PEAR.D(CT)": "Pear",
}
DIAMOND_SIZE_MAP_MASTER = {
    "1VVS-EF": {"color": "EF", "clarity": "VVS"},
    "2VVS-VS-FG": {"color": "FG", "clarity": "VVS/VS"},
    "3VS-SI-GHI": {"clarity": "VS/SI", "color": "GH HI"},
    "2VVS-VS-FG-2": {"clarity": "VVS/VS", "color": "FG"},
    "3VS-SI-GHI-2": {"clarity": "VS/SI", "color": "GH HI"},
    "1VVS-EF-2": {"color": "EF", "clarity": "VVS"},
}
BASE_RATE_TRADE_ID = 1001        # Base_Rate = today's 1001 rate

ITEM_QRY = "SET NOCOUNT ON; SELECT ItemMstID, ItemName FROM dbo.ItemMst WHERE ItemMstID > 0"
TRADE_QRY = "SET NOCOUNT ON; SELECT ItemTradMstID, TradShortName FROM dbo.ItemTradMst WHERE ItemTradMstID > 0"
VARIETY_QRY = "SET NOCOUNT ON; SELECT VarietyMstId, VarietyName FROM dbo.VarietyMst WHERE VarietyMstId > 0"
BRANCH_QRY = "SET NOCOUNT ON; SELECT BranchID, BranchName FROM dbo.BranchMaster WHERE BranchID > 0"
COUNTER_QRY = "SET NOCOUNT ON; SELECT cm.CounterMstID, cm.CounterNo FROM dbo.CounterMst cm"
SUPPLIER_QRY = "SET NOCOUNT ON; SELECT SupplierID, SupplierCode FROM dbo.SupplierCodeMaster WHERE SupplierID > 0"
SUPPLIER_NAME_QRY = "SET NOCOUNT ON; SELECT SupplierCode, SupplierName FROM dbo.SupplierCodeMaster WHERE SupplierID > 0"
DIAMONDSTYLE_QRY = "SET NOCOUNT ON; SELECT DiamondStyleMstID, StyleName, EffectToTradOtChrg FROM dbo.DiamondStyleMst WHERE DiamondStyleMstID > 0"
DIAMONDSIZE_QRY = "SET NOCOUNT ON; SELECT DiamondSizeMstID, SizeName FROM dbo.DiamondSizeMst WHERE DiamondSizeMstID > 0"
METAL_RATE_QRY = """
SET NOCOUNT ON;
SELECT r.ItemTradMstID, r.PurRate, r.SalesRate
FROM (
    SELECT ItemTradMstID, PurRate, SalesRate,
           ROW_NUMBER() OVER (PARTITION BY ItemTradMstID
                              ORDER BY TDate DESC, TodayRateMstID DESC) AS rn
    FROM dbo.TodayRateMst
    WHERE TDate <= CAST(GETDATE() AS date)
      AND ItemTradMstID IN (1003, 1002, 1006, 1008, 1009, 5001, 1001, 4001, 4003, 4004, 4005, 6005)
) r
WHERE r.rn = 1
"""
WASTAGE_QRY = """
SET NOCOUNT ON;
SELECT ItemWiseLabourID, ItemMstID, VarietyMstId, FromWeight, ToWeight, PurWastPer, PartyID
FROM dbo.ItemWiseLabour
WHERE ItemWiseLabourID > 0 AND ItemMstID > 0
"""

# Location code -> wastage %  (fill from your Location_decode)
LOCATION_DECODE = {"A": 2, "B": 15, "C": 3, "D": 16, "E": 4, "G": 5, "I": 6, "K": 7, "M": 8, "O": 9, "Q": 10, "S": 11, "U": 12, "W": 13, "Y": 14}

# SQL Server column -> Frappe fieldname
FIELD_MAP = {
    "LabelNo": "label_no",
    "BranchID": "branch_id",
    "CounterMstId": "counter_mst_id",
    "VarietyMstId": "variety_mst_id",
    "SupplierCode": "supplier_code",
    "SupplierName": "supplier_name",
    "LabourOn": "labour_on",
    "LabourRate": "labour_rate",
    "LabourPer": "labour_per",
    "SizeNameId": "size_name_id",
    "ItemMstID": "item_mst_id",
    "ItemTradMstId": "item_trad_mst_id",
    "TradID": "trad_id",
    "GrossWt": "gross_wt",
    "NetWt": "net_wt",
    "Pcs": "pcs",
    "StyleID": "style_id",
    "othersalerate": "other_sale_rate",
    "othersalevalue": "other_sale_value",
    "ImagePath1": "image_path",
    "PurWastPer": "pur_wast_per",
    "Location": "location",
    "PurWastOn": "pur_wast_on",
    "MetalRate": "metal_rate",
    "GoldAmount": "gold_amount",
    "LabourAmount": "labour_amount",
    "OtherCharge": "other_charge",
    "SalesAmount": "sales_amount",
    "PurchasePurity": "purchase_purity",
    "BaseRate": "base_rate",
    "PurchaseRate": "purchase_rate",
    "PurWastage": "pur_wastage",
    "PurchaseLabour": "purchase_labour",
    "StonePurchaseAmount": "stone_purchase_amount",
    "PurchaseAmount": "purchase_amount",
    "Margin": "margin",
    "MarginPercentage": "margin_percentage",
}


def connect():
    value = os.getenv("sjodbc")
    if not value:
        frappe.throw("Environment variable 'sjodbc' is not set")
    conn = pyodbc.connect(value, autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION, pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn


def fetch_map(cursor, qry):
    """Run a 2-column query (id, name) and return {id: name}."""
    cursor.execute(qry)
    return {r[0]: clean(r[1]) for r in cursor.fetchall()}

def clean(value):
    if isinstance(value, str):
        return value.strip()
    return value

def fetch_wastage(cursor):
    """Build wastage lookups from ItemWiseLabour."""
    cursor.execute(WASTAGE_QRY)
    slabs = {}          # (party, item, variety) -> [(from_wt, to_wt, rate), ...]
    max_variety = {}    # (item, variety) -> max rate

    for _id, item, variety, from_wt, to_wt, rate, party in cursor.fetchall():
        from_wt = float(from_wt or 0)
        to_wt = float(to_wt or 0)
        rate = float(rate or 0)
        slabs.setdefault((party, item, variety), []).append((from_wt, to_wt, rate))
        max_variety[(item, variety)] = max(max_variety.get((item, variety), rate), rate)

    return slabs, max_variety


def location_wastage(location):
    """Wastage from the Location code, or None if Location isn't a code."""
    location = (location or "").strip()
    if not (location and ("-" in location or "/" in location or "+" in location or len(location) == 1)):
        return None
    if "+" in location:
        return sum(float(LOCATION_DECODE.get(part.upper(), 0)) for part in location.split("+"))
    rate = LOCATION_DECODE.get(location[0].upper())
    return float(rate) if rate is not None else None


def get_wastage(wastage, party, item, variety, weight, location):
    """Slab for supplier+item+variety -> Location code -> max for item+variety -> None."""
    slabs, max_variety = wastage

    party_slabs = slabs.get((party, item, variety))
    if party_slabs is not None:
        for from_wt, to_wt, rate in party_slabs:
            if from_wt <= weight <= to_wt:
                return rate
        return 0

    loc_rate = location_wastage(location)
    if loc_rate is not None:
        return loc_rate

    return max_variety.get((item, variety))


def other_charge_digits(code):
    """Letters are digit codes joined in order: "AB" -> "89"."""
    return "".join(str(OTHER_CHARGE[character]) for character in code if character in OTHER_CHARGE)


def location_other_charge(location, sales_charge):
    """Same decode as the gold/silver margin cron reports."""
    location = (location or "").strip().upper()
    code = ""
    multi_codes = []
    if "-" in location:
        if "/" in location:
            # "X-AB/Y-DC" -> each part decoded separately, then added: 89 + 10
            for part in location.split("/"):
                pieces = part.split("-")
                multi_codes.append(pieces[1] if len(pieces) > 1 else pieces[0])
        else:
            code = location.split("-")[1]
    elif "/" in location:
        code = location.split("/")[1]
    elif location.isalpha() and len(location) > 1:
        code = location

    if multi_codes:
        return sum(int(other_charge_digits(c) or 0) for c in multi_codes)

    digits = other_charge_digits(code)
    if digits:
        return int(digits)
    sales_charge = float(sales_charge or 0)
    return round(sales_charge * 0.7) if sales_charge > 0 else 0


def diamond_purchase_labour(location, weight, pcs_name, metal_row=True):
    """Same rules as the Diamond Margin cron: "+" locations are charged on the
    diamond pieces, every other location on the metal piece."""
    location = (location or "").strip().upper()
    if not location:
        return 0

    if "+" in location:
        codes = [] if metal_row else location.split("+")
    elif not metal_row:
        codes = []
    elif "-" in location or "/" in location or len(location) == 1:
        codes = [location[0]]
    elif len(location) == 2 and pcs_name in ("DPPANDENT", "DPTOPS"):
        codes = [location[0] if pcs_name == "DPPANDENT" else location[1]]
    else:
        codes = []

    if weight <= 2:
        return sum(LC_CHART_PER_FIX.get(code.strip(), 0) for code in codes)
    return sum(LC_CHART_PER_GRAM.get(code.strip(), 0) * weight for code in codes)


def is_stone(row):
    """Stone element: simple size and not a diamond style (same rule as Diamond Margin)."""
    return (
        row.get("SizeID") in (None, 0, 1, 10, 11, "0", "1", "10", "11")
        and int(row.get("StyleID") or 0) not in DIAMOND_STYLE_IDS
    )


def diamond_purchase_amount(row, diamond_rates, diamond_sizes, diamond_styles):
    """Calculate the purchase value for one diamond or stone element row."""
    style_id = int(row.get("StyleID") or 0)
    size_id = row.get("SizeID")
    weight = float(row.get("NetWt") or 0)
    cost = float(row.get("CostAmount") or 0)

    if size_id in (None, 0, 1, 10, 11, "0", "1", "10", "11"):
        # Placeholder cost (1 or less): 70% of sale amount.
        if cost <= 1:
            return float(row.get("MetalAmt") or 0) * 0.7
        if style_id in DIAMOND_STYLE_IDS:
            return cost
        return cost * 0.7 if row.get("IsColorStone") else cost

    size_name = diamond_sizes.get(size_id)
    size_details = DIAMOND_SIZE_MAP_MASTER.get(size_name)
    shape_name = SHAPE_MASTER.get(diamond_styles.get(style_id))
    if not size_details:
        return cost

    color = size_details["color"]
    clarity = size_details["clarity"]
    pcs = float(row.get("Pcs") or row.get("DiamondPcs") or 0)
    one_diamond_weight = round(weight / pcs, 4) if pcs else 0
    weight_matches = lambda item: (
        float(item.get("min_carat_weight") or 0) <= one_diamond_weight
        <= float(item.get("max_carat_weight") or 0)
    )

    filters = (
        lambda item: shape_name
        and item.get("supplier") == row.get("SupplierCode")
        and item.get("clarity") == clarity
        and item.get("color") == color
        and item.get("shape") == shape_name,
        lambda item: shape_name
        and item.get("clarity") == clarity
        and item.get("color") == color
        and item.get("shape") == shape_name,
        lambda item: item.get("clarity") == clarity and item.get("color") == color,
        lambda item: True,
    )
    for index, matches in enumerate(filters):
        candidates = [
            item for item in diamond_rates
            if weight_matches(item) and matches(item)
        ]
        if candidates:
            selected = candidates if index == 0 else sorted(
                candidates, key=lambda item: float(item.get("rate") or 0), reverse=True
            )
            rate = float(selected[0].get("rate") or 0)
            if rate > 0:
                return rate * weight

    return float(row.get("MetalAmt") or 0) * 0.9 if weight >= 0.3 else 0


def fetch_from_sql_server():
    con = connect()
    try:
        cursor = con.cursor()
        items = fetch_map(cursor, ITEM_QRY)
        trade = fetch_map(cursor, TRADE_QRY)
        variety = fetch_map(cursor, VARIETY_QRY)
        branch = fetch_map(cursor, BRANCH_QRY)
        counter = fetch_map(cursor, COUNTER_QRY)
        supplier_code = fetch_map(cursor, SUPPLIER_QRY)
        supplier_name = fetch_map(cursor, SUPPLIER_NAME_QRY)
        cursor.execute(DIAMONDSTYLE_QRY)
        diamond_style_rows = cursor.fetchall()
        diamond_style = {r[0]: clean(r[1]) for r in diamond_style_rows}
        color_stone_ids = {
            r[0] for r in diamond_style_rows
            if len(r) > 2 and r[2] == 3001
        }
        cursor.execute(DIAMONDSIZE_QRY)
        diamond_sizes = {r[0]: clean(r[1]) for r in cursor.fetchall()}

        cursor.execute(METAL_RATE_QRY)
        metal_rate = {}
        silver_sale_rate = {}
        for row in cursor.fetchall():
            metal_rate[row[0]] = row[1]
            silver_sale_rate[row[0]] = row[2]
        base_rate = float(metal_rate.get(BASE_RATE_TRADE_ID) or 0) / 10.0

        wastage = fetch_wastage(cursor)
        diamond_rates = frappe.get_all(
            "Diamond_Purchase_Rate",
            fields=[
                "supplier", "clarity", "color", "shape",
                "min_carat_weight", "max_carat_weight", "rate",
            ],
        )

        cursor.execute(QRY)
        columns = [c[0] for c in cursor.description]
        data = []
        for r in cursor.fetchall():
            d = dict(zip(columns, r))
            trade_id = d.get("ItemTradMstId")
            parent_trade_id = d.get("ParentItemTradMstId") or trade_id
            style_id = d.get("StyleID")
            net_wt = float(d.get("NetWt") or 0)

            silver_row = parent_trade_id in SILVER_PURITY or trade_id in SILVER_PURITY
            diamond_product = parent_trade_id == DIAMOND_TRADE_ID or trade_id == DIAMOND_TRADE_ID
            diamond_element = diamond_product and style_id != DIAMOND_METAL_STYLE_ID
            gold_row = (
                not silver_row and not diamond_product
                and (parent_trade_id in GOLD_TRADE_IDS or trade_id in GOLD_TRADE_IDS)
            )
            # Platinum is calculated like gold, but on the 5001 rate.
            platinum_row = (
                not silver_row and not diamond_product
                and PLATINUM_TRADE_ID in (parent_trade_id, trade_id)
            )
            # Rows that are not gold, platinum, silver or diamond are shown with everything 0.
            other_row = not (gold_row or platinum_row or silver_row or diamond_product)
            # Metal rate is taken only on the piece's TradID (0 / diamond / stone -> no rate).
            rate_id = d.get("TradID") or 0
            rate = (
                float(silver_sale_rate.get(rate_id) or 0) / 10.0
                if silver_row else
                float(metal_rate.get(rate_id) or 0) / 10.0
            )
            if silver_row and rate == 0 and rate_id in SILVER_PURITY:
                for fallback_id in (4001, 4003, 4005, 4004):
                    fallback_rate = float(silver_sale_rate.get(fallback_id) or 0)
                    if fallback_rate:
                        rate = fallback_rate / 10.0
                        break
            if silver_row:
                current_base_rate = float(metal_rate.get(4003) or metal_rate.get(4001) or 0) / 10.0
            elif platinum_row:
                current_base_rate = float(metal_rate.get(PLATINUM_TRADE_ID) or 0) / 10.0
            else:
                current_base_rate = base_rate
            purity = (
                SILVER_PURITY[trade_id]
                if silver_row and trade_id in SILVER_PURITY else
                SILVER_PURITY[parent_trade_id]
                if silver_row else
                PURCHASE_PURITY.get(style_id, PURCHASE_PURITY.get(parent_trade_id, PURCHASE_PURITY.get(trade_id, 76 if diamond_product else 0)))
            )
            # Unlisted gold purity: derive it from today's rate vs the 24K base rate
            # instead of 0, which would make the purchase metal cost 0.
            if not purity and (gold_row or platinum_row) and current_base_rate:
                purity = round(rate / current_base_rate * 100, 2)
            wastage_rate = get_wastage(
                wastage,
                d.get("SupplierCode"),
                d.get("ItemMstID"),
                d.get("VarietyMstId"),
                net_wt,
                d.get("Location"),
            )
            if silver_row and float(d.get("PurWastPer") or 0):
                wastage_rate = float(d["PurWastPer"])
            if wastage_rate is None:
                wastage_rate = 0
            wastage_rate = float(wastage_rate)

            d["IsColorStone"] = style_id in color_stone_ids
            other_charge_sale = float(d.get("OtherCharge") or 0) if (silver_row or diamond_product) else float(d.get("othersalevalue") or 0)
            other_charge = other_charge_sale
            discount = float(d.get("DiscountAmt") or 0)
            metal_amount = float(d.get("MetalAmt") or 0)
            stone_purchase_amt = 0

            if other_row:
                labour_amt = sales_amt = purchase_amt = 0
                purchase_rate = purchase_labour = 0
                purity = rate = current_base_rate = wastage_rate = 0
                other_charge_sale = discount = 0
            elif diamond_element:
                labour_amt = 0
                sales_amt = metal_amount - discount
                purchase_rate = diamond_purchase_amount(
                    d, diamond_rates, diamond_sizes, diamond_style
                )
                # Diamond Ornaments with no diamond cost: 90% of diamond sale amount.
                if purchase_rate == 0 and not is_stone(d) and int(d.get("ItemMstID") or 0) == DIAMOND_ORNAMENT_ITEM_ID:
                    purchase_rate = metal_amount * 0.9
                purchase_labour = diamond_purchase_labour(
                    d.get("Location"), net_wt, d.get("PcsName"), metal_row=False
                )
                purchase_amt = purchase_rate + purchase_labour
                if is_stone(d):
                    # Show stone cost in its own column, not as purchase rate.
                    stone_purchase_amt = purchase_rate
                    purchase_rate = 0
                    # Diamond Ornaments with no stone cost: 90% of stone sale amount.
                    if stone_purchase_amt == 0 and int(d.get("ItemMstID") or 0) == DIAMOND_ORNAMENT_ITEM_ID:
                        stone_purchase_amt = metal_amount * 0.9
                        purchase_amt = stone_purchase_amt + purchase_labour
                purity = 0
                rate = 0
                other_charge = 0
            else:
                labour_per = float(d.get("LabourPer") or 0)
                if silver_row:
                    labour_amt = float(d.get("LabourAmount") or 0)
                elif gold_row and net_wt == 0:
                    # No net weight on gold jewellery: no labour.
                    labour_amt = 0
                else:
                    labour_amt = (rate * net_wt * labour_per) / 100
                    if labour_amt == 0 and rate > 0:
                        labour_amt = float(d.get("LabourAmount") or 0)

                purchase_purity = purity + (wastage_rate if silver_row else 0)
                purchase_rate = round(net_wt * purchase_purity * current_base_rate / 100, 2)
                purity = purchase_purity
                if silver_row:
                    # Wastage is already included in purchase_purity above,
                    # so don't charge it again as labour.
                    purchase_labour = float(d.get("PurLabourAmount") or 0)
                elif diamond_product:
                    purchase_labour = diamond_purchase_labour(
                        d.get("Location"),
                        net_wt,
                        d.get("PcsName"),
                    )
                    # Diamond Ornaments with no purchase labour: 90% of labour amount.
                    if purchase_labour == 0 and int(d.get("ItemMstID") or 0) == DIAMOND_ORNAMENT_ITEM_ID:
                        purchase_labour = labour_amt * 0.9
                else:
                    purchase_labour = net_wt * wastage_rate * current_base_rate / 100

                # No sale other charge: no purchase other charge.
                # Diamond jewellery has no purchase other charge (as in Diamond Margin).
                purchase_other_charge = (
                    0 if not other_charge_sale or diamond_product else
                    location_other_charge(d.get("Location"), other_charge_sale)
                    if silver_row or diamond_product else other_charge
                )
                sales_amt = round(rate * net_wt + labour_amt + other_charge_sale - discount)
                purchase_amt = purchase_rate + purchase_labour + purchase_other_charge
                if diamond_product:
                    purity = 76

            margin = sales_amt - purchase_amt

            d["LabourAmount"] = round(labour_amt)
            d["OtherCharge"] = round(other_charge_sale if silver_row or diamond_product or other_row else float(d.get("OtherCharge") or 0))
            d["MetalRate"] = rate
            d["GoldAmount"] = round(rate * net_wt if not diamond_element else 0)
            d["PurchaseLabour"] = round(purchase_labour, 2)
            d["StonePurchaseAmount"] = round(stone_purchase_amt, 2)
            d["PurchaseAmount"] = round(purchase_amt, 2)
            d["Margin"] = round(margin, 2)
            d["MarginPercentage"] = round(margin / purchase_amt * 100, 2) if purchase_amt else 0

            # "MANG  /   139461" -> "MANG/139461"
            d["LabelNo"] = re.sub(r"\s*/\s*", "/", d.get("LabelNo") or "")    
            d["PurWastage"] = wastage_rate
            d["ItemMstID"] = items.get(d.get("ItemMstID"))
            d["ItemTradMstId"] = trade.get(d.get("ItemTradMstId"))
            d["VarietyMstId"] = variety.get(d.get("VarietyMstId"))
            d["SupplierCode"] = supplier_code.get(d.get("SupplierCode"))
            d["SupplierName"] = supplier_name.get(d.get("SupplierCode"))
            d["BranchID"] = branch.get(d.get("BranchID"))
            d["CounterMstId"] = counter.get(d.get("CounterMstId"), d.get("CounterMstId"))
            d["StyleID"] = diamond_style.get(d.get("StyleID")) or trade.get(d.get("StyleID"))
            d["SalesAmount"] = sales_amt
            d["PurchasePurity"] = purity
            d["BaseRate"] = current_base_rate
            d["PurchaseRate"] = purchase_rate
            d["DiscountAmt"] = discount

            data.append(d)
        return data
        #return [dict(zip(columns, r)) for r in cursor.fetchall()]
    finally:
        con.close()


def sync_stock_margin():
    """Fetch data from SQL Server and replace all rows in Stock Margin DocType."""
    start = time.time()
    data = fetch_from_sql_server()
    fetched_in = round(time.time() - start, 1)

    now = frappe.utils.now()
    user = frappe.session.user or "Administrator"

    fields = ["name", "creation", "modified", "owner", "modified_by", "docstatus"] + list(FIELD_MAP.values())

    values = [
        [idx, now, now, user, user, 0] + [clean(d.get(src)) for src in FIELD_MAP]
        for idx, d in enumerate(data, start=1)          # name = 1, 2, 3 ...
    ]

    frappe.db.delete(DOCTYPE)
    frappe.db.bulk_insert(DOCTYPE, fields, values, chunk_size=10000)
    frappe.db.commit()

    frappe.logger("stock_margin").info(
        f"Stock Margin sync: {len(values)} rows, fetch {fetched_in}s, total {round(time.time() - start, 1)}s"
    )
    return len(values)


@frappe.whitelist()
def start_sync():
    """Call from page/button: runs sync in background."""
    frappe.enqueue(
        "vgjewellry.vg_jewellery.page.stock_margin_report.stock_margin_report.sync_stock_margin",
        queue="long",
        timeout=3600,
        job_id="sync_stock_margin",
        deduplicate=True,
    )
    return "Sync started"


@frappe.whitelist()
def get_stock_margin():
    """Page reads from the DocType (fast)."""
    return frappe.get_all(
        DOCTYPE,
        fields=list(FIELD_MAP.values()),
        limit_page_length=0,
    )
