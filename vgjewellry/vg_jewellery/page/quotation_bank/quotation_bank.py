import frappe
import json
import pyodbc
import os
import pandas as pd


value = os.getenv('sjodbc')

def connect():
    conn = pyodbc.connect(value, autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION, pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn


@frappe.whitelist(allow_guest=True)
def get_ornate_data(
    from_date,
    to_date,
    diamond_wt=None,
    item_mst=None,
    item_trade_mst=None,
    table_name ="dbo.SPTran"
):

    con = connect()
    cursor = con.cursor()

    # Convert JSON strings from Postman
    if isinstance(diamond_wt, str):
        diamond_wt = frappe.parse_json(diamond_wt)

    if isinstance(item_mst, str):
        item_mst = frappe.parse_json(item_mst)

    if isinstance(item_trade_mst, str):
        item_trade_mst = frappe.parse_json(item_trade_mst)


    if table_name == "dbo.SPTran":
        conditions = """
        s.VouDate >= ?
    AND s.VouDate <= ?
    AND s.VouType='SL'
"""
        params = [
        from_date,
        to_date
    ]
    elif table_name == "dbo.LabelBalance":
        conditions = """
            s.LabelBalID >0
        """
        params =[]


    # Item filter first
    if item_mst:

        placeholders = ",".join(["?"] * len(item_mst))

        conditions += f"""
            AND s.ItemMstID IN ({placeholders})
        """

        params.extend(item_mst)



    # Item Trade filter second
    if item_trade_mst:

        placeholders = ",".join(["?"] * len(item_trade_mst))

        conditions += f"""
            AND s.ItemTradMstID IN ({placeholders})
        """

        params.extend(item_trade_mst)



    # Diamond filter LAST
    if diamond_wt:

        range_conditions = []

        diamond_params = []

        for wt in diamond_wt:

            min_wt, max_wt = (
                wt.replace(" ","")
                .split("-")
            )

            range_conditions.append(
                "(s.DiamondWt >= ? AND s.DiamondWt <= ?)"
            )

            diamond_params.extend([
                float(min_wt),
                float(max_wt)
            ])


        conditions += """
            AND (
        """

        conditions += " OR ".join(range_conditions)

        conditions += """
            )
        """


        params.extend(diamond_params)


    query = f"""

        SELECT

            s.NetWt,

            s.DiamondWt,


            s.Image1


        FROM {table_name} s WITH(NOLOCK)

        WHERE

        {conditions}

    """


    cursor.execute(
        query,
        params
    )


    rows = cursor.fetchall()



    columns = [
        col[0]
        for col in cursor.description
    ]


    result = [
        dict(zip(columns,row))
        for row in rows
    ]


    cursor.close()
    con.close()
    return result


@frappe.whitelist()
def get_current_stock_data(
    diamond_wt=None,
    item_mst=None,
    item_trade_mst=None
):

    from frappe.utils import cint

    con = connect()
    cursor = con.cursor()

    params = []
    conditions = []


    # Item Mst Filter
    if item_mst:

        placeholders = ",".join(
            ["?"] * len(item_mst)
        )

        conditions.append(
            f"s.ItemMstID IN ({placeholders})"
        )

        params.extend(item_mst)


    # Item Trade Mst Filter
    if item_trade_mst:

        placeholders = ",".join(
            ["?"] * len(item_trade_mst)
        )

        conditions.append(
            f"s.ItemTradMstID IN ({placeholders})"
        )

        params.extend(item_trade_mst)


    # Diamond Weight Filter
    if diamond_wt:

        range_conditions = []

        for wt in diamond_wt:

            min_wt, max_wt = (
                wt.replace(" ", "")
                .split("-")
            )

            range_conditions.append(
                "(s.DiamondWt >= ? AND s.DiamondWt <= ?)"
            )

            params.extend([
                float(min_wt),
                float(max_wt)
            ])


        conditions.append(
            "(" +
            " OR ".join(range_conditions)
            +
            ")"
        )


    where_clause = ""

    if conditions:
        where_clause = (
            "WHERE "
            +
            " AND ".join(conditions)
        )


    query = f"""

    WITH ImageData AS
    (
        SELECT
            s.LabelNo,
            s.NetWt,
            s.DiamondWt,
            lt.ImagePath1,

            ROW_NUMBER() OVER(
                PARTITION BY s.LabelNo
                ORDER BY lt.LabelTransID DESC
            ) AS rn

        FROM dbo.LabelBalance s WITH (NOLOCK)

        LEFT JOIN dbo.LabelTransaction lt WITH (NOLOCK)
            ON s.LabelNo = lt.LabelNo


        {where_clause}

    )

    SELECT
        LabelNo,
        NetWt,
        DiamondWt,
        ImagePath1

    FROM ImageData

    WHERE rn = 1

    """


    cursor.execute(
        query,
        params
    )


    rows = cursor.fetchall()


    columns = [
        column[0]
        for column in cursor.description
    ]


    result = []

    for row in rows:

        result.append(
            dict(
                zip(columns,row)
            )
        )


    cursor.close()
    con.close()


    return result

#@frappe.whitelist()
@frappe.whitelist(allow_guest=True)
def get_quotations(start=0, page_length=40, search="", filters=None):

    filters = frappe.parse_json(filters or {})

    where = ["1=1"]
    values = {}

    # Search
    if search:
        where.append("""
            (
                item LIKE %(search)s
                OR design_no LIKE %(search)s
            )
        """)
        values["search"] = f"%{search}%"

    # Metal
    if filters.get("metal"):
        where.append("metal IN %(metal)s")
        values["metal"] = tuple(filters["metal"])

    # Item
    if filters.get("item"):
        where.append("item IN %(item)s")
        values["item"] = tuple(filters["item"])

    # Design
    if filters.get("design_no"):
        where.append("design_no IN %(design_no)s")
        values["design_no"] = tuple(filters["design_no"])

    # Diamond Weight Filter
    if filters.get("diamond_wt"):

        range_conditions = []

        for rng in filters["diamond_wt"]:

            frm, to = rng.split("-")

            range_conditions.append(
                f"""
                (
                    IFNULL(dia_wt1,0) + IFNULL(dia_wt2,0)
                ) BETWEEN {float(frm)} AND {float(to)}
                """
            )

        where.append("(" + " OR ".join(range_conditions) + ")")

    sql = f"""
        SELECT *
        FROM `tabQuotation Upload`
        WHERE {' AND '.join(where)}
        ORDER BY modified DESC
        LIMIT %(start)s,%(page_length)s
    """

    values["start"] = int(start)
    values["page_length"] = int(page_length)

    item_mapping = {
    "Bangles": 86,
    "Button": 108,
    "Cufflink": 107,
    "Pendant": 90,
    "Polki": 199,
    "Ring": 91,
    "Set": 92,
    "Tops": 93,
    "Chain": 10000007,
    "Bali": 10000008,
    "Tanmania": 10000004,
    "Mangalsutra": 10000005

}
    item_ids = []

    for item in filters.get("item", []):

        if item in item_mapping:
            item_ids.append(
                item_mapping[item]
            )

    from_date = filters.get("from_date")
    to_date = filters.get("to_date")
    sale_data ={}
    current_stock ={}
    summary ={}
    if item_ids or filters.get("diamond_wt"):
        
        sale_data = get_ornate_data(
        from_date="2026-04-01",
        to_date="2026-08-01",
        diamond_wt=filters.get("diamond_wt"),
        item_mst=item_ids,
        item_trade_mst= [1006],
        table_name="dbo.SPTran" )
       
        current_stock = get_current_stock_data(
        diamond_wt=filters.get("diamond_wt"),
        item_mst=item_ids,
        item_trade_mst= [1006])



        summary = {

        "stock_count": len(current_stock),

        "stock_diamond_wt": sum(
            float(x.get("DiamondWt") or 0)
            for x in current_stock
        ),


        "sale_count": len(sale_data),

        "sale_diamond_wt": sum(
            float(x.get("DiamondWt") or 0)
            for x in sale_data
        )

    }


    quotations= frappe.db.sql(sql, values, as_dict=True)
    image_server_url="http://192.168.1.5:51"
    return {
        "quotations": quotations,
        "sale_data": sale_data,
        "current_stock":current_stock,
        "summary": summary,
        "image_server_url":image_server_url
    }

@frappe.whitelist()
def get_filter_options():

    filters = {}

    fields = [
        "vendor",
        "item",
        "metal",
        "design_no"
    ]

    for field in fields:

        rows = frappe.get_all(
            "Quotation Upload",
            fields=[field],
            filters={
                field: ["!=", ""]
            },
            distinct=True,
            order_by=f"{field} asc"
        )

        filters[field] = [d[field] for d in rows if d.get(field)]

    return filters
