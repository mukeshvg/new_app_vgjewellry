# Copyright (c) 2025, SamarthIT and contributors
# For license information, please see license.txt

# # import frappe


# def execute(filters=None):
# 	columns, data = [], []
# 	return columns, data

import frappe

def execute(filters=None):
    if not filters:
        filters = {}

    from_date = filters.get("from_date")
    to_date = filters.get("to_date")

    columns = [
        {"label": "Emp Code", "fieldname": "emp_code", "fieldtype": "Data", "width": 150},
        {"label": "Emp Name", "fieldname": "emp_name", "fieldtype": "Data", "width": 150},
        {"label": "Branch Name", "fieldname": "branch_name", "fieldtype": "Data", "width": 150},
        {"label": "Total Reviews", "fieldname": "total_reviews", "fieldtype": "Int", "width": 150},
    ]

    data = frappe.db.sql("""
        SELECT 
            tem.emp_code AS emp_code,
            tem.emp_name AS emp_name,
            tbm.branch_short_name AS branch_name,
            SUM(tgrc.total_review) AS total_reviews
        FROM tabGoogle_Review_Data tgrd
        LEFT JOIN tabGoogle_Review_CT tgrc ON tgrc.parent = tgrd.name
        LEFT JOIN tabBranch_Master tbm ON tbm.name = tgrc.branch_name
        LEFT JOIN tabEmp_Mst tem ON tem.name = tgrc.emp_name
        WHERE tgrd.date BETWEEN %s AND %s
        GROUP BY tgrc.emp_name, tgrc.branch_name
        ORDER BY tgrc.emp_name, tgrc.branch_name
    """, (from_date, to_date), as_dict=1)

    return columns, data
