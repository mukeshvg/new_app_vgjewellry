import frappe
import pyodbc
import os
import pandas as pd
from collections import defaultdict
from frappe.utils import get_datetime
from frappe.utils import now_datetime



value = os.getenv('sjodbc')
def connect():
    conn = pyodbc.connect(value, autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION, pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn

@frappe.whitelist()
def get_all_branch_transfer_request():
    user = frappe.session.user
    roles = frappe.get_roles(user)
    user_data = frappe.get_doc("User",user)
    roles = frappe.get_roles()
    all_items=[]
    if "Manager" in roles:
        user_branch= user_data.ornate_branch
        all_labels=[]
        branch_transfers= frappe.get_all("VG_Branch_Transfer_Request",fields=["*"],
        filters={
        "request_to": user_branch
    },
    or_filters=[
        {"status": ["is", "not set"]},
        {
            "status": "Accept",
            "product_sender__receiver_status": ["is", "not set"]
        },
        {
            "status": "Accept But Give Me Another",
            "product_sender__receiver_status": ["is", "not set"]
        }

    ])
      #                                   filters={'status':['is','not set'],'request_to':user_branch})

        for bt in branch_transfers:
            formatted_date = get_datetime(bt['creation']).strftime("%d-%m-%Y %H:%M:%S")
            all_labels.append(bt['label_no'])
            requisition_id= bt['requisition_id']
            doc = frappe.get_doc("Product_Requisition_Forword",  {"name":requisition_id})
            branch =  frappe.get_doc("Ornate_Branch_Master",doc.branch)
            item =  frappe.get_doc("Ornate_Item_Master",doc.item)
            variety = frappe.get_doc('Ornate_Variety_Master',doc.variety)
            weight_range = frappe.get_doc('weight_range',doc.weight_range)
            item ={"b":branch.branch_name,"ln":bt['label_no'],'i':item.item_name,'v':variety.variety_name,'w':weight_range.weight_range,'c':formatted_date,"rid":requisition_id,"tid":bt['name'],"s":bt['status']}
            all_items.append(item)



        if all_labels:
            placeholders = ",".join(["?"] * len(all_labels))
        
        query = f"""SELECT lt.ImagePath1,lt.LabelNo  FROM [D:\ORNNX\ORNATENXDATA\DATA\SVGL\SVGL.MDF].dbo.LabelTransaction AS lt where lt.LabelNo  in ({placeholders})"""
        con = connect()
        cursor = con.cursor()

        cursor.execute(query, all_labels)
        
        rows = cursor.fetchall()
        columns = [column[0] for column in cursor.description]

        data = {}
        #image_server_url="http://103.249.120.178:51"
        image_server_url="http://192.168.1.5:51"
        for row in rows:
            row_dict = dict(zip(columns, row))
            label_no = row_dict["LabelNo"]
            image_path = row_dict["ImagePath1"]
            data[label_no] = image_path

        cursor.close()
        con.close()
        for i in all_items:
            i["im"]=f"{image_server_url}/{data[i['ln']]}"
        return all_items
    
    else:
        return "no access"

@frappe.whitelist()
def update_status(req_id, tid , status):
    user = frappe.session.user
    user_data = frappe.get_doc("User",user)
    doc = frappe.get_doc("Product_Requisition_Forword",  {"name":req_id})
    transfer_doc = frappe.get_doc("VG_Branch_Transfer_Request",  {"name": tid})
    transfer_doc.status=status
    transfer_doc.approver_manager=user_data
    transfer_doc.save();
    return f"Branch Status Successfully";
    
@frappe.whitelist()
def is_product_send(req_id, tid , status):
    doc = frappe.get_doc("Product_Requisition_Forword",  {"name":req_id})
    transfer_doc = frappe.get_doc("VG_Branch_Transfer_Request",  {"name": tid})
    transfer_doc.product_sender__receiver_status=status
    transfer_doc.product_send_on=now_datetime()
    transfer_doc.save();
    return f"Branch Status Successfully";



@frappe.whitelist()
def get_all_branch_transfer_receive():
    user = frappe.session.user
    roles = frappe.get_roles(user)
    user_data = frappe.get_doc("User",user)
    roles = frappe.get_roles()
    all_items=[]
    if "Purchase Manager" in roles:
        user_branch= user_data.ornate_branch
        all_labels=[]
        branch_transfers= frappe.get_all("VG_Branch_Transfer_Request",fields=["*"],
        filters={
        #"product_sender__receiver_status": "Product Send"
    })
        for bt in branch_transfers:
            formatted_date = get_datetime(bt['creation']).strftime("%d-%m-%Y %H:%M:%S")
            product_send_on = get_datetime(bt['product_send_on']).strftime("%d-%m-%Y %H:%M:%S")
            all_labels.append(bt['label_no'])
            requisition_id= bt['requisition_id']
            doc = frappe.get_doc("Product_Requisition_Forword",  {"name":requisition_id})
            req_branch =  frappe.get_doc("Ornate_Branch_Master",bt.request_from)
            rec_branch =  frappe.get_doc("Ornate_Branch_Master",bt.request_to)
            item =  frappe.get_doc("Ornate_Item_Master",doc.item)
            variety = frappe.get_doc('Ornate_Variety_Master',doc.variety)
            weight_range = frappe.get_doc('weight_range',doc.weight_range)
            item ={"req_b":req_branch.branch_code,"rec_b":rec_branch.branch_code,"ln":bt['label_no'],'i':item.item_name,'v':variety.variety_name,'w':weight_range.weight_range,'c':formatted_date,"rid":requisition_id,"tid":bt['name'],"ps":product_send_on,"s":bt.status,'id':requisition_id}
            all_items.append(item)



        if all_labels:
            placeholders = ",".join(["?"] * len(all_labels))
        
        query = f"""SELECT lt.ImagePath1,lt.LabelNo  FROM [D:\ORNNX\ORNATENXDATA\DATA\SVGL\SVGL.MDF].dbo.LabelTransaction AS lt where lt.LabelNo  in ({placeholders})"""
        con = connect()
        cursor = con.cursor()

        cursor.execute(query, all_labels)
        
        rows = cursor.fetchall()
        columns = [column[0] for column in cursor.description]

        data = {}
        #image_server_url="http://103.249.120.178:51"
        image_server_url="http://192.168.1.5:51"
        for row in rows:
            row_dict = dict(zip(columns, row))
            label_no = row_dict["LabelNo"]
            image_path = row_dict["ImagePath1"]
            data[label_no] = image_path

        cursor.close()
        con.close()
        for i in all_items:
            i["im"]=f"{image_server_url}/{data[i['ln']]}"
        return all_items
    
    else:
        return "no access"

@frappe.whitelist()
def is_product_receive(req_id, tid , status):
    doc = frappe.get_doc("Product_Requisition_Forword",  {"name":req_id})
    transfer_doc = frappe.get_doc("VG_Branch_Transfer_Request",  {"name": tid})
    transfer_doc.product_sender__receiver_status=status
    transfer_doc.product_receive_on=now_datetime()
    transfer_doc.save();
    return f"Branch Status Successfully";

@frappe.whitelist()
def show_branch_transfer(req_id):
    all_items=[]
    all_labels=[]
    bt = frappe.get_doc("VG_Branch_Transfer_Request",{"requisition_id":req_id})
    formatted_date = get_datetime(bt.creation).strftime("%d-%m-%Y %H:%M:%S")
    product_send_on = get_datetime(bt.product_send_on).strftime("%d-%m-%Y %H:%M:%S")
    all_labels.append(bt.label_no)
    requisition_id= bt.requisition_id
    doc = frappe.get_doc("Product_Requisition_Forword",  {"name":requisition_id})
    req_branch =  frappe.get_doc("Ornate_Branch_Master",bt.request_from)
    rec_branch =  frappe.get_doc("Ornate_Branch_Master",bt.request_to)
    item =  frappe.get_doc("Ornate_Item_Master",doc.item)
    variety = frappe.get_doc('Ornate_Variety_Master',doc.variety)
    weight_range = frappe.get_doc('weight_range',doc.weight_range)
    item ={"req_b":req_branch.branch_code,"rec_b":rec_branch.branch_code,"ln":bt.label_no,'i':item.item_name,'v':variety.variety_name,'w':weight_range.weight_range,'c':formatted_date,"rid":requisition_id,"tid":bt.name,"ps":product_send_on,"s":bt.status,'id':requisition_id}
    all_items.append(item)
    if all_labels:
            placeholders = ",".join(["?"] * len(all_labels))

    query = f"""SELECT lt.ImagePath1,lt.LabelNo  FROM [D:\ORNNX\ORNATENXDATA\DATA\SVGL\SVGL.MDF].dbo.LabelTransaction AS lt where lt.LabelNo  in ({placeholders})"""
    con = connect()
    cursor = con.cursor()

    cursor.execute(query, all_labels)

    rows = cursor.fetchall()
    columns = [column[0] for column in cursor.description]

    data = {}
    image_server_url="http://103.249.120.178:51"
    #image_server_url="http://192.168.1.5:51"
    for row in rows:
        row_dict = dict(zip(columns, row))
        label_no = row_dict["LabelNo"]
        image_path = row_dict["ImagePath1"]
        data[label_no] = image_path

    cursor.close()
    con.close()
    for i in all_items:
        i["im"]=image_server_url+"/"+image_path
    return all_items
