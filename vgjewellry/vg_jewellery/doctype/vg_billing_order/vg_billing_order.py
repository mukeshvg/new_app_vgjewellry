# Copyright (c) 2025, SamarthIT and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class VG_Billing_Order(Document):
	pass

@frappe.whitelist()
def Get_Item_Name(name):
    res = frappe.db.sql("""
        SELECT item_name FROM `tabItem_Master`
        WHERE name = %s
    """, name, as_dict=1)
    return res[0]["item_name"] if res else ""