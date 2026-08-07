# Copyright (c) 2026, vg and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.model.naming import make_autoname
from frappe.utils import nowdate
from frappe.model.naming import getseries



class QuotationPO(Document):
    def autoname(self):
        date = nowdate().replace("-", "")
        series = getseries(f"PO-Q/{date}/", 0)
        self.name = f"PO-Q/{date}/{series}"

