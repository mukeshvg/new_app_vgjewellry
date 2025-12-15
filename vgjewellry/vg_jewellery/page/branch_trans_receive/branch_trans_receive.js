frappe.pages['branch-trans-receive'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Branch Transfer Receive',
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
    .branch_transfer_img{
	height:50px;
    }

 .cart-card select{
    background: #262626;
    border: 1px solid #3a3a3a;
    color: #e8e8e8;
    padding: 4px 6px !important;
    border-radius: 6px;
    font-size: 13px;
}

/* Select dropdowns same height */
.cart-card select {
    height: 30px;
}

    </style>
<h2 style="text-align:center">Branch Transfer Request</h2>

    <div id="cart-container" style="padding:0 10px"></div>
    `);

	load_data();
}	
function load_data(){
	frappe.call({
		method:'vgjewellry.branch_transfer.get_all_branch_transfer_receive',
		callback: function(response) {
			console.log(response);
			let bt = response.message ||[];

			if (bt.length === 0) {
				// If the cart is empty, append a "Cart Empty" div
				$("#cart-container").html('<div class="cart-empty"><h3>Your Branch Transfer Receive is empty.</h3></div>');
				return;
			} 
			let html = "";



			html += `
		    <div class="cart-card ">

			<div class="cart-card-body">
			    <table class="cart-table">
				<thead>
				    <tr>
					<th>Date Of Request</th>
					<th>Transfer From</th>
					<th>Transfer To</th>
					<th>Item</th>
					<th>Variety</th>
					<th>WT Range</th>
					<th>Label No</th>
					<th>Image</th>
					<th>Product Send On</th>
					<th>Is Product Receive</th>
				    </tr>
				</thead>
				<tbody>
		    `;

			for (let item in bt) {
				var items=bt[item];
				var sel=item["status"]=="Accept"?"selected":"";
				html += `
			    <tr>
				<td> ${items['c'] || ""}</td>
				<td> ${items['rec_b'] || ""}</td>
				<td><input type="hidden" class="req_id" value="${items['rid']}" >  ${items['req_b'] || ""}</td>
				<td>${items['i']|| ""}</td>
				<td>${items['v']|| ""}</td>
				<td>${items['w'] || ""}</td>
				<td>${items['ln'] || ""}</td>

				<td><img class="branch_transfer_img" src="${items['im']}"></td>
				<td>${items['ps'] || ""}</td>
				<td>
				<select class="form-select form-select-sm is-product-receive" data-rid="${items['rid']}" data-tid="${items['tid']}">
					<option value="">Select </option>
					<option value="Product Receive">Yes</option>
				</select>
				</td>
			    </tr>
			`;
			}

			html += `
				</tbody>
			    </table>
			</div>

		    </div>
		    `;


			$("#cart-container").html(html);
		}
	})
	$(document).on("change", ".is-product-receive", function () {
		const status = $(this).val();
		if (!status) return;

		const row = $(this).closest("tr");
		const req_id = row.find(".req_id").val();
		var rid=$(this).data('rid');		
		var tid=$(this).data('tid');
		console.log(rid)

		frappe.confirm(
			`Are you sure you want to set status to <b>${status}</b>?`,
			() => {
				update_branch_transfer_is_product_receive(rid,tid, status);
			},
			() => {
				$(this).val(""); // reset on cancel
			}
		);
	});
	function update_branch_transfer_is_product_receive(req_id,tid, status) {
		frappe.call({
			method: "vgjewellry.branch_transfer.is_product_receive",
			args: {
				req_id: req_id,
				tid:tid,	
				status: status
			},
			freeze: true,
			callback: function (r) {
				if (!r.exc) {
					frappe.msgprint("Status updated successfully");
				}
			}
		});
	}

}
