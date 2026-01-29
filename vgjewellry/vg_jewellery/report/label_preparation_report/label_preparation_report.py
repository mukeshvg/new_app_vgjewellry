import frappe
import os
import pyodbc
import pymysql
import pandas as pd
from datetime import datetime, timedelta , date

from frappe.utils.logger import get_logger


value_ornsys= os.getenv('ornsysodbc')
value_ho = os.getenv('hoodbc')
def connect_ornsys():
    conn = pyodbc.connect(value_ornsys,autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION,pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn

def connect_ho():
    conn = pyodbc.connect(value_ho,autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION,pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn


def execute(filters=None):
    con_ornysis=connect_ornsys();
    cursor_ornysis=con_ornysis.cursor()
    user_qry ='''
    SELECT UsermastID , UserName  FROM UserMaster
    '''
    cursor_ornysis.execute(user_qry)
    rows_user=cursor_ornysis.fetchall()
    user_array={}
    for row_user in rows_user:
        user_array[row_user.UsermastID]=row_user.UserName
    from_date_str = filters.get("from_date")
    from_date = datetime.strptime(from_date_str, "%Y-%m-%d").date()
    to_date = filters.get("to_date")

    from_date_query='2025-10-29';

    date_query=" vat.VDate>='"+from_date_query+"' and vat.VDate<='"+to_date+"'"
    con = connect_ho()
    cursor=con.cursor()

    qry =f'''
        SELECT vat.UserID as systemUserName,vat.VDate as VDate,vat.VTime as VTime,lt.pcs as Pcs ,vat.LabelNo as LabelNo, lt.NetWt as NetWt ,lt.GrossWt as GrossWt ,lt.SupplierCode,scm.SupplierName  as SupplierName,im.ItemName as ItemName , vm.VarietyName  as VarietyName
FROM VoucherActionTran AS vat
left join LabelTransaction lt 
on vat.VouId =lt.VouID 
left join SupplierCodeMaster scm  
on scm.SupplierID  =lt.SupplierCode 
left join ItemMst im
on lt.ItemMstID =im.ItemMstID
left join VarietyMst vm
on lt.VarietyMstId =vm.VarietyMstId
WHERE {date_query} and  vat.[Action] ='Insert'  AND  vat.VouType ='ST'  order by vat.VoucherActionTranId
    '''
    cursor.execute(qry)
    rows = cursor.fetchall()
    labels_date={}
    for row in rows:
        formatted_date = row.VDate.strftime("%d-%m-%Y") if row.VDate else ""
        if formatted_date not in labels_date:
            labels_date[formatted_date] = 1
        else:
            labels_date[formatted_date] += 1


    columns = get_columns()
    data1 = get_data(filters)

    #logger = frappe.logger("label")
    #logger.setLevel("INFO")
    #logger.info(f"{data1}")


    data2={}
    for d in data1:
        rdate = d.get('receive_date')
        if isinstance(rdate, (datetime, date)):
            ddate = rdate.strftime("%d-%m-%Y")
        elif isinstance(rdate, str):
            ddate = datetime.strptime(rdate, "%Y-%m-%d").strftime("%d-%m-%Y")
        else:
            ddate = str(rdate)
        data2[ddate] = d.get("total_receive_pcs", 0)    
        #logger.info(f"{data2}")


    

    start_date = datetime.strptime(from_date_query, "%Y-%m-%d").date()
    end_date = datetime.strptime(to_date, "%Y-%m-%d").date()

    data=[]
    current_date = start_date
    yesterday_remaining = 0
    while current_date <= end_date:
        formatted_date = current_date.strftime("%d-%m-%Y")

        total_label=yesterday_remaining + data2.get(formatted_date,0)

        prepared_label=labels_date.get(formatted_date, 0)

        if total_label < prepared_label:
            prepared_label= total_label


        todays_remaining = total_label - prepared_label


        if current_date >= from_date:
            data.append({
        "receive_date": current_date,
        "yesterday_remaining":yesterday_remaining,
        "total_label_prepared": prepared_label,
        "total_receive_pcs": data2.get(formatted_date,0),
        "todays_carry_forward": todays_remaining
    })

        if todays_remaining >=0:
            yesterday_remaining= todays_remaining
        else:
            yesterday_remaining=0
        current_date += timedelta(days=1)
    return columns, data

def get_columns():
    return [
        {
            "label": "Received Date",
            "fieldname": "receive_date",
            "fieldtype": "Date",
            "width": 120
        },
        {
            "label": "Yesterday Remaining",
            "fieldname": "yesterday_remaining",
            "fieldtype": "Int",
            "width": 160
        },
        {
            "label": "Total Received PCS",
            "fieldname": "total_receive_pcs",
            "fieldtype": "Int",
            "width": 160
        },
        {
            "label": "Total Lable Prepared" ,
            "fieldname": "total_label_prepared",
            "fieldtype": "Data",
            "width": 140
        },
        {
            "label": "Todays Remaining",
            "fieldname": "todays_carry_forward",
            "fieldtype": "Int",
            "width": 160
        },
    ]

def get_data(filters):
    return frappe.db.sql("""
        SELECT
            receive_date,
            SUM(CAST(receive_pcs AS UNSIGNED)) AS total_receive_pcs
        FROM
            `tabReceived From NCH And Inhouse`
        GROUP BY
            receive_date
        ORDER BY
            receive_date
    """, as_dict=True)    
