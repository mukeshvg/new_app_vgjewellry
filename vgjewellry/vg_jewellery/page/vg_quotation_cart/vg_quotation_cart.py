import frappe

@frappe.whitelist()
def get_supplier_list():

    return frappe.db.sql("""
        SELECT
            qc.vendor,
            qu.vendor_code,
            COUNT(*) AS qty
        FROM `tabQuotation Cart` qc
        INNER JOIN `tabQuotation Upload` qu
            ON qc.quotation_id = qu.name
        WHERE qc.status = 1
        GROUP BY
            qc.vendor,
            qu.vendor_code
        ORDER BY
            qc.vendor
    """, as_dict=True)

@frappe.whitelist()
def get_vendor_cart(vendor):

    items = frappe.db.sql("""
        SELECT
            qc.name cart_name,
            qu.*
        FROM `tabQuotation Cart` qc
        INNER JOIN `tabQuotation Upload` qu
            ON qc.quotation_id=qu.name
        WHERE
            qc.vendor=%s
        AND qc.status=1
    """,vendor,as_dict=True)

    total=sum(d.net_wt for d in items)

    if not items:
        return {
            "vendor":vendor,
            "vendor_code":"",
            "items":[]
                }

    return {
        "vendor":vendor,
        "vendor_code":items[0].vendor_code,
        "branch":102,
        "items":items,
        "total_net_wt":total
    }

@frappe.whitelist()
def remove_cart_item(name):

    if frappe.db.exists("Quotation Cart", name):

        frappe.delete_doc(
            "Quotation Cart",
            name,
            ignore_permissions=True
        )

    return True  

import frappe
import json
from frappe import _

@frappe.whitelist()
def generate_po(vendor, vendor_delivery_date=None, remarks=None):

    if isinstance(remarks, str):
        remarks = json.loads(remarks)

    if not remarks:
        remarks = {}

    cart_items = frappe.get_all(
        "Quotation Cart",
        filters={
            "vendor": vendor,
            "status": 1
        },
        fields=[
            "name",
            "quotation_id",
            "vendor"
            #"vendor_delivery_date",
            #"jewellery_type"
        ],
        order_by="creation asc"
    )

    if not cart_items:
        frappe.throw(_("No products found in cart."))

    # Create PO Header
    po = frappe.new_doc("Quotation PO")
    po.vendor = vendor
    po.vendor_delivery_date = (
        vendor_delivery_date
    )
    po.jewellery_type = (
        "Diamond"
    )
    po.status = 1
    po.insert(ignore_permissions=True)

    # Create PO Items
    for row in cart_items:

        po_item = frappe.new_doc("Quotation PO Item")
        po_item.po_no = po.name

        # Link to Quotation Upload
        po_item.item = row.quotation_id

        # If these fields exist in Quotation PO Item
        po_item.vendor_delivery_date = row.vendor_delivery_date
        po_item.jewellery_type = row.jewellery_type

        # Remark from Cart Page
        po_item.remark = remarks.get(row.name, "")

        po_item.insert(ignore_permissions=True)

        # Update Cart
        frappe.db.set_value(
            "Quotation Cart",
            row.name,
            {
                "status": 2
            },
            update_modified=False
        )

    frappe.db.commit()

    return {
        "success": True,
        "po_no": po.name,
        "vendor": po.vendor,
        "vendor_delivery_date": po.vendor_delivery_date,
        "jewellery_type": po.jewellery_type,
        "message": _("Quotation PO Created Successfully.")
    }

