import frappe
from whatsapp.scanner_api import send_whatsapp
from frappe.utils import now_datetime, add_to_date

@frappe.whitelist(allow_guest=True)
def send_product_requisition_whatsapp_to_manager():
    time_limit = add_to_date(now_datetime(), minutes=-20)

    records = frappe.get_all(
        "Product_Requisition_Form",
        filters={
            "is_whatsapp_send": 1,
            "creation": ["<=", time_limit],
            "action_taken": ["is", "not set"]
        },
        pluck="name"
    )

    docs = [frappe.get_doc("Product_Requisition_Form", name) for name in records]

    to ="919273446652";

    for doc in docs:
        user = frappe.get_doc("User", doc.owner)
        user_full_name= user.full_name
        requistion_number= doc.name
        remark = doc.requester_remark or ""
        branch = doc.branch
        users = frappe.db.sql("""
            SELECT u.name, u.full_name, u.mobile_no FROM `tabUser` u JOIN `tabHas Role` hr ON hr.parent = u.name  WHERE hr.role = %s  AND u.ornate_branch = %s AND u.enabled = 1""", ("Manager", branch), as_dict=True)
        
        mobile_no=""
        manager_name= ""
        for user in users:
            mobile_no=user["mobile_no"]
            manager_name=user["full_name"]
        items_details=""
        for row in doc.product_details:
            item_doc = frappe.get_doc("Ornate_Item_Master", row.item)
            item_name= item_doc.item_name or ""
            qty=row.qty or ""
            items_details+= item_name+"(Qty:"+qty+")"
       
        msg= f"""Hi {manager_name},
        You have received a new product request.
        Requisition No: *{requistion_number}*
        Counter sales person: *{user_full_name}*
        Requested Item: *{items_details}*
        Additional Notes: *{remark}*
        Kindly check and respond as soon as possible."""

        to = "91"+mobile_no
        send_whatsapp(to,"repairing",msg)
        doc.is_whatsapp_send = 2
        doc.save(ignore_permissions = True)
        frappe.db.commit()


