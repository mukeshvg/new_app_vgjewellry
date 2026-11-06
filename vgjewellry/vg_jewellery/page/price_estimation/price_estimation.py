import frappe
import os
import re
import time

import pyodbc

ITEM_QRY = "SET NOCOUNT ON; SELECT ItemMstID, ItemName FROM dbo.ItemMst WHERE ItemMstID > 0"

DIAMONDSTYLE_QRY = "SET NOCOUNT ON; SELECT DiamondStyleMstID, StyleName, EffectToTradOtChrg FROM dbo.DiamondStyleMst WHERE DiamondStyleMstID > 0"

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

@frappe.whitelist()
def search_items(search_text):

    if not search_text or len(search_text) < 1:
        return []

    qry= f"""
        select LabelNo FROM dbo.LabelBalance lb WHERE  REPLACE(lb.LabelNo, ' ', '') like '{search_text}%'
    """
    con = connect()
    cursor = con.cursor()
    cursor.execute(qry)
    label_rows = cursor.fetchall()
    return [
        {
            "label_no": row[0],
            "display_label": row[0].replace(" ", "") if row[0] else ""
        }
        for row in label_rows
    ]


@frappe.whitelist()
def get_label_details(label_no):

    if not label_no:
        return []


    qry = """
        select Top(1) *  from dbo.LabelTransaction lb  where lb.LabelNo =?  order by VouDate desc,  VouTranID desc
    """

    con = connect()
    cursor = con.cursor()
    
    items = fetch_map(cursor, ITEM_QRY)

    cursor.execute(DIAMONDSTYLE_QRY)
    diamond_style_rows = cursor.fetchall()
    diamond_style = {r[0]: clean(r[1]) for r in diamond_style_rows}

    cursor.execute(METAL_RATE_QRY)
    metal_rate = {}
    silver_sale_rate = {}
    for row in cursor.fetchall():
        metal_rate[row[0]] = row[1]/10


    cursor.execute(qry, (label_no,))

    columns = [column[0] for column in cursor.description]

    rows = cursor.fetchall()

    result = []

    for row in rows:
        data = dict(zip(columns, row))
        data["DLabelNo"]=data.get("LabelNo").replace(" ", "")
        data["Item"] = items.get(data.get("ItemMstID"))
        if data.get("ItemTradMstId")==6005:
            data["MetalRate"]="";
            data["MetalAmt"]=data.get("MRP")
        else:    
            data["MetalRate"]= metal_rate[data.get('ItemTradMstId')]
            data["MetalAmt"]= data["MetalRate"] * data.get("NetWt")
        if data.get("LabourOn").strip() == "BN":
            data["LabourRate"]= round(data.get("LabourPer") * data["MetalRate"] /100)
            data["LabourAmount"]=float(data["LabourRate"]) * float(data.get("NetWt"))


        qryl = """ select * from dbo.LabelTransactionStudded lts where lts.LabelTransID=?  and IsBase='N' """
        cursor.execute(qryl, (data.get("LabelTransID"),))
        columnsl = [column[0] for column in cursor.description]
        rowsl = cursor.fetchall()
        details=[]

        other_detail = 0
        for rowl in rowsl:
            data_l = dict(zip(columnsl, rowl))
            data_l["Style"] = diamond_style.get(data_l.get("StyleID"))
            details.append(data_l)
            if data_l.get("StyleID")== 20 or data_l.get("StyleID")== 29:
                omr= metal_rate[data_l.get('TradID')]
                oth= (float(omr) * float(data_l.get("NetWt")))
                other_detail += oth
                data_l["SalesRate"]=omr
                data_l["SalesAmount"]= oth

        data["details"]= details

        data["NetAmt"]=float(data["MetalAmt"])+float(data.get("DiamondAmt"))+float(data.get("StoneAmt"))+float(data.get("OtherCharge"))+float(data.get("LabourAmount"))+ float(other_detail)
        data["Igst"]=round(data.get("NetAmt")*0.015);
        data["Cgst"]=round(data.get("NetAmt")*0.015);
        data["Gst"]= data["Igst"]+data["Cgst"]
        data["Total"]=data.get("NetAmt")+data.get("Gst")

        result.append(data)
    
    cursor.close()
    con.close()
    
    return result


