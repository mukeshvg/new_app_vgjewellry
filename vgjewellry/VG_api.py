import frappe
import pyodbc
import pymysql
from sqlalchemy import create_engine, MetaData, Table, Index, Integer, String,  Column 
from sqlalchemy import types as sdt
import pandas as pd
import numpy as np
# from sqlalchemy.types import VARCHAR, Integer, DateTime, Text
import os
import smbclient
from frappe import get_meta
from frappe.model.naming import make_autoname
import subprocess
import requests
# from PyPDF2 import PdfFileWriter
from urllib.parse import quote
# import urllib.parse


value = os.getenv('sjodbc')
def connect():
    conn = pyodbc.connect(value,autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION,pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn

#StockReport_R001
@frappe.whitelist(allow_guest=True)
def StockReport_R001(sd,ed,branch):
    con = connect()
    cursor=con.cursor()
    qry = '''SET NOCOUNT ON;
        SET TRANSACTION ISOLATION LEVEL READ UnCommitted;
        Declare @F as date= (?)
        Declare @T as date= (?)
        Declare @branch int= (?)
        SELECT 
        CASE 
            WHEN bm.BranchName = 'VALSAD BR.- SHAH VIRCHAND' THEN 'VALSAD BRANCH'
            WHEN bm.BranchName = 'VAPI BR.- SHAH VIRCHAND G' THEN 'VAPI BRANCH'
            WHEN bm.BranchName = 'SURAT BR.- SHAH VIRCHAND' THEN 'SURAT BRANCH'
            ELSE bm.BranchName
        END AS BranchName,
        im.TradName,
        MONTH(sp.VouDate) AS [Month],
        DAY(sp.VouDate) AS [Day],
        (SUM(CASE WHEN sp.VouType = 'SL' THEN sp.NetWt ELSE 0 END) - SUM(CASE WHEN sp.VouType = 'SRT' THEN sp.NetWt ELSE 0 END)) AS SLNetwt,
        (SUM(CASE WHEN sp.VouType = 'SL' THEN sp.DiamondWt ELSE 0 END) - SUM(CASE WHEN sp.VouType = 'SRT' THEN sp.DiamondWt ELSE 0 END)) AS SlDiawt,
        (SUM(CASE WHEN sp.VouType = 'SL' THEN (sp.TaxableAmt - sp.LabourDisAmt) ELSE 0 END) - SUM(CASE WHEN sp.VouType = 'SRT' THEN (sp.TaxableAmt - sp.LabourDisAmt) ELSE 0 END)) AS SlAmount,
        CASE sp.YearID 
            WHEN '15' THEN '25-26' 
            WHEN '14' THEN '24-25' 
            WHEN '13' THEN '23-24' 
            ELSE '0' 
        END AS Financial_Year
    FROM sptran sp
    left join itemtradmst im on im.itemtradmstid = sp.itemtradmstid
    left join branchmaster bm on sp.BranchID = bm.BranchID
    where sp.VouDate between @F and @T
        and sp.VouType in ('SL','SRT')
        and case when @Branch = 0 then 1 when @Branch = sp.BranchID then 1 else 0 end = 1
        group by bm.BranchName , im.TradName,sp.YearID ,sp.VouDate;

         '''
    values = (sd,ed,branch)
    cursor.execute(qry,(values))
    res = cursor.fetchall()
    data = []
    columnNames = [column[0] for column in cursor.description]
    for record in res:
        data.append( dict( zip( columnNames , record ) ) )
        # data.append( list(record) )
    # # print(data)
    # conn.close()
    return data
# StockReport_R001('22-apr-2023','22-apr-2023',0)

#Flextmoster
@frappe.whitelist(allow_guest=True)
def ucr_fetch(rpt,usr):
    try:
        with frappe.db.get_connection().cursor() as cursor:
            cursor.callproc('sp137_ucr_fetch', (rpt, usr))
            columns = [col[0] for col in cursor.description]  # Get column names
            rows = cursor.fetchall()  # Fetch results
            while cursor.nextset():  # Consume additional result sets (important for some MariaDB procedures)
                cursor.fetchall()
            
            result = [dict(zip(columns, row)) for row in rows]  # Convert each row to a dict using column names
        return result
    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "ucr_fetch error")
        raise e


@frappe.whitelist(allow_guest=True)
def ucr_userwisefetch(usr,rpt):

    try:
        with frappe.db.get_connection().cursor() as cursor:
            cursor.callproc('sp0168_ucr_userwisefetch', [usr,rpt])
            columns = [col[0] for col in cursor.description]  # Get column names
            rows = cursor.fetchall()  # Fetch results
            while cursor.nextset():  # Consume additional result sets (important for some MariaDB procedures)
                cursor.fetchall()
            
            result = [dict(zip(columns, row)) for row in rows]  # Convert each row to a dict using column names
            return result

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "ucr_userwisefetch error")
        raise e

# For checking Is_Global Permission
@frappe.whitelist(allow_guest=True)
def ucr_custom(usr):

    try:
        with frappe.db.get_connection().cursor() as cursor:
            cursor.callproc('sp001_ucr_custom', [usr])
            columns = [col[0] for col in cursor.description]  # Get column names
            rows = cursor.fetchall()  # Fetch results
            while cursor.nextset():  # Consume additional result sets (important for some MariaDB procedures)
                cursor.fetchall()
            
            result = [dict(zip(columns, row)) for row in rows]  # Convert each row to a dict using column names
            return result

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "ucr_custom error")
        raise e


# @frappe.whitelist(allow_guest=True)
# def UCR_Update_Insert_SubReport(usr, rpt, cnt, srpt, notes, isg, isd, old_srpt=None):
#     if old_srpt == "":
#         old_srpt = None

#     try:
#         if not old_srpt:
#             autonaming_series = get_meta("User_Custom_Report").autoname
#             new_naming_series = make_autoname(autonaming_series, "User_Custom_Report")
            
#             with frappe.db.get_connection().cursor() as cursor:
#                 cursor.callproc('ERP_UCR_Update_Insert_SubReport', [usr, new_naming_series, rpt, cnt, srpt, None, notes, isg, isd])
                
#                 columns = [col[0] for col in cursor.description]  # Get column names
#                 rows = cursor.fetchall()  # Fetch results

#                 while cursor.nextset():  # Consume additional result sets
#                     cursor.fetchall()
                
#                 result = [dict(zip(columns, row)) for row in rows]  # Convert to list of dicts
#                 return result

#     except Exception as e:
#         frappe.log_error(frappe.get_traceback(), "Error in UCR_Update_Insert_SubReport")
#         raise e


