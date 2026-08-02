import os
import pandas as pd
import frappe

from frappe.utils.file_manager import save_file
from openpyxl import load_workbook
from openpyxl_image_loader import SheetImageLoader


def clean(value):
    """Convert pandas NaN to None."""
    if pd.isna(value):
        return None
    return value


@frappe.whitelist()
def upload_excel():

    file = frappe.request.files.get("file")

    if not file:
        frappe.throw("Please select Excel file")

    temp_file = frappe.get_site_path(
        "private",
        "files",
        file.filename
    )

    with open(temp_file, "wb") as f:
        f.write(file.read())

    try:
        df = pd.read_excel(temp_file)
    except Exception as e:
        frappe.throw(f"Excel reading error: {str(e)}")

    # Convert every NaN to None
    df = df.where(pd.notnull(df), None)

    required_columns = [
        "Vendor",
        "Vendor Code",
        "Design No",
        "Item",
        "Metal",
        "Gr Wt",
        "Net Wt",
        "Gold Value",
        "Dia Shape1",
        "Dia Size1",
        "Dia Pcs1",
        "Dia Wt1",
        "Dia Rate1",
        "Dia Amt1",
        "Labour",
        "Total Amt"
    ]

    for col in required_columns:
        if col not in df.columns:
            frappe.throw(f"Missing column in Excel: {col}")

    wb = load_workbook(temp_file)
    ws = wb.active
    image_loader = SheetImageLoader(ws)

    count = 0

    try:

        for index, row in df.iterrows():

            excel_row = index + 2

            if row["Item"] not in [
                "Bangles",
                "Button",
                "Cufflink",
                "Pendant",
                "Polki",
                "Ring",
                "Set",
                "Tops"
            ]:
                frappe.throw(
                    f"Invalid Item at Excel row {excel_row}: {row['Item']}"
                )

            if row["Metal"] not in [
                "Gold 14KT",
                "Gold 18KT",
                "Platinum"
            ]:
                frappe.throw(
                    f"Invalid Metal at Excel row {excel_row}: {row['Metal']}"
                )

            doc = frappe.get_doc({

                "doctype": "Quotation Upload",

                "vendor": clean(row.get("Vendor")),
                "vendor_code": clean(row.get("Vendor Code")),
                "design_no": clean(row.get("Design No")),
                "item": clean(row.get("Item")),

                "metal": clean(row.get("Metal")),

                "gr_wt": clean(row.get("Gr Wt")),
                "net_wt": clean(row.get("Net Wt")),

                "gold_value": clean(row.get("Gold Value")),

                # Diamond 1
                "dia_shape1": clean(row.get("Dia Shape1")),
                "dia_size1": clean(row.get("Dia Size1")),
                "dia_pcs1": clean(row.get("Dia Pcs1")),
                "dia_wt1": clean(row.get("Dia Wt1")),
                "dia_rate1": clean(row.get("Dia Rate1")),
                "dia_amt1": clean(row.get("Dia Amt1")),

                # Diamond 2
                "dia_shape2": clean(row.get("Dia Shape2")),
                "dia_size2": clean(row.get("Dia Size2")),
                "dia_pcs2": clean(row.get("Dia Pcs2")),
                "dia_wt2": clean(row.get("Dia Wt2")),
                "dia_rate2": clean(row.get("Dia Rate2")),
                "dia_amt2": clean(row.get("Dia Amt2")),

                # Stone
                "stone_pcs": clean(row.get("Stone Pcs")),
                "stone_wt": clean(row.get("Stone Wt")),
                "stone_amt": clean(row.get("Stone Amt")),

                "labour": clean(row.get("Labour")),
                "total_amt": clean(row.get("Total Amt")),

                "image": ""
            })

            doc.insert(ignore_permissions=True)

            cell = f"B{excel_row}"

            if image_loader.image_in(cell):

                image = image_loader.get(cell)

                image_name = f"{doc.name}.png"

                image_path = frappe.get_site_path(
                    "private",
                    "files",
                    image_name
                )

                image.save(image_path)

                with open(image_path, "rb") as img:

                    file_doc = save_file(
                        fname=image_name,
                        content=img.read(),
                        dt=doc.doctype,
                        dn=doc.name,
                        is_private=1
                    )

                doc.db_set("image", file_doc.file_url)

                if os.path.exists(image_path):
                    os.remove(image_path)

            count += 1

        frappe.db.commit()

    except Exception:

        frappe.db.rollback()
        raise

    finally:

        if os.path.exists(temp_file):
            os.remove(temp_file)

    return {
        "success": True,
        "message": f"{count} quotation records uploaded successfully."
    }
