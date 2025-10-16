
import frappe

def execute():
    custom_fields = [
        {
            "fieldname": "branch",
            "label": "Branch",
            "fieldtype": "Link",
            "insert_after": "username",
            "options": "Branch"
        },
        {
            "fieldname": "jewellery_type",
            "label": "Jewellery Type",
            "fieldtype": "Link",
            "insert_after": "branch",
            "options": "Jewellery Type"
        },
        {
            "fieldname": "counter",
            "label": "Counter",
            "fieldtype": "Link",
            "insert_after": "jewellery_type",
            "options": "Branch Counter"
        }
    ]

    for field in custom_fields:
        if not frappe.db.exists("Custom Field", {"dt": "User", "fieldname": field["fieldname"]}):
            frappe.get_doc({
                "doctype": "Custom Field",
                "dt": "User",
                **field
            }).insert()
            print(f"Created field: {field['fieldname']}")
        else:
            print(f"Field already exists: {field['fieldname']}")

