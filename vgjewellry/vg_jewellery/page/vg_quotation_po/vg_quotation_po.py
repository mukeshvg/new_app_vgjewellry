import frappe
from frappe.utils.pdf import get_pdf
from whatsapp.api import send_whatsapp
from frappe.utils import get_url


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

    stone_map = {}


    if quotation_names:

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
                quotation_number,
                name ASC

        """, {
            "quotation_names": quotation_names
        }, as_dict=True)


        # -----------------------------------------------------
        # GROUP STONES BY QUOTATION
        # -----------------------------------------------------

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
    # ATTACH STONE DETAILS TO EACH ITEM
    # ---------------------------------------------------------

    for item in items:

        item["stone_details"] = stone_map.get(
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
def generate_pdf(po_no):

    # ---------------------------------------------------------
    # GET PO DETAILS
    # ---------------------------------------------------------
    po_details = get_po_details(po_no)

    po = frappe._dict(po_details["po"])
    items = po_details["items"]
    branch_name = po_details.get("branch_name", "")

    # ---------------------------------------------------------
    # CALCULATE TOTALS
    # ---------------------------------------------------------
    total_net_wt = 0
    total_dia_wt = 0
    total_stone_wt = 0
    total_qty = 0

    for row in items:

        total_net_wt += float(row.get("net_wt") or 0)

        total_qty += float(row.get("qty") or 1)


        for diamond in row.get("diamond_details", []):

            total_dia_wt += float(
                diamond.get("diamond_wt") or 0
            )
        
        for stone in row.get("stone_details", []):

            total_stone_wt += float(
                stone.get("stone_wt") or 0
            )

    # ---------------------------------------------------------
    # GET USER
    # ---------------------------------------------------------
    user_name = frappe.get_doc(
        "User",
        po.owner
    )

    # ---------------------------------------------------------
    # JINJA CONTEXT
    # ---------------------------------------------------------
    context = {
        "doc": po,
        "items": items,
        "branch_name": branch_name,
        "total_qty": total_qty,
        "total_net_wt": total_net_wt,
        "total_dia_wt": total_dia_wt,
        "total_stone_wt": total_stone_wt,
        "user_name": user_name
    }

    # ---------------------------------------------------------
    # HTML TEMPLATE
    # ---------------------------------------------------------
    html = frappe.render_template(
        """
<style>

@page {
    size: A4;
    margin: 10mm;
}

body {
    font-family: Arial, sans-serif;
    color: #000;
}

table {
    border-collapse: collapse;
    width: 100%;
}

th,
td {
    border: 1px solid #000;
    padding: 5px;
    font-size: 12px;
}

th {
    background: #efefef;
    color: #000;
    font-weight: bold;
}

.header-table td {
    border: none;
    padding: 2px;
    font-size: 13px;
}

.company-title {
    text-align: center;
}

.company-title h2 {
    margin: 2px;
}

.diamond-table td,
.diamond-table th {
    font-size: 11px;
    border: 1px solid #000;
}

.total-table td {
    border: none;
    font-size: 13px;
    font-weight: bold;
}

.terms li {
    margin-bottom: 4px;
    font-size: 10px;
}

.item-image {
    width: 75px;
    height: 75px;
    object-fit: contain;
}

.item-table {
    page-break-inside: auto;
}

.item-table tr {
    page-break-inside: avoid;
}

</style>


<!-- =========================================================
     COMPANY HEADER
========================================================= -->

<div class="company-title">

    <h2>
        <b>SHAH VIRCHAND GOVANJI</b>
    </h2>

    <h2 style="font-size:14px;">
        JEWELLERS PVT. LTD.
    </h2>

    <h2 style="font-size:14px;">
        VALSAD - VAPI - SURAT
    </h2>

    <h2 style="font-size:14px;">
        Phone Number : 02632-229999
    </h2>

    <br>

    <h2 style="font-size:18px;">
        <u>PURCHASE ORDER</u>
    </h2>

</div>


<!-- =========================================================
     PO HEADER
========================================================= -->

