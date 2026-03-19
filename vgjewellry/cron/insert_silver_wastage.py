import frappe
import pyodbc
import os
import pandas as pd
from frappe.utils import now_datetime

value = os.getenv('sjodbc')

def connect():
    conn = pyodbc.connect(value, autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION, pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn

@frappe.whitelist(allow_guest=True)
def insert_silver_wastage():
    con = connect()
    cursor = con.cursor()
    query = '''
        SELECT  ItemMstID,ItemTradMstID,FromWeight,ToWeight, PurWastPer,WastageType,PartyID,VarietyMstId FROM ItemWiseLabour AS im where im.ItemTradMstID>4000 and im.ItemTradMstID<5000
    '''
    cursor.execute(query)
    rows = cursor.fetchall()

    
    cursor.close()
    con.close()

    for row in rows:
        ItemMstID,ItemTradMstID,FromWeight,ToWeight, PurWastPer,WastageType,PartyID,VarietyMstId  = row

        exists = frappe.db.exists("Silver_Wastage_Purchase", {
            "item_name": ItemMstID,
            "supplier_name":PartyID,
            "vg_variety_name":VarietyMstId,
            "metal_id":ItemTradMstID,
            "purwast":PurWastPer,
            "wastage_type":WastageType,
            "from_weight":FromWeight,
            "to_weight":ToWeight,
        })

        if exists:
            pass
        else:
            doc=frappe.get_doc({
                "doctype": "Silver_Wastage_Purchase",
                "item_name": ItemMstID,
                "supplier_name":PartyID,
                "vg_variety_name":VarietyMstId,
                "metal_id":ItemTradMstID,
                "purwast":PurWastPer,
                "from_weight":FromWeight,
                "to_weight":ToWeight,
                "wastage_type":WastageType
                }).insert(ignore_permissions=True)
            frappe.db.commit()
            name = doc.name
            frappe.get_doc({
                "doctype": "silver_wastage_Purchase_child",
                "updated_pur_wast":PurWastPer,
                "date" : now_datetime(),
                "parent": name,
                "parentfield": "updated_purwast",
                "parenttype": "Silver_Wastage_Purchase"
                }).insert(ignore_permissions=True)


    frappe.db.commit()
    return "UPSERT completed"
