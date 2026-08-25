import frappe
import pyodbc
import pymysql
import os
import requests
from frappe.utils import now_datetime
import zipfile


value_ho = os.getenv("sjodbc")

BATCH_SIZE = 5000

#IMAGE_SERVER_URL = "http://103.249.120.178:51"
IMAGE_SERVER_URL = "http://192.168.1.5:51"


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

def download_image(image_path1, images_dir):
    """
    Download thumbnail image from IMAGE_SERVER_URL + image_path1,
    but save the downloaded file using the ORIGINAL image path/name.

    Example:

        Original:
        \\EX.KADA\\XKADA_19.Jpg

        Download URL:
        http://103.249.120.178:51/EX.KADA/XKADA_19_Thumb.Jpg

        Saved file:
        images_dir/EX.KADA/XKADA_19.Jpg
    """

    if not image_path1:
        return None

    image_path1 = str(image_path1).strip()

    if not image_path1:
        return None

    # Keep original path/name
    image_path_original = image_path1

    # Create thumbnail filename for downloading
    base, ext = os.path.splitext(image_path1)

    image_path1_thumb = f"{base}_Thumb{ext}"

    try:

        # -----------------------------------------------------
        # Normalize backslashes for filesystem / URL
        # -----------------------------------------------------

        # Original path for saving
        original_relative_path = image_path_original.lstrip(
            "/\\"
        ).replace("\\", os.sep)

        # Thumbnail path for URL
        thumb_relative_path = image_path1_thumb.lstrip(
            "/\\"
        ).replace("\\", "/")

        # -----------------------------------------------------
        # Create URL
        # -----------------------------------------------------

        image_url = (
            IMAGE_SERVER_URL.rstrip("/")
            + "/"
            + thumb_relative_path
        )

        # -----------------------------------------------------
        # Save using ORIGINAL filename/path
        # -----------------------------------------------------

        destination_path = os.path.join(
            images_dir,
            original_relative_path
        )

        destination_dir = os.path.dirname(
            destination_path
        )

        os.makedirs(
            destination_dir,
            exist_ok=True
        )

        # -----------------------------------------------------
        # Download
        # -----------------------------------------------------

        response = requests.get(
            image_url,
            timeout=60,
            stream=True
        )

        response.raise_for_status()

        with open(
            destination_path,
            "wb"
        ) as f:

            for chunk in response.iter_content(
                chunk_size=1024 * 1024
            ):
                if chunk:
                    f.write(chunk)

        return {
            "image_path": image_path_original,
            "download_path": image_path1_thumb,
            "url": image_url,
            "local_path": destination_path
        }

    except Exception:

        frappe.log_error(
            frappe.get_traceback(),
            f"Image Download Failed: {image_path_original}"
        )

        return None

def download_image1(image_path1, images_dir):
    """
    Download image from:

        IMAGE_SERVER_URL + image_path1

    Example:

        image_path1 = "ABC/12345.jpg"

        URL:
        http://103.249.120.178:51ABC/12345.jpg

    The downloaded file keeps exactly the same filename/path
    as ImagePath1.
    """

    if not image_path1:
        return None

    image_path1 = str(image_path1).strip()

    if not image_path1:
        return None

    image_path1 = str(image_path1).strip()
    image_path_original = str(image_path1).strip()

    if image_path1:
        base, ext = os.path.splitext(image_path1)
        image_path1 = f"{base}_Thumb{ext}"

    try:

        # Remove leading slash only for URL construction
        relative_path = image_path1.lstrip("/")

        image_url = (
            IMAGE_SERVER_URL.rstrip("/")
            + "/"
            + relative_path
        )

        # -----------------------------------------------------
        # Keep EXACT ImagePath1 path/name
        # -----------------------------------------------------

        destination_path = os.path.join(
            images_dir,
            relative_path
        )

        # Create subdirectories if ImagePath1 contains them
        destination_dir = os.path.dirname(
            destination_path
        )

        os.makedirs(
            destination_dir,
            exist_ok=True
        )

        # -----------------------------------------------------
        # Download
        # -----------------------------------------------------

        response = requests.get(
            image_url,
            timeout=60,
            stream=True
        )

        response.raise_for_status()

        with open(
            destination_path,
            "wb"
        ) as f:

            for chunk in response.iter_content(
                chunk_size=1024 * 1024
            ):

                if chunk:
                    f.write(chunk)

        return {
            "image_path": image_path1,
            "url": image_url,
            "local_path": destination_path
        }

    except Exception:

        frappe.log_error(
            frappe.get_traceback(),
            f"Image Download Failed: {image_path1}"
        )

        return None

