import frappe

@frappe.whitelist()
def get_product_details():
    user = frappe.session.user
    roles = frappe.get_roles(user)
    user_data = frappe.get_doc("User",user)

    all_item =[]
    requisition= frappe.get_all("Product_Requisition_Forword",fields=["*"],filters={'manager_status':'Approve',
                                                                                    'purchase_dept_status': ['is', 'not set']})
    for item in requisition:
        branch_name=frappe.get_doc("Ornate_Branch_Master",item.branch)
        item_name=frappe.get_doc("Ornate_Item_Master",item.item)
        var_name=frappe.get_doc("Ornate_Variety_Master",item.variety)
        wt_name=frappe.get_doc("weight_range",item.weight_range)
        size_id= None
        size_name=""
        if item.size !=None:
            sz_name=frappe.get_doc("Ornate_Size_Master",item.size)
            size_id =item.size
            size_name= sz_name.size
        idea_stock_res=frappe.get_all("Current_Stock_Ideal_Stock",filters={'branch_id': ["not in", [9]] ,'item_id':item.item,'variety_id':item.variety,'weight_range':wt_name.weight_range},fields=['target_pcs','stock_pcs','branch_id'],limit=3)
        main_branch_code =""
        main_branch_suggested =0
        main_branch_in_stock = 0
        main_branch_diff = 0
        other_branch1_code=""
        other_branch1_suggested=0
        other_branch1_in_stock=0
        other_branch1_diff=0
        other_branch2_code=""
        other_branch2_suggested=0
        other_branch2_in_stock=0
        other_branch2_diff=0

        other_branch_counter=1; 
        for idea_stock in idea_stock_res:
            if idea_stock['branch_id']== item.branch:
                if idea_stock['target_pcs'] != None:
                    main_branch_suggested = idea_stock['target_pcs']
                main_branch_in_stock = idea_stock['stock_pcs']
                main_branch_diff = int(main_branch_suggested) - int(main_branch_in_stock)
                main_branch_code1=frappe.get_doc("Ornate_Branch_Master",item.branch,"branch_code")
                main_branch_code= main_branch_code1.branch_code
            else:
                if other_branch_counter == 1:
                    if idea_stock['target_pcs']!= None:
                        other_branch1_suggested = idea_stock['target_pcs']
                    other_branch1_in_stock = idea_stock['stock_pcs']
                    other_branch1_diff =int(other_branch1_suggested) - int(other_branch1_in_stock)
                    other_branch1_code1=frappe.get_doc("Ornate_Branch_Master",idea_stock['branch_id'],"branch_code")
                    other_branch1_code= other_branch1_code1.branch_code
                    other_branch_counter+=1
                else:
                    other_branch2_suggested = idea_stock['target_pcs']
                    other_branch2_in_stock = idea_stock['stock_pcs']
                    other_branch2_diff = int(other_branch2_suggested) - int(other_branch2_in_stock)
                    other_branch2_code1=frappe.get_doc("Ornate_Branch_Master",idea_stock['branch_id'],"branch_code")
                    other_branch2_code = other_branch2_code1.branch_code

        item_data = {
                'used_ids':item.used_ids,
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
                'qty':item.qty_req,
                'qty_manager':item.qty_given_by_manager,
                'ms':"" if item.manager_status is None else item.manager_status,
                'mar': "" if item.manager_approve_reason is None else item.manager_approve_reason,
                'mrr':"" if  item.manager_reject_reason is None else item.manager_reject_reason,
                'mr': "" if item.manager_remarks is None else item.manager_remarks,
                'mdd': "" if item.delivery_date is None else item.delivery_date,
                'pcs':item.pcs,
                'jota':item.jota,
                'ideal':[{"b":main_branch_code,"s":main_branch_suggested,"i":main_branch_in_stock,"d":main_branch_diff},{"b":other_branch1_code,"s":other_branch1_suggested,"i":other_branch1_in_stock,"d":other_branch1_diff},{"b":other_branch2_code,"s":other_branch2_suggested,"i":other_branch2_in_stock,"d":other_branch2_diff}]
                }
        all_item.append(item_data)
    excess_reason=frappe.get_all("Excess_Approve_Reason")
    reject_reason=frappe.get_all("Reduce_Reject_Reason")


    return { 'all_item' :all_item , 'excess_reason':excess_reason, 'reject_reason':reject_reason}
