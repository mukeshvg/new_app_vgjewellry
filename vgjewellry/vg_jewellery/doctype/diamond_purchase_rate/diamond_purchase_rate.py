# Copyright (c) 2026, vg and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class Diamond_Purchase_Rate(Document):
    def before_save(self):
        self.save_diamond_rate_in_child()
   
    def save_diamond_rate_in_child(self):
        if self.is_new():
            return

        old_value = frappe.db.get_value("Diamond_Purchase_Rate", self.name, "rate")

        if (old_value or "") == (self.rate or ""):
            return

        self.append("diamond_rate_rows", {
            "shape":self.shape,
            "gsize":self.gsize,
            "color":self.color,
            "clarity": self.clarity,
            "date_rate":self.rate,
            "min_carat_weight":self.min_carat_weight,
            "max_carat_weight":self.max_carat_weight,
            "product_1":self.product_1_other_details,
            "product_2":self.product_2_other_details,
            "date":self.date,
            "status":"Pending",
            "user":frappe.session.user

    
            })