@frappe.whitelist(allow_guest=True)
def UCR_Update_Insert_SubReport(usr,rpt,cnt,srpt,notes,isg,isd,old_srpt = None):
  if old_srpt == "":
    old_srpt = None

  if(not old_srpt):
    autonaming_series = get_meta("User_Custom_Report").autoname
    new_naming_series = make_autoname(autonaming_series, "User_Custom_Report")
    # res = frappe.db.sql(''' {CALL ERP_UCR_Update_Insert_SubReport(?,?,?,?,?,?,?,?,?)} ''',values=(usr,new_naming_series,"report_0122",cnt,srpt,notes,isg,isd),as_dict=1)
    frappe.db.sql(
      '''
      CALL ERP_UCR_Update_Insert_SubReport(%s, %s, %s, %s, %s, %s, %s, %s, %s);
      ''',
      values=(usr, new_naming_series, rpt, cnt, srpt, None, notes, isg, isd),
      as_dict=1
    )
    return "Data has been Successfully Submitted"
  else:
    frappe.db.sql('''CALL ERP_UCR_Update_Insert_SubReport(%s, %s, %s, %s, %s, %s, %s, %s, %s)''',values=(usr,None,rpt,cnt,srpt,old_srpt,notes,isg,isd),as_dict=1)
    return "Report updated Successfully"


@frappe.whitelist(allow_guest=True)
def ucr_delete(usr,rpt,srn):
    try:
        with frappe.db.get_connection().cursor() as cursor:
            cursor.callproc('sp002_ucr_delete', [usr,rpt,srn])
            columns = [col[0] for col in cursor.description]  # Get column names
            rows = cursor.fetchall()  # Fetch results
            while cursor.nextset():  # Consume additional result sets (important for some MariaDB procedures)
                cursor.fetchall()
            
            result = [dict(zip(columns, row)) for row in rows]  # Convert each row to a dict using column names
            return result

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "Report has been Successfully Deleted")
        raise e

# @frappe.whitelist(allow_guest=True)
# def ucr_delete(usr,rpt,srn):
# 	# frappe.throw(f'{usr,rpt,srn}')
# 	a = frappe.db.sql('''call sp002_ucr_delete(%(p_username)s,%(p_report_name)s,%(p_sub_reportname)s)''',values={'p_username':usr,'p_report_name':rpt,'p_sub_reportname':srn},as_dict=True)
# 	return "Report has been Successfully Deleted"

@frappe.whitelist(allow_guest=True)
def emp_data(emp_code):
    try:
        with frappe.db.get_connection().cursor() as cursor:
            cursor.callproc('sp002_emp_data', [emp_code])
            columns = [col[0] for col in cursor.description]  # Get column names
            rows = cursor.fetchall()  # Fetch results
            while cursor.nextset():  # Consume additional result sets (important for some MariaDB procedures)
                cursor.fetchall()
            
            result = [dict(zip(columns, row)) for row in rows]  # Convert each row to a dict using column names
            return result

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "emp_data error")
        raise e
#Flextmoster

#Customeroutstanding    
def custoutstandingdata():

    db_name = frappe.get_conf().db_name
    db_password = frappe.get_conf().db_password
    conn_string = f"mysql+pymysql://{db_name}:{db_password}@127.0.0.1:3306/{db_name}"
    engine = create_engine(conn_string)

    # cursor=conn.cursor()
    con = connect()
    cursor=con.cursor()

    cursor.execute('''WITH CTE AS (
    SELECT
        ab.AccMstID as 'acc_mst_id',
        ad.FamilyHead as 'family_head',
        am.AccName as 'acc_name',
        bm.BranchName as 'branch_name',
        ad.MobileNo1 as 'mobileno1',
        ad.MobileNo2 as 'mobileno2',
        ab.OpBal as 'op_bal',
        ab.DrBal as 'dr_bal',
        ab.ClBal as 'cl_bal',
        smm.SalesManName as 'sales_man_name',
        sm.VouDate as 'vouchar_dt',
        ROW_NUMBER() OVER (PARTITION BY ab.AccMstID ORDER BY sm.VouDate DESC) AS RowNum,
        sm.Narration as 'naration',
        sm.Reference as 'reference'
    FROM  AccBal ab
    LEFT JOIN  accmaster am ON am.AccMstID = ab.AccMstID
    LEFT JOIN  branchMaster bm ON bm.BranchID = ab.BranchID
    LEFT JOIN  spmst sm ON sm.AccMstID = ab.AccMstID
    LEFT JOIN  salesmanmst smm ON smm.SalesManMstID = sm.SalesManCode
    LEFT JOIN  addressdtl ad on ad.AccMstID = ab.AccMstID
    WHERE ab.YearID = 15
        AND ab.ClBal < 0
        -- AND ab.BranchID = 1
        AND am.AccCategory = 5
    )
    SELECT
        acc_mst_id as name, '2022-12-17 16:44:17.437' as creation, '2022-12-17 16:44:17.437' as modified,'Administrator' as modified_by,'Administrator' as owner,0 as docstatus,0 as idx,
        family_head,
        acc_mst_id,
        acc_name,
        mobileno1,
        mobileno2,
        branch_name,
        op_bal,
        dr_bal,
        cl_bal,
        vouchar_dt,
        DATEDIFF(DAY, MAX(vouchar_dt), GETDATE()) AS due_day,
        sales_man_name,
        naration,
        reference,
        ''as '_user_tags',''as '_comments', '' as '_assign','' as '_liked_by'
    FROM CTE
    WHERE RowNum = 1
    GROUP BY acc_mst_id, family_head, acc_name, mobileno1, mobileno2, branch_name, op_bal, dr_bal, cl_bal, sales_man_name, vouchar_dt, naration, reference;''')

    res = cursor.fetchall()
    clm = [column[0] for column in cursor.description]
    lclm = [name.lower() for name in clm]
    df=pd.DataFrame(np.array(res),columns=lclm)
    # df.to_sql("tabCustomer Outstanding Data", engine, if_exists="replace")

    fields = frappe.get_meta('Customer_Outstanding_Data').fields
    for field in fields:
        if field.fieldtype in ["Int", "Float"]:
            df[field.fieldname].fillna(0,inplace=True)
    df.to_sql("tabCustomer_Outstanding_Data", engine,index=False, dtype={'acc_mst_id':sdt.VARCHAR(140),'name':sdt.VARCHAR(140),"creation":sdt.DateTime(6),"due_day":sdt.Integer() ,"modified":sdt.DateTime(6),"modified_by":sdt.VARCHAR(140),"owner":sdt.VARCHAR(140),"docstatus":sdt.Integer(),"idx":sdt.Integer(),'_user_tags':sdt.Text(),'_comments':sdt.Text(), '_assign':sdt.Text(),'_liked_by':sdt.Text()}, if_exists="replace")

    print(df.count())
    con.close()
