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

import frappe


@frappe.whitelist(allow_guest=True)
def get_quotations(start=0, page_length=40, search="", filters=None):

    filters = frappe.parse_json(filters or {})

    where = ["1=1"]
    having = []
    values = {}

    # ---------------------------------------------------------
    # Search
    # ---------------------------------------------------------

    if search:

        where.append("""
            (
                q.item LIKE %(search)s
                OR q.vendor_design_number LIKE %(search)s
                OR q.vendor LIKE %(search)s
            )
        """)

        values["search"] = f"%{search}%"

    # ---------------------------------------------------------
    # Metal Filter
    # ---------------------------------------------------------

    if filters.get("metal"):

        where.append("q.metal IN %(metal)s")

        values["metal"] = tuple(filters["metal"])

    # ---------------------------------------------------------
    # Item Filter
    # ---------------------------------------------------------

    if filters.get("item"):

        where.append("q.item IN %(item)s")

        values["item"] = tuple(filters["item"])

    # ---------------------------------------------------------
    # Design Filter
    # ---------------------------------------------------------

    if filters.get("design_no"):

        where.append("q.vendor_design_number IN %(design_no)s")

        values["design_no"] = tuple(filters["design_no"])

    # ---------------------------------------------------------
    # Diamond Weight Range Filter
    # ---------------------------------------------------------

    if filters.get("diamond_wt"):

        range_conditions = []

        for rng in filters["diamond_wt"]:

            frm, to = map(float, rng.split("-"))

            range_conditions.append(
                f"""
                SUM(IFNULL(d.diamond_wt,0))
                BETWEEN {frm} AND {to}
                """
            )

        having.append("(" + " OR ".join(range_conditions) + ")")

    # ---------------------------------------------------------
    # Main SQL
    # ---------------------------------------------------------
    sql = f"""
        SELECT

    q.name,
    q.vendor_code,
    q.vendor,
    q.image,
    q.item,
    q.vendor_design_number,
    q.metal,
    q.gr_wt,
    q.net_wt,
    q.gold_value,
    q.stone_pcs,
    q.stone_wt,
    q.stone_rate,
    q.stone_amount,
    q.labour_rate,
    q.total_labour,
    q.total_amount,
    q.modified,

    GROUP_CONCAT(
        DISTINCT d.diamond_shape
        ORDER BY d.diamond_shape
        SEPARATOR ', '
    ) AS diamond_shape,

    GROUP_CONCAT(
        DISTINCT d.diamond_size
        ORDER BY CAST(d.diamond_size AS DECIMAL(10,3))
        SEPARATOR ', '
    ) AS diamond_size,

    SUM(IFNULL(d.diamond_pcs,0)) AS total_diamond_pcs,

    ROUND(SUM(IFNULL(d.diamond_wt,0)),3) AS total_diamond_wt,

    ROUND(SUM(IFNULL(d.diamond_amount,0)),2) AS total_diamond_amount

FROM `tabQuotation Upload New` q

LEFT JOIN `tabQuotation Upload Diamond` d
    ON d.quotation_number = q.name

WHERE {" AND ".join(where)}

GROUP BY
    q.name,
    q.vendor_code,
    q.vendor,
    q.image,
    q.item,
    q.vendor_design_number,
    q.metal,
    q.gr_wt,
    q.net_wt,
    q.gold_value,
    q.stone_pcs,
    q.stone_wt,
    q.stone_rate,
    q.stone_amount,
    q.labour_rate,
    q.total_labour,
    q.total_amount,
    q.modified

{"HAVING " + " AND ".join(having) if having else ""}

ORDER BY q.modified DESC

LIMIT %(start)s,%(page_length)s
    """

    values["start"] = int(start)
    values["page_length"] = int(page_length)

    # ---------------------------------------------------------
    # Item Mapping
    # ---------------------------------------------------------

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
            item_ids.append(item_mapping[item])

    # ---------------------------------------------------------
    # Ornate Data / Stock Data
    # ---------------------------------------------------------

    from_date = filters.get("from_date")
    to_date = filters.get("to_date")

    sale_data = {}
    current_stock = {}
    summary = {}

    if item_ids or filters.get("diamond_wt"):

        sale_data = get_ornate_data(
            from_date=from_date or "2026-04-01",
            to_date=to_date or "2026-08-01",
            diamond_wt=filters.get("diamond_wt"),
            item_mst=item_ids,
            item_trade_mst=[1006],
            table_name="dbo.SPTran"
        )

        current_stock = get_current_stock_data(
            diamond_wt=filters.get("diamond_wt"),
            item_mst=item_ids,
            item_trade_mst=[1006]
        )

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

    # ---------------------------------------------------------
    # Fetch Quotations
    # ---------------------------------------------------------

    quotations = frappe.db.sql(sql, values, as_dict=True)

    quotation_names = [q["name"] for q in quotations]

    diamond_details = frappe.get_all(
    "Quotation Upload Diamond",
    filters={
        "quotation_number": ["in", quotation_names]
    },
    fields=[
        "quotation_number",
        "diamond_shape",
        "diamond_size",
        "diamond_pcs",
        "diamond_wt",
        "diamond_rate",
        "diamond_amount"
    ],
    order_by="quotation_number asc, idx asc"
)


    diamond_map = {}

    for d in diamond_details:
        quotation_no = str(d["quotation_number"])
        diamond_map.setdefault(quotation_no, []).append(d)

    for q in quotations:
        q["diamond_details"] = diamond_map.get(str(q["name"]), [])

    # ---------------------------------------------------------
    # Image Server
    # ---------------------------------------------------------

    image_server_url = "http://192.168.1.5:51"

    return {

        "quotations": quotations,

        "sale_data": sale_data,

        "current_stock": current_stock,

        "summary": summary,

        "image_server_url": image_server_url
    }

