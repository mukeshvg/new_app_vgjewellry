frappe.pages['product-requistion'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Product Requisition',
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

</style>
<h2 style="text-align:center;margin-top:10px">Product Requisition</h2>
	<div style="padding:0 10px">
	<table class="table table-striped table-hover align-middle modern-table" id="item-order-table">
    <thead class="table-dark">
	<tr>
	    <th>Item</th>
	    <th>Variety</th>
	    <th>WT Range</th>
	    <th>Size</th>
	    <th>JOTA</th>
	    <th>Suggested</th>
	    <th>In Stock</th>
	    <th>Excess/ Short</th>
	    <th>Qty Req</th>
	    <th>Qty Given</th>
	    <th>Action</th>
	    <th>Reason</th>
	    <th>Remarks</th>
	    <th>Delivery Date</th>
	    <th>Save</th>
	</tr>
    </thead>

    <tbody id="product-req-table-body">
	<!-- Row Generated Dynamically -->
    </tbody>
</table>
</div>
		`);

	frappe.call({
		method:'vgjewellry.product_requisition.get_product_details',
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
					str+=`
					<tr>
			    <td>
				<input type="hidden" class="req_selected_images" value="" >
				<input type="hidden" class="req_used_ids" value="`+msg[k]['used_ids']+`" >
				<input type="hidden" class="req_branch_id" value="`+msg[k]['branch']+`" >
				<input type="hidden" class="req_item_id" value="`+msg[k]['item_id']+`" >
				<input type="hidden" class="req_variety_id" value="`+msg[k]['variety_id']+`" >
				<input type="hidden" class="req_wt_id" value="`+msg[k]['wt_id']+`" >
				<input type="hidden" class="req_wt_range" value="`+msg[k]['weight_range']+`" >
				<input type="hidden" class="req_size_id" value="`+msg[k]['size_id']+`" >
			    `+msg[k]["item"]+`</td>
			    <td>`+msg[k]["variety"]+`</td>
			    <td>`+msg[k]["weight_range"]+`</td>
			    <td>`+msg[k]["size"]+`</td>
			    <td class="req_jota">`+msg[k]["jota"]+`</td>
			    <td class="req_suggested">`+msg[k]["suggested"]+`</td>
			    <td class="req_in_stock in_stock_img">`+msg[k]["in_stock"]+`</td>
			    <td class="req_in_diff">`+msg[k]["diff"]+`</td>
			    <td class="qty-req user-add-img">`+msg[k]["qty"]+`</td>
			    <td>
				<select class="form-select form-select-sm action-select qty-given">
					<option>1</option>
					<option>2</option>
					<option>3</option>
					<option>4</option>
					<option>5</option>
					<option>6</option>
					<option>7</option>
					<option>8</option>
					<option>9</option>
					<option>10</option>
				</select>
			    </td>
			    <td>
				<select class="form-select form-select-sm action-select status-select">
					<option value="">Select Action</option>
					<option>Approve</option>
					<option>Reject</option>
				</select>
			    </td>
			    <td>
				<select class="form-select form-select-sm reason-select approve-reason mt-1 d-none">
					<option value="">Select Reason</option>
					`+approve_reason_option+`
				</select>
				<select class="form-select form-select-sm reason-select reject-reason mt-1 d-none">
					<option value="">Select Reason</option>
					`+reject_reason_option+`
				</select>
			    </td>
			    <td><textarea class="form-control form-control-sm remarks-box" rows="1"></textarea><br>
				`+msg[k]["remark"]+`<br>By `+msg[k]['remark_user']+`
			    </td>
			    <td><input type="text" class="form-control form-control-sm req-delivery-date "  placeholder="dd-mm-yyyy" ></td>
			    <td><button type="button" class="btn btn-success btn-sm w-100 req-save-order">Save</button></td>
			</tr>`
				}
				$("#product-req-table-body").html(str)
				initDeliveryDatePickers();
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
	$(document).on("change", ".qty-given", function () {
		let row = $(this).closest("tr");
		update_status(row)
	});
	$(document).on("change", ".status-select", function () {
		let row = $(this).closest("tr");
		update_status(row)
	});
	function update_status(row){

		var qtyReq = parseInt(row.find('.qty-req').text())
		var qtyGiven = parseInt(row.find('.qty-given').val());
		var approveReasonSelect = row.find('.approve-reason');
		var rejectReasonSelect = row.find('.reject-reason');
		var status=row.find(".status-select").val();
		if (qtyReq < qtyGiven && status=="Approve") {
			// Show Reason to approve and hide Reason to reject
			approveReasonSelect.removeClass('d-none');
			rejectReasonSelect.addClass('d-none');
		} 
		else if(qtyReq == qtyGiven && status=="Approve"){
			approveReasonSelect.addClass('d-none');
			rejectReasonSelect.addClass('d-none');

		}
		else {
			// Show Reason to reject and hide Reason to approve
			rejectReasonSelect.removeClass('d-none');
			approveReasonSelect.addClass('d-none');
		}
	}
	$(document).on("click", ".in_stock_img", function () {
		var row = $(this).closest('tr');
		var branch_id = parseInt(row.find('.req_branch_id').val());  // Branch
		var item_id = parseInt(row.find('.req_item_id').val());  // Item
		var variety_id = parseInt(row.find('.req_variety_id').val());  // Variety
		var wt_range = row.find('.req_wt_range').val();
		frappe.call({
			method: "vgjewellry.product_requisition_for_po.get_existing_product_image_manager",
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
							html += `<div style="display:inline-block; margin:5px; text-align:center;">
				    <img src="${img_path}" style="max-width:150px; max-height:150px; display:block;" />
				    <div>Label: ${img_obj.LabelNo}</div>
				    <div>Wt: ${img_obj.NetWt}</div>
				 </div>`;
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
					d.show();
				} else {
					frappe.msgprint("No images found.");
				}
			}

		});
	});
	$(document).on("click", ".user-add-img", function () {
		var row = $(this).closest('tr');
		var used_id = row.find('.req_used_ids').val()
		frappe.call({
			method: "vgjewellry.product_requisition.get_item_image",
			type: "POST",
			args: {
				used_id: used_id,
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
	<input type="checkbox" class="image-checkbox" data-img="${img_path}">
	<img src="${img_path}" class="image-thumb" data-full="${img_path}">
    </div>`;
						// if already full URL, use as is
					});
					function getSelectedImages(d) {
						return d.$wrapper.find('.image-checkbox:checked')
							.map(function () {
								return $(this).data('img');
							})
							.get();
					}

					let d = new frappe.ui.Dialog({
						title: 'Select Product Images For Forwarding To Purchase Department ',
						size: 'large',
						fields: [
							{ fieldname: 'images_html', fieldtype: 'HTML', options: html }
						],
						primary_action_label: 'Forward Selected Images',
						primary_action() {
							let selected = getSelectedImages(d);
							row.find('.req_selected_images').val(selected)

							if (!selected.length) {
								frappe.msgprint("Please select at least one image");
								return;
							}

							// TODO: frappe.call to forward selected images
							frappe.msgprint(`Selected Images:<br>${selected.join("<br>")}`);
						}
					});
					d.show();
					// Bind events AFTER dialog renders
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
	// Event listener for Save button click
	$(document).on('click', '.req-save-order', function () {
		// Find the closest row (tr) for the clicked Save button
		var row = $(this).closest('tr');

		// Get the values from the row
		var used_ids = row.find('.req_used_ids').val();  // Branch
		var branch_id = parseInt(row.find('.req_branch_id').val());  // Branch
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
		var selected_images=row.find('.req_selected_images').val();
		if(selected_images == ""){
			alert("Product Images For Forwarding To Purchase Department")
			return;
		}
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


		// You can now send the data to a server using AJAX, or perform any other operation with the data
		// Example: Saving the data to the server using AJAX

		frappe.call({
			method: "vgjewellry.product_requisition.save_product_details",
			type: "POST",
			args: {
				used_ids: used_ids,
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
				delivery_date: deliveryDate,
				selected_images: selected_images
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
		$(this).text('Saved');
	});

}
