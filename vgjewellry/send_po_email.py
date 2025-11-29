import frappe

@frappe.whitelist()
def get_all_email_pending_po():
    po_list = frappe.get_all(
        "Vg Purchase Order",
        filters={"is_email_send": "No"},
        fields=["name", "supplier"]
    )
    for po in po_list:
        send_po_email(po.name, po.supplier)
        # Mark as sent
        frappe.db.set_value("Vg Purchase Order", po.name, "is_email_send", "Yes")
        frappe.db.commit()

def send_po_email(docname, sup):
    email2 = "miteshthakur87@gmail.com"

    pdf_data = frappe.get_print(
        doctype="Vg Purchase Order",
        name=docname,
        print_format="VG Manual Purchase Order",
        as_pdf=True
    )

    frappe.sendmail(
        recipients=[email2],
        subject=f"Purchase Order {docname}",
        message="Please find attached the PO.",
         attachments=[{
            "fname": f"{docname}.pdf",
            "fcontent": pdf_data
        }]
    )
 

