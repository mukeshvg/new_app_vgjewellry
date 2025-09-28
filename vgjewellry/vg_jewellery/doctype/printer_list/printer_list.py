# # Copyright (c) 2025, SamarthIT and contributors
# # For license information, please see license.txt

# # import frappe
# from frappe.model.document import Document


# class PrinterList(Document):
# 	pass

# Copyright (c) 2025, SamarthIT and contributors
# For license information, please see license.txt

import frappe
import cups
import tempfile
from frappe.model.document import Document
from frappe import _

class PrinterList(Document):
    pass

@frappe.whitelist()
def print_test_copies(printer_name, branch, counter, printer_ip):
    try:
        conn = cups.Connection()
        tmp = tempfile.NamedTemporaryFile(delete=False, mode="w", encoding="utf-8")
        
        message = (
            f"Branch: {branch}\n"
            f"Counter: {counter}\n"
            f"Printer Name: {printer_name}\n"
            f"Printer IP: {printer_ip}\n\n"
            f"*** Test Print ***\n"
            "\x1D\x56\x41\x03"
        )

        tmp.write(message)
        tmp.close()

        for i in range(3):
            conn.printFile(printer_name, tmp.name, f"Test Copy {i+1}", {"raw": "true"})

        return _("3 test copies sent to printer: ") + printer_name

    except Exception as e:
        frappe.log_error(f"Printer Test Failed for {printer_name}: {str(e)}")
        return _("Printing failed: ") + str(e)