<table class="header-table">

    <tr>

        <td width="50%">

            PO No :
            <b>
                {{ doc.name }}
            </b>

        </td>

        <td align="right">

            Vendor :
            <b>
                {{ doc.vendor or "" }}
            </b>

        </td>

    </tr>


    <tr>

        <td>

            PO Date :
            <b>
                {{
                    frappe.utils.format_date(
                        doc.creation,
                        "dd-MM-yyyy"
                    )
                }}
            </b>

        </td>

        <td align="right">

            Delivery Date :
            <b>
                {{
                    frappe.utils.format_date(
                        doc.vendor_delivery_date,
                        "dd-MM-yyyy"
                    )
                    if doc.vendor_delivery_date
                    else ""
                }}
            </b>

        </td>

    </tr>


    <tr>

        <td>


        </td>

        <td align="right">

            Total Qty :
            <b>
                {{ total_qty }}
            </b>

        </td>

    </tr>

</table>


<br>


<!-- =========================================================
     ITEM TABLE
========================================================= -->

<table class="item-table">

    <tr>

        <th width="4%">
            Sr
        </th>

        <th width="12%">
            Image
        </th>

        <th width="18%" align="left">
            Item
        </th>

        <th width="8%" align="left">
            Metal
        </th>

        <th width="6%">
            Qty
        </th>

        <th width="10%" align="right">
            Gross Wt
        </th>

        <th width="10%" align="right">
            Net Wt
        </th>

        <th width="12%" align="right">
            Diamond Wt
        </th>

    </tr>


    {% for row in items %}

    <!-- =====================================================
         ITEM MAIN ROW
    ====================================================== -->

    <tr>

        <td
            rowspan="2"
            align="center"
        >
            {{ loop.index }}
        </td>
<td
    rowspan="2"
    align="center"
    style="vertical-align:middle; text-align:center;"
>
    {% if row.image %}
        <div style="width:100%; text-align:center;">
            <img
                src="{{ row.image }}"
                class="item-image"
                style="
                    display:block;
                    width:75px;
                    height:75px;
                    object-fit:contain;
                    margin:0 auto 5px auto;
                "
            >
        </div>
    {% endif %}

    <div style="
        width:100%;
        text-align:center;
        font-weight:bold;
    ">
        {{ row.vendor_design_number or "" }}
    </div>
</td>
        <td>

            <b>
                {{ row.item or row.name or "" }}
            </b>

        </td>


        <td align="left">

            {{ row.metal or "" }}

        </td>


        <td align="center">

            {{ row.qty or 1 }}

        </td>


        <td align="right">

            {{ row.gr_wt or 0 }}

        </td>


        <td align="right">

            {{ row.net_wt or 0 }}

        </td>


        <td align="right">

            {{
                "%.3f"|format(
                    row.diamond_details
                    |sum(attribute="diamond_wt")
                )
            }}

        </td>

    </tr>


    <!-- =====================================================
         DIAMOND / STONE / REMARK ROW
    ====================================================== -->

    <tr>

        <td
            colspan="6"
            style="padding:0;"
        >

            <!-- =============================================
                 DIAMOND DETAILS
            ============================================== -->

            {% if row.diamond_details %}

            <table
                class="diamond-table"
                width="100%"
            >

                <tr
                    style="
                        background:#f8f8f8;
                        font-weight:bold;
                        text-align:center;
                    "
                >

                    <th width="18%">
                        Diamond
                    </th>

                    <th>
                        Shape
                    </th>

                    <th>
                        Size
                    </th>

                    <th>
                        Pcs
                    </th>

                    <th>
                        Weight
                    </th>

                    <th>
                        Rate
                    </th>

                    <th>
                        Amount
                    </th>

                </tr>


                {% for diamond in row.diamond_details %}

                <tr align="center">

                    <td>

                        <b>
                            Diamond {{ loop.index }}
                        </b>

                    </td>

                    <td>
                        {{ diamond.diamond_shape or "" }}
                    </td>

                    <td>
                        {{ diamond.diamond_size or "" }}
                    </td>

                    <td>
                        {{ diamond.diamond_pcs or "" }}
                    </td>

                    <td>
                        {{ diamond.diamond_wt or "" }}
                    </td>

                    <td>
                        {{ diamond.diamond_rate or "" }}
                    </td>

                    <td>
                        {{ diamond.diamond_amount or "" }}
                    </td>

                </tr>

                {% endfor %}

            </table>

            {% endif %}


            <!-- =============================================
                 STONE DETAILS
            ============================================== -->

            {% if row.stone_details %}

            <table
                class="stone-table"
                width="100%"
            >

                <tr
                    style="
                        background:#f8f8f8;
                        font-weight:bold;
                        text-align:center;
                    "
                >

                    <th width="18%">
                        Stone
                    </th>

                    <th>
                        Pcs
                    </th>

                    <th>
                        Weight
                    </th>

                    <th>
                        Rate
                    </th>

                    <th>
                        Amount
                    </th>

                </tr>


                {% for stone in row.stone_details %}

                <tr align="center">

                    <td>

                        <b>
                            Diamond {{ loop.index }}
                        </b>

                    </td>

                    <td>
                        {{ stone.stone_pcs or "" }}
                    </td>

                    <td>
                        {{ stone.stone_wt or "" }}
                    </td>

                    <td>
                        {{ stone.stone_rate or "" }}
                    </td>

                    <td>
                        {{ stone.stone_amount or "" }}
                    </td>

                </tr>

                {% endfor %}

            </table>

            {% endif %}



            <!-- =============================================
                 REMARK
            ============================================== -->

            <table
                class="diamond-table"
                width="100%"
            >

                <tr>

                    <td
                        width="18%"
                        style="font-weight:bold;"
                    >
                        Remark
                    </td>

                    <td colspan="6">

                        {{ row.remark or "" }}

                    </td>

                </tr>

            </table>

        </td>

    </tr>


    {% endfor %}

