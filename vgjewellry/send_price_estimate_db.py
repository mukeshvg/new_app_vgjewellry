import frappe
import pyodbc
import pymysql
import os
from frappe.utils import now_datetime
import zipfile

value_ho = os.getenv('sjodbc')

BATCH_SIZE = 5000


def connect_ho():
    conn = pyodbc.connect(value_ho, autocommit=True)
    conn.set_attr(
        pyodbc.SQL_ATTR_TXN_ISOLATION,
        pyodbc.SQL_TXN_READ_UNCOMMITTED
    )
    return conn


def sql_value(value):
    """Convert Python value to SQL literal."""

    if value is None:
        return "NULL"

    if isinstance(value, str):
        return "'" + value.replace("'", "''") + "'"

    return str(value)


@frappe.whitelist(allow_guest=True)
def send_price_estimate_sql():

    con = None
    cursor = None

    try:

        con = connect_ho()
        cursor = con.cursor()

        qry = """
        SELECT *
        FROM (
            SELECT
                lt.LabelNo,
                lt.NetWt,
                lt.GrossWt,
                lt.LabourPer,
                lt.LabourRate,
                lt.LabourAmount,
                lt.DiamondAmt,
                lt.StoneAmt,
                lt.DiamondPcs,
                lt.StonePcs,
                lt.OtherCharge,
                lt.OtherAmt,
                lt.ImagePath1,
                lt.ItemTradMstId,

                ROW_NUMBER() OVER (
                    PARTITION BY lt.LabelNo
                    ORDER BY
                        lt.LabelTransID DESC,
                        lt.VouDate DESC
                ) AS rn

            FROM dbo.LabelTransaction lt

            WHERE lt.LabelNo IN (
                SELECT lb.LabelNo
                FROM dbo.LabelBalance lb
                WHERE lb.ItemTradMstId IN (
                    1002,
                    1003,
                    1006,
                    1008
                )
            )
        ) x

        WHERE x.rn = 1;
        """

        cursor.execute(qry)

        columns = [c[0] for c in cursor.description]
        rows = cursor.fetchall()

        total_rows = len(rows)

        sql_parts = []

        # ---------------------------------------------------------
        # Create INSERT queries in batches
        # 5000 rows = 1 INSERT query
        # ---------------------------------------------------------

        for start in range(0, total_rows, BATCH_SIZE):

            batch_rows = rows[start:start + BATCH_SIZE]

            values = []

            for row in batch_rows:

                record = dict(zip(columns, row))

                row_values = (
                    "("
                    + ", ".join([
                        sql_value("".join(str(record["LabelNo"]).split())),
                        #sql_value(record["LabelNo"]),
                        sql_value(record["NetWt"]),
                        sql_value(record["GrossWt"]),
                        sql_value(record["LabourPer"]),
                        sql_value(record["LabourRate"]),
                        sql_value(record["LabourAmount"]),
                        sql_value(record["DiamondAmt"]),
                        sql_value(record["StoneAmt"]),
                        sql_value(record["DiamondPcs"]),
                        sql_value(record["StonePcs"]),
                        sql_value(record["OtherCharge"]),
                        sql_value(record["OtherAmt"]),
                        sql_value(record["ImagePath1"]),
                        sql_value(record["ItemTradMstId"])
                    ])
                    + ")"
                )

                values.append(row_values)

            # -----------------------------------------------------
            # ONE INSERT for this batch
            # -----------------------------------------------------

            insert_query = """
INSERT INTO ornate_data (
    label_no,
    net_wt,
    gross_wt,
    labour_per,
    labour_rate,
    labour_amount,
    diamond_amt,
    stone_amt,
    diamond_pcs,
    stone_pcs,
    other_charge,
    other_amt,
    image_path1,
    item_trade_mst_id
) VALUES
""" + ",\n".join(values) + ";"

            sql_parts.append(insert_query)

        # ---------------------------------------------------------
        # Combine all INSERT batches
        # ---------------------------------------------------------

        sql_content = "\n\n".join(sql_parts)

        # ---------------------------------------------------------
        # Create SQL file
        # ---------------------------------------------------------

        filename = (
            f"ornate_data_"
            f"{now_datetime().strftime('%Y%m%d_%H%M%S')}.sql"
        )

        file_path = os.path.join(
            frappe.get_site_path("public", "files"),
            filename
        )

        with open(file_path, "w", encoding="utf-8") as f:
            f.write(sql_content)

        total_batches = (
            (total_rows + BATCH_SIZE - 1) // BATCH_SIZE
            if total_rows
            else 0
        )
        sql_filename = (
            f"ornate_data_"
            f"{now_datetime().strftime('%Y%m%d_%H%M%S')}.sql"
        )

        zip_filename = (
            f"ornate_data_"
            f"{now_datetime().strftime('%Y%m%d_%H%M%S')}.zip"
        )

        zip_path = os.path.join(
            frappe.get_site_path("public", "files"),
            zip_filename
        )

        with zipfile.ZipFile(
            zip_path,
            "w",
            compression=zipfile.ZIP_DEFLATED
        ) as z:

            z.writestr(
                sql_filename,
                sql_content
            )

        return {
            "success": True,
            "count": total_rows,
            "batch_size": BATCH_SIZE,
            "total_batches": total_batches,
            "file": f"/files/{zip_filename}"
        }

        return {
            "success": True,
            "count": total_rows,
            "batch_size": BATCH_SIZE,
            "total_batches": total_batches,
            "file": f"/files/{filename}"
        }

    except Exception:

        frappe.log_error(
            frappe.get_traceback(),
            "Send Price Estimate SQL Error"
        )

        frappe.throw(str(frappe.get_traceback()))

    finally:

        if cursor:
            cursor.close()

        if con:
            con.close()
