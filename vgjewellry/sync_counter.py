import frappe
import pyodbc
import pymysql
import os

value_valsad = os.getenv('valsadodbc')
value_vapi = os.getenv('vapiodbc')
value_surat = os.getenv('suratodbc')
def connect_valsad():
    conn = pyodbc.connect(value_valsad,autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION,pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn

def connect_vapi():
    conn = pyodbc.connect(value_vapi,autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION,pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn

def connect_surat():
    conn = pyodbc.connect(value_surat,autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION,pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn

@frappe.whitelist(allow_guest=True)
def sync_item_name_to_counter():
    con = connect_valsad()
    cursor=con.cursor()
    qry = '''
        SELECT distinct im.ItemName,  bm.BranchName ,cm.CounterNo FROM ItemPrefix AS ip 
left join CounterMst cm on ip.CounterNo = cm.CounterMstID  LEFT join ItemMst im on im.ItemMstID =ip.ItemMstID  left join BranchMaster bm on bm.BranchID =cm.BranchId   where cm.BranchId  in (6,7,8) and cm.CounterNo  not in ('1','2','4','D1') 
         '''
    cursor.execute(qry)
    rows = cursor.fetchall()
    for row in rows:
        item_name,branch_name, counter_name = row      
        branch_id = frappe.db.exists("Branch_Master", {"branch_name": branch_name })
        existing= frappe.db.get_value("Branch Counter",filters={"branch":branch_id,"counter":counter_name },fieldname="name")
        if existing:
            pass
        else:
            frappe.get_doc({"doctype":"Branch Counter", "branch":branch_id,"counter":counter_name,"jewellery_type":"Gold"}).insert()
            frappe.msgprint(str(existing))
    con.close()
    frappe.db.commit()
    
    con = connect_vapi()
    cursor=con.cursor()
    qry = '''
        SELECT distinct im.ItemName, bm.BranchName ,cm.CounterNo FROM ItemPrefix AS ip 
left join CounterMst cm on ip.CounterNo = cm.CounterMstID  LEFT join ItemMst im on im.ItemMstID =ip.ItemMstID  left join BranchMaster bm on bm.BranchID =cm.BranchId   where cm.BranchId  in (6,7,8) and cm.CounterNo  not in ('1','2','4','D1') 
         '''
    cursor.execute(qry)
    rows = cursor.fetchall()
    for row in rows:
        item_name,branch_name, counter_name = row      
        branch_id = frappe.db.exists("Branch_Master", {"branch_name": branch_name })
        existing= frappe.db.get_value("Branch Counter",filters={"branch":branch_id,"counter":counter_name },fieldname="name")
        if existing:
            pass
        else:
            frappe.get_doc({"doctype":"Branch Counter", "branch":branch_id,"counter":counter_name,"jewellery_type":"Gold"}).insert()
            frappe.msgprint(str(existing))
    con.close()
    frappe.db.commit()
    
    con = connect_surat()
    cursor=con.cursor()
    qry = '''
        SELECT im.ItemName, bm.BranchName ,cm.CounterNo FROM ItemPrefix AS ip 
left join CounterMst cm on ip.CounterNo = cm.CounterMstID  LEFT join ItemMst im on im.ItemMstID =ip.ItemMstID  left join BranchMaster bm on bm.BranchID =cm.BranchId   where cm.BranchId  in (6,7,8) and cm.CounterNo  not in ('1','2','4','D1') 
         '''
    cursor.execute(qry)
    rows = cursor.fetchall()
    for row in rows:
        item_name, branch_name, counter_name = row      
        branch_id = frappe.db.exists("Branch_Master", {"branch_name": branch_name })
        existing= frappe.db.get_value("Branch Counter",filters={"branch":branch_id,"counter":counter_name },fieldname="name")
        if existing:
            pass
        else:
            frappe.get_doc({"doctype":"Branch Counter", "branch":branch_id,"counter":counter_name,"jewellery_type":"Gold"}).insert()
            frappe.msgprint(str(existing))
    con.close()
    frappe.db.commit()
