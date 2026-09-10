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
def get_voucher_details(branch=None, from_date=None,  to_date=None,  metal=None, voucher_no=None):

    con = connect()
    cursor = con.cursor()
    conditions = [
        "sp.VouType = 'PUR'"
    ]

    values = []


    # ---------------------------------------------------------
    # VOUCHER NO
    # ---------------------------------------------------------

    if voucher_no:
        conditions.append("""
            (sm.VouNo = ? OR sm.PVouNo = ?)
        """)

        values.extend([
            voucher_no,
            voucher_no
        ])


    # ---------------------------------------------------------
    # BRANCH
    # ---------------------------------------------------------

    if branch and branch != "-1":
        conditions.append("""
            sm.BranchID = ?
        """)

        values.append(branch)


    # ---------------------------------------------------------
    # FROM DATE
    # ---------------------------------------------------------

    if from_date:
        conditions.append("""
            sm.VouDate >= ?
        """)

        values.append(from_date)


    # ---------------------------------------------------------
    # TO DATE
    # ---------------------------------------------------------

    if to_date:
        conditions.append("""
            sm.VouDate <= ?
        """)

        values.append(to_date)


    # ---------------------------------------------------------
    # METAL
    # ---------------------------------------------------------

    if False and metal:
        conditions.append("""
            sp.Metal = ?
        """)

        values.append(metal)


    # ---------------------------------------------------------
    # BUILD QUERY
    # ---------------------------------------------------------

    qry = f"""
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
            {" AND ".join(conditions)}
    """




    cursor.execute(qry, tuple(values))

    rows = cursor.fetchall()

    columns = [
        column[0]
        for column in cursor.description
    ]


    # ---------------------------------------------------------
    # GET EXISTING OLD GOLD DATA
    # ---------------------------------------------------------

    sptranids = [
        row[0]
        for row in rows
        if row[0]
    ]

    old_gold_records = {}

    if sptranids:

        existing_records = frappe.get_all(
            "Old Gold Purchase",
            filters={
                "sptranid": ["in", sptranids]
            },
            fields=[
                "sptranid",
                "melting_weight",
                "melting_purity",
                "fine_wt_after_melting",
                "difference__wt",
                "difference_purity",
                "difference_fine_wt",
                "remark"
            ]
        )

        old_gold_records = {
            record.sptranid: record
            for record in existing_records
        }


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
            data["VouNo"] = data["PVouNo"]

        data["sales_vou_no"] = (
            sales_voucher or ""
        ).replace(" ", "")


        # -----------------------------------------------------
        # DISPLAY VOUCHER
        # -----------------------------------------------------

        data["VouNo"] = (data["VouNo"] or "").replace(" ", "")


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
        # -----------------------------------------------------
        # GET SAVED OLD GOLD DATA
        # -----------------------------------------------------

        old_gold = frappe.db.get_value(
            "Old Gold Purchase",
            {
                "sptranid": data["sptranid"]
            },
            [
                "melting_weight",
                "melting_purity",
                "fine_wt_after_melting",
                "difference__wt",
                "difference_purity",
                "difference_fine_wt",
                "remark"
            ],
            as_dict=True
        )


        # -----------------------------------------------------
        # ADD SAVED VALUES TO CURRENT ITEM
        # -----------------------------------------------------

        if old_gold:

            data["melting_weight"] = (
                old_gold.melting_weight
                if old_gold.melting_weight is not None
                else ""
            )

            data["melting_purity"] = (
                old_gold.melting_purity
                if old_gold.melting_purity is not None
                else ""
            )

            data["after_fine_weight"] = (
                old_gold.fine_wt_after_melting
                if old_gold.fine_wt_after_melting is not None
                else ""
            )

            data["fine_wt_after_melting"] = (
                old_gold.fine_wt_after_melting
                if old_gold.fine_wt_after_melting is not None
                else ""
            )

            data["difference_weight"] = (
                old_gold.difference__wt
                if old_gold.difference__wt is not None
                else ""
            )

            data["difference__wt"] = (
                old_gold.difference__wt
                if old_gold.difference__wt is not None
                else ""
            )

            data["differenct_in_purity"] = (
                old_gold.difference_purity
                if old_gold.difference_purity is not None
                else ""
            )

            data["difference_purity"] = (
                old_gold.difference_purity
                if old_gold.difference_purity is not None
                else ""
            )

            data["melting_fine_difference"] = (
                old_gold.difference_fine_wt
                if old_gold.difference_fine_wt is not None
                else ""
            )

            data["difference_fine_wt"] = (
                old_gold.difference_fine_wt
                if old_gold.difference_fine_wt is not None
                else ""
            )

            data["remark"] = (
                old_gold.remark
                if old_gold.remark is not None
                else ""
            )

        else:

            data["melting_weight"] = ""
            data["melting_purity"] = ""
            data["after_fine_weight"] = ""
            data["fine_wt_after_melting"] = ""
            data["difference_weight"] = ""
            data["difference__wt"] = ""
            data["differenct_in_purity"] = ""
            data["difference_purity"] = ""
            data["melting_fine_difference"] = ""
            data["difference_fine_wt"] = ""
            data["remark"] = ""


        # -----------------------------------------------------
        # APPEND CURRENT SQL ROW
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

@frappe.whitelist()
def get_branches():

    branches = frappe.get_all(
        "Ornate_Branch_Master",
         filters={
            "name": ["in", ["6", "7", "8"]]
        },
        fields=[
            "name",
            "branch_name"
        ],
        order_by="name asc"
    )

    return branches    