</table>


<br>


<!-- =========================================================
     TOTALS
========================================================= -->

<table class="total-table">

    <tr>

        <td align="right">

            Total Qty :
            {{ total_qty }}

            &nbsp;&nbsp;&nbsp;&nbsp;

            Total Net Wt :
            {{ "%.3f"|format(total_net_wt) }}

            &nbsp;&nbsp;&nbsp;&nbsp;

            Total Diamond Wt :
            {{ "%.3f"|format(total_dia_wt) }}

            &nbsp;&nbsp;&nbsp;&nbsp;

            Total Stone Wt :
            {{ "%.3f"|format(total_stone_wt) }}

        </td>

    </tr>

</table>


<br>


<!-- =========================================================
     TERMS
========================================================= -->

<div style="font-weight:bold;">
    Important Terms and Conditions
</div>


<ul class="terms">

    <li>
        <b>
        The weight mentioned in the Purchase Order is final,
        and the order must be as per the specified weight.
        </b>
    </li>

    <li>
        <b>
        Delivery dates specified in the PO are binding.
        </b>
    </li>

    <li>
        <b>
        Goods must conform to agreed specifications and be free
        from defects.
        </b>
    </li>

    <li>
        <b>
        Rejected goods will be returned at the vendor's expense.
        </b>
    </li>

    <li>
        <b>
        The vendor is responsible for all expenses related to
        repairing jewellery products.
        </b>
    </li>

    <li>
        <b>
        The buyer reserves the right to cancel the PO without
        liability if the vendor fails to meet agreed-upon terms
        or specifications.
        </b>
    </li>

    <li>
        <b>
        Please review the Purchase Order and confirm your
        acceptance by replying to this email or via WhatsApp
        at your earliest convenience.
        </b>
    </li>

    <li>
        <b>
        If a product is damaged or has a QC issue and VG repairs it
        at its facility, charges for the same will be borne by the
        vendor.
        </b>
    </li>

</ul>


<br><br><br>


<!-- =========================================================
     SIGNATURE
========================================================= -->

<table class="header-table">

    <tr>

        <td width="70%"></td>

        <td align="right">

            <u>
                {{ user_name.full_name }}
            </u>

        </td>

    </tr>


    <tr>

        <td></td>

        <td align="right">

            (Purchase Department)

        </td>

    </tr>

