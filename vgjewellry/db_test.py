import frappe
import pyodbc
import os
import pymysql
import requests
import json

#value = os.getenv('sjodbc')
#def connect():
#    conn = pyodbc.connect(value,autocommit=True)
#    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION,pyodbc.SQL_TXN_READ_UNCOMMITTED)
#    return conn
value = os.getenv('hrodbc')
def connect():
    conn = pyodbc.connect(value,autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION,pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn
def connect_mysql():
    conn_mysql = pyodbc.connect(os.environ['mysqlodbc'])
    return conn_mysql

def connect_order():
    conn_order = pyodbc.connect(os.environ['orderodbc'])
    return conn_order

def connect_asset():
    conn_asset = pyodbc.connect(os.environ['assetodbc'])
    return conn_asset

@frappe.whitelist(allow_guest=True)
def db_test(database):

    conno= connect_order()
    cursoro= conno.cursor()
    cursoro.execute("select * from sales_order limit 1")
    rowo = cursoro.fetchone()
    if not rowo:
        return {}


    result = {
        column[0]: value
        for column, value in zip(cursoro.description, rowo)
    }

    cursoro.close()
    conno.close()

    return result



    '''connm = connect_mysql()
    cursorm = connm.cursor()
    cursorm.execute("SELECT * FROM customer_mst limit 1")'''
    
    conn = connect_asset()
    cursorm = conn.cursor()
    cursorm.execute("select * from assets")
    '''conn = connect()
    cursorm = conn.cursor()
    cursorm.execute("SELECT * FROM CUS_HOLIDAY_LIST")'''

    row = cursorm.fetchone()

    if not row:
        return {}

    result = {
        column[0]: value
        for column, value in zip(cursorm.description, row)
    }

    cursorm.close()
    conn.close()

    return result
