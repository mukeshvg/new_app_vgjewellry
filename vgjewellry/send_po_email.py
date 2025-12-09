import frappe
from whatsapp.api import send_whatsapp



@frappe.whitelist()
def get_all_email_pending_po():
    po_list = frappe.get_all(
        "Vg Purchase Order",
        filters={"is_email_send": "No"},
        fields=["name", "supplier"]
    )
    for po in po_list:
        return send_po_email(po.name, po.supplier)
        # Mark as sent
        #frappe.db.set_value("Vg Purchase Order", po.name, "is_email_send", "Yes")
        frappe.db.commit()
@frappe.whitelist(allow_guest=True)
def send_po_email(docname, sup):
    email2 = "miteshthakur87@gmail.com"

    pdf_data = frappe.get_print(
        doctype="Vg Purchase Order",
        name=docname,
        print_format="VG Manual Purchase Order",
        as_pdf=True
    )

    tr_content = (
    "<tr width='100%' height='40px'><th style='padding-top:5px;padding-bottom:5px'>Sr. No.</th>"
    "<th>Item</th><th>Metal</th><th>Metal Color</th><th>Weight Range</th>"
    "<th>Diamond Carat Range</th><th>Size</th><th>Qty</th><th>Pcs</th><th>Total Weight</th><tr>"
    )

    purchase_doc = frappe.get_doc("Vg Purchase Order", docname)
    for idx, item in enumerate(purchase_doc.item_details, start=1):
        metal_id = item.metal
        metal_name = None
        if metal_id:
            metal_name = frappe.db.get_value("Ornate_Item_Trade_Master", metal_id, "trade_short_name")
        
        item_id=item.item
        item_name = None
        if item_id:
            item_name = frappe.db.get_value("Ornate_Item_Master", item_id, "item_name")

        wt_id= item.weight_range
        wt_name = None
        if wt_id:
            wt_name = frappe.db.get_value("weight_range",wt_id,"weight_range")

        size_id = item.size

        if size_id and frappe.db.exists("Ornate_Size_Master", size_id):
            size_name = frappe.db.get_value("Ornate_Size_Master", size_id, "size")
        else:
            size_name = ""

        tr_content += f"""
        <tr style="font-weight:bold;" height="40px" width="100%">
        <td align="center">{idx}</td>
        <td align="center">{item_name}</td>
        <td align="center">{metal_name}</td>
        <td align="center">{item.metal_color}</td>
        <td align="center">{wt_name}</td>
        <td align="center">{item.diamond_carat_range}</td>
        <td align="center">{size_name}</td>
        <td align="center">{item.qty}</td>
        <td align="center">{item.pcs}</td>
        <td align="center">{item.total_weight}</td>
    </tr>
    """
    second_table = f'<table style="margin-top:20px;margin-bottom:20px" border="1" cellpadding="0" cellspacing="0" width="100%">{tr_content}</table>'
    
    supplier_id= purchase_doc.supplier
    supplier_name = None
    if supplier_id:
        supplier_name = frappe.db.get_value("Ornate_Supplier_Master",supplier_id,"supplier_name")
    msg = f"""
Dear {supplier_name},<br>
<div>We hope this message finds you well. We are pleased to inform you that we have issued a purchase order for the following items:</div><br>
Purchase Order Number:<b>{purchase_doc.name}</b><br>
Date Of Order:<b>{purchase_doc.creation}</b><br>
Items Ordered:<br>
{second_table}
<div>Please find the detailed purchase order attached to this email for your reference. Additionally, we have sent the purchase order via WhatsApp for your convenience.</div>
<div>Important Terms and Conditions:</div>
<ul>
    <li><strong>The weight mentioned in the Purchase Order is final, and the order must be as per the specified weight.</strong></li>
    <li><strong>Delivery dates specified in the PO are binding.</strong></li>
    <li><strong>Goods must conform to agreed specifications and be free from defects.</strong></li>
    <li><strong>Rejected goods will be returned at the vendor's expense.</strong></li>
    <li><strong>The vendor is responsible for all expenses related to repairing jewellery products.</strong></li>
    <li><strong>The buyer reserves the right to cancel the PO without liability if the vendor fails to meet agreed-upon terms or specifications.</strong></li>
    <li><strong>Please review the purchase order and confirm your acceptance by replying to this email or via WhatsApp at your earliest convenience. 
    Feel free to contact us with any questions or for further clarification.</strong></li>
    <li><strong>If a product is damaged or has a QC issue and VG repairs it at its facility, charges for the same will be borne by the vendor.</strong></li>
</ul>
<div>We appreciate your prompt attention to this matter and look forward to a successful partnership.</div>
Warm regards,<br>
Purchase Department
"""

    additional_msg = """
<div>Note: This is an auto-generated email notification. 
Please do not reply to virchandgovanji@svgjewels.com email. 
For any assistance, please contact us via email at qc@svgjewels.com or reach us at +91-8758960079.</div>
"""

    msg = msg + additional_msg
 

    frappe.sendmail(
        recipients=[email2],
        subject=f"Purchase Order-{docname}",
        message=f"{msg}",
         attachments=[{
            "fname": f"{docname}.pdf",
            "fcontent": pdf_data
        }]
    )

    pdf_url=save_pdf_and_get_url(docname, pdf_data)
    pdf_url="http://103.249.120.178:8011/jewel_new/server/purchase/purchase_pdf/PO-R-102-02122025-696.pdf"
    body_param =[supplier_name,purchase_doc.name,"8758960079","link" ]
    a=send_whatsapp("919273446652","purchase_order_whatsapp_with_link_new",pdf_url,body_param)    
    return f"{a}"
 

def save_pdf_and_get_url(docname, pdf_data):
    file_doc = frappe.get_doc({
        "doctype": "File",
        "file_name": f"{docname}.pdf",
        "content": pdf_data,
        "is_private": 0    # must be public for WhatsApp
    })
    file_doc.save(ignore_permissions=True)

    return file_doc.file_url

