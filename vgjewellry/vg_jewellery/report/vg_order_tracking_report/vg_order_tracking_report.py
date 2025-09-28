# Copyright (c) 2025, SamarthIT and contributors
# For license information, please see license.txt

# import frappe


# def execute(filters=None):
# 	columns, data = [], []
# 	return columns, data

# import frappe

# def execute(filters=None):
#     counter = filters.get("counter")
#     sales_person = filters.get("sales_person")

#     if not counter or not sales_person:
#         return [], []

#     columns = [
#         {"label": "VG Customer Order", "fieldname": "vg_customer_order", "fieldtype": "Link", "options": "VG_Customer_Order", "width": 150},
#         {"label": "Branch", "fieldname": "branch", "fieldtype": "Data", "width": 100},
#         {"label": "Item Name", "fieldname": "item_name", "fieldtype": "Data", "width": 150},
#         {"label": "Delivery Date", "fieldname": "delivery_date", "fieldtype": "Data", "width": 100},    
#         {"label": "Sales Person", "fieldname": "sales_person", "fieldtype": "Data", "width": 100},
#         {"label": "Counter", "fieldname": "counter", "fieldtype": "Data", "width": 80},
#         {"label": "Billing Status", "fieldname": "billing_status", "fieldtype": "Data", "width": 100},
#         {"label": "HO Status", "fieldname": "ho_status", "fieldtype": "Data", "width": 100},
#         {"label": "QC Status", "fieldname": "qc_status", "fieldtype": "Data", "width": 100},
#         {"label": "Labeling Details", "fieldname": "labeling_details", "fieldtype": "Data", "width": 120},
#         {"label": "Employee", "fieldname": "emp_name", "fieldtype": "Data", "width": 120},
#     ]

#     data = frappe.db.sql("""
#         SELECT 
#             tvco.name AS vg_customer_order,
#             tbm.branch_short_name AS branch,
#             tim.item_name,
#             DATE_FORMAT(tvco.delivery_date, '%%d-%%m-%%y') AS delivery_date,
#             tem1.emp_name,
#             tvco.sales_person,
#             tvco.counter,
#             CASE 
#                 WHEN tvbo.order_no IS NULL THEN 'Pending'
#                 ELSE 'Done'
#             END AS billing_status,
#             CASE 
#                 WHEN tvbo.order_no IS NOT NULL AND (tvao.order_no IS NULL OR tvao.vend_remarks IS NULL OR tvao.vend_remarks = '') THEN 'Pending'
#                 WHEN tvbo.order_no IS NOT NULL AND tvao.vend_remarks = 'Vendor Follow up Done' THEN 'Done'
#                 ELSE '-'
#             END AS ho_status,
#             CASE 
#                 WHEN tvao.qc_status = 'Done' THEN 'Done'
#                 WHEN tvao.par_rec = 'Received' THEN 'Pending'
#                 ELSE '-'
#             END AS qc_status,
#             CASE 
#                 WHEN tvao.qc_status = 'Done' AND (tvao.labeling_no IS NULL OR tvao.labeling_no = '') THEN 'Pending'
#                 WHEN tvao.labeling_no IS NOT NULL AND tvao.labeling_no != '' THEN tvao.labeling_no
#                 ELSE '-'
#             END AS labeling_details,
#             tem.emp_name
#         FROM tabVG_Customer_Order tvco
#         LEFT JOIN tabVG_Customer_Details tvcd ON tvcd.name = tvco.contact_number
#         LEFT JOIN tabBranch_Master tbm ON tbm.name = tvco.branch_name
#         LEFT JOIN tabItem_Trad_Mst tmm ON tmm.name = tvco.gold_karat
#         LEFT JOIN tabItem_Master tim ON tim.name = tvco.prod_name
#         LEFT JOIN tabVG_Billing_Order tvbo ON tvbo.order_no = tvco.name
#         LEFT JOIN tabVG_Approve_Order tvao ON tvao.order_no = tvco.name
#         LEFT JOIN tabEmp_Mst tem ON tem.name = tvao.prod_reci
#         LEFT JOIN tabEmp_Mst tem1 ON tem1.name = tvco.sales_person
#         WHERE tvco.counter = %s OR tvco.sales_person = %s
#     """, (counter, sales_person), as_dict=True)

