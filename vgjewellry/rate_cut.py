import frappe
import pyodbc
import os
import pymysql
from datetime import date
from decimal import Decimal
from frappe.utils.logger import get_logger
import re
from datetime import datetime, timedelta
import requests
from frappe.utils import today
from collections import defaultdict
import json
from frappe.utils import flt
from collections import defaultdict

value = os.getenv('sjodbc')
#value = os.getenv('hoodbc')
def connect():
    conn = pyodbc.connect(value,autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION,pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn

@frappe.whitelist(allow_guest=True)
def get_all_vendor_rate_cut():
    con = connect()
    cursor=con.cursor()
    qry= '''
    WITH CTE AS
(
    SELECT
        it.ItemTranID,
        it.VouNo,
        it.VouID,
        it.VouDate,
        it.TranID,
        it.ItemTradMstID,
        it.GrossWt,
        it.NetWt,
        (it.FineWt+it.WastageWeight) as FineWt,
        it.Purity,
        it.OtherCharge,
        it.SattleTradId,
        it.Narration as ItemName,
        va.Narration,
        va.IRMstID ,
        vam.AccMstID,
        vam.AccSubID,
        am.AccName,
        ts.Amount as HM,

        return_it.VouNo AS ReturnVouNo,
        return_ir.VouDate AS ReturnVouDate,
        return_ir.GrossWt AS ReturnGrossWt,
        return_ir.NetWt AS ReturnNetWt,
        return_ir.FineWt AS ReturnFineWt,
        return_ir.Narration AS ReturnNarration,



        ROW_NUMBER() OVER
        (
            PARTITION BY it.ItemTranID
            ORDER BY vam.AccMstID
        ) AS RN

    FROM dbo.ItemTransaction it

    INNER JOIN dbo.IRMst va
        ON it.VouNo = va.VouNo

    INNER JOIN dbo.VouActionMst vam
        ON it.VouID = vam.VId

    LEFT JOIN dbo.AccMaster am
        ON am.AccMstID = vam.AccMstID

    Left Join dbo.IRTranStudded as ts
       on it.TranID=ts.IRTranId  and    ts.StyleID = 63

    LEFT JOIN dbo.ItemTransaction return_it
        ON return_it.OpVouMstId = it.VouID
      -- AND return_it.OpVouTranId = it.TranID

    -- Get details of that voucher
    LEFT JOIN dbo.IRMst return_ir
        ON return_ir.VouNo = return_it.VouNo
       AND return_ir.YearID = 16


    WHERE it.VouNo LIKE 'HARM /%'
        AND it.YearID = 16
        AND it.OpVouTranId = 0
        AND it.OpVouType = ''
        AND vam.VouType = 'AAR'

        And va.YearID=16
)

SELECT *
FROM CTE
WHERE RN = 1
    '''
    values = ()
    cursor.execute(qry,(values))
    res = cursor.fetchall()
    data = []
    columnNames = [column[0] for column in cursor.description]

    grouped_data = defaultdict(list)

    for record in res:
        row = dict(zip(columnNames, record))
        acc_mst_id = str(row["AccMstID"])
        grouped_data[acc_mst_id].append(row)
    cursor.close();
    con.close();

    return dict(grouped_data)

@frappe.whitelist()
def save_selected_transactions(summary_id,vendor, acc_mst_id, rows):


    rows = json.loads(rows)



    # remove old draft selection
    frappe.db.delete(
        "Rate Cut Transaction",
        {
            "acc_mst_id": acc_mst_id,
            "is_completed": 0,
            "summary_id":summary_id
        }
    )

    total_fine_wt = 0
    total_net_wt = 0
    total_oc = 0
    total_bill_amt = 0
    total_hm = 0
    total_returnfinewt = 0

    for r in rows:
        fine_wt = flt(r.get("FineWt") or 0)
        net_wt = flt(r.get("NetWt") or 0)
        oc = flt(r.get("OtherCharge") or 0)
        bill_amt = flt(r.get("BillAmt") or 0)
        hm= flt(r.get("HM") or 0)
        returnfinewt= flt(r.get("ReturnFineWt") or 0)

        # totals
        total_fine_wt += fine_wt
        total_net_wt += net_wt
        total_oc += oc
        total_bill_amt += bill_amt
        total_hm += hm
        total_returnfinewt += returnfinewt
        doc = frappe.get_doc({
            "doctype": "Rate Cut Transaction",
            "vendor": vendor,
            "acc_mst_id": acc_mst_id,
            "item_tran_id": r.get("ItemTranID"),
            "vou_no": r.get("VouNo"),
            "fine_wt": r.get("FineWt"),
            "net_wt": r.get("NetWt"),
            "oc": r.get("OtherCharge"),
            "hm": r.get("HM"),
            "returnfinewt": r.get('ReturnFineWt'),
            "returngrosswt": r.get('ReturnGrossWt'),
            "returnnetwt": r.get('ReturnNetWt'),
            "returnvoudate": r.get('ReturnVouDate'),
            "returnnarration": r.get('ReturnNarration'),
            "returnvouno": r.get('ReturnVouNo'),
            "is_selected": 1,
            "is_completed": 0,
            "summary_id":summary_id
        })
        doc.insert()

    summary_doc = frappe.get_doc("Rate Cut Summary", summary_id)
    summary_doc.fine_wt_selected = total_fine_wt
    summary_doc.net_wt = total_net_wt
    summary_doc.oc = total_oc
    summary_doc.bill_amt = total_bill_amt
    summary_doc.hm = total_hm
    summary_doc.returnfinewt = total_returnfinewt

    summary_doc.save(ignore_permissions=True)

    frappe.db.commit()

    return "saved"

@frappe.whitelist()
def get_saved_transactions(acc_mst_id , summary_id):

    return frappe.get_all(
        "Rate Cut Transaction",
        filters={
            "acc_mst_id": acc_mst_id,
            "summary_id":summary_id,
            "is_completed": 0,
            "is_selected": 1
        },
        fields=["item_tran_id","fine_wt", "oc", "hm","returnfinewt"]

    )

@frappe.whitelist()
def save_rate_cut_summary(data):
    data = json.loads(data)

    for d in data:

        existing = frappe.db.exists(
            "Rate Cut Summary",
            {"acc_mst_id": d["accMstId"]}
        )

        if existing:

            doc = frappe.get_doc("Rate Cut Summary", existing)

        else:

            doc = frappe.new_doc("Rate Cut Summary")

        doc.vendor = d["vendor"]
        doc.ratecut_date = d["ratecut_date"]
        doc.acc_mst_id = d["accMstId"]
        doc.fine_wt = d["ketanFineWt"]
        doc.fine_wt_selected = d["selectedFineWt"]
        doc.net_wt = d["netWt"]
        doc.oc = d["oc"]
        doc.hm = d["hm"]

        doc.save(ignore_permissions=True)

    return "saved"   

@frappe.whitelist()
def get_arihant_rate():
    current_ts_ms = int(datetime.now().timestamp() * 1000)
    url = f"https://bcast.arihantspot.com:7768/VOTSBroadcastStreaming/Services/xml/GetLiveRateByTemplateID/arihant?_={current_ts_ms}"

    payload = {}
    headers = {}

    response = requests.request("GET", url, headers=headers, data=payload)
    dt = response.text
    #match = re.search(r"GOLD 999 WITH GST IMP-IND.*?(\d+)", response)
    #match = re.search(r"GOLD 999 WITH GST\s*-\s*(\d+)", dt)
    match = re.search(r"GOLD\s*9999\s*\(4NINE\)\s*WITH GST\s*-\s*(\d+)", dt)

    if match:
        arihant_gold_rate = int(match.group(1))
        arihant_gold_rate = round(arihant_gold_rate)
    else:
        arihant_gold_rate=0
    
    
        
    match2 = re.search(r"GOLD 995 WITH GST\s*-\s*(\d+)", dt)    
    if match2:
        arihant_gold_995rate = int(match2.group(1))
        arihant_gold_995rate = round(arihant_gold_995rate)
    else:
        arihant_gold_995rate=0
    return {
    "gold_999": arihant_gold_rate,
    "gold_995": arihant_gold_995rate,
    "dt":dt
    
	}    
      

@frappe.whitelist()
def update_ketan_finewt(summary_id, ketan_finewt):
    doc = frappe.get_doc("Rate Cut Summary", summary_id)
    doc.fine_wt = ketan_finewt
    doc.save()

@frappe.whitelist()
def save_single_rate_cut(row):

    row = json.loads(row)

    doc = frappe.get_doc(
        "Rate Cut Summary",
        row["name"]
    )

    doc.rate_999_with_gst = row.get("rate999WGst")
    doc.rate_999_without_gst = row.get("rate999WithoutGst")
    doc.bill_value_without_gst = row.get("billWithoutGst")
    doc.bill_value_with_gst = row.get("withGstValue")
    doc.bill_amt = row.get("billAmt")
    doc.diff = row.get("diff")

    doc.save(ignore_permissions=True)

    return "saved"


@frappe.whitelist()
def delete_rate_cut_summary(summary_id):

    transactions = frappe.get_all(
        "Rate Cut Transaction",
        filters={"summary_id": summary_id},
        pluck="name"
    )

    for txn in transactions:
        frappe.delete_doc(
            "Rate Cut Transaction",
            txn,
            force=1
        )

    frappe.delete_doc(
        "Rate Cut Summary",
        summary_id,
        force=1
    )

    frappe.db.commit()

    return "deleted"

@frappe.whitelist()
def update_rate_cut_row(summary_id, acc_mst_id,
                        rate999_wgst,
                        rate999_wogst,
                        bill_without_gst,
                        bill_with_gst):

    doc = frappe.get_doc("Rate Cut Summary", summary_id)

    doc.rate_999_with_gst = rate999_wgst
    doc.rate_999_without_gst = rate999_wogst
    doc.bill_value_without_gst = bill_without_gst
    doc.bill_value_with_gst = bill_with_gst

    doc.save(ignore_permissions=True)
    frappe.db.commit()

    return "ok"

@frappe.whitelist()
def update_bill_and_diff(summary_id, bill_amt, diff):

    doc = frappe.get_doc("Rate Cut Summary", summary_id)

    doc.bill_amt = flt(bill_amt)
    doc.diff = flt(diff)

    doc.save(ignore_permissions=True)
    frappe.db.commit()

    return "ok"



@frappe.whitelist()
def get_metal_currency_ledger():

    con = connect()
    cursor = con.cursor()

    bill_paid_after = 7
    reminder_before_days = 4

    days = bill_paid_after - reminder_before_days

    reminder_date = (
        datetime.today() - timedelta(days=days)
    ).date()

    start_date = "2024-04-01"
    #start_date = "2026-04-01"

    weightwise = defaultdict(
        lambda: defaultdict(
            lambda: {
                "ReceivableWt": 0,
                "PayableWt": 0,
                "ReceivableWtAll": 0,
                "PayableWtAll": 0
            }
        )
    )

    acc_array = set()

    # -------------------------
    # MetalTradWiseOs
    # -------------------------
    

    cursor.execute("""
        SELECT
            TradOsId,
            AccMstID,
            SettleTradingId,
            NetWt,
            SettleNetWt,
            IssueOrReceipt,
            VouDate
        FROM MetalTradWiseOs
        WHERE VouDate >= ?
    """, start_date)



    cols = [c[0] for c in cursor.description]

    for row in cursor.fetchall():

        r = dict(zip(cols, row))

        metal = r["SettleTradingId"]
        acc = r["AccMstID"]

        acc_array.add(acc)

        net_wt = float(r["NetWt"] or 0)

        vou_date = r["VouDate"]
        issue_or_receipt = r["IssueOrReceipt"]

        if issue_or_receipt == "I":

            weightwise[metal][acc]["ReceivableWtAll"] += net_wt

            if vou_date.date() <= reminder_date:
                weightwise[metal][acc]["ReceivableWt"] += net_wt

        elif issue_or_receipt == "R":

            weightwise[metal][acc]["PayableWtAll"] += net_wt

            if vou_date.date() <= reminder_date:
                weightwise[metal][acc]["PayableWt"] += net_wt

    # -------------------------
    # Net off weight balances
    # -------------------------

    for metal, metal_data in weightwise.items():

        for acc, d in metal_data.items():

            rec = d["ReceivableWt"]
            pay = d["PayableWt"]

            if rec > pay:
                d["ReceivableWt"] = round(rec - pay, 3)
                d["PayableWt"] = 0

            elif pay > rec:
                d["PayableWt"] = round(pay - rec, 3)
                d["ReceivableWt"] = 0

            else:
                d["ReceivableWt"] = 0
                d["PayableWt"] = 0

            rec_all = d["ReceivableWtAll"]
            pay_all = d["PayableWtAll"]

            if rec_all > pay_all:
                d["ReceivableWtAll"] = round(rec_all - pay_all, 3)
                d["PayableWtAll"] = 0

            elif pay_all > rec_all:
                d["PayableWtAll"] = round(pay_all - rec_all, 3)
                d["ReceivableWtAll"] = 0

    # -------------------------
    # ItemTrade Master
    # -------------------------

    cursor.execute("""
        SELECT ItemTradMstID, TradShortName
        FROM ItemTradMst
        WHERE ItemTradMstID > 0
    """)

    item_trade_mst = {
        row[0]: row[1]
        for row in cursor.fetchall()
    }

    # -------------------------
    # Ledger
    # -------------------------

    amount_ledger = defaultdict(float)
    amount_ledger_all = defaultdict(float)

    cursor.execute("""
        SELECT
            OpsitTransID,
            VouAmt,
            AccMstID,
            VouDate
        FROM LedgerTrans
        WHERE VouDate >= ?
    """, start_date)

    cols = [c[0] for c in cursor.description]

    all_acc_ids = set()

    for row in cursor.fetchall():

        r = dict(zip(cols, row))

        acc = r["AccMstID"]

        all_acc_ids.add(acc)
        acc_array.add(acc)

        amount = float(r["VouAmt"] or 0)

        amount_ledger_all[acc] += amount

        if r["VouDate"].date() <= reminder_date:
            amount_ledger[acc] += amount

    # -------------------------
    # Opening Balance
    # -------------------------

    opening_bal = {}

    if all_acc_ids:

        for ids in batch(all_acc_ids, 1000):

            placeholders = ",".join("?" for _ in ids)

            cursor.execute(f"""
                SELECT
                    AccMstID,
                    OpBal
                FROM AccBal
                WHERE AccMstID IN ({placeholders})
            """, ids)

            for acc_id, op_bal in cursor.fetchall():
                opening_bal[acc_id] = float(op_bal or 0)

    # -------------------------
    # Account Master
    # -------------------------
    acc_master = {}

    if acc_array:

        for ids in batch(acc_array, 1000):

            placeholders = ",".join("?" for _ in ids)

            cursor.execute(f"""
                SELECT
                    AccMstID,
                    AccName
                FROM AccMaster
                WHERE AccMstID IN ({placeholders})
                  AND AccCategory IN (16,19,5)
                  AND GrpId IN (33,42,43,44)
            """, ids)

            for acc_id, acc_name in cursor.fetchall():
                acc_master[acc_id] = acc_name

    # -------------------------
    # Build Result
    # -------------------------

    result = []

    for acc, amount in amount_ledger.items():

        if acc not in acc_master:
            continue

        amount += opening_bal.get(acc, 0)

        payable = amount if amount > 0 else 0
        receivable = -amount if amount < 0 else 0

        if payable == 0 and receivable == 0:
            continue

        amount_all = (
            amount_ledger_all[acc]
            + opening_bal.get(acc, 0)
        )

        payable_all = amount_all if amount_all > 0 else 0
        receivable_all = -amount_all if amount_all < 0 else 0

        result.append({
            "name": acc_master[acc],
            "metal": "",
            "receivable_wt": 0,
            "payable_wt": 0,
            "receivable_amt": round(receivable, 3),
            "payable_amt": round(payable, 3),
            "acc": acc,
            "m": -1,
            "receivable_wt_all": 0,
            "payable_wt_all": 0,
            "receivable_amt_all": round(receivable_all, 3),
            "payable_amt_all": round(payable_all, 3)
        })

    for metal, metal_data in weightwise.items():

        for acc, d in metal_data.items():

            if (
                d["ReceivableWt"] == 0 and
                d["PayableWt"] == 0
            ):
                continue

            result.append({
                "name": acc_master.get(acc, ""),
                "metal": item_trade_mst.get(metal, ""),
                "receivable_wt": d["ReceivableWt"],
                "payable_wt": d["PayableWt"],
                "receivable_amt": 0,
                "payable_amt": 0,
                "acc": acc,
                "m": metal,
                "receivable_wt_all": d["ReceivableWtAll"],
                "payable_wt_all": d["PayableWtAll"],
                "receivable_amt_all": 0,
                "payable_amt_all": 0
            })

    cursor.close()
    con.close()

    return result




@frappe.whitelist()
def get_metal_currency_ledger_details(acc_mst_id):

    con = connect()
    cursor = con.cursor()

    bill_paid_after = 7
    reminder_before_days = 4
    days = bill_paid_after - reminder_before_days

    date_of_reminder = (
        datetime.today() - timedelta(days=days)
    ).strftime("%Y-%m-%d")

    opening_date = "2026-04-01"

    # --------------------------------------------------
    # ItemTradMst
    # --------------------------------------------------

    cursor.execute("""
        SELECT ItemTradMstID, TradShortName
        FROM ItemTradMst
        WHERE ItemTradMstID > 0
    """)

    item_trade_mst = {
        row.ItemTradMstID: row.TradShortName
        for row in cursor.fetchall()
    }

    # --------------------------------------------------
    # Opening Metal Balance
    # --------------------------------------------------

    cursor.execute(f"""
        SELECT
            TradOsId,
            AccMstID,
            SettleTradingId,
            NetWt,
            SettleNetWt,
            IssueOrReceipt
        FROM MetalTradWiseOs
        WHERE VouDate < '{opening_date}'
          AND AccMstID = ?
    """, acc_mst_id)

    rows = cursor.fetchall()

    weightwise = {}

    for r in rows:

        metal = r.SettleTradingId

        if metal not in weightwise:
            weightwise[metal] = {
                "ReceivableWt": 0,
                "PayableWt": 0
            }

        if r.IssueOrReceipt == "I":
            weightwise[metal]["ReceivableWt"] += flt(r.NetWt)

        elif r.IssueOrReceipt == "R":
            weightwise[metal]["PayableWt"] += flt(r.NetWt)

    for metal in list(weightwise.keys()):

        rec = weightwise[metal]["ReceivableWt"]
        pay = weightwise[metal]["PayableWt"]

        if rec > pay:
            weightwise[metal]["ReceivableWt"] = round(rec - pay, 3)
            weightwise[metal]["PayableWt"] = 0

        elif pay > rec:
            weightwise[metal]["PayableWt"] = round(pay - rec, 3)
            weightwise[metal]["ReceivableWt"] = 0

        else:
            del weightwise[metal]

    return_array = []

    for metal, data in weightwise.items():

        return_array.append({
            "vno": "Opening",
            "vdate": "01-04-2026",
            "metal": item_trade_mst.get(metal, ""),
            "payable_wt": data["PayableWt"],
            "receivable_wt": data["ReceivableWt"],
            "payable_amt": 0,
            "receivable_amt": 0,
            "is_due": "yes",
            "v": opening_date
        })

    # --------------------------------------------------
    # Opening Account Balance
    # --------------------------------------------------

    cursor.execute("""
        SELECT OpBal
        FROM AccBal
        WHERE AccMstID = ?
    """, acc_mst_id)

    opening_bal = 0

    row = cursor.fetchone()

    if row:
        opening_bal = flt(row.OpBal)

    if opening_bal != 0:

        payable_amt = 0
        receivable_amt = 0

        if opening_bal < 0:
            receivable_amt = abs(opening_bal)
        else:
            payable_amt = opening_bal

        return_array.append({
            "vno": "Opening",
            "vdate": "01-04-2026",
            "metal": "",
            "payable_wt": 0,
            "receivable_wt": 0,
            "payable_amt": payable_amt,
            "receivable_amt": receivable_amt,
            "is_due": "yes",
            "v": opening_date
        })

    # --------------------------------------------------
    # Account Name
    # --------------------------------------------------

    cursor.execute("""
        SELECT AccName
        FROM AccMaster
        WHERE AccMstID = ?
    """, acc_mst_id)

    row = cursor.fetchone()

    acc_name = row.AccName if row else ""

    # --------------------------------------------------
    # Ledger Transactions
    # --------------------------------------------------

    amount_ledger = defaultdict(list)

    cursor.execute(f"""
        SELECT
            OpsitTransID,
            VouAmt,
            VouNo,
            VouDate
        FROM LedgerTrans
        WHERE VouDate >= '{opening_date}'
          AND AccMstID = ?
    """, acc_mst_id)

    ledger_rows = cursor.fetchall()

    for r in ledger_rows:

        vou_amt = flt(r.VouAmt)

        vou_date = r.VouDate.strftime("%Y-%m-%d")
        vou_date_display = r.VouDate.strftime("%d-%m-%Y")

        vno = "/".join(
            [x.strip() for x in str(r.VouNo).split("/")]
        )

        payable_amt = 0
        receivable_amt = 0

        if vou_amt < 0:
            receivable_amt = abs(vou_amt)

        elif vou_amt > 0:
            payable_amt = vou_amt

        is_due = (
            "yes"
            if vou_date <= date_of_reminder
            else "no"
        )

        amount_ledger[vou_date].append({
            "vno": vno,
            "vdate": vou_date_display,
            "metal": "",
            "payable_wt": 0,
            "receivable_wt": 0,
            "payable_amt": round(payable_amt, 2),
            "receivable_amt": round(receivable_amt, 2),
            "is_due": is_due,
            "v": vou_date
        })

    # --------------------------------------------------
    # Metal Transactions
    # --------------------------------------------------

    cursor.execute(f"""
        SELECT
            TradOsId,
            SettleTradingId,
            NetWt,
            IssueOrReceipt,
            VouNo,
            VouDate
        FROM MetalTradWiseOs
        WHERE VouDate >= '{opening_date}'
          AND VouDate <= '{date_of_reminder}'
          AND AccMstID = ?
    """, acc_mst_id)

    metal_rows = cursor.fetchall()

    for r in metal_rows:

        vou_date = r.VouDate.strftime("%Y-%m-%d")
        vou_date_display = r.VouDate.strftime("%d-%m-%Y")

        vno = "/".join(
            [x.strip() for x in str(r.VouNo).split("/")]
        )

        receivable_wt = 0
        payable_wt = 0

        if r.IssueOrReceipt == "I":
            receivable_wt = flt(r.NetWt)

        elif r.IssueOrReceipt == "R":
            payable_wt = flt(r.NetWt)

        is_due = (
            "yes"
            if vou_date <= date_of_reminder
            else "no"
        )

        amount_ledger[vou_date].append({
            "vno": vno,
            "vdate": vou_date_display,
            "metal": item_trade_mst.get(
                r.SettleTradingId, ""
            ),
            "payable_wt": payable_wt,
            "receivable_wt": receivable_wt,
            "payable_amt": 0,
            "receivable_amt": 0,
            "is_due": is_due,
            "v": vou_date
        })

    # --------------------------------------------------
    # Merge Sorted Data
    # --------------------------------------------------

    for dt in sorted(amount_ledger.keys()):
        return_array.extend(amount_ledger[dt])

    # --------------------------------------------------
    # Final Summary
    # --------------------------------------------------

    conclude = {}

    for row in return_array:

        metal = row["metal"]

        if metal not in conclude:
            conclude[metal] = {
                "r": 0,
                "p": 0,
                "ra": 0,
                "pa": 0
            }

        if metal == "":

            conclude[metal]["ra"] += round(
                row["receivable_amt"]
            )
            conclude[metal]["pa"] += round(
                row["payable_amt"]
            )

            if row["is_due"] == "yes":
                conclude[metal]["r"] += round(
                    row["receivable_amt"]
                )
                conclude[metal]["p"] += round(
                    row["payable_amt"]
                )

        else:

            conclude[metal]["ra"] += row["receivable_wt"]
            conclude[metal]["pa"] += row["payable_wt"]

            if row["is_due"] == "yes":
                conclude[metal]["r"] += row["receivable_wt"]
                conclude[metal]["p"] += row["payable_wt"]

    final_amt = []

    for metal, mv in conclude.items():

        transaction = ""
        transaction_all = ""

        fin = 0
        fin_all = 0

        label = "Amt" if metal == "" else "Wt"

        if mv["r"] > mv["p"]:
            fin = mv["r"] - mv["p"]
            fin = round(fin) if label == "Amt" else round(fin, 3)
            transaction = f"Rec {label}"

        elif mv["p"] > mv["r"]:
            fin = mv["p"] - mv["r"]
            fin = round(fin) if label == "Amt" else round(fin, 3)
            transaction = f"Pay {label}"

        if mv["ra"] > mv["pa"]:
            fin_all = mv["ra"] - mv["pa"]
            fin_all = round(fin_all) if label == "Amt" else round(fin_all, 3)
            transaction_all = f"Rec {label}"

        elif mv["pa"] > mv["ra"]:
            fin_all = mv["pa"] - mv["ra"]
            fin_all = round(fin_all) if label == "Amt" else round(fin_all, 3)
            transaction_all = f"Pay {label}"

        final_amt.append({
            "type": metal,
            "transaction": transaction,
            "val": fin,
            "transaction_all": transaction_all,
            "val_all": fin_all
        })

    # --------------------------------------------------
    # Settlement Logic
    # --------------------------------------------------

    metal_wise = defaultdict(list)

    for row in return_array:

        key = row["metal"] if row["metal"] else "amt"

        metal_wise[key].append(row)

    settled = {}

    for metal, rows in metal_wise.items():

        total_pay = 0
        total_rec = 0

        temp = []

        for row in rows:

            if metal == "amt":
                pay = int(row["payable_amt"])
                rec = int(row["receivable_amt"])
            else:
                pay = row["payable_wt"]
                rec = row["receivable_wt"]

            total_pay += pay
            total_rec += rec

            if total_pay == total_rec:

                for x in temp:
                    x["is_show"] = "no"

                total_pay = 0
                total_rec = 0

            else:

                row["is_show"] = "yes"
                temp.append(row)

        settled[metal] = temp

    fine_array = []

    for rows in settled.values():
        fine_array.extend(rows)

    fine_array = sorted(
        fine_array,
        key=lambda x: x["v"]
    )

    cursor.close()
    con.close()

    return {
        "data": fine_array,
        "name": acc_name,
        "final": final_amt
    }

def batch(iterable, size=1000):
    iterable = list(iterable)
    for i in range(0, len(iterable), size):
        yield iterable[i:i + size]    

@frappe.whitelist()
def process_selected_ledger(rows):
    rows = json.loads(rows)
    today = frappe.utils.today()

    for row in rows:

        existing = frappe.db.exists(
            "Rate Cut Summary",
            {
                "acc_mst_id": row["acc"]
            }
        )

        if existing:
            doc = frappe.get_doc("Rate Cut Summary", existing)
        else:
            doc = frappe.new_doc("Rate Cut Summary")

        doc.vendor = row["name"]
        doc.acc_mst_id = row["acc"]
        doc.ratecut_date = today

        # Save receivable amount as Fine Wt
        doc.fine_wt = row.get("payable_wt", 0)

        # Optional, if you have a Metal field in the DocType

        doc.save(ignore_permissions=True)

    frappe.db.commit()

    return "Saved"