#Customeroutstanding

#KRA Performance Report
@frappe.whitelist()
def Emp_KRA_Performance_Report_R002():
    res = frappe.db.sql('''   with tab1 as(
  SELECT
    eks.emp_code as Emp_Code,
    em.emp_name as Emp_Name,
    bm.branch_short_name as Branch,
    ek.kra_mon as KRA_Mon,
    eks.counter ,
    ek.kra as KRA,
    ek.weightage as Weightage,
    ek.target as Target,
    ek.achieve_target as Achiev_Target,
    (case 
        WHEN ek.kra = 'PUNCTUALITY - ABSENTEEISM IN DAYS' THEN
         IF(ek.target >= ek.achieve_target, ek.weightage, 0)
       else
       case
    when ek.achieve_target <= ek.target then round(((((ek.achieve_target/ek.target)*100)*10/100)*ek.weightage/100)*10) 
         when ek.achieve_target > ek.target then round(((((ek.achieve_target/ek.target)*100)*10/100)*ek.weightage/100)*10) else 0 end end)
      
    as Achieve_Score
--     SUM((((ek.achieve_target/ek.target)*100)*10/100)*ek.weightage/100) OVER (PARTITION BY eks.emp_code, ek.kra_mon) as Total_Achieve_Score
    FROM tabEmployee_KRA_System eks
    LEFT JOIN tabEmp_KRA_CT ek ON ek.parent = eks.name
    LEFT JOIN  `tabBranch_Master` bm ON bm.name = eks.branch
    LEFT JOIN tabEmp_Mst em ON em.name = eks.emp_code
    WHERE em.curent = 1 
)SELECT 
    t1.*,
    SUM(t1.Achieve_Score) OVER (
        PARTITION BY t1.Emp_Code, t1.KRA_Mon
    ) AS Total_Achieve_Score
FROM tab1 t1 ''',as_dict=True)
    return res

#Report- Emp KRA Performance Report 006 not in sj management
@frappe.whitelist()
def Get_Empcode(username):
    res = frappe.db.sql(""" select sam_emp_code  from tabUserOptions tuo where username =%s;""",username,as_dict=1)
    return res

@frappe.whitelist()
def Emp_KRA_Performance_Report_R002_1(ec):
    res = frappe.db.sql(''' with tab1 as(
  SELECT
    eks.emp_code as Emp_Code,
    em.emp_name as Emp_Name,
    bm.branch_short_name as Branch,
    ek.kra_mon as KRA_Mon,
    eks.counter ,
    ek.kra as KRA,
    ek.weightage as Weightage,
    ek.target as Target,
    ek.achieve_target as Achiev_Target,
    (case when ek.achieve_target <= ek.target then ((((ek.achieve_target/ek.target)*100)*10/100)*ek.weightage/100) 
         when ek.achieve_target > ek.target then ((((ek.achieve_target/ek.achieve_target)*100)*10/100)*ek.weightage/100) else 0 end)
    as Achieve_Score
--     SUM((((ek.achieve_target/ek.target)*100)*10/100)*ek.weightage/100) OVER (PARTITION BY eks.emp_code, ek.kra_mon) as Total_Achieve_Score
    FROM tabEmployee_KRA_System eks
    LEFT JOIN tabEmp_KRA_CT ek ON ek.parent = eks.name
    LEFT JOIN  `tabBranch_Master` bm ON bm.name = eks.branch
    LEFT JOIN tabEmp_Mst em ON em.name = eks.emp_code
    WHERE eks.emp_code = %s
)SELECT 
    t1.*,
    SUM(t1.Achieve_Score) OVER (
        PARTITION BY t1.Emp_Code, t1.KRA_Mon
    ) AS Total_Achieve_Score
FROM tab1 t1''',ec,as_dict=True)
    return res
#KRA Performance Report

#StockReport_R001
@frappe.whitelist(allow_guest=True)
def SalesmenSales_R002(sd,ed,branch):
    con = connect()
    cursor=con.cursor()
    qry = '''SET NOCOUNT ON;
        SET TRANSACTION ISOLATION LEVEL READ UnCommitted;
        Declare @F as date= (?)
        Declare @T as date= (?)
        Declare @branch int= (?)
        select
    CASE 
    WHEN bm.BranchName = 'VALSAD BR.- SHAH VIRCHAND' THEN 'VALSAD BRANCH'
            WHEN bm.BranchName = 'VAPI BR.- SHAH VIRCHAND G' THEN 'VAPI BRANCH'
            WHEN bm.BranchName = 'SURAT BR.- SHAH VIRCHAND' THEN 'SURAT BRANCH'
            ELSE bm.BranchName
        END AS BranchName
,smm.SalesManName
,im.TradName
,(sum(case when sp.VouType='SL' then sp.NetWt else 0 end)-sum(case when sp.voutype='SRT' then sp.NetWt else 0 end))SLNetwt
,(sum(case when sp.VouType='SL' then sp.DiamondWt else 0 end)-sum(case when sp.voutype='SRT' then sp.DiamondWt else 0 end))SlDiawt
,(sum(case when sp.VouType='SL' then (sp.TaxableAmt-sp.LabourDisAmt) else 0 end)-sum(case when sp.VouType='SRT' then (sp.TaxableAmt-sp.LabourDisAmt) else 0 end))SlAmount
from sptran sp
  left join itemtradmst im on im.itemtradmstid = sp.itemtradmstid
  left join branchmaster bm on sp.BranchID = bm.BranchID
  left join SalesManMst smm on smm.SalesManMstID = sp.SalesManID
  where sp.VouDate between @F and @T
    and sp.VouType in ('SL','SRT')
    and case when @Branch = 0 then 1 when @Branch = sp.BranchID then 1 else 0 end =1
    group by bm.BranchName , smm.SalesManName , im.TradName;

         '''
    values = (sd,ed,branch)
    cursor.execute(qry,(values))
    res = cursor.fetchall()
    data = []
    columnNames = [column[0] for column in cursor.description]
    for record in res:
        data.append( dict( zip( columnNames , record ) ) )
        # data.append( list(record) )
    # # print(data)
    # conn.close()
    return data
# StockReport_R001('22-apr-2023','22-apr-2023',0)

