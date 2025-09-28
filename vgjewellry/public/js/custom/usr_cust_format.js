function make(thispage, selectionhtml) {
	// debugger;
	let body = `
	<div id="custombutton">
	<span id="ucrrpt"></span>
	</div>
	<br>
	<div id="pivotContainer"  style=" width: 100%;"></div>
	<div> <textarea  id="show_notes" hidden style="margin: 5px; padding:10px; width: 100%; height: 300px; overflow-y: scroll;"></textarea> </div>
	<div> <textarea  id="output" hidden style="margin: 5px; padding:10px; width: 100%; height: 300px; overflow-y: scroll;"></textarea> </div>
	`;
	let fbody = selectionhtml + body;
	$(frappe.render_template(fbody, thispage)).appendTo(thispage.page.main);
	thispage.page.add_action_item('Save As', () => inscsrdata())
	thispage.page.add_action_item('Update', () => updateRepport())
	thispage.page.add_action_item('Delete', () => delgetReport())
	thispage.page.add_action_item('Custom', () => custgetReport())
	thispage.page.add_action_item('Preview', () => custsetReport())
	thispage.page.set_secondary_action('Submit', () => getapidata())

	const standardActions = document.getElementsByClassName('standard-actions')[0];

	// Create the new HTML elements with improved styling
	const newContent = `
    <div class="search-container" style="position: relative; margin-right: 10px;">
        <div class="search-wrapper" style="display: flex; align-items: center; background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); padding: 4px;">
            <div style="position: relative; flex-grow: 1;">
                <input type="text" 
                    id="input-field" 
                    placeholder="Search reports..." 
                    style="width: 100%; 
                           padding: 8px 12px; 
                           border: 1px solid #e0e0e0; 
                           border-radius: 6px; 
                           font-size: 14px;
                           transition: all 0.3s ease;"
                    oninput="showSuggestions()"
                    onfocus="this.style.borderColor='#4CAF50'; this.style.boxShadow='0 0 0 2px rgba(76,175,80,0.2)'"
                    onblur="this.style.borderColor='#e0e0e0'; this.style.boxShadow='none'">
                <ul id="suggestion-list" style="position: absolute;
                    z-index: 1000;
                    list-style: none;
                    padding: 0;
                    margin: 4px 0 0 0;
                    background: white;
                    border-radius: 6px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    max-height: 300px;
                    overflow-y: auto;
                    width: 100%;
                    display: none;"></ul>
            </div>
            <button onclick="get_search()" 
                style="margin-left: 8px;
                       padding: 8px 16px;
                       background: #4CAF50;
                       color: white;
                       border: none;
                       border-radius: 6px;
                       cursor: pointer;
                       transition: all 0.3s ease;
                       display: flex;
                       align-items: center;
                       justify-content: center;">
                <i class="fa fa-search"></i>
                <span style="margin-left: 6px;">Search</span>
            </button>
        </div>
    </div>
`;
	window.samglob = {};
	// Create a temporary container to hold the new elements
	const tempContainer = document.createElement('div');
	tempContainer.innerHTML = newContent;

	// Insert the new elements before the existing ones
	while (tempContainer.firstChild) {
		standardActions.insertBefore(tempContainer.firstChild, standardActions.firstChild);
	}

	// Add event listener for clicking outside the search container
	document.addEventListener('click', function (event) {
		const searchContainer = document.querySelector('.search-container');
		if (!searchContainer.contains(event.target)) {
			document.getElementById('suggestion-list').style.display = 'none';
		}
	});

	// Add keyboard navigation for suggestions
	document.getElementById('input-field').addEventListener('keydown', function(e) {
		const suggestionList = document.getElementById('suggestion-list');
		const suggestions = suggestionList.getElementsByTagName('li');
		const currentIndex = Array.from(suggestions).findIndex(item => item.classList.contains('selected'));

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (currentIndex < suggestions.length - 1) {
				if (currentIndex >= 0) suggestions[currentIndex].classList.remove('selected');
				suggestions[currentIndex + 1].classList.add('selected');
				suggestions[currentIndex + 1].scrollIntoView({ block: 'nearest' });
			}
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (currentIndex > 0) {
				suggestions[currentIndex].classList.remove('selected');
				suggestions[currentIndex - 1].classList.add('selected');
				suggestions[currentIndex - 1].scrollIntoView({ block: 'nearest' });
			}
		} else if (e.key === 'Enter' && currentIndex >= 0) {
			e.preventDefault();
			suggestions[currentIndex].click();
		}
	});
}

function getsrf() {
	debugger;
	var usr = frappe.session.user;
	var bu = frappe.pages[Object.keys(frappe.pages)[0]].baseURI;
	let rpt = bu.substring(bu.lastIndexOf('/') + 1).trim();

	frappe.call({
		method: "vgjewellry.VG_api.ucr_fetch",
		// args: {"rpt":rpt},
		args: {"rpt": rpt,"usr": usr},
		callback: function (res) {
			debugger;
			rendersrf(res.message);
		}
	});
}

function rendersrf(serie) {
    debugger;
	window.ucrformats = serie;
	$(function () {
		var options = [];

		// Add CSS styles for modern buttons
		const styleSheet = `
			<style>
				.report-button-container {
					display: inline-block;
					margin: 5px;
				}
				.report-button {
					background: linear-gradient(145deg, #ffffff, #f0f0f0);
					padding: 10px 20px;
					margin: 5px;
					border: none;
					border-radius: 8px;
					cursor: pointer;
					font-size: 14px;
					box-shadow: 3px 3px 6px #d1d1d1, -3px -3px 6px #ffffff;
					transition: all 0.3s ease;
					position: relative;
					overflow: hidden;
					color: #333;
					font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
				}
				.report-button:hover {
					transform: translateY(-2px);
					box-shadow: 4px 4px 8px #c1c1c1, -4px -4px 8px #ffffff;
				}
				.report-button:active {
					transform: translateY(0);
					box-shadow: inset 2px 2px 5px #d1d1d1, inset -2px -2px 5px #ffffff;
				}
				.report-button.selected {
					background: linear-gradient(145deg, #2490EF, #2080DF);
					color: white;
					font-weight: bold;
					box-shadow: 3px 3px 6px #1a6abf, -3px -3px 6px #2490EF;
				}
				.report-button.personal-default {
					background: linear-gradient(145deg, #F9DDF5, #fce6f8);
					border-left: 3px solid #2490EF;
				}
				.report-button.global-default {
					background: linear-gradient(145deg, #FAF5B6, #fff7b8);
					border-left: 3px solid #2490EF;
				}
				.default-badge, .global-badge {
					font-size: 10px;
					padding: 2px 6px;
					border-radius: 4px;
					margin-left: 8px;
					display: inline-block;
				}
				.default-badge {
					background: #2490EF;
					color: white;
				}
				.global-badge {
					background: #2490EF;
					color: white;
				}
				.report-button-wrapper {
					display: flex;
					flex-wrap: wrap;
					gap: 10px;
					padding: 10px;
					background: #f8f9fa;
					border-radius: 12px;
					box-shadow: 0 2px 4px rgba(0,0,0,0.05);
				}
			</style>
		`;

		options.push('<div class="report-button-wrapper">');

		for (let i = 0; i < serie.length; i++) {
			let buttonClass = "report-button";
			
			if (serie[i]["is_default"] && serie[i]["username"] === frappe.session.user && serie[i].is_global == 0) {
				buttonClass += " personal-default";
			}
			if (serie[i]["is_default"] && serie[i].is_global) {
				buttonClass += " global-default";
			}
			if (window.setreportname === serie[i]["sub_reportname"]) {
				buttonClass += " selected";
			}
			
			options.push(`
				<div class="report-button-container">
					<button type="button" 
						class="${buttonClass}"
						name="srpt" 
						id="${serie[i]["sub_reportname"]}" 
						onclick="setReport('${serie[i]["sub_reportname"]}')"
					>
						${serie[i]["sub_reportname"]}
						${serie[i]["is_default"] ? '<span class="default-badge">Default</span>' : ''}
						${serie[i].is_global ? '<span class="global-badge">Global</span>' : ''}
					</button>
				</div>
			`);
		}

		options.push('</div>');
		
		$('#ucrrpt').html(styleSheet + options.join('\n'));
	});
}

