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

    let po = data.po;
    let items = data.items;

    let total_net = 0;
    let total_dia = 0;

    let html = `

<div class="po-dialog">

<div class="row mb-3">

<div class="col-md-4">
<b>PO Number :</b> ${po.name}
</div>

<div class="col-md-4">
<b>Vendor :</b> ${po.vendor}
</div>

<div class="col-md-4">
<b>Delivery Date :</b>
${frappe.datetime.str_to_user(po.vendor_delivery_date)}
</div>

</div>

<table class="table table-bordered">

<thead>

<tr>

<th>Sr</th>
<th>Image</th>
<th>Item</th>
<th>Metal</th>
<th>Net Wt</th>
<th>Gr Wt</th>
<th>Dia Wt</th>
<th>Total</th>

</tr>

</thead>

<tbody>
`;

    items.forEach((d, i) => {

        let dia =
            Number(d.dia_wt1 || 0) +
            Number(d.dia_wt2 || 0);

        total_net += Number(d.net_wt || 0);
        total_dia += dia;

        html += `

<tr>

<td>${i + 1}</td>

<td>
<img
src="${d.image}"
style="width:90px;height:90px;object-fit:contain;">
</td>

<td>${d.item}</td>

<td>${d.metal}</td>

<td>${d.net_wt}</td>

<td>${d.gr_wt}</td>

<td>${dia.toFixed(3)}</td>

<td>${d.net_wt}</td>

</tr>

<tr>

<td colspan="8">


<div class="row">

<div class="col-md-6">

<table class="table table-bordered table-sm">

<tr>

<th colspan="5">

Diamond 1

</th>

</tr>

<tr>

<th>Shape</th>
<th>Size</th>
<th>Pcs</th>
<th>Wt</th>
<th>Amt</th>

</tr>

<tr>

<td>${d.dia_shape1 || ""}</td>
<td>${d.dia_size1 || ""}</td>
<td>${d.dia_pcs1 || 0}</td>
<td>${d.dia_wt1 || 0}</td>
<td>${frappe.format(d.dia_amt1 || 0,{fieldtype:"Currency"})}</td>

</tr>

</table>

</div>

${
(d.dia_pcs2 || d.dia_wt2) ?

`

<div class="col-md-6">

<table class="table table-bordered table-sm">

<tr>

<th colspan="5">

Diamond 2

</th>

</tr>

<tr>

<th>Shape</th>
<th>Size</th>
<th>Pcs</th>
<th>Wt</th>
<th>Amt</th>

</tr>

<tr>

<td>${d.dia_shape2 || ""}</td>
<td>${d.dia_size2 || ""}</td>
<td>${d.dia_pcs2 || 0}</td>
<td>${d.dia_wt2 || 0}</td>
<td>${frappe.format(d.dia_amt2 || 0,{fieldtype:"Currency"})}</td>

</tr>

</table>

</div>

`

: ""

}

</div>

<b>Remark :</b> ${d.remark || "-"}

<br><br>
</td>

</tr>

`;

    });

    html += `

</tbody>

<tfoot>

<tr>

<th colspan="4" class="text-right">

Total

</th>

<th>

${total_net.toFixed(3)}

</th>

<th></th>

<th>

${total_dia.toFixed(3)}

</th>

<th>

${total_net.toFixed(3)}

</th>

</tr>

</tfoot>

</table>

</div>
`;

    return html;

}
}