#StockReport_R001
@frappe.whitelist(allow_guest=True)
def labelno(labelno):
    con = connect()
    cursor = con.cursor()
    qry = '''
        DECLARE @labelno AS VARCHAR(50) = (?);
        SELECT REPLACE(LTRIM(RTRIM(lb.LabelNo)), ' ', '') AS LabelNo, lb.LabourPer 
        FROM LabelBalance lb 
        WHERE REPLACE(LTRIM(RTRIM(lb.LabelNo)), ' ', '') = REPLACE(LTRIM(RTRIM(@labelno)), ' ', '')
    '''
    values = (labelno,)
    cursor.execute(qry, values)
    res = cursor.fetchall()
    data = []
    columnNames = [column[0] for column in cursor.description]
    for record in res:
        data.append(dict(zip(columnNames, record)))
    return data

# StockReport_R001('22-apr-2023','22-apr-2023',0)

@frappe.whitelist()
def Get_Data_From_FSJ_Customer_CT(parent):
    res = frappe.db.sql("""    select tvco.name ,tvddc.parent ,tvddc.dia_shape,tvddc.dia_weight,tvddc.dia_pcs from tabVG_Diamond_Details_CT tvddc 
   left join tabVG_Customer_Order tvco on tvco.name =tvddc.parent 
   where parent =%s""",parent,as_dict=1)
    return res

@frappe.whitelist()
def Get_Data_From_VG_Billing(name):
    res = frappe.db.sql("""  SELECT tvbo.amount,tvbo.ref_by,tvbo.rate_apply_of,gold_rate_pgrm,design_code from tabVG_Customer_Order tvco 
   left join tabVG_Billing_Order tvbo on tvbo.order_no = tvco.name 
   where tvco.name = %s """,name,as_dict=1)
    return res

@frappe.whitelist()
def Get_Item_Name(name):
    res = frappe.db.sql("""  SELECT name,item_name from tabItem_Master tim WHERE tim.name = %s """,name,as_dict=1)
    return res

import frappe
import requests
from urllib.parse import quote

@frappe.whitelist()
def send_single_order_message(name, contact_number=None):
    if not name:
        return "No order ID provided."

    res = frappe.db.sql("""
        SELECT 
            tbm.branch_short_name,
            tvco.cust_name,
            tvco.name AS order_number,
            tmm.metal_type,
            tim.item_name,
            tvco.jew_type,
            tvco.gold_colr,
            tvco.delivery_date,
            tvcd.mobile_no
        FROM tabVG_Customer_Order tvco 
        LEFT JOIN tabVG_Customer_Details tvcd ON tvcd.name = tvco.contact_number 
        LEFT JOIN tabBranch_Master tbm ON tbm.name = tvco.branch_name 
        LEFT JOIN tabItem_Trad_Mst tmm ON tmm.name = tvco.gold_karat 
        LEFT JOIN tabItem_Master tim ON tim.name = tvco.prod_name 
        WHERE tvco.name = %s
    """, (name,), as_dict=True)

    if not res:
        return f"No order found with ID {name}"

    data = res[0]

    # Check if mobile_no is present
    if not data.get('mobile_no'):
        return "Customer mobile number not found."

    message = f"""*Order Placed : {data['branch_short_name']}*

Hello Mr./Ms. *{data['cust_name']}*,

Your order has been placed but is currently on hold until the advance payment is received.  
Please find the order details below:  

*Order Number:* {data['order_number']}  
*Jewellery Type:* {data['jew_type']}  
*Metal:* {data['metal_type']}  
*Product Name:* {data['item_name']}  
*Colour:* {data['gold_colr']}  
*Estimated Delivery Date:* {data['delivery_date']}  

We are preparing your order and will notify you once it is ready.  

*Regards,*  
*Virchand Govanji Jewellers*  
_(Disclaimer: Design & weight are subject to variation.)_  
📞 For any order-related inquiries, please call us at *02632229999*.
"""

    encoded_message = quote(message)

    url = (
        f"https://hisocial.in/api/send?"
        f"number=91{data['mobile_no']}&"
        f"type=text&"
        f"message={encoded_message}&"
        f"instance_id=66DC400623B21&"
        f"access_token=664f17f29ab6d"
    )

    headers = {
        'Cookie': 'stackpost_session=po1urvhfok6e8er2eja57mkbpu00chci'
    }

    response = requests.post(url, headers=headers)
    frappe.logger().info(f"Order message sent to {data['mobile_no']} for order {data['order_number']}: {response.text}")

    return "WhatsApp message sent successfully."


import frappe
from urllib.parse import quote
import requests
from frappe import _

@frappe.whitelist()
def send_billing_order_status_message(order_no, ord_status):
    # Fetch customer name and mobile number from VG_Billing_Order and VG_Customer_Details
    res = frappe.db.sql("""
        SELECT 
            tvbo.cust_name,
            tvcd.mobile_no
        FROM tabVG_Billing_Order tvbo
        LEFT JOIN tabVG_Customer_Details tvcd ON tvcd.name = tvbo.cust_num
        WHERE tvbo.order_no = %s
    """, (order_no,), as_dict=True)

    # Check if result exists
    if not res:
        return {"status": "error", "message": f"No order found with ID {order_no}"}

    data = res[0]
    customer_name = data.get("cust_name") or "Customer"
    mobile = data.get("mobile_no")

    # Check if mobile number is present
    if not mobile:
        return {"status": "error", "message": f"Customer mobile number not found for order {order_no}"}

    # Compose message based on order status
    if ord_status == "Hold":
        message = f"Mr./Ms {customer_name},\nYour order number {order_no} has been put on hold due to insufficient payment. Please complete the remaining payment so we can process your order at the earliest.\nRegards,\nShah Virchand Govanji Pvt. Ltd."
    elif ord_status == "Resume":
        message = f"Mr./Ms {customer_name},\nYour order has been resumed. Your Order No. {order_no} is being processed.\nThank You!\nRegards,\nShah Virchand Govanji Pvt. Ltd."
    else:
        return {"status": "error", "message": "Invalid order status. Use 'Hold' or 'Resume'."}

    # Encode and send via WhatsApp API
    encoded_message = quote(message)
    url = (
        f"https://hisocial.in/api/send?"
        f"number=91{mobile}&"
        f"type=text&"
        f"message={encoded_message}&"
        f"instance_id=66DC400623B21&"
        f"access_token=664f17f29ab6d"
    )

    headers = {
        'Cookie': 'stackpost_session=po1urvhfok6e8er2eja57mkbpu00chci'
    }

    # Send POST request to WhatsApp API
    response = requests.post(url, headers=headers)

    # Log the API response
    frappe.logger().info(f"WhatsApp message sent to {mobile} for order {order_no}: {response.text}")

    return {
        "status": "success",
        "message": message,
        "mobile": mobile,
        "api_response": response.text
    }


# @frappe.whitelist(allow_guest=True)
# def send_whatsapp_message_Supplier(doc_type, doc_name, print_formate_name, supplier_code):
#     # Step 1: Get order_no (which is treated as mobile number) from Supplier Master
#     order1 = frappe.db.get_value("Supplier_Master", {"name": supplier_code}, "order1")

