frappe.pages['vg-purchase-cart'].on_page_load = function (wrapper) {

	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'VG Purchase Cart',
		single_column: true
	});

	$(wrapper).html(`
    <style>

    body {
	background: #0f0f0f;
    }

    h2 {
	color: #eaeaea;
	margin-bottom: 20px;
    }
    /* Card container */
    .cart-card {
	background: #1b1b1b;
	border-radius: 12px;
	margin-bottom: 20px;
	border: 1px solid #2a2a2a;
	overflow: hidden;
    }

    /* Card header */
    .cart-card-header {
	padding: 12px 16px;
	background: #202020;
	display: flex;
	justify-content: left;
	font-size: 14px;
	color: #e0e0e0;
    }

    /* Card body */
    .cart-card-body {
	padding: 10px 14px;
    }

    /* Card footer */
    .cart-card-footer {
	padding: 12px 16px;
	background: #202020;
	display: flex;
	gap: 15px;
	align-items: center;
	justify-content: flex-start;
    }

    /* Table */
    .cart-table {
	width: 100%;
	border-collapse: collapse;
    }

    .cart-table th {
	font-size: 11px;
	color: #aaa;
	text-transform: uppercase;
	padding: 8px;
	border-bottom: 1px solid #333;
    }

    .cart-table td {
	padding: 8px;
	font-size: 13px;
	color: #ddd;
	border-bottom: 1px solid #2a2a2a;
    }

    .cart-table tr:last-child td {
	border-bottom: none;
    }

    .btn-danger {
	background: #d9534f;
	border: none;
    }

    .btn-success {
	background: #0dbf58;
	border: none;
	color: #000;
	font-weight: 600;
    }

    .req-delivery-date {
	background: #262626;
	border: 1px solid #3a3a3a;
	color: #e8e8e8;
	padding: 4px 8px;
	border-radius: 6px;
    }

 .go-product-assignment {
        color: #0dbf58;
        font-size: 16px;
        text-decoration: none;
        float: right;
    }

    .go-product-assignment:hover {
        text-decoration: underline;
    }


    /* Empty cart message */
    .cart-empty {
        background: #1b1b1b;
        padding: 40px;
        border-radius: 12px;
        border: 1px solid #2a2a2a;
        width: 50%;
        margin: 0 auto;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    }

    .cart-empty h3 {
        font-size: 22px;
        color: #fff;
        margin-top: 15px;
    }

    .cart-empty p {
        color: #b0b0b0;
        font-size: 16px;
        margin-top: 10px;
    }

    /* Icon in empty cart */
    .empty-cart-icon {
        margin-bottom: 20px;
    }

    .empty-cart-icon img {
        width: 80px;
        height: auto;
    }
    </style>
<h2 style="text-align:center">Cart <a href="./product-assignment--" class="go-product-assignment">Go Product Assignment</a></h2>

    <div id="cart-container" style="padding:0 10px"></div>
    `);

	load_cart();
};


/* ===================== LOAD CART ===================== */

