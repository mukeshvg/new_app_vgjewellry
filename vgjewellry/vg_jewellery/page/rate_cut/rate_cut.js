frappe.pages['rate-cut'].on_page_load = function(wrapper) {

	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Rate Cut',
		single_column: true
	});


	let apiData = {};
	let options = [];
	let addedRows = [];
	let savedSelected = [];

	$(page.body).html(`

	<style>

	    .rate-cut-table {
		width: 100%;
		table-layout: fixed;
	    }

	    .rate-cut-table th,
	    .rate-cut-table td {
		width: 150px;
		text-align: center;
		vertical-align: middle;
		word-wrap: break-word;
	    }

	    .vendor-link {
		color: #1f6feb;
		cursor: pointer;
		font-weight: 600;
	    }

	    .vendor-link:hover {
		text-decoration: underline;
	    }

	</style>

	<div class="row mb-4">

	    <div class="col-md-4">
		<div id="vendor-autocomplete"></div>
	    </div>

	    <div class="col-md-2">
		<label class="control-label">
		    Fine Wt (Ketan Sir)
		</label>

		<input type="number"
		       step="0.001"
		       id="fine_wt_input"
		       class="form-control"
		       placeholder="Enter Fine Wt">
	    </div>

	    <div class="col-md-2" style="margin-top: 24px;">
		<button class="btn btn-primary"
			id="add-row-btn">
		    Add
		</button>
	    </div>
	    <div class="col-md-4" style="margin-top:24px">
	    <span id="arihant-rate-display"
	  style="
	    margin-left:20px;
	    font-weight:bold;
	    color:#198754;
	    font-size:16px;
	  ">
	Rate: -
    </span>

    <button class="btn btn-warning ml-2"
	    id="arihant-rate-btn">
	Arihant Rate
    </button>
	    </div>

	</div>

	<div id="vendor-table"></div>
    `);

	function load_summary_table() {

		frappe.call({
			method: "frappe.client.get_list",
			args: {
				doctype: "Rate Cut Summary",
				filters: { is_submitted: 0 },
				fields: [
					"name",
					"ratecut_date",
					"vendor",
					"acc_mst_id",
					"fine_wt",
					"fine_wt_selected",
					"net_wt",
					"oc",
					"hm",
					"rate_999_with_gst",
					"rate_999_without_gst",
					"bill_value_without_gst",
					"bill_value_with_gst",
					"bill_amt",
					"diff"
				]
			},
			callback: function (r) {

				addedRows = (r.message || []).map(d => ({
					name: d.name,
					ratecut_date:d.ratecut_date,
					vendor: d.vendor,
					accMstId: d.acc_mst_id,
					ketanFineWt: d.fine_wt,
					selectedFineWt: d.fine_wt_selected,
					netWt: d.net_wt,
					oc: d.oc,
					hm: d.hm,
					rate999WGst:d.rate_999_with_gst,
					rate999WithoutGst:d.rate_999_without_gst,
					billWithoutGst:d.bill_value_without_gst,
					withGstValue:d.bill_value_with_gst,
					billAmt:d.bill_amt,
					diff:d.diff


				}));

				render_table();
			}
		});
	}
	function render_table() {

		let totalKetanFineWt = 0;
		let totalSelectedFineWt = 0;
		let totalNetWt = 0;
		let totalOC = 0;
		let totalHM = 0;

		let html = `

		    <table class="table table-bordered table-striped rate-cut-table">

			<thead>
			    <tr>
				<th>Ratecut Date</th>
				<th>Vendor</th>
				<th>Fine Wt (Ketan Sir)</th>
				<th>Fine Wt Selected</th>
				<th>Net Wt</th>
				<th>HM</th>
				<th>OC</th>
				<th>RATE 999 With GST</th>
				<th>RATE 999 Without GST</th>
				<th>BILL VALUE WITHOUT GST</th>
				<th>WITH GST VALUE</th>
				<th>BILL AMT</th>
				<th>Diff</th>
				<th>Save</th>
				<th>Remove</th>
			    </tr>
			</thead>

			<tbody>
		`;

		addedRows.forEach((row, index) => {

			totalKetanFineWt +=
				parseFloat(row.ketanFineWt || 0);

			totalSelectedFineWt +=
				parseFloat(row.selectedFineWt || 0);

			totalNetWt +=
				parseFloat(row.netWt || 0);

			totalOC +=
				parseFloat(row.oc || 0);
			totalHM +=
				parseFloat(row.hm || 0);

			html += `
			<tr>
				<td>${row.ratecut_date
        ? moment(row.ratecut_date).format("DD-MM-YYYY")
        : ''}</td>

			    <td>
				<span class="vendor-link"
				      data-index="${index}">
				    ${row.vendor}
				</span>
			    </td>

			    <td>${row.ketanFineWt}</td>

			    <td>
				${row.selectedFineWt.toFixed(3)}
			    </td>

			    <td>
				${row.netWt.toFixed(3)}
			    </td>

			    <td>${row.hm}</td>

			    <td>
				${row.oc.toFixed(2)}
			    </td>

			    <td><input type="number"
	   class="form-control rate999wgst-input"
	   data-index="${index}"
	   value="${row.rate999WGst || ''}"
	   step="0.01"></td>

			    <td> <input type="number" readonly
	   class="form-control rate999wogst-input"
	   data-index="${index}"
	   value="${row.rate999WithoutGst || ''}"
	   step="0.01"></td>

			    <td><input type="number" readonly
	   class="form-control billwithoutgst-input"
	   data-index="${index}"
	   value="${row.billWithoutGst || ''}"
	   step="0.01"></td>

			    <td><input type="number" readonly
	   class="form-control withgstvalue-input"
	   data-index="${index}"
	   value="${row.withGstValue || ''}"
	   step="0.01"></td>

			    <td><input type="number"
	   class="form-control billamt-input"
	   data-index="${index}"
	   value="${row.billAmt || ''}"
	   step="0.01"></td>

			    <td class="diff-cell"> ${(row.diff || 0).toFixed(2)}</td>
<td>
    <button
	class="btn btn-success btn-sm save-row-btn"
	data-index="${index}">
	Save
    </button>
</td>

<td>
    <button
	class="btn btn-danger btn-sm remove-row-btn"
	data-index="${index}">
	Remove
    </button>
</td>
			</tr>
		    `;
		});

		// Total Row
		html += `
		    <tr style="
			font-weight:bold;
			background:#ffff00;
		    ">
			<td></td>
			<td>TOTAL</td>

			<td>
			    ${totalKetanFineWt.toFixed(3)}
			</td>

			<td>
			    ${totalSelectedFineWt.toFixed(3)}
			</td>

			<td>
			    ${totalNetWt.toFixed(3)}
			</td>

			<td></td>

			<td>
			    ${totalOC.toFixed(2)}
			</td>

			<td></td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>
			<td></td>

		    </tr>
		`;

		html += `
			</tbody>
		    </table>
		`;

		$('#vendor-table').html(html);
		$('#vendor-table .rate999wgst-input').on('change', function () {
			let idx = $(this).data('index');

			let gstRate = parseFloat($(this).val()) || 0;

			addedRows[idx].rate999WGst = gstRate;

			// 999 W GST / 103%
			let withoutGst = gstRate / 1.03;

			addedRows[idx].rate999WithoutGst = withoutGst;

			// Update UI
			$(`.rate999wogst-input[data-index="${idx}"]`)
				.val(withoutGst.toFixed(2));
			// Calculate Bill Value Without GST
			let selectedFineWt =
				parseFloat(addedRows[idx].selectedFineWt) || 0;

			let hm =
				parseFloat(addedRows[idx].hm) || 0;

			let oc =
				parseFloat(addedRows[idx].oc) || 0;

			let billWithoutGst =
				((withoutGst / 10) * selectedFineWt)
				+ hm
				+ oc;

			addedRows[idx].billWithoutGst = billWithoutGst;

			// Update UI
			$(`.billwithoutgst-input[data-index="${idx}"]`)
				.val(billWithoutGst.toFixed(2));
			let withGstValue = billWithoutGst * 1.03;

			addedRows[idx].withGstValue = withGstValue;

			$(`.withgstvalue-input[data-index="${idx}"]`)
				.val(withGstValue.toFixed(2));
		});

		/*$('#vendor-table .rate999wogst-input').on('change', function () {
			let idx = $(this).data('index');
			addedRows[idx].rate999WithoutGst = parseFloat($(this).val()) || 0;
		});

		$('#vendor-table .billwithoutgst-input').on('change', function () {
			let idx = $(this).data('index');
			addedRows[idx].billWithoutGst = parseFloat($(this).val()) || 0;
		});

		$('#vendor-table .withgstvalue-input').on('change', function () {
			let idx = $(this).data('index');
			addedRows[idx].withGstValue = parseFloat($(this).val()) || 0;
		});*/

		$('#vendor-table .billamt-input').on('change', function () {
			let idx = $(this).data('index');

			let billAmt = parseFloat($(this).val()) || 0;

			addedRows[idx].billAmt = billAmt;

			let withGstValue =
				parseFloat(addedRows[idx].withGstValue) || 0;

			let diff = billAmt - withGstValue;

			addedRows[idx].diff = diff;

			// Update Diff column
			$(this)
				.closest('tr')
				.find('.diff-cell')
				.text(diff.toFixed(2));
		});

		// Vendor Click
		bind_vendor_click();

	}

	load_summary_table();

	function bind_vendor_click(){
		$('.vendor-link').on('click', function() {

			let index = $(this).data('index');
			let rowData = addedRows[index];
			console.log(rowData);
			let summary_id= rowData.name;
			console.log(summary_id);

			frappe.call({
				method: "vgjewellry.rate_cut.get_saved_transactions",
				args: {
					acc_mst_id: rowData.accMstId,
					summary_id: summary_id
				},
				callback: function(r) {
					let savedRows = r.message || [];
					savedSelected = savedRows.map(
						x => x.item_tran_id
					);


					let savedMap = {};

					savedRows.forEach(row => {
						savedMap[row.item_tran_id] = row;
					});
					let vendorRecords =
						apiData[rowData.accMstId];
					console.log(vendorRecords);

					open_vendor_modal(
						rowData,
						vendorRecords,
						savedSelected,
						savedMap,
						rowData.vendor
					);
				}
			});
		});
	}
	function open_vendor_modal(rowData, records,savedSelected,savedMap,vendorName){


		let modalHtml = `
		<div class="mb-3">
	<b>Total FineWt:</b>
	<span id="total-finewt">0.000</span>

	&nbsp;&nbsp;&nbsp;

	<b>Total OC:</b>
	<span id="total-oc">0.00</span>

	&nbsp;&nbsp;&nbsp;

	<b>Total HM:</b>
	<span id="total-hm">0.00</span>
    </div>
		    <div style="overflow-x:auto;">

			<table class="
			    table table-bordered
			    table-striped
			">

			    <thead>
				<tr>
				    <th></th>
				    <th>Vou No</th>
				    <th>Date</th>
				    <th>GrossWt</th>
				    <th>NetWt</th>
				    <th>FineWt</th>
				    <th>Purity</th>
				    <th>OC</th>
				    <th>HM</th>
				    <th>Item Name</th>
				</tr>
			    </thead>

			    <tbody>
		`;

		records.forEach(record => {
			let checked = savedSelected.includes(record.ItemTranID);
			let saved = savedMap[record.ItemTranID] || {};
			console.log(savedSelected);
			console.log(record);

			modalHtml += `
			<tr>
 <td>
	<input type="checkbox"
	       class="txn-check"
	       data-id="${record.ItemTranID}"
	       ${checked ? "checked" : ""}>
    </td>
			    <td>${record.VouNo}</td>

			    <td>
				${frappe.datetime.str_to_user(
					record.VouDate
				)}
			    </td>

			    <td>${record.GrossWt}</td>

			    <td>${record.NetWt}</td>

			    <td> <input type="number"
	       class="form-control finewt-input"
	       data-id="${record.ItemTranID}"
	       value="${saved.fine_wt ?? record.FineWt ?? 0}"
	       step="0.001"></td>

			    <td>${record.Purity}</td>

			    <td><input type="number"
	   class="form-control oc-input"
	   data-id="${record.ItemTranID}"
	   value="${saved.oc ?? record.OtherCharge ?? 0}"
	   step="0.01"></td>
			    <td><input type="number"
	   class="form-control hm-input"
	   data-id="${record.ItemTranID}"
	   value="${saved.hm ?? record.HM ?? 0}"
	   step="0.01"></td>

			    <td>${record.Narration}</td>

			</tr>
		    `;
		});

		modalHtml += `
			    </tbody>
			</table>
		    </div>
		`;

		let d = new frappe.ui.Dialog({
			title: vendorName ,
			size: 'extra-large',
			fields: [
				{
					fieldtype: 'HTML',
					fieldname: 'vendor_records'
				}
			]
		});

		d.fields_dict.vendor_records.$wrapper.html(
			modalHtml
		);
		function updateTotals() {

			let totalFineWt = 0;
			let totalOC = 0;
			let totalHM = 0;

			d.$wrapper.find('.txn-check:checked').each(function () {

				let id = $(this).data('id');

				totalFineWt += parseFloat(
					d.$wrapper.find(
						`.finewt-input[data-id="${id}"]`
					).val()
				) || 0;

				totalOC += parseFloat(
					d.$wrapper.find(
						`.oc-input[data-id="${id}"]`
					).val()
				) || 0;

				totalHM += parseFloat(
					d.$wrapper.find(
						`.hm-input[data-id="${id}"]`
					).val()
				) || 0;
			});

			d.$wrapper.find('#total-finewt')
				.text(totalFineWt.toFixed(3));

			d.$wrapper.find('#total-oc')
				.text(totalOC.toFixed(2));

			d.$wrapper.find('#total-hm')
				.text(totalHM.toFixed(2));
		}
		d.$wrapper.on(
			'change',
			'.txn-check, .finewt-input, .oc-input, .hm-input',
			updateTotals
		);
		d.set_primary_action("Save Selection", function() {

			let selectedRows = [];

			d.$wrapper.find(".txn-check:checked").each(function() {

				let id = $(this).data("id");

				let row = records.find(r =>
					r.ItemTranID == id
				);
				if (row) {
					let fineWt = parseFloat(
						d.$wrapper.find(`.finewt-input[data-id="${id}"]`).val()
					) || 0;

					let oc = parseFloat(
						d.$wrapper.find(`.oc-input[data-id="${id}"]`).val()
					) || 0;

					let hm = parseFloat(
						d.$wrapper.find(`.hm-input[data-id="${id}"]`).val()
					) || 0;

					selectedRows.push({
						...row,
						FineWt: fineWt,	
						OtherCharge: oc,
						HM: hm
					});
				}
			});

			frappe.call({
				method: "vgjewellry.rate_cut.save_selected_transactions",
				args: {
					summary_id:rowData.name,
					vendor: rowData.vendor,
					acc_mst_id: rowData.accMstId,
					rows: JSON.stringify(selectedRows)
				},
				callback: function() {

					frappe.msgprint("Saved");

					d.hide();
					load_summary_table();
				}
			});
		});
		updateTotals();
		d.show();

	}
	/*frappe.call({
		method: "frappe.client.get_list",
		args: {
			doctype: "Rate Cut Summary",
			filters: {
				is_submitted: 0
			},
			fields: [
				"name",
				"vendor",
				"acc_mst_id",
				"fine_wt",
				"fine_wt_selected",
				"net_wt",
				"oc",
				"hm"
			]
		},
		callback: function(r) {

			addedRows = (r.message || []).map(d => ({
				name:d.name,
				vendor: d.vendor,
				accMstId: d.acc_mst_id,
				ketanFineWt: d.fine_wt,
				selectedFineWt: d.fine_wt_selected,
				netWt: d.net_wt,
				oc: d.oc,
				hm: d.hm 
			}));

			render_table();
		}
	});*/
	frappe.call({
		method: "vgjewellry.rate_cut.get_all_vendor_rate_cut",

		callback: function(r) {

			if (!r.message) return;

			apiData = r.message;

			options = [];

			Object.keys(apiData).forEach(accMstId => {

				let records = apiData[accMstId];

				if (records.length > 0) {

					options.push({
						label: records[0].AccName,
						value: accMstId
					});
				}
			});

			// Sort
			options.sort((a, b) =>
				a.label.localeCompare(b.label)
			);

			// Autocomplete
			let field = frappe.ui.form.make_control({
				parent: $('#vendor-autocomplete'),
				df: {
					label: 'Vendor',
					fieldname: 'vendor',
					fieldtype: 'Autocomplete',
					options: options.map(x => x.label),
					placeholder: 'Search Vendor'
				},
				render_input: true
			});

			/*$('#vendor-table1 .save-row-btn').on('click', function() {
				let idx = $(this).data('index');

				frappe.call({
					method: "vgjewellry.rate_cut.save_single_rate_cut",
					args: {
						row: JSON.stringify(addedRows[idx])
					},
					callback: function () {
						frappe.show_alert({
							message: "Saved",
							indicator: "green"
						});
					}
				});
			});
			$('#vendor-table1 .remove-row-btn').on('click', function () {

				let idx = $(this).data('index');

				let row = addedRows[idx];

				frappe.confirm(
					'Remove this vendor?',
					function () {

						frappe.call({
							method: "vgjewellry.rate_cut.delete_rate_cut_summary",
							args: {
								summary_id: row.name
							},
							callback: function () {

								addedRows.splice(idx, 1);

								render_table();

								frappe.show_alert({
									message: "Removed",
									indicator: "red"
								});
							}
						});

					}
				);
			});*/
			$('#arihant-rate-btn').on('click', function() {
				frappe.call({
					method: "vgjewellry.rate_cut.get_arihant_rate",
					callback: function (r) {

						if (r.message) {

							$('#arihant-rate-display').text(
								`Rate: ${r.message}`
							);

						} else {

							frappe.msgprint("Rate not found");
						}
					}
				});
			});	
			// Add Button
			$('#add-row-btn').on('click', function() {

				let selectedName = field.get_value();

				if (!selectedName) {
					frappe.msgprint("Please select vendor");
					return;
				}

				let selected = options.find(
					x => x.label === selectedName
				);

				if (!selected) {
					frappe.msgprint("Invalid Vendor");
					return;
				}

				let fineWt = parseFloat(
					$('#fine_wt_input').val()
				);

				if (isNaN(fineWt)) {
					frappe.msgprint(
						"Please enter valid Fine Wt"
					);
					return;
				}

				let accMstId = selected.value;

				let rows = apiData[accMstId];

				let totalFineWtSelected = 0;
				let totalNetWt = 0;
				let totalOC = 0;

				/*rows.forEach(row => {

					totalFineWtSelected +=
						parseFloat(row.FineWt || 0);

					totalNetWt +=
						parseFloat(row.NetWt || 0);

					totalOC +=
						parseFloat(row.OtherCharge || 0);
				})*/;
				let today = frappe.datetime.get_today();

				addedRows.push({
					vendor: selectedName,
					ratecut_date: today,
					accMstId: accMstId,
					ketanFineWt: fineWt,
					selectedFineWt: totalFineWtSelected,
					netWt: totalNetWt,
					hm: '',
					oc: totalOC,
					rate999WGst: '',
					rate999WithoutGst: '',
					billWithoutGst: '',
					withGstValue: '',
					billAmt: '',
					diff: ''
				});
				frappe.call({
					method: "vgjewellry.rate_cut.save_rate_cut_summary",
					args: {
						data: JSON.stringify(addedRows)
					},
					callback: function(r) {
						console.log("Saved to DocType");
					}
				});
				render_table();

				$('#fine_wt_input').val('');
			});

			// Modal

		}
	});

	$(document).on('click', '.save-row-btn', function () {

    let idx = $(this).data('index');

    frappe.call({
        method: "vgjewellry.rate_cut.save_single_rate_cut",
        args: {
            row: JSON.stringify(addedRows[idx])
        },
        callback: function () {
            frappe.show_alert({
                message: "Saved",
                indicator: "green"
            });
        }
    });

});
	$(document).on('click', '.remove-row-btn', function () {

    let idx = $(this).data('index');
        let row = addedRows[idx];

    frappe.confirm(`Remove vendor <b>${row.vendor}</b>?`, () => {


        frappe.call({
            method: "vgjewellry.rate_cut.delete_rate_cut_summary",
            args: {
                summary_id: row.name
            },
            callback: function () {

                addedRows.splice(idx, 1);

                render_table();   // re-render UI

            }
        });

    });

});
};
