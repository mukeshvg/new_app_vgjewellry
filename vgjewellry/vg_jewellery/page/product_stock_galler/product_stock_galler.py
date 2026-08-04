import frappe
import pyodbc
import os
import pandas as pd

value = os.getenv('sjodbc')

def connect():
    conn = pyodbc.connect(value, autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION, pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn

@frappe.whitelist()
def get_all_branch_item1(branch):

    branch = frappe.parse_json(branch)

    placeholders = ",".join(["%s"] * len(branch))

    return frappe.db.sql(f"""
        SELECT DISTINCT
            item_id,
            item
        FROM `tabCurrent_Stock_Ideal_Stock`
        WHERE branch_id IN ({placeholders})
        ORDER BY item
    """, tuple(branch), as_dict=True)

@frappe.whitelist()
def get_all_branch_item_variety1(branch, item):

    branch = frappe.parse_json(branch)
    item = frappe.parse_json(item)

    conditions = []
    values = []

    if branch:
        conditions.append(
            "branch_id IN ({})".format(",".join(["%s"] * len(branch)))
        )
        values.extend(branch)

    if item:
        conditions.append(
            "item_id IN ({})".format(",".join(["%s"] * len(item)))
        )
        values.extend(item)

    where = ""

    if conditions:
        where = " WHERE " + " AND ".join(conditions)

    return frappe.db.sql(f"""
        SELECT DISTINCT
            variety_id,
            variety
        FROM `tabCurrent_Stock_Ideal_Stock`
        {where}
        ORDER BY variety
    """, tuple(values), as_dict=True)


@frappe.whitelist()
def get_all_branch_item_variety_weight_range1(branch, item, variety):

    branch = frappe.parse_json(branch)
    item = frappe.parse_json(item)
    variety = frappe.parse_json(variety)

    conditions = []
    values = []

    if branch:
        conditions.append(
            "branch_id IN ({})".format(",".join(["%s"] * len(branch)))
        )
        values.extend(branch)

    if item:
        conditions.append(
            "item_id IN ({})".format(",".join(["%s"] * len(item)))
        )
        values.extend(item)

    if variety:
        conditions.append(
            "variety_id IN ({})".format(",".join(["%s"] * len(variety)))
        )
        values.extend(variety)

    where = ""
    if conditions:
        where = "WHERE " + " AND ".join(conditions)

    query = f"""
        SELECT DISTINCT
            weight_range
        FROM `tabCurrent_Stock_Ideal_Stock`
        {where}
        ORDER BY
            CAST(SUBSTRING_INDEX(weight_range, '-', 1) AS DECIMAL(10,3))
    """

    return frappe.db.sql(query, tuple(values), as_dict=True)


@frappe.whitelist()
def get_todays_stock1(branch, item, variety=None, weight_range=None):

    branch = frappe.parse_json(branch) if branch else []
    item = frappe.parse_json(item) if item else []
    variety = frappe.parse_json(variety) if variety else []
    weight_range = frappe.parse_json(weight_range) if weight_range else []

    if not branch:
        frappe.throw("Please select at least one Branch.")

    if not item:
        frappe.throw("Please select at least one Item.")

    conditions = []
    values = []

    # Branch
    conditions.append(
        "branch_id IN ({})".format(",".join(["%s"] * len(branch)))
    )
    values.extend(branch)

    # Item
    conditions.append(
        "item_id IN ({})".format(",".join(["%s"] * len(item)))
    )
    values.extend(item)

    # Variety (Optional)
    if variety:
        conditions.append(
            "variety_id IN ({})".format(",".join(["%s"] * len(variety)))
        )
        values.extend(variety)

    # Weight Range (Optional)
    if weight_range:
        conditions.append(
            "weight_range IN ({})".format(",".join(["%s"] * len(weight_range)))
        )
        values.extend(weight_range)

    query = f"""
        SELECT
            branch,
            branch_id,
            item,
            item_id,
            variety,
            variety_id,
            weight_range,
            ideal_weight,
            stock_weight,
            stock_pcs,
            target_pcs
        FROM `tabCurrent_Stock_Ideal_Stock`
        WHERE {" AND ".join(conditions)}
        ORDER BY
            branch,
            item,
            variety,
            CAST(SUBSTRING_INDEX(weight_range, '-', 1) AS DECIMAL(10,3))
    """

    return frappe.db.sql(query, tuple(values), as_dict=True)





# ----------------------------------------------------------
# Get Items
# ----------------------------------------------------------
@frappe.whitelist()
def get_all_branch_item(branch=None):

    branch = frappe.parse_json(branch) if branch else []

    if "ANY" in branch:
        branch = []

    conditions = []
    values = []

    if branch:
        conditions.append(
            "branch_id IN ({})".format(",".join(["%s"] * len(branch)))
        )
        values.extend(branch)

    where = ""
    if conditions:
        where = "WHERE " + " AND ".join(conditions)

    query = f"""
        SELECT DISTINCT
            item_id,
            item
        FROM `tabCurrent_Stock_Ideal_Stock`
        {where}
        ORDER BY item
    """

    return frappe.db.sql(query, tuple(values), as_dict=True)


# ----------------------------------------------------------
# Get Variety
# ----------------------------------------------------------
@frappe.whitelist()
def get_all_branch_item_variety(branch, item):

    branch = frappe.parse_json(branch) if branch else []
    item = frappe.parse_json(item) if item else []

    if "ANY" in branch:
        branch = []

    conditions = []
    values = []

    if branch:
        conditions.append(
            "branch_id IN ({})".format(",".join(["%s"] * len(branch)))
        )
        values.extend(branch)

    if item:
        conditions.append(
            "item_id IN ({})".format(",".join(["%s"] * len(item)))
        )
        values.extend(item)

    where = ""
    if conditions:
        where = "WHERE " + " AND ".join(conditions)

    query = f"""
        SELECT DISTINCT
            variety_id,
            variety
        FROM `tabCurrent_Stock_Ideal_Stock`
        {where}
        ORDER BY variety
    """

    return frappe.db.sql(query, tuple(values), as_dict=True)


# ----------------------------------------------------------
# Get Weight Range
# ----------------------------------------------------------
@frappe.whitelist()
def get_all_branch_item_variety_weight_range(branch, item, variety):

    branch = frappe.parse_json(branch) if branch else []
    item = frappe.parse_json(item) if item else []
    variety = frappe.parse_json(variety) if variety else []

    if "ANY" in branch:
        branch = []

    conditions = []
    values = []

    if branch:
        conditions.append(
            "branch_id IN ({})".format(",".join(["%s"] * len(branch)))
        )
        values.extend(branch)

    if item:
        conditions.append(
            "item_id IN ({})".format(",".join(["%s"] * len(item)))
        )
        values.extend(item)

    if variety:
        conditions.append(
            "variety_id IN ({})".format(",".join(["%s"] * len(variety)))
        )
        values.extend(variety)

    where = ""
    if conditions:
        where = "WHERE " + " AND ".join(conditions)

    query = f"""
        SELECT DISTINCT
            weight_range
        FROM `tabCurrent_Stock_Ideal_Stock`
        {where}
        ORDER BY
            CAST(SUBSTRING_INDEX(weight_range,'-',1) AS DECIMAL(10,3))
    """

    return frappe.db.sql(query, tuple(values), as_dict=True)


@frappe.whitelist()
def get_todays_stock(branch, item, variety=None, weight_range=None):

    branch = frappe.parse_json(branch) if branch else []
    item = frappe.parse_json(item) if item else []
    variety = frappe.parse_json(variety) if variety else []
    weight_range = frappe.parse_json(weight_range) if weight_range else []

    is_any_branch = "ANY" in branch

    conditions = []
    values = []

    # Branch Filter (Skip if ANY selected)
    if not is_any_branch and branch:
        conditions.append(
            "branch_id IN ({})".format(",".join(["%s"] * len(branch)))
        )
        values.extend(branch)

    # Item Filter
    if item:
        conditions.append(
            "item_id IN ({})".format(",".join(["%s"] * len(item)))
        )
        values.extend(item)

    # Variety Filter
    if variety:
        conditions.append(
            "variety_id IN ({})".format(",".join(["%s"] * len(variety)))
        )
        values.extend(variety)

    # Weight Range Filter
    if weight_range:
        conditions.append(
            "weight_range IN ({})".format(",".join(["%s"] * len(weight_range)))
        )
        values.extend(weight_range)

    where = ""
    if conditions:
        where = "WHERE " + " AND ".join(conditions)

    # ----------------------------------------------------------
    # ANY Branch -> Show Summed Data
    # ----------------------------------------------------------
    if is_any_branch:

        query = f"""
            SELECT

                'ANY' AS branch_id,
                'Any Branch' AS branch,

                item_id,
                item,

                variety_id,
                variety,

                weight_range,

                ROUND(SUM(ideal_weight),3) AS ideal_weight,
                ROUND(SUM(stock_weight),3) AS stock_weight,
                SUM(stock_pcs) AS stock_pcs,
                SUM(target_pcs) AS target_pcs

            FROM `tabCurrent_Stock_Ideal_Stock`

            {where}

            GROUP BY
                item_id,
                item,
                variety_id,
                variety,
                weight_range

            ORDER BY
                item,
                variety,
                CAST(
                    SUBSTRING_INDEX(weight_range,'-',1)
                    AS DECIMAL(10,3)
                )
        """

    # ----------------------------------------------------------
    # Selected Branch(s)
    # ----------------------------------------------------------
    else:

        query = f"""
            SELECT

                branch_id,
                branch,

                item_id,
                item,

                variety_id,
                variety,

                weight_range,

                ideal_weight,
                stock_weight,
                stock_pcs,
                target_pcs

            FROM `tabCurrent_Stock_Ideal_Stock`

            {where}

            ORDER BY
                branch,
                item,
                variety,
                CAST(
                    SUBSTRING_INDEX(weight_range,'-',1)
                    AS DECIMAL(10,3)
                )
        """

    return frappe.db.sql(query, tuple(values), as_dict=True)

# ----------------------------------------------------------
# Get Today's Stock
# ----------------------------------------------------------
@frappe.whitelist()
def get_todays_stock2(branch, item, variety=None, weight_range=None):

    branch = frappe.parse_json(branch) if branch else []
    item = frappe.parse_json(item) if item else []
    variety = frappe.parse_json(variety) if variety else []
    weight_range = frappe.parse_json(weight_range) if weight_range else []

    if "ANY" in branch:
        branch = []

    conditions = []
    values = []

    if branch:
        conditions.append(
            "branch_id IN ({})".format(",".join(["%s"] * len(branch)))
        )
        values.extend(branch)

    if item:
        conditions.append(
            "item_id IN ({})".format(",".join(["%s"] * len(item)))
        )
        values.extend(item)

    if variety:
        conditions.append(
            "variety_id IN ({})".format(",".join(["%s"] * len(variety)))
        )
        values.extend(variety)

    if weight_range:
        conditions.append(
            "weight_range IN ({})".format(",".join(["%s"] * len(weight_range)))
        )
        values.extend(weight_range)

    where = ""
    if conditions:
        where = "WHERE " + " AND ".join(conditions)

    query = f"""
        SELECT
            branch_id,
            branch,
            item_id,
            item,
            variety_id,
            variety,
            weight_range,
            ideal_weight,
            stock_weight,
            stock_pcs,
            target_pcs
        FROM `tabCurrent_Stock_Ideal_Stock`
        {where}
        ORDER BY
            branch,
            item,
            variety,
            CAST(SUBSTRING_INDEX(weight_range,'-',1) AS DECIMAL(10,3))
    """

    return frappe.db.sql(query, tuple(values), as_dict=True)

@frappe.whitelist()
def get_stock_images(branch_id, item_id, variety_id, weight_range):

    con = connect()
    cursor = con.cursor()

    min_wt, max_wt = weight_range.replace(" ", "").split("-")

    params = [
        item_id,
        variety_id,
        float(min_wt),
        float(max_wt)
    ]

    branch_condition = ""

    # Apply Branch filter only if not ANY
    if branch_id != "ANY":
        branch_condition = "AND s.BranchID = ?"
        params.insert(0, branch_id)

    query = f"""
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
            1=1
            {branch_condition}
            AND s.ItemMstID = ?
            AND lt.VarietyMstId = ?
            AND s.NetWt >= ?
            AND s.NetWt <= ?

    )

    SELECT
        LabelNo,
        NetWt,
        DiamondWt,
        ImagePath1

    FROM ImageData

    WHERE rn = 1

    ORDER BY DiamondWt
    """

    cursor.execute(query, params)

    columns = [c[0] for c in cursor.description]

    result = [
        dict(zip(columns, row))
        for row in cursor.fetchall()
    ]

    cursor.close()
    con.close()

    return result


import requests
import frappe
from urllib.parse import quote

@frappe.whitelist(allow_guest=True)
def get_image(image):

    # Encode spaces and special characters, keep folder separators
    image = quote(image, safe="/")

    url = f"http://103.249.120.178:51/{image}"

    r = requests.get(url, stream=True)

    if r.status_code != 200:
        frappe.throw("Image not found")

    frappe.local.response.filename = image.split("/")[-1]
    frappe.local.response.filecontent = r.content
    frappe.local.response.type = "binary"

    content_type = r.headers.get("Content-Type", "image/jpeg")
    frappe.local.response.headers["Content-Type"] = content_type

