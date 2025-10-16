import frappe
from frappe.model.document import Document

class VG_Customer_Order(Document):
    pass

@frappe.whitelist()
def get_list(doctype, txt=None, filters=None, limit_start=0, limit_page_length=20, order_by=None, fields=None):
    user = frappe.session.user
    user_doc = frappe.get_doc("User", user)
    import frappe
import json
from frappe.model.document import Document

class VgCustomerOrder(Document):
    pass

@frappe.whitelist()
def get_list(doctype, txt=None, filters=None, limit_start=0, limit_page_length=20, order_by=None, fields=None, or_filters=None):
    user = frappe.session.user

    # Parse string inputs
    if isinstance(filters, str):
        filters = json.loads(filters)
    if isinstance(or_filters, str):
        or_filters = json.loads(or_filters)
    if isinstance(fields, str):
        fields = json.loads(fields)

    filters = filters or {}
    or_filters = or_filters or {}
    
    frappe.logger().info(f"[VG DEBUG] get_list called for doctype: {doctype}, user: {user}")

    # Only apply session-based filters to VG_Customer_Order
    if doctype == "VG_Customer_Order":
        user_doc = frappe.get_doc("User", user)
        frappe.msgprint(user_doc.counter);
        if user_doc.branch:
            filters["branch_name"] = user_doc.branch
        if user_doc.jewellery_type:
            filters["jew_type"] = user_doc.jewellery_type
        if user_doc.counter:
            filters["counter"] = user_doc.counter

        frappe.logger().info(f"[VG DEBUG] Applied session filters: {filters}")

    return frappe.get_all(
        doctype=doctype,
        fields=fields or ["*"],
        filters=filters,
        or_filters=or_filters,
        limit_start=limit_start,
        limit_page_length=limit_page_length,
        order_by=order_by,
    )
