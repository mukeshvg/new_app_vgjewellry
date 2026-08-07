frappe.pages['vg-quotation-cart'].on_page_load = function(wrapper) {

	new QuotationCart(wrapper);

};

class QuotationCart {

	constructor(wrapper){

		this.wrapper = $(wrapper);

		this.page = frappe.ui.make_app_page({
			parent: wrapper,
			title: "Quotation Cart",
			single_column: true
		});

		this.make();

		this.load_suppliers();

		this.bind_events();

	}

	make(){

		this.page.main.html(`

	    <div class="quotation-cart-page">

		<div class="supplier-table"></div>

	    </div>

	`);
		this.page.add_inner_button(
    '<i class="fa fa-arrow-left"></i> Quotation Bank',
    () => {
        frappe.set_route("quotation-bank");
		})
		this.page.add_inner_button(
    '<i class="fa fa-arrow-right"></i> Quotation PO',
    () => {
        frappe.set_route("vg-quotation-po");
    }
);

	}

	load_suppliers(){

		frappe.call({

			method: "vgjewellry.vg_jewellery.page.vg_quotation_cart.vg_quotation_cart.get_supplier_list",

			callback: (r)=>{

				this.render_table(r.message || []);

			}

		});

	}

	render_table(data){

		let html = `

	<table class="table table-bordered table-hover">

	    <thead>

		<tr>

		    <th width="180">Supplier Code</th>

		    <th>Supplier Name</th>

		    <th width="120">Jewellery</th>

		    <th width="100">Qty</th>

		    <th width="120">Action</th>

		</tr>

	    </thead>

	    <tbody>

	`;

		data.forEach(d=>{

			html += `

		<tr>

		    <td>${d.vendor_code || ""}</td>

		    <td>${d.vendor}</td>

		    <td>Diamond</td>

		    <td>${d.qty}</td>

		    <td>

			<button
			    class="btn btn-primary btn-xs btn-view"
			    data-vendor="${d.vendor}">

			    View

			</button>

		    </td>

		</tr>

	    `;

		});

		html += `

	    </tbody>

	</table>

	`;

		this.page.main.find(".supplier-table").html(html);

	}

