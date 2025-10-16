import frappe
import pyodbc
import pymysql
import os

value = os.getenv('sjodbc')
def connect():
    conn = pyodbc.connect(value,autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION,pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn


@frappe.whitelist(allow_guest=True)
def sync_item_name_to_counter():
    frappe.get_list("VG_Customer_Order",filters={"order_status":['like','At Counter']},fields=[])
    con = connect()
    cursor=con.cursor()
    qry = '''
        SELECT bm.BranchName ,cm.CounterNo, im.ItemName FROM ItemPrefix AS ip 
left join CounterMst cm on ip.CounterNo = cm.CounterMstID  LEFT join ItemMst im on im.ItemMstID =ip.ItemMstID  INNER join BranchMaster bm on bm.BranchID =cm.BranchId   where cm.BranchId  in (6,7,8) and cm.CounterNo  not in ('1','2','4','D1') 
         '''
    cursor.execute(qry)
    rows = cursor.fetchall()
    for row in rows:
        branch_name, counter_name, item_name = row      
        item_id = frappe.db.exists("Item_Master", {"item_name": item_name })
        branch_id = frappe.db.exists("Branch_Master", {"branch_name": branch_name })
        counter_id = frappe.db.get_value(
                "Branch Counter",
                filters={
                    "branch": ("like", branch_id),
                    "counter": ("like", counter_name)
                    },
                fieldname="name"
                )
        existing= frappe.db.get_value("Branch Counter Item",filters={"branch":branch_id,"counter":counter_id,"item":item_id },fieldname="name")
        if existing:
            pass
        else:
            frappe.get_doc({"doctype":"Branch Counter Item", "branch":branch_id,"counter":counter_id,"item":item_id}).insert()
            frappe.msgprint(str(existing))
    con.close()
    frappe.db.commit()
    
    con = connect_vapi()
    cursor=con.cursor()
    qry = '''
        SELECT bm.BranchName ,cm.CounterNo, im.ItemName FROM ItemPrefix AS ip 
left join CounterMst cm on ip.CounterNo = cm.CounterMstID  LEFT join ItemMst im on im.ItemMstID =ip.ItemMstID  INNER join BranchMaster bm on bm.BranchID =cm.BranchId   where cm.BranchId  in (6,7,8) and cm.CounterNo  not in ('1','2','4','D1') 
         '''
    cursor.execute(qry)
    rows = cursor.fetchall()
    for row in rows:
        branch_name, counter_name, item_name = row      
        item_id = frappe.db.exists("Item_Master", {"item_name": item_name })
        branch_id = frappe.db.exists("Branch_Master", {"branch_name": branch_name })
        counter_id = frappe.db.get_value(
                "Branch Counter",
                filters={
                    "branch": ("like", branch_id),
                    "counter": ("like", counter_name)
                    },
                fieldname="name"
                )
        existing= frappe.db.get_value("Branch Counter Item",filters={"branch":branch_id,"counter":counter_id,"item":item_id },fieldname="name")
        if existing:
            pass
        else:
            frappe.get_doc({"doctype":"Branch Counter Item", "branch":branch_id,"counter":counter_id,"item":item_id}).insert()
            frappe.msgprint(str(existing))
    con.close()
    frappe.db.commit()
    
    con = connect_surat()
    cursor=con.cursor()
    qry = '''
        SELECT bm.BranchName ,cm.CounterNo, im.ItemName FROM ItemPrefix AS ip 
left join CounterMst cm on ip.CounterNo = cm.CounterMstID  LEFT join ItemMst im on im.ItemMstID =ip.ItemMstID  INNER join BranchMaster bm on bm.BranchID =cm.BranchId   where cm.BranchId  in (6,7,8) and cm.CounterNo  not in ('1','2','4','D1') 
         '''
    cursor.execute(qry)
    rows = cursor.fetchall()
    for row in rows:
        branch_name, counter_name, item_name = row      
        item_id = frappe.db.exists("Item_Master", {"item_name": item_name })
        branch_id = frappe.db.exists("Branch_Master", {"branch_name": branch_name })
        counter_id = frappe.db.get_value(
                "Branch Counter",
                filters={
                    "branch": ("like", branch_id),
                    "counter": ("like", counter_name)
                    },
                fieldname="name"
                )
        existing= frappe.db.get_value("Branch Counter Item",filters={"branch":branch_id,"counter":counter_id,"item":item_id },fieldname="name")
        if existing:
            pass
        else:
            frappe.get_doc({"doctype":"Branch Counter Item", "branch":branch_id,"counter":counter_id,"item":item_id}).insert()
    con.close()
    frappe.db.commit()
