
import frappe

def execute():
    custom_fields = [
        {
            "fieldname": "ornate_branch",
            "label": "Branch",
            "fieldtype": "Link",
            "insert_after": "username",
            "options": "Ornate_Branch_Master"
        },
        {
            "fieldname": "branch",
            "label": "Branch Old",
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

    doc_type = "User"  # Replace with actual DocType
    field_name = "branch"  # Replace with actual custom field name

    # Get the custom field record
    custom_field = frappe.get_doc("Custom Field", {
        'dt': doc_type,
        'fieldname': field_name
    })

    # Change the label to a new name
    custom_field.label = "Branch Old"  # Replace with desired label

    # Save the changes
    custom_field.save()

    frappe.db.commit()

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

