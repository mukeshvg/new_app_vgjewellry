frappe.pages['ideal-stock'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Ideal Stock',
		single_column: true
	});
	// --- CSS Styling ---
	const style = `
	<style>
	    .date-range-container {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 10px;
		background: #f8fafc;
		padding: 14px;
		border-radius: 10px;
		box-shadow: 0 2px 8px rgba(0,0,0,0.06);
		margin-top: 10px;
	    }
	    .dr-field {
		display: flex;
		align-items: center;
		gap: 6px;
		background: #fff;
		padding: 6px 10px;
		border: 1px solid #e2e8f0;
		border-radius: 8px;
	    }
	    .dr-field label {
		font-size: 13px;
		color: #64748b;
	    }
	    .dr-field input[type="date"] {
		border: none;
		outline: none;
		font-size: 14px;
		background: transparent;
		color: #0f172a;
	    }
	    .dr-submit {
		background: linear-gradient(180deg, #2563eb, #1e40af);
		color: #fff;
		border: none;
		padding: 8px 16px;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		box-shadow: 0 4px 10px rgba(37,99,235,0.2);
		transition: transform 0.1s ease;
	    }
	    .dr-submit:active { transform: scale(0.98); }
	    .dr-result {
		margin-top: 14px;
		background: #fff;
		border-radius: 8px;
		padding: 12px;
		border: 1px solid #e2e8f0;
		box-shadow: 0 1px 4px rgba(0,0,0,0.04);
		display: none;
	    }
	</style>
    `;
	$(page.body).append(style);

	// --- HTML Layout ---
	const html = `
	<div class="date-range-container">
	    <div class="dr-field">
		<label for="from_date">From</label>
		<input type="date" id="from_date">
	    </div>
	    <div class="dr-field">
		<label for="to_date">To</label>
		<input type="date" id="to_date">
	    </div>
	    <button class="dr-submit" id="fetch_btn">Submit</button>
	    <div class="dr-field">
		<label for="target_stock">Target Stock</label>
                <input type="number" id="target_stock">
		<button class="dr-submit" id="set_target_stock">Set Target Stock</button>
	    </div>
	</div>
	<div class="dr-result" id="result_box"></div>
	<div id="pivotContainer"  style=" width: 100%;"></div>
    `;
	$(page.body).append(html);

	// --- JS Logic ---
	const fromInput = $("#from_date");
	const toInput = $("#to_date");
	console.log(target_stock);
	const resultBox = $("#result_box");

	// Default range: last 7 days
	const today = frappe.datetime.get_today();
	const weekAgo = frappe.datetime.add_days(today, -225);

	fromInput.val(weekAgo);
	toInput.val(today);

	function formatDateToDMY(isoDate) {
		const [y, m, d] = isoDate.split("-");
		return `${d}-${m}-${y}`;
	}

	function formatDateToISO(dmy) {
		const [d, m, y] = dmy.split("-");
		return `${y}-${m}-${d}`;
	}

	var pivot;
	$("#set_target_stock").on("click",function(){
		const target_stock1 = $("#target_stock");
		let target_stock=target_stock1.val();
		if (!target_stock) {
                        frappe.msgprint("Input target stock");
                        return;
                }
		frappe.call({
			method: "vgjewellry.ideal_stock_api.set_target_stock", 
			args: {
				target_stock: target_stock,  
			},
			callback: function (r) {
				console.log(r);
				if (r.message) {
					//stdPivotUi(r.message);
					pivot.updateData({
    data: r.message
});
				} else {
					resultBox.html("<div>No data found</div>").show();
				}
			}
		});

	})

        var usr = frappe.session.user;
        var bu = frappe.pages[Object.keys(frappe.pages)[0]].baseURI;
        let rpt = bu.substring(bu.lastIndexOf('/') + 1).trim();
	$("#fetch_btn").on("click", function () {

		 frappe.call({
                method: "vgjewellry.VG_api.ucr_fetch",
                // args: {"rpt":rpt},
                args: {"rpt": rpt,"usr": usr},
                callback: function (res) {
			window.ucrformats = res.message;
                }
        });

		let from_iso = fromInput.val();
		let to_iso = toInput.val();

		if (!from_iso || !to_iso) {
			frappe.msgprint("Please select both dates");
			return;
		}

		// Convert to D-M-Y for display
		const from_dmy = formatDateToDMY(from_iso);
		const to_dmy = formatDateToDMY(to_iso);

		// Validate range
		if (from_iso > to_iso) {
			frappe.msgprint("Start date cannot be after End date");
			return;
		}

		resultBox.hide().html(`<div>Fetching data from <b>${from_dmy}</b> to <b>${to_dmy}</b>...</div>`);

		// Example backend call
		frappe.call({
			method: "vgjewellry.ideal_stock_api.get_ideal_stock", 
			args: {
				from_date: from_iso,  
				to_date: to_iso
			},
			callback: function (r) {
				console.log(r);
				if (r.message) {
					stdPivotUi(r.message);
					/*resultBox
						.html(`<div><b>From:</b> ${from_dmy} <b>To:</b> ${to_dmy}</div><pre>${JSON.stringify(r.message, null, 2)}</pre>`)
						.show();*/
				} else {
					resultBox.html("<div>No data found</div>").show();
				}
			}
		});
	});

	function stdPivotUi(pivotdata) {
		$(function () {
			frappe.require([
				"/assets/vgjewellry/js/custom/flexmonster_cdn.js"
			], () => {
				let webori = window.location.origin;
				if (webori.search("10.10.10.137") > 0) {
					window.flexlickey = "Z7UN-162H69-6T1N31-1X1Z09-4K2L1E-38615B-1S386C-4P4S1Q-6T2J2O-6N4K47-6I5Y24-114S6V-6F6I16-0Y1F5U-3X0I0N-20253O-3I2O47-2M"
				}
				else if(webori.search("app.vgjewellry.com") > 0) {
					window.flexlickey = "Z7T6-XJ6G1I-57443C-4M4W42-5Y0Q2E-2L1W47-076L30-0M0A6W-6Y182U-3Y3C59-5A4B"
				}

				 let selobj = {}
                        let rpt = {}
                        let custom_note = ""


                        if (window.setreportname) {
                                selobj = findNested(ucrformats, "sub_reportname", window.setreportname)
                                rpt = JSON.parse(selobj?.report_format)
                        }
else {
                                selobj = ucrformats.length ? ucrformats[0] : {}
                                rpt = ucrformats.length ? JSON.parse(ucrformats[0]?.report_format) : {}
                                window.setreportname = selobj?.sub_reportname
                                let f = 0;
                                for (let i = 0; i < window.ucrformats.length; i++) {
                                        if (window.ucrformats[i]["is_default"] && window.ucrformats[i]["username"] == frappe.session.user && window.ucrformats[i]["is_global"] == 0) {
                                                f = 1;
                                                selobj = window.ucrformats[i]
                                                rpt = JSON.parse(window.ucrformats[i]?.report_format)
                                                window.setreportname = selobj?.sub_reportname
                                                break;
                                        }
                                }

                                if (f === 0) {
                                        for (let i = 0; i < window.ucrformats.length; i++) {
                                                if (window.ucrformats[i]["is_default"] && window.ucrformats[i]["is_global"]) {
                                                        selobj = window.ucrformats[i]
                                                        rpt = JSON.parse(ucrformats[i]?.report_format)
                                                        window.setreportname = selobj?.sub_reportname
                                                        break;
                                                }
                                        }
                                }
                        }

				let baseConfig = {
					container: "pivotContainer",
					componentFolder: "https://cdn.flexmonster.com/",
					licenseKey: flexlickey,
					toolbar: true,
					//beforetoolbarcreated: customizeToolbar,
					height: 660,
					report: {
						dataSource: {
							data: pivotdata
						},
						formats: [{
							name: "",
							thousandsSeparator: ",",
							nullValue: "",
							infinityValue: "",
							divideByZeroValue: ""
						}]
					}
				};
				// If we have a saved report format, merge it with base config
				if (Object.keys(rpt).length !== 0) {
					baseConfig.report = {
						...baseConfig.report,
						slice: rpt.slice,
						options: rpt.options,
						conditions: rpt.conditions,
						formats: rpt.formats || baseConfig.report.formats,
						tableSizes: rpt.tableSizes,
						customFields: rpt.customFields,
					};
				}

				// Initialize Flexmonster with consistent configuration
				pivot = new Flexmonster(baseConfig);

				// Add event listener for report complete
				pivot.on("reportcomplete", function() {
					if (rpt.options && rpt.options.viewType) {
						pivot.setViewType(rpt.options.viewType);
					}
					if (rpt.slice && rpt.slice.expandAll) {
						pivot.expandAllData();
					}
				});
				pivot.customizeContextMenu(function (items, data) {
					let cell = flexmonster.getSelectedCell();
					let param = cell.member?.hierarchyName;
					if (param) {
						items.push({
							label: "Expand " + param + " Data",
							handler: function () {
								pivot.expandData(param);
							}
						});
						items.push({
							label: "Collapse " + param + " Data",
							handler: function () {
								pivot.collapseData(param);
							}
						});
					}
					items.push({
						label: "Expand All Data",
						handler: function () {
							pivot.expandAllData();
						}
					});
					items.push({
						label: "Collapse All Data",
						handler: function () {
							pivot.collapseAllData();
						}
					});
					items.push({
						label: "Show AverageTotal",
						handler: function () {
							showAverageTotal();
						}
					});
					return items;
				});
				if (window.ucrformats.length > 0 && Object.keys(selobj).length !== 0) {
                                $('.report-button').removeClass('selected');
                                $(`#${window.setreportname}`).addClass('selected');
                        }


			})
		})
	}	
}
