# Copyright (c) 2025, mitesh and contributors
# For license information, please see license.txt

import frappe
import pyodbc
import os
import pymysql
from datetime import datetime, timedelta
from decimal import Decimal
from frappe.utils.logger import get_logger
import re


value_ornsys= os.getenv('ornsysodbc')
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

def connect_ornsys():
    conn = pyodbc.connect(value_ornsys,autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION,pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn

def connect_ho():
    conn = pyodbc.connect(value_ho,autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION,pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn

def get_sql_server_data(branch,table,columns,condition,order_by=None, limit =None):
    if branch=="valsad":
        conn=connect_valsad()
    elif branch=="vapi":
        conn=connect_vapi()
    elif branch=="surat":
        conn=connect_surat()
    elif branch=="ornysis":
        conn=connect_ornsys()
    else:
        conn=connect_ho()
    
    
    column_string=",".join(columns);
    cursor = conn.cursor()

    top_clause = f"TOP {limit}" if limit else ""

    query = f"SELECT {top_clause} {column_string} FROM {table} WHERE {condition}"

    # Add ORDER BY only if provided
    if order_by:
        query += f" ORDER BY {order_by}"

    cursor.execute(query)

    rows = cursor.fetchall()
    data = []
    for row in rows:
        data.append(dict(zip([column[0] for column in cursor.description], row)))

    cursor.close()
    conn.close()
    return data

@frappe.whitelist(allow_guest=True)
def get_gold_margin_report_data():
    logger = frappe.logger("gold_margin")
    logger.setLevel("INFO")

    #from_date = filters.get("from_date")
    #to_date = filters.get("to_date")
    #from_date = "2026-01-15"
    #to_date   = "2026-03-31"

    #result = frappe.db.sql("""
    #WITH RECURSIVE date_series AS (
    #    SELECT DATE(%(from_date)s) AS dt
    #    UNION ALL
    #    SELECT dt + INTERVAL 1 DAY
    #    FROM date_series
    #    WHERE dt < DATE(%(to_date)s)
    #)
    #SELECT ds.dt
    #FROM date_series ds
    #LEFT JOIN (
    #    SELECT DISTINCT DATE(voucher_date) AS vdate
    #    FROM `tabGold Margin`
    #) g
    #ON ds.dt = g.vdate
    #WHERE g.vdate IS NULL
    #ORDER BY ds.dt
    #LIMIT 1
    #""", {"from_date": from_date, "to_date": to_date})

    #if result:
    #    from_date=str(result[0][0])
    #    to_date=str(result[0][0])
    #else:
    #    return ("No missing dates")
    #from_date="2025-04-01"
    #to_date="2025-04-02"
    today = datetime.today()
    yesterday = today # - timedelta(days=1)
    from_date = yesterday.strftime("%Y-%m-%d")
    to_date   = today.strftime("%Y-%m-%d")

    from_date="2025-04-01"
    to_date="2025-04-30"

    """first_doc = frappe.get_all("dia_from",fields=["name", "from_date"], order_by="creation asc", limit=1)
    if first_doc:
        doc_name1234 = first_doc[0].name
        from_date1 = first_doc[0].from_date

        if from_date1:
            to_date1 = from_date1 + timedelta(days=7)

    from_date =str(from_date1)
    to_date = str(to_date1)"""

    # Build date query string
    date_query = f"VouDate >= '{from_date}' AND VouDate <= '{to_date}'"
    #with open(frappe.get_site_path("logs", "error.log"), "a") as f:
    #    f.write(f"Manual log: {from_date}\n")
    Location_decode = {"A": 2, "B": 15, "C": "3", "D": 16, "E": 4, "G": 5, "I": 6, "K": 7, "M": 8, "O": 9, "Q": 10, "S": 11, "U": 12, "W": 13, "Y": 14}
    
    Other_Charge = {"A": 8, "B": 9, "C": 0, "D": 1, "E": 2, "F": 3, "G": 4, "H": 5, "I": 6, "J": 7}
    
    Lc_Chart = {"T": 400, "S": 450, "B": 500, "A": 550, "D": 600, "E": 650, "C": 700, "G": 750, "H": 800, "J": 850, "R": 900, "I": 950, "L": 1000, "O": 1100, "N": 1200, "M": 1350, "Q": 1400, "P": 1500, "V": 1300, "Y": 1200, "X": 1500, "Z": 2000, "W": 1000, "F": 500, "XX": 1500, "K": 550, "P": 500}

    branch="ornysis"
    table="UserMaster"
    columns= ["UserMastID","UserName"]
    condition=" UserMastID > 0 "
    user_res = get_sql_server_data(branch,table,columns,condition)
   
    valsad_rate_master={}
    return_array ={}
    branch_array=["valsad","vapi","surat"]
    branch_array=["valsad"]
    global_max_variety_wastage={}
    one_unique_id=""
    
    for branch in branch_array:
        table="ItemMst"
        columns=["ItemName","ItemMstID"]
        condition="ItemMstID >0"
        item_res=get_sql_server_data(branch,table,columns,condition)
        items = {}
        for it in item_res:
            items[it['ItemMstID']]=it['ItemName']
        
        table="ItemTradMst"
        columns=["TradShortName","ItemTradMstID"]
        condition="ItemTradMstID >0"
        trade_res=get_sql_server_data(branch,table,columns,condition)
        trade = {}
        for it in trade_res:
            trade[it['ItemTradMstID']]=it['TradShortName']
        
        table="VarietyMst"
        columns=["VarietyName","VarietyMstId"]
        condition="VarietyMstId >0"
        var_res=get_sql_server_data(branch,table,columns,condition)
        variety = {}
        for it in var_res:
            variety[it['VarietyMstId']]=it['VarietyName']
        
        table="TodayRateMst"
        columns=["TDate","TodayRateMstID","ItemTradMstID","SalesRate","PurRate"]
        condition=" TDate>='2024-04-01' and ItemTradMstID in (1003,1002,1006,1008,5001,1001)";
        rate_res=get_sql_server_data(branch,table,columns,condition)
        rate_master= {}
        for rr in rate_res:
            #frappe.msgprint(rr['TDate']);
            #rate_date1 = datetime.strptime(rr['TDate'],"%Y-%m-%d %H:%M:%S.%f")
            rate_date1=rr['TDate']
            rate_date = rate_date1.strftime("%Y-%m-%d")
            if rate_date not in rate_master:
                rate_master[rate_date]={}
            if rr['ItemTradMstID']== 1001:
                rr_purate=rr['PurRate']
                if rr_purate==0:
                    if rate_date in valsad_rate_master and rr['ItemTradMstID'] in valsad_rate_master[rate_date]:
                        rr_purate=valsad_rate_master[rate_date][rr['ItemTradMstID']]
                    if branch !='valsad':
                        rr_purate=rr_purate*10;
                rate_master[rate_date][rr['ItemTradMstID']]=round(rr_purate/10)        
            else:
                rr_purate=rr['PurRate']
                rate_master[rate_date][rr['ItemTradMstID']]=round(rr_purate/10)
            if branch=="valsad":
                if rate_date not in valsad_rate_master:
                    valsad_rate_master[rate_date]={}
                if rr['ItemTradMstID']==1001 :
                    valsad_rate_master[rate_date][rr['ItemTradMstID']]=round(rr['PurRate']/10);
                else:
                    valsad_rate_master[rate_date][rr['ItemTradMstID']]=round(rr['SalesRate']/10);
            if False and branch=="vapi":
                rate_master[rate_date]=valsad_rate_master[rate_date];
        table="ItemWiseLabour"
        columns=["ItemWiseLabourID","ItemMstID","VarietyMstId","FromWeight","ToWeight","PurWastPer","PartyID"]
        #condition="ItemWiseLabourID >0 and ItemMstID>0 and PurCalcWastBasedOn='N'"
        condition="ItemWiseLabourID >0 and ItemMstID>0 "
        wastage_res=get_sql_server_data(branch,table,columns,condition)
        wastage={}
        max_wastage_variety_wise={}
        max_wastage_item_wise={}
        for wr in wastage_res:
            PartyID=wr['PartyID']
            ItemMstID=wr['ItemMstID']
            VarietyMstId=wr['VarietyMstId']
            FromWeight=wr['FromWeight']
            FromWeight = 0.001 if FromWeight == ".001" else FromWeight
            ToWeight=wr['ToWeight']
            Rate=float(wr['PurWastPer'])
            wastage.setdefault(PartyID, {}) \
                .setdefault(ItemMstID, {}) \
                .setdefault(VarietyMstId, {})[f"{FromWeight}-{ToWeight}"] = Rate
            if ItemMstID in max_wastage_variety_wise and VarietyMstId in max_wastage_variety_wise[ItemMstID]:
                current_rate=max_wastage_variety_wise[ItemMstID][VarietyMstId]
                max_wastage_variety_wise[ItemMstID][VarietyMstId] = max(current_rate, Rate)
            else:
                max_wastage_variety_wise.setdefault(ItemMstID,{}) \
                    [VarietyMstId]=Rate
            if ItemMstID in max_wastage_item_wise:
                current_rate1=max_wastage_item_wise[ItemMstID]
                max_wastage_item_wise[ItemMstID]=max (current_rate1,Rate)
            else:
                max_wastage_item_wise[ItemMstID]=Rate

        table="SalesManMst"
        columns=["SalesManName","SalesManMstID"]
        condition="SalesManMstID >0"
        var_res=get_sql_server_data(branch,table,columns,condition)
        salesman = {}
        for it in var_res:
            salesman[it['SalesManMstID']]=it['SalesManName']
        
        table="SupplierCodeMaster"
        columns=["SupplierName","SupplierID","SupplierCode"]
        condition="SupplierID >0"
        supplier_res=get_sql_server_data(branch,table,columns,condition)
        supplier = {}
        for it in supplier_res:
            supplier[it['SupplierID']]={"n":it['SupplierName'],"c":it["SupplierCode"]}

        table="LabelTransaction"
        columns=["LabelTransID","UserID","UniqueLabelID"]
        condition="VouType='ST'   and  ItemTradMstId in (1002,1003)  and ItemMstID not in (10266 ,10000031,203,260,10000054,200,204,196)  and LabelNo not like 'O%'"
        select_user_res=get_sql_server_data(branch,table,columns,condition)
        user_label_res={}
        for sur in select_user_res:
            user_label_res[sur['UniqueLabelID']]=user_res[sur['UserID']]['UserName'] if sur['UserID'] in user_res else ""
        check_wastage=[]

        Tran_Unique = {}
        table="SPTran"
        columns=["SPTranID","Purity","VouType","VouDate","LabelNo","ItemMstID","ApprovalPartyID","GrossWt","NetWt","VarietyMstId","LabourPer","Purity",'ItemTradMstId','LabourDisAmt','AccDisAmt','MetalDisAmt','ItemTradMstId','LabourAmt','SalesManId','UniqueLabelID','UserID','OtherChgAmt','OpVouTranId','DiamondAmt','DiamondWt','StoneWt','StoneAmt',"MetalRate","TaxableAmt","MetalAmt","DiscountAmt"]

        condition="(VouType='SL' or VouType='SRT') and "+date_query +" and  ItemTradMstId in (1002,1003)  and ItemMstID not in (10266 ,10000031,203,260,10000054,200,204,196)  and LabelNo not like 'O%'";    
        select_label_res=get_sql_server_data(branch,table,columns,condition,"SPTranID")
        for slr in select_label_res:
            UniqueLabelID=slr['UniqueLabelID']
            OpVouTranId=slr['OpVouTranId']
            SPTranID=slr['SPTranID']
            Tran_Unique[SPTranID]=UniqueLabelID
            if slr['VouType'] == "SRT":
                pop_uniq= Tran_Unique.get(OpVouTranId,-1)
                return_array.pop(pop_uniq, None)
                frappe.db.sql("""   DELETE FROM `tabDiamond Margin`   WHERE sptranid = %s""", (OpVouTranId,))
                frappe.db.commit()
                continue

            VouDate1 = slr['VouDate']
            VouDate = VouDate1.strftime("%Y-%m-%d")
            ItemTradMstId=slr['ItemTradMstId']
            Metal_Rate=rate_master[VouDate][ItemTradMstId]
            if VouDate not in rate_master or 1001 not in rate_master[VouDate] or rate_master.get(VouDate, {}).get(1001) is None :
                Base_Rate=0
            else:
                Base_Rate=rate_master[VouDate][1001]
            NetWt=float(slr['NetWt'])
            ItemMstID=slr['ItemMstID']
            item_name=items[ItemMstID]
            VarietyMstId=slr['VarietyMstId']
            variety_name=variety[VarietyMstId]
            SupplierCode=slr['ApprovalPartyID']
            #supplier_name=supplier[SupplierCode]['n']
            supplier_name = supplier.get(SupplierCode,{}).get('n')
            LabelNo=slr['LabelNo']
            SalesManId=slr['SalesManId']
            salesman_name= salesman[SalesManId] if SalesManId in salesman else ""
            OtherChargeSale=slr['OtherChgAmt']
            Discount=slr['DiscountAmt']
            Discount = float(Discount);
            # Sales 22KT
            Sale_Rate = Metal_Rate * NetWt
            LabourPer = slr['LabourPer']
            Purity = slr['Purity']
            
            # Item type
            ItemTradMstId = slr['ItemTradMstId']
            Purchase_Purity = "0"
            metal_name = ""
            if(ItemTradMstId==1002):
                Purchase_Purity=92
                metal_name="22KT"
            elif ItemTradMstId==1003:
                Purchase_Purity=76
                metal_name="18KT"
            Total_Sales_Purity=LabourPer+Purity
            LabourAmt=(float(Sale_Rate)*float(LabourPer))/100
            if LabourAmt==0:
                LabourAmt=float(slr['LabourAmt'])
            # Purchase 22KT
            Wastage_Rate = 0
            Location_code = ""
            Location = ""
            #logger.info(f"{SupplierCode}--{ItemMstID}---{VarietyMstId}")
            NetWt1=float(slr['NetWt'])
            table="LabelTransaction"
            columns=["LabelTransID","Location"]
            condition=" UniqueLabelID='"+UniqueLabelID+"' and VouDate='"+str(VouDate1)+"'"
            select_ltran_res=get_sql_server_data(branch,table,columns,condition,None,1)
            for mit in select_ltran_res:
                Location= mit["Location"]
            if UniqueLabelID in return_array:
                NetWt1 += float(return_array[UniqueLabelID]['net_wt'])

            if SupplierCode in wastage and ItemMstID in wastage[SupplierCode] and VarietyMstId in wastage[SupplierCode][ItemMstID]:
                #logger.info(f"{wastage[SupplierCode][ItemMstID][VarietyMstId]}");
                #Wastage exists
                wastage_weight_range_array=wastage[SupplierCode][ItemMstID][VarietyMstId]
                for wwk,wwra in wastage_weight_range_array.items():
                    #logger.info(f"Net wet{NetWt}--- {wwk}")
                    each_wastage_weight=wwk.split("-")
                    if float(each_wastage_weight[0])<= NetWt1 and float(each_wastage_weight[1])>=NetWt1 :
                        Wastage_Rate=float(wwra)
                        break
            else:
                #Wastage not exist
                Location=Location.strip()
                #logger.info(f"location {Location}")
                if (Location and ('-' in Location or '/' in Location or '+' in Location or len(Location)==1)):
                    if '+' in Location:
                        each_location=Location.split('+')
                        Wastage_Rate=0
                        for el in each_location:
                            key = el.upper()
                            if key in Location_decode:
                                Wastage_Rate+=Location_decode[key]
                    else:
                        Location_code = Location[0].upper()
                        if Location_code in Location_decode:
                            Wastage_Rate = Location_decode[Location_code]
                else:
                    if ItemMstID in max_wastage_variety_wise and VarietyMstId in max_wastage_variety_wise[ItemMstID]:
                        Wastage_Rate=max_wastage_variety_wise[ItemMstID][VarietyMstId]
                    else:
                        check_wastage.append(UniqueLabelID)
                        Wastage_Rate=0
            if item_name not in global_max_variety_wastage:
                global_max_variety_wastage[item_name]={}
            if variety_name not in global_max_variety_wastage[item_name]:
                global_max_variety_wastage[item_name][variety_name]=Wastage_Rate
            if int(Wastage_Rate) > int(global_max_variety_wastage[item_name][variety_name]):
                global_max_variety_wastage[item_name][variety_name]=Wastage_Rate
            #logger.info(f"wastage rate {Wastage_Rate}") 
            #Calculate other charge
            other_charge_code=""
            multi_other_charge_code=[]
            Location=Location.strip().upper()
            if Location:
                if "-" in Location:
                    if "/" in Location:
                        each_part=Location.split("/")
                        for ep in each_part:
                            each_other_charge1=ep.split("-")
                            if len(each_other_charge1) > 1:
                                multi_other_charge_code.append(each_other_charge1[1])
                            else:
                                multi_other_charge_code.append(each_other_charge1[0])

                    else:
                        each_other_charge = Location.split("-")
                        if len(each_other_charge) > 1:
                            other_charge_code = each_other_charge[1]
                elif "/" in Location:
                    each_other_charge=Location.split("/")
                    if len(each_other_charge)>1:
                        other_charge_code=each_other_charge[1]
                elif Location.isalpha() and len(Location)>1:
                    other_charge_code = Location
            other_charge_value=""
            if other_charge_code!="":
                for char in other_charge_code:
                    if char in Other_Charge:
                        other_charge_value+=str(Other_Charge[char])
                slr['OtherChgAmt'] = other_charge_value
            if OtherChargeSale>0 and other_charge_value=="":
                other_charge_value=round(float(OtherChargeSale)*0.70)
            if other_charge_value=="":
                other_charge_value=0
            if len(multi_other_charge_code) > 0:
                other_charge_code=",".join(multi_other_charge_code)
                other_charge_value=0
            for moc in multi_other_charge_code:
                first_charge=""
                for char in moc:
                    if char in Other_Charge:
                        first_charge+= str(Other_Charge[char])
                other_charge_value+=int(first_charge) if first_charge else 0
            Sales_Amt = Sale_Rate + float(LabourAmt) + float(OtherChargeSale) - float(Discount)
            if UniqueLabelID in return_array:
                NetWt += float(return_array[UniqueLabelID]['net_wt'])
                LabourAmt += float(return_array[UniqueLabelID]['labour_amount'])
                Discount += float(return_array[UniqueLabelID]['discount'])
                Sales_Amt += float(return_array[UniqueLabelID]['sales_amount'])
           
            # Calculate purchase rates and amounts
            Purchase_Rate = NetWt * Purchase_Purity * Base_Rate / 100
            Purchase_Labour = NetWt * float(Wastage_Rate) * Base_Rate / 100
            Purchase_Amt = Purchase_Rate + Purchase_Labour + float(other_charge_value)
            margin = float(Sales_Amt) - Purchase_Amt
            margin_percentage= round((margin / Purchase_Amt * 100),2)

            new_label_no = re.sub(r"\s*/\s*", "/", LabelNo)

            label_user_id=""

            return_array[UniqueLabelID]={'branch':branch,'voucher_date':datetime.strptime(VouDate, "%Y-%m-%d").strftime("%d-%m-%Y"),"item":item_name,"variety":variety_name,"salesman":salesman_name,"supplier":supplier_name,"metal":metal_name,"label_no":new_label_no,"base_rate":Base_Rate,"metal_rate":Metal_Rate,"net_wt":round(NetWt,2),"location":Location,"wastage_rate":Wastage_Rate,"location_code":Location_code,"other_charge_code":other_charge_code,"purchase_rate":round(Purchase_Rate),"purchase_labour":round(Purchase_Labour),"purchase_amount":round(Purchase_Amt),"purity":round(Purity,2),"labour_percentage":LabourPer,"labour_amount":round(LabourAmt),"other_charge_sale":OtherChargeSale,"discount":round(Discount),"sales_amount":round(Sales_Amt),"other_charge_sale":OtherChargeSale,"label_user_id":label_user_id,"margin":round(margin),"margin_percentage":margin_percentage,"s":SPTranID,"u":UniqueLabelID}
            one_unique_id=UniqueLabelID

        
        for uld in check_wastage:
            if uld not in return_array or 'net_wt' not in return_array[uld]:
                continue
            NetWt=round(return_array[uld]['net_wt'],2)
            Wastage_Rate=global_max_variety_wastage[return_array[uld]['item']][return_array[uld]['variety']]
            Base_Rate=return_array[uld]['base_rate']
            Purchase_Rate=return_array[uld]['purchase_rate']
            Purchase_Labour=return_array[uld]['purchase_labour']
            Purchase_Amt=Purchase_Rate+Purchase_Labour+ int(other_charge_value)
            margin=Sales_Amt-Purchase_Amt
            return_array[uld]['wastage_rate']=Wastage_Rate
            return_array[uld]['purchase_labour']=round(Purchase_Labour)
            return_array[uld]['purchase_amount']=round(Purchase_Amt)
            return_array[uld]['margin']=round(margin)
	
    inserted = updated = errors = 0
    for uid, row in return_array.items():
        try:
            voucher_date_norm = datetime.strptime(row['voucher_date'], "%d-%m-%Y").strftime("%Y-%m-%d")
            label_no          = row['label_no']

            existing_name = frappe.db.get_value(
                "Gold Margin",
                {"voucher_date": voucher_date_norm, "label_no": label_no},
                "name"
            )

            if False and existing_name:
                # ── UPDATE ──
                doc = frappe.get_doc("Gold Margin", existing_name)
                doc.branch                   = row['branch']
                doc.voucher_date             = voucher_date_norm
                doc.item                     = row['item']
                doc.variety                  = row['variety']
                doc.sales_person             = row['salesman']
                doc.supplier                 = row['supplier']
                doc.metal                    = row['metal']
                doc.label_no                 = label_no
                doc.base_rate                = int(row['base_rate'] or 0)
                doc.metal_rate               = int(row['metal_rate'] or 0)
                doc.net_wt                   = float(row['net_wt'] or 0)
                doc.wastage_rate             = float(row['wastage_rate'] or 0)
                doc.location                 = row['location']
                doc.location_code            = row['location_code']
                doc.other_charge_code        = row['other_charge_code']
                doc.purchase_rate            = int(row['purchase_rate'] or 0)
                doc.purchase_labour          = int(row['purchase_labour'] or 0)
                doc.purchase_amount          = int(row['purchase_amount'] or 0)
                doc.labout_amount            = int(row['labour_amount'] or 0)
                doc.labour_percentage        = float(row['labour_percentage'] or 0)
                doc.other_charge_sale        = int(row['other_charge_sale'] or 0)
                doc.discount                 = int(row['discount'] or 0)
                doc.sales_amount             = int(row['sales_amount'] or 0)
                doc.margin                   = int(row['margin'] or 0)
                doc.margin_percentage        = float(row['margin_percentage'] or 0)
                doc.save(ignore_permissions=True)
                frappe.db.commit()
                updated += 1
                logger.info(f"[UPDATE] voucher_date={voucher_date_norm}  label_no={label_no}  name={existing_name}")
            else:
                # ── INSERT ──
                doc = frappe.get_doc({
                    "doctype":               "Gold Margin",
                    "branch":                row['branch'],
                    "voucher_date":          voucher_date_norm,
                    "item":                  row['item'],
                    "variety":               row['variety'],
                    "sales_person":          row['salesman'],
                    "supplier":              row['supplier'],
                    "metal":                 row['metal'],
                    "label_no":              label_no,
                    "base_rate":             int(row['base_rate'] or 0),
                    "metal_rate":            int(row['metal_rate'] or 0),
                    "net_wt":                float(row['net_wt'] or 0),
                    "wastage_rate":          float(row['wastage_rate'] or 0),
                    "location":              row['location'],
                    "location_code":         row['location_code'],
                    "other_charge_code":     row['other_charge_code'],
                    "purchase_rate":         int(row['purchase_rate'] or 0),
                    "purchase_labour":       int(row['purchase_labour'] or 0),
                    "purchase_amount":       int(row['purchase_amount'] or 0),
                    "labour_percentage":     float(row['labour_percentage'] or 0),
                    "labout_amount":         int(row['labour_amount'] or 0),
                    "other_charge_sale":     int(row['other_charge_sale'] or 0),
                    "discount":              int(row['discount'] or 0),
                    "sales_amount":          int(row['sales_amount'] or 0),
                    "margin":                int(row['margin'] or 0),
                    "margin_percentage":     float(row['margin_percentage'] or 0),
                    "uniquelabelid": row["u"],
                    "sptranid":row["s"]
                })
                doc.insert(ignore_permissions=True)
                frappe.db.commit()
                inserted += 1
                #logger.info(f"[INSERT] voucher_date={voucher_date_norm}  label_no={label_no} from_date{from_date}")

        except Exception as e:
            errors += 1
            logger.error(f"[ERROR] uid={uid}  label_no={row.get('label_no')}  error={e}")

    logger.info(f"Gold Margin sync complete — inserted={inserted}  updated={updated}  errors={errors}")
    #frappe.db.set_value("dia_from", doc_name1234, "from_date",to_date1 )
    #frappe.db.commit()
    return {"inserted": inserted, "updated": updated, "errors": errors , "from_date":from_date} 
    
