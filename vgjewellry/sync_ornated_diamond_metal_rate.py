import frappe
import pyodbc
import pymysql
import os

from frappe.utils import today, add_days


value = os.getenv("sjodbc")


def connect_ho():
    conn = pyodbc.connect(value, autocommit=True)
    conn.set_attr(
        pyodbc.SQL_ATTR_TXN_ISOLATION,
        pyodbc.SQL_TXN_READ_UNCOMMITTED
    )
    return conn


@frappe.whitelist(allow_guest=True)
def sync_diamond_rate():

    con = connect_ho()
    cursor = con.cursor()

    try:

        # ============================================================
        # SYNC DIAMOND SALES RATE
        # ============================================================

        qry = """
            SELECT
                dsm.StyleName,
                drm.FromWeight,
                drm.ToWeight,
                drm.SalesRate
            FROM dbo.DiamondRateMst AS drm
            LEFT JOIN dbo.DiamondStyleMst AS dsm
                ON drm.StyleID = dsm.DiamondStyleMstID
            WHERE drm.SizeID = 1
        """

        cursor.execute(qry)
        rows = cursor.fetchall()

        for row in rows:

            style_name, from_weight, to_weight, sales_rate = row

            existing = frappe.db.get_value(
                "Ornate Diamond Sales Rate",
                {
                    "style_name": style_name,
                    "from_weight": from_weight,
                    "to_weight": to_weight
                },
                "name"
            )

            if existing:

                # Update existing diamond rate
                frappe.db.set_value(
                    "Ornate Diamond Sales Rate",
                    existing,
                    "sales_rate",
                    sales_rate
                )

            else:

                # Create new diamond rate
                doc = frappe.new_doc(
                    "Ornate Diamond Sales Rate"
                )

                doc.style_name = style_name
                doc.from_weight = from_weight
                doc.to_weight = to_weight
                doc.sales_rate = sales_rate

                doc.insert(
                    ignore_permissions=True
                )


        # ============================================================
        # SYNC METAL RATE
        # ============================================================

        yesterday = add_days(today(), -1)

        qry = f"""
            SELECT
                itm.TradName,
                trm.PurRate,
                trm.ItemTradMstID
            FROM dbo.TodayRateMst AS trm
            LEFT JOIN dbo.ItemTradMst AS itm
                ON trm.ItemTradMstID = itm.ItemTradMstID
            WHERE trm.TDate > '{yesterday}'
        """

        cursor.execute(qry)
        rows = cursor.fetchall()

        for row in rows:

            metal, rate, ornate_metal_id = row

            existing = frappe.db.get_value(
                "Ornate Metal Rate",
                {
                    "ornate_metal_id": ornate_metal_id
                },
                "name"
            )

            if existing:

                # IMPORTANT:
                # existing belongs to Ornate Metal Rate,
                # so get the document from Ornate Metal Rate.
                doc = frappe.get_doc(
                    "Ornate Metal Rate",
                    existing
                )

                doc.metal = metal
                doc.rate = rate

                doc.save(
                    ignore_permissions=True
                )

            else:

                # Create new metal rate
                frappe.get_doc({
                    "doctype": "Ornate Metal Rate",
                    "ornate_metal_id": ornate_metal_id,
                    "metal": metal,
                    "rate": rate
                }).insert(
                    ignore_permissions=True
                )


        # ============================================================
        # COMMIT
        # ============================================================

        frappe.db.commit()

        return {
            "status": "success",
            "message": "Diamond and metal rates synchronized successfully"
        }

    except Exception:

        frappe.db.rollback()

        frappe.log_error(
            frappe.get_traceback(),
            "Sync Diamond Metal Rate Error"
        )

        raise

    finally:

        if cursor:
            cursor.close()

        if con:
            con.close()