#@frappe.whitelist()
@frappe.whitelist(allow_guest=True)
def get_quotations_old(start=0, page_length=40, search="", filters=None):

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
        "metal"
    ]

    for field in fields:

        rows = frappe.get_all(
            "Quotation Upload New",
            fields=[field],
            filters={
                field: ["!=", ""]
            },
            distinct=True,
            order_by=f"{field} asc"
        )

        filters[field] = [d[field] for d in rows if d.get(field)]

    return filters


@frappe.whitelist()
def add_to_cart(quotation_ids, branch, remark=None):

    # --------------------------------------------------
    # Parse quotation IDs
    # quotation_ids are IDs/names of Quotation Upload New
    # --------------------------------------------------
    quotation_ids = frappe.parse_json(quotation_ids)

    # Remove null / empty values
    quotation_ids = [
        quotation_id
        for quotation_id in quotation_ids
        if quotation_id
    ]

    added = []
    skipped = []

    # --------------------------------------------------
    # Process each quotation
    # --------------------------------------------------
    for quotation_id in quotation_ids:

        # --------------------------------------------------
        # 1. Get quotation from Quotation Upload New
        # --------------------------------------------------
        quotation = frappe.db.get_value(
            "Quotation Upload New",
            quotation_id,
            ["name", "vendor"],
            as_dict=True
        )

        if not quotation:
            skipped.append({
                "quotation_id": quotation_id,
                "reason": "Quotation Upload New not found"
            })
            continue

        # --------------------------------------------------
        # 2. Check whether ACTIVE Quotation Cart exists
        # --------------------------------------------------
        cart_name = frappe.db.get_value(
            "Quotation Cart",
            {
                "quotation_id": quotation_id,
                "status": 1
            },
            "name"
        )

        # --------------------------------------------------
        # 3. Create Quotation Cart if it does not exist
        # --------------------------------------------------
        if not cart_name:

            cart = frappe.get_doc({
                "doctype": "Quotation Cart",
                "quotation_id": quotation_id,
                "vendor": quotation.vendor or "",
                "status": 1
            })

            cart.insert(ignore_permissions=True)

            # IMPORTANT:
            # Save generated Quotation Cart name
            cart_name = cart.name

        # --------------------------------------------------
        # 4. Check if same item + same branch
        #    already exists in this cart
        # --------------------------------------------------
        existing_item = frappe.db.exists(
            "Quotation Cart Item",
            {
                "quotation_number": cart_name,
                "item": quotation_id,
                "branch": branch
            }
        )

        # --------------------------------------------------
        # 5. Already exists -> SKIP
        # --------------------------------------------------
        if existing_item:

            skipped.append({
                "quotation_id": quotation_id,
                "branch": branch,
                "cart_name": cart_name,
                "reason": "Item already exists in cart"
            })

            continue

        # --------------------------------------------------
        # 6. Create Quotation Cart Item
        # --------------------------------------------------
        cart_item = frappe.get_doc({
            "doctype": "Quotation Cart Item",

            # Link to Quotation Cart
            "quotation_number": cart_name,

            # quotation_id is from Quotation Upload New
            "item": quotation_id,

            # Selected branch
            "branch": branch,

            # User remark
            "remark": remark or ""
        })

        cart_item.insert(ignore_permissions=True)

        # --------------------------------------------------
        # 7. Add success response
        # --------------------------------------------------
        added.append({
            "quotation_id": quotation_id,
            "branch": branch,
            "cart_name": cart_name,
            "cart_item": cart_item.name
        })

    # --------------------------------------------------
    # Commit transaction
    # --------------------------------------------------
    frappe.db.commit()

    # --------------------------------------------------
    # Return result
    # --------------------------------------------------
    return {
        "added": added,
        "skipped": skipped
    }