function removeStyle() {
	// debugger;
	for (let i = 0; i < ucrformats.length; i++) {
		if (ucrformats[i]["username"] == frappe.session.user && ucrformats[i]["is_default"] == 1 && ucrformats[i]["is_global"] == 0) {
			document.getElementById(ucrformats[i]["sub_reportname"]).style.backgroundColor = "#F9DDF5";
			document.getElementById(ucrformats[i]["sub_reportname"]).style.fontWeight = "normal"
			document.getElementById(ucrformats[i]["sub_reportname"]).style.border = "ipx solid"

		}
		else if (ucrformats[i]["is_default"] && ucrformats[i]["is_global"]) {
			document.getElementById(ucrformats[i]["sub_reportname"]).style.border = "ipx solid"
			document.getElementById(ucrformats[i]["sub_reportname"]).style.backgroundColor = "#FAF5B6";
			document.getElementById(ucrformats[i]["sub_reportname"]).style.fontWeight = "normal"
		}
		else {
			document.getElementById(ucrformats[i]["sub_reportname"]).removeAttribute("style");
		}
	};
}


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
			// else {
			// 	window.flexlickey = "Z7QJ-XI4B4B-1L066I-0G5Z58-6P0R34-103347-3R4Y0M-4T572L-6C1E16-5R6T"
			// }
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
			
			// Create base report configuration
			let baseConfig = {
				container: "pivotContainer",
				componentFolder: "https://cdn.flexmonster.com/",
				licenseKey: flexlickey,
				toolbar: true,
				beforetoolbarcreated: customizeToolbar,
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
			let pivot = new Flexmonster(baseConfig);

			// Add event listener for report complete
			pivot.on("reportcomplete", function() {
				if (rpt.options && rpt.options.viewType) {
					pivot.setViewType(rpt.options.viewType);
				}
				if (rpt.slice && rpt.slice.expandAll) {
					pivot.expandAllData();
				}
			});

			// Create report information object
			let reportInfo = {
				createdBy: selobj?.full_name || frappe.session.user,
				modifiedBy: selobj?.modified_by || frappe.session.user,
				modifiedDate: selobj?.modified ? frappe.datetime.str_to_user(selobj.modified) : frappe.datetime.now_datetime(),
				notes: selobj?.notes || 'You can add any Notes here..🙏🏻',
				isGlobal: selobj?.is_global,
				isDefault: selobj?.is_default
			};

			// Format the report information with modern styling
			let formattedInfo = `
				<div class="notes-panel" style="
					background: white;
					border-radius: 12px;
					box-shadow: 0 4px 12px rgba(0,0,0,0.1);
					margin: 20px 0;
					overflow: hidden;
					font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
				">
					<div class="notes-header" style="
						background: linear-gradient(135deg, #2490EF, #2080DF);
						color: white;
						padding: 15px 20px;
						font-size: 18px;
						font-weight: 500;
						display: flex;
						align-items: center;
						gap: 10px;
					">
						<i class="fa fa-info-circle"></i>
						Report Information: ${window.setreportname}
					</div>
					<div class="notes-content" style="padding: 20px;">
						<div class="metadata-section" style="
							background: #f8f9fa;
							border-radius: 8px;
							padding: 15px;
							margin-bottom: 15px;
						">
							<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
								<i class="fa fa-user" style="color: #2490EF;"></i>
								<span style="font-weight: 500;">Created By:</span>
								<span>${reportInfo.createdBy}</span>
							</div>
							<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
								<i class="fa fa-edit" style="color: #2490EF;"></i>
								<span style="font-weight: 500;">Modified By:</span>
								<span>${reportInfo.modifiedBy}</span>
							</div>
							<div style="display: flex; align-items: center; gap: 8px;">
								<i class="fa fa-clock-o" style="color: #2490EF;"></i>
								<span style="font-weight: 500;">Last Modified:</span>
								<span>${reportInfo.modifiedDate}</span>
							</div>
						</div>
						<div class="notes-section" style="
							background: #f8f9fa;
							border-radius: 8px;
							padding: 15px;
						">
							<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
								<i class="fa fa-sticky-note" style="color: #2490EF;"></i>
								<span style="font-weight: 500;">Notes:</span>
							</div>
							<div style="
								padding: 10px;
								background: white;
								border-radius: 6px;
								border-left: 3px solid #2490EF;
								line-height: 1.6;
							">${reportInfo.notes}</div>
						</div>
						<div class="status-section" style="
							display: flex;
							gap: 10px;
							margin-top: 15px;
						">
							${reportInfo.isGlobal ? `
								<div style="
									background: #2490EF;
									color: white;
									padding: 5px 10px;
									border-radius: 4px;
									font-size: 12px;
									display: flex;
									align-items: center;
									gap: 5px;
								">
									<i class="fa fa-globe"></i>
									Global Report
								</div>
							` : ''}
							${reportInfo.isDefault ? `
								<div style="
									background: #2490EF;
									color: white;
									padding: 5px 10px;
									border-radius: 4px;
									font-size: 12px;
									display: flex;
									align-items: center;
									gap: 5px;
								">
									<i class="fa fa-star"></i>
									Default Report
								</div>
							` : ''}
						</div>
					</div>
				</div>
			`;

			// Update the notes container with the formatted information
			let notesContainer = document.getElementById('notes-container');
			if (notesContainer) {
				notesContainer.innerHTML = formattedInfo;
			} else {
				notesContainer = document.createElement('div');
				notesContainer.id = 'notes-container';
				notesContainer.innerHTML = formattedInfo;
				document.getElementById('show_notes').parentNode.insertBefore(notesContainer, document.getElementById('show_notes'));
			}

			// Hide the original textarea
			document.getElementById('show_notes').style.display = 'none';

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

			unloadingicon();
			if (window.ucrformats.length > 0 && Object.keys(selobj).length !== 0) {
				$('.report-button').removeClass('selected');
				$(`#${window.setreportname}`).addClass('selected');
			}
		})
	});
}

