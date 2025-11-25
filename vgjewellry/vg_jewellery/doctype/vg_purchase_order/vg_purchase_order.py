# Copyright (c) 2025, SamarthIT and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime

class VgPurchaseOrder(Document):
    def autoname(self):
        branch=""
        date_str = now_datetime().strftime("%d%m%Y")
        if self.branch =="B-000002":
            branch="102"
        elif self.branch=="B-000003":
            branch="103"
        elif self.branch =="B-000004":
            branch="104"
        
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
                last_number = int(last_name.split("-")[-1])
            except ValueError:
                last_number = 0
            next_number = last_number + 1
        else:
            next_number = 1
            
        po_name=f"PO-M/"+self.branch+"/"+date_str+"/"+ str(next_number)

        self.name=po_name
