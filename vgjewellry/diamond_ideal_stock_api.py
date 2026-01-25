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
        "doctype":"ideal_stock_for_diamond_dates",
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
    

def get_stock_data(from_date, to_date):
    con = connect()
    cursor = con.cursor()

    full_query = r'''
    IF OBJECT_ID('tempdb..#DLabelData') IS NOT NULL DROP TABLE #DLabelData;
IF OBJECT_ID('tempdb..#DLabelDays') IS NOT NULL DROP TABLE #DLabelDays;

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
    lt.BranchShortCode
INTO #DLabelData
FROM [D:\ORNNX\ORNATENXDATA\DATA\SVGL\SVGL.MDF].dbo.LabelDtWiseBal lb
CROSS APPLY (
    SELECT TOP 1
        lt.ItemMstID AS LatestItemMstID,
        im.ItemName,
        bm.BranchName AS BranchShortCode
    FROM dbo.LabelTransaction lt
    LEFT JOIN dbo.ItemMst im ON im.ItemMstID = lt.ItemMstID
    LEFT JOIN dbo.BranchMaster bm ON bm.BranchID = lb.BranchID
    WHERE lt.LabelNo = lb.LabelNo
    ORDER BY lt.LabelTransID DESC
) lt
WHERE lb.NetWt > 0
  AND lb.NextVouDate >= @FromDate
  AND lb.VouDate <= @ToDate
  AND lb.ItemTradMstID = 1006;

-- Step 2️⃣: Expand each label into individual active dates
SELECT
    l.BranchID,
    l.ItemMstID,
    l.ItemName,
    l.BranchShortCode,
    l.LabelNo,
    l.DiamondWt,
    CASE
        WHEN l.DiamondWt <= 0.100 THEN '0-0.100'
    WHEN l.DiamondWt <= 0.200 THEN '0.101-0.200'
    WHEN l.DiamondWt <= 0.300 THEN '0.201-0.300'
    WHEN l.DiamondWt <= 0.400 THEN '0.301-0.400'
    WHEN l.DiamondWt <= 0.500 THEN '0.401-0.500'
    WHEN l.DiamondWt <= 0.700 THEN '0.501-0.700'
    WHEN l.DiamondWt <= 1.000 THEN '0.701-1.000'
    WHEN l.DiamondWt <= 1.250 THEN '1.001-1.250'
    WHEN l.DiamondWt <= 1.500 THEN '1.251-1.500'
    WHEN l.DiamondWt <= 1.750 THEN '1.501-1.750'
    WHEN l.DiamondWt <= 2.000 THEN '1.751-2.000'
    WHEN l.DiamondWt <= 2.250 THEN '2.001-2.250'
    WHEN l.DiamondWt <= 2.500 THEN '2.251-2.500'
    WHEN l.DiamondWt <= 3.000 THEN '2.501-3.000'
    WHEN l.DiamondWt <= 3.500 THEN '3.001-3.500'
    WHEN l.DiamondWt <= 4.000 THEN '3.501-4.000'
    WHEN l.DiamondWt <= 5.000 THEN '4.001-5.000'
    WHEN l.DiamondWt <= 6.000 THEN '5.001-6.000'
    WHEN l.DiamondWt <= 7.000 THEN '6.001-7.000'
    WHEN l.DiamondWt <= 8.000 THEN '7.001-8.000'
    WHEN l.DiamondWt <= 9.000 THEN '8.001-9.000'
    WHEN l.DiamondWt <= 10.000 THEN '9.001-10.000'
    WHEN l.DiamondWt <= 12.000 THEN '10.001-12.000'
    WHEN l.DiamondWt <= 15.000 THEN '12.001-15.000'
    WHEN l.DiamondWt <= 17.000 THEN '15.001-17.000'
    WHEN l.DiamondWt <= 20.000 THEN '17.001-20.000'
    WHEN l.DiamondWt <= 25.000 THEN '20.001-25.000'
    WHEN l.DiamondWt <= 30.000 THEN '25.001-30.000'
    WHEN l.DiamondWt <= 40.000 THEN '30.001-40.000'
    WHEN l.DiamondWt <= 50.000 THEN '40.001-50.000'
    WHEN l.DiamondWt <= 60.000 THEN '50.001-60.000'
    WHEN l.DiamondWt <= 70.000 THEN '60.001-70.000'
    WHEN l.DiamondWt <= 80.000 THEN '70.001-80.000'
    WHEN l.DiamondWt <= 90.000 THEN '80.001-90.000'
    WHEN l.DiamondWt <= 100.000 THEN '90.001-100.000'
    WHEN l.DiamondWt <= 999.000 THEN '100.001-999.000'
    END AS WeightRange,
    DATEADD(DAY, n.number, 
        CASE WHEN l.VouDate < @FromDate THEN @FromDate ELSE l.VouDate END
    ) AS ActiveDate
INTO #DLabelDays
FROM #DLabelData l
INNER JOIN master..spt_values n 
    ON n.type = 'P'
    AND DATEADD(DAY, n.number, 
        CASE WHEN l.VouDate < @FromDate THEN @FromDate ELSE l.VouDate END
    ) <= CASE WHEN l.NextVouDate > @ToDate THEN @ToDate ELSE l.NextVouDate END;

-- Step 3️⃣: Aggregate by group, counting unique active days
SELECT 
    BranchID,
    ItemMstID,
    ItemName,
    BranchShortCode,
    WeightRange,
    COUNT(DISTINCT LabelNo) AS LabelCount,
    SUM(NetWt) AS TotalNetWt,
    COUNT(DISTINCT ActiveDate) AS TotalActiveDays
FROM #DLabelDays
GROUP BY 
    BranchID,
    ItemMstID,
    ItemName,
    BranchShortCode,
    WeightRange
ORDER BY 
    BranchID,
    ItemMstID,
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
    
    frappe.db.sql("TRUNCATE TABLE `tabStockDataOfDiamondForIdeal`")
    frappe.db.commit()

    fields = [
        "name",    
        "branch_id",
        "item_id",
        "item",
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
    frappe.db.bulk_insert("StockDataOfDiamondForIdeal", fields, values)

    frappe.db.commit()
    
    cursor.close()
    con.close()
    return f"{len(values)} records inserted successfully123"

def get_sale_data(from_date, to_date):
    con = connect()
    cursor = con.cursor()

    full_query = r'''
    ;WITH Base AS (
    SELECT
        s.BranchID,
        bm.BranchName,
        s.ItemMstID,
        im.ItemName,
        s.LabelNo,
        s.DiamondWt,
        CASE
            WHEN s.DiamondWt BETWEEN 0 AND 0.100 THEN '0-0.100'
    WHEN s.DiamondWt BETWEEN 0.101 AND 0.200 THEN '0.101-0.200'
    WHEN s.DiamondWt BETWEEN 0.201 AND 0.300 THEN '0.201-0.300'
    WHEN s.DiamondWt BETWEEN 0.301 AND 0.400 THEN '0.301-0.400'
    WHEN s.DiamondWt BETWEEN 0.401 AND 0.500 THEN '0.401-0.500'
    WHEN s.DiamondWt BETWEEN 0.501 AND 0.700 THEN '0.501-0.700'
    WHEN s.DiamondWt BETWEEN 0.701 AND 1.000 THEN '0.701-1.000'
    WHEN s.DiamondWt BETWEEN 1.001 AND 1.250 THEN '1.001-1.250'
    WHEN s.DiamondWt BETWEEN 1.251 AND 1.500 THEN '1.251-1.500'
    WHEN s.DiamondWt BETWEEN 1.501 AND 1.750 THEN '1.501-1.750'
    WHEN s.DiamondWt BETWEEN 1.751 AND 2.000 THEN '1.751-2.000'
    WHEN s.DiamondWt BETWEEN 2.001 AND 2.250 THEN '2.001-2.250'
    WHEN s.DiamondWt BETWEEN 2.251 AND 2.500 THEN '2.251-2.500'
    WHEN s.DiamondWt BETWEEN 2.501 AND 3.000 THEN '2.501-3.000'
    WHEN s.DiamondWt BETWEEN 3.001 AND 3.500 THEN '3.001-3.500'
    WHEN s.DiamondWt BETWEEN 3.501 AND 4.000 THEN '3.501-4.000'
    WHEN s.DiamondWt BETWEEN 4.001 AND 5.000 THEN '4.001-5.000'
    WHEN s.DiamondWt BETWEEN 5.001 AND 6.000 THEN '5.001-6.000'
    WHEN s.DiamondWt BETWEEN 6.001 AND 7.000 THEN '6.001-7.000'
    WHEN s.DiamondWt BETWEEN 7.001 AND 8.000 THEN '7.001-8.000'
    WHEN s.DiamondWt BETWEEN 8.001 AND 9.000 THEN '8.001-9.000'
    WHEN s.DiamondWt BETWEEN 9.001 AND 10.000 THEN '9.001-10.000'
    WHEN s.DiamondWt BETWEEN 10.001 AND 12.000 THEN '10.001-12.000'
    WHEN s.DiamondWt BETWEEN 12.001 AND 15.000 THEN '12.001-15.000'
    WHEN s.DiamondWt BETWEEN 15.001 AND 17.000 THEN '15.001-17.000'
    WHEN s.DiamondWt BETWEEN 17.001 AND 20.000 THEN '17.001-20.000'
    WHEN s.DiamondWt BETWEEN 20.001 AND 25.000 THEN '20.001-25.000'
    WHEN s.DiamondWt BETWEEN 25.001 AND 30.000 THEN '25.001-30.000'
    WHEN s.DiamondWt BETWEEN 30.001 AND 40.000 THEN '30.001-40.000'
    WHEN s.DiamondWt BETWEEN 40.001 AND 50.000 THEN '40.001-50.000'
    WHEN s.DiamondWt BETWEEN 50.001 AND 60.000 THEN '50.001-60.000'
    WHEN s.DiamondWt BETWEEN 60.001 AND 70.000 THEN '60.001-70.000'
    WHEN s.DiamondWt BETWEEN 70.001 AND 80.000 THEN '70.001-80.000'
    WHEN s.DiamondWt BETWEEN 80.001 AND 90.000 THEN '80.001-90.000'
    WHEN s.DiamondWt BETWEEN 90.001 AND 100.000 THEN '90.001-100.000'
    WHEN s.DiamondWt BETWEEN 100.001 AND 999.000 THEN '100.001-999.000'
    END AS WeightRange
    FROM [D:\ORNNX\ORNATENXDATA\DATA\SVGL\SVGL.MDF].dbo.SPTran AS s
    LEFT JOIN dbo.ItemMst im ON s.ItemMstID = im.ItemMstID
    LEFT JOIN dbo.BranchMaster bm ON s.BranchID = bm.BranchID
    WHERE s.VouType = 'SL'
      AND s.VouDate >= (?)
      AND s.VouDate <= (?)
      AND s.ItemTradMstID = 1006
)
SELECT
    BranchID,
    BranchName,
    ItemMstID,
    ItemName,
    WeightRange,
    COUNT(*) AS LabelCount,
    SUM(NetWt) AS TotalNetWt