#     return columns, data


# import frappe

# def execute(filters=None):
#     counter = filters.get("counter")
#     sales_person = filters.get("sales_person")

#     columns = [
#         {"label": "VG Customer Order", "fieldname": "vg_customer_order", "fieldtype": "Link", "options": "VG_Customer_Order", "width": 150},
#         {"label": "Branch", "fieldname": "branch", "fieldtype": "Data", "width": 100},
#         {"label": "Item Name", "fieldname": "item_name", "fieldtype": "Data", "width": 150},
#         {"label": "Delivery Date", "fieldname": "delivery_date", "fieldtype": "Data", "width": 100},
#         {"label": "Sales Person Code", "fieldname": "sales_person", "fieldtype": "Data", "width": 100},
#         {"label": "Sales Person", "fieldname": "sales_person_name", "fieldtype": "Data", "width": 100},
#         {"label": "Counter", "fieldname": "counter", "fieldtype": "Data", "width": 80},
#         {"label": "Billing Status", "fieldname": "billing_status", "fieldtype": "Data", "width": 100},
#         {"label": "HO Status", "fieldname": "ho_status", "fieldtype": "Data", "width": 100},
#         {"label": "QC Status", "fieldname": "qc_status", "fieldtype": "Data", "width": 100},
#         {"label": "Labeling Details", "fieldname": "labeling_details", "fieldtype": "Data", "width": 120},
#         {"label": "Emp_Rec_Prod", "fieldname": "emp_name", "fieldtype": "Data", "width": 120},
#     ]

#     conditions = []
#     values = []

#     if counter:
#         conditions.append("tvco.counter = %s")
#         values.append(counter)
#     if sales_person:
#         conditions.append("tvco.sales_person = %s")
#         values.append(sales_person)

#     condition_str = " OR ".join(conditions)
#     if condition_str:
#         condition_str = "WHERE " + condition_str

#     data = frappe.db.sql(f"""
#         SELECT 
#             tvco.name AS vg_customer_order,
#             tbm.branch_short_name AS branch,
#             tim.item_name,
#             DATE_FORMAT(tvco.delivery_date, '%%d-%%m-%%y') AS delivery_date,
#             tem1.emp_name as sales_person_name ,
#             tvco.sales_person,
#             tvco.counter,
#             CASE 
#                 WHEN tvbo.order_no IS NULL THEN 'Pending'
#                 ELSE 'Done'
#             END AS billing_status,
#             CASE 
#                 WHEN tvbo.order_no IS NOT NULL AND (tvao.order_no IS NULL OR tvao.vend_remarks IS NULL OR tvao.vend_remarks = '') THEN 'Pending'
#                 WHEN tvbo.order_no IS NOT NULL AND tvao.vend_remarks = 'Vendor Follow up Done' THEN 'Done'
#                 ELSE '-'
#             END AS ho_status,
#             CASE 
#                 WHEN tvao.qc_status = 'Done' THEN 'Done'
#                 WHEN tvao.par_rec = 'Received' THEN 'Pending'
#                 ELSE '-'
#             END AS qc_status,
#             CASE 
#                 WHEN tvao.qc_status = 'Done' AND (tvao.labeling_no IS NULL OR tvao.labeling_no = '') THEN 'Pending'
#                 WHEN tvao.labeling_no IS NOT NULL AND tvao.labeling_no != '' THEN tvao.labeling_no
#                 ELSE '-'
#             END AS labeling_details,
#             tem.emp_name
#         FROM tabVG_Customer_Order tvco
#         LEFT JOIN tabVG_Customer_Details tvcd ON tvcd.name = tvco.contact_number
#         LEFT JOIN tabBranch_Master tbm ON tbm.name = tvco.branch_name
#         LEFT JOIN tabItem_Trad_Mst tmm ON tmm.name = tvco.gold_karat
#         LEFT JOIN tabItem_Master tim ON tim.name = tvco.prod_name
#         LEFT JOIN tabVG_Billing_Order tvbo ON tvbo.order_no = tvco.name
#         LEFT JOIN tabVG_Approve_Order tvao ON tvao.order_no = tvco.name
#         LEFT JOIN tabEmp_Mst tem ON tem.name = tvao.prod_reci
#         LEFT JOIN tabEmp_Mst tem1 ON tem1.name = tvco.sales_person
#         {condition_str}
#     """, values, as_dict=True)

