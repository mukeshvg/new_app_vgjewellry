frappe.pages['rate-cut'].on_page_load = function (wrapper) {

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
	.arihant-card{
    background: linear-gradient(135deg, #111827, #1f2937);
    padding: 12px 16px;
    border-radius: 12px;
    color: white;
    display: inline-block;
    min-width: 260px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.25);
}

.arihant-title{
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 10px;
    color: #fbbf24;
}

.arihant-body{
    display: flex;
    align-items: center;
    gap: 12px;
}

.rate-box{
    background: rgba(255,255,255,0.08);
    padding: 8px 12px;
    border-radius: 10px;
    text-align: center;
    min-width: 90px;
}

.rate-box .label{
    font-size: 11px;
    opacity: 0.8;
}

.rate-box .value{
    font-size: 16px;
    font-weight: bold;
    margin-top: 2px;
}

.gold-999 .value{
    color: #22c55e;
}

.gold-995 .value{
    color: #38bdf8;
}
	/* Make ledger modal table header fixed */
.ledger-fixed-table thead tr:first-child  th, .metal-currency-table thead tr:first-child  th, .rate-cut-individual-table thead tr:first-child  th {
    position: sticky;
    top: 0;
    background: #FFFFFF;   /* match dark theme */
    z-index: 5;
}

.ledger-fixed-table thead tr.ledger-filter-row th, .metal-currency-table thead tr.metal-currency-table-filter th  {
    position: sticky;
    top: 38px; /* height of first header row */
    background: #FFFFFF;
    z-index: 2;
}

/* Scroll only table body */
.ledger-scroll {
    max-height: 65vh;
    overflow-y: auto;
}
	.vou-no {
    white-space: nowrap !important;
}
.modal-dialog {
    width: 98vw !important;
    max-width: 98vw !important;
}

.modal-content {
    height: 90vh;
    overflow: hidden;
}

.modal-body {
    max-height: 80vh;
    overflow: auto;
}

.remove-modal .modal-dialog{
	max-width:575px !important;
}
.remove-modal .modal-content{
	height:auto;
}
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
	    <div class="col-md-3" >
	    <div class="arihant-card">

    <div class="arihant-title">
        💰 Arihant Metal Rates(With GST)
    </div>

    <div class="arihant-body">

        <div class="rate-box gold-999">
            <div class="label">Gold 999</div>
            <div class="value" id="rate-999">-</div>
        </div>

        <div class="rate-box gold-995">
            <div class="label">Gold 995</div>
            <div class="value" id="rate-995">-</div>
        </div>

        <button class="btn btn-warning btn-sm" id="arihant-rate-btn">
            Refresh
        </button>

    </div>
</div>
	    </div>
	    <div class="col-md-2">
	    <button class="btn btn-info ml-2"
        id="metal-currency-ledger-btn">
    Metal Currency Ledger
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
				filters: {
					is_submitted: 0
				},
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
					"returnfinewt",
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
					ratecut_date: d.ratecut_date,
					vendor: d.vendor,
					accMstId: d.acc_mst_id,
					ketanFineWt: d.fine_wt,
					selectedFineWt: d.fine_wt_selected,
					netWt: d.net_wt,
					oc: d.oc,
					hm: d.hm,
					returnfinewt: d.returnfinewt,
					rate999WGst: d.rate_999_with_gst,
					rate999WithoutGst: d.rate_999_without_gst,
					billWithoutGst: d.bill_value_without_gst,
					withGstValue: d.bill_value_with_gst,
					billAmt: d.bill_amt,
					diff: d.diff


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
		let totalReturnFinewt = 0;

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
				<th>Return Fine Wt</th>
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

			totalReturnFinewt += parseFloat(row.returnfinewt || 0)

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

			    <td>
			    <input type="number"
           class="form-control form-control-sm ketan-finewt-input"
           data-index="${index}"
           value="${row.ketanFineWt || 0}"
           step="0.001">
			    </td>

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
			    <td>${row.returnfinewt.toFixed(3)}</td>

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

			<td>${totalHM.toFixed(3)}</td>

			<td>
			    ${totalOC.toFixed(2)}
			</td>

			<td>${totalReturnFinewt.toFixed(3)}</td>
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
		let saveTimeout;
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

			let returnfinewt = parseFloat(addedRows[idx].returnfinewt) || 0;

			let hm =
				parseFloat(addedRows[idx].hm) || 0;

			let oc =
				parseFloat(addedRows[idx].oc) || 0;

			let billWithoutGst =
				((withoutGst / 10) * (selectedFineWt - returnfinewt)) +
				hm +
				oc;

			addedRows[idx].billWithoutGst = billWithoutGst;

			// Update UI
			$(`.billwithoutgst-input[data-index="${idx}"]`)
				.val(billWithoutGst.toFixed(2));
			let withGstValue = billWithoutGst * 1.03;

			addedRows[idx].withGstValue = withGstValue;

			$(`.withgstvalue-input[data-index="${idx}"]`)
				.val(withGstValue.toFixed(2));

			clearTimeout(saveTimeout);
			saveTimeout = setTimeout(() => {
				frappe.call({
					method: "vgjewellry.rate_cut.update_rate_cut_row",
					args: {
						summary_id: addedRows[idx].name,
						acc_mst_id: addedRows[idx].accMstId,
						rate999_wgst: gstRate,
						rate999_wogst: withoutGst,
						bill_without_gst: billWithoutGst,
						bill_with_gst: withGstValue
					},
					callback: function (r) {
						frappe.show_alert({
							message: "Saved",
							indicator: "green"
						});
					}
				});
			}, 2000);
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


		$('#vendor-table .ketan-finewt-input').on('change', function () {

			let idx = $(this).data('index');
			let value = parseFloat($(this).val()) || 0;

			// update local data
			addedRows[idx].ketanFineWt = value;

			// optional: auto recalc dependent fields if needed
			let selectedFineWt = parseFloat(addedRows[idx].selectedFineWt || 0);
			let netWt = parseFloat(addedRows[idx].netWt || 0);

			// example recalculation (if you want logic)
			// addedRows[idx].netWt = selectedFineWt - value;

			// optional: auto save to backend
			clearTimeout(window.ketanFineWtTimer);

			window.ketanFineWtTimer = setTimeout(() => {

				frappe.call({
					method: "vgjewellry.rate_cut.update_ketan_finewt",
					args: {
						summary_id: addedRows[idx].name,
						ketan_finewt: value
					},
					callback: function () {
						frappe.show_alert({
							message: "Fine Wt Updated",
							indicator: "green"
						});
					}
				});

			}, 800);
		});
		let billTimer;
		$('#vendor-table .billamt-input').on('change', function () {
			let idx = $(this).data('index');

			let billAmt = parseFloat($(this).val()) || 0;

			addedRows[idx].billAmt = billAmt;

			let withGstValue =
				parseFloat(addedRows[idx].withGstValue) || 0;

			let diff = billAmt - withGstValue;

			addedRows[idx].diff = diff;


			if (billAmt == 0) diff = 0

			// Update Diff column
			$(this)
				.closest('tr')
				.find('.diff-cell')
				.text(diff.toFixed(2));

			clearTimeout(billTimer);

			billTimer = setTimeout(() => {
				frappe.call({
					method: "vgjewellry.rate_cut.update_bill_and_diff",
					args: {
						summary_id: addedRows[idx].name,
						bill_amt: billAmt,
						diff: diff
					},
					callback: function () {
						frappe.show_alert({
							message: "Bill Updated",
							indicator: "green"
						});
					}
				});
			}, 1000);
		});

		// Vendor Click
		bind_vendor_click();

	}

	load_summary_table();

	function bind_vendor_click() {
		$('.vendor-link').on('click', function () {

			let index = $(this).data('index');
			let rowData = addedRows[index];

			let summary_id = rowData.name;


			frappe.call({
				method: "vgjewellry.rate_cut.get_saved_transactions",
				args: {
					acc_mst_id: rowData.accMstId,
					summary_id: summary_id
				},
				callback: function (r) {
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

	function open_vendor_modal(rowData, records, savedSelected, savedMap, vendorName) {


		let modalHtml = `
		<div class="mb-3">
	<b>Total FineWt:</b>
	<span id="total-finewt">0.000</span>

	   

	<b>Total OC:</b>
	<span id="total-oc">0.00</span>

	   

	<b>Total HM:</b>
	<span id="total-hm">0.00</span>
    </div>
		    <div style="overflow-x:auto;" class="ledger-scroll">

			<table class="
			    table table-bordered
			    table-striped rate-cut-individual-table
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
				    <th>Return Vou No</th>
			            <th>Return Date</th>
				    <th>Return GrossWt</th>
			            <th>Return NetWt</th>
		        	    <th>Return FineWt</th>
	                            <th>Return Narration</th>
				</tr>
			    </thead>

			    <tbody>
		`;

		records.forEach(record => {
			let checked = savedSelected.includes(record.ItemTranID);
			let saved = savedMap[record.ItemTranID] || {};


			modalHtml += `
			<tr>
 <td>
	<input type="checkbox"
	       class="txn-check"
	       data-id="${record.ItemTranID}"
	       ${checked ? "checked" : ""}>
    </td>
			    <td class="vou-no">${record.VouNo}</td>

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

			    <td>${record.tradname}</td>

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

			<td class="vou-no">${record.ReturnVouNo || ''}</td>

    <td>
        ${record.ReturnVouDate
            ? frappe.datetime.str_to_user(record.ReturnVouDate)
            : ''}
    </td>

    <td>${record.ReturnGrossWt || 0}</td>

    <td>${record.ReturnNetWt || 0}</td>

    <td><input type="number"
               class="form-control returnfinewt-input"
               data-id="${record.ItemTranID}"
               value="${saved.returnfinewt ?? record.ReturnFineWt ?? 0}"
               step="0.001">
    </td>

    <td>${record.ReturnNarration || ''}</td>
			</tr>
		    `;
		});

		modalHtml += `
			    </tbody>
			</table>
		    </div>
		`;

		let d = new frappe.ui.Dialog({
			title: vendorName,
			size: 'extra-large',
			fields: [{
				fieldtype: 'HTML',
				fieldname: 'vendor_records'
			}]
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
			'.txn-check, .finewt-input, .oc-input, .hm-input, .returnfinewt-input ',
			updateTotals
		);
		d.set_primary_action("Save Selection", function () {

			let selectedRows = [];

			d.$wrapper.find(".txn-check:checked").each(function () {

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

					let returnfinewt = parseFloat(
						d.$wrapper.find(`.returnfinewt-input[data-id="${id}"]`).val()
					) || 0;

					selectedRows.push({
						...row,
						FineWt: fineWt,
						OtherCharge: oc,
						HM: hm,
						ReturnFineWt: returnfinewt
					});
				}
			});

			frappe.call({
				method: "vgjewellry.rate_cut.save_selected_transactions",
				args: {
					summary_id: rowData.name,
					vendor: rowData.vendor,
					acc_mst_id: rowData.accMstId,
					rows: JSON.stringify(selectedRows)
				},
				callback: function () {

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
		freeze: true,
        	freeze_message: __("Loading Vendors..."),
		callback: function (r) {

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
			function loadArihantRate() {
				frappe.call({
					method: "vgjewellry.rate_cut.get_arihant_rate",
					callback: function (r) {
						if (r.message) {
							$('#rate-999').text(r.message.gold_999 || '-');
							$('#rate-995').text(r.message.gold_995 || '-');
						}
					}
				});
			}

			// Initial load
			loadArihantRate();

			// Auto refresh every 5 seconds
			let arihantRateInterval = setInterval(loadArihantRate, 10000);

			// Manual refresh button
			$('#arihant-rate-btn').on('click', loadArihantRate);
			$(wrapper).on("remove", function () {
				clearInterval(arihantRateInterval);
			});
			/*$('#arihant-rate-btn').on('click', function () {
				frappe.call({
					method: "vgjewellry.rate_cut.get_arihant_rate",
					callback: function (r) {

						if (r.message) {

							$('#rate-999').text(r.message.gold_999 || '-');
							$('#rate-995').text(r.message.gold_995 || '-');

						} else {

							frappe.msgprint("Rate not found");
						}
					}
				});
			});*/
			$('#metal-currency-ledger-btn').on('click', function () {

				frappe.call({
					method: "vgjewellry.rate_cut.get_metal_currency_ledger",
					freeze: true,
        				freeze_message: __("Loading Metal Currency Ledger..."),
					callback: function (r) {

						let data = r.message || [];
						data.sort((a, b) => {

							let accountCompare = (a.name || "").localeCompare(b.name || "");

							if (accountCompare !== 0) {
								return accountCompare;
							}

							//return (a.metal || "").localeCompare(b.metal || "");
						});

						let html = `
				      <div class="mb-2">

					    <button class="btn btn-primary btn-sm"
						    id="process-selected">
						Process Selected
					    </button>

					</div>
					<div style="max-height:75vh;overflow:auto;">
					    <table class="table table-bordered table-striped metal-currency-table">
						<thead>
						    <tr>
						    	<th style="width:40px;text-align:center;">
            							<input type="checkbox" id="select-all-ledger">
						        </th>
							<th>Account</th>
							<th>Metal</th>
							<th>Receivable Wt</th>
							<th>Payable Wt</th>
							<th>Receivable Amt</th>
							<th>Payable Amt</th>
							<th>Category</th>
						    </tr>
						   <tr class ="metal-currency-table-filter">
    <th></th>

    <th>
        <input type="text" class="form-control form-control-sm col-filter" data-col="1" placeholder="Search Account">
    </th>

    <th>
        <input type="text" class="form-control form-control-sm col-filter" data-col="2" placeholder="Search Metal">
    </th>

    <th>
        <input type="text" class="form-control form-control-sm col-filter" data-col="3" placeholder="Search Wt">
    </th>

    <th>
        <input type="text" class="form-control form-control-sm col-filter" data-col="4" placeholder="Search Wt">
    </th>

    <th>
        <input type="text" class="form-control form-control-sm col-filter" data-col="5" placeholder="Search Amt">
    </th>

    <th>
        <input type="text" class="form-control form-control-sm col-filter" data-col="6" placeholder="Search Amt">
    </th>
    <th>
        <input type="text" class="form-control form-control-sm col-filter" data-col="7" placeholder="Search Cat">
    </th>
</tr>

						</thead>
						<tbody>
				    `;

						if (data.length) {

							data.forEach((row, i) => {

								html += `
						<tr>
						<td class="text-center">
						<input type="checkbox"
						       class="ledger-row"
						       data-index="${i}">
					    	</td>
						    <td><span
						class="ledger-account-link"
						data-acc="${row.acc}"
						style="
						    color:#1f6feb;
						    cursor:pointer;
						    font-weight:600;
						">
						${row.name || ''}
					    	</span>
					    	   </td>
						    <td>${row.metal || ''}</td>

						    <td class="text-right">
							${parseFloat(row.receivable_wt || 0).toFixed(3)}
						    </td>

						    <td class="text-right">
							${parseFloat(row.payable_wt || 0).toFixed(3)}
						    </td>

						    <td class="text-right">
							${parseFloat(row.receivable_amt || 0).toFixed()}
						    </td>

						    <td class="text-right">
							${parseFloat(row.payable_amt || 0).toFixed()}
						    </td>
						    <td class="text-left">
							${row.grp}

						    </td>

						</tr>
					    `;
							});

						} else {

							html += `
					    <tr>
						<td colspan="6" class="text-center">
						    No Data Found
						</td>
					    </tr>
					`;
						}

						html += `
						</tbody>
					    </table>
					</div>
				    `;

						let d = new frappe.ui.Dialog({
							title: 'Metal Currency Ledger',
							size: 'extra-large',
							fields: [{
								fieldtype: 'HTML',
								fieldname: 'ledger_html'
							}]
						});

						d.fields_dict.ledger_html.$wrapper.html(html);

						function filterLedgerTable() {


							let filters = {};

							d.$wrapper.find(".metal-currency-table .col-filter").each(function () {
								let col = $(this).data("col");
								let val = $(this).val().toLowerCase().trim();
								filters[col] = val;
							});

							d.$wrapper.find(".metal-currency-table tbody tr").each(function () {

								let row = $(this);
								let show = true;

								Object.keys(filters).forEach(col => {

									let filterVal = filters[col];
									if (!filterVal) return;

									let cellText = row.find("td").eq(col).text().toLowerCase();

									if (!cellText.includes(filterVal)) {
										show = false;
									}
								});

								row.toggle(show);
							});
						}

						d.$wrapper.on(
							"keyup",
							".metal-currency-table .col-filter",
							filterLedgerTable
						);
						d.$wrapper.on("change", "#select-all-ledger", function () {

							let checked = $(this).is(":checked");

							d.$wrapper.find(".ledger-row:visible")
								.prop("checked", checked);

						});
						d.$wrapper.on("click", "#process-selected", function () {

							let selected = [];

							d.$wrapper.find(".ledger-row:checked").each(function () {

								selected.push(
									data[$(this).data("index")]
								);

							});

							if (!selected.length) {

								frappe.msgprint("Please select at least one row.");

								return;
							}


							frappe.call({
								method: "vgjewellry.rate_cut.process_selected_ledger",
								args: {
									rows: JSON.stringify(selected)
								},
								callback: function (r) {

									frappe.show_alert({
										message: "Saved Successfully",
										indicator: "green"
									});
									d.hide();
									setTimeout(() => {
										location.reload();
									}, 300);

								}
							});

						});
						d.show();
						d.show();

						d.$wrapper.on('click', '.ledger-account-link', function () {

							let acc = $(this).data('acc');

							frappe.call({
								method: "vgjewellry.rate_cut.get_metal_currency_ledger_details",
								args: {
									acc_mst_id: acc
								},
								callback: function (r) {
									if (r.message) {
										showLedgerModal(r.message);
									}

								}
							});

						});
					}
				});

			});

			function showLedgerModal(res) {

				let finalHtml = `
        <h5 class="mb-3">Final Amount</h5>
        <table class="table table-bordered table-sm">
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Transaction</th>
                    <th>Value</th>
                    <!--<th>Transaction All</th>
                    <th>Value All</th>-->
                </tr>
            </thead>
            <tbody>
    `;

				(res.final || []).forEach(row => {
					finalHtml += `
            <tr>
                <td>${row.type || ""}</td>
                <td>${row.transaction || ""}</td>
                <td>${row.val || 0}</td>
               <!-- <td>${row.transaction_all || ""}</td>
                <td>${row.val_all || 0}</td>-->
            </tr>
        `;
				});

				finalHtml += `
            </tbody>
        </table>
    `;

				let tableHtml = `
      <div class="ledger-scroll">
        <table class="table table-bordered table-striped ledger-fixed-table" >
            <thead>
                <tr>
                    <th>Voucher No</th>
                    <th>Date</th>
                    <th>Metal</th>
                    <th>Payable Wt</th>
                    <th>Receivable Wt</th>
                    <th>Payable Amt</th>
                    <th>Receivable Amt</th>
                    <th>Due</th>
                </tr>
                <tr class="ledger-filter-row">
        <th><input type="text" class="form-control form-control-sm ledger-filter-input" data-col="0" placeholder="Search"></th>
        <th><input type="text" class="form-control form-control-sm ledger-filter-input" data-col="1" placeholder="Search"></th>
        <th><input type="text" class="form-control form-control-sm ledger-filter-input" data-col="2" placeholder="Search"></th>
        <th><input type="text" class="form-control form-control-sm ledger-filter-input" data-col="3" placeholder="Search"></th>
        <th><input type="text" class="form-control form-control-sm ledger-filter-input" data-col="4" placeholder="Search"></th>
        <th><input type="text" class="form-control form-control-sm ledger-filter-input" data-col="5" placeholder="Search"></th>
        <th><input type="text" class="form-control form-control-sm ledger-filter-input" data-col="6" placeholder="Search"></th>
        <th><input type="text" class="form-control form-control-sm ledger-filter-input" data-col="7" placeholder="Search"></th>
    </tr>
            </thead>
            <tbody>
    `;

				(res.data || []).forEach(row => {

					tableHtml += `
            <tr>
                <td>${row.vno || ""}</td>
                <td>${row.vdate || ""}</td>
                <td>${row.metal || ""}</td>
                <td class="text-right">${row.payable_wt || 0}</td>
                <td class="text-right">${row.receivable_wt || 0}</td>
                <td class="text-right">${row.payable_amt || 0}</td>
                <td class="text-right">${row.receivable_amt || 0}</td>
                <td>${row.is_due || ""}</td>
            </tr>
        `;
				});

				tableHtml += `
            </tbody>
        </table>
        </div>
    `;

				const d = new frappe.ui.Dialog({
					title: res.name || "Ledger Details",
					size: "extra-large",
					fields: [{
						fieldtype: "HTML",
						fieldname: "content"
					}]
				});

				d.show();

				d.$wrapper.on("keyup", ".ledger-filter-input", function () {

					let colIndex = $(this).data("col");
					let value = $(this).val().toLowerCase();

					d.$wrapper.find(".ledger-fixed-table tbody tr").each(function () {

						let cellText = $(this)
							.find("td")
							.eq(colIndex)
							.text()
							.toLowerCase();

						if (cellText.includes(value)) {
							$(this).show();
						} else {
							$(this).hide();
						}
					});
				});

				d.fields_dict.content.$wrapper.html(`
        ${finalHtml}
        <hr>
        ${tableHtml}
    `);
			}
			// Add Button
			$('#add-row-btn').on('click', function () {

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
				})*/
				;
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
					callback: function (r) {
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

		frappe.confirm(`Remove vendor <b class="mit-remove">${row.vendor}</b>?`, () => {


			frappe.call({
				method: "vgjewellry.rate_cut.delete_rate_cut_summary",
				args: {
					summary_id: row.name
				},
				callback: function () {

					addedRows.splice(idx, 1);

					render_table(); // re-render UI

				}
			});

		});
		setTimeout(() => {

			$(".modal.show").each(function () {
				const text = $(this).find(".frappe-confirm-message").text();
				if (text.includes("Remove vendor")) {
					$(this).addClass("remove-modal");
				}

			});

		}, 200);

	});
};