</table>
        """,
        context
    )

    # ---------------------------------------------------------
    # GENERATE PDF
    # ---------------------------------------------------------
    pdf = get_pdf(html)

    # ---------------------------------------------------------
    # SAVE PDF
    # ---------------------------------------------------------
    file_doc = frappe.get_doc({
        "doctype": "File",
        "file_name": f"{po_no}.pdf",
        "attached_to_doctype": "Quotation PO",
        "attached_to_name": po_no,
        "is_private": 0,
        "content": pdf
    })

    file_doc.save(ignore_permissions=True)

    frappe.db.commit()

    return {
        "success": True,
        "file_url": file_doc.file_url
    }




@frappe.whitelist(allow_guest=True)    
def send_pending_po_emails():
    po_list = frappe.get_all(
        "Quotation PO",
        filters={
            #"is_mail_send": 1,
            "status": 1
        },
        fields=[
            "name",
            "po_no",
            "vendor",
            "vendor_delivery_date",
            "branch"
        ],
        order_by="creation asc"
    )

    if not po_list:
        return

    for po in po_list:

        try:

            # -------------------------------------------------
            # GET FULL PO
            # -------------------------------------------------
            po_doc = frappe.get_doc(
                "Quotation PO",
                po.name
            )

            # -------------------------------------------------
            # GET VENDOR EMAIL
            #
            # PO.vendor = supplier_code
            # -------------------------------------------------

            vendor_data = frappe.db.get_value(
                "Ornate_Supplier_Master",
                {
                    "supplier_code": po_doc.vendor
                },
                ["po_contact_person_email", "supplier_name","po_contact_person_mobile1"],
                as_dict=True
            )

            vendor_email = vendor_data.po_contact_person_email if vendor_data else None
            vendor_name = vendor_data.supplier_name if vendor_data else None
            vendor_mobile = vendor_data.po_contact_person_mobile1 if vendor_data else None

            # Fallback to Visitor Vendor
            if not vendor_email or not vendor_name:
                visitor_vendor = frappe.db.get_value(
                    "Visitor Vendor",
                    {
                        "vendor_code": po_doc.vendor
                    },
                    ["vendor_email", "vendor_name","vendor_mobile_no"],
                    as_dict=True
                )

                if visitor_vendor:
                    if not vendor_email:
                        vendor_email = visitor_vendor.vendor_email

                    if not vendor_name:
                        vendor_name = visitor_vendor.vendor_name
                    
                    if not vendor_mobile:
                        vendor_mobile = visitor_vendor.vendor_mobile_no


            if not vendor_email:

                frappe.log_error(
                    f"Vendor email not found. "
                    f"Vendor Code: {po_doc.vendor}, "
                    f"PO: {po.name}",
                    "PO Email Cron"
                )

                continue

            # -------------------------------------------------
            # GENERATE PDF
            # -------------------------------------------------
            pdf_response = generate_pdf(
                po.name
            )

            if not pdf_response:
                continue

            file_url = pdf_response.get("file_url")

            if not file_url:
                continue
            base_url = frappe.utils.get_url()
            pdf_url = f"{base_url}{file_url}"
            link = " "
            body_param =[po.vendor,po.name,"8238095376",link ]
            mobile = f"91{vendor_mobile}"
            send_whatsapp(mobile,"purchase_order_whatsapp_with_link_new",pdf_url,body_param)
            send_whatsapp("919273446652","purchase_order_whatsapp_with_link_new",pdf_url,body_param)
            send_whatsapp("919512152521","purchase_order_whatsapp_with_link_new",pdf_url,body_param)


            # -------------------------------------------------
            # GET PDF FILE
            # -------------------------------------------------
            file_doc = frappe.get_doc(
                "File",
                {
                    "file_url": file_url
                }
            )

            # -------------------------------------------------
            # EMAIL
            # -------------------------------------------------
            subject = f"Purchase Order - {po.name}"

            message = f"""
                <p>Dear Sir/Madam,</p>

                <p>
                    Please find attached Purchase Order
                    <b>{po.name}</b>.
                </p>

                <p>
                    Kindly review the Purchase Order and confirm
                    your acceptance.
                </p>

                <br>

                <p>
                    Regards,<br>
                    Purchase Department<br>
                    SHAH VIRCHAND GOVANJI JEWELLERS PVT. LTD.
                </p>
            """

            # -------------------------------------------------
            # SEND EMAIL
            # -------------------------------------------------
            frappe.sendmail(
                recipients=[vendor_email,"mukesh.k@svgjewels.com","miteshthakur87@gmail.com"],
                subject=subject,
                message=message,
                attachments=[
                    {
                        "fname": file_doc.file_name,
                        "fcontent": file_doc.get_content()
                    }
                ],
                reference_doctype="Quotation PO",
                reference_name=po.name
            )

            # -------------------------------------------------
            # MARK AS MAIL SENT
            # -------------------------------------------------
            frappe.db.set_value(
                "Quotation PO",
                po.name,
                "is_mail_send",
                0
            )

            frappe.db.commit()

        except Exception:

            frappe.log_error(
                frappe.get_traceback(),
                f"PO Email Failed - {po.name}"
            )

            frappe.db.rollback()    


