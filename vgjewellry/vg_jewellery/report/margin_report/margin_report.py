# Copyright (c) 2025, mitesh and contributors
# For license information, please see license.txt

import frappe
import pyodbc
import os
import pymysql
from datetime import datetime
from decimal import Decimal


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

def get_sql_server_data(branch,table,columns,condition):
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
    cursor.execute("SELECT "+column_string+" FROM "+table+" where "+condition)

    rows = cursor.fetchall()
    data = []
    for row in rows:
        data.append(dict(zip([column[0] for column in cursor.description], row)))

    cursor.close()
    conn.close()
    return data

def execute(filters=None):
    from_date = filters.get("from_date")
    to_date = filters.get("to_date")
    date_query=" VouDate>='"+from_date+"' and VouDate<='"+to_date+"'"
    with open(frappe.get_site_path("logs", "error.log"), "a") as f:
        f.write(f"Manual log: {from_date}\n")
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
    branch_array=["valsad","vapi"]
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
            if branch=="vapi":
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
        table="LabelTransaction"
        columns=["LabelTransID","VouType","VouDate","LabelNo","ItemMstID","SupplierCode","GrossWt","NetWt","Location","VarietyMstId","LabourPer","Purity",'ItemTradMstId','OtherCharge','LabourDisAmt','AccDisAmt','MetalDisAmt','ItemTradMstId','LabourAmount','SalesManId','UniqueLabelID','UserID']
        condition="(VouType='SL' or VouType='SRT') and "+date_query +" and  ItemTradMstId in (1002,1003)  and ItemMstID not in (10266 ,10000031,203,260,10000054,200,204,196)  and LabelNo not like 'O%'";    
        select_label_res=get_sql_server_data(branch,table,columns,condition)
        for slr in select_label_res:
            UniqueLabelID=slr['UniqueLabelID']
            if slr['VouType']=="SRT":
                #return_array.pop(UniqueLabelID)
                continue
            label_user_id= user_label_res[UniqueLabelID] if UniqueLabelID in user_label_res else "no"
            #VouDate1 = datetime.strptime(slr['VouDate'],"%Y-%m-%d %H:%M:%S.%f")
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
            SupplierCode=slr['SupplierCode']
            supplier_name=supplier[SupplierCode]['n']
            LabelNo=slr['LabelNo']
            SalesManId=slr['SalesManId']
            salesman_name= salesman[SalesManId] if SalesManId in salesman else ""
            OtherChargeSale=slr['OtherCharge']
            Discount=slr['LabourDisAmt']+slr['AccDisAmt']+slr['MetalDisAmt']
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
                LabourAmt=float(slr['LabourAmount'])
            # Purchase 22KT
            Wastage_Rate = 0
            Location_code = ""
            Location = ""
            if SupplierCode in wastage and ItemMstID in wastage[SupplierCode] and VarietyMstId in wastage[SupplierCode][ItemMstID]:
                #Wastage exists
                wastage_weight_range_array=wastage[SupplierCode][ItemMstID][VarietyMstId]
                for wwk,wwra in wastage_weight_range_array.items():
                    each_wastage_weight=wwk.split("-")
                    if float(each_wastage_weight[0])<= NetWt and float(each_wastage_weight[1])>=NetWt :
                        Wastage_Rate=float(wwra)
                        break
            else:
                #Wastage not exist
                Location=slr['Location'].strip()
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
            
            #Calculate other charge
            other_charge_code=""
            multi_other_charge_code=[]
            Location=slr['Location'].strip().upper()
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
                slr['other_charge_value'] = other_charge_value
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

            return_array[UniqueLabelID]={'branch':branch,'voucher_date':datetime.strptime(VouDate, "%Y-%m-%d").strftime("%d-%m-%Y"),"item":item_name,"variety":variety_name,"salesman":salesman_name,"supplier":supplier_name,"metal":metal_name,"label_no":LabelNo,"base_rate":Base_Rate,"metal_rate":Metal_Rate,"net_wt":round(NetWt,2),"location":Location,"wastage_rate":Wastage_Rate,"location_code":Location_code,"other_charge_code":other_charge_code,"purchase_rate":round(Purchase_Rate),"purchase_labour":round(Purchase_Labour),"purchase_amount":round(Purchase_Amt),"purity":round(Purity,2),"labour_percentage":LabourPer,"labour_amount":round(LabourAmt),"other_charge_sale":OtherChargeSale,"discount":round(Discount),"sales_amount":round(Sales_Amt),"other_charge_sale":OtherChargeSale,"label_user_id":label_user_id,"margin":round(margin)}
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
            
        with open(frappe.get_site_path("logs", "error.log"), "a") as f:
            f.write(f"Manual log: {return_array}\n")

    columns = [{"label":key,"fieldname":key,"fieldtype":"Data"} for key in return_array[one_unique_id].keys()]
    data = list(return_array.values())
    #with open(frappe.get_site_path("logs", "error.log"), "a") as f:
    #    f.write(f"Manual log: {data}\n")
    return columns, data
