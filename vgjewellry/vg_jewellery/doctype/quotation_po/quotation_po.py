import frappe
import re

from frappe.model.document import Document
from frappe.utils import nowdate


class QuotationPO(Document):

    def autoname(self):

        # -----------------------------------------------------
        # GET BRANCH CODE
        # -----------------------------------------------------

        branch_code = frappe.db.get_value(
            "Ornate_Branch_Master",
            self.branch,
            "branch_code"
        )

        if not branch_code:
            frappe.throw(
                f"Branch Code not found for branch: {self.branch}"
            )


        # -----------------------------------------------------
        # DATE FORMAT : DDMMYYYY
        # -----------------------------------------------------

        date = frappe.utils.getdate(
            nowdate()
        ).strftime("%d%m%Y")


        # -----------------------------------------------------
        # GET LAST GLOBAL PO NUMBER
        #
        # Example existing:
        # PO-Q-102-11082026-1
        # PO-Q-103-11082026-2
        # PO-Q-102-12082026-3
        #
        # We only take the LAST number.
        # -----------------------------------------------------

        last_po = frappe.db.sql("""
            SELECT name
            FROM `tabQuotation PO`
            WHERE name LIKE 'PO-Q/%'
            ORDER BY creation DESC
            LIMIT 1
        """, as_dict=True)


        next_number = 1


        if last_po:

            last_name = last_po[0].name

            # Get number after the last "-"
            match = re.search(
                r'/(\d+)$',
                last_name
            )

            if match:

                next_number = (
                    int(match.group(1)) + 1
                )


        # -----------------------------------------------------
        # FINAL NAME
        # -----------------------------------------------------

        self.name = (
            f"PO-Q/{branch_code}/{date}/{next_number}"
        )

