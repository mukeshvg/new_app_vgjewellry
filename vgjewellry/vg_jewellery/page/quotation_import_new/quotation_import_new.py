import frappe
from frappe import _

@frappe.whitelist()
def download_sample():
    frappe.local.response.filename = "quotation_template_new.xlsx"
    frappe.local.response.filecontent = open(
        frappe.get_app_path(
            "vgjewellry",
            "public",
            "sample",
            "quotation_template_new.xlsx"
        ),
        "rb"
    ).read()
    frappe.local.response.type = "download"

import os
import pandas as pd
import frappe

from frappe.utils import flt
from frappe.utils.file_manager import save_file

from openpyxl import load_workbook
from openpyxl_image_loader import SheetImageLoader


ALLOWED_ITEMS = {

    "Bangles",
    "Bracelet",
    "Button",
    "Cufflink",
    "Pendant",
    "Polki",
    "Ring",
    "Set",
    "Tops",
    "Chain",
    "Bali",
    "Tanmania",
    "Mangalsutra",
}

ALLOWED_DIAMOND_SHAPES ={
    "Round","Radiant","Oval","Pear","Emerald","Rose Cut","Heart","Princess","Baguette","Cushion","Marquise","Pie Cut"
}

ALLOWED_METALS = {
    "gold 14kt",
    "gold 18kt",
    "platinum"
}


def clean(value):
    """Convert NaN to None"""
    if pd.isna(value):
        return None
    return value


