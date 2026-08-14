import frappe
import json
from frappe import _


@frappe.whitelist()
def get_supplier_list():

    return frappe.db.sql("""
        SELECT
            qc.vendor,
            qu.vendor_code,
            COUNT(*) AS qty
        FROM `tabQuotation Cart` qc
        INNER JOIN `tabQuotation Upload New` qu
            ON qc.quotation_id = qu.name
        WHERE qc.status = 1
        GROUP BY
            qc.vendor,
            qu.vendor_code
        ORDER BY
            qc.vendor
    """, as_dict=True)


@frappe.whitelist()
def get_vendor_cart(vendor):

    # ---------------------------------------------------------
    # GET CART + QUOTATION + BRANCH NAME
    # ---------------------------------------------------------

    items = frappe.db.sql("""
        SELECT
            qc.name AS cart_name,
            qu.*,

            qci.branch,
            obm.branch_name,

            qci.remark

        FROM `tabQuotation Cart` qc

        INNER JOIN `tabQuotation Upload New` qu
            ON qc.quotation_id = qu.name

        LEFT JOIN `tabQuotation Cart Item` qci
            ON qci.item = qu.name
            AND qci.quotation_number = qc.name

        LEFT JOIN `tabOrnate_Branch_Master` obm
            ON obm.name = qci.branch

        WHERE qc.vendor = %s
          AND qc.status = 1

        ORDER BY qu.name
    """, (vendor,), as_dict=True)


    if not items:
        return {
            "vendor": vendor,
            "vendor_code": "",
            "branches": []
        }


    # ---------------------------------------------------------
    # GET DIAMOND DETAILS
    # ---------------------------------------------------------

    quotation_names = list(set(
        [str(d.name) for d in items]
    ))


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
            diamond_shape,
            diamond_size
    """, {
        "quotation_names": quotation_names
    }, as_dict=True)


    # ---------------------------------------------------------
    # GROUP DIAMONDS BY QUOTATION
    # ---------------------------------------------------------

    diamond_map = {}

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
    # ADD DIAMOND DETAILS
    # ---------------------------------------------------------

    for item in items:

        item["diamond_details"] = diamond_map.get(
            str(item.name),
            []
        )


    # ---------------------------------------------------------
    # GET STONE DETAILS
    # ---------------------------------------------------------

    quotation_names = list(set(
        [str(d.name) for d in items]
    ))


    stone_rows = frappe.db.sql("""
        SELECT
            quotation_number,
            stone_pcs,
            stone_wt,
            stone_rate,
            stone_amount

        FROM `tabQuotation Upload Stone`

        WHERE quotation_number IN %(quotation_names)s

        ORDER BY
            quotation_number
    """, {
        "quotation_names": quotation_names
    }, as_dict=True)


    # ---------------------------------------------------------
    # GROUP STONES BY QUOTATION
    # ---------------------------------------------------------

    stone_map = {}

    for stone in stone_rows:

        quotation_number = str(
            stone.quotation_number
        )

        if quotation_number not in stone_map:
            stone_map[quotation_number] = []


        stone_map[quotation_number].append({

            "stone_pcs":
                stone.stone_pcs or 0,

            "stone_wt":
                stone.stone_wt or 0,

            "stone_rate":
                stone.stone_rate or 0,

            "stone_amount":
                stone.stone_amount or 0

        })


    # ---------------------------------------------------------
    # ADD STONE DETAILS
    # ---------------------------------------------------------

    for item in items:

        item["stone_details"] = stone_map.get(
            str(item.name),
            []
        )
    # ---------------------------------------------------------
    # GROUP BY BRANCH
    # ---------------------------------------------------------

    branches = {}


    for item in items:

        branch_id = item.branch or ""
        branch_name = item.branch_name or "Not Assigned"

        # Use branch_id as grouping key
        if branch_id not in branches:

            branches[branch_id] = {

                "branch": branch_id,

                "branch_name": branch_name,

                "items": [],

                "total_net_wt": 0

            }


        branches[branch_id]["items"].append(item)


        branches[branch_id]["total_net_wt"] += (
            float(item.net_wt or 0)
        )


    # ---------------------------------------------------------
    # RETURN
    # ---------------------------------------------------------

    return {

        "vendor": vendor,

        "vendor_code":
            items[0].vendor_code,

        "branches":
            list(branches.values())

    }



@frappe.whitelist()
def remove_cart_item(name):

    if frappe.db.exists("Quotation Cart", name):

        frappe.delete_doc(
            "Quotation Cart",
            name,
            ignore_permissions=True
        )

    return True  


@frappe.whitelist()
def generate_po(vendor, vendor_delivery_date=None, remarks=None):

    import json

    # ---------------------------------------------------------
    # PARSE REMARKS
    # ---------------------------------------------------------

    if isinstance(remarks, str):
        remarks = json.loads(remarks)

    if not remarks:
        remarks = {}


    # ---------------------------------------------------------
    # GET ACTIVE CART ITEMS
    # ---------------------------------------------------------

    cart_items = frappe.db.sql("""
        SELECT
            qc.name AS cart_name,
            qc.quotation_id,
            qc.vendor,

            qci.branch,
            qci.remark AS cart_remark

        FROM `tabQuotation Cart` qc

        LEFT JOIN `tabQuotation Cart Item` qci
            ON qci.quotation_number = qc.name
            AND qci.item = qc.quotation_id

        WHERE qc.vendor = %s
          AND qc.status = 1

        ORDER BY
            qci.branch,
            qc.creation ASC

    """, (vendor,), as_dict=True)


    if not cart_items:
        frappe.throw(
            _("No products found in cart.")
        )


    # ---------------------------------------------------------
    # GROUP CART ITEMS BY BRANCH
    # ---------------------------------------------------------

    branch_groups = {}

    for row in cart_items:

        # Branch ID
        branch = row.branch or "Not Assigned"


        if branch not in branch_groups:

            branch_groups[branch] = []


        branch_groups[branch].append(row)


    created_pos = []


    # ---------------------------------------------------------
    # CREATE ONE PO FOR EACH BRANCH
    # ---------------------------------------------------------

    for branch, branch_items in branch_groups.items():


        # -----------------------------------------------------
        # CREATE PO HEADER
        # -----------------------------------------------------

        po = frappe.new_doc("Quotation PO")

        po.vendor = vendor

        po.branch = (
            None
            if branch == "Not Assigned"
            else branch
        )

        po.vendor_delivery_date = (
            vendor_delivery_date
        )

        po.jewellery_type = "Diamond"

        po.status = 1

        po.insert(
            ignore_permissions=True
        )


        # -----------------------------------------------------
        # CREATE PO ITEMS
        # -----------------------------------------------------

        for row in branch_items:

            po_item = frappe.new_doc(
                "Quotation PO Item"
            )

            po_item.po_no = po.name

            # Quotation Upload New
            po_item.item = row.quotation_id


            # Remark from frontend
            frontend_remark = remarks.get(
                row.cart_name,
                ""
            )


            # If frontend remark exists,
            # use it. Otherwise use cart remark.
            po_item.remark = (
                frontend_remark
                or row.cart_remark
                or ""
            )


            po_item.insert(
                ignore_permissions=True
            )


            # -------------------------------------------------
            # UPDATE CART STATUS
            # -------------------------------------------------

            frappe.db.set_value(
                "Quotation Cart",
                row.cart_name,
                {
                    "status": 2
                },
                update_modified=False
            )


        # -----------------------------------------------------
        # SAVE PO
        # -----------------------------------------------------

        created_pos.append({

            "po_no": po.name,

            "vendor": vendor,

            "branch": branch,

            "vendor_delivery_date":
                po.vendor_delivery_date,

            "jewellery_type":
                po.jewellery_type,

            "item_count":
                len(branch_items)

        })


    # ---------------------------------------------------------
    # COMMIT
    # ---------------------------------------------------------

    frappe.db.commit()


    # ---------------------------------------------------------
    # RETURN
    # ---------------------------------------------------------

    return {

        "success": True,

        "vendor": vendor,

        "vendor_delivery_date":
            vendor_delivery_date,

        "jewellery_type":
            "Diamond",

        "total_po":
            len(created_pos),

        "pos":
            created_pos,

        "message":
            _(
                "{0} PO(s) created successfully."
            ).format(
                len(created_pos)
            )

    }

@frappe.whitelist()
def generate_po_old(vendor, vendor_delivery_date=None, remarks=None):

    if isinstance(remarks, str):
        remarks = json.loads(remarks)

    if not remarks:
        remarks = {}

    cart_items = frappe.get_all(
        "Quotation Cart",
        filters={
            "vendor": vendor,
            "status": 1
        },
        fields=[
            "name",
            "quotation_id",
            "vendor"
            #"vendor_delivery_date",
            #"jewellery_type"
        ],
        order_by="creation asc"
    )

    if not cart_items:
        frappe.throw(_("No products found in cart."))

    # Create PO Header
    po = frappe.new_doc("Quotation PO")
    po.vendor = vendor
    po.vendor_delivery_date = (
        vendor_delivery_date
    )
    po.jewellery_type = (
        "Diamond"
    )
    po.status = 1
    po.insert(ignore_permissions=True)

    # Create PO Items
    for row in cart_items:

        po_item = frappe.new_doc("Quotation PO Item")
        po_item.po_no = po.name

        # Link to Quotation Upload
        po_item.item = row.quotation_id

        # If these fields exist in Quotation PO Item
        po_item.vendor_delivery_date = row.vendor_delivery_date
        po_item.jewellery_type = row.jewellery_type

        # Remark from Cart Page
        po_item.remark = remarks.get(row.name, "")

        po_item.insert(ignore_permissions=True)

        # Update Cart
        frappe.db.set_value(
            "Quotation Cart",
            row.name,
            {
                "status": 2
            },
            update_modified=False
        )

    frappe.db.commit()

    return {
        "success": True,
        "po_no": po.name,
        "vendor": po.vendor,
        "vendor_delivery_date": po.vendor_delivery_date,
        "jewellery_type": po.jewellery_type,
        "message": _("Quotation PO Created Successfully.")
    }

