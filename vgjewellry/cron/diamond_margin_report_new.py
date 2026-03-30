import frappe
import pyodbc
import os
import pymysql
from datetime import datetime
from decimal import Decimal
from frappe.utils.logger import get_logger
import re
from datetime import datetime, timedelta




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

def get_sql_server_data(branch,table,columns,condition,order_by=None, limit =None ):
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
def get_diamond_margin_report_data():
    logger = frappe.logger("diamond_margin")
    logger.setLevel("INFO")
    #from_date = filters.get("from_date")
    #to_date = filters.get("to_date")
    #from_date= "2025-06-01"
    #to_date= "2025-06-30"
    #from_date = "2025-12-01"
    #to_date   = "2026-02-28"

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
    #date_query=" VouDate>='"+from_date+"' and VouDate<='"+to_date+"'"
    today = datetime.today()
    yesterday = today # - timedelta(days=1)
    from_date = yesterday.strftime("%Y-%m-%d")
    to_date   = today.strftime("%Y-%m-%d")

    """first_doc = frappe.get_all("gl_from",fields=["name", "from_date"], order_by="creation asc", limit=1)
    if first_doc:
        doc_name1234 = first_doc[0].name
        from_date1 = first_doc[0].from_date

        if from_date1:
            to_date1 = from_date1 + timedelta(days=7)

    from_date =str(from_date1)
    to_date = str(to_date1)"""

    from_date="2025-04-01"
    to_date="2026-03-30"
    
    # Build date query string
    date_query = f"VouDate >= '{from_date}' AND VouDate <= '{to_date}'"
    #with open(frappe.get_site_path("logs", "error.log"), "a") as f:
    #    f.write(f"Manual log: {from_date}\n")
    Location_decode = {"A": 2, "B": 15, "C": "3", "D": 16, "E": 4, "G": 5, "I": 6, "K": 7, "M": 8, "O": 9, "Q": 10, "S": 11, "U": 12, "W": 13, "Y": 14}
    
    Other_Charge = {"A": 8, "B": 9, "C": 0, "D": 1, "E": 2, "F": 3, "G": 4, "H": 5, "I": 6, "J": 7}
    
    Lc_Chart_Per_Gram = {"T": 400, "S": 450, "B": 500, "A": 550, "D": 600, "E": 650, "C": 700, "G": 750, "H": 800, "J": 850, "R": 900, "I": 950, "L": 1000, "O": 1100, "N": 1200, "M": 1350, "Q": 1400, "P": 1500 }

    Lc_Chart_Per_Fix={"V": 1300, "Y": 1200, "X": 1500, "Z": 2000, "W": 1000, "F": 500, "XX": 1500, "K": 550, "P": 500}

    shape_master = {'RD(CT)':'Round',"RADIANT(CT)":"Radiant","BR(CT)":"Tapper","CD(CT)":"Cushion","EMD(CT)":"Emerald","HRD(CT)":"Heart","MD(CT)":"Marquise","OVAL.D(CT)":"Oval","PD(CT)":"Princess","PEAR.D(CT)":"Pear"}

    diamond_size_map_master = {'1VVS-EF':{"color":"EF","clarity":"VVS"},"2VVS-VS-FG":{"color":"FG","clarity":"VVS/VS"},"3VS-SI-GHI":{"clarity":"VS/SI","color":"GH HI"},"2VVS-VS-FG-2":{"clarity":"VVS/VS","color":"FG"},"3VS-SI-GHI-2":{"clarity":"VS/SI","color":"GH HI"},"1VVS-EF-2":{"color":"EF","clarity":"VVS"}}
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
    
    all_ready_label_transaction=[]

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
        
        table="DiamondStyleMst"
        columns=["StyleName","DiamondStyleMstID","EffectToTradOtChrg"]
        condition="DiamondStyleMstID >0"
        dia_size_res=get_sql_server_data(branch,table,columns,condition)
        diamond_style = {}
        color_stone = []
        for it in dia_size_res:
            diamond_style[it['DiamondStyleMstID']]=it['StyleName']
            if it["EffectToTradOtChrg"]== 3001 or it["EffectToTradOtChrg"]=="3001":
                color_stone.append(it["DiamondStyleMstID"]);
        
        table="DiamondSizeMst"
        columns=["DiamondSizeMstID","SizeName"]
        condition="DiamondSizeMstID >0"
        dia_size_res=get_sql_server_data(branch,table,columns,condition)
        diamond_size = {}
        for it in dia_size_res:
            diamond_size[it['DiamondSizeMstID']]=it['SizeName']
            

        
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
        columns=["ItemWiseLabourID","VarietyMstId","FromWeight","ToWeight","Rate","RateType","WastageType"]
        condition="ItemWiseLabourID >0 and ItemTradMstID=1006"
        wastage_res=get_sql_server_data(branch,table,columns,condition)
        wastage={}
        max_wastage_variety_wise={}
        max_wastage_item_wise={}
        sales_labour_dict = {}
        wastage_type_dict = {}
        for wr in wastage_res:
            VarietyMstId=wr['VarietyMstId']
            FromWeight=wr['FromWeight']
            RateType=wr['RateType']
            WastageType=wr['WastageType']
            FromWeight = 0.001 if FromWeight == ".001" else FromWeight
            ToWeight=wr['ToWeight']
            Rate=float(wr['Rate'])
            sales_labour_dict.setdefault(VarietyMstId, []).append({
            "from_wt": float(FromWeight),
            "to_wt": float(ToWeight),
            "rate_type": RateType,
            "rate": float(Rate)
            })
            wastage_type_dict.setdefault(VarietyMstId, []).append({
            "from_wt": float(FromWeight),
            "to_wt": float(ToWeight),
            "wastage_type": WastageType
            })

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
        columns=["LabelTransID","UserID","UniqueLabelID","DiamondPcs"]
        condition="VouType='ST'   and  ItemTradMstId in (1006)  and ItemMstID not in (264,263,237,10000037,10000009)"
        select_user_res=get_sql_server_data(branch,table,columns,condition)
        user_label_res={}
        diamond_pcs_dict={}
        for sur in select_user_res:
            user_label_res[sur['UniqueLabelID']]=user_res[sur['UserID']]['UserName'] if sur['UserID'] in user_res else ""
            if sur['UniqueLabelID'] not in diamond_pcs_dict:
                diamond_pcs_dict[sur['UniqueLabelID']]=0;
            diamond_pcs_dict[sur['UniqueLabelID']] += sur["DiamondPcs"]    
        check_wastage=[]
        
        table="SPTran"
        columns=["SPTranID","VouType","VouDate","LabelNo","ItemMstID","ApprovalPartyID","GrossWt","NetWt","VarietyMstId","LabourPer","Purity",'ItemTradMstId','LabourDisAmt','AccDisAmt','MetalDisAmt','ItemTradMstId','LabourAmt','SalesManId','UniqueLabelID','UserID','OtherChgAmt','OpVouTranId','DiamondAmt','DiamondWt','StoneWt','StoneAmt',"MetalRate","TaxableAmt","MetalAmt","DiscountAmt"]
        condition="(VouType='SL' or VouType='SRT') and "+date_query +" and  ItemTradMstId in (1006)  and ItemMstID not in (264,263,237,10000037,10000009)  ";    
        select_label_res=get_sql_server_data(branch,table,columns,condition, "SPTranID")
        for slr in select_label_res:
            UniqueLabelID=slr['UniqueLabelID']
            OpVouTranId=slr['OpVouTranId']
            SPTranID=slr['SPTranID']
            if slr['VouType'] == "SRT":
                return_array.pop(OpVouTranId, None)
                frappe.db.sql("""   DELETE FROM `tabDiamond Margin`   WHERE sptranid = %s""", (OpVouTranId,))
                frappe.db.commit()
                continue
            #LabelTransID= int(slr['LabelTransID'])
            #logger.info(f"{slr['LabelTransID']}")    
            #logger.info(f"-----------")    
            #UniqueLabelID = slr.get('UniqueLabelID')
            #if UniqueLabelID == "":
            #    UniqueLabelID = 1
            #if slr['VouType']=="SRT":
                #return_array.pop(UniqueLabelID)
            #    continue
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
            SupplierCode=slr['ApprovalPartyID']
            LabelTransID= int(slr['SPTranID'])
            supplier_name=supplier[SupplierCode]['n']
            LabelNo=slr['LabelNo']
            SalesManId=slr['SalesManId']
            salesman_name= salesman[SalesManId] if SalesManId in salesman else ""
            OtherChargeSale=slr['OtherChgAmt']

            #Discount=slr['LabourDisAmt']+slr['AccDisAmt']+slr['MetalDisAmt']
            Discount=slr['DiscountAmt']
            Discount = float(Discount);
            
            DiamondWt_db=slr["DiamondWt"]
            DiamondAmt_db=slr["DiamondAmt"]
            StoneAmt=slr["StoneAmt"]
            StoneWt_db=slr["StoneWt"]
            LabourAmt_db=slr["LabourAmt"]
            OtherChgAmt_db=slr["OtherChgAmt"]
            Metal_Rate=float(slr["MetalRate"])/10
            MetalAmt=slr["MetalAmt"]
            Location=""
            Location_code=""
            other_charge_code=""
            diamond_in_product=""
            total_diamond_wt=DiamondWt_db
            total_stone_wt=StoneWt_db
            LabourAmt=LabourAmt_db
            OtherChargeSale=OtherChgAmt_db
            DiamondAmt=DiamondAmt_db
            is_plain="no"
            if DiamondAmt == 0 or DiamondAmt=="0":
                is_plain="yes"
            diamond_purchase_amount=0
            stone_purchase_amount=0
            purchase_rate=0
            Purchase_Labour=0
            Purchase_Amt=0
            Sales_Amt=float(slr["TaxableAmt"])- Discount
            label_user_id=""
            margin=0
            margin_percentage=0
            Purchase_Rate=0

            all_diamond_pcs =[]
            all_metal_pcs =[]
            table="LabelTransactionStudded"
            columns=["LabelStudID" ,"StyleID" ,"SizeID" , "NetWt" ,"Pcs","DiscountAmt", "MetalAmt","PcsName","CostAmount"]
            condition = "UniqueLabelID='"+ UniqueLabelID+"' and VouDate='"+str(VouDate1)+"'"
            lts_res=get_sql_server_data(branch,table,columns,condition)
            for ltr in lts_res:
                if ltr["StyleID"]== 1006:
                    all_metal_pcs.append({"Pcs":ltr["Pcs"],"NetWt":ltr["NetWt"],"PcsName":ltr["PcsName"]})
                else:
                    all_diamond_pcs.append({"Pcs":ltr['Pcs'],"NetWt":ltr["NetWt"],"StyleID":ltr["StyleID"],"SizeID":ltr["SizeID"],'cost':ltr['CostAmount'],"DiamondAmt":ltr["MetalAmt"]})

            LabourPer = slr['LabourPer']
            Purity = slr['Purity']
            Purchase_Purity=76
            metal_name="18DI"
            Total_Sales_Purity=LabourPer+Purity
            diamond_purchase_amount=0
            stone_purchase_amount=0
            diamond_in_product=""
            for i in all_diamond_pcs:
                if i['SizeID']==0 or i["SizeID"]== 1 or i["SizeID"]=="1" or i["SizeID"]==11 or i["SizeID"]==10:
                    #if i['StyleID']== 3:
                    if i['StyleID'] in [3,4,5,10,12,14,27,31,49,50,51,52,73,77,78,88,92]:
                        diamond_purchase_amount += float(i["cost"])
                    else:
                        if i['StyleID'] in color_stone:
                            stone_purchase_amount += float(0.7) * float(i["cost"])
                        else:
                            stone_purchase_amount+= float(i["cost"])
                        dia_style_in_product= diamond_style[i['StyleID']]
                        dia_shape=shape_master.get(dia_style_in_product)
                        diamond_in_product += f"{dia_shape or ''} {i['NetWt'] or ''}\n"
                        #logger.info(f"----{diamond_purchase_amount}")
                else:
                    dia_size_in_product=diamond_size[i['SizeID']]
                    dia_color=diamond_size_map_master[dia_size_in_product]["color"]
                    dia_clarity=diamond_size_map_master[dia_size_in_product]["clarity"]
                    dia_style_in_product= diamond_style[i['StyleID']]
                    dia_shape=shape_master.get(dia_style_in_product)
                    #logger.info(f"diamond {dia_size_in_product}---{dia_style_in_product}")
                    one_diamond_wt= round(i['NetWt']/i['Pcs'],4) if i['Pcs'] != 0 else 0
                    #logger.info(f"--one diamond wt{one_diamond_wt}")
                    dia_supplier= slr['ApprovalPartyID']
                    ate = Decimal("0")
                    rate = frappe.db.get_value(
                       "Diamond_Purchase_Rate",
                        {
                            "supplier": dia_supplier,
                            "clarity": dia_clarity,
                            "color": dia_color,
                            "shape":dia_shape,
                            "min_carat_weight": ("<=", one_diamond_wt),
                            "max_carat_weight": (">=", one_diamond_wt),
                        },
                        "rate"
                    ) or Decimal("0")

                    if rate==0 or rate=="0":
                        rate = frappe.db.get_value(
                        "Diamond_Purchase_Rate",
                        {
                            "clarity": dia_clarity,
                            "color": dia_color,
                            "shape": dia_shape,
                            "min_carat_weight": ("<=", one_diamond_wt),
                            "max_carat_weight": (">=", one_diamond_wt),
                        },
                        "rate",
                        order_by="rate desc"
                    ) or Decimal("0")


                    if rate==0:
                        rate = frappe.db.get_value(
                        "Diamond_Purchase_Rate",
                        {
                            "clarity": dia_clarity,
                            "color": dia_color,
                            "min_carat_weight": ("<=", one_diamond_wt),
                            "max_carat_weight": (">=", one_diamond_wt),
                        },
                        "rate",
                        order_by="rate desc"
                    ) or Decimal("0")

                    #logger.info(f"n3---{rate}");

                    if rate==0:
                        rate = frappe.db.get_value(
                        "Diamond_Purchase_Rate",
                        {
                            "min_carat_weight": ("<=", one_diamond_wt),
                            "max_carat_weight": (">=", one_diamond_wt),
                        },
                        "rate",
                        order_by="rate desc"
                    ) or Decimal("0")

                    #logger.info(f"n4---{rate}");
                    diamond_in_product += f"{dia_shape or ''} {i['NetWt'] or ''} {dia_color or ''} {dia_clarity or ''}\n"
                    #logger.info(f"www--{dia_shape or ''} {i['NetWt'] or ''} {dia_color or ''} {dia_clarity or ''}--{rate}");
                    if float(rate)>0:
                        diamond_purchase_amount= float(diamond_purchase_amount)+ (float(rate) * float(i['NetWt']))
                    elif rate==0 or rate=="0" :
                        if float(i['NetWt'])>=0.3 :
                            diamond_purchase_amount += float(i['DiamondAmt'])*0.9
                            #logger.info(f"nnn---{diamond_purchase_amount}--{i['DiamondAmt']}");
                    diamond_purchase_amount=round(diamond_purchase_amount)


            Purchase_Labour=0
            Labour_Type=""
            if VarietyMstId in wastage_type_dict:
                for sld_obj in  wastage_type_dict[VarietyMstId]:
                    if sld_obj["from_wt"]<= NetWt and sld_obj["to_wt"] >= NetWt:
                        if sld_obj["wastage_type"]=="Per Gram":
                            Labour_Type="PerGram"
                        if sld_obj["wastage_type"]=="Fix":
                            Labour_Type = "Fix"
           
            table="LabelTransaction"
            columns=["LabelTransID","Location"]
            condition=" UniqueLabelID='"+UniqueLabelID+"' and VouDate='"+str(VouDate1)+"'"
            select_ltran_res=get_sql_server_data(branch,table,columns,condition,None,1)
            for mit in select_ltran_res:
                Location= mit["Location"]

            Location=Location.strip()

            if (Location and ('-' in Location or '/' in Location or '+' in Location or len(Location)==1)):
                if '+' in Location:
                    each_location=Location.split('+')
                    Wastage_Rate=0
                    for el in each_location:
                        key = el.upper()
                        for adp in all_diamond_pcs:
                            if adp["NetWt"]<=2:
                                Purchase_Labour += Lc_Chart_Per_Fix.get(key, 0)
                            else:
                                Purchase_Labour += (Lc_Chart_Per_Gram.get(key,0) * adp["NetWt"])
                else:
                    Location_code = Location[0].upper()
                    for adp in all_metal_pcs:
                        if adp["NetWt"]<=2:
                            Purchase_Labour += Lc_Chart_Per_Fix.get(Location_code, 0)
                        else:
                            Purchase_Labour += (Lc_Chart_Per_Gram.get(Location_code,0) * adp["NetWt"])

            elif(len(Location)==2):
                for adp in all_metal_pcs:
                    if adp["PcsName"]=="DPPANDENT":
                        Location_code= Location[0].upper()
                    elif adp["PcsName"]=="DPTOPS":
                        Location_code= Location[1].upper()
                    if adp["NetWt"]<=2:
                        Purchase_Labour += Lc_Chart_Per_Fix.get(Location_code, 0)
                    else:
                        Purchase_Labour += (Lc_Chart_Per_Gram.get(Location_code,0) * adp["NetWt"])
            

            Purchase_Rate = NetWt * Purchase_Purity * Base_Rate / 100
            #Purchase_Labour = NetWt * float(Wastage_Rate) * Base_Rate / 100
            other_charge_value=0
            Purchase_Amt = float(Purchase_Rate) + float(Purchase_Labour) + float(other_charge_value)+ float(diamond_purchase_amount)+ float(stone_purchase_amount)
       

            new_label_no = re.sub(r"\s*/\s*", "/", LabelNo)
            
            if UniqueLabelID in return_array:
                NetWt += return_array[UniqueLabelID]['NetWt']
                total_diamond_wt += return_array[UniqueLabelID]['total_diamond_wt']
                total_stone_wt += return_array[UniqueLabelID]['total_stone_wt']
                Discount += return_array[UniqueLabelID]['discount']
                MetalAmt += return_array[UniqueLabelID]['metal_amount']
                DiamondAmt += return_array[UniqueLabelID]['diamond_amount']
                StoneAmt += return_array[UniqueLabelID]['stone_amount']
                OtherChargeSale += return_array[UniqueLabelID]['other_charge_sale']
                Sales_Amt += return_array[UniqueLabelID]['sales_amount']
                diamond_in_product+ =return_array[UniqueLabelID]['diamond_in_product']
            
            if total_diamond_wt == 0:
                diamond_in_product=""
            diamond_in_product = (
                diamond_in_product[:135] + "..."
                if diamond_in_product and len(diamond_in_product) > 140
                else diamond_in_product
            )
            margin = float(Sales_Amt) - Purchase_Amt
            margin_percentage= round((margin / Purchase_Amt * 100),2)
                
            return_array[UniqueLabelID]={'branch':branch,'voucher_date':datetime.strptime(VouDate, "%Y-%m-%d").strftime("%d-%m-%Y"),"item":item_name,"variety":variety_name,"salesman":salesman_name,"supplier":supplier_name,"metal":metal_name,"label_no":new_label_no,"base_rate":Base_Rate,"metal_rate":Metal_Rate,"net_wt":round(NetWt,3),"location":Location,"location_code":Location_code,"other_charge_code":other_charge_code,"diamond_in_product":diamond_in_product,"total_diamond_wt":total_diamond_wt,"total_stone_wt":total_stone_wt,"is_plain_jewellry":is_plain,"diamond_purchase_amount":diamond_purchase_amount,"stone_purchase_amount":round(stone_purchase_amount),"purchase_rate":round(Purchase_Rate),"purchase_labour":round(Purchase_Labour),"purchase_amount":round(Purchase_Amt),"labour_amount":round(LabourAmt),"other_charge_sale":OtherChargeSale,"discount":round(Discount),"metal_amount":round(MetalAmt),"diamond_amount":round(DiamondAmt),"stone_amount":round(StoneAmt),"sales_amount":round(Sales_Amt),"other_charge_sale":OtherChargeSale,"label_user_id":label_user_id,"margin":round(margin),"margin_percentage":margin_percentage,"s":SPTranID,"u":UniqueLabelID}
            one_unique_id=UniqueLabelID

            


            #logger.info(f"this is {return_array}")

        
        """for uld in check_wastage:
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
            return_array[uld]['margin']=round(margin) """
    inserted = updated = errors = 0
    for uid, row in return_array.items():
        try:
            voucher_date_norm = datetime.strptime(row['voucher_date'], "%d-%m-%Y").strftime("%Y-%m-%d")
            label_no          = row['label_no']

            existing_name = frappe.db.get_value(
                "Diamond Margin",
                {"voucher_date": voucher_date_norm, "label_no": label_no},
                "name"
            )

            if False and existing_name:
                # ── UPDATE ──
                doc = frappe.get_doc("Diamond Margin", existing_name)
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
                doc.location                 = row['location']
                doc.location_code            = row['location_code']
                doc.other_charge_code        = row['other_charge_code']
                doc.diamond_in_product       = row['diamond_in_product']
                doc.total_diamond_wt         = float(row['total_diamond_wt'] or 0)
                doc.total_stone_wt           = float(row['total_stone_wt'] or 0)
                doc.is_plane_jewellery       = row['is_plain_jewellry']
                doc.diamond_purchase_amount  = int(row['diamond_purchase_amount'] or 0)
                doc.stone_purchase_amount    = int(row['stone_purchase_amount'] or 0)
                doc.purchase_rate            = int(row['purchase_rate'] or 0)
                doc.purchase_labour          = int(row['purchase_labour'] or 0)
                doc.purchase_amount          = int(row['purchase_amount'] or 0)
                doc.labout_amount            = int(row['labour_amount'] or 0)
                doc.other_charge_sale        = int(row['other_charge_sale'] or 0)
                doc.discount                 = int(row['discount'] or 0)
                doc.metal_amount             = int(row['metal_amount'] or 0)
                doc.diamond_amount           = int(row['diamond_amount'] or 0)
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
                    "doctype":               "Diamond Margin",
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
                    "location":              row['location'],
                    "location_code":         row['location_code'],
                    "other_charge_code":     row['other_charge_code'],
                    "diamond_in_product":    row['diamond_in_product'],
                    "total_diamond_wt":      float(row['total_diamond_wt'] or 0),
                    "total_stone_wt":        float(row['total_stone_wt'] or 0),
                    "is_plane_jewellery":    row['is_plain_jewellry'],
                    "diamond_purchase_amount": int(row['diamond_purchase_amount'] or 0),
                    "stone_purchase_amount": int(row['stone_purchase_amount'] or 0),
                    "purchase_rate":         int(row['purchase_rate'] or 0),
                    "purchase_labour":       int(row['purchase_labour'] or 0),
                    "purchase_amount":       int(row['purchase_amount'] or 0),
                    "labout_amount":         int(row['labour_amount'] or 0),
                    "other_charge_sale":     int(row['other_charge_sale'] or 0),
                    "discount":              int(row['discount'] or 0),
                    "metal_amount":          int(row['metal_amount'] or 0),
                    "diamond_amount":        int(row['diamond_amount'] or 0),
                    "stone_amount":        int(row['stone_amount'] or 0),
                    "sales_amount":          int(row['sales_amount'] or 0),
                    "margin":                int(row['margin'] or 0),
                    "margin_percentage":     float(row['margin_percentage'] or 0),
                    "uniquelabelid": row["u"],
                    "sptranid":row["s"]
                })
                doc.insert(ignore_permissions=True)
                frappe.db.commit()
                inserted += 1
                #logger.info(f"[INSERT] voucher_date={voucher_date_norm}  label_no={label_no}")

        except Exception as e:
            errors += 1
            logger.error(f"[ERROR] uid={uid}  label_no={row.get('label_no')}  error={e}")

    logger.info(f"Diamond Margin sync complete — inserted={inserted}  updated={updated}  errors={errors}")

    #frappe.db.set_value("gl_from", doc_name1234, "from_date",to_date1 )
    #frappe.db.commit()
    return {"inserted": inserted, "updated": updated, "errors": errors ,"voucher_date":from_date}    