function compareObjectsByArrayValues(obj1, obj2) {
	// Assuming both objects have the same keys
	for (let key in obj1) {
		if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
			// Convert arrays to strings and comcustom_note = window.ucrformats[0]?pare them
			if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
				return false;
			}
		} else {
			// If the values are not arrays, compare them directly
			if (obj1[key] !== obj2[key]) {
				return false;
			}
		}
	}
	// If all keys and their values (including arrays) match, the objects are equal
	return true;
}

function setReport(rptname) {
	if (typeof flexmonster == 'undefined') {
		window.setreportname = rptname;
		let a = cur_page.page.page.get_form_values();
		let data = { ...a, ...findValues() }
		localStorage.setItem("itemvalues", JSON.stringify(data));
		getapidata();
	}
	else {
		const formValues = { ...cur_page.page.page.get_form_values(), ...findValues() }
		const storedValues = JSON.parse(localStorage.getItem("itemvalues"));
		a = compareObjectsByArrayValues(formValues, storedValues);
		if (a == false) {
			window.setreportname = rptname;
			localStorage.setItem("itemvalues", JSON.stringify(formValues));
			getapidata();
		}
		else {
			window.setreportname = rptname;
			selobj = findNested(ucrformats, "sub_reportname", rptname);
			let nreport = flexmonster.getReport();

			var setfrmt = JSON.parse(selobj.report_format, function (key, val) {
				if (typeof val === "string" && val.indexOf('(function') === 0) {
					try {
						nreport.dataSource.data.forEach(eval(val));
						return val;
					} catch (error) {
						console.log(error);
					}
				} else {
					return val;
				}
			});
			Object.assign(nreport, setfrmt);
			flexmonster.setReport(nreport);

			// Create detailed report information
			let reportInfo = {
				createdBy: selobj?.full_name || frappe.session.user,
				modifiedBy: selobj?.modified_by || frappe.session.user,
				modifiedDate: selobj?.modified ? frappe.datetime.str_to_user(selobj.modified) : frappe.datetime.now_datetime(),
				notes: selobj?.notes || 'You can add any Notes here..🙏🏻',
				isGlobal: selobj?.is_global,
				isDefault: selobj?.is_default
			};

			// Format the report information with modern styling
			let formattedInfo = `
				<div class="notes-panel" style="
					background: white;
					border-radius: 12px;
					box-shadow: 0 4px 12px rgba(0,0,0,0.1);
					margin: 20px 0;
					overflow: hidden;
					font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
				">
					<div class="notes-header" style="
						background: linear-gradient(135deg, #2490EF, #2080DF);
						color: white;
						padding: 15px 20px;
						font-size: 18px;
						font-weight: 500;
						display: flex;
						align-items: center;
						gap: 10px;
					">
						<i class="fa fa-info-circle"></i>
						Report Information: ${rptname}
					</div>
					<div class="notes-content" style="padding: 20px;">
						<div class="metadata-section" style="
							background: #f8f9fa;
							border-radius: 8px;
							padding: 15px;
							margin-bottom: 15px;
						">
							<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
								<i class="fa fa-user" style="color: #2490EF;"></i>
								<span style="font-weight: 500;">Created By:</span>
								<span>${reportInfo.createdBy}</span>
							</div>
							<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
								<i class="fa fa-edit" style="color: #2490EF;"></i>
								<span style="font-weight: 500;">Modified By:</span>
								<span>${reportInfo.modifiedBy}</span>
							</div>
							<div style="display: flex; align-items: center; gap: 8px;">
								<i class="fa fa-clock-o" style="color: #2490EF;"></i>
								<span style="font-weight: 500;">Last Modified:</span>
								<span>${reportInfo.modifiedDate}</span>
							</div>
						</div>
						<div class="notes-section" style="
							background: #f8f9fa;
							border-radius: 8px;
							padding: 15px;
						">
							<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
								<i class="fa fa-sticky-note" style="color: #2490EF;"></i>
								<span style="font-weight: 500;">Notes:</span>
							</div>
							<div style="
								padding: 10px;
								background: white;
								border-radius: 6px;
								border-left: 3px solid #2490EF;
								line-height: 1.6;
							">${reportInfo.notes}</div>
						</div>
						<div class="status-section" style="
							display: flex;
							gap: 10px;
							margin-top: 15px;
						">
							${reportInfo.isGlobal ? `
								<div style="
									background: #2490EF;
									color: white;
									padding: 5px 10px;
									border-radius: 4px;
									font-size: 12px;
									display: flex;
									align-items: center;
									gap: 5px;
								">
									<i class="fa fa-globe"></i>
									Global Report
								</div>
							` : ''}
							${reportInfo.isDefault ? `
								<div style="
									background: #2490EF;
									color: white;
									padding: 5px 10px;
									border-radius: 4px;
									font-size: 12px;
									display: flex;
									align-items: center;
									gap: 5px;
								">
									<i class="fa fa-star"></i>
									Default Report
								</div>
							` : ''}
						</div>
					</div>
				</div>
			`;

			// Update the notes container with the formatted information
			let notesContainer = document.getElementById('notes-container');
			if (notesContainer) {
				notesContainer.innerHTML = formattedInfo;
			} else {
				notesContainer = document.createElement('div');
				notesContainer.id = 'notes-container';
				notesContainer.innerHTML = formattedInfo;
				document.getElementById('show_notes').parentNode.insertBefore(notesContainer, document.getElementById('show_notes'));
			}

			// Hide the original textarea
			document.getElementById('show_notes').style.display = 'none';

			// Update button styles
			$('.report-button').removeClass('selected');
			$(`#${rptname}`).addClass('selected');
		}
	}
}

