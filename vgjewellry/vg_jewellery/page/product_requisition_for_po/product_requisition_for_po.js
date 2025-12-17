frappe.pages['product-requisition-for-po'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Product Requisition For Purchase',
		single_column: true
	});
	$(wrapper).html(`
	<style>
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
<h2 style="text-align:center;margin-top:10px">Product Requisition <a href="./product-assignment--" class="btn btn-sm pull-right">Go Product Assignment</a></h2>
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
		method:'vgjewellry.product_requisition_for_po.get_product_details',
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
							<td><button class="in_stock_img">`+ideal[n]["i"]+`</button></td>
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
			    Jota:<b>`+msg[k]["jota"]+`</b></td>
			    <td><table>
				<tr>
					<td>Branch</td>
					<td>Suggested</td>
					<td>InStock</td>
					<td>Diff</td>
				</tr>`+suggeted_table+`
			    </table></td>
			    <td class="qty-req"><strike>`+msg[k]["qty"]+`</strike>
				<br><b>`+msg[k]['qty_manager']+`</b>
			    </td>
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
				<br><br><br>Manager Action:<br><b>`+msg[k]['ms']+`</b>
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
				<br><br><br>Manager Reason:<br><b>`+msg[k]['mar']+""+msg[k]['mrr']+`</b>
			    </td>
			    <td><textarea class="form-control form-control-sm remarks-box" rows="1"></textarea>
				<br><br>Manager Remark:<br><b>`+msg[k]['mr']+`</b>
			    </td>
			    <td><input type="text" class="form-control form-control-sm req-delivery-date "  placeholder="dd-mm-yyyy" >
			    <br><br>Manager Delivery Date:<br><b>`+msg[k]['mdd']+`</b></td>
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

	$(document).on("click", ".in_stock_img", function () {
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
	// Event listener for Save button click
	$(document).on('click', '.req-save-order', function () {
		// Find the closest row (tr) for the clicked Save button
		var row = $(this).closest('tr');

		// Get the values from the row
		//var used_ids = row.find('.req_used_ids').val();  // Branch
		var id = row.find('.req_id').val();  // Branch
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
		if(status==""){
			alert("Please Select Action.");
			return;
		}
		if (qtyReq < qtyGiven && status=="Approve" && approveReason === "") {
			alert("Please select a reason for the action.");
			return;
		}
		if((qtyReq > qtyGiven && status=="Approve" && rejectReason ==="")|| (status=="Reject" && rejectReason ==="")){

			alert("Please select a reason for the action.");
			return;
		}


		if (deliveryDate === "" && status=="Approve") {
			alert("Please select a delivery date.");
			return; 
		}


		used_ids=""
		frappe.call({
			method: "vgjewellry.product_requisition_for_po.save_product_details",
			type: "POST",
			args: {
				id: id,
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
				delivery_date: deliveryDate
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
