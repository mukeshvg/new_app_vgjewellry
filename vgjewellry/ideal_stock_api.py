import frappe
import pyodbc
import os
import pandas as pd


value = os.getenv('sjodbc')

def connect():
    conn = pyodbc.connect(value, autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION, pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn

@frappe.whitelist(allow_guest=True)
def get_ideal_stock(from_date, to_date):
    get_stock_data(from_date,to_date)
    get_sale_data(from_date,to_date)

    doc = frappe.get_doc({
        "doctype":"ideal_stock_dates",
        "from_date":from_date,
        "to_date":to_date
        })
    doc.save()
    frappe.db.commit()
    return calculate_ideal_stock()

def get_mid_weight(row):
        if(row["Weight_Range"]==">380"):
            return 500
        num1, num2 = [float(x.strip()) for x in row["Weight_Range"].split('-')]
        mid = (num1 + num2) / 2
        return mid


@frappe.whitelist(allow_guest=True)
def set_target_stock(target_stock):
    target_stock = float(target_stock)
    last_doc = frappe.get_all(
    "ideal_stock_dates",                
    order_by="creation desc",   
    limit_page_length=1            
)
    if last_doc:
        doc_name = last_doc[0].name
        doc = frappe.get_doc("ideal_stock_dates", doc_name)

        # Update fields
        doc.target = target_stock
        # Save changes
        doc.save()
        frappe.db.commit()

    dict_list= calculate_ideal_stock()
    total_ideal_stock = sum(d["Ideal_Stock"] for d in dict_list)
    for d in dict_list:
        ideal_stock = float(d["Ideal_Stock"])
        d["Target_Stock"]= round(target_stock * ideal_stock /total_ideal_stock,2)
        mid_wt=get_mid_weight(d)
        df["Target_Pcs"] = (df["Target_Stock"] / mid_wt).round().astype(int)
    return dict_list    
    

def get_stock_data_old2(from_date, to_date):
    con = connect()
    cursor = con.cursor()

    full_query = r'''
    IF OBJECT_ID('tempdb..#LabelData') IS NOT NULL DROP TABLE #LabelData;
IF OBJECT_ID('tempdb..#LabelDays') IS NOT NULL DROP TABLE #LabelDays;

DECLARE 
    @FromDate DATE = (?),
    @ToDate   DATE = (?);

-- Step 1️⃣: Prepare Label Data with latest transaction info
SELECT 
    lb.LabelNo,
    lb.NetWt,
    lb.ItemMstID,
    lb.BranchID,
    lb.VouDate,
    lb.NextVouDate,
    lt.LatestItemMstID,
    lt.LatestVarietyMstId,
    lt.ItemName,
    lt.VarietyName,
    lt.BranchShortCode
INTO #LabelData
FROM [D:\ORNNX\ORNATENXDATA\DATA\SVGL\SVGL.MDF].dbo.LabelDtWiseBal lb
CROSS APPLY (
    SELECT TOP 1
        lt.ItemMstID AS LatestItemMstID,
        lt.VarietyMstId AS LatestVarietyMstId,
        im.ItemName,
        vm.VarietyName,
        bm.BranchName AS BranchShortCode
    FROM dbo.LabelTransaction lt
    LEFT JOIN dbo.ItemMst im ON im.ItemMstID = lt.ItemMstID
    LEFT JOIN dbo.VarietyMst vm ON vm.VarietyMstId = lt.VarietyMstId
    LEFT JOIN dbo.BranchMaster bm ON bm.BranchID = lb.BranchID
    WHERE lt.LabelNo = lb.LabelNo
    ORDER BY lt.LabelTransID DESC
) lt
WHERE lb.NetWt > 0
  AND lb.NextVouDate >= @FromDate
  AND lb.VouDate <= @ToDate
  AND lb.ItemTradMstID = 1002;

-- Step 2️⃣: Expand each label into individual active dates
SELECT
    l.BranchID,
    l.ItemMstID,
    l.LatestVarietyMstId AS VarietyMstId,
    l.ItemName,
    l.VarietyName,
    l.BranchShortCode,
    l.LabelNo,
    l.NetWt,
    CASE 
        WHEN l.NetWt <= 5 THEN '0-5'
        WHEN l.NetWt <= 10 THEN '5.001-10'
        WHEN l.NetWt <= 15 THEN '10.001-15'
        WHEN l.NetWt <= 20 THEN '15.001-20'
        WHEN l.NetWt <= 25 THEN '20.001-25'
        WHEN l.NetWt <= 30 THEN '25.001-30'
        WHEN l.NetWt <= 35 THEN '30.001-35'
        WHEN l.NetWt <= 40 THEN '35.001-40'
        WHEN l.NetWt <= 45 THEN '40.001-45'
        WHEN l.NetWt <= 50 THEN '45.001-50'
        WHEN l.NetWt <= 55 THEN '50.001-55'
        WHEN l.NetWt <= 60 THEN '55.001-60'
        WHEN l.NetWt <= 65 THEN '60.001-65'
        WHEN l.NetWt <= 70 THEN '65.001-70'
        WHEN l.NetWt <= 75 THEN '70.001-75'
        WHEN l.NetWt <= 80 THEN '75.001-80'
        WHEN l.NetWt <= 85 THEN '80.001-85'
        WHEN l.NetWt <= 90 THEN '85.001-90'
        WHEN l.NetWt <= 95 THEN '90.001-95'
        WHEN l.NetWt <= 100 THEN '95.001-100'
        WHEN l.NetWt <= 120 THEN '100.001-120'
        WHEN l.NetWt <= 140 THEN '120.001-140'
        WHEN l.NetWt <= 160 THEN '140.001-160'
        WHEN l.NetWt <= 180 THEN '160.001-180'
        WHEN l.NetWt <= 200 THEN '180.001-200'
        WHEN l.NetWt <= 220 THEN '200.001-220'
        WHEN l.NetWt <= 240 THEN '220.001-240'
        WHEN l.NetWt <= 260 THEN '240.001-260'
        WHEN l.NetWt <= 280 THEN '260.001-280'
        WHEN l.NetWt <= 300 THEN '280.001-300'
        WHEN l.NetWt <= 320 THEN '300.001-320'
        WHEN l.NetWt <= 340 THEN '320.001-340'
        WHEN l.NetWt <= 360 THEN '340.001-360'
        WHEN l.NetWt <= 380 THEN '360.001-380'
        ELSE '>380'
    END AS WeightRange,
    DATEADD(DAY, n.number, 
        CASE WHEN l.VouDate < @FromDate THEN @FromDate ELSE l.VouDate END
    ) AS ActiveDate
INTO #LabelDays
FROM #LabelData l
INNER JOIN master..spt_values n 
    ON n.type = 'P'
    AND DATEADD(DAY, n.number, 
        CASE WHEN l.VouDate < @FromDate THEN @FromDate ELSE l.VouDate END
    ) <= CASE WHEN l.NextVouDate > @ToDate THEN @ToDate ELSE l.NextVouDate END;

-- Step 3️⃣: Aggregate by group, counting unique active days
SELECT 
    BranchID,
    ItemMstID,
    VarietyMstId,
    ItemName,
    VarietyName,
    BranchShortCode,
    WeightRange,
    COUNT(DISTINCT LabelNo) AS LabelCount,
    SUM(NetWt) AS TotalNetWt,
    COUNT(DISTINCT ActiveDate) AS TotalActiveDays
FROM #LabelDays
GROUP BY 
    BranchID,
    ItemMstID,
    VarietyMstId,
    ItemName,
    VarietyName,
    BranchShortCode,
    WeightRange
ORDER BY 
    BranchID,
    ItemMstID,
    VarietyMstId,
    TRY_CAST(LEFT(WeightRange, CHARINDEX('-', WeightRange + '-') - 1) AS DECIMAL(10,3));

    '''

    cursor.execute(full_query, (from_date, to_date))

    # Skip all intermediate non-result sets until we reach the final SELECT
    while True:
        try:
            if cursor.description:  # means this set has columns => it's the final SELECT
                break
            if not cursor.nextset():  # no more sets
                break
        except pyodbc.ProgrammingError:
            break

    # Now fetch the actual data
    rows = cursor.fetchall()
    
    frappe.db.sql("TRUNCATE TABLE `tabStockDataForIdeal`")
    frappe.db.commit()

    fields = [
        "name",    
        "branch_id",
        "item_id",
        "variety_id",
        "item",
        "variety",
        "branch",
        "weight_range",
        "label_count",
        "total_net_wt",
        "days_present",
        "avg_stock"
    ]

    # Convert fetched data into list of tuples

    values = []
    for i, row in enumerate(rows, start=1):
        total_net_wt=row[8]
        days_present=row[9]
        avg_stock=round((total_net_wt/days_present),2)
        values.append((str(i),) + tuple(row)+(avg_stock,))

    # Insert all records quickly
    frappe.db.bulk_insert("StockDataForIdeal", fields, values)

    frappe.db.commit()
    
    cursor.close()
    con.close()
    return f"{len(values)} records inserted successfully123"

def get_sale_data_old2(from_date, to_date):
    con = connect()
    cursor = con.cursor()

    full_query = r'''
    ;WITH Base AS (
    SELECT
        s.BranchID,
        bm.BranchName,
        s.ItemMstID,
        im.ItemName,
        s.VarietyMstID,
        vm.VarietyName,
        s.LabelNo,
        s.NetWt,
        CASE
            WHEN s.NetWt BETWEEN 0 AND 5 THEN '0-5'
            WHEN s.NetWt BETWEEN 5.001 AND 10 THEN '5.001-10'
            WHEN s.NetWt BETWEEN 10.001 AND 15 THEN '10.001-15'
            WHEN s.NetWt BETWEEN 15.001 AND 20 THEN '15.001-20'
            WHEN s.NetWt BETWEEN 20.001 AND 25 THEN '20.001-25'
            WHEN s.NetWt BETWEEN 25.001 AND 30 THEN '25.001-30'
            WHEN s.NetWt BETWEEN 30.001 AND 35 THEN '30.001-35'
            WHEN s.NetWt BETWEEN 35.001 AND 40 THEN '35.001-40'
            WHEN s.NetWt BETWEEN 40.001 AND 45 THEN '40.001-45'
            WHEN s.NetWt BETWEEN 45.001 AND 50 THEN '45.001-50'
            WHEN s.NetWt BETWEEN 50.001 AND 55 THEN '50.001-55'
            WHEN s.NetWt BETWEEN 55.001 AND 60 THEN '55.001-60'
            WHEN s.NetWt BETWEEN 60.001 AND 65 THEN '60.001-65'
            WHEN s.NetWt BETWEEN 65.001 AND 70 THEN '65.001-70'
            WHEN s.NetWt BETWEEN 70.001 AND 75 THEN '70.001-75'
            WHEN s.NetWt BETWEEN 75.001 AND 80 THEN '75.001-80'
            WHEN s.NetWt BETWEEN 80.001 AND 85 THEN '80.001-85'
            WHEN s.NetWt BETWEEN 85.001 AND 90 THEN '85.001-90'
            WHEN s.NetWt BETWEEN 90.001 AND 95 THEN '90.001-95'
            WHEN s.NetWt BETWEEN 95.001 AND 100 THEN '95.001-100'
            WHEN s.NetWt BETWEEN 100.001 AND 120 THEN '100.001-120'
            WHEN s.NetWt BETWEEN 120.001 AND 140 THEN '120.001-140'
            WHEN s.NetWt BETWEEN 140.001 AND 160 THEN '140.001-160'
            WHEN s.NetWt BETWEEN 160.001 AND 180 THEN '160.001-180'
            WHEN s.NetWt BETWEEN 180.001 AND 200 THEN '180.001-200'
            WHEN s.NetWt BETWEEN 200.001 AND 220 THEN '200.001-220'
            WHEN s.NetWt BETWEEN 220.001 AND 240 THEN '220.001-240'
            WHEN s.NetWt BETWEEN 240.001 AND 260 THEN '240.001-260'
            WHEN s.NetWt BETWEEN 260.001 AND 280 THEN '260.001-280'
            WHEN s.NetWt BETWEEN 280.001 AND 300 THEN '280.001-300'
            WHEN s.NetWt BETWEEN 300.001 AND 320 THEN '300.001-320'
            WHEN s.NetWt BETWEEN 320.001 AND 340 THEN '320.001-340'
            WHEN s.NetWt BETWEEN 340.001 AND 360 THEN '340.001-360'
            WHEN s.NetWt BETWEEN 360.001 AND 380 THEN '360.001-380'
            ELSE '>380'
        END AS WeightRange
    FROM [D:\ORNNX\ORNATENXDATA\DATA\SVGL\SVGL.MDF].dbo.SPTran AS s
    LEFT JOIN dbo.ItemMst im ON s.ItemMstID = im.ItemMstID
    LEFT JOIN dbo.VarietyMst vm ON s.VarietyMstID = vm.VarietyMstId
    LEFT JOIN dbo.BranchMaster bm ON s.BranchID = bm.BranchID
    WHERE s.VouType = 'SL'
      AND s.VouDate >= (?)
      AND s.VouDate <= (?)
      AND s.ItemTradMstID = 1002
)
SELECT
    BranchID,
    BranchName,
    ItemMstID,
    ItemName,
    VarietyMstID,
    VarietyName,
    WeightRange,
    COUNT(*) AS LabelCount,
    SUM(NetWt) AS TotalNetWt
FROM Base
GROUP BY
    BranchID,
    BranchName,
    ItemMstID,
    ItemName,
    VarietyMstID,
    VarietyName,
    WeightRange
ORDER BY
    BranchID,
    ItemMstID,
    VarietyMstID,
    TRY_CAST(LEFT(WeightRange, CHARINDEX('-', WeightRange + '-') - 1) AS DECIMAL(10,3));

    '''

    cursor.execute(full_query, (from_date, to_date))

    # Skip all intermediate non-result sets until we reach the final SELECT
    while True:
        try:
            if cursor.description:  # means this set has columns => it's the final SELECT
                break
            if not cursor.nextset():  # no more sets
                break
        except pyodbc.ProgrammingError:
            break

    # Now fetch the actual data
    rows = cursor.fetchall()
    
    frappe.db.sql("TRUNCATE TABLE `tabSaleDataForIdeal`")
    frappe.db.commit()

    fields = [
        "name",    
        "branch_id",
        "branch",
        "item_id",
        "item",
        "variety_id",
        "variety",
        "weight_range",
        "label_count",
        "total_net_wt",
    ]

    # Convert fetched data into list of tuples

    values = []
    for i, row in enumerate(rows, start=1):
        values.append((str(i),) + tuple(row))

    # Insert all records quickly
    frappe.db.bulk_insert("SaleDataForIdeal", fields, values)

    frappe.db.commit()

    cursor.close()
    con.close()

    return f"{len(values)} records inserted successfully456"


import json

@frappe.whitelist(allow_guest=True)
def calculate_ideal_stock():
    query = """
    SELECT branch, item, variety, weight_range, avg_stock ,branch_id ,item_id,variety_id
    FROM `tabStockDataForIdeal` """
    rows = frappe.db.sql(query, as_dict=True)
    stock_data = [[row["branch_id"],row["item_id"],row["variety_id"],row["branch"], row["item"], row["variety"], row["weight_range"], row["avg_stock"]] for row in rows]

    query1 = """
    SELECT branch, item, variety, weight_range, total_net_wt,branch_id ,item_id,variety_id  FROM `tabSaleDataForIdeal`  
"""
    rows1 = frappe.db.sql(query1, as_dict=True)
    sales_data = [[row["branch_id"],row["item_id"],row["variety_id"],row["branch"], row["item"], row["variety"], row["weight_range"], row["total_net_wt"]] for row in rows1]


    sales_df = pd.DataFrame(sales_data, columns=["Branch Id","Item Id","Variety Id","Branch", "Item", "Variety", "Weight_Range",  "Sales_Weight"])
    stock_df = pd.DataFrame(stock_data, columns=["Branch Id","Item Id","Variety Id","Branch","Item", "Variety", "Weight_Range",  "Stock_Weight"])


    #df = pd.merge(sales_df, stock_df, on=["Branch", "Item", "Variety", "Weight_Range"], how="left")
    df = pd.merge(stock_df, sales_df, on=["Branch", "Item", "Variety", "Weight_Range"], how="left")

    # --- Convert to numeric safely ---
    df["Sales_Weight"] = pd.to_numeric(df["Sales_Weight"], errors='coerce').fillna(0)
    df["Stock_Weight"] = pd.to_numeric(df["Stock_Weight"], errors='coerce').fillna(0)


    # --- Calculate STR safely ---
    df["STR"] = df.apply(lambda x: round(x["Sales_Weight"] / x["Stock_Weight"], 2) if x["Stock_Weight"] > 0 else 0, axis=1)
    

    df["Sales_Weight"] = df["Sales_Weight"].astype(float)
    df["Stock_Weight"] = df["Stock_Weight"].astype(float)


    # Using apply with resetting index
    df_gast = df.groupby(["Branch", "Item", "Variety"]).apply(
    lambda g: g.assign(GAST=round(g["Sales_Weight"].sum() / g["Stock_Weight"].sum(),2) if g["Stock_Weight"].sum() > 0 else 0)
).reset_index(drop=True)

    # Now merge the result back into the original DataFrame based on the common index
    df = df.merge(df_gast[["Branch", "Item", "Variety", "GAST"]], on=["Branch", "Item", "Variety"], how="inner")
    df = df.drop_duplicates(subset=["Branch", "Item", "Variety", "Sales_Weight", "Stock_Weight"])



    # --- Group average sales ---
    df["Group_Avg_Sales"] = df.groupby(["Branch", "Item", "Variety"])["Sales_Weight"].transform("mean")

    # --- Add Serial Number ---
    df.insert(0, "S.No", range(1, len(df) + 1))

    # --- Return the DataFrame itself (not a string!) ---

    def quadrant(row):
        if row["Sales_Weight"] >= row["Group_Avg_Sales"] and row["STR"] >= row["GAST"]:
            return "Q4 – High Appeal"
        elif row["Sales_Weight"] < row["Group_Avg_Sales"] and row["STR"] >= row["GAST"]:
            return "Q3 – Evolving"
        elif row["Sales_Weight"] >= row["Group_Avg_Sales"] and row["STR"] < row["GAST"]:
            return "Q2 – Saturated"
        else:
            return "Q1 – Low Appeal"

    df["Quadrant"] = df.apply(quadrant, axis=1)


    def ideal_stock(row):
        if row["Quadrant"] == "Q1 – Low Appeal":
            return round(row["Stock_Weight"] * 0.75,3)
        elif row["Quadrant"] == "Q2 – Saturated":
            return round(row["Sales_Weight"] / row["GAST"],3)
        else:
            return round(row["Stock_Weight"],3)

    df["Ideal_Stock"] = df.apply(ideal_stock, axis=1)
     
    

    def mid_weight(row):
        if(row["Weight_Range"]==">380"):
            return 500
        num1, num2 = [float(x.strip()) for x in row["Weight_Range"].split('-')]
        mid = (num1 + num2) / 2
        return mid

    mid_wt = df.apply(mid_weight, axis=1)
    # --- Step 8: Calculate difference (for stock correction) ---
    df["Correction"] = df["Ideal_Stock"] - df["Stock_Weight"]
    df["Ideal_Pcs"] = (df["Ideal_Stock"] / mid_wt).round().astype(int)
    data = df[["Branch", "Item", "Variety", "Weight_Range", "Sales_Weight", "Stock_Weight","STR", "GAST", "Quadrant", "Ideal_Stock", "Ideal_Stock","Ideal_Pcs","Ideal_Pcs"]].values.tolist()
    columns = [
    "Branch", "Item", "Variety", "Weight_Range",
    "Sales_Weight", "Stock_Weight", "STR", "GAST",
    "Quadrant", "Ideal_Stock", "Target_Stock","Ideal_Pcs","Target_Pcs"
]


    frappe.db.sql("TRUNCATE TABLE `tabIdeal_Stock`")
    frappe.db.commit()
    fields = [
        "name",    
        "branch_id",
        "item_id",
        "variety_id",
        "branch",
        "item",
        "variety",
        "weight_range",
        "sales_weight",
        "stock_weight",
        "stock_turn",
        "group_average_stock_turn",
        "quadrant",
        "ideal_stock",
        "target_stock",
        "ideal_pcs",
        "target_pcs"
    ]

    # Convert fetched data into list of tuples

    db_insert_data=df[["Branch Id_x","Item Id_x","Variety Id_x","Branch", "Item", "Variety", "Weight_Range", "Sales_Weight", "Stock_Weight","STR", "GAST", "Quadrant", "Ideal_Stock", "Ideal_Stock","Ideal_Pcs","Ideal_Pcs"]].values.tolist()
    values = []
    for i, row in enumerate(db_insert_data, start=1):
        values.append((i,) + tuple(row))
    # Insert all records quickly
    frappe.db.bulk_insert("Ideal_Stock", fields, values)

    frappe.db.commit()

    dict_list = [dict(zip(columns, row)) for row in data]
    return dict_list

@frappe.whitelist(allow_guest=True)
def get_current_stock_old():
    con = connect()
    cursor = con.cursor()

    full_query = r'''
IF OBJECT_ID('tempdb..#LabelData1') IS NOT NULL DROP TABLE #LabelData1;
IF OBJECT_ID('tempdb..#LabelDays1') IS NOT NULL DROP TABLE #LabelDays1;


-- Step 1⃣: Prepare Label Data with latest transaction info
SELECT
    lb.LabelNo,
    lb.NetWt,
    lb.ItemMstID,
    lb.BranchID,
    
    lt.LatestItemMstID,
    lt.LatestVarietyMstId,
    lt.ItemName,
    lt.VarietyName,
    lt.BranchShortCode
INTO #LabelData1
FROM [D:\ORNNX\ORNATENXDATA\DATA\SVGL\SVGL.MDF].dbo.LabelBalance lb
CROSS APPLY (
    SELECT TOP 1
        lt.ItemMstID AS LatestItemMstID,
        lt.VarietyMstId AS LatestVarietyMstId,
        im.ItemName,
        vm.VarietyName,
        bm.BranchName AS BranchShortCode
    FROM dbo.LabelTransaction lt
    LEFT JOIN dbo.ItemMst im ON im.ItemMstID = lt.ItemMstID
    LEFT JOIN dbo.VarietyMst vm ON vm.VarietyMstId = lt.VarietyMstId
    LEFT JOIN dbo.BranchMaster bm ON bm.BranchID = lb.BranchID
    WHERE lt.LabelNo = lb.LabelNo
    ORDER BY lt.LabelTransID DESC
    ) lt
WHERE lb.NetWt > 0
  AND lb.ItemTradMstID = 1002;

-- Step 2⃣: Expand each label into individual active dates
SELECT
    l.BranchID,
    l.ItemMstID,
    l.LatestVarietyMstId AS VarietyMstId,
    l.ItemName,
    l.VarietyName,
    l.BranchShortCode,
    l.LabelNo,
    l.NetWt,
    CASE
        WHEN l.NetWt <= 5 THEN '0-5'
        WHEN l.NetWt <= 10 THEN '5.001-10'
        WHEN l.NetWt <= 15 THEN '10.001-15'
        WHEN l.NetWt <= 20 THEN '15.001-20'
        WHEN l.NetWt <= 25 THEN '20.001-25'
        WHEN l.NetWt <= 30 THEN '25.001-30'
        WHEN l.NetWt <= 35 THEN '30.001-35'
        WHEN l.NetWt <= 40 THEN '35.001-40'
        WHEN l.NetWt <= 45 THEN '40.001-45'
        WHEN l.NetWt <= 50 THEN '45.001-50'
        WHEN l.NetWt <= 55 THEN '50.001-55'
        WHEN l.NetWt <= 60 THEN '55.001-60'
        WHEN l.NetWt <= 65 THEN '60.001-65'
        WHEN l.NetWt <= 70 THEN '65.001-70'
        WHEN l.NetWt <= 75 THEN '70.001-75'
        WHEN l.NetWt <= 80 THEN '75.001-80'
        WHEN l.NetWt <= 85 THEN '80.001-85'
        WHEN l.NetWt <= 90 THEN '85.001-90'
        WHEN l.NetWt <= 95 THEN '90.001-95'
        WHEN l.NetWt <= 100 THEN '95.001-100'
        WHEN l.NetWt <= 120 THEN '100.001-120'
        WHEN l.NetWt <= 140 THEN '120.001-140'
        WHEN l.NetWt <= 160 THEN '140.001-160'
        WHEN l.NetWt <= 180 THEN '160.001-180'
        WHEN l.NetWt <= 200 THEN '180.001-200'
        WHEN l.NetWt <= 220 THEN '200.001-220'
        WHEN l.NetWt <= 240 THEN '220.001-240'
        WHEN l.NetWt <= 260 THEN '240.001-260'
        WHEN l.NetWt <= 280 THEN '260.001-280'
        WHEN l.NetWt <= 300 THEN '280.001-300'
        WHEN l.NetWt <= 320 THEN '300.001-320'
        WHEN l.NetWt <= 340 THEN '320.001-340'
        WHEN l.NetWt <= 360 THEN '340.001-360'
        WHEN l.NetWt <= 380 THEN '360.001-380'
        ELSE '>380'
    END AS WeightRange
INTO #LabelDays1
FROM #LabelData1 l

-- Step 3⃣: Aggregate by group, counting unique active days
SELECT
    BranchID,
    ItemMstID,
    VarietyMstId,
    ItemName,
    VarietyName,
    BranchShortCode,
    WeightRange,
    COUNT(DISTINCT LabelNo) AS LabelCount,
    SUM(NetWt) AS TotalNetWt
    FROM #LabelDays1
GROUP BY
    BranchID,
    ItemMstID,
    VarietyMstId,
    ItemName,
    VarietyName,
    BranchShortCode,
    WeightRange
ORDER BY
    BranchID,
    ItemMstID,
    VarietyMstId,
    TRY_CAST(LEFT(WeightRange, CHARINDEX('-', WeightRange + '-') - 1) AS DECIMAL(10,3));

    '''

    cursor.execute(full_query, ())

    # Skip all intermediate non-result sets until we reach the final SELECT
    while True:
        try:
            if cursor.description:  # means this set has columns => it's the final SELECT
                break
            if not cursor.nextset():  # no more sets
                break
        except pyodbc.ProgrammingError:
            break

    # Now fetch the actual data
    rows = cursor.fetchall()
    
    frappe.db.sql("TRUNCATE TABLE `tabCurrent_Stock_Ideal_Stock`")
    frappe.db.commit()

    fields = [
        "name",    
        "branch_id",
        "item_id",
        "variety_id",
        "item",
        "variety",
        "branch",
        "weight_range",
        "stock_pcs",
        "stock_weight"
    ]

    # Convert fetched data into list of tuples

    values = []
    for i, row in enumerate(rows, start=1):
        values.append((i,) + tuple(row))

    
    # Insert all records quickly
    frappe.db.bulk_insert("Current_Stock_Ideal_Stock", fields, values)

    frappe.db.commit()
    
    cursor.close()
    con.close()
    compare_cureent_stock_with_ideal_stock()
    return f"{len(values)} records inserted successfully123"

def compare_cureent_stock_with_ideal_stock():
    
    query = """
    UPDATE tabCurrent_Stock_Ideal_Stock AS c
JOIN tabIdeal_Stock AS i
    ON  c.branch_id   = i.branch_id
    AND c.item_id     = i.item_id
    AND c.variety_id  = i.variety_id
    AND c.weight_range = i.weight_range
SET
    c.ideal_weight = i.ideal_stock,
    c.target_pcs = i.target_pcs,
    c.total_sale_weight=i.sales_weight,
    c.avg_stock_weight=i.stock_weight,
    c.stock_turn=i.stock_turn,
    c.group_average_stock_turn=i.group_average_stock_turn,
    c.quadrant=i.quadrant
"""
    frappe.db.sql(query)
    data = frappe.db.sql("""
        SELECT branch, item, variety, weight_range,total_sale_weight,avg_stock_weight,stock_turn,group_average_stock_turn,quadrant, ideal_weight ,stock_weight,stock_pcs,target_pcs  FROM `tabCurrent_Stock_Ideal_Stock`
    """, as_list=True)

    columns = [
    "branch", "item", "variety", "weight_range","total_sale_weight","avg_stock_weight","stock_turn","group_average_stock_turn","quadrant", "ideal_weight", "stock_weight", "stock_pcs","target_pcs"
]

    dict_list = [dict(zip(columns, row)) for row in data]

    return dict_list



@frappe.whitelist()
def get_todays_stock(branch, item, variety=None, weight_range=None):
    # Validate mandatory fields
    if not branch or not item:
        frappe.throw("Branch and Item are required fields.")

    # Base query
    query = """
        SELECT branch, item, variety, weight_range, ideal_weight, stock_weight, stock_pcs , target_pcs
        FROM `tabCurrent_Stock_Ideal_Stock`
        WHERE branch_id=%s AND item_id=%s
    """

    # Parameters for SQL placeholders
    params = [branch, item]

    # Add optional filters
    if variety:
        query += " AND variety_id=%s"
        params.append(variety)

    if weight_range:
        query += " AND weight_range=%s"
        params.append(weight_range)

    # Execute query safely
    data = frappe.db.sql(query, tuple(params), as_dict=True)

    return data

@frappe.whitelist()
def get_current_stock_for_admin():

    data = frappe.db.sql("""
        SELECT branch, item, variety, weight_range,total_sale_weight,avg_stock_weight,stock_turn,group_average_stock_turn,quadrant, ideal_weight ,stock_weight,stock_pcs,target_pcs  FROM `tabCurrent_Stock_Ideal_Stock`
    """, as_list=True)

    columns = [
    "branch", "item", "variety", "weight_range","total_sale_weight","avg_stock_weight","stock_turn","group_average_stock_turn","quadrant", "ideal_weight", "stock_weight", "stock_pcs","target_pcs"
]

    dict_list = [dict(zip(columns, row)) for row in data]

    return dict_list

@frappe.whitelist()
def get_ideal_stock_date():
    query = """
        SELECT from_date, to_date, target
        FROM `tabideal_stock_dates` order by creation desc limit 1
    """
    data = frappe.db.sql(query, (), as_dict=True)
    return data

from decimal import Decimal
@frappe.whitelist(allow_guest=True)
def get_stock_data(from_date, to_date):

    # 1️⃣ Fetch weight ranges from Frappe DocType
    weight_ranges = frappe.get_all("weight_range", fields=["item_id", "weight_range"])

    # 2️⃣ Connect to SQL Server
    con = connect()
    cursor = con.cursor()

    # 3️⃣ Drop & create #WeightRange temp table
    cursor.execute("IF OBJECT_ID('tempdb..#WeightRange') IS NOT NULL DROP TABLE #WeightRange;")
    cursor.execute("""
    CREATE TABLE #WeightRange (
        item_id INT, 
        MinWt DECIMAL(10,3), 
        MaxWt DECIMAL(10,3),
        weight_range VARCHAR(50)
    );
    """)
    con.commit()

    # 4️⃣ Insert weight ranges into temp table
    for wr in weight_ranges:
        if "-" not in wr["weight_range"]:
            return wr["weight_range"]+wr['item_id']
        num1, num2 = wr["weight_range"].replace(" ", "").split("-")
        MinWt = float(Decimal(num1))
        MaxWt = float(Decimal(num2))
        cursor.execute(
            "INSERT INTO #WeightRange (item_id, MinWt, MaxWt, weight_range) VALUES (?, ?, ?, ?)",
            (wr["item_id"], MinWt, MaxWt, wr["weight_range"])
        )
    con.commit()

    # 5️⃣ Define date range
    #from_date = '2025-04-01'
    #to_date = '2025-11-01'

    # 6️⃣ Main SQL with SET NOCOUNT ON
    cursor.execute("""
SET NOCOUNT ON;

IF OBJECT_ID('tempdb..#LabelData') IS NOT NULL DROP TABLE #LabelData;
IF OBJECT_ID('tempdb..#LabelDays') IS NOT NULL DROP TABLE #LabelDays;

-- Step 1: Prepare Label Data
SELECT 
    lb.LabelNo,
    lb.NetWt,
    lb.ItemMstID,
    lb.BranchID,
    lb.VouDate,
    lb.NextVouDate,
    lt.LatestItemMstID,
    lt.LatestVarietyMstId,
    lt.ItemName,
    lt.VarietyName,
    lt.BranchShortCode
INTO #LabelData
FROM [D:\\ORNNX\\ORNATENXDATA\\DATA\\SVGL\\SVGL.MDF].dbo.LabelDtWiseBal lb
CROSS APPLY (
    SELECT TOP 1
        lt.ItemMstID AS LatestItemMstID,
        lt.VarietyMstId AS LatestVarietyMstId,
        im.ItemName,
        vm.VarietyName,
        bm.BranchName AS BranchShortCode
    FROM dbo.LabelTransaction lt
    LEFT JOIN dbo.ItemMst im ON im.ItemMstID = lt.ItemMstID
    LEFT JOIN dbo.VarietyMst vm ON vm.VarietyMstId = lt.VarietyMstId
    LEFT JOIN dbo.BranchMaster bm ON bm.BranchID = lb.BranchID
    WHERE lt.LabelNo = lb.LabelNo
    ORDER BY lt.LabelTransID DESC
) lt
WHERE lb.NetWt > 0
  AND lb.NextVouDate >= ?
  AND lb.VouDate <= ?
  AND lb.ItemTradMstID = 1002 ;

-- Step 2: Expand each label into individual active dates with dynamic weight range
SELECT
    l.BranchID,
    l.ItemMstID,
    l.LatestVarietyMstId AS VarietyMstId,
    l.ItemName,
    l.VarietyName,
    l.BranchShortCode,
    l.LabelNo,
    l.NetWt,
    wr.weight_range AS WeightRange,
    DATEADD(DAY, n.number, 
        CASE WHEN l.VouDate < ? THEN ? ELSE l.VouDate END
    ) AS ActiveDate
INTO #LabelDays
FROM #LabelData l
INNER JOIN master..spt_values n 
    ON n.type = 'P'
    AND DATEADD(DAY, n.number, 
        CASE WHEN l.VouDate < ? THEN ? ELSE l.VouDate END
    ) <= CASE WHEN l.NextVouDate > ? THEN ? ELSE l.NextVouDate END
LEFT JOIN #WeightRange wr
    ON wr.item_id = l.ItemMstID
   AND l.NetWt BETWEEN wr.MinWt AND wr.MaxWt;

-- Step 3: Aggregate
SELECT 
    BranchID,
    ItemMstID,
    VarietyMstId,
    ItemName,
    VarietyName,
    BranchShortCode,
    WeightRange,
    COUNT(DISTINCT LabelNo) AS LabelCount,
    SUM(NetWt) AS TotalNetWt,
    COUNT(DISTINCT ActiveDate) AS TotalActiveDays
FROM #LabelDays
GROUP BY 
    BranchID,
    ItemMstID,
    VarietyMstId,
    ItemName,
    VarietyName,
    BranchShortCode,
    WeightRange
ORDER BY 
    BranchID,
    ItemMstID,
    VarietyMstId,
    TRY_CAST(LEFT(WeightRange, CHARINDEX('-', WeightRange + '-') - 1) AS DECIMAL(10,3));
""", (from_date, to_date, from_date, from_date, from_date, from_date, to_date, to_date))

    # 7️⃣ Fetch only the final SELECT results
    rows = cursor.fetchall()
    while True:
        try:
            if cursor.description:  # means this set has columns => it's the final SELECT
                break
            if not cursor.nextset():  # no more sets
                break
        except pyodbc.ProgrammingError:
            break

    # Now fetch the actual data
    #rows = cursor.fetchall()
    
    frappe.db.sql("TRUNCATE TABLE `tabStockDataForIdeal`")
    frappe.db.commit()

    fields = [
        "name",    
        "branch_id",
        "item_id",
        "variety_id",
        "item",
        "variety",
        "branch",
        "weight_range",
        "label_count",
        "total_net_wt",
        "days_present",
        "avg_stock"
    ]

    # Convert fetched data into list of tuples

    values = []
    for i, row in enumerate(rows, start=1):
        total_net_wt=row[8]
        days_present=row[9]
        avg_stock=round((total_net_wt/days_present),2)
        values.append((str(i),) + tuple(row)+(avg_stock,))

    # Insert all records quickly
    frappe.db.bulk_insert("StockDataForIdeal", fields, values)

    frappe.db.commit()

    frappe.db.sql("delete from tabStockDataForIdeal where weight_range is null")
    frappe.db.commit()

    cursor.close()
    con.close()
    return f"{len(values)} records inserted successfully"
    columns = [column[0] for column in cursor.description]
    result = [{columns[i]: row[i] for i in range(len(columns))} for row in rows]

    cursor.close()
    con.close()
    return result
    
@frappe.whitelist(allow_guest=True)    
def get_sale_data(from_date, to_date):
    con = connect()
    cursor = con.cursor()
    
    weight_ranges = frappe.get_all("weight_range", fields=["item_id", "weight_range"])

    # 2️⃣ Connect to SQL Server
    con = connect()
    cursor = con.cursor()

    # 3️⃣ Drop & create #WeightRange temp table
    cursor.execute("IF OBJECT_ID('tempdb..#WeightRange2') IS NOT NULL DROP TABLE #WeightRange2;")
    cursor.execute("""
    CREATE TABLE #WeightRange2 (
        item_id INT, 
        MinWt DECIMAL(10,3), 
        MaxWt DECIMAL(10,3),
        weight_range VARCHAR(50)
    );
    """)
    con.commit()

    # 4️⃣ Insert weight ranges into temp table
    for wr in weight_ranges:
        if "-" not in wr["weight_range"]:
            return wr["weight_range"]+wr['item_id']
        num1, num2 = wr["weight_range"].replace(" ", "").split("-")
        MinWt = float(Decimal(num1))
        MaxWt = float(Decimal(num2))
        cursor.execute(
            "INSERT INTO #WeightRange2 (item_id, MinWt, MaxWt, weight_range) VALUES (?, ?, ?, ?)",
            (wr["item_id"], MinWt, MaxWt, wr["weight_range"])
        )
    con.commit()

    # 5️⃣ Define date range
    #from_date = '2025-04-01'
    #to_date = '2025-11-01'

    full_query = r'''
    ;WITH Base AS (
    SELECT
        s.BranchID,
        bm.BranchName,
        s.ItemMstID,
        im.ItemName,
        s.VarietyMstID,
        vm.VarietyName,
        s.LabelNo,
        s.NetWt,
        wr.weight_range 
        
    FROM [D:\ORNNX\ORNATENXDATA\DATA\SVGL\SVGL.MDF].dbo.SPTran AS s
    LEFT JOIN dbo.ItemMst im ON s.ItemMstID = im.ItemMstID
    LEFT JOIN dbo.VarietyMst vm ON s.VarietyMstID = vm.VarietyMstId
    LEFT JOIN dbo.BranchMaster bm ON s.BranchID = bm.BranchID
    LEFT JOIN #WeightRange2 wr 
        ON wr.item_id = s.ItemMstID
   AND s.NetWt BETWEEN wr.MinWt AND wr.MaxWt
    WHERE s.VouType = 'SL'
      AND s.VouDate >= (?)
      AND s.VouDate <= (?)
      AND s.ItemTradMstID = 1002
)
SELECT
    BranchID,
    BranchName,
    ItemMstID,
    ItemName,
    VarietyMstID,
    VarietyName,
    weight_range AS WeightRange,
    COUNT(*) AS LabelCount,
    SUM(NetWt) AS TotalNetWt
FROM Base
GROUP BY
    BranchID,
    BranchName,
    ItemMstID,
    ItemName,
    VarietyMstID,
    VarietyName,
    weight_range
ORDER BY
    BranchID,
    ItemMstID,
    VarietyMstID,
    TRY_CAST(LEFT(weight_range, CHARINDEX('-', weight_range + '-') - 1) AS DECIMAL(10,3));

    '''

    cursor.execute(full_query, (from_date, to_date))

    # Skip all intermediate non-result sets until we reach the final SELECT
    while True:
        try:
            if cursor.description:  # means this set has columns => it's the final SELECT
                break
            if not cursor.nextset():  # no more sets
                break
        except pyodbc.ProgrammingError:
            break

    # Now fetch the actual data
    rows = cursor.fetchall()
    
    frappe.db.sql("TRUNCATE TABLE `tabSaleDataForIdeal`")
    frappe.db.commit()

    fields = [
        "name",    
        "branch_id",
        "branch",
        "item_id",
        "item",
        "variety_id",
        "variety",
        "weight_range",
        "label_count",
        "total_net_wt",
    ]

    # Convert fetched data into list of tuples

    values = []
    for i, row in enumerate(rows, start=1):
        values.append((str(i),) + tuple(row))

    # Insert all records quickly
    frappe.db.bulk_insert("SaleDataForIdeal", fields, values)

    frappe.db.commit()

    frappe.db.sql("delete from tabSaleDataForIdeal where weight_range is null")
    frappe.db.commit()
    
    #columns = [column[0] for column in cursor.description]
    #result = [{columns[i]: row[i] for i in range(len(columns))} for row in rows]
    #return result
    cursor.close()
    con.close()

    return f"{len(values)} records inserted successfully456"
    
@frappe.whitelist(allow_guest=True)
def get_current_stock():
    con = connect()
    cursor = con.cursor()
    weight_ranges = frappe.get_all("weight_range", fields=["item_id", "weight_range"])
    
    # 3️⃣ Drop & create #WeightRange temp table
    cursor.execute("IF OBJECT_ID('tempdb..#WeightRange3') IS NOT NULL DROP TABLE #WeightRange3;")
    cursor.execute("""
    CREATE TABLE #WeightRange3 (
        item_id INT, 
        MinWt DECIMAL(10,3), 
        MaxWt DECIMAL(10,3),
        weight_range VARCHAR(50)
    );
    """)
    con.commit()
    
    # 4️⃣ Insert weight ranges into temp table
    for wr in weight_ranges:
        if "-" not in wr["weight_range"]:
            return wr["weight_range"]+wr['item_id']
        num1, num2 = wr["weight_range"].replace(" ", "").split("-")
        MinWt = float(Decimal(num1))
        MaxWt = float(Decimal(num2))
        cursor.execute(
            "INSERT INTO #WeightRange3 (item_id, MinWt, MaxWt, weight_range) VALUES (?, ?, ?, ?)",
            (wr["item_id"], MinWt, MaxWt, wr["weight_range"])
        )
    con.commit()

    full_query = r'''
IF OBJECT_ID('tempdb..#LabelData1') IS NOT NULL DROP TABLE #LabelData1;
IF OBJECT_ID('tempdb..#LabelDays1') IS NOT NULL DROP TABLE #LabelDays1;


-- Step 1⃣: Prepare Label Data with latest transaction info
SELECT
    lb.LabelNo,
    lb.NetWt,
    lb.ItemMstID,
    lb.BranchID,
    
    lt.LatestItemMstID,
    lt.LatestVarietyMstId,
    lt.ItemName,
    lt.VarietyName,
    lt.BranchShortCode
INTO #LabelData1
FROM [D:\ORNNX\ORNATENXDATA\DATA\SVGL\SVGL.MDF].dbo.LabelBalance lb
CROSS APPLY (
    SELECT TOP 1
        lt.ItemMstID AS LatestItemMstID,
        lt.VarietyMstId AS LatestVarietyMstId,
        im.ItemName,
        vm.VarietyName,
        bm.BranchName AS BranchShortCode
    FROM dbo.LabelTransaction lt
    LEFT JOIN dbo.ItemMst im ON im.ItemMstID = lt.ItemMstID
    LEFT JOIN dbo.VarietyMst vm ON vm.VarietyMstId = lt.VarietyMstId
    LEFT JOIN dbo.BranchMaster bm ON bm.BranchID = lb.BranchID
    WHERE lt.LabelNo = lb.LabelNo
    ORDER BY lt.LabelTransID DESC
    ) lt
WHERE lb.NetWt > 0
  AND lb.ItemTradMstID = 1002;

-- Step 2⃣: Expand each label into individual active dates
SELECT
    l.BranchID,
    l.ItemMstID,
    l.LatestVarietyMstId AS VarietyMstId,
    l.ItemName,
    l.VarietyName,
    l.BranchShortCode,
    l.LabelNo,
    l.NetWt,
    wr.weight_range AS WeightRange
    
    
INTO #LabelDays1
FROM #LabelData1 l LEFT JOIN #WeightRange3 wr
    ON wr.item_id = l.ItemMstID
   AND l.NetWt BETWEEN wr.MinWt AND wr.MaxWt;

-- Step 3⃣: Aggregate by group, counting unique active days
SELECT
    BranchID,
    ItemMstID,
    VarietyMstId,
    ItemName,
    VarietyName,
    BranchShortCode,
    WeightRange,
    COUNT(DISTINCT LabelNo) AS LabelCount,
    SUM(NetWt) AS TotalNetWt
    FROM #LabelDays1
GROUP BY
    BranchID,
    ItemMstID,
    VarietyMstId,
    ItemName,
    VarietyName,
    BranchShortCode,
    WeightRange
ORDER BY
    BranchID,
    ItemMstID,
    VarietyMstId,
    TRY_CAST(LEFT(WeightRange, CHARINDEX('-', WeightRange + '-') - 1) AS DECIMAL(10,3));

    '''

    cursor.execute(full_query, ())

    # Skip all intermediate non-result sets until we reach the final SELECT
    while True:
        try:
            if cursor.description:  # means this set has columns => it's the final SELECT
                break
            if not cursor.nextset():  # no more sets
                break
        except pyodbc.ProgrammingError:
            break

    # Now fetch the actual data
    rows = cursor.fetchall()
    
    frappe.db.sql("TRUNCATE TABLE `tabCurrent_Stock_Ideal_Stock`")
    frappe.db.commit()

    fields = [
        "name",    
        "branch_id",
        "item_id",
        "variety_id",
        "item",
        "variety",
        "branch",
        "weight_range",
        "stock_pcs",
        "stock_weight"
    ]

    # Convert fetched data into list of tuples

    values = []
    for i, row in enumerate(rows, start=1):
        values.append((i,) + tuple(row))

    
    # Insert all records quickly
    frappe.db.bulk_insert("Current_Stock_Ideal_Stock", fields, values)

    frappe.db.commit()
    
    cursor.close()
    con.close()
    compare_cureent_stock_with_ideal_stock()
    return f"{len(values)} records inserted successfully123"
    




   

