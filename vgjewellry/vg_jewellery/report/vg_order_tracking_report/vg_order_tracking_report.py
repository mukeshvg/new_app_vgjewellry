# Copyright (c) 2025, SamarthIT and contributors
# For license information, please see license.txt

# import frappe


# def execute(filters=None):
# 	columns, data = [], []
# 	return columns, data

import frappe

def execute(filters=None):
    counter = filters.get("counter")
    #if not counter:
    #    return [], []

    columns = [
        {"label": "VG Customer Order", "fieldname": "vg_customer_order", "fieldtype": "Link", "options": "VG_Customer_Order", "width": 150},
        {"label": "Branch", "fieldname": "branch", "fieldtype": "Data", "width": 100},
        {"label": "Counter", "fieldname": "counter", "fieldtype": "Data", "width": 80},
        {"label": "Item Name", "fieldname": "item_name", "fieldtype": "Data", "width": 150},
        {"label": "Delivery Date", "fieldname": "delivery_date", "fieldtype": "Data", "width": 100},
        {"label": "Order Date", "fieldname": "order_date", "fieldtype": "Data", "width": 100},
        {"label": "Order Status", "fieldname": "order_status", "fieldtype": "Data", "width": 100},
        {"label": "Label Number", "fieldname": "label_number", "fieldtype": "Data", "width": 120},
        {"label": "Sales Person", "fieldname": "emp_name", "fieldtype": "Data", "width": 120},
    ]

    data = frappe.db.sql("""
        SELECT
            
            tvco.order_status AS order_status,
            tvco.name AS vg_customer_order,
            tbm.branch_short_name AS branch,
            tim.item_name,
            DATE_FORMAT(tvco.delivery_date, '%%d-%%m-%%y') AS delivery_date,
            DATE_FORMAT(tvco.order_date, '%%d-%%m-%%y') AS order_date,
            bc.counter,
            tvco.label_number as label_number,
            CASE 
                WHEN tvbo.order_no IS NULL THEN 'Pending'
                ELSE 'Done'
            END AS billing_status,
            CASE 
                WHEN tvbo.order_no IS NOT NULL AND (tvao.order_no IS NULL OR tvao.vend_remarks IS NULL OR tvao.vend_remarks = '') THEN 'Pending'
                WHEN tvbo.order_no IS NOT NULL AND tvao.vend_remarks = 'Vendor Follow up Done' THEN 'Done'
                ELSE '-'
            END AS ho_status,
            CASE 
                WHEN tvao.qc_status = 'Done' THEN 'Done'
                WHEN tvao.par_rec = 'Received' THEN 'Pending'
                ELSE '-'
            END AS qc_status,
            CASE 
                WHEN tvao.qc_status = 'Done' AND (tvao.labeling_no IS NULL OR tvao.labeling_no = '') THEN 'Pending'
                WHEN tvao.labeling_no IS NOT NULL AND tvao.labeling_no != '' THEN tvao.labeling_no
                ELSE '-'
            END AS labeling_details,
            tem.emp_name 
        FROM tabVG_Customer_Order tvco
        LEFT JOIN tabVG_Customer_Details tvcd ON tvcd.name = tvco.contact_number
        LEFT JOIN tabBranch_Master tbm ON tbm.name = tvco.branch_name
        LEFT JOIN `tabBranch Counter` bc  ON bc.name = tvco.counter
        LEFT JOIN tabItem_Trad_Mst tmm ON tmm.name = tvco.gold_karat
        LEFT JOIN tabItem_Master tim ON tim.name = tvco.prod_name
        LEFT JOIN tabVG_Billing_Order tvbo ON tvbo.order_no = tvco.name
        LEFT JOIN tabVG_Approve_Order tvao ON tvao.order_no = tvco.name
        LEFT JOIN tabEmp_Mst tem ON tem.name = tvco.sales_person
        
    """, (), as_dict=True)

    return columns, data