#     if not order1:
#         return {"status": "error", "message": f"No order_no found for supplier: {supplier_code}"}

#     # Step 2: Generate PDF file link
#     file_link = get_save_file_url1(doc_type, doc_name, print_formate_name)

#     # Step 3: Compose WhatsApp URL
#     message = ""
#     encoded_message = urllib.parse.quote(message)
#     url = (
#         f"https://hisocial.in/api/send?"
#         f"number=91{order1}&type=&message={encoded_message}&media_url={file_link}"
#         f"&instance_id=685A3F58EEA7D&access_token=6807a1a3a7c23"
#     )


#     headers = {
#         'Cookie': 'stackpost_session=ol29tls9jvo8cmvhckv5cje0h8dm4u1q'
#     }

#     # Step 4: Send WhatsApp
#     response = requests.post(url, headers=headers, data={})
#     return response.json()

# @frappe.whitelist(allow_guest=True)
# def get_save_file_url1(doc_type,doc_name,print_formate_name):


# 	# http://10.10.10.165:8004/api/method/samarthjewellery.samarthjewellery.SJ_api.get_save_file_url?doc_type=SJ Order&doc_name=090300107&print_formate_name=Standard

# 	frappe.set_user("Administrator") # Change user with having file write permission.
# 	soDetail = frappe.get_all(doc_type, filters=[[doc_type,"name","=",doc_name],
# 												# [doc_type,"status","!=",'Cancelled'],
# 												], fields=['name'])

# 	if len(soDetail)!=0:

# 		file_name = "{name}.pdf".format(name=doc_name)
# 		folder_name = "VG Vendor Details" #Folder name in site public folder


# 		public_path = frappe.utils.get_bench_path()+ "/sites/" + frappe.utils.get_path('public', folder_name, file_name)[2:]

# 		file_path = save_pdf1(doc_type,doc_name,public_path,print_formate_name,0)

# 		return "{}{}/{}".format(frappe.request.host_url,folder_name,file_name)

# def save_pdf1(doc_type, doc_name, file_path, format=None, doc=None, no_letterhead=0):

# 	output = PdfFileWriter()

# 	pdf_options = {
# 		"enable-local-file-access": ""
# 	}

# 	output = frappe.get_print(doc_type, doc_name, format, as_pdf = True, output = output)

# 	output.write(open(file_path,"wb"))

# 	return file_path

@frappe.whitelist(allow_guest=True)
def Non_Jewellery_Inventory_Report_R005():
    res = frappe.db.sql("""
SELECT
tnjicm.item_cate AS Item_Category
,tnjim.item_name AS Item_Name
,tbm.branch_short_name AS Branch_Name
,COALESCE(SUM(CASE WHEN tionji.`inout` = 'inward' THEN tionji.quantity ELSE -tionji.quantity END), 0) AS Available_Stock
,COALESCE(rnjsm.min_quantity, 0) AS Min_Quantity
,COALESCE(rnjsm.max_quantity, 0) as Max_Quantity
,CASE WHEN rnjsm.min_quantity IS NULL THEN 0 ELSE COALESCE(SUM(CASE WHEN tionji.`inout` = 'inward' THEN tionji.quantity ELSE -tionji.quantity END), 0) - rnjsm.min_quantity END AS Reorder_Stock
FROM `tabVG_In_Out_Non_Jewellery_Item` tionji
LEFT JOIN `tabVG_Non_Jewellery_Item_Category_Master` tnjicm ON tnjicm.name = tionji.item_category
LEFT JOIN `tabVG_Non_Jewellery_Item_Master` tnjim ON tnjim.name = tionji.item_name
LEFT JOIN `tabBranch_Master` tbm ON tbm.name = tionji.branch_name
LEFT JOIN `tabVG_Reorder_Non_Jewellery_Stock_Master` rnjsm ON rnjsm.item_category = tionji.item_category AND rnjsm.item_name = tionji.item_name and rnjsm.branch_name = tionji.branch_name
GROUP BY
   tnjicm.item_cate,
   tnjim.item_name,
   tbm.branch_name,
   rnjsm.min_quantity
  """,as_dict=1)
    return res

@frappe.whitelist()
def Get_Data_From_Billing_Order(order_no):
    res = frappe.db.sql(""" SELECT order_no from tabVG_Billing_Order tvbo 
   where order_no =%s""",order_no,as_dict=1)
    return res


