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

value = os.getenv('sjodbc')
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
        it.VouDate,
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

    for r in rows:
        fine_wt = flt(r.get("FineWt") or 0)
        net_wt = flt(r.get("NetWt") or 0)
        oc = flt(r.get("OtherCharge") or 0)
        bill_amt = flt(r.get("BillAmt") or 0)
        hm= flt(r.get("HM") or 0)

        # totals
        total_fine_wt += fine_wt
        total_net_wt += net_wt
        total_oc += oc
        total_bill_amt += bill_amt
        total_hm += hm
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
        fields=["item_tran_id"]
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
        doc.acc_mst_id = d["accMstId"]
        doc.fine_wt = d["ketanFineWt"]
        doc.fine_wt_selected = d["selectedFineWt"]
        doc.net_wt = d["netWt"]
        doc.oc = d["oc"]
        doc.hm = d["hm"]

        doc.save(ignore_permissions=True)

    return "saved"    