@frappe.whitelist()
def upload_excel():

    file = frappe.request.files.get("file")

    if not file:
        frappe.throw("Please select Excel file")

    # --------------------------------------------------------
    # Save uploaded file
    # --------------------------------------------------------

    temp_file = frappe.get_site_path(
        "private",
        "files",
        file.filename
    )

    with open(temp_file, "wb") as f:
        f.write(file.read())

    # --------------------------------------------------------
    # Read Excel
    # --------------------------------------------------------

    try:
        df = pd.read_excel(temp_file)
    except Exception as e:
        frappe.throw(f"Unable to read Excel : {str(e)}")

    df = df.where(pd.notnull(df), None)

    # --------------------------------------------------------
    # Required Columns
    # --------------------------------------------------------

    required_columns = [

        "Vendor Code",
        "Vendor",
        "Image",
        "Item",
        "Vendor Design Number",
        "Metal",
        "Gr Wt",
        "Net Wt",
        "Gold Value",

        "Diamond Shape",
        "Diamond Size",
        "Diamond Pcs",
        "Diamond Wt",
        "Diamond Rate",
        "Diamond Amt",

        "Stone Pcs",
        "Stone Wt",
        "Stone rate",
        "Stone Amt",

        "Labour Rate",
        "Total Labour",
        "Total Amt"

    ]

    for col in required_columns:

        if col not in df.columns:
            frappe.throw(f"Missing column : {col}")
    
    # --------------------------------------------------------
    # Load workbook for images
    # --------------------------------------------------------

    wb = load_workbook(temp_file)

    ws = wb.active

    image_loader = SheetImageLoader(ws)
    
    # --------------------------------------------------------
    # Validate Item values BEFORE importing anything
    # --------------------------------------------------------
    # Only parent rows are validated. Child diamond/stone rows
    # normally have a blank Item value.
    
    invalid_items = []

    for index, row in df.iterrows():
        excel_row = index + 2

        is_parent = any([
            clean(row.get("Vendor Design Number")),
            clean(row.get("Item")),
            clean(row.get("Metal")),
            clean(row.get("Gr Wt")),
            clean(row.get("Net Wt")),
            clean(row.get("Gold Value"))
        ])

        if is_parent:
            item_value = clean(row.get("Item"))

            if item_value is None or str(item_value).strip().capitalize() not in ALLOWED_ITEMS:
                display_value = (
                    "Blank"
                    if item_value is None or str(item_value).strip() == ""
                    else str(item_value).strip()
                )
                invalid_items.append(
                    f"<b>Row {excel_row}</b> : Item = "
                    f"<b>{frappe.utils.escape_html(display_value)}</b>"
                )
            image_cell = f"C{excel_row}"


            if not image_loader.image_in(image_cell):

                invalid_items.append(

                    f"Row {excel_row}: "
                    f"<b>Image is blank/missing or not in image cell</b>"

                )    

    if invalid_items:
        frappe.throw(
            "<b>Invalid Item found. Nothing was uploaded.</b><br><br>"
            "Allowed Item values are:<br>"
            f"{', '.join(sorted(ALLOWED_ITEMS))}<br><br>"
            "<b>Invalid rows:</b><br>"
            + "<br>".join(invalid_items)
        )

    # --------------------------------------------------------
    # Validate Metal values BEFORE importing anything
    # --------------------------------------------------------

    invalid_metals = []

    for index, row in df.iterrows():

        excel_row = index + 2
        metal_value = clean(row.get("Metal"))

        if metal_value is not None and str(metal_value).strip() != "":

            normalized_metal = str(metal_value).strip().lower()

            if normalized_metal not in ALLOWED_METALS:

                invalid_metals.append(
                    f"<b>Row {excel_row}</b> : Metal = "
                    f"<b>{frappe.utils.escape_html(str(metal_value).strip())}</b>"
                )

    if invalid_metals:

        frappe.throw(
            "<b>Invalid Metal found. Nothing was uploaded.</b><br><br>"
            "Allowed Metal values are:<br>"
            f"{', '.join(sorted(ALLOWED_METALS))}<br><br>"
            "<b>Invalid rows:</b><br>"
            + "<br>".join(invalid_metals)
        )

    # --------------------------------------------------------
    # Validate Diamond Shape values BEFORE importing anything
    # --------------------------------------------------------

    invalid_diamond_shapes = []

    for index, row in df.iterrows():

        excel_row = index + 2

        diamond_shape = clean(row.get("Diamond Shape"))

        # Only validate when Diamond Shape has a value
        if diamond_shape is not None and str(diamond_shape).strip() != "":

            # First letter of each word capitalized
            normalized_shape = str(diamond_shape).strip().title()

            if normalized_shape not in ALLOWED_DIAMOND_SHAPES:

                invalid_diamond_shapes.append(
                    f"<b>Row {excel_row}</b> : Diamond Shape = "
                    f"<b>{frappe.utils.escape_html(str(diamond_shape).strip())}</b>"
                )

    if invalid_diamond_shapes:

        frappe.throw(
            "<b>Invalid Diamond Shape found. Nothing was uploaded.</b><br><br>"
            "Allowed Diamond Shape values are:<br>"
            f"{', '.join(sorted(ALLOWED_DIAMOND_SHAPES))}<br><br>"
            "<b>Invalid rows:</b><br>"
            + "<br>".join(invalid_diamond_shapes)
        )

    actual_columns = list(df.columns)
    missing_columns = []
    extra_columns = []
    if actual_columns != required_columns:
        missing_columns = [ col for col in required_columns  if col not in actual_columns  ]
        extra_columns = [ col for col in actual_columns if col not in required_columns  ]
        frappe.throw(
        "Excel columns do not match the required template exactly.<br><br>"

        f"<b>Expected columns:</b><br>"
        f"{', '.join(required_columns)}<br><br>"

        f"<b>Uploaded columns:</b><br>"
        f"{', '.join(actual_columns)}<br><br>"

        f"<b>Missing columns:</b><br>"
        f"{', '.join(missing_columns) if missing_columns else 'None'}<br><br>"

        f"<b>Extra columns:</b><br>"
        f"{', '.join(extra_columns) if extra_columns else 'None'}"
    )


    # --------------------------------------------------------
    # Validate Vendor Code
    #
    # Vendor Code can appear in only ONE Excel cell.
    # It will be inherited by following rows until another
    # Vendor Code is found.
    #
    # Valid source:
    #   1. Ornate_Supplier_Master.supplier_code
    #   2. Visitor Vendor.vendor_code
    # --------------------------------------------------------

    invalid_vendor_codes = []

    # Get Supplier Master codes
    supplier_codes = frappe.get_all(
        "Ornate_Supplier_Master",
        filters={
            "supplier_code": ["!=", ""]
        },
        pluck="supplier_code"
    )

    # Get Visitor Vendor codes
    visitor_vendor_codes = frappe.get_all(
        "Visitor Vendor",
        filters={
            "vendor_code": ["!=", ""]
        },
        pluck="vendor_code"
    )

    # Combine both lists
    # Case-insensitive
    allowed_vendor_codes = {
        str(code).strip().lower()
        for code in supplier_codes + visitor_vendor_codes
        if code
    }

    # Current inherited Vendor Code
    validation_vendor_code = None

    for index, row in df.iterrows():

        excel_row = index + 2

        # ----------------------------------------------------
        # Update Vendor Code when Excel has a value
        # ----------------------------------------------------

        excel_vendor_code = clean(row.get("Vendor Code"))

        if (
            excel_vendor_code is not None
            and str(excel_vendor_code).strip() != ""
        ):
            validation_vendor_code = str(
                excel_vendor_code
            ).strip()

        # ----------------------------------------------------
        # Detect Parent Row
        # ----------------------------------------------------

        is_parent = any([
            clean(row.get("Vendor Design Number")),
            clean(row.get("Item")),
            clean(row.get("Metal")),
            clean(row.get("Gr Wt")),
            clean(row.get("Net Wt")),
            clean(row.get("Gold Value"))
        ])

        if not is_parent:
            continue

        # ----------------------------------------------------
        # Vendor Code is required for parent row
        # ----------------------------------------------------

        if not validation_vendor_code:

            invalid_vendor_codes.append(
                f"<b>Row {excel_row}</b> : "
                f"Vendor Code = <b>Blank / Not provided</b>"
            )

            continue

        # ----------------------------------------------------
        # Check Vendor Code
        # ----------------------------------------------------

        normalized_vendor_code = (
            validation_vendor_code.strip().lower()
        )

        if normalized_vendor_code not in allowed_vendor_codes:

            invalid_vendor_codes.append(
                f"<b>Row {excel_row}</b> : "
                f"Vendor Code = "
                f"<b>{frappe.utils.escape_html(validation_vendor_code)}</b>"
            )


    # --------------------------------------------------------
    # Stop entire import if invalid Vendor Code found
    # --------------------------------------------------------

    if invalid_vendor_codes:

        frappe.throw(
            "<b>Invalid Vendor Code found. Nothing was uploaded.</b>"
            "<br><br>"
            "Vendor Code must exist in either:<br>"
            "<b>Ornate_Supplier_Master.supplier_code</b>"
            "<br>OR<br>"
            "<b>Visitor Vendor.vendor_code</b>"
            "<br><br>"
            "<b>Invalid rows:</b><br>"
            + "<br>".join(invalid_vendor_codes)
        )


    # --------------------------------------------------------
    # Variables
    # --------------------------------------------------------

    current_vendor = None
    current_vendor_code = None

    current_parent = None

    quotation_count = 0
    diamond_count = 0
    stone_count = 0
    skipped_count = 0
    # --------------------------------------------------------
    # Start Import
    # --------------------------------------------------------

    try:

        for index, row in df.iterrows():

            excel_row = index + 2

            # ---------------------------------------------
            # Vendor Inheritance
            # ---------------------------------------------

            if clean(row.get("Vendor")):
                current_vendor = clean(row.get("Vendor"))

            if clean(row.get("Vendor Code")):
                current_vendor_code = clean(row.get("Vendor Code"))

            # ---------------------------------------------
            # Detect Parent Row
            # ---------------------------------------------

            is_parent = any([

                clean(row.get("Vendor Design Number")),
                clean(row.get("Item")),
                clean(row.get("Metal")),
                clean(row.get("Gr Wt")),
                clean(row.get("Net Wt")),
                clean(row.get("Gold Value"))

            ])

            # ---------------------------------------------
            # Create Parent Quotation
            # ---------------------------------------------

            if is_parent:
                skip_current_item = False
                vendor_code = current_vendor_code
                vendor_design_number = clean(row.get("Vendor Design Number"))
                if vendor_code and vendor_design_number:
                    existing = frappe.db.exists(
                        "Quotation Upload New",
                        {
                            "vendor_code": vendor_code,
                            "vendor_design_number": vendor_design_number
                        }
                    )

                    if existing:
                        current_parent = existing
                        skip_current_item = True
                        skipped_count += 1
                        continue

                doc = frappe.get_doc({

                    "doctype": "Quotation Upload New",

                    "vendor": current_vendor,
                    "vendor_code": current_vendor_code,

                    "item": clean(row.get("Item")),
                    "vendor_design_number": clean(row.get("Vendor Design Number")),

                    "metal": clean(row.get("Metal")),

                    "gr_wt": flt(clean(row.get("Gr Wt")) or 0),
                    "net_wt": flt(clean(row.get("Net Wt")) or 0),

                    "gold_value": flt(clean(row.get("Gold Value")) or 0),

                    "stone_pcs": clean(row.get("Stone Pcs")),
                    "stone_wt": clean(row.get("Stone Wt")),
                    "stone_rate": clean(row.get("Stone rate")),
                    "stone_amount": clean(row.get("Stone Amt")),

                    "labour_rate": clean(row.get("Labour Rate")),
                    "total_labour": clean(row.get("Total Labour")),
                    "total_amount": clean(row.get("Total Amt"))

                })

                doc.insert(ignore_permissions=True)

                current_parent = doc.name

                quotation_count += 1

                # -----------------------------------------
                # Upload Image
                # Image column is Excel Column C
                # -----------------------------------------

                image_cell = f"C{excel_row}"

                if image_loader.image_in(image_cell):

                    image = image_loader.get(image_cell)

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
            # ---------------------------------------------
            # Diamond Row Detection
            # ---------------------------------------------

            is_diamond = any([

                clean(row.get("Diamond Shape")),
                clean(row.get("Diamond Size")),
                clean(row.get("Diamond Pcs")),
                clean(row.get("Diamond Wt")),
                clean(row.get("Diamond Rate")),
                clean(row.get("Diamond Amt"))

            ])

            # ---------------------------------------------
            # Create Diamond Record
            # ---------------------------------------------

            if is_diamond:

                if not current_parent:
                    frappe.throw(
                        f"No parent quotation found before Excel row {excel_row}"
                    )

                diamond = frappe.get_doc({

                    "doctype": "Quotation Upload Diamond",

                    "quotation_number": current_parent,

                    "diamond_shape": clean(row.get("Diamond Shape")),
                    "diamond_size": clean(row.get("Diamond Size")),
                    "diamond_pcs": flt(clean(row.get("Diamond Pcs")) or 0),
                    "diamond_wt": flt(clean(row.get("Diamond Wt")) or 0),
                    "diamond_rate": flt(clean(row.get("Diamond Rate")) or 0),
                    "diamond_amount": flt(clean(row.get("Diamond Amt")) or 0)

                })

                diamond.insert(ignore_permissions=True)

                diamond_count += 1
            
            # ---------------------------------------------
            # Stone Row Detection
            # ---------------------------------------------

            is_stone = any([

                clean(row.get("Stone Pcs")),
                clean(row.get("Stone Wt")),
                clean(row.get("Stone rate")),
                clean(row.get("Stone Amt"))

            ])

            # ---------------------------------------------
            # Create Stone Record
            # ---------------------------------------------

            if is_stone:

                if not current_parent:
                    frappe.throw(
                        f"No parent quotation found before Excel row {excel_row}"
                    )

                stone = frappe.get_doc({

                    "doctype": "Quotation Upload Stone",

                    "quotation_number": current_parent,

                    "stone_pcs": flt(clean(row.get("Stone Pcs")) or 0),
                    "stone_wt": flt(clean(row.get("Stone Wt")) or 0),
                    "stone_rate": flt(clean(row.get("Stone rate")) or 0),
                    "stone_amount": flt(clean(row.get("Stone Amt")) or 0)

                })

                stone.insert(ignore_permissions=True)

                stone_count += 1

        # ---------------------------------------------
        # Commit
        # ---------------------------------------------

        frappe.db.commit()

        return {

            "success": True,

            "message":
                f"{quotation_count} Quotations Imported\n"
                f"{diamond_count} Diamond Records Imported\n"
                f"{stone_count} Stone Records Imported\n"
                f"{skipped_count} Records Skipped"

        }

    except Exception:

        frappe.db.rollback()

        raise

    finally:

        if os.path.exists(temp_file):
            os.remove(temp_file)