@frappe.whitelist(allow_guest=True)
def SJ_GP_020(item_name, net_wt_from = 1.00, net_wt_to = 5.00, branch = 0):
 
    db_name = frappe.get_conf().db_name
    db_password = frappe.get_conf().db_password
    conn_string = f"mysql+pymysql://{db_name}:{db_password}@127.0.0.1:3306/{db_name}"
    engine = create_engine(conn_string)
 
    # cursor=conn.cursor()
    con = connect()
    cursor=con.cursor()
 
    qry = f"""
    DECLARE @ItemName VARCHAR(50) = (?);
    DECLARE @F DECIMAL(10,2) = (?);
    DECLARE @T DECIMAL(10,2) = (?);
    DECLARE @branch INT = (?);
    SELECT
        itm.TradName,
        im.ItemName,
        REPLACE(lb.LabelNo, ' ', '') AS LabelNo,
        lb.NetWt,
        lc.VarietyMstId as Varietymstid,
        vm.VarietyName,
    CASE 
        WHEN lb.BranchID = '6' THEN 'VALSAD'  
        WHEN lb.BranchID = '7' THEN 'VAPI'  
        WHEN lb.BranchID = '8' THEN 'SURAT' 
        WHEN lb.BranchID = '9' THEN 'HO BRANCH' 
    END AS Branch_Name
    FROM LabelBalance lb
    LEFT JOIN BranchMaster bm ON bm.BranchID = lb.BranchID
    LEFT JOIN ItemMst im ON im.ItemMstID = lb.ItemMstID
    LEFT JOIN ItemTradMst itm ON itm.ItemTradMstID = lb.ItemTradMstId
    LEFT JOIN labelcreationtrans lc ON lc.UniqueLabelID = lb.UniqueLabelID
    LEFT JOIN VarietyMst vm ON vm.VarietyMstId = lc.VarietyMstId
    WHERE im.ItemName = @ItemName AND lb.NetWt BETWEEN @F AND @T and case when @Branch = 0 then 1 when @Branch = lb.BranchID then 1 else 0 end =1
    
 
"""
    values = (item_name, net_wt_from, net_wt_to, branch)
    cursor.execute(qry, values)
    res = cursor.fetchall()
 
    col_names = [desc[0] for desc in cursor.description]
 
    # Build a list of dictionaries for each row
    result = [dict(zip(col_names, row)) for row in res]
 
    con.close()
 
    shared_path = r'\\192.168.1.5/f/OrnNx Image'
    username='Administrator'
    pwd='New#valsad$'
    mount_command = ["sudo", "mount", "-t", "cifs", shared_path, "/mnt/shared_drive","-o", f"username={username},password={pwd}" ]
    extensions=("*.jpg", "*.jpeg", "*.png", "*.gif", "*.bmp", "*.tiff")
    mount_dir = "/mnt/shared_drive"

    smbclient.ClientConfig(username=username, password=pwd)
    smb_folder = f"{shared_path}"

    # frappe.msgprint(result)

    if not os.path.ismount(mount_dir):
        os.makedirs(mount_dir, exist_ok=True)
        # processResult = subprocess.run(mount_command, shell=True, capture_output=True, text=True)
        # if processResult.returncode != 0:
        #     raise RuntimeError(f"Failed to mount shared drive: {processResult.stderr}")
        print("Connected to Shared Drive")

    # ✅ Validate Shared Path
    if not os.path.exists(mount_dir):
        raise FileNotFoundError(f"Shared path '{shared_path}' not found after authentication.")

    # ✅ Attach images to each item in result
    # frappe.msgprint(result)
    local_file_dir = frappe.get_site_path("public", "Images")
    os.makedirs(local_file_dir, exist_ok=True)
    for item in result:
        item_name = item.get('ItemName')
        label = item.get('LabelNo')

        if item_name:
            item_folder_path = f"{smb_folder}/{item_name}"

            try:
                # ✅ List image files for the given item
                all_remote_product_image_files = smbclient.listdir(item_folder_path)

                # frappe.msgprint(all_product_image_files)
                for file in all_remote_product_image_files:
                    file_name = os.path.splitext(file)[0]

                    label_name = label.replace("/", "_")


                    if label_name == file_name:

                        # ✅ Download the file locally
                        smb_file_path = f"{item_folder_path}/{file}"
                        
                        local_file_path = os.path.join(local_file_dir, file)

                        exists = verify_file_exists_in_local_path(file)

                        if exists:
                            print("File {file} exists in local path")
                            relative_path = local_file_path.split("public/", 1)[-1]
                            item["Image"] = f"/{relative_path}"

                        else:
                            print(f"Fetching {file} from server")
                            with smbclient.open_file(smb_file_path, mode="rb") as remote_file:
                                # frappe.msgprint("Opening file" + smb_file_path)
                                file_data = remote_file.read()
                                # frappe.msgprint(smb_file_path)
                                if not file_data:
                                    frappe.msgprint("No file to read")
                                with open(local_file_path, "wb") as local_file:
                                    local_file.write(file_data)

                                relative_path = local_file_path.split("public/", 1)[-1]
                                item["Image"] = f"/{relative_path}"

            except Exception as e:
                print(f"⚠️ Error accessing images for {item_name}: {e}")        
    
    return result


def verify_file_exists_in_local_path(file_name):
    """
    Check if file exists in local images folder
    """
    path = frappe.get_site_path("public", "images")

    try:
        files = os.listdir(path)
        return file_name in files

    except FileNotFoundError:
        # frappe.msgprint(f"Directory {path} does not exist.")
        return False    


# Goal To-Do Api
# Define and execute the function
@frappe.whitelist(allow_guest=True)
def empcode_userid(sam_emp_code):
	data = frappe.db.sql('''select username, is_global, sam_emp_code, is_active from tabUserOptions where sam_emp_code = %s;''', sam_emp_code, as_dict=True)
	return data


# Doctype- Todo ---> Employee group member fetch by group name
# Dipesh
@frappe.whitelist(allow_guest=True)
def fetch_emp_group_member_for_todo(emp_group):
	res = frappe.db.sql(""" 
	Select egm.group_name,egc.emp_code 
	from tabEmployee_Group_Mst egm
	inner join tabEmployee_Group_CT egc ON egm.name = egc.parent where egm.name = %s;
	""",emp_group,as_dict=1)
	return res


# Doctype- Goal Todo ----> for recursive find parent todo
@frappe.whitelist(allow_guest=True)
def Set_Base_Parent(name):
	res=frappe.db.sql('''call Check_Base_Parent(%s);''',values=(name),as_dict=1)
	frappe.db.commit()
	return res


# Doctype- Goal Todo ----> for find project todo set or not
@frappe.whitelist(allow_guest=True)
def Check_Base_Parent(name):
	res=frappe.db.sql('''select project_todo from tabGoal_ToDo tgtd where name =%s;''',values=(name),as_dict=1)
	return res


@frappe.whitelist(allow_guest=True)
def username_to_empcode(username):
	data = frappe.db.sql('''select sam_emp_code, username, is_active, is_global 
	from tabUserOptions tuo where is_active = 1 and username = %s;''', username, as_dict=True)
	return data


@frappe.whitelist()
def section_data(section_code):
	# data = frappe.db.get_value('Section_Mst',section_code,['section','section_code'], as_dict=1)
	data=frappe.db.sql(''' call sp0171_section_data(%(p_section_code)s)''',values={'p_section_code':section_code},as_dict=1)[0]
	return data


@frappe.whitelist()
def todogrp_data(name):
	# data = frappe.db.get_value('ToDo Group',name,['todo_group','name'], as_dict=1)
	data = frappe.db.sql(''' call sp0173_todogrp_data(%(p_name)s)''',values={'p_name':name},as_dict=1)[0]
	return data


@frappe.whitelist()
def meeting_data(name):
	# data = frappe.db.get_value('Meeting',name,['meet_title','name'], as_dict=1)
	data = frappe.db.sql(''' call sp0174_meeting_data(%(p_name)s)''',values={'p_name':name},as_dict=1)[0]
	return data

@frappe.whitelist()
def get_current_user():
    return frappe.session.user

@frappe.whitelist()
def emp_code_from_username():
    username = get_current_user()

    emp_code_dict = frappe.db.get_all(
        "UserOptions",
        filters={"username": username},
        fields=["username", "sam_emp_code"]  # Replace with correct fieldname
    )

    if not emp_code_dict:
        frappe.throw("User not found in UserOptions")

    emp_code = emp_code_dict[0].get("sam_emp_code")

    if not emp_code or str(emp_code).strip() in ['0', '']:
        frappe.throw("Emp_Code not defined in UserOptions")

    return emp_code

