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
def get_all_branch():
    query = '''
    select distinct branch_id , branch from tabCurrent_Stock_Ideal_Stock where branch_id !=9
    '''
    data = frappe.db.sql(query,[],as_dict =True)
    return data
    
@frappe.whitelist(allow_guest=True)
def get_all_branch_item(branch):
    query = '''
    select distinct item_id , item from tabCurrent_Stock_Ideal_Stock where branch_id =%s
    '''
    data = frappe.db.sql(query,branch,as_dict =True)
    return data

@frappe.whitelist(allow_guest=True)
def get_all_branch_item_variety(branch,item):
    query = '''
    select distinct variety_id , variety from tabCurrent_Stock_Ideal_Stock where branch_id =%s and item_id=%s
    '''
    data = frappe.db.sql(query,(branch,item),as_dict =True)
    return data

@frappe.whitelist(allow_guest=True)
def get_all_branch_item_variety_weight_range(branch,item,variety):
    query = '''
    select distinct weight_range from tabCurrent_Stock_Ideal_Stock where branch_id =%s and item_id=%s and variety_id=%s
    '''
    data = frappe.db.sql(query,(branch,item,variety),as_dict =True)
    return data
@frappe.whitelist(allow_guest=True)
def get_variety_from_item(item):
    query ='''
    SELECT variety_id, variety_name, item_trade_mst_id FROM tabOrnate_Variety_Master AS vm WHERE FIND_IN_SET((SELECT item_trade_mst_id  FROM tabOrnate_Item_Master  WHERE item_mst_id = %s), vm.item_trade_mst_id) > 0;
    '''
    data = frappe.db.sql(query, item, as_dict=True)
    variety_ids = [row['variety_id'] for row in data]

    return variety_ids
    
@frappe.whitelist(allow_guest=True)
def get_parent_variety_from_item(item):
    query ='''
    SELECT variety_id, variety_name, item_trade_mst_id FROM tabOrnate_Variety_Master AS vm WHERE FIND_IN_SET((SELECT item_trade_mst_id  FROM tabOrnate_Item_Master  WHERE item_mst_id = %s), vm.item_trade_mst_id) > 0 and type='Parent' ;
    '''
    data = frappe.db.sql(query, item, as_dict=True)
    variety_ids = [row['variety_id'] for row in data]

    return variety_ids
