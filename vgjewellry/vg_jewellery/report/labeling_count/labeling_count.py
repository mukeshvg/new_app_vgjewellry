# Copyright (c) 2025, SamarthIT and contributors
# For license information, please see license.txt

import frappe
import os
import pyodbc
import pymysql
import pandas as pd

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
    from_date = filters.get("from_date")
    to_date = filters.get("to_date")
    date_query=" vat.VDate>='"+from_date+"' and vat.VDate<='"+to_date+"'"
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
    return_array ={}
    counter=0
    userwise_label_time={}
    for row in rows:
        usr=row.systemUserName
        label=row.LabelNo
        datetime = pd.to_datetime(str(row.VDate) + " " + str(row.VTime))
        if usr not in userwise_label_time:
            userwise_label_time[int(usr)] = []
        userwise_label_time[usr].append({"label_no":label,"datetime":datetime})    
    for usr, labels in userwise_label_time.items():
        labels.sort(key=lambda x: x['datetime'])  # sort by datetime
        for i in range(len(labels)):
            if i < len(labels) - 1:  # compare with the NEXT label
                diff = labels[i+1]['datetime'] - labels[i]['datetime']
                labels[i]['time_diff'] = str(diff)  # gives "0:00:16"
            else:
                labels[i]['time_diff'] = ""    

    diff_lookup = {}
    for usr, labels in userwise_label_time.items():
        for entry in labels:
            diff_lookup[(usr, entry['label_no'])] = {
                "time_diff": entry['time_diff']
                #"time_diff_minutes": entry['time_diff_minutes']
            }
    for row in rows:
        user_name = user_array.get(int(row.systemUserName)) if row.systemUserName is not None else None
        formatted_date = row.VDate.strftime("%d-%m-%Y") if row.VDate else ""
        diff_info = diff_lookup.get((row.systemUserName, row.LabelNo), {"time_diff": "", "time_diff_minutes": ""})
        if user_name=="Admin":
            continue
        return_array[counter]={'count':1,'user':user_name,'label_date':formatted_date,'time':row.VTime,'label_no':row.LabelNo,'supplier_code':row.SupplierName,'net_wt':row.NetWt,'gross_wt':row.GrossWt,'item_name':row.ItemName,'variety':row.VarietyName,'pcs':row.Pcs,  'time_diff_minutes': diff_info['time_diff']}
        counter+=1
    columns = [{"label":key,"fieldname":key,"fieldtype":"Data"} for key in return_array[0].keys()]
    data = list(return_array.values())
    return columns, data
