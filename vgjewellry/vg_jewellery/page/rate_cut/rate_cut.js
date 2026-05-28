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
		width: 120px;
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
                    "vendor",
                    "acc_mst_id",
                    "fine_wt",
                    "fine_wt_selected",
                    "net_wt",
                    "oc",
                    "hm"
                ]
            },
            callback: function (r) {

                addedRows = (r.message || []).map(d => ({
                    name: d.name,
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
				<th>Vendor</th>
				<th>Fine Wt (Ketan Sir)</th>
				<th>Fine Wt Selected</th>
				<th>Net Wt</th>
				<th>HM</th>
				<th>OC</th>
				<th>RATE 999W.GST</th>
				<th>999 W GST</th>
				<th>BILL VALUE WITHOUT GST</th>
				<th>WITH GST VALUE</th>
				<th>BILL AMT</th>
				<th>Diff</th>
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

			    <td>${row.rate999WGst}</td>

			    <td>${row.rate999WithoutGst}</td>

			    <td>${row.billWithoutGst}</td>

			    <td>${row.withGstValue}</td>

			    <td>${row.billAmt}</td>

			    <td>${row.diff}</td>

			</tr>
		    `;
		});

		// Total Row
		html += `
		    <tr style="
			font-weight:bold;
			background:#f5f5f5;
		    ">

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

		    </tr>
		`;

		html += `
			</tbody>
		    </table>
		`;

		$('#vendor-table').html(html);

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

					savedSelected = (r.message || []).map(
						x => x.item_tran_id
					);

					let vendorRecords =
						apiData[rowData.accMstId];
					console.log(vendorRecords);

					open_vendor_modal(
						rowData,
						vendorRecords,
						savedSelected
					);
				}
			});
		});
	}
	function open_vendor_modal(rowData, records,vendorName){


		let modalHtml = `
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

			    <td>${record.FineWt}</td>

			    <td>${record.Purity}</td>

			    <td>${record.OtherCharge}</td>
			    <td>${record.HM}</td>

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
			title: vendorName + ' Records',
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

		d.set_primary_action("Save Selection", function() {

			let selectedRows = [];

			d.$wrapper.find(".txn-check:checked").each(function() {

				let id = $(this).data("id");

				let row = records.find(r =>
					r.ItemTranID == id
				);

				if (row) selectedRows.push(row);
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

				addedRows.push({
					vendor: selectedName,
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
};
