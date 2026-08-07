import frappe

@frappe.whitelist()
def get_po_list():

    data = frappe.get_all(
        "Quotation PO",
        fields=[
            "name",
            "vendor",
            "vendor_delivery_date",
            "jewellery_type"
        ],
        order_by="creation desc"
    )

    for d in data:

        d["total_items"] = frappe.db.count(
            "Quotation PO Item",
            {"po_no": d["name"]}
        )

    return data

@frappe.whitelist()
def get_po_details(po_no):

    po = frappe.get_doc("Quotation PO", po_no)

    items = frappe.db.sql("""
        SELECT
            q.*,
            p.remark
        FROM `tabQuotation PO Item` p
        INNER JOIN `tabQuotation Upload` q
            ON q.name = p.item
        WHERE p.po_no=%s
    """, po_no, as_dict=True)

    return {
        "po": po,
        "items": items
    }

from frappe.utils.pdf import get_pdf

@frappe.whitelist()
def generate_pdf(po):

    html = frappe.get_print(
        doctype="Quotation PO",
        name=po,
        print_format="VG Quoatiation PO",
        as_pdf=False
    )

    pdf = get_pdf(html)

    file_doc = frappe.get_doc({
        "doctype": "File",
        "file_name": f"{po}.pdf",
        "attached_to_doctype": "Quotation PO",
        "attached_to_name": po,
        "is_private": 0,
        "content": pdf
    })

    file_doc.save(ignore_permissions=True)

    return {
        "success": True,
        "file_url": file_doc.file_url
    }  
