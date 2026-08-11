frappe.pages['vg-quotation-po'].on_page_load = function(wrapper) {

    new VGQuotationPO(wrapper);

};

class VGQuotationPO {

    constructor(wrapper) {

        this.wrapper = $(wrapper);

        this.page = frappe.ui.make_app_page({
            parent: wrapper,
            title: "Quotation PO",
            single_column: true
        });

        this.make();
	this.bind_events()
        this.load_data();
    }

	bind_events() {
        const me = this;

        $(document).on("click", ".btn-view", function () {
            const po = $(this).data("name");
            me.view_po(po);
        });
    }

    make() {

        this.page.set_primary_action("Refresh", () => {
            this.load_data();
        });

        this.page.add_inner_button("Quotation Bank", () => {
            frappe.set_route("quotation-bank");
        });

        this.page.main.html(`

<div class="quotation-po-page">

    <div class="table-responsive">

        <table class="table table-bordered table-hover">

            <thead>

                <tr>

                    <th>PO No</th>
                    <th>Vendor Name</th>
                    <th>Delivery Date</th>
                    <th>Jewellery</th>
                    <th>Total Items</th>
                    <th>Action</th>

                </tr>

            </thead>

            <tbody id="po-list">

                <tr>

                    <td colspan="6" class="text-center">

                        Loading...

                    </td>

                </tr>

            </tbody>

        </table>

    </div>

</div>

        `);

    }

    load_data() {

        frappe.call({

            method: "vgjewellry.vg_jewellery.page.vg_quotation_po.vg_quotation_po.get_po_list",

            callback: (r) => {

                this.render(r.message || []);

            }

        });

    }