FROM Base
GROUP BY
    BranchID,
    BranchName,
    ItemMstID,
    ItemName,
    WeightRange
ORDER BY
    BranchID,
    ItemMstID,
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
    
    frappe.db.sql("TRUNCATE TABLE `tabSaleDataOfDiamondForIdeal`")
    frappe.db.commit()

    fields = [
        "name",    
        "branch_id",
        "branch",
        "item_id",
        "item",
        "weight_range",
        "label_count",
        "total_net_wt",
    ]

    # Convert fetched data into list of tuples

    values = []
    for i, row in enumerate(rows, start=1):
        values.append((str(i),) + tuple(row))

    # Insert all records quickly
    frappe.db.bulk_insert("SaleDataOfDiamondForIdeal", fields, values)

    frappe.db.commit()

    cursor.close()
    con.close()

    return f"{len(values)} records inserted successfully456"


import json

@frappe.whitelist(allow_guest=True)
def calculate_ideal_stock():
    query = """
    SELECT branch, item, weight_range, avg_stock ,branch_id ,item_id
    FROM `tabStockDataOfDiamondForIdeal` """
    rows = frappe.db.sql(query, as_dict=True)
    stock_data = [[row["branch_id"],row["item_id"],row["branch"], row["item"], row["weight_range"], row["avg_stock"]] for row in rows]

    query1 = """
    SELECT branch, item, weight_range, total_net_wt,branch_id ,item_id  FROM `tabSaleDataOfDiamondForIdeal`  
"""
    rows1 = frappe.db.sql(query1, as_dict=True)
    sales_data = [[row["branch_id"],row["item_id"],row["branch"], row["item"], row["weight_range"], row["total_net_wt"]] for row in rows1]


    sales_df = pd.DataFrame(sales_data, columns=["Branch Id","Item Id","Branch", "Item", "Weight_Range",  "Sales_Weight"])
    stock_df = pd.DataFrame(stock_data, columns=["Branch Id","Item Id","Branch","Item",  "Weight_Range",  "Stock_Weight"])


    #df = pd.merge(sales_df, stock_df, on=["Branch", "Item", "Variety", "Weight_Range"], how="left")
    df = pd.merge(stock_df, sales_df, on=["Branch", "Item",  "Weight_Range"], how="left")

    # --- Convert to numeric safely ---
    df["Sales_Weight"] = pd.to_numeric(df["Sales_Weight"], errors='coerce').fillna(0)
    df["Stock_Weight"] = pd.to_numeric(df["Stock_Weight"], errors='coerce').fillna(0)


    # --- Calculate STR safely ---
    df["STR"] = df.apply(lambda x: round(x["Sales_Weight"] / x["Stock_Weight"], 2) if x["Stock_Weight"] > 0 else 0, axis=1)
    

    df["Sales_Weight"] = df["Sales_Weight"].astype(float)
    df["Stock_Weight"] = df["Stock_Weight"].astype(float)


    # Using apply with resetting index
    df_gast = df.groupby(["Branch", "Item"]).apply(
    lambda g: g.assign(GAST=round(g["Sales_Weight"].sum() / g["Stock_Weight"].sum(),2) if g["Stock_Weight"].sum() > 0 else 0)
).reset_index(drop=True)

    # Now merge the result back into the original DataFrame based on the common index
    df = df.merge(df_gast[["Branch", "Item",  "GAST"]], on=["Branch", "Item", "Variety"], how="inner")
    df = df.drop_duplicates(subset=["Branch", "Item",  "Sales_Weight", "Stock_Weight"])



    # --- Group average sales ---
    df["Group_Avg_Sales"] = df.groupby(["Branch", "Item"])["Sales_Weight"].transform("mean")

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
    data = df[["Branch", "Item",  "Weight_Range", "Sales_Weight", "Stock_Weight","STR", "GAST", "Quadrant", "Ideal_Stock", "Ideal_Stock","Ideal_Pcs","Ideal_Pcs"]].values.tolist()
    columns = [
    "Branch", "Item", "Weight_Range",
    "Sales_Weight", "Stock_Weight", "STR", "GAST",
    "Quadrant", "Ideal_Stock", "Target_Stock","Ideal_Pcs","Target_Pcs"
]


    frappe.db.sql("TRUNCATE TABLE `tabIdeal_Stock_For_Diamond`")
    frappe.db.commit()
    fields = [
        "name",    
        "branch_id",
        "item_id",
        "branch",
        "item",
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

    db_insert_data=df[["Branch Id_x","Item Id_x","Branch", "Item",  "Weight_Range", "Sales_Weight", "Stock_Weight","STR", "GAST", "Quadrant", "Ideal_Stock", "Ideal_Stock","Ideal_Pcs","Ideal_Pcs"]].values.tolist()
    values = []
    for i, row in enumerate(db_insert_data, start=1):
        values.append((i,) + tuple(row))
    # Insert all records quickly
    frappe.db.bulk_insert("Ideal_Stock_For_Diamond", fields, values)

    frappe.db.commit()

    dict_list = [dict(zip(columns, row)) for row in data]
    return dict_list

@frappe.whitelist(allow_guest=True)
def get_current_stock():
    con = connect()
    cursor = con.cursor()

    full_query = r'''
IF OBJECT_ID('tempdb..#DLabelData1') IS NOT NULL DROP TABLE #DLabelData1;
IF OBJECT_ID('tempdb..#DLabelDays1') IS NOT NULL DROP TABLE #DLabelDays1;


-- Step 1⃣: Prepare Label Data with latest transaction info
SELECT
    lb.LabelNo,
    lb.NetWt,
    lb.ItemMstID,
    lb.BranchID,
    
    lt.LatestItemMstID,
    lt.ItemName,
    lt.BranchShortCode
INTO #DLabelData1
FROM [D:\ORNNX\ORNATENXDATA\DATA\SVGL\SVGL.MDF].dbo.LabelBalance lb
CROSS APPLY (
    SELECT TOP 1
        lt.ItemMstID AS LatestItemMstID,
        im.ItemName,
        bm.BranchName AS BranchShortCode
    FROM dbo.LabelTransaction lt
    LEFT JOIN dbo.ItemMst im ON im.ItemMstID = lt.ItemMstID
    LEFT JOIN dbo.BranchMaster bm ON bm.BranchID = lb.BranchID
    WHERE lt.LabelNo = lb.LabelNo
    ORDER BY lt.LabelTransID DESC
    ) lt
WHERE lb.DiamondWt > 0
  AND lb.ItemTradMstID = 1006;

-- Step 2⃣: Expand each label into individual active dates
SELECT
    l.BranchID,
    l.ItemMstID,
    l.ItemName,
    l.BranchShortCode,
    l.LabelNo,
    l.DiamondWt,
    CASE
        WHEN l.DiamondWt <= 0.100 THEN '0-0.100'
    WHEN l.DiamondWt <= 0.200 THEN '0.101-0.200'
    WHEN l.DiamondWt <= 0.300 THEN '0.201-0.300'
    WHEN l.DiamondWt <= 0.400 THEN '0.301-0.400'
    WHEN l.DiamondWt <= 0.500 THEN '0.401-0.500'
    WHEN l.DiamondWt <= 0.700 THEN '0.501-0.700'
    WHEN l.DiamondWt <= 1.000 THEN '0.701-1.000'
    WHEN l.DiamondWt <= 1.250 THEN '1.001-1.250'
    WHEN l.DiamondWt <= 1.500 THEN '1.251-1.500'
    WHEN l.DiamondWt <= 1.750 THEN '1.501-1.750'
    WHEN l.DiamondWt <= 2.000 THEN '1.751-2.000'
    WHEN l.DiamondWt <= 2.250 THEN '2.001-2.250'
    WHEN l.DiamondWt <= 2.500 THEN '2.251-2.500'
    WHEN l.DiamondWt <= 3.000 THEN '2.501-3.000'
    WHEN l.DiamondWt <= 3.500 THEN '3.001-3.500'
    WHEN l.DiamondWt <= 4.000 THEN '3.501-4.000'
    WHEN l.DiamondWt <= 5.000 THEN '4.001-5.000'
    WHEN l.DiamondWt <= 6.000 THEN '5.001-6.000'
    WHEN l.DiamondWt <= 7.000 THEN '6.001-7.000'
    WHEN l.DiamondWt <= 8.000 THEN '7.001-8.000'
    WHEN l.DiamondWt <= 9.000 THEN '8.001-9.000'
    WHEN l.DiamondWt <= 10.000 THEN '9.001-10.000'
    WHEN l.DiamondWt <= 12.000 THEN '10.001-12.000'
    WHEN l.DiamondWt <= 15.000 THEN '12.001-15.000'
    WHEN l.DiamondWt <= 17.000 THEN '15.001-17.000'
    WHEN l.DiamondWt <= 20.000 THEN '17.001-20.000'
    WHEN l.DiamondWt <= 25.000 THEN '20.001-25.000'
    WHEN l.DiamondWt <= 30.000 THEN '25.001-30.000'
    WHEN l.DiamondWt <= 40.000 THEN '30.001-40.000'
    WHEN l.DiamondWt <= 50.000 THEN '40.001-50.000'
    WHEN l.DiamondWt <= 60.000 THEN '50.001-60.000'
    WHEN l.DiamondWt <= 70.000 THEN '60.001-70.000'
    WHEN l.DiamondWt <= 80.000 THEN '70.001-80.000'
    WHEN l.DiamondWt <= 90.000 THEN '80.001-90.000'
    WHEN l.DiamondWt <= 100.000 THEN '90.001-100.000'
    WHEN l.DiamondWt <= 999.000 THEN '100.001-999.000'
    END AS WeightRange
INTO #DLabelDays1
FROM #DLabelData1 l

-- Step 3⃣: Aggregate by group, counting unique active days
SELECT
    BranchID,
    ItemMstID,
    ItemName,
    BranchShortCode,
    WeightRange,
    COUNT(DISTINCT LabelNo) AS LabelCount,
    SUM(NetWt) AS TotalNetWt
    FROM #LabelDays1
GROUP BY
    BranchID,
    ItemMstID,
    ItemName,
    BranchShortCode,
    WeightRange
ORDER BY
    BranchID,
    ItemMstID,
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
    
    frappe.db.sql("TRUNCATE TABLE `tabCurrent_Stock_Ideal_Stock_For_Diamond`")
    frappe.db.commit()

    fields = [
        "name",    
        "branch_id",
        "item_id",
        "item",
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
    frappe.db.bulk_insert("Current_Stock_Ideal_Stock_For_Diamond", fields, values)

    frappe.db.commit()
    
    cursor.close()
    con.close()
    compare_cureent_stock_with_ideal_stock()
    return f"{len(values)} records inserted successfully123"

def compare_cureent_stock_with_ideal_stock():
    
    query = """
    UPDATE tabCurrent_Stock_Ideal_Stock_For_Diamond AS c
JOIN tabIdeal_Stock_For_Diamond AS i
    ON  c.branch_id   = i.branch_id
    AND c.item_id     = i.item_id
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
        SELECT branch, item,  weight_range,total_sale_weight,avg_stock_weight,stock_turn,group_average_stock_turn,quadrant, ideal_weight ,stock_weight,stock_pcs,target_pcs  FROM `tabCurrent_Stock_Ideal_Stock_For_Diamond`
    """, as_list=True)

    columns = [
    "branch", "item",  "weight_range","total_sale_weight","avg_stock_weight","stock_turn","group_average_stock_turn","quadrant", "ideal_weight", "stock_weight", "stock_pcs","target_pcs"
]

    dict_list = [dict(zip(columns, row)) for row in data]

    return dict_list



@frappe.whitelist()
def get_todays_stock(branch, item,  weight_range=None):
    # Validate mandatory fields
    if not branch or not item:
        frappe.throw("Branch and Item are required fields.")

    # Base query
    query = """
        SELECT branch, item,  weight_range, ideal_weight, stock_weight, stock_pcs , target_pcs
        FROM `tabCurrent_Stock_Ideal_Stock_For_Diamond`
        WHERE branch_id=%s AND item_id=%s
    """

    # Parameters for SQL placeholders
    params = [branch, item]

    # Add optional filters

    if weight_range:
        query += " AND weight_range=%s"
        params.append(weight_range)

    # Execute query safely
    data = frappe.db.sql(query, tuple(params), as_dict=True)

    return data

@frappe.whitelist()
def get_current_stock_for_admin():

    data = frappe.db.sql("""
        SELECT branch, item,  weight_range,total_sale_weight,avg_stock_weight,stock_turn,group_average_stock_turn,quadrant, ideal_weight ,stock_weight,stock_pcs,target_pcs  FROM `tabCurrent_Stock_Ideal_Stock_For_Diamond`
    """, as_list=True)

    columns = [
    "branch", "item", "weight_range","total_sale_weight","avg_stock_weight","stock_turn","group_average_stock_turn","quadrant", "ideal_weight", "stock_weight", "stock_pcs","target_pcs"
]

    #dict_list = [dict(zip(columns, row)) for row in data]

    dict_list = []
    for row in data:
        row_dict = dict(zip(columns, row))

        # Rename key
        row_dict["avg_stock_weight (2 years)"] = row_dict.pop("avg_stock_weight")
        row_dict["total_sale_weight (2 years)"] = row_dict.pop("total_sale_weight")
        row_dict["stock_turn (2 years)"] = row_dict.pop("stock_turn")
        row_dict["group_average_stock_turn (2 years)"] = row_dict.pop("group_average_stock_turn")
        row_dict["Existing stock_weight"] = row_dict.pop("stock_weight")
        row_dict["Existing stock_pcs"] = row_dict.pop("stock_pcs")

        dict_list.append(row_dict)

    return dict_list

@frappe.whitelist()
def get_ideal_stock_date():
    query = """
        SELECT from_date, to_date, target
        FROM `tabideal_stock_for_diamond_dates` order by creation desc limit 1
    """
    data = frappe.db.sql(query, (), as_dict=True)
    return data

    
