import frappe
import pyodbc
import os
import pandas as pd

value = os.getenv('sjodbc')

def connect():
    conn = pyodbc.connect(value, autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION, pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn

@frappe.whitelist(allow_guest=True)
def fetch_master_from_ornate():
    con = connect()
    cursor = con.cursor()
    query = '''
        SELECT  im.ItemMstID, im.ItemName, im.ItemTradMstID
        FROM ItemMst AS im
    '''
    cursor.execute(query)
    rows = cursor.fetchall()
    
    var_query = '''
        SELECT vm.VarietyMstId ,vm.VarietyName ,vm.ItemTradMstId  FROM VarietyMst AS vm
    '''
    cursor.execute(var_query)
    var_rows = cursor.fetchall()
    
    salesman_query = '''
        SELECT smm.SalesManMstID ,smm.SalesManName ,smm.IsActive ,smm.BranchID  FROM SalesManMst AS smm
    '''
    cursor.execute(salesman_query)
    salesman_rows = cursor.fetchall()
    cursor.close()
    con.close()

    for row in rows:
        name, item_name, trade_id = row

        if frappe.db.exists("Ornate_Item_Master", name):
            # Update existing
            frappe.db.set_value(
                "Ornate_Item_Master",
                name,
                {
                    "item_mst_id": str(name),
                    "item_name": item_name,
                    "item_trade_mst_id": trade_id
                }
            )
        else:
            # Insert new
            frappe.get_doc({
                "doctype": "Ornate_Item_Master",
                "item_mst_id": str(name),
                "item_name": item_name,
                "item_trade_mst_id": trade_id
            }).insert(ignore_permissions=True)

    frappe.db.commit()
    
    for row in var_rows:
        name, var_name, trade_id = row

        if frappe.db.exists("Ornate_Variety_Master", name):
            # Update existing
            frappe.db.set_value(
                "Ornate_Variety_Master",
                name,
                {
                    "variety_id": str(name),
                    "variety_name": var_name,
                    "item_trade_mst_id": trade_id
                }
            )
        else:
            # Insert new
            frappe.get_doc({
                "doctype": "Ornate_Variety_Master",
                "variety_id": str(name),
                "variety_name": var_name,
                "item_trade_mst_id": trade_id
            }).insert(ignore_permissions=True)

    frappe.db.commit()
    
    for row in salesman_rows:
        name, sales_man_name, is_active, branch = row

        if frappe.db.exists("Ornate_Salesman", name):
            # Update existing
            frappe.db.set_value(
                "Ornate_Salesman",
                name,
                {
                    "salesmanid": str(name),
                    "sales_man_name": sales_man_name,
                    "is_active": is_active,
                    "branch": branch,
                }
            )
        else:
            # Insert new
            frappe.get_doc({
                "doctype": "Ornate_Salesman",
                "salesmanid": str(name),
                 "sales_man_name": sales_man_name,
                 "is_active": is_active,
                 "branch": branch,
            }).insert(ignore_permissions=True)

    frappe.db.commit()
    return "UPSERT completed"