function inscsrdata() {
    try {
        if (typeof flexmonster === 'undefined') {
            frappe.throw({
                title: 'Error',
                message: 'Please load a report first before trying to save.'
            });
            return;
        }
		debugger;

        let report = flexmonster.getReport();
        var bu = frappe.pages[Object.keys(frappe.pages)[0]].baseURI;
        let rpt = bu.substring(bu.lastIndexOf('/') + 1).trim();
        
        delete report.dataSource;
        let op = document.getElementById("output").value;
        if (op != "") {
            var tempinsdata = JSON.parse(op);
            report.spcustfn = tempinsdata.spcustfn;
        }
        var insdata = (JSON.stringify(report, null, 4));
        var usr = frappe.session.user;

        // Show the save dialog with modern styling
        let d = new frappe.ui.Dialog({
            title: __('<i class="fa fa-save"></i> Save Report As'),
            fields: [
                {
                    fieldname: 'report_info_section',
                    fieldtype: 'Section Break',
                    label: __('Report Information')
                },
                {
                    label: __('Report Name'),
                    fieldname: 'scrname',
                    fieldtype: 'Data',
                    reqd: 1,
                    description: __('Enter a name for your report'),
                    placeholder: __("MyCustomReport")
                },
                {
                    fieldtype: 'Column Break'
                },
                {
                    label: __('Created By'),
                    fieldname: 'created_by',
                    fieldtype: 'HTML',
                    options: `
                        <div style="padding: 8px 0;">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                <i class="fa fa-user" style="color: #2490EF;"></i>
                                <span>${frappe.session.user}</span>
                            </div>
                        </div>
                    `
                },
                {
                    fieldname: 'settings_section',
                    fieldtype: 'Section Break',
                    label: __('Report Settings')
                },
                {
                    label: __('Notes'),
                    fieldname: 'notes',
                    fieldtype: 'Text Editor',
                    reqd: 1,
                    description: __('Add description or important information about this report'),
                    placeholder: __("Enter report description and usage notes...")
                },
                {
                    fieldname: 'permissions_section',
                    fieldtype: 'Section Break',
                    label: __('Permissions')
                },
                {
                    label: __('Save as Global Report'),
                    fieldname: 'is_global',
                    fieldtype: 'Check',
                    default: 0,
                    description: __('Make this report available to all users')
                },
                {
                    label: __('Set as Default Report'),
                    fieldname: 'is_default',
                    fieldtype: 'Check',
                    default: 0,
                    description: __('Make this the default report view')
                }
            ],
            primary_action_label: __('Save Report'),
            primary_action: function(values) {
				debugger;
                // Show loading state
                // d.disable_primary_action();
                frappe.show_alert({
                    message: __('Saving report...'),
                    indicator: 'blue'
                });

                // First check user permissions
                frappe.call({
                    method: "vgjewellry.VG_api.ucr_custom",
                    args: { "usr": usr },
                    callback: function(res) {
						debugger;
                        if (values.is_global == 0) {
                            saveReport(values, false);
                        } else {
                            let isglobal = res?.message[0]?.is_global;
                            if (isglobal == 1) {
                                saveReport(values, true);
                            } else {
                                frappe.throw({
                                    title: __('Permission Denied'),
                                    message: __('You do not have permission to create global reports.')
                                });
                                d.enable_primary_action();
                            }
                        }
                    },
                    error: function(err) {
                        frappe.throw({
                            title: __('Error'),
                            message: __('Failed to verify permissions. Please try again.')
                        });
                        d.enable_primary_action();
                    }
                });

                function saveReport(values, isGlobal) {
                    let reportName = isGlobal ? 'G_' + values.scrname : values.scrname;
					debugger;
                    
                    frappe.call({
                        method: "vgjewellry.VG_api.UCR_Update_Insert_SubReport",
                        args: {
                            "usr": usr,
                            "rpt": rpt,
                            "cnt": insdata,
                            "srpt": reportName,
                            "notes": values.notes,
                            "isd": values.is_default,
                            "isg": isGlobal ? 1 : 0
                        },
                        callback: function(res) {
                            if (res.message) {
                                // Add to ucrformats array
                                ucrformats.push({
                                    "sub_reportname": reportName,
                                    report_format: insdata,
                                    is_global: isGlobal,
                                    is_default: values.is_default
                                });

                                // Show success message
                                frappe.show_alert({
                                    message: __('Report saved successfully'),
                                    indicator: 'green'
                                }, 5);

                                // Refresh the report list
                                getsrf();

                                // Close the dialog
                                d.hide();
                            } else {
                                frappe.throw({
                                    title: __('Error'),
                                    message: __('Failed to save report. Please try again.')
                                });
                            }
                            d.enable_primary_action();
                        },
                        error: function(err) {
                            frappe.throw({
                                title: __('Error'),
                                message: __('Failed to save report. Please try again.')
                            });
                            d.enable_primary_action();
                        }
                    });
                }
            }
        });

        // Add custom styling to the dialog
        d.$wrapper.find('.modal-dialog').css({
            'max-width': '600px'
        });

        d.$wrapper.find('.modal-content').css({
            'border-radius': '12px',
            'box-shadow': '0 5px 25px rgba(0,0,0,0.1)'
        });

        d.$wrapper.find('.modal-header').css({
            'background': 'linear-gradient(135deg, #2490EF, #2080DF)',
            'color': 'white',
            'border-top-left-radius': '12px',
            'border-top-right-radius': '12px',
            'padding': '15px 20px'
        });

        d.$wrapper.find('.modal-title').css({
            'color': 'white',
            'font-size': '18px',
            'font-weight': '500'
        });

        d.$wrapper.find('.modal-body').css({
            'padding': '20px'
        });

        d.$wrapper.find('.form-section').css({
            'background': '#f8f9fa',
            'border-radius': '8px',
            'padding': '15px',
            'margin-bottom': '20px'
        });

        d.$wrapper.find('.frappe-control').css({
            'margin-bottom': '15px'
        });

        // Show the dialog
        d.show();

    } catch (error) {
        frappe.throw({
            title: __('Error'),
            message: __('An unexpected error occurred: ') + error.message
        });
    }
}


