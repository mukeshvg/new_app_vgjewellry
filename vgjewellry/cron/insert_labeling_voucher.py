import frappe
import os
import pyodbc
import pymysql
from datetime import datetime, date, timedelta



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
def insert_voucher():
    today = date.today()
    two_days_ago = today - timedelta(days=30)
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
    from_date = two_days_ago
    to_date = today
    #date_query=" i.VouDate >='"+from_date+"' and i.VouDate<='"+to_date+"'"
    date_query = (" i.VouDate >= '" + from_date.strftime('%Y-%m-%d') + "' and i.VouDate <= '" + to_date.strftime('%Y-%m-%d') + "'")
    con = connect_ho()
    cursor=con.cursor()
    qry =f'''
    SELECT am.AccName as AccName, im.VouNo as issue_vou_no,im.UserID as systemUserName,im.RefNo as ref,vait.VouNo as rec_vou_no , vait.VouDate as rec_date   ,i.GrossWt  as GrossWt , i.NetWt  as NetWt,i.Purity as Purity,i.Pcs as Pcs,i.VouDate  as VouDate ,i.OPVouTranId  as OPVouTranId from IRTran AS i left join IRMst AS im on im.IRMstID =i.IRMstId left join VoucherActionItemTran AS vait on vait.VouTranId =i.OPVouTranId left join AccMaster am on am.AccMstID =im.AccMstId  WHERE {date_query}  and i.VchType in ('HMI','DHMI')  order by i.VouDate;
    '''
    cursor.execute(qry)
    rows = cursor.fetchall()
    return_array ={}
    counter=0
    for row in rows:
        input_voucher_no = row.issue_vou_no
        voucher_no = '/'.join(part.strip() for part in input_voucher_no.split('/'))
        pcs=row.Pcs
        rec_vou_no = row.rec_vou_no
        existing_doc = frappe.db.exists('Issued For NCH', {'voucher_no': voucher_no})

        if not existing_doc:
            new_doc = frappe.get_doc({
                'doctype': 'Issued For NCH',
                'voucher_no': voucher_no,
                'receive_voucher_no':rec_vou_no,
                'pcs': pcs
            })
            new_doc.insert(ignore_permissions=True)
        else:
            doc = frappe.get_doc('Issued For NCH', existing_doc)
            doc.receive_voucher_no=rec_vou_no
            doc.save(ignore_permissions=True)