def normalize_label(label):
    """
    Remove all spaces from LabelNo.

    Example:
        10BN /      1
        becomes:
        10BN/1
    """

    if label is None:
        return ""

    return "".join(str(label).split())


def ensure_sync_table():

    frappe.db.sql("""
        CREATE TABLE IF NOT EXISTS ornate_data_sync_labels (
            label_no VARCHAR(255) NOT NULL,
            PRIMARY KEY (label_no)
        ) ENGINE=InnoDB
    """)

    frappe.db.commit()


@frappe.whitelist(allow_guest=True)
def send_price_estimate_sql():

    con = None
    cursor = None

    try:

        # =========================================================
        # 1. Make sure tracking table exists
        # =========================================================

        ensure_sync_table()

        # =========================================================
        # 2. Get PREVIOUSLY SENT labels
        # =========================================================

        previous_rows = frappe.db.sql("""
            SELECT label_no
            FROM ornate_data_sync_labels
        """, as_dict=True)

        previous_labels = {
            row["label_no"]
            for row in previous_rows
            if row["label_no"]
        }

        # =========================================================
        # 3. Connect SQL Server
        # =========================================================

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
                lt.Pcs,
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
                ) and lb.CounterMstId=50000031
            ) and lt.VouType='ST'
        ) x

        WHERE x.rn = 1
        """

        cursor.execute(qry)

        columns = [c[0] for c in cursor.description]

        rows = cursor.fetchall()

        # =========================================================
        # 4. Normalize current labels
        # =========================================================

        current_labels = set()

        row_by_label = {}

        for row in rows:

            record = dict(zip(columns, row))

            label_no = normalize_label(record["LabelNo"])

            if not label_no:
                continue

            current_labels.add(label_no)

            row_by_label[label_no] = record

        # =========================================================
        # 5. Compare
        # =========================================================

        new_labels = current_labels - previous_labels

        deleted_labels = previous_labels - current_labels

        # =========================================================
        # 6. Create SQL
        # =========================================================

        sql_parts = []

        # =========================================================
        # INSERT NEW LABELS
        # =========================================================

        insert_values = []

        for label_no in new_labels:

            record = row_by_label[label_no]

            row_values = (
                "("
                + ", ".join([
                    sql_value(label_no),
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
                    sql_value((record["ImagePath1"])),
                    sql_value(record["ItemTradMstId"]),
                    sql_value(record["Pcs"]),
                ])
                + ")"
            )

            insert_values.append(row_values)

        # ---------------------------------------------------------
        # Batch INSERT
        # ---------------------------------------------------------

        for start in range(
            0,
            len(insert_values),
            BATCH_SIZE
        ):

            batch = insert_values[
                start:start + BATCH_SIZE
            ]

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
    item_trade_mst_id,
    pcs
) VALUES
""" + ",\n".join(batch) + ";"

            sql_parts.append(insert_query)

        # =========================================================
        # DELETE REMOVED LABELS
        # =========================================================

        delete_values = []

        for label_no in deleted_labels:

            delete_values.append(
                sql_value(label_no)
            )

        # ---------------------------------------------------------
        # Batch DELETE
        # ---------------------------------------------------------

        for start in range(
            0,
            len(delete_values),
            BATCH_SIZE
        ):

            batch = delete_values[
                start:start + BATCH_SIZE
            ]

            delete_query = """
DELETE FROM ornate_data
WHERE label_no IN (
""" + ",\n".join(batch) + "\n);"

            sql_parts.append(delete_query)

        # =========================================================
        # 7. If nothing changed
        # =========================================================

        if not sql_parts:

            return {
                "success": True,
                "message": "No changes found",
                "current_count": len(current_labels),
                "previous_count": len(previous_labels),
                "new_count": 0,
                "deleted_count": 0,
                "file": None
            }

        # =========================================================
        # 8. Combine SQL
        # =========================================================

        sql_content = "\n\n".join(sql_parts)

        timestamp = now_datetime().strftime(
            "%Y%m%d_%H%M%S"
        )

        sql_filename = (
            f"ornate_data_{timestamp}.sql"
        )

        zip_filename = (
            f"ornate_data_{timestamp}.zip"
        )

        files_path = frappe.get_site_path(
            "public",
            "files"
        )

        # Temporary working directory
        work_dir = os.path.join(
            files_path,
            f"ornate_data_{timestamp}"
        )

        # =========================================================
        # CREATE IMAGES FOLDER HERE
        # =========================================================

        images_dir = os.path.join(
            work_dir,
            "images"
        )

        os.makedirs(
            images_dir,
            exist_ok=True
        )

        sql_path = os.path.join(
            #files_path,
            work_dir,
            sql_filename
        )

        zip_path = os.path.join(
            files_path,
            zip_filename
        )

        # =========================================================
        # 9. Download images for NEW labels
        # =========================================================

        downloaded_images = []
        failed_images = []

        for label_no in new_labels:

            record = row_by_label[label_no]

            image_path1 = record.get("ImagePath1")

            if not image_path1:
                continue

            result = download_image(
                image_path1,
                images_dir
            )

            if result:
                downloaded_images.append(result)
            else:
                failed_images.append({
                    "label_no": label_no,
                    "image_path1": image_path1
                })

        # =========================================================
        # 9. Save SQL file
        # =========================================================

        with open(
            sql_path,
            "w",
            encoding="utf-8"
        ) as f:

            f.write(sql_content)

        # =========================================================
        # 10. Create ZIP
        # =========================================================

        """with zipfile.ZipFile(
            zip_path,
            "w",
            compression=zipfile.ZIP_DEFLATED
        ) as z:

            z.write(
                sql_path,
                arcname=sql_filename
            )"""

        # =========================================================
        # 10. Create ZIP
        # =========================================================

        with zipfile.ZipFile(
            zip_path,
            "w",
            compression=zipfile.ZIP_DEFLATED
        ) as z:

            # =====================================================
            # Add SQL file
            # =====================================================

            z.write(
                sql_path,
                arcname=sql_filename
            )

            # =====================================================
            # Add images folder/files
            # =====================================================

            for image in downloaded_images:

                local_path = image["local_path"]
                image_path = image["image_path"]

                if os.path.exists(local_path):

                    z.write(
                        local_path,
                        arcname=os.path.join(
                            "images",
                            image_path
                        )
                    )
        # =========================================================
        # 11. IMPORTANT:
        #     Update tracking table ONLY after SQL file
        #     was successfully created.
        # =========================================================

        frappe.db.sql("""
            TRUNCATE TABLE ornate_data_sync_labels
        """)

        # Insert current labels

        current_label_list = list(current_labels)

        for start in range(
            0,
            len(current_label_list),
            BATCH_SIZE
        ):

            batch = current_label_list[
                start:start + BATCH_SIZE
            ]

            values = []

            for label_no in batch:

                values.append(
                    frappe.db.escape(label_no)
                )

            frappe.db.sql(
                """
                INSERT INTO ornate_data_sync_labels
                (label_no)
                VALUES {}
                """.format(
                    ",".join(
                        f"({v})"
                        for v in values
                    )
                )
            )

        frappe.db.commit()

        # =========================================================
        # 12. Response
        # =========================================================

        return {
            "success": True,

            "current_count": len(current_labels),

            "previous_count": len(previous_labels),

            "new_count": len(new_labels),

            "deleted_count": len(deleted_labels),

            "batch_size": BATCH_SIZE,

            "insert_batches": (
                (len(new_labels) + BATCH_SIZE - 1)
                // BATCH_SIZE
                if new_labels
                else 0
            ),

            "delete_batches": (
                (len(deleted_labels) + BATCH_SIZE - 1)
                // BATCH_SIZE
                if deleted_labels
                else 0
            ),

            "file": f"/files/{zip_filename}",
            "images_downloaded": len(downloaded_images),

            "images_failed": len(failed_images),

            "failed_images": failed_images,
        }

    except Exception:

        frappe.log_error(
            frappe.get_traceback(),
            "Send Price Estimate SQL Error"
        )

        frappe.throw(
            frappe.get_traceback()
        )

    finally:

        if cursor:

            cursor.close()

        if con:

            con.close()
