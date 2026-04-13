import frappe
import pyodbc
import os
import pymysql
from datetime import date
from decimal import Decimal
from frappe.utils.logger import get_logger
import re
from datetime import datetime, timedelta
import requests
from frappe.utils import today

value_valsad = os.getenv('valsadodbc')
value_vapi = os.getenv('vapiodbc')
value_surat = os.getenv('suratodbc')
def connect_valsad():
    conn = pyodbc.connect(value_valsad,autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION,pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn

def connect_vapi():
    conn = pyodbc.connect(value_vapi,autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION,pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn

def connect_surat():
    conn = pyodbc.connect(value_surat,autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION,pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn

value = os.getenv('sjodbc')
def connect():
    conn = pyodbc.connect(value,autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION,pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn

@frappe.whitelist(allow_guest=True)
def get_data(from_date, to_date):
    from_date="2026-04-12"
    to_date="2026-04-12"
    con_val = connect_valsad()
    cursor_val= con_val.cursor()
    current_date_str = date.today()
    current_date = current_date_str.strftime("%Y-%m-%d")
    rate_qry=""" select Top(2) trm.ItemTradMstID,trm.PurRate ,trm.SalesRate  from dbo.TodayRateMst trm where trm.ItemTradMstID in(1001,4001)
and trm.TDate = ? """
    val_values = (current_date)
    cursor_val.execute(rate_qry,(val_values))
    res_val = cursor_val.fetchall()
    data_val = []
    columnNames_val = [column[0] for column in cursor_val.description]
    gold_rate=0
    silver_rate=0
    for record in res_val:
        data_val.append( dict( zip( columnNames_val , record ) ) )
    for d in data_val:
        if d["ItemTradMstID"]==1001:
            gold_rate= format_indian_number_no_decimal(d["PurRate"]/10)
        elif d["ItemTradMstID"]==4001:
            silver_rate= format_indian_number_no_decimal(d["PurRate"] * 100)

    cursor_val.close()
        
    all_rate_qry=""" select  trm.TDate,trm.PurRate, trm.ItemTradMstID   from dbo.TodayRateMst trm where trm.ItemTradMstID in(1001,1002,1003,1006) and trm.TDate>=? and trm.TDate <=? """
    val_values_all = (from_date,to_date)
    cursor_val_all= con_val.cursor()
    cursor_val_all.execute(all_rate_qry,(val_values_all))
    res_val_all = cursor_val_all.fetchall()
    all_date_rate =[]
    columnNames_val_all = [column[0] for column in cursor_val_all.description]
    for record_all in res_val_all:
        all_date_rate.append( dict( zip( columnNames_val_all , record_all ) ) )
    all_rates={} 
    rates_22kt={}
    rates_18kt={}
    rates_18di={}
    for d in all_date_rate:
        if d["ItemTradMstID"]==1001:
            all_rates[d["TDate"]]=d["PurRate"]/10
        if d["ItemTradMstID"]==1002:
            rates_22kt[d["TDate"]]=d["PurRate"]/10
        if d["ItemTradMstID"]==1003:
            rates_18kt[d["TDate"]]=d["PurRate"]/10
        if d["ItemTradMstID"]==1006:
            rates_18di[d["TDate"]]=d["PurRate"]/10
    cursor_val_all.close()
    con_val.close()


    con = connect()
    cursor=con.cursor()
    qry= '''
        SET NOCOUNT ON;
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;
        Declare @F as date= (?)
        Declare @T as date= (?)


SELECT
    CASE
        WHEN bm.BranchName = 'VALSAD BR.- SHAH VIRCHAND' THEN 'VALSAD BRANCH'
        WHEN bm.BranchName = 'VAPI BR.- SHAH VIRCHAND G' THEN 'VAPI BRANCH'
        WHEN bm.BranchName = 'SURAT BR.- SHAH VIRCHAND' THEN 'SURAT BRANCH'
        ELSE bm.BranchName
    END AS BranchName,

    im.TradName,
    sp.VouDate,

    (SUM(CASE WHEN sp.VouType = 'SL' THEN sp.NetWt ELSE 0 END)
     - SUM(CASE WHEN sp.VouType = 'SRT' THEN sp.NetWt ELSE 0 END)) AS SLNetwt,

    (SUM(CASE WHEN sp.VouType = 'SL' THEN sp.DiamondWt ELSE 0 END)
     - SUM(CASE WHEN sp.VouType = 'SRT' THEN sp.DiamondWt ELSE 0 END)) AS SlDiawt,

    (SUM(CASE WHEN sp.VouType = 'SL' THEN (sp.TaxableAmt - sp.DiscountAmt) ELSE 0 END)
     - SUM(CASE WHEN sp.VouType = 'SRT' THEN (sp.TaxableAmt - sp.DiscountAmt) ELSE 0 END)) AS SlAmount,

     (SUM(CASE WHEN sp.VouType = 'SL' THEN sp.MetalAmt ELSE 0 END)
     - SUM(CASE WHEN sp.VouType = 'SRT' THEN sp.MetalAmt ELSE 0 END)) AS MetalAmt,

     (SUM(CASE WHEN sp.VouType = 'SL' THEN sp.LabourAmt ELSE 0 END)
     - SUM(CASE WHEN sp.VouType = 'SRT' THEN sp.LabourAmt ELSE 0 END)) AS LabourAmt,

     (SUM(CASE WHEN sp.VouType = 'SL' THEN sp.DiscountAmt ELSE 0 END)
     - SUM(CASE WHEN sp.VouType = 'SRT' THEN sp.DiscountAmt ELSE 0 END)) AS SlDiscount,

    SUM(CASE WHEN sp.VouType = 'PUR' THEN sp.NetWt ELSE 0 END) AS PurNetwt,
    SUM(CASE WHEN sp.VouType = 'PUR' THEN sp.DiamondWt ELSE 0 END) AS PurDiawt,
    SUM(CASE WHEN sp.VouType = 'PUR' THEN (sp.TaxableAmt - sp.DiscountAmt) ELSE 0 END) AS PurAmount,

    CASE sp.YearID
        WHEN '16' THEN '26-27'
        WHEN '15' THEN '25-26'
        WHEN '14' THEN '24-25'
        WHEN '13' THEN '23-24'
        ELSE '0'
    END AS Financial_Year

FROM sptran sp 
LEFT JOIN itemtradmst im ON im.itemtradmstid = sp.itemtradmstid
LEFT JOIN branchmaster bm ON sp.BranchID = bm.BranchID

WHERE sp.VouDate BETWEEN @F AND @T
    AND sp.VouType IN ('SL','SRT','PUR')
    AND  sp.BranchID in (6)
GROUP BY 
    bm.BranchName,
    im.TradName,
    sp.YearID,
    sp.VouDate
    ;
    '''
    values = (from_date,to_date)
    cursor.execute(qry,(values))
    res = cursor.fetchall()
    data = []
    columnNames = [column[0] for column in cursor.description]
    for record in res:
        data.append( dict( zip( columnNames , record ) ) )

    all_data={
                "22kt": {
                    "today": {"weight": 0, "amount": 0 ,"metal_amount":0,"labour_amount":0,"discount":0,"cash_receipt":0,"actual_labour":0,"fine_wt":0,"fine_amt":0,"kt":0},
                    "old": {"weight": 0, "amount": 0},
                    "net": {"weight": 0, "amount": 0}
                },
                "18kt": {
                    "today": {"weight": 0, "amount": 0,"metal_amount":0,"labour_amount":0,"discount":0,"cash_receipt":0,"actual_labour":0,"fine_wt":0,"fine_amt":0,"kt":0},
                    "old": {"weight": 0, "amount": 0},
                    "net": {"weight": 0, "amount": 0}
                },
                "di": {
                    "today": {"weight": 0, "amount": 0,"metal_amount":0,"labour_amount":0,"discount":0 ,"cash_receipt":0,"actual_labour":0,"fine_wt":0,"fine_amt":0,"kt":0},
                    "old": {"weight": 0, "amount": 0},
                    "net": {"weight": 0, "amount": 0}
                },
                "24kt": {
                    "today": {"weight": 0, "amount": 0,"metal_amount":0,"labour_amount":0,"discount":0,"cash_receipt":0,"actual_labour":0,"fine_wt":0,"fine_amt":0,"kt":0},
                    "old": {"weight": 0, "amount": 0},
                    "net": {"weight": 0, "amount": 0}
                },
            }
    fine_data={
            "today": {"weight": 0, "amount": 0},
             "old": {"weight": 0, "amount": 0},
             "net": {"weight": 0, "amount": 0}
    }
    a=0
    for d in data:
        if d["TradName"]=="22 KT GOLD":
            all_data["22kt"]["today"]["weight"]+=d["SLNetwt"]
            all_data["22kt"]["today"]["amount"]+=d["SlAmount"]
            all_data["22kt"]["today"]["metal_amount"]+=d["MetalAmt"]
            all_data["22kt"]["today"]["labour_amount"]+=d["LabourAmt"]
            all_data["22kt"]["today"]["discount"]+=d["SlDiscount"]
            all_data["22kt"]["today"]["cash_receipt"]+=(d["MetalAmt"]+d["LabourAmt"]-d["SlDiscount"])
            all_data["22kt"]["today"]["actual_labour"]+=(d["LabourAmt"]-d["SlDiscount"])
            actual_labour_per=round(((d["LabourAmt"]-d["SlDiscount"])/d["MetalAmt"]),3)
            Rate_22 = rates_22kt[d["VouDate"]]
            Rate_24 = all_rates[d["VouDate"]]
            net_wt_to_24kt=round((d["SLNetwt"]*Rate_22/Rate_24),3)
            labour_weight=round(((d["SLNetwt"]*Rate_22/Rate_24)*actual_labour_per),3)
            fine_wt_new=round((net_wt_to_24kt+labour_weight),3)
            all_data["22kt"]["today"]["fine_wt"]+=fine_wt_new
            all_data["22kt"]["today"]["fine_amt"]+=round((fine_wt_new*Rate_24),2)
            all_data["22kt"]["today"]["kt"]+=((d["MetalAmt"]+d["LabourAmt"]-d["SlDiscount"])/Rate_24)
            fine_data["today"]["weight"]+= round(d["SLNetwt"]*22/24,3)
            fine_data["today"]["amount"]+=d["SlAmount"]
        elif d["TradName"] =="24 KT GOLD":
            all_data["24kt"]["today"]["weight"]+=d["SLNetwt"]
            all_data["24kt"]["today"]["amount"]+=d["SlAmount"]
            all_data["24kt"]["today"]["metal_amount"]+=d["MetalAmt"]
            all_data["24kt"]["today"]["labour_amount"]+=d["LabourAmt"]
            all_data["24kt"]["today"]["discount"]+=d["SlDiscount"]
            all_data["24kt"]["today"]["cash_receipt"]+=(d["MetalAmt"]+d["LabourAmt"]-d["SlDiscount"])
            all_data["24kt"]["today"]["actual_labour"]+=(d["LabourAmt"]-d["SlDiscount"])
            actual_labour_per=(d["LabourAmt"]-d["SlDiscount"])/d["MetalAmt"]
            net_wt_to_24kt=(d["SLNetwt"])
            labour_weight= d["SLNetwt"]*actual_labour_per
            fine_wt_new=net_wt_to_24kt+labour_weight
            all_data["24kt"]["today"]["fine_wt"]+=fine_wt_new
            Rate_24 = all_rates[d["VouDate"]]
            all_data["24kt"]["today"]["fine_amt"]+=(fine_wt_new*Rate_24)
            all_data["24kt"]["today"]["kt"]+=((d["MetalAmt"]+d["LabourAmt"]-d["SlDiscount"])/Rate_24)
            fine_data["today"]["weight"]+=d["SLNetwt"]
            fine_data["today"]["amount"]+=d["SlAmount"]
        elif d["TradName"] =="18 KT GOLD":
            all_data["18kt"]["today"]["weight"]+=d["SLNetwt"]
            all_data["18kt"]["today"]["amount"]+=d["SlAmount"]
            all_data["18kt"]["today"]["metal_amount"]+=d["MetalAmt"]
            all_data["18kt"]["today"]["labour_amount"]+=d["LabourAmt"]
            all_data["18kt"]["today"]["discount"]+=d["SlDiscount"]
            all_data["18kt"]["today"]["cash_receipt"]+=(d["MetalAmt"]+d["LabourAmt"]-d["SlDiscount"])
            all_data["18kt"]["today"]["actual_labour"]+=(d["LabourAmt"]-d["SlDiscount"])
            actual_labour_per=(d["LabourAmt"]-d["SlDiscount"])/d["MetalAmt"]
            Rate_18 = rates_18kt[d["VouDate"]]
            Rate_24 = all_rates[d["VouDate"]]
            net_wt_to_24kt=(d["SLNetwt"]*Rate_18/Rate_24)
            labour_weight=(d["SLNetwt"]*Rate_18/Rate_24)*actual_labour_per
            fine_wt_new=net_wt_to_24kt+labour_weight
            all_data["18kt"]["today"]["fine_wt"]+=fine_wt_new
            all_data["18kt"]["today"]["fine_amt"]+=(fine_wt_new*Rate_24)
            all_data["18kt"]["today"]["kt"]+=((d["MetalAmt"]+d["LabourAmt"]-d["SlDiscount"])/Rate_24)
            fine_data["today"]["weight"]+= round(d["SLNetwt"]*18/24,3)
            fine_data["today"]["amount"]+=d["SlAmount"]
        elif d["TradName"] =="18KT DIAMOND JEWELLERY":
            all_data["di"]["today"]["weight"]+=d["SLNetwt"]
            all_data["di"]["today"]["amount"]+=d["SlAmount"]
            all_data["di"]["today"]["metal_amount"]+=d["MetalAmt"]
            all_data["di"]["today"]["labour_amount"]+=d["LabourAmt"]
            all_data["di"]["today"]["discount"]+=d["SlDiscount"]
            all_data["di"]["today"]["cash_receipt"]+=(d["MetalAmt"]+d["LabourAmt"]-d["SlDiscount"])
            all_data["di"]["today"]["actual_labour"]+=(d["LabourAmt"]-d["SlDiscount"])
            actual_labour_per=(d["LabourAmt"]-d["SlDiscount"])/d["MetalAmt"]
            Rate_18di = rates_18di[d["VouDate"]]
            Rate_24 = all_rates[d["VouDate"]]
            net_wt_to_24kt=round((d["SLNetwt"]*Rate_18di/Rate_24),2)
            labour_weight=round(((d["SLNetwt"]*Rate_18di/Rate_24)*actual_labour_per),2)
            fine_wt_new=net_wt_to_24kt+labour_weight
            all_data["di"]["today"]["fine_wt"]+=fine_wt_new
            all_data["di"]["today"]["fine_amt"]+=(fine_wt_new*Rate_24)
            all_data["di"]["today"]["kt"]+=((d["MetalAmt"]+d["LabourAmt"]-d["SlDiscount"])/Rate_24)
            
    cursor.close();
    cursor=con.cursor()
    qry_old= '''
        SET NOCOUNT ON;
SET TRANSACTION ISOLATION LEVEL READ UNCOMMITTED;

Declare @F as date= (?)
Declare @T as date= (?)


SELECT
    CASE
        WHEN bm.BranchName = 'VALSAD BR.- SHAH VIRCHAND' THEN 'VALSAD BRANCH'
        WHEN bm.BranchName = 'VAPI BR.- SHAH VIRCHAND G' THEN 'VAPI BRANCH'
        WHEN bm.BranchName = 'SURAT BR.- SHAH VIRCHAND' THEN 'SURAT BRANCH'
        ELSE bm.BranchName
    END AS BranchName,

    im.ItemMstID,
    sp.VouDate,

    SUM(CASE WHEN sp.VouType = 'PUR' THEN sp.NetWt ELSE 0 END) AS PurNetwt,
    SUM(CASE WHEN sp.VouType = 'PUR' THEN sp.DiamondWt ELSE 0 END) AS PurDiawt,
    SUM(CASE WHEN sp.VouType = 'PUR' THEN (sp.TotalAmt - sp.DiscountAmt) ELSE 0 END) AS PurAmount


FROM sptran sp 
LEFT JOIN itemmst im ON im.itemmstid = sp.itemmstid
LEFT JOIN branchmaster bm ON sp.BranchID = bm.BranchID

WHERE sp.VouDate BETWEEN @F AND @T
    AND sp.VouType IN ('PUR')
    AND  sp.BranchID in (6,7,8)
    AND sp.ItemMstID in (12,209,210,237,195)

GROUP BY 
    bm.BranchName,
    im.ItemMstID,
    sp.VouDate
    '''
    values = (from_date,to_date)
    cursor.execute(qry_old,(values))
    res1 = cursor.fetchall()
    old_data = []
    columnNames = [column[0] for column in cursor.description]
    for record in res1:
        old_data.append( dict( zip( columnNames , record ) ) )
    
    for d in old_data:
        if d["ItemMstID"]==209 or d["ItemMstID"]==195:
            all_data["22kt"]["old"]["weight"]+=d.get("PurNetwt",0)
            all_data["22kt"]["old"]["amount"]+=d["PurAmount"]
            fine_rate = all_rates[d["VouDate"]]
            fine_data["old"]["weight"]+= round(d["PurAmount"]/fine_rate,3)
            fine_data["old"]["amount"]+=d["PurAmount"]
        elif d["ItemMstID"] ==210:
            all_data["24kt"]["old"]["weight"]+=d.get("PurNetwt",0)
            all_data["24kt"]["old"]["amount"]+=d["PurAmount"]
            fine_data["old"]["weight"]+= d.get("PurNetwt",0)
            fine_data["old"]["amount"]+=d["PurAmount"]
        elif d["ItemMstID"] ==12:
            all_data["18kt"]["old"]["weight"]+=d.get("PurNetwt",0)
            all_data["18kt"]["old"]["amount"]+=d["PurAmount"]
            fine_rate = all_rates[d["VouDate"]]
            fine_data["old"]["weight"]+= round(d["PurAmount"]/fine_rate,3)
            fine_data["old"]["amount"]+=d["PurAmount"]
        elif d["ItemMstID"] ==237:
            all_data["di"]["old"]["weight"]+=d.get('PurNetwt',0)
            all_data["di"]["old"]["amount"]+=d["PurAmount"]

    for category, values in all_data.items():
        today = values.get("today", {})
        old = values.get("old", {})

        values["net"] = {
            "weight": format_indian_number(today.get("weight", 0) - old.get("weight", 0)),
            "amount": format_indian_number_no_decimal(today.get("amount", 0) - old.get("amount", 0))
        }

        values["today"]={
            "weight":format_indian_number(today.get("weight",0)),
            "amount":format_indian_number_no_decimal(today.get("amount",0)),
            "discount":format_indian_number_no_decimal(today.get("discount",0)),
            "cash_receipt":format_indian_number_no_decimal(today.get("cash_receipt",0)),
            "actual_labour":format_indian_number_no_decimal(today.get("actual_labour",0)),
            "fine_amt":format_indian_number_no_decimal(today.get("fine_amt",0)),
            "kt":format_indian_number(today.get("kt",0)),
            "fine_wt":format_indian_number(today.get("fine_wt",0)),

        }
        values["old"]={
            "weight":format_indian_number(old.get("weight",0)),
            "amount":format_indian_number_no_decimal(old.get("amount",0))
        }


    fine_data["net"]["weight"]=fine_data["today"]["weight"]-fine_data["old"]["weight"]
    fine_data["net"]["amount"]=format_indian_number_no_decimal(fine_data["today"]["amount"]-fine_data["old"]["amount"])
    fine_data["today"]["amount"]=format_indian_number_no_decimal(fine_data["today"]["amount"])
    fine_data["today"]["weight"]=format_indian_number(fine_data["today"]["weight"])
    fine_data["old"]["amount"]=format_indian_number_no_decimal(fine_data["old"]["amount"])
    fine_data["old"]["weight"]=format_indian_number(fine_data["old"]["weight"])
    
    cursor.close();
    cursor=con.cursor()
    payment_query="""
            select distinct s.SPMstID ,m.Amount,m.DiscountAmount ,m.BankAmt ,m.CardAmt ,m.CashAmt ,m.PVouNo ,m.PVouAmt ,m.GoldSchemeAmt ,m.PreviousAmt,m.OutStandingAmt from dbo.SPTran s inner join dbo.SPMst m on s.SPMstID =m.SPMstID WHERE s.VouDate >=? and s.VouDate <=? and s.VouType ='SL' and s.itemtradmstid in (1001,1002,1003)
    """
    values = (from_date,to_date)
    cursor.execute(payment_query,(values))
    res2 = cursor.fetchall()
    p_data=[]
    payment_data = {"bank":0,"card":0,"cash":0,"old_gold":0,"scheme":0,"payable":0,"receivable":0,"tax":0}
    columnNames = [column[0] for column in cursor.description]
    for record in res2:
        p_data.append( dict( zip( columnNames , record ) ) )
    for d in p_data:
        payment_data["bank"]+=d["BankAmt"]
        payment_data["card"]+=d["CardAmt"]
        payment_data["cash"]+=d["CashAmt"]
        payment_data["old_gold"]+=d["PVouAmt"]
        payment_data["scheme"]+=d["GoldSchemeAmt"]
        payment_data["payable"]+=d["PreviousAmt"]
        payment_data["receivable"]+=d["OutStandingAmt"]
    
    srt_payment_query="""
            select distinct s.SPMstID ,m.Amount,m.DiscountAmount ,m.BankAmt ,m.CardAmt ,m.CashAmt ,m.PVouNo ,m.PVouAmt ,m.GoldSchemeAmt ,m.PreviousAmt,m.OutStandingAmt from dbo.SPTran s inner join dbo.SPMst m on s.SPMstID =m.SPMstID   
WHERE s.VouDate >=? and s.VouDate <=? and s.VouType ='SRT' and s.itemtradmstid in (1001,1002,1003)
    """
    values = (from_date,to_date)
    cursor.execute(srt_payment_query,(values))
    res3 = cursor.fetchall()
    srt_p_data=[]
    srt_payment_data = {"bank":0,"card":0,"cash":0,"old_gold":0,"scheme":0,"payable":0,"receivable":0,"tax":0}
    columnNames = [column[0] for column in cursor.description]
    for record in res3:
        srt_p_data.append( dict( zip( columnNames , record ) ) )
    for d in srt_p_data:
        srt_payment_data["bank"]-=d["BankAmt"]
        srt_payment_data["card"]-=d["CardAmt"]
        srt_payment_data["cash"]-=d["CashAmt"]
        srt_payment_data["old_gold"]-=d["PVouAmt"]
        srt_payment_data["scheme"]-=d["GoldSchemeAmt"]
        #srt_payment_data["payable"]-=d["OutStandingAmt"]
        #srt_payment_data["receivable"]-=d["OutStandingAmt"]
    
    
    tax_query="""
    SELECT
	m.VouId,
	SUM(m.TaxAmt) AS TaxAmt
FROM dbo.TaxTrans m
WHERE m.VouId IN (
	SELECT DISTINCT s.SPMstID
	FROM dbo.SPTran s
	WHERE
		s.VouDate >= ?
        And s.VouDate<=?
		AND s.VouType = 'SL'
		AND s.itemtradmstid IN (1002,1001,1003)
)
and m.VouType ='SL'
GROUP BY m.VouId
    """
    values = (from_date,to_date)
    cursor.execute(tax_query,(values))
    res4 = cursor.fetchall()
    t_data=[]
    columnNames = [column[0] for column in cursor.description]
    for record in res4:
        t_data.append( dict( zip( columnNames , record ) ) )
    for t in t_data:
        payment_data["tax"]+=t["TaxAmt"]
    
    for key in payment_data:
        payment_data[key] = format_indian_number_no_decimal(payment_data[key]-srt_payment_data[key])

    return {"data":all_data,"fine_data":fine_data,"payment_data":payment_data,"rate":{"g":gold_rate,"s":silver_rate}}

    """try:
        response = frappe.make_get_request(
            url="https://api.example.com/data",
            params={
                "from_date": "2026-01-01",
                "to_date": "2026-01-31",
                "branch": "Mumbai"
            },
            timeout=0.2  # 200 milliseconds
        )
    except requests.exceptions.Timeout:
        frappe.log_error("API timeout after 200ms", "External API")
        response = None
    except Exception as e:
        frappe.log_error(str(e), "External API Error")
        response = None

    # Continue execution regardless
    if response:
        print(response)
    else:
        print("Skipping API, continuing flow...")"""

def format_indian_number(number):
    """
    Format number in Indian style with commas and 2 decimal places.
    """
    if number is None:
        number = 0
    number = round(float(number), 3)
    s, *d = str(f"{number:.3f}").split(".")
    # Extract last 3 digits
    r = s[-3:]
    s = s[:-3]
    # Add commas every 2 digits
    while len(s) > 0:
        r = s[-2:] + "," + r
        s = s[:-2]
    return r + "." + d[0]

def format_indian_number_no_decimal(number):
    """
    Format number in Indian style with commas, no decimal part.
    """
    if number is None:
        number = 0
    number = int(round(number))  # remove decimals
    s = str(number)
    r = s[-3:]
    s = s[:-3]
    while len(s) > 0:
        r = s[-2:] + "," + r
        s = s[:-2]
    return r
