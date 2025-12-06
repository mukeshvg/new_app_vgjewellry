import frappe

@frappe.whitelist()
def get_product_details():
    user = frappe.session.user
    roles = frappe.get_roles(user)
    user_data = frappe.get_doc("User",user)

    all_item =[]
    requisition= frappe.get_all("Product_Requisition_Form",filters={'branch':user_data.ornate_branch,'action_taken':['!=', 'Action Taken']})
    for req in requisition:
        req_doc = frappe.get_doc("Product_Requisition_Form",req.name)
        items = req_doc.product_details
        for item in items:
            used_ids=[]
            if item.manager_action!=None:
                continue
            item_name=frappe.get_doc("Ornate_Item_Master",item.item)
            var_name=frappe.get_doc("Ornate_Variety_Master",item.variety)
            wt_name=frappe.get_doc("weight_range",item.weight_range)
            sz_name=frappe.get_doc("Ornate_Size_Master",item.size)
            idea_stock=frappe.get_all("Current_Stock_Ideal_Stock",filters={'branch_id':user_data.ornate_branch,'item_id':item.item,'variety_id':item.variety,'weight_range':item.weight_range},fields=['target_pcs','stock_pcs'],limit=1)
            suggested=0;
            in_stock=0;
            if len(idea_stock)>0:
                suggested=idea_stock[0]
                in_stock=idea_stock[1]
            diff = in_stock- suggested
            used_ids.append({'f':req_doc.name,'p':item.name})
            item_data = {
                    'used_ids':str(used_ids),
                    'item_id':item.item,
                    'variety_id':item.variety,
                    'wt_id':item.weight_range,
                    'size_id':item.size,
                    'branch':req_doc.branch,
                    'item':item_name.item_name,
                    'variety':var_name.variety_name,
                    'weight_range':wt_name.weight_range,
                    'size':sz_name.size,
                    'qty':item.qty,
                    'pcs':item.pcs,
                    'jota':item.jota,
                    'suggested':suggested,
                    'in_stock':in_stock,
                    'diff':diff
                    }
            all_item.append(item_data)
    excess_reason=frappe.get_all("Excess_Approve_Reason")
    reject_reason=frappe.get_all("Reduce_Reject_Reason")


    return { 'all_item' :all_item , 'excess_reason':excess_reason, 'reject_reason':reject_reason}
import frappe
import ast
@frappe.whitelist()
def save_product_details(used_ids,branch_id, item_id, variety_id, wt_id, size_id, jota,suggested,in_stock,diff,
                         qty_req, qty_given, status, approve_reason,
                         reject_reason, remarks, delivery_date):

    list_data = ast.literal_eval(used_ids)
    user = frappe.session.user
    if reject_reason=="":
        reject_reason=None
    if approve_reason == "":
        approve_reason=None
    # create new doc
    doc = frappe.get_doc({
        "doctype": "Product_Requisition_Forword",
        "branch": branch_id,
        "item": item_id,
        "variety": variety_id,
        "weight_range": wt_id,
        "size": size_id,
        "jota": jota,
        "suggested":suggested,
        "in_stock":in_stock,
        "difference":diff,
        "qty_req": qty_req,
        "qty_given_by_manager": qty_given,
        "manager_status": status,
        "manager_approve_reason": approve_reason,
        "manager_reject_reason": reject_reason,
        "manager_remarks": remarks,
        "delivery_date": delivery_date,
        "manager":user
    })

    doc.insert()
    frappe.db.commit()

    if status=="Reject":
        for ids in list_data:
            pid= ids['p']
            doc = frappe.get_doc("Product_Requisition_Item",pid)
            doc.manager_action ="Reject"
            doc.manager_reason = reject_reason
            doc.save()
            frappe.db.commit()
    elif status =="Approve":
        reason=""
        if qty_given < qty_req:
            reason=reject_reason
        if qty_req < qty_given:
            reason =approve_reason
        for ids in list_data:
            pid = ids['p']
            doc = frappe.get_doc("Product_Requisition_Item",pid)
            doc.manager_action ="Approve"
            doc.manager_reason = reason
            doc.qty_approved_by_manager= qty_given
            doc.save()
            frappe.db.commit()
    
    for ids in list_data:
        form_id= ids['f']
        req_doc = frappe.get_doc("Product_Requisition_Form",form_id)
        items = req_doc.product_details
        all_action_taken = True
        for item in items:
            if item.manager_action==None:
                all_action_taken = False
                break
        if all_action_taken:
            req_doc.action_taken="Action Taken"
        else:
            req_doc.action_taken="Partial Action Taken"
        req_doc.save()
        frappe.db.commit()


    return {"message": "Saved successfully", "name": doc.name}