import frappe
import ast
@frappe.whitelist()
def save_product_details(id,used_ids,branch_id, item_id, variety_id, wt_id, size_id, jota,suggested,in_stock,diff,
                         qty_req, qty_given, status, approve_reason,
                         reject_reason, remarks, delivery_date):
    user = frappe.session.user
    if reject_reason=="":
        reject_reason=None
    if approve_reason == "":
        approve_reason=None
    # create new doc
    doc = frappe.get_doc(
            "Product_Requisition_Forword",
            {
                "name":id,   
                "branch": branch_id,
                "item": item_id,
                "variety": variety_id,
                "weight_range": wt_id
                }
            )

    doc.qty_given_by_po= qty_given
    doc.purchase_dept_status= status
    doc.pd_approve_reason =approve_reason
    doc.pd_reject_reason=  reject_reason
    doc.pd_remarks= remarks
    doc.pd_delivery_date= delivery_date
    doc.pd_user=user


    doc.save()
    frappe.db.commit()

    list_data =ast.literal_eval(doc.used_ids)

    if status=="Reject":
        for ids in list_data:
            pid= ids['p']
            doc = frappe.get_doc("Product_Requisition_Item",pid)
            doc.purchase_dept_action ="Reject"
            doc.purchase_dept_reason =reject_reason
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
            doc.purchase_dept_action ="Approve"
            doc.purchase_dept_reason = reason
            doc.qty_approved_by_purchase_dept= qty_given
            doc.save()
            frappe.db.commit()



    return {"message": "Saved successfully", "name": doc.name}

import frappe
import pyodbc
import os
import pandas as pd
from collections import defaultdict

