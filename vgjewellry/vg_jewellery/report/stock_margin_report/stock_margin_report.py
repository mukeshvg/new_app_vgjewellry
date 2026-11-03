import frappe

DOCTYPE_TABLE = "`tabstock_margin`"
FILTER_FIELDS = ["branch_id", "item_mst_id", "variety_mst_id","supplier_code","item_trad_mst_id","style_id"]
COLUMNS = [
    {"label": "Label No", "fieldname": "label_no", "fieldtype": "Data", "width": 140},
    {"label": "Branch", "fieldname": "branch_id", "fieldtype": "Data", "width": 80},
    {"label": "Counter", "fieldname": "counter_mst_id", "fieldtype": "Data", "width": 100},
    {"label": "Item Name", "fieldname": "item_mst_id", "fieldtype": "Data", "width": 160},
    {"label": "Metal", "fieldname": "item_trad_mst_id", "fieldtype": "Data", "width": 120},
    {"label": "Trad ID", "fieldname": "trad_id", "fieldtype": "Data", "width": 90},
    {"label": "Variety", "fieldname": "variety_mst_id", "fieldtype": "Data", "width": 140},
    {"label": "Supplier", "fieldname": "supplier_code", "fieldtype": "Data", "width": 120},
    {"label": "Supplier Name", "fieldname": "supplier_name", "fieldtype": "Data", "width": 160},
    {"label": "Style", "fieldname": "style_id", "fieldtype": "Data", "width": 100},
    {"label": "Size", "fieldname": "size_name_id", "fieldtype": "Data", "width": 80},
    {"label": "Location", "fieldname": "location", "fieldtype": "Data", "width": 90},
    {"label": "Gross Wt", "fieldname": "gross_wt", "fieldtype": "Float", "precision": 3, "width": 90},
    {"label": "Net Wt", "fieldname": "net_wt", "fieldtype": "Float", "precision": 3, "width": 90},
    {"label": "Metal Rate", "fieldname": "metal_rate", "fieldtype": "Int", "precision": 2, "width": 100},
    {"label": "Gold Amount", "fieldname": "gold_amount", "fieldtype": "Int", "precision": 2, "width": 120},
    {"label": "Pcs", "fieldname": "pcs", "fieldtype": "Int", "width": 60},
    {"label": "Labour On", "fieldname": "labour_on", "fieldtype": "Data", "width": 90},
    {"label": "Labour Rate", "fieldname": "labour_rate", "fieldtype": "Float", "precision": 2, "width": 100},
    {"label": "Labour Per", "fieldname": "labour_per", "fieldtype": "Float", "precision": 2, "width": 90},
    {"label": "Labour Amount", "fieldname": "labour_amount", "fieldtype": "Int", "precision": 2, "width": 110},
    {"label": "Other Charge", "fieldname": "other_charge", "fieldtype": "Int", "precision": 2, "width": 110},
    {"label": "Sale Rate", "fieldname": "other_sale_rate", "fieldtype": "Int", "precision": 2, "width": 100},
    {"label": "Sale Value", "fieldname": "other_sale_value", "fieldtype": "Int", "precision": 2, "width": 110},
    {"label": "Sales Amount", "fieldname": "sales_amount", "fieldtype": "Int", "precision": 2, "width": 110},
    {"label": "Pur Wast %", "fieldname": "pur_wast_per", "fieldtype": "Float", "precision": 2, "width": 90},
    {"label": "Pur Wast On", "fieldname": "pur_wast_on", "fieldtype": "Data", "width": 90},
    {"label": "Image Path", "fieldname": "image_path", "fieldtype": "Data", "width": 200},
    {"label": "Base Rate", "fieldname": "base_rate", "fieldtype": "Int", "precision": 2, "width": 100},
    {"label": "Purchase Purity", "fieldname": "purchase_purity", "fieldtype": "Float", "precision": 2, "width": 100},
    {"label": "Purchase Rate", "fieldname": "purchase_rate", "fieldtype": "Float", "precision": 2, "width": 130},
    {"label": "Pur Wastage %", "fieldname": "pur_wastage", "fieldtype": "Float", "precision": 2, "width": 100},
    {"label": "Purchase Labour", "fieldname": "purchase_labour", "fieldtype": "Int", "precision": 2, "width": 120},
    {"label": "Stone Purchase Amount", "fieldname": "stone_purchase_amount", "fieldtype": "Int", "precision": 2, "width": 140},
    {"label": "Purchase Amount", "fieldname": "purchase_amount", "fieldtype": "Int", "precision": 2, "width": 130},
    {"label": "Margin", "fieldname": "margin", "fieldtype": "Float", "precision": 2, "width": 120},
    {"label": "Margin %", "fieldname": "margin_percentage", "fieldtype": "Percent", "precision": 2, "width": 90},
]


def execute(filters=None):
    filters = frappe._dict(filters or {})
    return get_columns(), get_data(filters)


@frappe.whitelist()
def get_filter_options():
    """Distinct values for each dropdown filter, taken from the data."""
    options = {}
    for field in FILTER_FIELDS:
        rows = frappe.db.sql(f"""
            SELECT DISTINCT `{field}`
            FROM {DOCTYPE_TABLE}
            WHERE `{field}` IS NOT NULL AND `{field}` != ''
            ORDER BY `{field}`
        """)
        options[field] = [str(r[0]) for r in rows]
    return options


def get_conditions(filters):
    conditions = ["1=1"]
    values = {}

    for field in FILTER_FIELDS:
        if filters.get(field):
            conditions.append(f"`{field}` = %({field})s")
            values[field] = filters.get(field)

    if filters.get("label_no"):
        conditions.append("label_no LIKE %(label_no)s")
        values["label_no"] = f"%{filters.label_no}%"

    return " AND ".join(conditions), values


def get_columns():
    return COLUMNS


def get_data(filters):
    conditions, values = get_conditions(filters)
    fields = ", ".join(f"`{c['fieldname']}`" for c in COLUMNS)
    return frappe.db.sql(f"""
        SELECT {fields}
        FROM {DOCTYPE_TABLE}
        WHERE {conditions}
        ORDER BY label_no
    """, values, as_dict=True)
