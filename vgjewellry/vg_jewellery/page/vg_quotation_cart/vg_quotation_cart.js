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
						message: "PO Created Successfully " ,
						indicator: "green"
					});

					this.dialog.hide();

					setTimeout(() => { location.reload(); }, 500);

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
		let total_stone_wt = 0;

		let html = `

<div class="container-fluid">

    <div class="row mb-3">

	<div class="col-md-4">

	    <label><b>Vendor</b></label>

	    <div style="font-size:16px;font-weight:bold;">
		${data.vendor || ""}
	    </div>

	</div>

	<div class="col-md-4">

	    <label><b>Vendor Delivery Date</b></label>

	    <input
		type="date"
		class="form-control"
		id="vendor_delivery_date"
		value="${data.vendor_delivery_date || ""}"
	    >

	</div>

    </div>

`;


		/*
		 * =========================================================
		 * GROUP BY BRANCH
		 * =========================================================
		 */

		(data.branches || []).forEach((branch_data, branch_index) => {

			let branch_net_wt = 0;
			let branch_dia_wt = 0;
			let branch_stone_wt = 0;


			html += `

	<div class="card mb-4">

	    <!-- BRANCH HEADER -->

	    <div class="card-header"
		style="
		    background:#f8f9fa;
		    border:1px solid #ddd;
		    padding:12px 15px;
		    font-size:17px;
		    font-weight:600;
		">

		<i class="fa fa-building"></i>

		Branch :

		<span style="color:#0d6efd;">
		    ${branch_data.branch_name || "Not Assigned"}
		</span>

	    </div>


	    <div class="card-body p-0">

		<table class="table table-bordered table-striped"
		       style="margin:0;">

		    <thead>

			<tr>

			    <th width="50">Sr.</th>

			    <th width="120">Image</th>

			    <th>Item</th>

			    <th width="90">Metal</th>

			    <th width="90">Net Wt</th>

			    <th width="90">Gr Wt</th>

			    <th width="80">Qty</th>

			    <th width="250">Remark</th>

			    <th width="60"></th>

			</tr>

		    </thead>

		    <tbody>

	`;


			/*
			 * =====================================================
			 * ITEMS
			 * =====================================================
			 */

			(branch_data.items || []).forEach((d, i) => {

				let item_net_wt = Number(d.net_wt || 0);

				branch_net_wt += item_net_wt;
				total_net_wt += item_net_wt;


				/*
				 * =================================================
				 * DIAMOND DETAILS
				 * =================================================
				 */

				let diamond_html = "";

				let item_dia_wt = 0;


				if (
					d.diamond_details &&
					d.diamond_details.length
				) {

					diamond_html = `

		    <table class="table table-bordered table-condensed"
			   style="margin:0; background:white;">

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

						let dia_wt =
							Number(dia.diamond_wt || 0);

						item_dia_wt += dia_wt;


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
				${dia_wt.toFixed(3)}
			    </td>

			    <td>
				${Number(
					dia.diamond_rate || 0
				).toFixed(2)}
			    </td>

			    <td>
				${Number(
					dia.diamond_amount || 0
				).toFixed(2)}
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
		    <span class="text-muted">
			No Diamond
		    </span>
		`;

				}


				branch_dia_wt += item_dia_wt;
				total_dia_wt += item_dia_wt;


				/*
				 * =================================================
				 * STONE DETAILS
				 * =================================================
				 */
				
				let stone_html = "";

				let item_stone_wt = 0;


				if (
					d.stone_details &&
					d.stone_details.length
				) {

					stone_html = `

		    <table class="table table-bordered table-condensed"
			   style="margin:0; background:white;">

			<thead>

			    <tr>

				<th>Pcs</th>
				<th>Wt</th>
				<th>Rate</th>
				<th>Amount</th>

			    </tr>

			</thead>

			<tbody>
		`;


					d.stone_details.forEach(dia => {

						let dia_wt =
							Number(dia.stone_wt || 0);

						item_stone_wt += dia_wt;


						stone_html += `

			<tr>


			    <td>
				${dia.stone_pcs || 0}
			    </td>

			    <td>
				${dia_wt.toFixed(3)}
			    </td>

			    <td>
				${Number(
					dia.stone_rate || 0
				).toFixed(2)}
			    </td>

			    <td>
				${Number(
					dia.stone_amount || 0
				).toFixed(2)}
			    </td>

			</tr>

		    `;

					});


					stone_html += `

			</tbody>

		    </table>

		`;

				} else {

					stone_html = `
		    <span class="text-muted">
			No Stone
		    </span>
		`;

				}


				branch_stone_wt += item_stone_wt;
				total_stone_wt += item_stone_wt;





				/*
				 * =================================================
				 * MAIN PRODUCT ROW
				 * =================================================
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
					    '/assets/frappe/images/ui-states/default-avatar.png'
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
			    ${d.vendor_design_number || ""}
			</span>

		    </td>


		    <td>
			${d.metal || ""}
		    </td>


		    <td>
			${item_net_wt.toFixed(3)}
		    </td>


		    <td>
			${Number(
				d.gr_wt || 0
			).toFixed(3)}
		    </td>


		    <td>

			<input name="c1"
			    type="number"
			    min="1"
			    value="${d.qty || 1}"
			    class="form-control cart-qty"
			    data-name="${d.cart_name}"
			>

		    </td>


		    <td>

			<textarea name="c3"
			    rows="2"
			    class="form-control cart-remark"
			    data-name="${d.cart_name}"
			    placeholder="Enter Remark"
			>${d.remark || ""}</textarea>

		    </td>


		    <td>

			<button
			    class="btn btn-danger btn-sm remove-cart-item"
			    data-name="${d.cart_name}"
			>

			    <i class="fa fa-trash"></i>

			</button>

		    </td>

		</tr>


		<!-- =================================================
		     SECOND ROW : DIAMOND + STONE
		     ================================================= -->

		<tr style="background:#fafafa;">

		    <td></td>

		    <td></td>

		    <td colspan="2">

			<div style="
			    font-weight:600;
			    margin-bottom:5px;
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
			    margin-bottom:5px;
			    color:#495057;
			">

			    <i class="fa fa-circle"></i>

			    Stone Details

			</div>

			${stone_html}

		    </td>


		    <td colspan="2">

			<div style="
			    font-size:13px;
			    color:#6c757d;
			    padding:10px;
			">

			    <b>Diamond Wt:</b>
			    ${item_dia_wt.toFixed(3)}

			    <br>

			    <b>Stone Wt:</b>
			    ${item_stone_wt.toFixed(3)}

			</div>

		    </td>

		</tr>

	    `;

			});


			/*
			 * =====================================================
			 * BRANCH TOTAL
			 * =====================================================
			 */

			html += `

		    </tbody>

		</table>


		<div
		    style="
			padding:12px 15px;
			background:#f8f9fa;
			border-top:1px solid #ddd;
		    "
		>

		    <div style="
			display:flex;
			gap:25px;
			align-items:center;
			font-weight:600;
			flex-wrap:wrap;
		    ">

			<div>

			    Branch Net Wt :

			    <span style="color:#0d6efd;">
				${branch_net_wt.toFixed(3)}
			    </span>

			</div>


			<div>

			    Branch Diamond Wt :

			    <span style="color:#198754;">
				${branch_dia_wt.toFixed(3)}
			    </span>

			</div>


			<div>

			    Branch Stone Wt :

			    <span style="color:#fd7e14;">
				${branch_stone_wt.toFixed(3)}
			    </span>

			</div>

		    </div>

		</div>


	    </div>

	</div>

	`;

		});


		/*
		 * =========================================================
		 * OVERALL TOTAL
		 * =========================================================
		 */

		html += `

	<div class="row mt-3 align-items-center">

	    <div class="col-md-8">

		<div style="
		    display:flex;
		    gap:15px;
		    align-items:center;
		    font-size:17px;
		    font-weight:600;
		    flex-wrap:wrap;
		">


		    <div style="
			background:#f8f9fa;
			padding:12px 18px;
			border:1px solid #ddd;
			border-radius:6px;
		    ">

			Total Net Wt :

			<span style="color:#0d6efd;">
			    ${total_net_wt.toFixed(3)}
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
			    ${total_dia_wt.toFixed(3)}
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
			    ${total_stone_wt.toFixed(3)}
			</span>

		    </div>


		</div>

	    </div>


	    <div class="col-md-4 text-right">

		<button
		    class="btn btn-success btn-lg"
		    id="generate-po"
		>

		    <i class="fa fa-check"></i>

		    Generate PO

		</button>

	    </div>

	</div>

    </div>

`;


		this.dialog.fields_dict.cart.$wrapper.html(html);
	}


}
