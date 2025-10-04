# Copyright (c) 2025, SamarthIT and contributors
# For license information, please see license.txt

import frappe
import os
import pyodbc
import pymysql
from datetime import datetime


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
    date_query=" i.VouDate >='"+from_date+"' and i.VouDate<='"+to_date+"'"
    con = connect_ho()
    cursor=con.cursor()
    qry =f'''
    SELECT am.AccName as AccName, im.VouNo as issue_vou_no,im.UserID as systemUserName,im.RefNo as ref,vait.VouNo as rec_vou_no , vait.VouDate as rec_date   ,i.GrossWt  as GrossWt , i.NetWt  as NetWt,i.Purity as Purity,i.Pcs as Pcs,i.VouDate  as VouDate ,i.OPVouTranId  as OPVouTranId from IRTran AS i left join IRMst AS im on im.IRMstID =i.IRMstId left join VoucherActionItemTran AS vait on vait.VouTranId =i.OPVouTranId left join AccMaster am on am.AccMstID =im.AccMstId  WHERE {date_query}  and i.VchType in ('HMI','DHMI') order by i.VouDate;
    '''
    cursor.execute(qry)
    rows = cursor.fetchall()
    return_array ={}
    counter=0
    for row in rows:
        user_name = user_array.get(int(row.systemUserName)) if row.systemUserName is not None else None
        formatted_date = row.VouDate.strftime("%d-%m-%Y") if row.VouDate else ""
        receive_date = row.rec_date.strftime("%d-%m-%Y") if row.rec_date else ""
        days_diff=""
        if(receive_date !=""):
            issue_date_1 = datetime.strptime(formatted_date, "%d-%m-%Y")
            receive_date_1 = datetime.strptime(receive_date, "%d-%m-%Y")
            days_diff = (receive_date_1 - issue_date_1).days

        return_array[counter]={'Issue Vou No':row.issue_vou_no,'Receive Vou No':row.rec_vou_no, 'Issue Date':formatted_date,'Receive Date':receive_date,'Diff Days':days_diff, 'Issue GrossWt':row.GrossWt,'Issue NetWt':row.NetWt,'Issue Pcs':row.Pcs,'AccName':row.AccName,'User Name':user_name}
        counter+=1
    columns = [{"label":key,"fieldname":key,"fieldtype":"Data"} for key in return_array[0].keys()]
    data = list(return_array.values())
    return columns, data
