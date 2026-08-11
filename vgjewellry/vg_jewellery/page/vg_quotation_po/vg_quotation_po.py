import frappe
from frappe.utils.pdf import get_pdf

@frappe.whitelist()
def get_po_list():

    data = frappe.get_all(
        "Quotation PO",
        fields=[
            "name",
            "vendor",
            "vendor_delivery_date",
            "jewellery_type"
        ],
        order_by="creation desc"
    )

    for d in data:

        d["total_items"] = frappe.db.count(
            "Quotation PO Item",
            {"po_no": d["name"]}
        )

    return data



@frappe.whitelist()
def get_po_details(po_no):

    # ---------------------------------------------------------
    # GET PO
    # ---------------------------------------------------------

    po = frappe.get_doc(
        "Quotation PO",
        po_no
    )
    
    # Get branch name 
    branch_name = "" 
    if po.branch:
    	branch_name = frappe.db.get_value( "Ornate_Branch_Master", po.branch, "branch_name" ) or ""


    # ---------------------------------------------------------
    # GET PO ITEMS + QUOTATION
    # ---------------------------------------------------------

    items = frappe.db.sql("""
        SELECT
            q.*,
            p.name AS po_item_name,
            p.remark

        FROM `tabQuotation PO Item` p

        INNER JOIN `tabQuotation Upload New` q
            ON q.name = p.item

        WHERE p.po_no = %s

        ORDER BY p.creation ASC

    """, (po_no,), as_dict=True)


    # ---------------------------------------------------------
    # GET DIAMOND DETAILS
    # ---------------------------------------------------------

    quotation_names = [
        item.name
        for item in items
    ]


    diamond_map = {}


    if quotation_names:

        diamond_rows = frappe.db.sql("""
            SELECT
                quotation_number,
                diamond_shape,
                diamond_size,
                diamond_pcs,
                diamond_wt,
                diamond_rate,
                diamond_amount

            FROM `tabQuotation Upload Diamond`

            WHERE quotation_number IN %(quotation_names)s

            ORDER BY
                quotation_number,
                name ASC

        """, {
            "quotation_names": quotation_names
        }, as_dict=True)


        # -----------------------------------------------------
        # GROUP DIAMONDS BY QUOTATION
        # -----------------------------------------------------

        for diamond in diamond_rows:

            quotation_number = str(
                diamond.quotation_number
            )

            if quotation_number not in diamond_map:

                diamond_map[quotation_number] = []


            diamond_map[quotation_number].append({

                "diamond_shape":
                    diamond.diamond_shape or "",

                "diamond_size":
                    diamond.diamond_size or "",

                "diamond_pcs":
                    diamond.diamond_pcs or 0,

                "diamond_wt":
                    diamond.diamond_wt or 0,

                "diamond_rate":
                    diamond.diamond_rate or 0,

                "diamond_amount":
                    diamond.diamond_amount or 0

            })


    # ---------------------------------------------------------
    # ATTACH DIAMOND DETAILS TO EACH ITEM
    # ---------------------------------------------------------

    for item in items:

        item["diamond_details"] = diamond_map.get(
            str(item.name),
            []
        )


    # ---------------------------------------------------------
    # RETURN
    # ---------------------------------------------------------

    return {

        "po": po.as_dict(),
		"branch_name": branch_name,
        "items": items

    }



@frappe.whitelist()
def generate_pdf(po):

    html = frappe.get_print(
        doctype="Quotation PO",
        name=po,
        print_format="VG Quoatiation PO",
        as_pdf=False
    )

    pdf = get_pdf(html)

    file_doc = frappe.get_doc({
        "doctype": "File",
        "file_name": f"{po}.pdf",
        "attached_to_doctype": "Quotation PO",
        "attached_to_name": po,
        "is_private": 0,
        "content": pdf
    })

    file_doc.save(ignore_permissions=True)

    return {
        "success": True,
        "file_url": file_doc.file_url
    }  