function load_cart() {

	frappe.call({
		method: 'vgjewellry.vg_purchase_cart.get_vg_purchase_cart',
		callback: function (response) {

			let cart = response.message.cart || {};

			if (Object.keys(cart).length === 0 && cart.constructor === Object) {
				// If the cart is empty, append a "Cart Empty" div
				$("#cart-container").html('<div class="cart-empty"><h3>Your cart is empty.</h3></div>');
				return;
			} 
			let html = "";

			for (let supplier in cart) {

				let supplier_code = cart[supplier]["n"];

				for (let branch in cart[supplier]) {
					if (branch === "n") continue;

					html += `
		    <div class="cart-card whole-cart">
			<div class="cart-card-header">
			    <span>Supplier: <b>${supplier_code}</b></span>
			    <span style="margin-left:20px">Branch: <b>${branch}</b></span>
			</div>

			<div class="cart-card-body">
			    <table class="cart-table">
				<thead>
				    <tr>
					<th>Item</th>
					<th>Variety</th>
					<th>WT Range</th>
					<th>Size</th>
					<th>JOTA</th>
					<th>Qty</th>
					<th>Action</th>
				    </tr>
				</thead>
				<tbody>
		    `;

					let items = cart[supplier][branch];
					let br="";	
					for (let i in items) {
						br = items[i]['branch']    
						html += `
			    <tr>
				<td><input type="hidden" class="req_id" value="`+items[i]['id']+`" >  ${items[i].item || ""}</td>
				<td>${items[i].variety || ""}</td>
				<td>${items[i].weight_range || ""}</td>
				<td>${items[i].size || ""}</td>
				<td>${items[i].jota || ""}</td>
				<td>${items[i].qty_po || ""}</td>
				<td>
				    <button class="btn btn-danger btn-sm remove-from-cart"
					    data-supplier="${supplier}"
					    data-branch="${branch}"
					    data-index="${i}">
					Remove
				    </button>
				</td>
			    </tr>
			`;
					}

					html += `
				</tbody>
			    </table>
			</div>

			<div class="cart-card-footer">
			Delivery Date:
			    <input type="text"
				   class="req-delivery-date"
				   placeholder="dd-mm-yyyy">
			Remark: <textarea class="req-remark" row="1" ></textarea>
			    <button class="btn btn-success btn-sm generate-po"
				    data-supplier="${supplier}"
				    data-branch="${branch}" data-br="${br}">
				Generate PO
			    </button>
			</div>
		    </div>
		    `;
				}
			}

			$("#cart-container").html(html);
			initDeliveryDatePickers();
		}
	});
}


/* ===================== DATE PICKER ===================== */

function initDeliveryDatePickers() {
	$(".req-delivery-date").each(function () {
		if (!this._flatpickr) {
			flatpickr(this, {
				dateFormat: "d-m-Y"
			});
		}
	});
}


/* ===================== REMOVE ITEM ===================== */

$(document).on("click", ".remove-from-cart", function () {

	let supplier = $(this).data("supplier");
	let branch = $(this).data("branch");
	let index = $(this).data("index");
	var row = $(this).closest('tr');
	var id = row.find('.req_id').val();	

	frappe.call({
		method: "vgjewellry.vg_purchase_cart.remove_item_from_cart",
		args: {
			id:id 	

		},
		callback: function () {
			row.remove();
			frappe.msgprint("Item Remove From Cart Successfully!");		
		}
	});
});


/* ===================== GENERATE PO ===================== */

$(document).on("click", ".generate-po", function () {

	let card = $(this).closest(".cart-card");
	let delivery_date = card.find(".req-delivery-date").val();  // Get the delivery date
	let remark = card.find(".req-remark").val();  // Get the remark

	// Check if the delivery date is entered
	if (!delivery_date) {
		frappe.msgprint("Please select delivery date");
		return;
	}

	let supplier = $(this).data("supplier");  // Get the supplier

	var items = [];

	card.find('table.cart-table tbody tr').each(function () {	
		let id = $(this).find('.req_id').val();

		items.push({
			id: id
		});
	});


	let branch = $(this).data("br");	
	var whole_cart=$(this).closest(".whole-cart");	
	items = JSON.stringify(items); 

	frappe.call({
		method: "vgjewellry.vg_purchase_cart.generate_po",
		args: {
			supplier: supplier,
			branch: branch,
			delivery_date: delivery_date,
			remark: remark,
			items: items
		},
		callback: function (res) {
			frappe.msgprint(res.message["po_number"]+" PO Generated Successfully ");
			$(whole_cart).remove();	
		}
	});
});


/* ===================== LOAD FLATPICKR ===================== */

$('<link>')
	.attr('rel', 'stylesheet')
	.attr('href', '/assets/vgjewellry/css/flatpickr.min.css')
	.appendTo('head');

frappe.require([
	"assets/vgjewellry/js/flatpickr.min.js"
]);