value = os.getenv('sjodbc')
def connect():
    conn = pyodbc.connect(value, autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION, pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn

@frappe.whitelist()
def get_existing_product_image(branch_id, item_id, variety_id, wt_range):
    con = connect()
    cursor = con.cursor()
    min_wt, max_wt = wt_range.replace(" ", "").split("-")
    min_wt = float(min_wt)
    max_wt = float(max_wt)

    query = f'''
    WITH cte AS (
    SELECT
        lt.ImagePath1,
        lt.NetWt,
        lb.BranchID,
        lt.LabelNo,
        bm.BranchCode,
        ROW_NUMBER() OVER (
            PARTITION BY lb.LabelNo   
            ORDER BY lb.LabelNo        
        ) AS rn
    FROM [D:\ORNNX\ORNATENXDATA\DATA\SVGL\SVGL.MDF].dbo.LabelBalance lb
    LEFT JOIN dbo.LabelTransaction lt ON lb.LabelNo = lt.LabelNo
    LEFT JOIN dbo.BranchMaster bm ON bm.BranchID = lb.BranchID
    WHERE lt.VarietyMstId = {variety_id}
      AND lt.ItemMstID = {item_id}
      AND lt.NetWt BETWEEN {min_wt} AND {max_wt}
)
SELECT
    ImagePath1,
    NetWt,
    BranchID,
    LabelNo,
    BranchCode
FROM cte
WHERE rn = 1;
    '''

    cursor.execute(query, ())
    rows = cursor.fetchall()
    grouped = defaultdict(list)

    image_server_url="http://103.249.120.178:51"
    #image_server_url="http://192.168.1.5:51"
    for row in rows:
        branch_id = int(row[2])
        grouped[branch_id].append({
            "ImagePath1": f"{image_server_url}/{row[0]}",
            "NetWt": row[1],
            "LabelNo":row[3],
            "BranchCode":row[4]
            })

    # convert defaultdict to normal dict
    grouped = dict(grouped)
    cursor.close()
    con.close()
    return grouped


@frappe.whitelist()
def get_existing_product_image_manager(branch_id, item_id, variety_id, wt_range):
    con = connect()
    cursor = con.cursor()
    min_wt, max_wt = wt_range.replace(" ", "").split("-")
    min_wt = float(min_wt)
    max_wt = float(max_wt)

    query = f'''
    WITH cte AS (
    SELECT
        lt.ImagePath1,
        lt.NetWt,
        lb.BranchID,
        lt.LabelNo,
        bm.BranchCode,
        ROW_NUMBER() OVER (
            PARTITION BY lb.LabelNo   
            ORDER BY lb.LabelNo        
        ) AS rn
    FROM [D:\ORNNX\ORNATENXDATA\DATA\SVGL\SVGL.MDF].dbo.LabelBalance lb
    LEFT JOIN dbo.LabelTransaction lt ON lb.LabelNo = lt.LabelNo
    LEFT JOIN dbo.BranchMaster bm ON bm.BranchID = lb.BranchID
    WHERE lt.VarietyMstId = {variety_id}
      AND lt.ItemMstID = {item_id}
      AND lt.NetWt BETWEEN {min_wt} AND {max_wt}
      AND lb.BranchID ={branch_id}
)
SELECT
    ImagePath1,
    NetWt,
    BranchID,
    LabelNo,
    BranchCode
FROM cte
WHERE rn = 1;
    '''

    cursor.execute(query, ())
    rows = cursor.fetchall()
    grouped = defaultdict(list)

    #image_server_url="http://103.249.120.178:51"
    image_server_url="http://192.168.1.5:51"
    for row in rows:
        branch_id = int(row[2])
        grouped[branch_id].append({
            "ImagePath1": f"{image_server_url}/{row[0]}",
            "NetWt": row[1],
            "LabelNo":row[3],
            "BranchCode":row[4]
            })

    # convert defaultdict to normal dict
    grouped = dict(grouped)
    cursor.close()
    con.close()
    return grouped


@frappe.whitelist()
def get_product_details_for_assignment():
    user = frappe.session.user
    roles = frappe.get_roles(user)
    user_data = frappe.get_doc("User",user)

    all_item =[]
    requisition= frappe.get_all("Product_Requisition_Forword",fields=["*"],filters={'purchase_dept_status':'Approve','supplier': ['is', 'not set']})
    for item in requisition:
        branch_name=frappe.get_doc("Ornate_Branch_Master",item.branch)
        item_name=frappe.get_doc("Ornate_Item_Master",item.item)
        var_name=frappe.get_doc("Ornate_Variety_Master",item.variety)
        wt_name=frappe.get_doc("weight_range",item.weight_range)
        size_id= None
        size_name=""
        if item.size !=None:
            sz_name=frappe.get_doc("Ornate_Size_Master",item.size)
            size_id =item.size
            size_name= sz_name.size
        idea_stock_res=frappe.get_all("Current_Stock_Ideal_Stock",filters={'branch_id': ["not in", [9]] ,'item_id':item.item,'variety_id':item.variety,'weight_range':wt_name.weight_range},fields=['target_pcs','stock_pcs','branch_id'],limit=3)
        main_branch_code =""
        main_branch_suggested =0
        main_branch_in_stock = 0
        main_branch_diff = 0
        other_branch1_code=""
        other_branch1_suggested=0
        other_branch1_in_stock=0
        other_branch1_diff=0
        other_branch2_code=""
        other_branch2_suggested=0
        other_branch2_in_stock=0
        other_branch2_diff=0

        other_branch_counter=1; 
        for idea_stock in idea_stock_res:
            if idea_stock['branch_id']== item.branch:
                if idea_stock['target_pcs'] != None:
                    main_branch_suggested = idea_stock['target_pcs']
                main_branch_in_stock = idea_stock['stock_pcs']
                main_branch_diff = int(main_branch_suggested) - int(main_branch_in_stock)
                main_branch_code1=frappe.get_doc("Ornate_Branch_Master",item.branch,"branch_code")
                main_branch_code= main_branch_code1.branch_code
            else:
                if other_branch_counter == 1:
                    if idea_stock['target_pcs']!= None:
                        other_branch1_suggested = idea_stock['target_pcs']
                    other_branch1_in_stock = idea_stock['stock_pcs']
                    other_branch1_diff =int(other_branch1_suggested) - int(other_branch1_in_stock)
                    other_branch1_code1=frappe.get_doc("Ornate_Branch_Master",idea_stock['branch_id'],"branch_code")
                    other_branch1_code= other_branch1_code1.branch_code
                    other_branch_counter+=1
                else:
                    other_branch2_suggested = idea_stock['target_pcs']
                    other_branch2_in_stock = idea_stock['stock_pcs']
                    other_branch2_diff = other_branch2_suggested - other_branch2_in_stock
                    other_branch2_code1=frappe.get_doc("Ornate_Branch_Master",idea_stock['branch_id'],"branch_code")
                    other_branch2_code = other_branch2_code1.branch_code

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
                'qty_po':item.qty_given_by_po,
                'qty_bt':item.branch_transfer_qty,
                'qty_cart':int(item.qty_given_by_po)- int(item.branch_transfer_qty),
                'pdr': "" if item.pd_approve_reason is None else item.pd_approve_reason,
                'mar': "" if item.manager_approve_reason is None else item.manager_approve_reason,
                'mrr':"" if  item.manager_reject_reason is None else item.manager_reject_reason,
                'pr': "" if item.pd_remarks is None else item.pd_remarks,
                'mr': "" if item.manager_remarks is None else item.manager_remarks,
                'mdd': "" if item.delivery_date is None else item.delivery_date,
                'pcs':item.pcs,
                'jota':item.jota,
                'ideal':[{"b":main_branch_code,"s":main_branch_suggested,"i":main_branch_in_stock,"d":main_branch_diff},{"b":other_branch1_code,"s":other_branch1_suggested,"i":other_branch1_in_stock,"d":other_branch1_diff},{"b":other_branch2_code,"s":other_branch2_suggested,"i":other_branch2_in_stock,"d":other_branch2_diff}]
                }
        all_item.append(item_data)
    supplier=frappe.get_all("Ornate_Supplier_Master",filters={
        "supplier_code": ["like", "%Gold"]
        },
                            fields=["name", "supplier_code"])


    return { 'all_item' :all_item , 'supplier':supplier}

@frappe.whitelist()
def save_supplier(id,supplier):
    doc = frappe.get_doc(
            "Product_Requisition_Forword",
            {
                "name":id,
                }
            )

    doc.supplier= supplier
    doc.save()
    frappe.db.commit()
    return {"message": "Added to cart successfully."}

import json
@frappe.whitelist()
def transfer_images_to_branch(selected_image_ids):
    user = frappe.session.user
    roles = frappe.get_roles(user)
    user_data = frappe.get_doc("User",user)
    items=json.loads(selected_image_ids)
    total_qty=0
    for item in items:
        total_qty+=1
        branch_transfer = frappe.new_doc("VG_Branch_Transfer_Request")
        branch_transfer.requisition_id = item["id"]
        branch_transfer.request_from = item["requested"]
        branch_transfer.request_to = item["branch"]
        branch_transfer.label_no = item["label_no"]
        branch_transfer.requester= user_data.name
        branch_transfer.save()
    doc = frappe.get_doc(
            "Product_Requisition_Forword",
            {
                "name":item['id'],
                }
            )
    doc.branch_transfer_qty= total_qty
    doc.save()
    frappe.db.commit()
    return {"message": "Branch Request Added Successfully."}    




