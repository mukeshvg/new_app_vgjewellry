frappe.pages['current_stock_page'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: "Today's Stock",
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
		flex-direction:column;
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
		<label for="branch">Branch</label>
		<select id="branch"><option value="">Select Branch</option></select>
	    </div>
	    <div class="dr-field">
		<label for="item">Item</label>
		<select id="item"><option value="">Select Item</option></select>
	    </div>
	    <div class="dr-field">
		<label for="variety">Variety</label>
		<select id="variety"><option value="">Select Variety</option></select>
	    </div>
	    <div class="dr-field">
		<label for="weight_range">Weight Range</label>
		<select id="weight_range"><option value="">Select Weight Range</option></select>
	    </div>
	    <button class="dr-submit" id="fetch_btn">Fetch Data</button>
	</div>
	<div class="dr-result" id="result_box"></div>
	<div id="custombutton">
	<span id="ucrrpt"></span>
	</div>
	<br>
	<div id="pivotContainer"  style=" width: 100%;"></div>
    `;
	$(page.body).append(html);
	frappe.call({
		method: "vgjewellry.master_api.get_all_branch",
		callback: function (res) {
			var branch_sel = res.message;
			var str="";
			for(var k in branch_sel){
				$('#branch').append(`<option value="${branch_sel[k]["branch_id"]}">${branch_sel[k]["branch"]}</option>`);
			}

		}
	});

	$("#branch").on("change",()=>{
		frappe.call({
			method: "vgjewellry.master_api.get_all_branch_item",
			args: {"branch": $("#branch").val()},
			callback: function (res) {
				$('#item').empty();
				$('#item').append('<option value="">Select Item</option>');

				var item_sel = res.message;
				var str="";
				for(var k in item_sel){
					$('#item').append(`<option value="${item_sel[k]["item_id"]}">${item_sel[k]["item"]}</option>`);
				}

			}
		});

	})
	$("#item").on("change",()=>{
		frappe.call({
			method: "vgjewellry.master_api.get_all_branch_item_variety",
			args: {"branch": $("#branch").val(),"item":$("#item").val()},
			callback: function (res) {
				var variety_sel = res.message;
				var str="";
				$('#variety').empty();
				$('#variety').append('<option value="">Select Variety</option>');
				for(var k in variety_sel){
					$('#variety').append(`<option value="${variety_sel[k]["variety_id"]}">${variety_sel[k]["variety"]}</option>`);
				}

			}
		});

	})
	$("#variety").on("change",()=>{
		frappe.call({
			method: "vgjewellry.master_api.get_all_branch_item_variety_weight_range",
			args: {"branch": $("#branch").val(),"item":$("#item").val(),"variety":$("#variety").val()},
			callback: function (res) {
				var wt_sel = res.message;
				var str="";
				$('#weight_range').empty();
				$('#weight_range').append('<option value="">Select Weight Range</option>');

				for(var k in wt_sel){
					$('#weight_range').append(`<option value="${wt_sel[k]["weight_range"]}">${wt_sel[k]["weight_range"]}</option>`);
				}

			}
		});

	})
	function unloadingicon() {
		let loadElements = document.querySelectorAll('[id="loading"]');
		loadElements.forEach(function (element) {
			element.setAttribute("hidden", "hidden");
		});
		clearInterval(window.interval);

	}

	function loadingicon() {
		if (window.isLoading == 1) {
			unloadingicon()
		}

		if (window.isLoading == undefined) {
			window.isLoading = 1;
		}

		let custbtn = document.querySelector("#custombutton");
		let loadingDiv = document.createElement("div");

		loadingDiv.innerHTML = `
		<div class="loading-container" style="margin-top: 20px; text-align: center;">
			<div class="loading-spinner" style="
				display: inline-block;
				width: 50px;
				height: 50px;
				border: 5px solid #f3f3f3;
				border-top: 5px solid #3498db;
				border-radius: 50%;
				animation: spin 1s linear infinite;
				margin-right: 15px;
				vertical-align: middle;">
			</div>
			<div id="clock" style="
				display: inline-block;
				font-family: 'Arial', sans-serif;
				font-size: 24px;
				color: #333;
				background: linear-gradient(145deg, #f0f0f0, #ffffff);
				padding: 15px 25px;
				border-radius: 10px;
				box-shadow: 5px 5px 10px #d1d1d1, -5px -5px 10px #ffffff;
				vertical-align: middle;">
				00:00
			</div>
			<div class="loading-text" style="
				margin-top: 10px;
				font-size: 16px;
				color: #666;
				font-family: 'Arial', sans-serif;">
				Processing your request...
			</div>
		</div>
		<style>
			@keyframes spin {
				0% { transform: rotate(0deg); }
				100% { transform: rotate(360deg); }
			}
		</style>
	`;

		loadingDiv.id = "loading";
		custbtn.after(loadingDiv);
		window.isLoading = 1;

		var timeLeft = 1;
		window.interval = setInterval(updateClock, 1000);

		function updateClock() {
			var minutes = Math.floor(timeLeft / 60);
			var seconds = timeLeft % 60;
			minutes = minutes < 10 ? "0" + minutes : minutes;
			seconds = seconds < 10 ? "0" + seconds : seconds;
			document.getElementById("clock").innerHTML = minutes + ":" + seconds;
			timeLeft++;
			if (timeLeft > 120) {
				clearInterval(interval);
				document.getElementById("clock").innerHTML = "Time's up!";
			}
		}
	}

	const resultBox = $("#result_box");

	// Default range: last 7 days

	var pivot;

	var usr = frappe.session.user;
	var bu = frappe.pages[Object.keys(frappe.pages)[0]].baseURI;
	let rpt = bu.substring(bu.lastIndexOf('/') + 1).trim();
	$("#fetch_btn").on("click", function (e) {
		e.preventDefault();
		var branch = $('#branch').val().trim();
		var item = $('#item').val().trim();
		var variety = $('#variety').val().trim();
		var weightRange = $('#weight_range').val().trim();

		// Validate branch
		if (branch === "") {
			alert("Please select a branch.");
			$('#branch').focus();
			return false;
		}

		// Validate item
		if (item === "") {
			alert("Please select an item.");
			$('#item').focus();
			return false;
		}

		// Both branch and item are selected — prepare data
		var data = {
			branch: branch,
			item: item,
			variety: variety,
			weight_range: weightRange
		};

		frappe.call({
			method: "vgjewellry.VG_api.ucr_fetch",
			args: {"rpt": rpt,"usr": usr},
			callback: function (res) {
				window.ucrformats = res.message;
			}
		});





		loadingicon();
		// Example backend call
		frappe.call({
			method: "vgjewellry.ideal_stock_api.get_todays_stock", 
			args:data,
			callback: function (r) {
				console.log(r.message);
				unloadingicon()
				if (r.message) {
					stdPivotUi(r.message);
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
