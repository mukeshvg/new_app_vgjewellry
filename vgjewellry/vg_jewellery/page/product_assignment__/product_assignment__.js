frappe.pages['product-assignment--'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Product Assignment  PD',
		single_column: true
	});
	$(wrapper).html(`
	<style>
	.image-thumb-wrapper { display:inline-block; margin:10px; position:relative; }
.image-thumb { max-width:150px; max-height:150px; cursor:zoom-in; border-radius:6px; border:2px solid transparent; }
.image-thumb.selected { border-color:#2490ef; }
.image-checkbox { position:absolute; top:6px; left:6px; z-index:2; }

.image-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.85);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}
.image-overlay img {
    max-width: 90%;
    max-height: 90%;
    transition: transform 0.15s ease;
}
.image-overlay .close {
    position:absolute;
    top:20px;
    right:30px;
    font-size:32px;
    color:#fff;
    cursor:pointer;
    z-index:999;
}

	/* Whole table look */
.modern-table {
    background: #121212;
    border-collapse: separate;
    border-spacing: 0 8px !important;
}

/* Header */
.modern-table thead th {
    background: #1e1e1e !important;
    color: #e0e0e0;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    padding: 10px 6px;
    border: none !important;
}

/* Body rows */
.modern-table tbody tr {
    background: #1b1b1b;
    border-radius: 10px;
    overflow: hidden;
}

.modern-table tbody tr:hover {
    background: #242424;
    transition: 0.2s;
}

/* Table cells */
.modern-table td {
    padding: 10px 8px !important;
    color: #dcdcdc;
    border-top: 1px solid #2a2a2a !important;
}

/* First & last column rounding */
.modern-table tbody tr td:first-child {
    border-radius: 8px 0 0 8px;
}

.modern-table tbody tr td:last-child {
    border-radius: 0 8px 8px 0;
}

/* Small Form Elements */
.modern-table select,
.modern-table input,
.modern-table textarea {
    background: #262626;
    border: 1px solid #3a3a3a;
    color: #e8e8e8;
    padding: 4px 6px !important;
    border-radius: 6px;
    font-size: 13px;
}

/* Select dropdowns same height */
.modern-table select {
    height: 30px;
}

/* Date picker smaller */
.modern-table input[type=date] {
    height: 30px;
}

/* Textarea */
.modern-table textarea {
    height: 35px;
    resize: none;
}

/* Save button */
.save-btn {
    background: #0dbf58;
    color: black;
    border: none;
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 6px;
    transition: 0.2s;
}

.save-btn:hover {
    background: #13d367;
}
/* Style for the container holding the cards */
.cards-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* Responsive cards */
    gap: 20px;
    padding: 20px;
}

/* Card styling */
.card {
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease;
}

.card:hover {
    transform: scale(1.05);  /* Slight zoom effect on hover */
}

/* Card content layout: flexbox with image on the left */
.card-content {
    display: flex;
    flex-direction: row;
}

/* Image on the left side */
.card-image {
    flex: 1;
    margin-right: 20px;
}

.card-image img {
    max-width: 100%;
    height: auto;
    border-radius: 10px;
}

/* Info section: flex container for 3x3 grid */
.card-info {
    flex: 2;
    display: flex;
    flex-direction: column;
}

/* Row layout for each section */
.card-row {
    display: grid;
    grid-template-columns: repeat(3, 1fr);  /* 3 columns */
    gap: 10px;
    margin-bottom: 20px;
}

/* Style for card rows */
.card-row p {
    margin: 5px 0;
    font-size: 0.95em;
    color: #555;
}

/* Optional: Card hover effect */
.card:hover {
    transform: scale(1.05);
}

</style>
<h2 style="text-align:center;margin-top:10px"> <a href="./product-requisition-for-po" class="btn btn-sm pull-left">Go Requisition</a> Product Assignment<a href="./vg-purchase-cart" class="btn btn-sm pull-right">Go Cart</a></h2>
	<div style="padding:0 10px">
	<table class="table table-striped table-hover align-middle modern-table" id="item-order-table">
    <thead class="table-dark">
	<tr>
	    <th>Desc</th>
	    <!--<th>Item</th>
	    <th>Variety</th>
	    <th>WT Range</th>
	    <th>Size</th>
	    <th>JOTA</th>-->
	    <th>Suggested</th>
	    <th>Qty Given</th>
	    <th>Reason</th>
	    <th>Remarks</th>
	    <th>Action</th>
	</tr>
    </thead>

    <tbody id="product-req-table-body">
	<!-- Row Generated Dynamically -->
    </tbody>
</table>
</div>
		`);

	frappe.call({
		method:'vgjewellry.product_requisition_for_po.get_product_details_for_assignment',
		callback: function(response) {
			if(response && response.message.all_item.length>0){
				approve_reason=response.message.excess_reason
				approve_reason_option="";
				for(var j in approve_reason){
					approve_reason_option+=`<option>`+approve_reason[j]['name']+`</option>`
				}
				reject_reason=response.message.reject_reason
				reject_reason_option="";
				for(var j in reject_reason){
					reject_reason_option+=`<option>`+reject_reason[j]['name']+`</option>`
				}
				msg=response.message.all_item
				var str=""

				for(var k in msg){
					var suggeted_table=""
					var ideal=msg[k]['ideal']
					for (var n in ideal){
						suggeted_table+=`<tr>
							<td>`+ideal[n]["b"]+`</td>
							<td>`+ideal[n]["s"]+`</td>
							<td><button class="in_stock_img" data-id="`+msg[k]['id']+`">`+ideal[n]["i"]+`</button></td>
							<td>`+ideal[n]["d"]+`</td>
							</tr>`;	
					}
					str+=`
					<tr>
				<td class="req_branch">Branch:`+msg[k]['branch_name']+`	
			    <br>
				<input type="hidden" class="req_id" value="`+msg[k]['id']+`" >
				<input type="hidden" class="req_branch_id" value="`+msg[k]['branch']+`" >
				<input type="hidden" class="req_item_id" value="`+msg[k]['item_id']+`" >
				<input type="hidden" class="req_variety_id" value="`+msg[k]['variety_id']+`" >
				<input type="hidden" class="req_wt_id" value="`+msg[k]['wt_id']+`" >
				<input type="hidden" class="req_wt_range" value="`+msg[k]['weight_range']+`" >
				<input type="hidden" class="req_size_id" value="`+msg[k]['size_id']+`" >
			    Item:<b>`+msg[k]["item"]+`</b><br>
			    Variety:<b>`+msg[k]["variety"]+`</b><br>
			    Wt-rng:<b>`+msg[k]["weight_range"]+`</b><br>
			    Size:<b>`+msg[k]["size"]+`</b><br>
			    Jota:<b>`+msg[k]["jota"]+`</b><br>
			    ID:<b>`+msg[k]["id"]+`</b><br>
			    </td>
			    <td><table>
				<tr>
					<td>Branch</td>
					<td>Suggested</td>
					<td>InStock</td>
					<td>Diff</td>
				</tr>`+suggeted_table+`
			    </table></td>
			    <td class="qty-req">
				Approved Qty: <b><button type="button" class="btn btn-sm user-add-img " data-id="`+msg[k]['id']+`"  >`+msg[k]['qty_po']+`</button></b><br><br>
				Branch Transfer :<b><button type="button" class="btn btn-sm show-branch-transfer" data-req_id="`+msg[k]['id']+`" data-qty="`+msg[k]['qty_bt']+`">`+msg[k]['qty_bt']+`</button></b><br><br>
				Cart Qty: <b>`+msg[k]['qty_cart']+`</b><br><br>
			    </td>
			    <td>
				PD Reason :<b>`+msg[k]['pdr']+`</b>
				<br><br><br>Manager Reason:<br><b>`+msg[k]['mar']+""+msg[k]['mrr']+`</b>
			    </td>
			    <td>
				PD Remark:<br><b>`+msg[k]['pr']+`</b>
				<br><br>Manager Remark:<br><b>`+msg[k]['mr']+`</b>
			    </td>
			    <td>
				Supplier<br> <div class="supplier-link" data-row="${k}"></div><br><br>
			    <button type="button" class="btn btn-success btn-sm w-100 req-save-order">Add To Cart</button></td>
			</tr>`
				}
				$("#product-req-table-body").html(str)
				initDeliveryDatePickers();

				$(".supplier-link").each(function () {
					let row_index = $(this).data("row");

					let supplier = frappe.ui.form.make_control({
						parent: this,
						df: {
							fieldtype: "Link",
							options: "Ornate_Supplier_Master",
							fieldname: "supplier_" + row_index,
							placeholder: "Select Supplier"
						},
						render_input: true
					});

					supplier.refresh();
				});
			}
		}
	})


	$('<link>')
		.attr('rel', 'stylesheet')
		.attr('href', '/assets/vgjewellry/css/flatpickr.min.css')
		.appendTo('head');
	frappe.require([
		"assets/vgjewellry/js/flatpickr.min.js"
	], function() {
		// Initialize all date pickers
		flatpickr(".req-delivery-date", {
			dateFormat: "d-m-Y"
		});
	});
	function initDeliveryDatePickers() {
		$(".req-delivery-date").each(function() {
			// Only initialize if not already initialized
			if (!this._flatpickr) {
				flatpickr(this, { dateFormat: "d-m-Y" });
			}
		});
	}

	$(document).on("click", ".user-add-img", function () {
		var id = $(this).data('id');
		frappe.call({
			method: "vgjewellry.product_requisition_for_po.get_item_image_for_pd",
			type: "POST",
			args: {
				req_id: id,
			},callback: function (r) {
				if (r.message && Object.keys(r.message).length > 0) {
					let html = `
					<div id="image-overlay-dialog" class="image-overlay">
    <span class="close" onclick="closeImage()">✖</span>
     <img id="overlay-img-dialog">
</div>`;


					r.message.forEach(img_obj => {
						let img_path = img_obj.replace(/\\/g, '/');
						html += `
    <div class="image-thumb-wrapper">
	<!--<input type="checkbox" class="image-checkbox" data-img="${img_path}">-->
	<img src="${img_path}" class="image-thumb" data-full="${img_path}">
    </div>`;
						// if already full URL, use as is
					});function getSelectedImages(d) {
						return d.$wrapper.find('.image-checkbox:checked')
							.map(function () {
								return $(this).data('img');
							})
							.get();
					}
					let d = new frappe.ui.Dialog({
						title: 'Product Images For Forwarding To Supplier ',
						size: 'large',
						fields: [
							{ fieldname: 'images_html', fieldtype: 'HTML', options: html }
						],
						//primary_action_label: 'Remove Selected Images',
						/*primary_action() {
							let selected = getSelectedImages(d);
							row.find('.req_selected_images').val(selected)

							if (!selected.length) {
								frappe.msgprint("Please select at least one image");
								return;
							}

							// TODO: frappe.call to forward selected images
							frappe.msgprint(`Selected Images:<br>${selected.join("<br>")}`);
						}*/
					});
					d.show();
					d.$wrapper.on('click', '.image-thumb', function () {
						const src = $(this).data('full');
						const overlay = d.$wrapper.find('#image-overlay-dialog');
						const img = d.$wrapper.find('#overlay-img-dialog');

						zoomLevel = 1;
						img.css('transform', 'scale(1)');
						img.attr('src', src);
						overlay.show();

						img.off('wheel').on('wheel', function (e) {
							e.preventDefault();
							zoomLevel += e.originalEvent.deltaY < 0 ? 0.1 : -0.1;
							zoomLevel = Math.min(Math.max(zoomLevel, 0.5), 4);
							img.css('transform', `scale(${zoomLevel})`);
						});
					});
					// Close overlay
					d.$wrapper.on('click', '.image-overlay .close', function () {
						d.$wrapper.find('#image-overlay-dialog').hide();
					});
					d.$wrapper.on('change', '.image-checkbox', function () {
						$(this).siblings('.image-thumb').toggleClass('selected', this.checked);
					});
				} else {
					frappe.msgprint("No images found.");
				}
			}
		});
	});


	$(document).on("click", ".in_stock_img", function () {
		var id = $(this).closest('tr').closest('table').closest('td').closest('tr').find('.req_id').val();
		var branch_id = $(this).closest('tr').closest('table').closest('td').closest('tr').find('.req_branch_id').val();
		var item_id = $(this).closest('tr').closest('table').closest('td').closest('tr').find('.req_item_id').val();
		var variety_id = $(this).closest('tr').closest('table').closest('td').closest('tr').find('.req_variety_id').val();
		var wt_range = $(this).closest('tr').closest('table').closest('td').closest('tr').find('.req_wt_range').val();
		frappe.call({
			method: "vgjewellry.product_requisition_for_po.get_existing_product_image",
			type: "POST",
			args: {
				branch_id: branch_id,
				item_id: item_id,
				variety_id: variety_id,
				wt_range: wt_range,
			},callback: function (r) {
				if (r.message && Object.keys(r.message).length > 0) {
					let html = '';
					let branches = Object.keys(r.message);

					// Move clicked branch to first
					branches.sort((a,b) => {
						if (a == branch_id) return -1;
						if (b == branch_id) return 1;
						return a - b; // sort remaining numerically
					});

					let branch_code={};			 
					branches.forEach(branch => {
						r.message[branch].forEach(img_obj => {
							branch_code[branch]=img_obj["BranchCode"]
						})
					})			 

					branches.forEach(branch => {
						html += `<h4>Branch: ${branch_code[branch]}</h4><div style="margin-bottom:15px;">`;

						r.message[branch].forEach(img_obj => {
							let img_path = img_obj.ImagePath1.replace(/\\/g, '/');
							// if already full URL, use as is
							html += `<div style="display:inline-block; margin:5px; text-align:center;    margin-left: auto;
    margin-right: auto; border: 1px solid #ccc; padding: 10px;">
				    <img src="${img_path}" style="max-width:150px; max-height:150px; display:block;" />
				    <div>Label: ${img_obj.LabelNo}</div>
				    <div>Wt: ${img_obj.NetWt}</div>
				    `;
							if(branch !=branch_id){
								html+=`<input type="checkbox" class="image_checkbox" data-branch="${branch}"  data-img-id="${img_obj.LabelNo}" data-requested="${branch_id}" data-id="${id}" />`
							}	

							html+=`</div>`;
						});

						html += '</div><hr>';
					});

					let d = new frappe.ui.Dialog({
						title: 'Product Images by Branch',
						size: 'large',
						fields: [
							{ fieldname: 'images_html', fieldtype: 'HTML', options: html }
						]
					});

					d.set_primary_action('Branch Transfer', function() {
						let selectedImages = [];

						// Collect selected images based on checkbox
						$('.image_checkbox:checked').each(function() {
							var obj={label_no:$(this).data('img-id'),"branch":$(this).data('branch'),"requested":$(this).data("requested"),id:$(this).data('id')}
							selectedImages.push(obj);
						});

						if (selectedImages.length > 0) {
							// Send data to backend via AJAX or frappe call
							frappe.call({
								method: "vgjewellry.product_requisition_for_po.transfer_images_to_branch",
								type: "POST",
								args: {
									selected_image_ids: JSON.stringify(selectedImages),
								},
								callback: function(r) {
									if (r.message) {
										frappe.msgprint("Branch transfer successful!");
									} else {
										frappe.msgprint("Error in transferring images.");
									}
								}
							});
						} else {
							frappe.msgprint("Please select at least one image.");
						}
					});

					// Set button class to success (This will apply success styling to the button)
					$(d.$wrapper).find('.btn-primary').addClass('btn-success');
					d.show();
				} else {
					frappe.msgprint("No images found.");
				}
			}

		});
	});

	// Event listener for Save button click
	$(document).on('click', '.req-save-order', function () {
		// Find the closest row (tr) for the clicked Save button
		var row = $(this).closest('tr');
		let supplier = row.find(".supplier-link input").val();

		if (!supplier) {
			frappe.msgprint("Please select a supplier.");
			return;
		}
		let supplier_pk = row.find(".supplier-link .control-value a").data("name");


		// Get the values from the row
		//var used_ids = row.find('.req_used_ids').val();  // Branch
		var id = row.find('.req_id').val();  // Branch
		/*var branch_id = parseInt(row.find('.req_branch_id').val());  // Branch
		var item_id = parseInt(row.find('.req_item_id').val());  // Item
		var variety_id = parseInt(row.find('.req_variety_id').val());  // Variety
		var wt_id = parseInt(row.find('.req_wt_id').val());  // Weight Range
		var size_id = parseInt(row.find('.req_size_id').val());  // Size
		var jota = parseInt(row.find('.req_jota').text());  // Jota
		var suggested = parseInt(row.find('.req_suggested').text());  // Suggested
		var in_stock = parseInt(row.find('.req_in_stock').text());  // In Stock
		var diff = parseInt(row.find('.req_in_diff').text());  // Diff
		var qtyReq = parseInt(row.find('.qty-req').text());  // Quantity Requested
		var qtyGiven = parseInt(row.find('.qty-given').val());  // Quantity Given
		var status = row.find('.status-select').val();  // Status (Approve/Reject)
		var approveReason = row.find('.approve-reason').val();  // Reason for approval
		var rejectReason = row.find('.reject-reason').val();  // Reason for rejection
		var remarks = row.find('.remarks-box').val();  // Remarks
		var deliveryDate = row.find('.req-delivery-date').val();  // Delivery Date
		if(status==""){
			alert("Please Select Action.");
			return;
		}
		if (qtyReq < qtyGiven && status=="Approve" && approveReason === "") {
			alert("Please select a reason for the action.");
			return;
		}
		console.log(rejectReason);
		if((qtyReq > qtyGiven && status=="Approve" && rejectReason ==="")|| (status=="Reject" && rejectReason ==="")){

			alert("Please select a reason for the action.");
			return;
		}


		if (deliveryDate === "" && status=="Approve") {
			alert("Please select a delivery date.");
			return; 
		}
		*/

		used_ids=""
		frappe.call({
			method: "vgjewellry.product_requisition_for_po.save_supplier",
			type: "POST",
			args: {
				id: id,
				supplier:supplier_pk
				/*used_ids: used_ids,
				branch_id: branch_id,
				item_id: item_id,
				variety_id: variety_id,
				wt_id: wt_id,
				size_id: size_id,
				jota: jota,
				suggested:suggested,
				in_stock:in_stock,
				diff:diff,    
				qty_req: qtyReq,
				qty_given: qtyGiven,
				status: status,
				approve_reason: approveReason,
				reject_reason: rejectReason,
				remarks: remarks,
				delivery_date: deliveryDate*/

			},
			callback: function (r) {
				if (!r.exc) {
					row.remove();
					frappe.msgprint("Saved Successfully!");
				}
			}
		});



		// Optional: Disable the Save button after saving or change its text
		$(this).prop('disabled', true);
		$(this).text('Added To Cart');
	});
	$(document).on('click', '.show-branch-transfer', function () {
		var html="";
		var id=$(this).data('req_id');
		var qty=$(this).data('qty');
		if(qty == 0){
			frappe.msgprint("No Item From Branch Transfer.");
			return;
		}
		frappe.call({
			method: "vgjewellry.branch_transfer.show_branch_transfer",
			type: "POST",
			args: {
				req_id: id},
			callback: function (r) {
				var bt=r.message
				for (let item in bt) {
					var items=bt[item];
					html+=`<div class="card"><div class="card-content">`;
					html+=`<div class="card-image"><img style="width:90%;max-height:200px;object-fit:contain" src='${items['im']}' alt="Item Image" /> </div>`;
					html+=`<div class="card-info">
		<div class="card-row">
		    <p><strong>Date of Request:</strong><br> ${items.c}</p>
		    <p><strong>Transfer From:</strong><br>${items['rec_b']}</p>
		    <p><strong>Transfer To:</strong><br>${items['req_b']}</p>
		</div>
		<div class="card-row">
		    <p><strong>Item:</strong><br>${items['i']}</p>
		    <p><strong>Variety:</strong><br>${items['v']}</p>
		    <p><strong>Weight Range:</strong><br>${items['w']}</p>
		</div>
		<div class="card-row">
		    <p><strong>Label No:</strong><br>${items['ln']}</p>
		    <p><strong>Manager Status:</strong><br>${items['s']}</p>
		</div>
		<div class="card-row">
		    <p><strong>Request ID:</strong> <br>${items.id}</p>
		    <p><strong>Product Send On:</strong><br>${items['ps']}</p>
		</div>
	    </div>
	    </div>
	    </div>
	</div>`;

				}
				//	html+=`</div></div>`

				let d = new frappe.ui.Dialog({
					title: 'Branch Transfer Request',
					size: 'large',
					fields: [
						{ fieldname: 'images_html', fieldtype: 'HTML', options: html }
					]
				});
				d.show()
			}
		});
	});
}