    render(data) {

        let html = "";

        if (!data.length) {

            html = `

<tr>

<td colspan="6" class="text-center">

No Purchase Orders Found

</td>

</tr>

`;

            $("#po-list").html(html);

            return;
        }

        data.forEach(d => {

            html += `

<tr>

<td>${d.name}</td>

<td>${d.vendor || ""}</td>

<td>${frappe.datetime.str_to_user(d.vendor_delivery_date)}</td>

<td>${d.jewellery_type || ""}</td>

<td class="text-center">${d.total_items}</td>

<td>

<button
    class="btn btn-primary btn-sm btn-view"
    data-name="${d.name}">

    View

</button>

</td>

</tr>

`;

        });

        $("#po-list").html(html);


    }
view_po(name) {

    frappe.call({
        method: "vgjewellry.vg_jewellery.page.vg_quotation_po.vg_quotation_po.get_po_details",
        args: {
            po_no: name
        },
        callback: (r) => {

            if (!r.message) return;

            const data = r.message;

            let dialog = new frappe.ui.Dialog({
                title: "Purchase Order - " + data.po.name,
                size: "extra-large",
                fields: [
                    {
                        fieldtype: "HTML",
                        fieldname: "details"
                    }
                ],
		    primary_action_label: "Download PDF",
    primary_action() {
        // download pdf
	    frappe.call({
    method: "vgjewellry.vg_jewellery.page.vg_quotation_po.vg_quotation_po.generate_pdf",
    args: {
        po: name
    },
    freeze: true,
    callback: function(r) {

        if (r.message && r.message.success) {
            window.open(r.message.file_url, "_blank");
        }
    }
});
    },
    secondary_action_label: "Close",
    secondary_action() {
        dialog.hide();
    }
    
            });

            dialog.show();

            dialog.fields_dict.details.$wrapper.html(
                this.render_po_dialog(data)
            );

        }
    });

}

render_po_dialog(data) {

    let po = data.po || {};
    let items = data.items || [];

    let total_net = 0;
    let total_dia = 0;
    let total_stone = 0;


    let html = `

<div class="po-dialog">

    <!-- =====================================================
         PO HEADER
         ===================================================== -->

    <div class="row mb-3">

        <div class="col-md-3">

            <b>PO Number :</b>

            <div style="
                font-size:16px;
                font-weight:600;
            ">

                ${po.name || ""}

            </div>

        </div>


        <div class="col-md-3">

            <b>Vendor :</b>

            <div style="
                font-size:16px;
                font-weight:600;
            ">

                ${po.vendor || ""}

            </div>

        </div>


        <div class="col-md-3">

            <b>Branch :</b>

            <div style="
                font-size:16px;
                font-weight:600;
            ">

                ${data.branch_name || "-"}

            </div>

        </div>


        <div class="col-md-3">

            <b>Delivery Date :</b>

            <div style="
                font-size:16px;
                font-weight:600;
            ">

                ${
                    po.vendor_delivery_date
                    ? frappe.datetime.str_to_user(
                        po.vendor_delivery_date
                    )
                    : "-"
                }

            </div>

        </div>

    </div>


    <!-- =====================================================
         ITEMS TABLE
         ===================================================== -->

    <table class="table table-bordered table-striped">

        <thead>

            <tr>

                <th width="50">Sr.</th>

                <th width="110">Image</th>

                <th>Item</th>

                <th width="90">Metal</th>

                <th width="90">Net Wt</th>

                <th width="90">Gr Wt</th>

                <th width="90">Qty</th>

                <th width="250">Remark</th>

            </tr>

        </thead>


        <tbody>

`;


    items.forEach((d, i) => {

        /*
         * =====================================================
         * DIAMOND TOTAL
         * =====================================================
         */

        let item_dia_wt = 0;


        /*
         * New diamond_details array
         */

        if (
            d.diamond_details &&
            d.diamond_details.length
        ) {

            d.diamond_details.forEach(dia => {

                item_dia_wt += Number(
                    dia.diamond_wt || 0
                );

            });

        } else {

            /*
             * Backward compatibility
             * with dia_wt1 / dia_wt2
             */

            item_dia_wt =
                Number(d.dia_wt1 || 0) +
                Number(d.dia_wt2 || 0);

        }


        /*
         * Stone
         */

        let stone_wt =
            Number(d.stone_wt || 0);


        /*
         * Totals
         */

        total_net +=
            Number(d.net_wt || 0);

        total_dia +=
            item_dia_wt;

        total_stone +=
            stone_wt;


        /*
         * =====================================================
         * DIAMOND DETAILS HTML
         * =====================================================
         */

        let diamond_html = "";


        if (
            d.diamond_details &&
            d.diamond_details.length
        ) {

            diamond_html = `

                <table
                    class="table table-bordered table-sm"
                    style="
                        margin:0;
                        background:white;
                    "
                >

                    <thead>

                        <tr>

                            <th>Shape</th>
                            <th>Size</th>
                            <th>Pcs</th>
                            <th>Wt</th>
                            <th>Rate</th>
                            <th>Amount</th>

                        </tr>

                    </thead>

                    <tbody>

            `;


            d.diamond_details.forEach(dia => {

                diamond_html += `

                    <tr>

                        <td>
                            ${dia.diamond_shape || "-"}
                        </td>

                        <td>
                            ${dia.diamond_size || "-"}
                        </td>

                        <td>
                            ${dia.diamond_pcs || 0}
                        </td>

                        <td>
                            ${Number(
                                dia.diamond_wt || 0
                            ).toFixed(3)}
                        </td>

                        <td>
                            ${frappe.format(
                                dia.diamond_rate || 0,
                                {
                                    fieldtype: "Currency"
                                }
                            )}
                        </td>

                        <td>
                            ${frappe.format(
                                dia.diamond_amount || 0,
                                {
                                    fieldtype: "Currency"
                                }
                            )}
                        </td>

                    </tr>

                `;

            });


            diamond_html += `

                    </tbody>

                </table>

            `;

        } else {

            diamond_html = `

                <div class="text-muted"
                     style="padding:10px;">

                    No Diamond Details

                </div>

            `;

        }


        /*
         * =====================================================
         * STONE DETAILS HTML
         * =====================================================
         */

        let stone_html = `

            <table
                class="table table-bordered table-sm"
                style="
                    margin:0;
                    background:white;
                "
            >

                <thead>

                    <tr>

                        <th>Pcs</th>
                        <th>Wt</th>
                        <th>Rate</th>
                        <th>Amount</th>

                    </tr>

                </thead>

                <tbody>

                    <tr>

                        <td>
                            ${d.stone_pcs || 0}
                        </td>

                        <td>
                            ${stone_wt.toFixed(3)}
                        </td>

                        <td>
                            ${frappe.format(
                                d.stone_rate || 0,
                                {
                                    fieldtype: "Currency"
                                }
                            )}
                        </td>

                        <td>
                            ${frappe.format(
                                d.stone_amount || 0,
                                {
                                    fieldtype: "Currency"
                                }
                            )}
                        </td>

                    </tr>

                </tbody>

            </table>

        `;


        /*
         * =====================================================
         * MAIN PRODUCT ROW
         * =====================================================
         */

        html += `

            <tr>

                <td>

                    ${i + 1}

                </td>


                <td>

                    <img
                        src="${
                            d.image ||
                            "/assets/frappe/images/ui-states/default-avatar.png"
                        }"
                        style="
                            width:90px;
                            height:90px;
                            object-fit:contain;
                        "
                    >

                </td>


                <td>

                    <b>
                        ${d.item || ""}
                    </b>

                    <br>

                    <span class="text-muted">

                        ${
                            d.vendor_design_number ||
                            d.design_no ||
                            ""
                        }

                    </span>

                </td>


                <td>

                    ${d.metal || ""}

                </td>


                <td>

                    ${Number(
                        d.net_wt || 0
                    ).toFixed(3)}

                </td>


                <td>

                    ${Number(
                        d.gr_wt || 0
                    ).toFixed(3)}

                </td>


                <td>

                    ${d.qty || 1}

                </td>


                <td>

                    ${d.remark || "-"}

                </td>

            </tr>


            <!-- =================================================
                 SECOND ROW : DIAMOND + STONE
                 ================================================= -->

            <tr style="background:#fafafa;">

                <td></td>


                <td></td>


                <td colspan="3">

                    <div style="
                        font-weight:600;
                        margin-bottom:6px;
                        color:#495057;
                    ">

                        <i class="fa fa-diamond"></i>

                        Diamond Details

                    </div>

                    ${diamond_html}

                </td>


                <td colspan="3">

                    <div style="
                        font-weight:600;
                        margin-bottom:6px;
                        color:#495057;
                    ">

                        <i class="fa fa-circle"></i>

                        Stone Details

                    </div>

                    ${stone_html}

                </td>

            </tr>

        `;

    });


    /*
     * =====================================================
     * FOOTER TOTALS
     * =====================================================
     */

    html += `

        </tbody>

    </table>


    <div
        class="mt-3"
        style="
            display:flex;
            gap:15px;
            align-items:center;
            flex-wrap:wrap;
            font-size:16px;
            font-weight:600;
        "
    >

        <div style="
            background:#f8f9fa;
            padding:12px 18px;
            border:1px solid #ddd;
            border-radius:6px;
        ">

            Total Net Wt :

            <span style="color:#0d6efd;">

                ${total_net.toFixed(3)}

            </span>

        </div>


        <div style="
            background:#f8f9fa;
            padding:12px 18px;
            border:1px solid #ddd;
            border-radius:6px;
        ">

            Total Diamond Wt :

            <span style="color:#198754;">

                ${total_dia.toFixed(3)}

            </span>

        </div>


        <div style="
            background:#f8f9fa;
            padding:12px 18px;
            border:1px solid #ddd;
            border-radius:6px;
        ">

            Total Stone Wt :

            <span style="color:#fd7e14;">

                ${total_stone.toFixed(3)}

            </span>

        </div>

    </div>


</div>

`;


    return html;
}


}