function updateRepport() {
    let report = flexmonster.getReport();
    var bu = frappe.pages[Object.keys(frappe.pages)[0]].baseURI;
    let rpt = bu.substring(bu.lastIndexOf('/') + 1).trim();

    delete report.dataSource;
    let op = document.getElementById("output").value;
    if (op != "") {
        var tempinsdata = JSON.parse(op);
        report.spcustfn = tempinsdata.spcustfn;
    }
    var insdata = (JSON.stringify(report, null, 4));
    var usr = frappe.session.user;

    let update_rpt_data = findNested(ucrformats, "sub_reportname", window.setreportname);

    frappe.call({
        method: "vgjewellry.VG_api.ucr_custom",
        args: { "usr": usr },
        callback: function (res) {
            if (update_rpt_data.owner !== frappe.session.user) {
                frappe.throw({
                    title: __('Permission Denied'),
                    message: `
                        <div style="text-align: center; padding: 20px;">
                            <div style="color: #dc3545; font-size: 24px; margin-bottom: 15px;">
                                <i class="fa fa-exclamation-circle"></i>
                            </div>
                            <div style="font-size: 16px; margin-bottom: 15px;">
                                This report was created by <strong style="color: #dc3545;">${update_rpt_data.owner}</strong>
                            </div>
                            <div style="color: #666; font-size: 14px;">
                                You don't have permission to modify this report. Please contact the report owner.
                            </div>
                        </div>
                    `
                });
                return;
            }

            // Create a modern dialog for updating report
            let d = new frappe.ui.Dialog({
                title: __('<i class="fa fa-edit"></i> Update Report'),
                fields: [
                    {
                        fieldname: 'report_info_section',
                        fieldtype: 'Section Break',
                        label: __('Report Information')
                    },
                    {
                        label: __('Report Name'),
                        fieldname: 'scrname',
                        fieldtype: 'Data',
                        reqd: 1,
                        default: update_rpt_data.is_global ? update_rpt_data?.sub_reportname.substring(2) : update_rpt_data?.sub_reportname,
                        description: __('Enter a name for your report')
                    },
                    {
                        fieldtype: 'Column Break'
                    },
                    {
                        label: __('Created By'),
                        fieldname: 'created_by',
                        fieldtype: 'HTML',
                        options: `
                            <div style="padding: 8px 0;">
                                <div style="display: flex; align-items: center; gap: 8px;">
                                    <i class="fa fa-user" style="color: #4CAF50;"></i>
                                    <span>${update_rpt_data.owner || usr}</span>
                                </div>
                            </div>
                        `
                    },
                    {
                        fieldname: 'settings_section',
                        fieldtype: 'Section Break',
                        label: __('Report Settings')
                    },
                    {
                        label: __('Notes'),
                        fieldname: 'notes',
                        fieldtype: 'Text Editor',
                        reqd: 1,
                        default: update_rpt_data?.notes || "",
                        description: __('Add description or important information about this report')
                    },
                    {
                        fieldname: 'permissions_section',
                        fieldtype: 'Section Break',
                        label: __('Permissions')
                    },
                    {
                        label: __('Save as Global Report'),
                        fieldname: 'is_global',
                        fieldtype: 'Check',
                        default: update_rpt_data?.is_global || 0,
                        description: __('Make this report available to all users')
                    },
                    {
                        label: __('Set as Default Report'),
                        fieldname: 'is_default',
                        fieldtype: 'Check',
                        default: update_rpt_data?.is_default || 0,
                        description: __('Make this the default report view')
                    }
                ],
                primary_action_label: __('Update Report'),
                primary_action: function(values) {
                    // Show loading state
                    // d.disable_primary_action();
                    frappe.show_alert({
                        message: __('Updating report...'),
                        indicator: 'blue'
                    });

                    frappe.call({
                        method: "vgjewellry.VG_api.ucr_custom",
                        args: { "usr": usr },
                        callback: function(res) {
                            if (values.is_global == 0 || (values.is_global == 1 && res?.message[0]?.is_global == 1)) {
                                let reportName = values.is_global ? 'G_' + values.scrname : values.scrname;
                                
                                frappe.call({
                                    method: "vgjewellry.VG_api.UCR_Update_Insert_SubReport",
                                    args: {
                                        "usr": usr,
                                        "rpt": rpt,
                                        "cnt": insdata,
                                        "srpt": reportName,
                                        "notes": values.notes,
                                        "isd": values.is_default,
                                        "isg": values.is_global ? 1 : 0,
                                        'old_srpt': update_rpt_data?.sub_reportname
                                    },
                                    callback: function(r) {
                                        if (r.message) {
                                            frappe.show_alert({
                                                message: __('Report updated successfully'),
                                                indicator: 'green'
                                            }, 5);
                                            
                                            // Refresh the report list
                                            getsrf();
                                            
                                            d.hide();
                                        } else {
                                            frappe.throw({
                                                title: __('Error'),
                                                message: __('Failed to update report. Please try again.')
                                            });
                                        }
                                        d.enable_primary_action();
                                    },
                                    error: function(err) {
                                        frappe.throw({
                                            title: __('Error'),
                                            message: __('Failed to update report. Please try again.')
                                        });
                                        d.enable_primary_action();
                                    }
                                });
                            } else {
                                frappe.throw({
                                    title: __('Permission Denied'),
                                    message: __('You do not have permission to create global reports.')
                                });
                                d.enable_primary_action();
                            }
                        },
                        error: function(err) {
                            frappe.throw({
                                title: __('Error'),
                                message: __('Failed to verify permissions. Please try again.')
                            });
                            d.enable_primary_action();
                        }
                    });
                }
            });

            // Add custom styling to the dialog
            d.$wrapper.find('.modal-dialog').css({
                'max-width': '600px'
            });

            d.$wrapper.find('.modal-content').css({
                'border-radius': '12px',
                'box-shadow': '0 5px 25px rgba(0,0,0,0.1)'
            });

            d.$wrapper.find('.modal-header').css({
                'background': 'linear-gradient(135deg, #4CAF50, #45a049)',
                'color': 'white',
                'border-top-left-radius': '12px',
                'border-top-right-radius': '12px',
                'padding': '15px 20px'
            });

            d.$wrapper.find('.modal-title').css({
                'color': 'white',
                'font-size': '18px',
                'font-weight': '500'
            });

            d.$wrapper.find('.modal-body').css({
                'padding': '20px'
            });

            d.$wrapper.find('.form-section').css({
                'background': '#f8f9fa',
                'border-radius': '8px',
                'padding': '15px',
                'margin-bottom': '20px'
            });

            d.$wrapper.find('.frappe-control').css({
                'margin-bottom': '15px'
            });

            // Show the dialog
            d.show();
        }
    });
}


function findNested(obj, key, value) {
	// Base case
	// debugger;
	if (obj[key] === value) {
		return obj;
	} else {
		for (var i = 0, len = Object.keys(obj).length; i < len; i++) {
			if (typeof obj[i] == 'object') {
				var found = this.findNested(obj[i], key, value);
				if (found) {
					// If the object was found in the recursive call, bubble it up.
					return found;
				}
			}
		}
	}
}


function custgetReport() {
	// debugger;
	var usr = frappe.session.user;
	//   
	// debugger;
	frappe.call({
		method: "vgjewellry.VG_api.ucr_custom",
		args: { "usr": usr },
		callback: function (r) {
			//   
			try {

				isglobal = r.message[0].is_global;

				if (isglobal == '1') {
					// document.getElementById("Btn1").value="Preview";
					// document.getElementById("Btn1").setAttribute("onClick","custsetReport()");
					// $('#Btn1').after('<input type="button" name="custbutton" value="Preview" onclick="custsetReport()" id="PrevBtn" style="margin: 5px; padding: 0px;"></input>')
					let report = flexmonster.getReport();
					debugger;
					// drashti.....

					// if('mapping' in report.dataSource){
					// 	samglob.mapping=report.dataSource.mapping;
					// 	console.log(report.dataSource.mapping);
					// }
					samglob.mapping = { "FieldName": { type: "FieldType" } };

					let reportop = report;
					delete reportop.dataSource;

					try {
						debugger;
						selobj = JSON.parse(findNested(ucrformats, "sub_reportname", setreportname).report_format);
						// selobj.mapping = samglob.mapping
						selobj.dataSource = {};
						selobj.dataSource.mapping = samglob.mapping
						var setfrmt = selobj;
						debugger;
						reportop.dataSource = {};
						reportop.dataSource.mapping = setfrmt.dataSource.mapping;
						reportop.spcustfn = setfrmt.spcustfn;
					} catch (error) {
						console.log(error);
					}
					// debugger;
					showOutput(JSON.stringify(reportop, null, 4), "output");
				} else {
					frappe.msgprint(__(`You Don't have right to Customize the Format`));
				}
			} catch (error) {
				frappe.msgprint(__(`You Don't have right to Customize the Format`));
			}
		}
	});
}