	bind_events(){

		const me = this;
		$(document).on("click", ".remove-cart-item", function () {

    const name = $(this).data("name");

    frappe.confirm(

        "Remove this product from cart?",

        function () {

            frappe.call({

                method: "vgjewellry.vg_jewellery.page.vg_quotation_cart.vg_quotation_cart.remove_cart_item",

                args: {
                    name: name
                },

                callback(r) {

                    if (r.message) {

                        frappe.show_alert({
                            message: "Product removed",
                            indicator: "green"
                        });

                        me.open_vendor_cart(me.current_vendor);
			    

                        me.load_cart();

                        if (me.load_cart_count) {
                            me.load_cart_count();
                        }

                    }

                }

            });

        }

    );

});

		$(document).on("click",".btn-view",function(){

			let vendor = $(this).data("vendor");

			me.open_vendor_cart(vendor);


		});
$(document).on("click", "#generate-po", () => {

    let remarks = {};

    $(".cart-remark").each(function () {

        remarks[$(this).data("name")] = $(this).val();

    });

    frappe.call({

        method: "vgjewellry.vg_jewellery.page.vg_quotation_cart.vg_quotation_cart.generate_po",

        args: {

            vendor: this.current_vendor,

            vendor_delivery_date: $("#vendor_delivery_date").val(),

            remarks: remarks

        },

        callback: (r) => {

            if (!r.message) return;

            frappe.show_alert({
                message: "PO Created : " + r.message.po_no,
                indicator: "green"
            });

            this.dialog.hide();

            this.load_cart();

            this.load_cart_count();

        }

    });

});
	}
	open_vendor_cart(vendor){
		this.current_vendor = vendor;
		    if (!this.dialog) {

		this.dialog = new frappe.ui.Dialog({

			title: "Vendor Cart",

			size: "extra-large",

			fields:[
				{
					fieldtype:"HTML",
					fieldname:"cart"
				}
			]

		});
		    }

		this.dialog.show();

		frappe.call({

			method:
			"vgjewellry.vg_jewellery.page.vg_quotation_cart.vg_quotation_cart.get_vendor_cart",

			args:{
				vendor:vendor
			},

			callback:(r)=>{
				this.dialog.hide();

				this.render_vendor_cart(r.message);

			}

		});

	}
	render_vendor_cart(data) {

    let total_net_wt = 0;
    let total_dia_wt = 0;		

    let html = `

<div class="container-fluid">

<div class="row mb-3">

    <div class="col-md-4">

        <label><b>Vendor</b></label>

        <div style="font-size:16px;font-weight:bold;">
            ${data.vendor}
        </div>

    </div>

    <div class="col-md-4">

        <label><b>Vendor Delivery Date</b></label>

        <input
            type="date"
            class="form-control"
            id="vendor_delivery_date"
            value="${data.vendor_delivery_date || ""}">

    </div>


</div>

<table class="table table-bordered table-striped">

<thead>

<tr>

<th width="60">Sr.</th>

<th width="120">Image</th>

<th>Item</th>

<th width="90">Metal</th>

<th width="90">Net Wt</th>

<th width="90">Gr Wt</th>

<th width="320">Diamond Details</th>

<th width="80">Qty</th>

<th width="250">Remark</th>

<th width="60"></th>

</tr>

</thead>

<tbody>

`;

    data.items.forEach((d, i) => {

        total_net_wt += Number(d.net_wt || 0);
	total_dia_wt +=  Number(d.dia_wt1 || 0) +  Number(d.dia_wt2 || 0);    

        html += `

<tr>

<td>

${i + 1}

</td>

<td>

<img
src="${d.image || '/assets/frappe/images/ui-states/default-avatar.png'}"
style="
width:90px;
height:90px;
object-fit:contain;
">

</td>

<td>

<b>${d.item || ""}</b>

<br>

${d.design_no || ""}

</td>

<td>

${d.metal || ""}

</td>

<td>

${Number(d.net_wt || 0).toFixed(3)}

</td>

<td>

${Number(d.gr_wt || 0).toFixed(3)}

</td>

<td>

<table class="table table-bordered table-condensed" style="margin:0;">

<tr>

<th>Shape</th>

<th>Size</th>

<th>Pcs</th>

<th>Wt</th>

</tr>

<tr>

<td>${d.dia_shape1 || "-"}</td>

<td>${d.dia_size1 || "-"}</td>

<td>${d.dia_pcs1 || 0}</td>

<td>${d.dia_wt1 || 0}</td>

</tr>
${
        Number(d.dia_pcs2 || 0) > 0 ||
        Number(d.dia_wt2 || 0) > 0 ||
        d.dia_shape2 ||
        d.dia_size2
        ?
        `
        <tr>

            <td>${d.dia_shape2 || "-"}</td>
            <td>${d.dia_size2 || "-"}</td>
            <td>${d.dia_pcs2 || 0}</td>
            <td>${Number(d.dia_wt2 || 0).toFixed(3)}</td>

        </tr>
        `
        : ""
    }

</table>

</td>

<td>

<input
type="number"
min="1"
value="${d.qty || 1}"
class="form-control cart-qty"
data-name="${d.cart_name}">

</td>

<td>

<textarea
rows="2"
class="form-control cart-remark"
data-name="${d.cart_name}"
placeholder="Enter Remark">${d.remark || ""}</textarea>

</td>

<td>

<button
class="btn btn-danger btn-sm remove-cart-item"
data-name="${d.cart_name}">

<i class="fa fa-trash"></i>

</button>

</td>

</tr>

`;

    });

		html += `

</tbody>

</table>

<div class="row mt-3 align-items-center">

    <div class="col-md-8">

        <div style="
            display:flex;
            gap:20px;
            align-items:center;
            font-size:18px;
            font-weight:600;
        ">

            <div style="
                background:#f8f9fa;
                padding:12px 20px;
                border:1px solid #ddd;
                border-radius:6px;
            ">
                Total Net Wt :
                <span style="color:#0d6efd">
                    ${total_net_wt.toFixed(3)}
                </span>
            </div>

            <div style="
                background:#f8f9fa;
                padding:12px 20px;
                border:1px solid #ddd;
                border-radius:6px;
            ">
                Total Diamond Wt :
                <span style="color:#198754">
                    ${total_dia_wt.toFixed(3)}
                </span>
            </div>

        </div>

    </div>

    <div class="col-md-4 text-right">

        <button
            class="btn btn-success btn-lg"
            id="generate-po">

            <i class="fa fa-check"></i>

            Generate PO

        </button>

    </div>

</div>

`;


    this.dialog.fields_dict.cart.$wrapper.html(html);

}

}
