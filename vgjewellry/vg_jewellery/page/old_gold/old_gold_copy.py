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

value = os.getenv('sjodbc')
def connect():
    conn = pyodbc.connect(value,autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION,pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn


@frappe.whitelist()
def get_vouchers(metal, voucher_date):
    con = connect()
    cursor=con.cursor()
    qry =f"select  st.VouNo,st.VouType ,st.PVouNo   from dbo.SpMst st WHERE st.SPMstID  in( select s.SPMstID  from dbo.SPTran s where s.VouType ='PUR' and s.VouDate =?  and s.ItemMstID in (12,209,210,237,195) ) and st.BranchID =7"
    
    values = (voucher_date)
    cursor.execute(qry,(values))
    res1 = cursor.fetchall()
    voucher_list = {}
    for row in res1:
        vou_no = row[0]
        vou_type = row[1]
        p_vou_no = row[2]
        if vou_type == "SL" and p_vou_no:
            vou_no = p_vou_no
        if vou_no:
            voucher_list[vou_no] = vou_no.replace(" ", "")
    voucher_list = dict( sorted( voucher_list.items(), key=lambda x: x[1]))        
    cursor.close()
    con.close()
    return voucher_list



@frappe.whitelist()
def get_voucher_details(voucher_no, voucher_date):

    # ---------------------------------------------------------
    # 1. CHECK OLD GOLD PURCHASE FIRST
    # ---------------------------------------------------------

    clean_voucher_no = (voucher_no or "").replace(" ", "")

    existing_records = frappe.get_all(
        "Old Gold Purchase",
        filters={
            "vouno": clean_voucher_no,
            "voudate": datetime.strptime(
                voucher_date,
                "%Y-%m-%d"
            ).strftime("%Y-%m-%d")
        },
        fields=[
            "name",
            "sptranid",
            "vouno",
            "voudate",
            "net_wt",
            "metal_amt",
            "sales_vou_no",
            "rate_999",
            "rate_916",
            "purity",
            "fine_wt",
            "melting_weight",
            "melting_purity",
            "fine_wt_after_melting",
            "difference__wt",
            "difference_purity",
            "difference_fine_wt",
            "remark"
        ],
        order_by="sptranid asc"
    )

    if existing_records:

        result = []

        for row in existing_records:

            data = {
                "name": row.name,
                "sptranid": row.sptranid,
                "VouNo": row.vouno,
                "VouDate": (
                    row.voudate.strftime("%d-%m-%Y")
                    if row.voudate
                    else ""
                ),

                "item_name": "",
                "net_wt": row.net_wt or 0,
                "metal_amt": row.metal_amt or 0,

                "sales_vou_no":
                    row.sales_vou_no or "",

                "rate_999":
                    row.rate_999 or 0,

                "rate_916":
                    row.rate_916 or 0,

                "purity":
                    row.purity or 0,

                "fine_wt":
                    row.fine_wt or 0,

                "melting_weight":
                    row.melting_weight or 0,

                "melting_purity":
                    row.melting_purity or 0,

                "after_fine_weight":
                    row.fine_wt_after_melting or 0,

                "fine_wt_after_melting":
                    row.fine_wt_after_melting or 0,

                "difference_weight":
                    row.difference__wt or 0,

                "difference__wt":
                    row.difference__wt or 0,

                "difference_purity":
                    row.difference_purity or 0,

                "melting_fine_difference":
                    row.difference_fine_wt or 0,

                "difference_fine_wt":
                    row.difference_fine_wt or 0,

                "remark":
                    row.remark or ""
            }

            result.append(data)

        return result


    # ---------------------------------------------------------
    # 2. NO SAVED RECORD - GET DATA FROM SQL SERVER
    # ---------------------------------------------------------

    con = connect()
    cursor = con.cursor()

    qry = """
        SELECT
            sp.SpTranID AS sptranid,
            sm.VouNo,
            sm.PVouNo,
            im.ItemName AS item_name,
            sp.NetWt AS net_wt,
            sp.VouDate AS VouDate,
            sp.MetalAmt AS metal_amt
        FROM SpTran sp
        INNER JOIN SPMst sm
            ON sm.SPMstID = sp.SPMstID
        LEFT JOIN itemmst im
            ON im.itemmstid = sp.itemmstid
        WHERE
            (sm.VouNo = ? OR sm.PVouNo = ?)
            AND sm.VouDate = ?
            AND sp.VouType = 'PUR'
    """

    values = (
        voucher_no,
        voucher_no,
        voucher_date
    )

    cursor.execute(qry, values)

    columns = [
        column[0]
        for column in cursor.description
    ]

    rows = cursor.fetchall()

    result = []

    for row in rows:

        data = dict(zip(columns, row))

        # -----------------------------------------------------
        # GET 916 RATE
        # -----------------------------------------------------

        rate_qry = """
            SELECT trm.PurRate
            FROM dbo.TodayRateMst trm
            WHERE trm.TDate = ?
              AND trm.ItemTradMstID = ?
        """

        rate_values = (
            data["VouDate"],
            1002
        )

        cursor.execute(
            rate_qry,
            rate_values
        )

        rate_row = cursor.fetchone()

        if rate_row:
            data["rate_916"] = rate_row[0] / 10
        else:
            data["rate_916"] = 0


        # -----------------------------------------------------
        # 999 RATE
        # -----------------------------------------------------

        fitness_factor = Decimal(
            str(
                round(
                    916 / 999,
                    2
                )
            )
        )

        data["rate_999"] = round(
            data["rate_916"] /
            fitness_factor
        )


        # -----------------------------------------------------
        # PURITY
        # -----------------------------------------------------

        metal_amt = data["metal_amt"] or 0
        net_wt = data["net_wt"] or 0

        if net_wt and data["rate_999"]:

            data["purity"] = round(
                metal_amt /
                (
                    net_wt *
                    data["rate_999"]
                ) *
                100,
                2
            )

            data["fine_wt"] = round(
                metal_amt /
                data["rate_999"],
                2
            )

        else:

            data["purity"] = 0
            data["fine_wt"] = 0


        # -----------------------------------------------------
        # SALES VOUCHER
        # -----------------------------------------------------

        sales_voucher = ""

        if data["PVouNo"] != "":
            sales_voucher = data["VouNo"]

        data["sales_vou_no"] = (
            sales_voucher or ""
        ).replace(" ", "")


        # -----------------------------------------------------
        # DISPLAY VOUCHER
        # -----------------------------------------------------

        data["VouNo"] = (
            voucher_no or ""
        ).replace(" ", "")


        # -----------------------------------------------------
        # DATE
        # -----------------------------------------------------

        if data["VouDate"]:
            data["VouDate"] = (
                data["VouDate"]
                .strftime("%d-%m-%Y")
            )


        # -----------------------------------------------------
        # DEFAULT MELTING VALUES
        # -----------------------------------------------------

        """data["melting_weight"] = 0
        data["melting_purity"] = 0
        data["after_fine_weight"] = 0
        data["fine_wt_after_melting"] = 0
        data["difference_weight"] = 0
        data["difference__wt"] = 0
        data["difference_purity"] = 0
        data["melting_fine_difference"] = 0
        data["difference_fine_wt"] = 0
        data["remark"] = "" """


        result.append(data)


    cursor.close()
    con.close()

    return result

@frappe.whitelist()
def get_voucher_details1(voucher_no, voucher_date):
    con = connect()
    cursor = con.cursor()
    qry =""" SELECT sp.SpTranID as sptranid,sm.VouNo,sm.PVouNo, im.ItemName AS item_name, sp.NetWt AS net_wt,sp.VouDate AS VouDate, sp.MetalAmt AS metal_amt FROM SpTran sp INNER JOIN SPMst sm  ON sm.SPMstID = sp.SPMstID LEFT JOIN itemmst im  ON im.itemmstid = sp.itemmstid WHERE (sm.VouNo = ? OR sm.PVouNo = ?) AND sm.VouDate = ?  AND sp.VouType = 'PUR'"""


    values=(voucher_no,voucher_no,voucher_date)
    cursor.execute(qry,(values))
    columns = [column[0] for column in cursor.description]
    rows = cursor.fetchall()

    result = []

    for row in rows:
        data = dict(zip(columns, row))
        rate_qry= f"select trm.PurRate  from dbo.TodayRateMst trm WHERE trm.TDate =? and trm.ItemTradMstID =?"
        rate_values=(data["VouDate"],1002)
        cursor.execute(rate_qry,(rate_values))
        rate_row = cursor.fetchone()

        if rate_row:
            data["rate_916"] = rate_row[0]/10
        else:
            data["rate_916"] = 0
        fitness_factor = Decimal(round(916/999,2))
        data['rate_999']= round(data["rate_916"] / fitness_factor)
        metal_amt = data["metal_amt"]
        data['purity']= round(metal_amt/(data['net_wt']* data['rate_999']) *100,2)
        data['fine_wt']=round(metal_amt / data['rate_999'],2)
        sales_voucher=""
        if data["PVouNo"]!="":
            sales_voucher = data["VouNo"]
        data["sales_vou_no"]=sales_voucher.replace(" ", "") 
        data["VouNo"]=voucher_no.replace(" ", "")
        data["VouDate"] = data["VouDate"].strftime("%d-%m-%Y")
        result.append(data)

    cursor.close()
    con.close()

    return result


@frappe.whitelist()
def save_melting_data(
    sptranid,
    item_name=None,
    vouno=None,
    voudate=None,
    net_wt=None,
    metal_amt=None,
    sales_vou_no=None,
    rate_999=None,
    rate_916=None,
    purity=None,
    fine_wt=None,
    melting_weight=None,
    melting_purity=None,
    fine_wt_after_melting=None,
    difference__wt=None,
    difference_purity=None,
    difference_fine_wt=None,
    remark=None
):

    if not sptranid:
        frappe.throw("SpTranID is required")

    # ---------------------------------------------------------
    # FIND EXISTING RECORD
    # ---------------------------------------------------------
    doc_name = frappe.db.get_value(
        "Old Gold Purchase",
        {
            "sptranid": sptranid
        },
        "name"
    )

    # ---------------------------------------------------------
    # GET EXISTING OR CREATE NEW
    # ---------------------------------------------------------
    if doc_name:
        doc = frappe.get_doc(
            "Old Gold Purchase",
            doc_name
        )
    else:
        doc = frappe.new_doc(
            "Old Gold Purchase"
        )

    # ---------------------------------------------------------
    # SET DATA
    # ---------------------------------------------------------
    doc.sptranid = sptranid
    doc.vouno = vouno or ""
    if voudate:
        voudate = datetime.strptime(
            voudate,
            "%d-%m-%Y"
        ).strftime("%Y-%m-%d")

    doc.voudate = voudate
    doc.item_name = item_name

    doc.net_wt = net_wt or 0
    doc.metal_amt = metal_amt or 0

    doc.sales_vou_no = sales_vou_no or ""

    doc.rate_999 = rate_999 or 0
    doc.rate_916 = rate_916 or 0

    doc.purity = purity or 0
    doc.fine_wt = fine_wt or 0

    doc.melting_weight = melting_weight or 0
    doc.melting_purity = melting_purity or 0

    doc.fine_wt_after_melting = (
        fine_wt_after_melting or 0
    )

    doc.difference__wt = (
        difference__wt or 0
    )

    doc.difference_purity = (
        difference_purity or 0
    )

    doc.difference_fine_wt = (
        difference_fine_wt or 0
    )

    doc.remark = remark or ""

    # ---------------------------------------------------------
    # SAVE
    # ---------------------------------------------------------
    doc.save(
        ignore_permissions=True,
         ignore_version=True
    )

    frappe.db.commit()

    return {
        "status": "success",
        "name": doc.name,
        "sptranid": doc.sptranid
    }