@frappe.whitelist()
def add_to_cart1(quotation_ids):

    quotation_ids = frappe.parse_json(quotation_ids)

    added = []
    skipped = []

    for quotation_id in quotation_ids:

        # Check if already in cart with status = 1
        existing = frappe.db.exists(
            "Quotation Cart",
            {
                "quotation_id": quotation_id,
                "status": 1
            }
        )

        if existing:
            skipped.append(quotation_id)
            continue

        quotation = frappe.db.get_value(
            "Quotation Upload New",
            quotation_id,
            ["vendor"],
            as_dict=True
        )


        doc = frappe.get_doc({
            "doctype": "Quotation Cart",
            "quotation_id": quotation_id,
            "vendor": quotation.vendor if quotation else "",
            "status": 1
        })

        doc.insert(ignore_permissions=True)

        added.append(quotation_id)

    frappe.db.commit()

    return {
        "added": added,
        "skipped": skipped
    }

@frappe.whitelist()
def get_cart_count():

    return frappe.db.count(
        "Quotation Cart",
        {
            "status": 1
        }
    )

@frappe.whitelist()
def get_stock_images(branch_id, item_id, variety_id, weight_range):

    con = connect()
    cursor = con.cursor()

    min_wt, max_wt = weight_range.replace(" ", "").split("-")

    query = """
    WITH ImageData AS
    (
        SELECT

            s.LabelNo,
            s.NetWt,
            s.DiamondWt,
            s.BranchID,
            s.ItemMstID,
            s.ItemTradMstID,

            lt.ImagePath1,

            ROW_NUMBER() OVER(
                PARTITION BY s.LabelNo
                ORDER BY lt.LabelTransID DESC
            ) rn

        FROM dbo.LabelBalance s WITH(NOLOCK)

        LEFT JOIN dbo.LabelTransaction lt WITH(NOLOCK)
            ON s.LabelNo = lt.LabelNo

        WHERE
            s.BranchID = ?
            AND s.ItemMstID = ?
            AND s.VarietyMstID = ?
            AND s.NetWt >= ?
            AND s.NetWt <= ?

    )

    SELECT

        LabelNo,
        NetWt,
        DiamondWt,
        ImagePath1

    FROM ImageData

    WHERE rn=1

    ORDER BY DiamondWt

    """

    cursor.execute(
        query,
        (
            branch_id,
            item_id,
            variety_id,
            float(min_wt),
            float(max_wt)
        )
    )

    columns = [c[0] for c in cursor.description]

    result = [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]

    cursor.close()
    con.close()

    return result    

@frappe.whitelist()
@frappe.validate_and_sanitize_search_inputs
def branch_query(doctype, txt, searchfield, start, page_len, filters):

    return frappe.db.sql("""
        SELECT
            branch_id,
            CONCAT(branch_code, ' - ', branch_name) AS description
        FROM `tabOrnate_Branch_Master`
        WHERE
            branch_id LIKE %(txt)s
            OR branch_code LIKE %(txt)s
            OR branch_name LIKE %(txt)s
        ORDER BY branch_name
        LIMIT %(start)s, %(page_len)s
    """, {
        "txt": f"%{txt}%",
        "start": start,
        "page_len": page_len
    })