#     return columns, data
import frappe

def execute(filters=None):
    counter = filters.get("counter")
    sales_person = filters.get("sales_person")

    columns = [
        {"label": "VG Customer Order", "fieldname": "vg_customer_order", "fieldtype": "Link", "options": "VG_Customer_Order", "width": 150},
        {"label": "Branch", "fieldname": "branch", "fieldtype": "Data", "width": 100},
        {"label": "Item Name", "fieldname": "item_name", "fieldtype": "Data", "width": 150},
        {"label": "Delivery Date", "fieldname": "delivery_date", "fieldtype": "Data", "width": 100},
        {"label": "Sales Person Code", "fieldname": "sales_person", "fieldtype": "Data", "width": 100},
        {"label": "Sales Person", "fieldname": "sales_person_name", "fieldtype": "Data", "width": 100},
        {"label": "Counter", "fieldname": "counter", "fieldtype": "Data", "width": 80},
        {"label": "Billing Status", "fieldname": "billing_status", "fieldtype": "Data", "width": 100},
        {"label": "HO Status", "fieldname": "ho_status", "fieldtype": "Data", "width": 100},
        {"label": "QC Status", "fieldname": "qc_status", "fieldtype": "Data", "width": 100},
        {"label": "Labeling Details", "fieldname": "labeling_details", "fieldtype": "Data", "width": 120},
        {"label": "Emp_Rec_Prod", "fieldname": "emp_rec_prod", "fieldtype": "Data", "width": 120},
    ]

    conditions = []
    values = []

    if counter:
        conditions.append("tvco.counter = %s")
        values.append(counter)
    if sales_person:
        conditions.append("tvco.sales_person = %s")
        values.append(sales_person)

    condition_str = " OR ".join(conditions) if conditions else ""

    if condition_str:
        condition_str = "WHERE " + condition_str

    data = frappe.db.sql(f"""
        SELECT 
            tvco.name AS vg_customer_order,
            tbm.branch_short_name AS branch,
            tim.item_name,
            DATE_FORMAT(tvco.delivery_date, '%%d-%%m-%%y') AS delivery_date,
            tvco.sales_person,
            tem1.emp_name AS sales_person_name,
            tvco.counter,
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
            tem.emp_name AS emp_rec_prod
        FROM tabVG_Customer_Order tvco
        LEFT JOIN tabVG_Customer_Details tvcd ON tvcd.name = tvco.contact_number
        LEFT JOIN tabBranch_Master tbm ON tbm.name = tvco.branch_name
        LEFT JOIN tabItem_Trad_Mst tmm ON tmm.name = tvco.gold_karat
        LEFT JOIN tabItem_Master tim ON tim.name = tvco.prod_name
        LEFT JOIN tabVG_Billing_Order tvbo ON tvbo.order_no = tvco.name
        LEFT JOIN tabVG_Approve_Order tvao ON tvao.order_no = tvco.name
        LEFT JOIN tabEmp_Mst tem ON tem.name = tvao.prod_reci
        LEFT JOIN tabEmp_Mst tem1 ON tem1.name = tvco.sales_person
        {condition_str}
    """, values, as_dict=True)

    return columns, data