function custsetReport() { 
	//   
	// debugger;
	let nreport = flexmonster.getReport();
	let getsourcedata = nreport.dataSource.data
	// var setfrmt = JSON.parse(document.getElementById("output").innerText,function(key,val){
	var setfrmt = JSON.parse(document.getElementById("output").value, function (key, val) {
		// debugger;
		if (typeof val === "string" && val.indexOf('(function') === 0) {
			try {
				// nreport.dataSource.data.forEach(eval(setfrmt.spcustfn.calfield))
				//   
				nreport.dataSource.data.forEach(eval(val));
				return val;
			} catch (error) {
				console.log(error);
			}
		} else {
			return val;
		};
		if (key === "input_data_mapping") {
			console.log("input_data_mapping");
		}
	});
	Object.assign(nreport, setfrmt);
	nreport.dataSource.data = getsourcedata;
	flexmonster.setReport(nreport);
	// debugger;
	let nreportop = nreport;
	var find_mapping = nreport.dataSource.mapping;

	debugger;
	//  first wayyyyyyy
	// Iterate over the keys and values in the `mapping` object
	//    Object.keys(find_mapping).forEach(key => {
	//     let type = find_mapping[key].type || 'undefined';
	//     console.log(`value = ${key} and type = ${type}`);
	// 	if(key =="FieldName" || type=="FieldType"){
	// 			delete nreportop.dataSource;
	// 	}
	//     });
	// second wayyyyy
	// for (var key in find_mapping) {
	// 	if (find_mapping.hasOwnProperty(key)) {
	// 		var value = find_mapping[key];

	// 		// Extract the type property if it exists
	// 		var type = value.type || 'undefined';

	// 		// Format and print the desired output
	// 		console.log("value =", key, "and type =", type);
	// 		if(value=="FieldName" || type=="FieldType"){
	// 			delete nreportop.dataSource;
	// 		}
	// 	}
	// 	// else{
	// 	// 	delete nreportop.dataSource.data;
	// 	// }
	// }
	// third wayyy..
	debugger;
	var get_mapping = removeFieldsFromMapping(find_mapping, "FieldName", "FieldType");
	console.log(get_mapping);
	if (Object.keys(get_mapping).length === 0) {
		delete nreportop.dataSource;
	}





	if (nreportop.dataSource) {
		delete nreportop.dataSource.data;
	}

	debugger;
	showOutput(JSON.stringify(nreportop, null, 4), "output");
}

function removeFieldsFromMapping(mapping, targetKey, targetType) {
	for (const key in mapping) {
		if (mapping[key].type === targetType || key === targetKey) {
			delete mapping[key];
		}
	}
	return mapping;
}


// function showOutput(content) {
// 	// document.getElementById("output").innerText = content;
// 	let outelem = document.getElementById("output")
// 	outelem.value = content;
// 	outelem.removeAttribute("hidden");
// }

function showOutput(content, eleId) {
    if (eleId === "show_notes") {
        // Create or get the notes container
        let notesContainer = document.getElementById('notes-container');
        if (!notesContainer) {
            notesContainer = document.createElement('div');
            notesContainer.id = 'notes-container';
            document.getElementById(eleId).parentNode.insertBefore(notesContainer, document.getElementById(eleId));
        }

        // Format the content to ensure line breaks
        let formattedContent = content.replace(/\n\n/g, '\n').replace(/Modified By:/g, '\nModified By:').replace(/Modified Date:/g, '\nModified Date:');
        
        // Parse the content to separate different parts
        const lines = formattedContent.split('\n');
        let createdBy = '';
        let modifiedBy = '';
        let modifiedDate = '';
        let notes = '';

        lines.forEach(line => {
            if (line.startsWith('Created By:')) createdBy = line;
            else if (line.startsWith('Modified By:')) modifiedBy = line;
            else if (line.startsWith('Modified Date:')) modifiedDate = line;
            else if (line.startsWith('Notes:')) notes = line;
            else if (line.includes('You can add any Notes here')) notes = 'Notes: ' + line;
        });

        // Create the HTML structure with modern styling
        notesContainer.innerHTML = `
            <div class="notes-panel" style="
                background: white;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                margin: 20px 0;
                overflow: hidden;
                font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            ">
                <div class="notes-header" style="
                    background: linear-gradient(135deg, #4CAF50, #45a049);
                    color: white;
                    padding: 15px 20px;
                    font-size: 18px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                ">
                    <i class="fa fa-sticky-note" style="font-size: 20px;"></i>
                    Report Information
                </div>
                <div class="notes-content" style="padding: 20px;">
                    <div class="metadata-text" style="
                        background: #f8f9fa;
                        border-radius: 8px;
                        padding: 15px;
                        color: #333;
                        line-height: 2;
                        font-size: 14px;
                        border-left: 4px solid #4CAF50;
                        white-space: pre-line;
                        font-family: monospace;
                    ">
${createdBy}
${modifiedBy}
${modifiedDate}</div>

                    ${notes ? `
                        <div class="notes-text" style="
                            background: #f8f9fa;
                            border-radius: 8px;
                            padding: 15px;
                            color: #333;
                            line-height: 1.6;
                            font-size: 14px;
                            border-left: 4px solid #4CAF50;
                            margin-top: 15px;
                        ">
                            ${notes}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Hide the original textarea
        document.getElementById(eleId).style.display = 'none';
    } else {
        // For non-notes content (like output), use the original behavior
        let outelem = document.getElementById(eleId);
        outelem.value = content;
        outelem.removeAttribute("hidden");
    }
}



function delgetReport() {
	var usr = frappe.session.user;
	var bu = frappe.pages[Object.keys(frappe.pages)[0]].baseURI;
	let rpt = bu.substring(bu.lastIndexOf('/') + 1).trim();

	frappe.call({
		method: "vgjewellry.VG_api.ucr_userwisefetch",
		args: { "usr": usr, "rpt": rpt },
		callback: function (res) {
			var options = [];
			
			// Add delete section header
			options.push(`
				<div class="delete-section" style="
					margin: 15px 0;
					padding: 15px;
					background: #fff;
					border-radius: 8px;
					box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
					<div style="
						display: flex;
						justify-content: space-between;
						align-items: center;
						font-size: 16px;
						color: #333;
						margin-bottom: 10px;
						padding-bottom: 10px;
						border-bottom: 1px solid #eee;">
						<div>🗑️ Select Report to Delete</div>
						<button onclick="closeDeletePrompt()" style="
							background: none;
							border: none;
							padding: 5px 10px;
							cursor: pointer;
							color: #666;
							font-size: 13px;
							border-radius: 4px;
							transition: all 0.2s ease;
						"
						onmouseover="this.style.backgroundColor='#f8f9fa'"
						onmouseout="this.style.backgroundColor='transparent'">
							Cancel
						</button>
					</div>
					<div class="delete-buttons-container" style="
						display: flex;
						flex-wrap: wrap;
						gap: 10px;">
			`);

			for (let i = 0; i < res.message.length; i++) {
				const report = res.message[i];
				const isGlobal = report.is_global;
				const isDefault = report.is_default;
				
				options.push(`
					<button 
						type="button"
						class="delete-report-btn"
						style="
							padding: 8px 16px;
							border: none;
							border-radius: 6px;
							background: #fff;
							color: #dc3545;
							cursor: pointer;
							font-size: 13px;
							display: inline-flex;
							align-items: center;
							gap: 8px;
							box-shadow: 0 2px 4px rgba(220,53,69,0.1);
							border: 1px solid #dc3545;
							transition: all 0.2s ease;
							margin: 4px;
						"
						onmouseover="this.style.backgroundColor='#dc3545'; this.style.color='#fff'"
						onmouseout="this.style.backgroundColor='#fff'; this.style.color='#dc3545'"
						name="del${report["sub_reportname"]}"
						onclick="delReport('${report["sub_reportname"]}')"
					>
						<i class="fa fa-trash-o" style="font-size: 14px;"></i>
						${report["sub_reportname"]}
						${isDefault ? '<span style="background: #28a745; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 4px;">Default</span>' : ''}
						${isGlobal ? '<span style="background: #007bff; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 4px;">Global</span>' : ''}
					</button>
				`);
			}

			options.push(`
					</div>
				</div>
			`);
			
			// Remove any existing delete section
			$('.delete-section').remove();
			
			// Add the new delete section after the custombutton
			$('#custombutton').after(options.join(''));
		}
	});
}

