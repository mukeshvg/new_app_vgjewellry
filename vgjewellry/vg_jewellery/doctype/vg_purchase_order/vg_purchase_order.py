# Copyright (c) 2025, SamarthIT and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime

class VgPurchaseOrder(Document):
    def autoname(self):
        branch_code=""
        date_str = now_datetime().strftime("%d%m%Y")
        if self.branch:
            branch_code = frappe.db.get_value("Ornate_Branch_Master",self.branch,"branch_code")
        
        last_doc = frappe.db.sql(
            """
            SELECT name FROM `tabVg Purchase Order`
            ORDER BY creation DESC
            LIMIT 1
            """,
            (),
        )

        if last_doc:
            last_name = last_doc[0][0]
            try:
                last_number = int(last_name.split("/")[-1])
            except ValueError:
                last_number = 0
            next_number = last_number + 1
        else:
            next_number = 1
            
        po_name=f"PO-M/"+branch_code+"/"+date_str+"/"+ str(next_number)

        self.name=po_name
