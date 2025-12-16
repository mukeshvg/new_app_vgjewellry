# Copyright (c) 2025, vg and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import now_datetime, get_datetime

class Wastage_Purchase(Document):
    def before_save(self):
        self.log_purwast_change()
        self.update_total_days()

    def log_purwast_change(self):
        # Skip for new document
        if self.is_new():
            return

        # Fetch old Pur.Wast.% from DB
        old_value = frappe.db.get_value(
                "Wastage_Purchase",
                self.name,
                "purwast"
                )

        # If value not changed, do nothing
        if (old_value or "") == (self.purwast or ""):
            return

        # Append history row in child table
        self.append("updated_purwast", {        # ✅ parent table fieldname
                                        "updated_pur_wast": self.purwast,   # ✅ child fieldname
                                        "date": now_datetime(),
                                        "user": frappe.session.user
                                        })

    def update_total_days(self):
        now_dt = now_datetime()

        for row in self.updated_purwast:         # ✅ same table fieldname
            if row.date:
                row_dt = get_datetime(row.date)
                row.total_days = (now_dt - row_dt).days
            else:
                row.total_days = 0
