import frappe

def execute():
    fieldname = "branch"
    doctype = "User"
    new_options = "Branch_Master"  # ← change this to your new DocType name

    try:
        cf = frappe.get_doc("Custom Field", {"dt": doctype, "fieldname": fieldname})
        cf.options = new_options
        cf.save()
        frappe.db.commit()
        print(f"Updated field '{fieldname}' options to '{new_options}'")
    except frappe.DoesNotExistError:
        print(f"Custom field '{fieldname}' not found in {doctype}")

