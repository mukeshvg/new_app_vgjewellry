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
	input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield; /* Firefox */
}
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
 input[type="number"] {
  text-align: right;
}
	/* Make ledger modal table header fixed */
.ledger-fixed-table thead tr:first-child  th, .metal-currency-table thead tr:first-child  th, .rate-cut-individual-table thead tr:first-child  th {
    position: sticky;
    top: 0;
    background: #FFFFFF;   /* match dark theme */
    z-index: 5;
}

.ledger-fixed-table thead tr.ledger-filter-row th, .metal-currency-table thead tr.metal-currency-table-filter th ,.rate-cut-individual-table thead tr.vendor-filter-row th  {
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
<div class="col-md-2">
    <label class="control-label">From Date</label>
    <input type="date"
           class="form-control"
           id="rate-cut-from-date">
</div>

<div class="col-md-2">
    <label class="control-label">To Date</label>
    <input type="date"
           class="form-control"
           id="rate-cut-to-date">
</div>

<div class="col-md-2" style="margin-top:24px;">
    <button class="btn btn-primary" id="filter-rate-cut">
        Filter
    </button>

    <button class="btn btn-secondary" id="clear-rate-cut-filter">
        Clear
    </button>
</div>
<div class="col-md-3" style="margin-top:24px;">
    <div class="form-check">
        <input class="form-check-input"
               type="checkbox"
               id="rate-cut-done"
               checked>

        <label class="form-check-label" for="rate-cut-done">
            Rate Cut Done
        </label>
    </div>

    <div class="form-check">
        <input class="form-check-input"
               type="checkbox"
               id="rate-cut-not-done"
               checked>

        <label class="form-check-label" for="rate-cut-not-done">
            Rate Cut Not Done
        </label>
    </div>
</div>
	    <!--<div class="col-md-4">
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
	    </div>-->
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
	     <div class="col-md-2">
	    <button class="btn btn-success ml-2" id="export-rate-cut">
    Export Excel
</button>
</div>
<div class="col-md-2">
    <button class="btn btn-danger ml-2" id="remove-selected-rate-cut">
        Remove Selected
    </button>
</div>

	</div>

	<div id="vendor-table"></div>
    `);

	function load_summary_table() {

		let filters = {
        	is_submitted: 0
    	};
		let fromDate = $('#rate-cut-from-date').val();
let toDate = $('#rate-cut-to-date').val();

if (fromDate && toDate) {
    filters.ratecut_date = ["between", [fromDate, toDate]];
} else if (fromDate) {
    filters.ratecut_date = [">=", fromDate];
} else if (toDate) {
    filters.ratecut_date = ["<=", toDate];
}
    	let done = $("#rate-cut-done").is(":checked");
    let notDone = $("#rate-cut-not-done").is(":checked");

    // If only "Done" is checked
    if (done && !notDone) {
        filters.rate_999_with_gst = [">", 0];
    }
 console.log(done,notDone);

    // If only "Not Done" is checked
    if (!done && notDone) {
        filters.rate_999_with_gst = ["in", ["", null, 0]];
    }	
		frappe.call({
			method: "frappe.client.get_list",
			args: {
				doctype: "Rate Cut Summary",
				filters: filters,
				fields: [
					"name",
					"ratecut_date",
					"vendor",
					"acc_mst_id",
					"fine_wt",
					"fine_wt_selected",
					"fine_wt_diff",
					"net_wt",
					"oc",
					"hm",
					"sales_wastage_wt",
					"returnfinewt",
					"rate_cut_by",
					"rate_cut_type",
					"rate_999_with_gst",
					"rate_999_without_gst",
					"bill_value_without_gst",
					"bill_value_with_gst",
					"bill_amt",
					"bill_amount_without_gst",
					"diff",
					"rate_cut_note"
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
					fineWtDiff:d.fine_wt_diff,
					netWt: d.net_wt,
					oc: d.oc,
					hm: d.hm,
					sales_wastage_wt:d.sales_wastage_wt,
					rate_cut_by:d.rate_cut_by,
					rate_cut_type:d.rate_cut_type,
					returnfinewt: d.returnfinewt,
					rate999WGst: d.rate_999_with_gst,
					rate999WithoutGst: d.rate_999_without_gst,
					billWithoutGst: d.bill_value_without_gst,
					withGstValue: d.bill_value_with_gst,
					billAmt: d.bill_amt,
					billAmtWithoutGst:d.bill_amount_without_gst,
					diff: d.diff,
					rate_cut_note: d.rate_cut_note


				}));

				render_table();
			}
		});
	}
	
	$('#filter-rate-cut').on('click', function () {
    load_summary_table();
});

$('#clear-rate-cut-filter').on('click', function () {
    $('#rate-cut-from-date').val('');
    $('#rate-cut-to-date').val('');

    $('#rate-cut-done').prop('checked', true);
    $('#rate-cut-not-done').prop('checked', true);

    load_summary_table();
});

$("#rate-cut-done, #rate-cut-not-done").on("change", function () {
    load_summary_table();
});

function updateRateCutTotals() {

	let totalBillAmt = 0;
	let totalBillAmtWithoutGst = 0;
	let totalBillValue = 0;
	let totalBillValueWithoutGst = 0;
	let totalDiff = 0;

	addedRows.forEach(row => {

		totalBillAmt += parseFloat(row.billAmt || 0);
		totalBillAmtWithoutGst += parseFloat(row.billAmtWithoutGst || 0);

		totalBillValue += parseFloat(row.withGstValue || 0);
		totalBillValueWithoutGst += parseFloat(row.billWithoutGst || 0);
		totalDiff += parseFloat(row.diff || 0);

	});


	$("#total-bill-value-without-gst")
		.text(totalBillValueWithoutGst.toFixed());

	$("#total-bill-value")
		.text(totalBillValue.toFixed());

	$("#total-bill-amt")
		.text(totalBillAmt.toFixed());

	$("#total-bill-amt-without-gst").text(totalBillAmtWithoutGst.toFixed());
	$("#total-diff-bill").text(totalDiff.toFixed());

}
	function render_table() {

		let totalKetanFineWt = 0;
		let totalSelectedFineWt = 0;
		let totalNetWt = 0;
		let totalOC = 0;
		let totalHM = 0;
		let totalReturnFinewt = 0;
		let totalSales_Wastage_Wt = 0;
		let totalFineWtDiff = 0;
		let totalBillAmt = 0;
		let totalBillAmtWithoutGst = 0;
		
		let totalBillValue= 0;
		let totalBillValueWithoutGst = 0;
		let totalDiff =0;

		let html = `

		    <table class="table table-bordered table-striped rate-cut-table">

			<thead>
			    <tr>
				<th> <input type="checkbox" id="select-all-summary">Ratecut Date</th>
				<th>RATE 999 Without GST</th>
				<th>Vendor</th>
				<th>Fine Wt (Ketan Sir)</th>
				<th>Fine Wt Selected</th>
				<th>Fine Wt Diff</th>
				<th>Net Wt</th>
				<th>HM</th>
				<th>OC</th>
				<th>Sales Wastage Wt</th>
				<th>Return Fine Wt</th>
				<th>Rate Cut By</th>
				<th>Rate Cut Type</th>
				<th>RATE 999 With GST</th>
				<th>BILL VALUE WITHOUT GST</th>
				<th>WITH GST VALUE</th>
				<th>BILL AMT (Vikrant)</th>
				<th>BILL AMT WITHOUT GST (Vikrant)</th>
				<th>Diff</th>
				<th>Notes</th>
				<!--<th>Save</th>-->
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
				
		   	totalBillAmt += parseFloat(row.billAmt || 0);
		    totalBillAmtWithoutGst += parseFloat(row.billAmtWithoutGst || 0);
		    
		    totalBillValue += parseFloat(row.withGstValue || 0);
		    totalBillValueWithoutGst += parseFloat(row.billWithoutGst || 0);

			totalReturnFinewt += parseFloat(row.returnfinewt || 0)
			totalSales_Wastage_Wt += parseFloat(row.sales_wastage_wt || 0)
			let fineWt = parseFloat(row.ketanFineWt || 0);
			let selectedFineWt = parseFloat(row.selectedFineWt || 0);
			//let fineWtDiff = selectedFineWt - fineWt;
			let fineWtDiff = row.fineWtDiff;

			let diff =  parseFloat(row.billWithoutGst || 0) -  parseFloat(row.billAmtWithoutGst || 0);
			totalFineWtDiff += fineWtDiff;
			totalDiff+=(parseFloat( row.billWithoutGst || 0) - parseFloat( row.billAmtWithoutGst  || 0));
			html += `
			<tr>
				<td>
				<input type="checkbox"
           class="summary-row"
           data-index="${index}"
           data-name="${row.name}">
				${row.ratecut_date
						? moment(row.ratecut_date).format("DD-MM-YYYY")
						: ''}</td>
			    <td> <input type="number" readonly
	   class="form-control rate999wogst-input"
	   data-index="${index}"
	   value="${row.rate999WithoutGst.toFixed() || ''}"
	   step="0.01"></td>

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
                            <td style="text-align:right">
                                ${row.selectedFineWt.toFixed(3)}
                            </td>

			    <td class="finewt-diff-cell" style="text-align:right">
    			${fineWtDiff.toFixed(3)}
				</td>
				
			    <td>
			    <input type="number"
           class="form-control nnetwt-input"
           data-index="${index}"
           value="${row.netWt || ''}"
           step="0.01">
			    </td>

			    <td style="text-align:right">${row.hm}</td>

			    <td style="text-align:right">${row.oc.toFixed(2)}</td>
			    <td style="text-align:right">${row.sales_wastage_wt.toFixed(2)}</td>
			    <td style="text-align:right">${row.returnfinewt.toFixed(3)}</td>
			    <td>
				<select class="form-control rate-cut-by"
						data-index="${index}">
					<option value=""
						${!row.rate_cut_by ? "selected" : ""}>
					</option>

					${
						rateCutByOptions.map(opt => `
							<option value="${opt}"
								${row.rate_cut_by === opt ? "selected" : ""}>
								${opt}
							</option>
						`).join("")
					}
				</select>
			</td>

			<td>
				<select class="form-control rate-cut-type"
						data-index="${index}">
				            <option value=""
        				    ${!row.rate_cut_type ? "selected" : ""}>
        					</option>
							<option value="Rate Cut"
						${row.rate_cut_type=="Rate Cut" ? "selected":""}>
						Rate Cut
					</option>

					<option value="Kim"
						${row.rate_cut_type=="Kim" ? "selected":""}>
						Kim
					</option>
				</select>
			</td>

			    <td><input type="number"
	   class="form-control rate999wgst-input"
	   data-index="${index}" 
	   value="${row.rate999WGst || ''}"
	   ></td>


			    <td><input type="number" readonly
	   class="form-control billwithoutgst-input"
	   data-index="${index}"
	   value="${row.billWithoutGst.toFixed()  || ''}"
	   step="0.01"></td>

			    <td><input type="number" readonly
	   class="form-control withgstvalue-input"
	   data-index="${index}"
	   value="${row.withGstValue.toFixed()  || ''}"
	   step="0.01"></td>

			    <td><input type="number" readonly
	   class="form-control billamt-input"
	   data-index="${index}"
	   value="${row.billAmt.toFixed()  || ''}"
	   step="0.01"></td>
<td>
<input type="number" readonly
class="form-control billamtwithoutgst-input"
data-index="${index}"
value="${row.billAmtWithoutGst.toFixed()  || ''}"
step="0.01">
</td>
			    <td class="diff-cell" style="text-align:right">
<input type="number" readonly
class="form-control diff-cell-input"
data-index="${index}"
value="${row.diff.toFixed()  || ''}"
step="0.01">
			    <td><input type="text" 
	   class="form-control rate_cut_note-input"
	   data-index="${index}"
	   value="${row.rate_cut_note || ''}"
	   ></td>
<!--<td>
    <button
	class="btn btn-success btn-sm save-row-btn"
	data-index="${index}">
	Save
    </button>
</td>-->

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
			<td></td>
			<td>TOTAL</td>

			<td id="total-ketan-finewt" style="text-align:right">
			    ${totalKetanFineWt.toFixed(3)}
			</td>

			<td style="text-align:right">
			    ${totalSelectedFineWt.toFixed(3)}
			</td>
			<td style="text-align:right" id="total-finewt-diff">${totalFineWtDiff.toFixed(3)}</td>
			<td style="text-align:right">
			    ${totalNetWt.toFixed(3)}
			</td>

			<td style="text-align:right">${totalHM.toFixed(3)}</td>

			<td style="text-align:right">${totalOC.toFixed(2)}</td>
			<td style="text-align:right">${totalSales_Wastage_Wt.toFixed(2)}</td>
			<td style="text-align:right">${totalReturnFinewt.toFixed(3)}</td>
			<td></td>
			<td></td>
			<td></td>
			<td style="text-align:right" id="total-bill-value-without-gst">${totalBillValueWithoutGst.toFixed()}</td>
			<td style="text-align:right" id="total-bill-value" >${totalBillValue.toFixed()}</td>
			<td style="text-align:right" id="total-bill-amt">${totalBillAmt.toFixed()}</td>
			<td style="text-align:right" id="total-bill-amt-without-gst">${totalBillAmtWithoutGst.toFixed()}</td>
			<td style="text-align:right" id="total-diff-bill">${totalDiff.toFixed()}</td>
			<td></td>
		    </tr>
		`;

		html += `
			</tbody>
		    </table>
		`;

		$('#vendor-table').html(html);
		
		$("#vendor-table .rate-cut-by, #vendor-table .rate-cut-type").on("change", function () {

			let idx = $(this).data("index");

			addedRows[idx].rate_cut_by = $(
				`.rate-cut-by[data-index="${idx}"]`
			).val();

			addedRows[idx].rate_cut_type = $(
				`.rate-cut-type[data-index="${idx}"]`
			).val();

			frappe.call({
				method: "vgjewellry.rate_cut.update_rate_cut_by",
				args: {
				    summary_id: addedRows[idx].name,
				    rate_cut_by: addedRows[idx].rate_cut_by,
				    rate_cut_type: addedRows[idx].rate_cut_type
				},
				callback() {
				    frappe.show_alert({
				        message: "Saved",
				        indicator: "green"
				    });
				}
			});

		});
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
				.val(withoutGst.toFixed());
			// Calculate Bill Value Without GST
			let selectedFineWt =
				parseFloat(addedRows[idx].selectedFineWt) || 0;
				

			let returnfinewt = parseFloat(addedRows[idx].returnfinewt) || 0;

			let hm =
				parseFloat(addedRows[idx].hm) || 0;

			let oc =
				parseFloat(addedRows[idx].oc) || 0;

			let billWithoutGst =
				((withoutGst / 10) * (selectedFineWt )) +
				hm +
				oc;

			addedRows[idx].billWithoutGst = billWithoutGst;

			// Update UI
			$(`.billwithoutgst-input[data-index="${idx}"]`)
				.val(billWithoutGst.toFixed());
			let withGstValue = billWithoutGst * 1.03;

			addedRows[idx].withGstValue = withGstValue;

			$(`.withgstvalue-input[data-index="${idx}"]`)
				.val(withGstValue.toFixed());
				
		   let ketanFineWt =parseFloat(addedRows[idx].ketanFineWt) || 0;
		   let billAmountWithoutGst =  ((withoutGst / 10) * (ketanFineWt )) + hm + oc;
		   let billAmountwithGstValue =  billAmountWithoutGst * 1.03;
		   
		   addedRows[idx].billAmtWithoutGst =billAmountWithoutGst;
		   addedRows[idx].billAmt = billAmountwithGstValue;
			$(`.billamt-input[data-index="${idx}"]`).val(billAmountwithGstValue.toFixed());
		$(`.billamtwithoutgst-input[data-index="${idx}"]`).val(billAmountWithoutGst.toFixed());	
			let diff_total_value= billWithoutGst -billAmountWithoutGst
		$(`.diff-cell-input[data-index="${idx}"]`).val(diff_total_value.toFixed());	
		addedRows[idx].diff = diff_total_value;	
		updateRateCutTotals();
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
						bill_with_gst: withGstValue,
						bill_amt:billAmountwithGstValue,
						bill_amount_without_gst:billAmountWithoutGst,
						diff:diff_total_value
						
						
						
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


		$('#vendor-table .ketan-finewt-input').on('change', function () {

			let idx = $(this).data('index');
			let value = parseFloat($(this).val()) || 0;

			// update local data
			addedRows[idx].ketanFineWt = value;
			let selected = parseFloat(addedRows[idx].selectedFineWt) || 0;

let diff = selected - value;

$(this)
    .closest('tr')
    .find('.finewt-diff-cell')
    .text(diff.toFixed(3));


			// optional: auto recalc dependent fields if needed
			let selectedFineWt = parseFloat(addedRows[idx].selectedFineWt || 0);
			let netWt = parseFloat(addedRows[idx].netWt || 0);

let totalDiff = 0;
let totalKetan=0;

	addedRows.forEach(row => {

		let ketan = parseFloat(row.ketanFineWt || 0);
		let selectedWt = parseFloat(row.selectedFineWt || 0);

		totalDiff += ketan - selectedWt;
				totalKetan += ketan;


	});

	$('#total-ketan-finewt')
		.text(totalKetan.toFixed(3));

	$('#total-finewt-diff')
		.text(totalDiff.toFixed(3));
			// example recalculation (if you want logic)
			// addedRows[idx].netWt = selectedFineWt - value;

			// optional: auto save to backend
			
			let rateWithGst =
		parseFloat(addedRows[idx].rate999WGst) || 0;

	let rateWithoutGst =
		parseFloat(addedRows[idx].rate999WithoutGst) || 0;


	let billAmt =	value * rateWithGst;


	let billAmountWithoutGst =value * rateWithoutGst;
	let billWithoutGst = selectedFineWt * rateWithoutGst;


	addedRows[idx].billAmt = billAmt;
	addedRows[idx].billWithoutGst = billWithoutGst;


	$(`.billamt-input[data-index="${idx}"]`)
		.val(billAmt.toFixed());


	$(`.billwithoutgstamt-input[data-index="${idx}"]`)
		.val(billAmountWithoutGst.toFixed());

let diff_bill =  billWithoutGst - billAmountWithoutGst;

addedRows[idx].diff = diff;

$(this)
    .closest("tr")
    .find(".diff-cell")
    .text(diff_bill.toFixed());
	
			clearTimeout(window.ketanFineWtTimer);

			window.ketanFineWtTimer = setTimeout(() => {

				frappe.call({
					method: "vgjewellry.rate_cut.update_ketan_finewt",
					args: {
						summary_id: addedRows[idx].name,
						ketan_finewt: value,
						fine_wt_diff: diff,
						bill_amt:billAmt,
						bill_without_gst:billWithoutGst
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
		$('#vendor-table .nnetwt-input').on('change', function () {

			let idx = $(this).data('index');
			let value = parseFloat($(this).val()) || 0;

			// update local data
			addedRows[idx].netWt = value;


			// example recalculation (if you want logic)
			// addedRows[idx].netWt = selectedFineWt - value;

			// optional: auto save to backend
			clearTimeout(window.ketanFineWtTimer2);

			window.ketanFineWtTimer2 = setTimeout(() => {

				frappe.call({
					method: "vgjewellry.rate_cut.update_netwt",
					args: {
						summary_id: addedRows[idx].name,
						net_wt: value
					},
					callback: function () {
						frappe.show_alert({
							message: "Net Wt Updated",
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
		
		let rateCutNoteTimer;
		$('#vendor-table .rate_cut_note-input').on('change', function () {
			let idx = $(this).data('index');

			let rate_cut_note =$(this).val() || "";

			addedRows[idx].rate_cut_note = rate_cut_note;


			clearTimeout(rateCutNoteTimer);

			rateCutNoteTimer = setTimeout(() => {
				frappe.call({
					method: "vgjewellry.rate_cut.update_rate_cut_note",
					args: {
						summary_id: addedRows[idx].name,
						rate_cut_note: rate_cut_note
					},
					callback: function () {
						frappe.show_alert({
							message: "Notes Updated",
							indicator: "green"
						});
					}
				});
			}, 500);
		});

		// Vendor Click
		bind_vendor_click();

	}

	$('#rate-cut-date-filter').val(frappe.datetime.get_today());

	let rateCutByOptions = [];

		frappe.call({
			method: "frappe.client.get_list",
			args: {
				doctype: "Rate Cut By",
				fields: ["rate_cut_by"],
				limit_page_length: 1000
			},
			callback: function(r) {
				rateCutByOptions = (r.message || []).map(d => d.rate_cut_by);
				console.log(rateCutByOptions)
			}
		});
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
					let savedRows = r.message.rows || [];
					let rate999WithGst = r.message.rate_999_with_gst;

					savedSelected = savedRows.map(
						x => x.item_tran_id
					);


					let savedMap = {};
					let sv =[];
					savedRows.forEach(row => {
						savedMap[row.item_tran_id] = row;
						sv.push(row);
					});
					if (!r.message.rate_exists) {
						frappe.call({
					method: "vgjewellry.rate_cut.get_vendor_rate_cut",
					freeze: true,
                			freeze_message: __("Loading Vendor Data..."),
					args: {
					    acc_mst_id: rowData.accMstId,
					    summary_id: summary_id
					},
					callback: function(res) {
					    // handle response

					    open_vendor_modal(
						rowData,
						res.message[rowData.accMstId],
						savedSelected,
						savedMap,
						rowData.vendor
					    );
					}
				    });
					

					}else{
					
					console.log(savedMap);

					open_vendor_modal(
						rowData,
						//vendorRecords,
						sv,
						savedSelected,
						savedMap,
						rowData.vendor
					);
					}
				}
			});
		});
	}

	function open_vendor_modal(rowData, records, savedSelected, savedMap, vendorName) {


		let modalHtml = `
		<div class="mb-12">
	<b>Total FineWt:</b>
	<span id="total-finewt" style="margin-right:20px">0.000</span>
	<b>Total NetWt:</b>
	<span id ="total-snetwt" style="margin-right:20px">0.000</span>   

	<b>Total OC:</b>
	<span id="total-oc" style="margin-right:20px">0.00</span>
	<b>Total Dimanod Stone Amt:</b>
	<span id="total-diamond_stone_amount" style="margin-right:20px">0.00</span>

	<b>Total HM:</b>
	<span id="total-hm">0.00</span>
    </div>
    <style>
    .rate-cut-individual-table {
    min-width: 2600px;   /* adjust if needed */
    table-layout: auto;
}

.rate-cut-individual-table th,
.rate-cut-individual-table td {
    white-space: nowrap;
    vertical-align: middle;
}
.vendor-filter-row input {
    min-width: 120px;
    width: 100%;
    font-size: 12px;
    padding: 3px 6px;
}
    </style>
		    <div style="overflow-x:auto;" class="ledger-scroll">

			<table class="
			    table table-bordered
			    table-striped rate-cut-individual-table
			">

			    <thead>
				<tr>
				    
				    <th style="width:40px;text-align:center;">
    				<input type="checkbox" id="select-all-vendor-harm">
					</th>
				    
				    <th>Vou No</th>
				    <th>Date</th>
				    <th>GrossWt</th>
				    <th>NetWt</th>
				    <th>FineWt</th>
				    <th>Purity</th>
				    <th>Pcs</th>
				    <th>Sales Wastage %</th>
				    <th>Sales Wastage Wt</th>
				    <th>OC</th>
				    <th>Diamond/Stone Amt</th>
				    <th>HM</th>
				    <th>Narration</th>
				    <th>Return Vou No</th>
			            <th>Return Date</th>
				    <th>Return GrossWt</th>
			            <th>Return NetWt</th>
		        	    <th>Return FineWt</th>
	                            <th>Return Narration</th>
				</tr>
				<tr class="vendor-filter-row">
			    <th></th>

			    <th><input type="text" class="form-control form-control-sm vendor-filter" data-col="1" placeholder="Vou No"></th>

			    <th><input type="text" class="form-control form-control-sm vendor-filter" data-col="2" placeholder="Date"></th>

			    <th><input type="text" class="form-control form-control-sm vendor-filter" data-col="3" placeholder="GrossWt"></th>

			    <th><input type="text" class="form-control form-control-sm vendor-filter" data-col="4" placeholder="NetWt"></th>

			    <th><input type="text" class="form-control form-control-sm vendor-filter" data-col="5" placeholder="FineWt"></th>

			    <th><input type="text" class="form-control form-control-sm vendor-filter" data-col="6" placeholder="Purity"></th>

			    <th><input type="text" class="form-control form-control-sm vendor-filter" data-col="7" placeholder="Pcs"></th>
			    <th><input type="text" class="form-control form-control-sm vendor-filter" data-col="8" placeholder="Wastage %"></th>
			    <th><input type="text" class="form-control form-control-sm vendor-filter" data-col="9" placeholder="Wastage Wt"></th>
			    <th><input type="text" class="form-control form-control-sm vendor-filter" data-col="10" placeholder="OC"></th>
			    <th><input type="text" class="form-control form-control-sm vendor-filter" data-col="19" placeholder="Dia/Stone Amt"></th>

			    <th><input type="text" class="form-control form-control-sm vendor-filter" data-col="11" placeholder="HM"></th>

			    <th><input type="text" class="form-control form-control-sm vendor-filter" data-col="12" placeholder="Narration"></th>

			    <th><input type="text" class="form-control form-control-sm vendor-filter" data-col="13" placeholder="Return Vou"></th>

			    <th><input type="text" class="form-control form-control-sm vendor-filter" data-col="14" placeholder="Return Date"></th>

			    <th><input type="text" class="form-control form-control-sm vendor-filter" data-col="15" placeholder="GrossWt"></th>

			    <th><input type="text" class="form-control form-control-sm vendor-filter" data-col="16" placeholder="NetWt"></th>

			    <th><input type="text" class="form-control form-control-sm vendor-filter" data-col="17" placeholder="FineWt"></th>

			    <th><input type="text" class="form-control form-control-sm vendor-filter" data-col="18" placeholder="Narration"></th>
			</tr>
			    </thead>

			    <tbody>
		`;
		records.sort((a, b) => {
		    let d = new Date(a.VouDate) - new Date(b.VouDate);

		    if (d !== 0) return d;

		    return (a.VouNo || "").localeCompare(b.VouNo || "", undefined, {
			numeric: true
		    });

		});
		const lightColors = [
		    "#FFF2CC", // Light Yellow
		    "#D9EAD3", // Light Green
		    "#D0E0E3", // Light Blue
		    "#F4CCCC", // Light Red
		    "#EAD1DC", // Light Pink
		    "#D9D2E9", // Lavender
		    "#FCE5CD", // Light Orange
		    "#CFE2F3", // Sky Blue
		    "#E2F0D9", // Pale Green
		    "#F9CB9C"  // Peach
		];

		let voucherColorMap = {};
		let colorIndex = 0;
		records.forEach(record => {
			let checked = savedSelected.includes(record.ItemTranID ?? record.item_tran_id);
			let saved = savedMap[record.ItemTranID] || {};
		if (!voucherColorMap[record.VouNo?? record.vou_no]) {
		    voucherColorMap[record.VouNo?? record.vou_no] = lightColors[colorIndex % lightColors.length];
		    colorIndex++;
		}
		let rowColor = voucherColorMap[record.VouNo?? record.vou_no];

			modalHtml += `
			<tr style="background-color:${rowColor};">
 <td>
	<input type="checkbox"
	       class="txn-check"
	       data-id="${record.ItemTranID}"
	       ${checked ? "checked" : ""}>
    </td>
			    <td class="vou-no">${record.VouNo ?? record.vou_no}</td>

			    <td class="vou-no">
			    ${moment(record.voucher_date).format("DD-MM-YYYY")}
			    </td>

			    <td style="text-align:right">${record.GrossWt ?? record.gross_wt}</td>

			    <td>
				<input type="number" class="form-control snetwt-input" data-id="${record.ItemTranID}" value="${saved.net_wt ?? record.NetWt ?? record.net_wt}" step="0.001">
			    </td>
			    <td>
			    <input type="number"  class="form-control finewt-input" data-id="${record.ItemTranID}" value="${saved.fine_wt ?? record.FineWt ?? record.fine_wt}" step="0.001">
			    </td>
			    <td>${record.tradname ?? record.purity}</td>
			    <td style="text-align:right">${record.Pcs ?? record.pcs}</td>
			    <td style="text-align:right">${record.WastagePer ?? record.sales_wastage_per}</td>
			    <td style="text-align:right">${record.WastageWt ?? record.sales_wastage_wt ?? 0}</td>
			    <td><input type="number"
	   class="form-control oc-input"
	   data-id="${record.ItemTranID}"
	   value="${saved.oc ?? record.OtherCharge ?? record.oc}"
	   step="0.01"></td>
	   <td>
<input type="number"
   class="form-control diamond-stone-amount-input"
   data-id="${record.ItemTranID}"
   value="${saved.diamond_stone_amount ?? record.DiamondAmt ?? 0}"
   step="0.001">
</td>
			    <td><input type="number"
	   class="form-control hm-input"
	   data-id="${record.ItemTranID}"
	   value="${saved.hm ?? record.HM ?? record.hm}"
	   step="0.01"></td>

			    <td>${record.Narration ?? record.narration}</td>

			<td class="vou-no">${record.ReturnVouNo  ?? record.returnvouno ?? ""}</td>

    <td class="vou-no">
    ${record.ReturnVouDate
    ? moment(record.ReturnVouDate).format("DD-MM-YYYY")
    : ""}
    </td>

    <td style="text-align:right">${record.ReturnGrossWt ?? record.returngrosswt ?? 0}</td>

    <td style="text-align:right">${record.ReturnNetWt ?? record.returnnetwt ?? 0}</td>

    <td><input type="number"
               class="form-control returnfinewt-input"
               data-id="${record.ItemTranID}"
               value="${saved.returnfinewt ?? record.ReturnFineWt ?? record.returnfinewt}"
               step="0.001">
    </td>

    <td>${record.ReturnNarration ?? record.returnnarration ?? ''}</td>
			</tr>
		    `;
		});

		modalHtml += `
		    </tbody>

		    <tfoot>
			<tr style="font-weight:bold;background:#f5f5f5;">
			    <td colspan="3" style="text-align:right;">Total</td>

			    <td style="text-align:right" id="tfoot-grosswt">0.000</td>
			    <td style="text-align:right" id="tfoot-netwt">0.000</td>
			    <td id="tfoot-finewt" style="text-align:right">0.000</td>

			    <td></td>
			    <td id="tfoot-pcs" style="text-align:right">0</td>

			    <td></td>

			    <td id="tfoot-wastagewt" style="text-align:right">0.000</td>

			    <td id="tfoot-oc" style="text-align:right">0.00</td>
			    <td id="tfoot-diamond_stone_amount" style="text-align:right">0.00</td>
			    <td id="tfoot-hm" style="text-align:right">0.00</td>

			    <td></td>
			    <td></td>
			    <td></td>

			    <td id="tfoot-returngross" style="text-align:right">0.000</td>
			    <td id="tfoot-returnnet" style="text-align:right">0.000</td>
			    <td id="tfoot-returnfine" style="text-align:right">0.000</td>

			    <td></td>
			</tr>
		    </tfoot>
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

		function updateTableTotals() {
		    let gross = 0;
		    let net = 0;
		    let fine = 0;
		    let pcs = 0;
		    let wastage = 0;
		    let oc = 0;
		    let diamond_stone_amount = 0;
		    let hm = 0;
		    let returnGross = 0;
		    let returnNet = 0;
		    let returnFine = 0;

		    d.$wrapper.find(".rate-cut-individual-table tbody tr:visible").each(function () {

			let td = $(this).find("td");

			gross += parseFloat(td.eq(3).text()) || 0;

			net += parseFloat(td.eq(4).find("input").val()) || 0;

			fine += parseFloat(td.eq(5).find("input").val()) || 0;

			pcs += parseFloat(td.eq(7).text()) || 0;

			wastage += parseFloat(td.eq(9).text()) || 0;

			oc += parseFloat(td.eq(10).find("input").val()) || 0;
			
			diamond_stone_amount += parseFloat(td.eq(11).find("input").val()) || 0;

			hm += parseFloat(td.eq(12).find("input").val()) || 0;

			returnGross += parseFloat(td.eq(16).text()) || 0;

			returnNet += parseFloat(td.eq(17).text()) || 0;

			returnFine += parseFloat(td.eq(18).find("input").val()) || 0;
		    });

		    d.$wrapper.find("#tfoot-grosswt").text(gross.toFixed(3));
		    d.$wrapper.find("#tfoot-netwt").text(net.toFixed(3));
		    d.$wrapper.find("#tfoot-finewt").text(fine.toFixed(3));
		    d.$wrapper.find("#tfoot-pcs").text(pcs);
		    d.$wrapper.find("#tfoot-wastagewt").text(wastage.toFixed(3));
		    d.$wrapper.find("#tfoot-oc").text(oc.toFixed(2));
		    d.$wrapper.find("#tfoot-diamond_stone_amount").text(diamond_stone_amount.toFixed(2));
		    d.$wrapper.find("#tfoot-hm").text(hm.toFixed(2));
		    d.$wrapper.find("#tfoot-returngross").text(returnGross.toFixed(3));
		    d.$wrapper.find("#tfoot-returnnet").text(returnNet.toFixed(3));
		    d.$wrapper.find("#tfoot-returnfine").text(returnFine.toFixed(3));
		}

		function updateTotals() {

			let totalFineWt = 0;
			let totalNetWt = 0;
			let totalOC = 0;
			let totalDiamondStoneAmount = 0;
			let totalHM = 0;

			d.$wrapper.find('.txn-check:checked').each(function () {

				let id = $(this).data('id');

				totalFineWt += parseFloat(d.$wrapper.find(`.finewt-input[data-id="${id}"]`).val()) || 0;
				totalNetWt += parseFloat(d.$wrapper.find(`.snetwt-input[data-id="${id}"]`).val()) || 0;
				totalDiamondStoneAmount += parseFloat(d.$wrapper.find(`.diamond-stone-amount-input[data-id="${id}"]`).val()) || 0;


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

			d.$wrapper.on("change", "#select-all-vendor-harm", function () {

			let checked = $(this).is(":checked");

			d.$wrapper.find(".txn-check:visible").prop("checked", checked);

			updateTotals();
		});	
		d.$wrapper.on("change", "#select-all-vendor-harm", function () {

    let checked = $(this).is(":checked");

    d.$wrapper.find(".txn-check:visible").prop("checked", checked);

    updateTotals();
});
			d.$wrapper.find('#total-finewt').text(totalFineWt.toFixed(3));
			d.$wrapper.find('#total-snetwt').text(totalNetWt.toFixed(3));

			d.$wrapper.find('#total-oc').text(totalOC.toFixed(2));
			d.$wrapper.find('#total-diamond_stone_amount').text(totalDiamondStoneAmount.toFixed(2));
			d.$wrapper.find('#total-hm').text(totalHM.toFixed(2));
		}
		function filterVendorTable() {

		    let filters = {};

		    d.$wrapper.find(".vendor-filter").each(function () {
			filters[$(this).data("col")] = $(this).val().toLowerCase().trim();
		    });

		    d.$wrapper.find(".rate-cut-individual-table tbody tr").each(function () {

			let row = $(this);
			let show = true;

			Object.keys(filters).forEach(col => {

			    if (!filters[col]) return;

			    let txt = row.find("td").eq(col).text().toLowerCase();

			    // search inside input fields also
			    let input = row.find("td").eq(col).find("input");
			    if (input.length) {
				txt = input.val().toLowerCase();
			    }

			    if (!txt.includes(filters[col])) {
				show = false;
			    }

			});

			row.toggle(show);

		    });
			updateTableTotals();
		}

		d.$wrapper.on("keyup", ".vendor-filter", filterVendorTable);
		d.$wrapper.on(
			'change',
			'.txn-check, .finewt-input, .oc-input,.diamond-stone-wt-input, .hm-input, .returnfinewt-input ',
			function () {
        		updateTotals();
       			 updateTableTotals();
    			}
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

					let oc = parseFloat(d.$wrapper.find(`.oc-input[data-id="${id}"]`).val()) || 0;
					let diamond_stone_amount = parseFloat(d.$wrapper.find(`.diamond-stone-amount-input[data-id="${id}"]`).val()) || 0;

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
						DiamondStoneAmount: diamond_stone_amount,
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
					 setTimeout(() => {

                        $(".modal.show").each(function () {
                                const text = $(this).find(".msgprint").text();
                                if (text.includes("Saved")) {
                                        $(this).addClass("remove-modal");
                                }

                        });

                }, 200);
				}
			});
		});
		updateTotals();
		setTimeout(() => {
		updateTableTotals();
		}, 500);	
		d.show();

	}
	
	
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
			
			$('#export-rate-cut').on('click', function () {

			frappe.call({
				method: "vgjewellry.rate_cut.export_rate_cut_excel",
				freeze: true,
				freeze_message: __("Generating Excel..."),
				callback: function (r) {

				    if (!r.message) {
				        frappe.msgprint("Unable to generate Excel.");
				        return;
				    }

				    // If API returns file URL
				    window.open(r.message, "_blank");

				    // OR
				    // window.location.href = r.message;
				}
			});

		});
			
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
						d.$wrapper.find('.metal-currency-table .col-filter[data-col="7"]').val("Supplier");
						filterLedgerTable();

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
					sales_wastage_wt:'',
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
$(document).on('change', '#select-all-summary', function () {
    $('.summary-row')
        .prop('checked', $(this).is(':checked'));

});
$(document).on('click', '#remove-selected-rate-cut', function () {

    let selected = [];

    $('.summary-row:checked').each(function () {
        selected.push($(this).data('name'));
    });

    if (!selected.length) {
        frappe.msgprint("Please select at least one row.");
        return;
    }

    frappe.confirm(
        `Remove <b class="mit-remove"> ${selected.length}</b> selected vendor rows?`,
        function () {

            frappe.call({
                method: "vgjewellry.rate_cut.delete_multiple_rate_cut_summary",
                args: {
                    summary_ids: selected
                },
                callback: function () {

                    frappe.show_alert({
                        message: "Rows removed successfully",
                        indicator: "green"
                    });

                    load_summary_table();
                }
            });

        }
    );
    setTimeout(() => {

                        $(".modal.show").each(function () {
                                const text = $(this).find(".frappe-confirm-message").text();
                                if (text.includes("Remove ")) {
                                        $(this).addClass("remove-modal");
                                }

                        });

                }, 200);
	

});
$(document).on('change', '.summary-row', function () {
    $('#select-all-summary').prop(
        'checked',
        $('.summary-row').length === $('.summary-row:checked').length
    );

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
