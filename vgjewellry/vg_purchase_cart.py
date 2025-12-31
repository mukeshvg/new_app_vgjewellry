import frappe

@frappe.whitelist()
def get_vg_purchase_cart():
    user = frappe.session.user
    roles = frappe.get_roles(user)
    user_data = frappe.get_doc("User",user)

    all_item =[]
    cart ={}
    requisition= frappe.get_all("Product_Requisition_Forword",fields=["*"],filters={'purchase_dept_status':'Approve','supplier': ['is', 'set'],'po_number':['is','not set']})
    for item in requisition:
        supplier=frappe.get_doc("Ornate_Supplier_Master",item.supplier)
        branch_name=frappe.get_doc("Ornate_Branch_Master",item.branch)
        branch_code=branch_name.branch_code

        if item.supplier not in cart:
            cart[item.supplier]={"n":supplier.supplier_code}
        if branch_code not in cart[item['supplier']]:
             cart[item["supplier"]][branch_code] = []
             
        item_name=frappe.get_doc("Ornate_Item_Master",item.item)
        var_name=frappe.get_doc("Ornate_Variety_Master",item.variety)
        wt_name=frappe.get_doc("weight_range",item.weight_range)
        size_id= None
        size_name=""
        if item.size !=None:
            sz_name=frappe.get_doc("Ornate_Size_Master",item.size)
            size_id =item.size
            size_name= sz_name.size

        qty= int(item.qty_given_by_po) - int (item.branch_transfer_qty)   
                    
        item_data = {
                    #'used_ids':str(used_ids),
                    'id':item.name,
                    'item_id':item.item,
                    'variety_id':item.variety,
                    'wt_id':item.weight_range,
                    'size_id':size_id,
                    'branch':item.branch,
                    'branch_name':branch_name.branch_code,
                    'item':item_name.item_name,
                    'variety':var_name.variety_name,
                    'weight_range':wt_name.weight_range,
                    'size':size_name,
                    'qty_po': qty,
                    'pcs':item.pcs,
                    'jota': "" if item.jota in (None, float("nan")) else item.jota,
                    }
        cart[item["supplier"]][branch_code].append(item_data)

    return { 'cart' :cart}

@frappe.whitelist()
def remove_item_from_cart(id):
    doc = frappe.get_doc(
        "Product_Requisition_Forword",
        {
            "name":id,
        }
        )

    doc.supplier= None
    doc.save()
    frappe.db.commit()
    return {"message":  "Remove From cart successfully."}

from frappe.model.document import Document
from datetime import datetime
import json

@frappe.whitelist()
def generate_po(supplier, branch, delivery_date, remark, items):
    po = frappe.new_doc("Vg Purchase Order")
    po.supplier = supplier
    po.branch = branch
    try:
        formatted_delivery_date = datetime.strptime(delivery_date, "%d-%m-%Y").strftime("%Y-%m-%d")
    except Exception as e:
        frappe.throw(f"Invalid date format: {delivery_date}. Please use 'dd-mm-yyyy'. Error: {str(e)}")
    po.delivery_date = formatted_delivery_date
    po.remark = remark
    po.save()
    total_po_weight=0
    if isinstance(items, str):
        items = json.loads(items)
    for item in items:
        doc = frappe.get_doc("Product_Requisition_Forword", {"name":item['id']})
        qty= int(doc.qty_given_by_po) - int (doc.branch_transfer_qty)
        wt_name=frappe.get_doc("weight_range",doc.weight_range)
        low_str, high_str = wt_name.weight_range.split('-')   
        low = float(low_str.strip())
        high = float(high_str.strip())
        mid_weight = (low + high) / 2
        total_weight= mid_weight * qty
        total_po_weight+=total_weight
        po_item = po.append("item_details", {
            "item": doc.item,
            "variety": doc.variety,
            "weight_range": doc.weight_range,
            "size":doc.size,
            "qty": qty,
            "jota": doc.jota,
            "metal":"1002",
            "total_weight":total_weight,
            "image_1": doc.pd_image1,
            "image_2": doc.pd_image2,
            "image_3": doc.pd_image3,
            "image_4": doc.pd_image4
        })
        doc.po_number= po.name
        doc.save()

    po.total_po_weight=total_po_weight
    po.save()
    return {"success": True,"po_number":po.name}


