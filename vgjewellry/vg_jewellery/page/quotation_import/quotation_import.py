import frappe
from frappe import _

@frappe.whitelist()
def download_sample():
    frappe.local.response.filename = "quotation_template.xlsx"
    frappe.local.response.filecontent = open(
        frappe.get_app_path(
            "vgjewellry",
            "public",
            "sample",
            "quotation_template.xlsx"
        ),
        "rb"
    ).read()
    frappe.local.response.type = "download"