// Add function to close delete prompt
function closeDeletePrompt() {
	$('.delete-section').fadeOut(200, function() {
		$(this).remove();
	});
}

function delReport(rptname) {
	var usr = frappe.session.user;
	var bu = frappe.pages[Object.keys(frappe.pages)[0]].baseURI;
	let rpt = bu.substring(bu.lastIndexOf('/') + 1).trim();

	selobj = findNested(ucrformats, "sub_reportname", rptname);
	srn = selobj.sub_reportname;

	const dialogContent = `
		<div style="text-align: center; padding: 20px;">
			<div style="margin-bottom: 20px;">
				<i class="fa fa-exclamation-triangle" style="font-size: 48px; color: #ff5555;"></i>
			</div>
			<div style="font-size: 18px; margin-bottom: 15px; color: #333;">
				Are you sure you want to delete this report?
			</div>
			<div style="font-size: 20px; font-weight: bold; color: #ff5555; margin-bottom: 20px; 
						padding: 10px; background: #fff5f5; border-radius: 8px; border: 1px solid #ffdddd;">
				"${rptname}"
			</div>
			<div style="font-size: 14px; color: #666; margin-bottom: 20px; 
						padding: 10px; background: #f8f9fa; border-radius: 4px;">
				⚠️ This action cannot be undone. The report will be permanently deleted.
			</div>
		</div>
	`;

	frappe.confirm(dialogContent, 
		// On Yes
		() => {
			// Create a loading dialog that will auto-close
			let loadingDialog = frappe.msgprint({
				title: __('Deleting Report'),
				indicator: 'blue',
				message: __('Please wait while the report is being deleted...'),
			});

			// Set a timeout to auto-close the dialog after 3 seconds
			setTimeout(() => {
				loadingDialog.hide();
			}, 3000);
			
			frappe.call({
				method: "vgjewellry.VG_api.ucr_delete",
				args: { 
					"usr": usr, 
					"rpt": rpt, 
					"srn": srn 
				},
				callback: function(res) {
					// Hide the loading dialog immediately when we get the response
					loadingDialog.hide();
					
					if (res.message) {
						// Show success message with animation
						frappe.show_alert({
							message: `
								<div style="display: flex; align-items: center;">
									<i class="fa fa-check-circle" style="font-size: 20px; color: #28a745; margin-right: 10px;"></i>
									<div>
										<div style="font-weight: bold;">Report Deleted Successfully</div>
										<div style="font-size: 12px;">${rptname} has been removed</div>
									</div>
								</div>
							`,
							indicator: 'green'
						}, 3);

						// Remove both the delete button and the report button with animation
						$(`.delete-report-btn[name="del${srn}"]`).fadeOut(400, function() {
							$(this).remove();
						});

						$(`#${srn}`).closest('.report-button-container').fadeOut(400, function() {
							$(this).remove();
						});

						// Refresh the report list after a short delay
						setTimeout(() => {
							getsrf();
						}, 500);
					} else {
						frappe.throw(__("Failed to delete report. Please try again."));
					}
				},
				error: function(err) {
					loadingDialog.hide();
					frappe.throw(__("An error occurred while deleting the report."));
				}
			});
		},
		// On No
		() => {
			// Do nothing
		}
	);
}


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


function adduioptn(classnm, name, rval) {
	// debugger;
	if (rval === "checkbox") {
		let chkboxopt = `
			<select name="cvco" class="${classnm}" onchange="adduioptn(this.className,this.name,this.value)">
				<option value="=" >Equal to = </option>
				</select>
			`
		// document.getElementsByClassName('seloptn')[0].children.cvco.remove()
		$('[name="cvco"][class="' + classnm + '"]')[0].remove()
		$('[name="scn"][class="' + classnm + '"]').after(chkboxopt)
		// $('.seloptn').append(chkboxopt);
	};
	let selcvco = $('[name="cvco"][class="' + classnm + '"]')[0].value
	let scndatatype = $('[name="scn"][class="' + classnm + '"]')[0].value
	if (typeof ($('[name="uip"][class="' + classnm + 'c0"]')[0]) == 'undefined') {
		if (selcvco == "between") {
			$('[name="cvco"][class="' + classnm + '"]').after('<input type="' + scndatatype + '" name="uip" class="' + classnm + 'c0">');
			$('[name="uip"][class="' + classnm + 'c0"]').after('<input type="' + scndatatype + '" name="uip" class="' + classnm + 'c1">');
		} else {
			$('[name="cvco"][class="' + classnm + '"]').after('<input type="' + scndatatype + '" name="uip" class="' + classnm + 'c0">');
			$('[name="uip"][class="' + classnm + 'c1"]').hide();
		}
	} else {
		if (selcvco == "between") {
			$('[name="uip"][class="' + classnm + 'c0"]').replaceWith('<input type="' + scndatatype + '" name="uip" class="' + classnm + 'c0">');
			if (typeof ($('[name="uip"][class="' + classnm + 'c1"]')[0]) == 'undefined') {
				$('[name="uip"][class="' + classnm + 'c0"]').after('<input type="' + scndatatype + '" name="uip" class="' + classnm + 'c1">');
			} else {
				$('[name="uip"][class="' + classnm + 'c1"]').replaceWith('<input type="' + scndatatype + '" name="uip" class="' + classnm + 'c1">');
			}
		} else {
			$('[name="uip"][class="' + classnm + 'c0"]').replaceWith('<input type="' + scndatatype + '" name="uip" class="' + classnm + 'c0">');
			$('[name="uip"][class="' + classnm + 'c1"]').hide();
		}
	}
	// $('[name="uisor'+0+'"]').replaceWith('<input type="date" name="uisor0">')	
	console.log(classnm, name, rval);
};

