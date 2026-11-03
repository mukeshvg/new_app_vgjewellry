import frappe
import pyodbc
import os


value = os.getenv('sjodbc')

def connect():
    conn = pyodbc.connect(value, autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION, pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn


@frappe.whitelist()
def get_stock_margin():
    
    con = connect()
    cursor = con.cursor()

    qry= """
    SELECT Top(1) 
    lts.BranchID, lts.CounterMstId, m.LabelNo, m.VarietyMstId,m.SupplierCode,m.LabourOn  ,m.LabourRate ,m.LabourPer, m.SizeNameId ,
    lts.ItemMstID, lts.ItemTradMstId, lts.GrossWt, lts.NetWt, lts.Pcs, lts.StyleID ,lts.SalesRate as othersalerate,lts.SalesAmount
    as othersalevalue,m.ImagePath1, m.PurWastPer ,m.Location ,m.PurWastOn
FROM (
    SELECT lt.LabelNo, lt.VarietyMstId, lt.LabelTransID, lt.SupplierCode,lt.LabourOn  ,lt.LabourRate ,lt.LabourPer ,lt.SizeNameId ,
    lt.PurWastPer ,lt.Location ,lt.PurWastOn ,    lt.ImagePath1 , ROW_NUMBER() OVER (PARTITION BY lt.LabelNo ORDER BY lt.LabelTransID DESC) AS rn
    FROM dbo.LabelTransaction lt
    WHERE EXISTS (SELECT 1 FROM dbo.LabelBalance lb WHERE lb.LabelNo = lt.LabelNo)
) m
JOIN dbo.LabelTransactionStudded lts
    ON lts.LabelTransID = m.LabelTransID
WHERE m.rn = 1
OPTION (HASH JOIN);
    """
    cursor.execute(qry)
    rows = cursor.fetchall()

    columns = [column[0] for column in cursor.description]

    data = [dict(zip(columns, row)) for row in rows]
    return data[0]