import requests
import json
@frappe.whitelist()
def send_whatsapp_from_fb(template_name, to, body_variable, header_variable=None):
    return
    if header_variable is None:
        header_variable = []

    payload = {
        "template_name": template_name,
        "to": to,
        "body_variable": body_variable,
        "header_variable": header_variable
    }

    try:
        response = requests.post(
            "https://vgjewel.in/webhook/send_whatsapp.php",
            headers={"Content-Type": "application/json"},
            data=json.dumps(payload)
        )

        # Optional: return or log response
        frappe.msgprint(str(response))
        return response.text

    except requests.exceptions.RequestException as e:
        # Handle any network exceptions
        frappe.msgprint(f"WhatsApp API call failed: {str(e)}")
        frappe.log_error(f"WhatsApp API call failed: {str(e)}")
        return None


@frappe.whitelist()
def send_textwhatsapp_using_hisocial(account, no, msg):
    account_map = {
        "repairing": "66DC400623B21",
        "diamond": "66DEB38B00AD5",
        "gold_valsad_vapi": "66DC2982088A9",
        "gold_surat": "66ED5919BF6AC"
    }

    url = "https://hisocial.in/api/send"
    no="919273446652"
    payload = {
        "number": no,
        "type": "test",
        "message": msg,
        "instance_id": account_map.get(account),
        "access_token": "664f17f29ab6d"
    }

    response = requests.post(url, data=payload)

    # Optional: check response
    if response.status_code == 200:
        print("Message sent successfully")
    else:
        print(f"Failed to send: {response.status_code}, {response.text}")

import frappe
import base64
import os
import uuid

@frappe.whitelist()
def attach_file(filename, filedata, doctype, docname, is_private=0):
    if "," in filedata:
        header, encoded = filedata.split(",", 1)
    else:
        frappe.throw("Invalid file data")

    # Decode base64 content
    file_content = base64.b64decode(encoded)

    # Ensure filename is safe and unique
    ext = filename.split('.')[-1].lower()
    unique_name = f"{uuid.uuid4()}.{ext}"
    #file_path = os.path.join(frappe.get_site_path("public", "files","edited_label_image"), unique_name)
    
    folder_path = os.path.join(frappe.get_site_path("public", "files", "edited_label_image"))
    os.makedirs(folder_path, exist_ok=True)
    file_path = os.path.join(folder_path, unique_name)

    # Save to disk
    with open(file_path, "wb") as f:
        f.write(file_content)

    # Create File doc to register in Frappe (optional but good practice)
    file_doc = frappe.get_doc({
        "doctype": "File",
        "file_name": filename,
        "file_url": f"/files/edited_label_image/{unique_name}",
        "is_private": 0
    }).insert(ignore_permissions=True)

    return {
        "file_url": file_doc.file_url,
        "file_name": file_doc.file_name
    }


from datetime import date
@frappe.whitelist()
def get_gold_rate(gold_karat):
    gold_karat_value =  frappe.db.get_value("Item_Trad_Mst",gold_karat, "metal_type")
    today = date.today().strftime("%Y-%m-%d")
    con = connect()
    cursor=con.cursor()
    qry ='''
        SELECT trm.SalesRate as rate  from TodayRateMst
AS trm  left join ItemTradMst
as i on i.ItemTradMstID = trm.ItemTradMstID where i.TradName =? 
and trm.TDate =?
    '''
    values = (gold_karat_value,today)
    cursor.execute(qry,(values))
    res = cursor.fetchall()
    data = []
    columnNames = [column[0] for column in cursor.description]
    for record in res:
        data.append( dict( zip( columnNames , record ) ) )
    con.close()
    return data

import urllib.parse
from datetime import datetime
@frappe.whitelist()
def get_image(label_number):
    new_old_name_map = {
        "DIAMOND TOPS 18DIA": {"name": "DIAMOND TOPS", "date": "2024-04-15 00:00:00"},
        "DIAMOND SET 18DIA": {"name": "DIAMOND SET", "date": "2024-04-20 00:00:00"},
        "DIAMOND RING 18DIA": {"name": "DIAMOND RING", "date": "2024-04-15 00:00:00"},
        "DIAMOND PENDANT 18DIA": {"name": "DIAMOND PENDANT", "date": "2024-04-19 00:00:00"},
        "DIAMOND P.SET 18DIA": {"name": "DIAMOND P.SET", "date": "2024-04-18 00:00:00"},
        "DIAMOND MISCELLANEOUS 18DIA": {"name": "DIAMOND MISCELLANEOUS", "date": "2024-07-10 00:00:00"},
        "DIAMOND MANGALSUTRA 18DIA": {"name": "DIAMOND MANGALSUTRA", "date": "2024-04-22 00:00:00"},
        "DIAMOND CHAIN 18DIA": {"name": "DIAMOND CHAIN", "date": "2024-04-22 00:00:00"},
        "DIAMOND BRACELET 18DIA": {"name": "DIAMOND BRACELET", "date": "2024-04-20 00:00:00"},
        "DIAMOND BANGLES 18DIA": {"name": "DIAMOND BANGLES", "date": "2024-04-16 00:00:00"},
        "DIAMOND TANMANIA 18DIA": {"name": "DIAMOND TANMANIA", "date": "2024-04-20 00:00:00"},
        "DIAMOND BALI 18DIA": {"name": "DIAMOND BALI", "date": "2024-04-20 00:00:00"},
        "D.M.S-18KT": {"name": "D.M.S-18", "date": "2024-04-25 00:00:00"},
        "VILANDI BRACELET 18DIA": {"name": "VILLANDI BRACELET-18DIA", "date": "2024-04-25 00:00:00"},
    }
    #image_server_url="http://103.249.120.178:51"
    image_server_url="http://192.168.1.5:51"
    each_label_number = label_number.split("/");
    if len(each_label_number)<2:
        return "No image found"
    first_part=each_label_number[0].strip();
    second_part=each_label_number[1].strip();
    con = connect()
    cursor=con.cursor()
    qry = '''SELECT Top(1) ImagePath1,VouDate,LabourPer,ItemMstID  FROM LabelTransaction where LabelNo  like ? and LabelNo like ?
    '''
    values = (first_part+'%','%'+second_part)
    cursor.execute(qry, values)
    res = cursor.fetchall()
    col_names = [desc[0] for desc in cursor.description]
    result = [dict(zip(col_names, row)) for row in res]
    img_qry='''SELECT Top(1) Itemname from ItemMst where ItemMstID=? '''
    img_values=(result[0]["ItemMstID"])
    cursor.execute(img_qry,img_values);
    img_res=cursor.fetchall()
    img_col_names=[desc[0] for desc in cursor.description]
    img_result=[dict(zip(img_col_names, row)) for row in img_res]
    con.close()
    img = os.path.basename(result[0]["ImagePath1"]).split("\\")[-1]
    itemName=img_result[0]["Itemname"];
    itemName1 = urllib.parse.quote(itemName)
    imgPath1=result[0]["ImagePath1"]
    #url = f"{image_server_url}/{itemName1}/{img}"
    url = f"{image_server_url}/{imgPath1}"

    LabelOrgDate=result[0]["VouDate"]
    if itemName in new_old_name_map and False:
        # Convert string dates to datetime objects
        label_date = datetime.strptime(LabelOrgDate, "%Y-%m-%d %H:%M:%S")
        map_date = datetime.strptime(new_old_name_map[itemName]["date"], "%Y-%m-%d %H:%M:%S")

        if label_date < map_date:
            new_path = new_old_name_map[itemName]["name"]
            new_path_encoded = urllib.parse.quote(new_path)
            url = f"{image_server_url}/{new_path_encoded}/{img}"
    result_url = save_image_from_url(url, 'label_image')            
    return {"url": result_url["full_url"],"labour":result[0]["LabourPer"]}