function defval(clmnm, cvconm) {
	// debugger;
	return clmnm, cvconm
}

function get_search() {
	// debugger;
	const searchVal = document.getElementById('input-field')
	if (searchVal.value != null && searchVal.value != '') {
		setReport(searchVal.value)
	} else {
		frappe.throw("Please provide a search report name")
	}
	searchVal.value = '';
}

function showSuggestions() {
	const inputField = document.getElementById('input-field');
	const suggestionList = document.getElementById('suggestion-list');
	const inputValue = inputField.value.toLowerCase();
	
	// Clear previous suggestions
	suggestionList.innerHTML = '';

	// Filter suggestions based on user input
	const filteredSuggestions = window.ucrformats.filter(suggestion =>
		suggestion.sub_reportname.toLowerCase().includes(inputValue)
	);

	// Display suggestions
	if (filteredSuggestions.length > 0) {
		filteredSuggestions.forEach(suggestion => {
			const listItem = document.createElement('li');
			listItem.textContent = suggestion.sub_reportname;
			listItem.style.padding = '10px 12px';
			listItem.style.cursor = 'pointer';
			listItem.style.borderBottom = '1px solid #f0f0f0';
			listItem.style.transition = 'all 0.2s ease';

			// Add hover effect
			listItem.addEventListener("mouseover", (e) => {
				e.target.style.backgroundColor = "#f5f5f5";
			});
			listItem.addEventListener("mouseout", (e) => {
				if (!e.target.classList.contains('selected')) {
					e.target.style.backgroundColor = "white";
				}
			});

			// Add click handler
			listItem.addEventListener('click', () => {
				inputField.value = suggestion.sub_reportname;
				suggestionList.style.display = 'none';
				get_search(); // Automatically search when an item is selected
			});

			suggestionList.appendChild(listItem);
		});

		suggestionList.style.display = 'block';
	} else {
		suggestionList.style.display = 'none';
	}
}

function findValues() {
	// debugger;
	let inputs = document.getElementsByName('di');
	const obj = {}

	inputs.forEach(ele => {
		obj[ele.id] = ele.value
	});

	return obj
}


function customizeToolbar(toolbar) {
	// debugger
    let originalGetTabs = toolbar.getTabs;

    toolbar.getTabs = function () {
        let tabs = originalGetTabs.call(this);

        tabs.splice(7, 0, {
            id: "fm-tab-newtab",
            title: "Custom Action",
            handler: customButtonHandler,
            icon: customIcon,
        });

        return tabs;
    };

    let customIcon = 
    `<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="40px" height="40px" viewBox="-10 0 120 120">
        <path id="XMLID_1120_" fill="#008000" d="M90,6l0,20c0,2.2-1.8,4-4,4l0,0c-2.2,0-4-1.8-4-4V15.7L58.8,38.9c-0.8,0.8-1.8,1.2-2.8,1.2
        c-1,0-2-0.4-2.8-1.2c-1.6-1.6-1.6-4.1,0-5.7L76.3,10H66c-2.2,0-4-1.8-4-4c0-2.2,1.8-4,4-4h20c1.1,0,2.1,0.4,2.8,1.2
        C89.6,3.9,90,4.9,90,6z M86,62c-2.2,0-4,1.8-4,4v10.3L59.2,53.7c-1.6-1.6-4.2-1.6-5.8,0c-1.6,1.6-1.6,4.1-0.1,5.7L75.9,82H65.6
        c0,0,0,0,0,0c-2.2,0-4,1.8-4,4s1.8,4,4,4l20,0l0,0c1.1,0,2.3-0.4,3-1.2c0.8-0.8,1.4-1.8,1.4-2.8V66C90,63.8,88.2,62,86,62z
        M32.8,53.5L10,76.3V66c0-2.2-1.8-4-4-4h0c-2.2,0-4,1.8-4,4l0,20c0,1.1,0.4,2.1,1.2,2.8C4,89.6,5,90,6.1,90h20c2.2,0,4-1.8,4-4
        c0-2.2-1.8-4-4-4H15.7l22.8-22.8c1.6-1.6,1.5-4.1,0-5.7C37,51.9,34.4,51.9,32.8,53.5z M15.7,10.4l10.3,0h0c2.2,0,4-1.8,4-4
        s-1.8-4-4-4l-20,0h0c-1.1,0-2.1,0.4-2.8,1.2C2.4,4.3,2,5.3,2,6.4l0,20c0,2.2,1.8,4,4,4c2.2,0,4-1.8,4-4V16l23.1,23.1
        c0.8,0.8,1.8,1.2,2.8,1.2c1,0,2-0.4,2.8-1.2c1.6-1.6,1.6-4.1,0-5.7L15.7,10.4z" />
    </svg>`;

    function customButtonHandler() {
        const report = flexmonster.getReport();

        // Convert all column fields into rows
        report.slice.columns.forEach((columnField) => {
            report.slice.rows.push(columnField);
        });
        report.slice.columns = [];
        flexmonster.setReport(report);

        // // Expand all data
        // flexmonster.expandAllData();
		
        // // Apply custom cell function to repeat labels 
        // flexmonster.customizeCell(customizeCellFunction);


        // // Apply average aggregation on specific fields
        applyAverageAggregation(report);

        // // Export data
        // flexmonster.exportTo("csv", {
        //     filename: "exported_data",
        // });

        // // Reload the updated report
        // flexmonster.setReport(report);



		 // Use setTimeout to ensure expandAllData is called after the report is set
		 setTimeout(() => {
			// First, expand all data
			flexmonster.expandAllData();
	
			// After expanding all data, apply the custom cell function to repeat labels
			setTimeout(() => {
				flexmonster.customizeCell(customizeCellFunction);
	
				// Export data
				flexmonster.exportTo("csv", {
					filename: "exported_data",
				});
	
				// Reload the updated report
				flexmonster.setReport(report);
			}, 50); // Adjust this delay if needed
		}); // Adjust this delay if needed
    }
	
    // Define the function to repeat labels (custom cell function)
    function customizeCellFunction(cell, data) {
		// debugger
        if (data.type == "header" && data.hierarchy && data.hierarchy.caption !== 'All' && data.label === "") {
            cell.text = "&nbsp;&nbsp;&nbsp;&nbsp;" + data.member.caption;
        }

		// if (data.type === "value" && data.isDrillThrough) {
        //     // Calculate average if the cell is part of the detailed view
        //     let average = calculateAverage(data.data);
        //     cell.text = average.toFixed(2); //  Display average with two decimal places
        // }
    }

    function applyAverageAggregation(report) {
        report.slice.measures.forEach((measure) => {
            measure.aggregation = "average";
        });
        flexmonster.setReport(report);
    }
}

// function calculateAverage(values) {
//     let sum = values.reduce((acc, val) => acc + val, 0);
//     return values.length > 0 ? sum / values.length : 0;
// }