def save_image_from_url(image_url, folder_name="labels"):
    import os, requests
    from urllib.parse import urlparse
    from frappe.utils import get_url

    # Fetch image
    response = requests.get(image_url, stream=True, timeout=100)
    if response.status_code != 200:
        frappe.throw(f"Failed to fetch image. Status: {response.status_code}")

    # Get filename
    #parsed = urlparse(image_url)
    #filename = os.path.basename(parsed.path) or "downloaded.jpg"
    path = image_url.replace("\\", "/")

    filename = path.split("/")[-1]

    # Save to public/files/folder_name/
    folder_path = os.path.join(frappe.get_site_path("public", "files", folder_name))
    os.makedirs(folder_path, exist_ok=True)
    file_path = os.path.join(folder_path, filename)

    # Save file
    with open(file_path, "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            if chunk:
                f.write(chunk)

    relative_url = f"/files/{folder_name}/{filename}"
    full_url = get_url(relative_url)

    return {
        "file_path": file_path,
        "file_url": relative_url,
        "full_url": full_url
    }


@frappe.whitelist()
def open_image_modal(image_url):
    frappe.msgprint(f'''
        <div style="text-align:center">
            <img src="{image_url}" style="max-width:100%; max-height:80vh; border:1px solid #ccc" />
        </div>
    ''', title="Image Viewer", wide=True)


import frappe
import requests

@frappe.whitelist(allow_guest=True)
def proxy_image(url):
    if not url:
        frappe.throw("No URL provided")

    try:
        response = requests.get(url, stream=True, timeout=10)
        response.raise_for_status()
    except Exception as e:
        frappe.throw(f"Unable to fetch image: {e}")

    # Set Frappe response for file download
    frappe.local.response.filename = url.split("/")[-1]
    frappe.local.response.filecontent = response.content
    #frappe.local.response.type = "download"

    # Manually set Content-Type header
    frappe.local.response.headers = {
        "Content-Type": response.headers.get("Content-Type", "image/jpeg")
    }
    
@frappe.whitelist()
def send_order_delivery_msg(name):
    doc = frappe.get_doc("VG_Customer_Order",name)
    cust_name=doc.cust_name
    customer_name = cust_name.title()
    mobile_link=str(doc.contact_number)
    mobile = frappe.db.get_value("VG_Customer_Details",mobile_link, "mobile_no")
    jewellery_type=doc.jew_type
    jew_type = jewellery_type.title()
    branch=doc.branch_name
    branch_text= frappe.db.get_value("Branch_Master",branch,"branch_short_name");
    product_name=frappe.db.get_value("Item_Master", doc.prod_name, "item_name")
    multiple_template_id='send_order_delivery_vapi_valsad_diamond_surat_new'
    single_template_id='single_order_delivery_valsad_vapi_diam_surat_new'
    customer_care = "02632229999"
    if jew_type.lower() == "gold":
        admin_no = "9512123883"
        if branch_text == "SURAT":
            admin_no = "9512127779"
            customer_care = "9512100886"
            multiple_template_id='send_order_delivery_gold_surat_new'
            single_template_id='single_order_delivery_gold_surat_new'
    else:
        admin_no = "6352976423"
        customer_care = "02632229999"
    country =  frappe.db.get_value("VG_Customer_Details",mobile_link, "country_reside")
    country_code=frappe.db.get_value("Country",country, "custom_dial_code")
    alter_country =  frappe.db.get_value("VG_Customer_Details",mobile_link, "alternate_no_country")
    alternate_country_code=frappe.db.get_value("Country",alter_country, "custom_dial_code")
    customer_to_array = [country_code + str(mobile)] if mobile else []
    if doc.alt_number and doc.alt_number and doc.alt_number is not None and alternate_country_code is not None:
        customer_to_array.append(alternate_country_code + str(doc.alt_number))
    all_doc=frappe.get_list("VG_Customer_Order",
                            filters={"contact_number":['=',mobile_link],"order_status":['not in',['Delivered','Deleted']]},
                            fields=["prod_name","order_status","name"])
    if len(all_doc)==1:
        for cta in customer_to_array:
            send_whatsapp_from_fb(template_name=single_template_id,to=cta,body_variable=[cust_name,name,product_name.title(),branch_text,customer_care])
        doc.message_counter=doc.message_counter+1;
        doc.save()
        frappe.msgprint("Whatsapp msg send successfully.")
        return "Whatsapp send successfully.";
    elif len(all_doc)>1:
        ready_for_delivered=0
        ready_order_string1=""
        pending_order=0
        pending_order_string_array=[]
        for ad in all_doc:
            o_status=ad.order_status
            o_id=ad.name
            pid=ad.prod_name
            o_product_name=frappe.db.get_value("Item_Master", pid, "item_name")
            if o_status=="At Counter":
                ready_for_delivered+=1
                ready_order_string1 += f"Your Order no {o_id}  Product Name : {o_product_name} "
            else:
                pending_order_string_array.append(o_id)
                pending_order += 1
        pending_ord_msg = "."
        total_order = len(all_doc)
        if len(pending_order_string_array) > 0:
            pending_order_string = ",".join(str(x) for x in pending_order_string_array)
            pending_ord_msg = f" However your order no {pending_order_string} still under process."
        for cta in customer_to_array:
            send_whatsapp_from_fb(template_name=multiple_template_id,to=cta,body_variable=[cust_name,ready_order_string1,pending_ord_msg,total_order,ready_for_delivered,pending_order,branch_text,customer_care])
        doc.message_counter=doc.message_counter+1;
        doc.save()
        frappe.msgprint("Whatsapp msg send successfully.")
        return "Whatsapp send successfully.";    
    

 

        
