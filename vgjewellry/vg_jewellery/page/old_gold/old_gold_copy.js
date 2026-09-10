frappe.provide("vg.old_gold");

frappe.pages["old-gold"].on_page_load = function (wrapper) {
	new OldGold(wrapper);
};


class OldGold {

	constructor(wrapper) {

		this.wrapper = $(wrapper);

		this.page = frappe.ui.make_app_page({
			parent: wrapper,
			title: "Old Gold",
			single_column: true
		});

		this.voucher_list = {};
		this.voucher_items = [];

		this.make_html();
		this.bind_events();
	}


	// ---------------------------------------------------------
	// CREATE HTML
	// ---------------------------------------------------------
	make_html() {

		this.wrapper.find(".layout-main-section").html(`

	    <div class="old-gold-container">

		<div class="row">

		    <!-- METAL -->
		    <div class="col-md-3">
			<div class="form-group">

			    <label>Metal</label>

			    <select
				class="form-control"
				id="metal"
			    >
				<option value="">Select Metal</option>
				<option value="Gold">Gold</option>
				<option value="Diamond">Diamond</option>
				<option value="Silver">Silver</option>
				<option value="Platinum">Platinum</option>
			    </select>

			</div>
		    </div>


		    <!-- VOUCHER DATE -->
		    <div class="col-md-3">
			<div class="form-group">

			    <label>Voucher Date</label>

			    <input
				type="date"
				class="form-control"
				id="voucher_date"
			    >

			</div>
		    </div>


		    <!-- VOUCHER NO -->
		    <div class="col-md-6">

			<div class="form-group">

			    <label>Voucher No</label>

			    <div class="voucher-autocomplete">

				<input
				    type="text"
				    class="form-control"
				    id="voucher_no"
				    placeholder="Search Voucher No"
				    autocomplete="off"
				>

				<div
				    id="voucher_suggestions"
				    class="voucher-suggestions"
				></div>

			    </div>

			</div>

		    </div>

		</div>


		<!-- DETAILS -->
		<div id="voucher_details"></div>

	    </div>

	`);


		this.metal =
			this.wrapper.find("#metal");

		this.voucher_date =
			this.wrapper.find("#voucher_date");

		this.voucher_no =
			this.wrapper.find("#voucher_no");

		this.suggestions =
			this.wrapper.find("#voucher_suggestions");

		this.voucher_details =
			this.wrapper.find("#voucher_details");
	}


	// ---------------------------------------------------------
	// EVENTS
	// ---------------------------------------------------------
	bind_events() {

		const me = this;


		// -----------------------------------------------------
		// METAL CHANGE
		// -----------------------------------------------------
		this.metal.on("change", function () {

			me.load_vouchers();

		});


		// -----------------------------------------------------
		// VOUCHER DATE CHANGE
		// -----------------------------------------------------
		this.voucher_date.on("change", function () {

			me.load_vouchers();

		});


		// -----------------------------------------------------
		// VOUCHER AUTOCOMPLETE
		// -----------------------------------------------------
		this.voucher_no.on("input", function () {

			me.show_voucher_suggestions(
				$(this).val()
			);

		});


		// -----------------------------------------------------
		// CLICK OUTSIDE AUTOCOMPLETE
		// -----------------------------------------------------
		$(document).on(
			"click.old_gold",
			function (e) {

				if (
					!$(e.target).closest(
						".voucher-autocomplete"
					).length
				) {

					me.suggestions.empty();

				}

			}
		);

	}


	// ---------------------------------------------------------
	// LOAD VOUCHERS
	// ---------------------------------------------------------
	load_vouchers() {

		const me = this;

		const metal =
			this.metal.val();

		const voucher_date = this.voucher_date.val();


		// Reset
		this.voucher_list = {};
		this.voucher_items = [];

		this.voucher_no.val("");

		this.suggestions.empty();

		this.voucher_details.empty();


		// Both required
		if (!metal || !voucher_date) {
			return;
		}


		frappe.call({

			method:
			"vgjewellry.vg_jewellery.page.old_gold.old_gold.get_vouchers",

			args: {
				metal: metal,
				voucher_date: voucher_date
			},

			freeze: true,

			freeze_message:
			"Loading vouchers...",

			callback: function (r) {

				if (r.message) {

					me.voucher_list =
						r.message;

				}

				console.log(
					"Voucher List:",
					me.voucher_list
				);

			}

		});

	}


	// ---------------------------------------------------------
	// SHOW VOUCHER SUGGESTIONS
	// ---------------------------------------------------------
	show_voucher_suggestions(search) {

		const me = this;

		search = String(search || "")
			.trim()
			.toLowerCase();


		this.suggestions.empty();


		if (!search) {
			return;
		}


		Object.entries(this.voucher_list).forEach(
			function ([original_voucher, display_voucher]) {

				display_voucher =
					String(display_voucher || "");


				if (
					display_voucher
					.toLowerCase()
					.includes(search)
				) {

					const item = $(`
			<div class="voucher-suggestion">
			    ${frappe.utils.escape_html(
				    display_voucher
			    )}
			</div>
		    `);


					item.on("click", function () {

						// Display cleaned voucher
						me.voucher_no.val(
							display_voucher
						);


						// Hide suggestions
						me.suggestions.empty();


						// Pass ORIGINAL voucher to Python
						me.load_voucher_details(
							original_voucher
						);

					});


					me.suggestions.append(item);

				}

			}
		);

	}


	// ---------------------------------------------------------
	// LOAD VOUCHER DETAILS
	// ---------------------------------------------------------
	load_voucher_details(voucher_no) {

		const me = this;


		if (!voucher_no) {
			return;
		}
		const voucher_date = this.voucher_date.val();

		frappe.call({

			method:
			"vgjewellry.vg_jewellery.page.old_gold.old_gold.get_voucher_details",

			args: {
				voucher_no: voucher_no,
				voucher_date : voucher_date    
			},

			freeze: true,

			freeze_message:
			"Loading voucher details...",

			callback: function (r) {

				if (
					!r.message ||
					!Array.isArray(r.message) ||
					!r.message.length
				) {

					me.voucher_items = [];

					me.voucher_details.html(`
			<div class="alert alert-warning">
			    No voucher details found.
			</div>
		    `);

					return;
				}


				// IMPORTANT
				// Store rows for calculations
				me.voucher_items =
					r.message;


				console.log(
					"Voucher Details:",
					me.voucher_items
				);


				me.render_voucher_details(
					me.voucher_items
				);

			}

		});

	}


	// ---------------------------------------------------------
	// RENDER DETAILS
	// ---------------------------------------------------------
	render_voucher_details(data) {

		const me = this;


		// IMPORTANT
		// Always keep the current rows available
		this.voucher_items =
			Array.isArray(data)
			? data
			: [];


		const rows =
			this.voucher_items;


		if (!rows.length) {

			this.voucher_details.html(`
		<div class="alert alert-warning">
		    No voucher details found.
		</div>
	    `);

			return;
		}


		let html = `
	    <div class="melting-container">
	`;


		rows.forEach((row, index) => {

			const melting_weight =
				row.melting_weight !== undefined &&
				row.melting_weight !== null
				? row.melting_weight
				: "";


			const remark =
				row.remark || "";


			html += `

		<div class="melting-card"
		     data-index="${index}">

		    <!-- ====================================
			 ITEM HEADER
		    ===================================== -->

		    <div class="melting-item-header">

			<div class="melting-item-name">
			    ${frappe.utils.escape_html(row.item_name || "" )}  

			    <span style="margin-left:30px ;margin-right:30px"> Vou No: ${frappe.utils.escape_html(row.VouNo || "" )}  </span>
			    <span> Vou Date: ${frappe.utils.escape_html(row.VouDate || "" )}  </span>
			</div>

			<div class="melting-status">
			    ${frappe.utils.escape_html(
				    row.melt_status || ""
			    )}
			</div>

		    </div>


		    <!-- ====================================
			 BASIC DETAILS
		    ===================================== -->

		    <div class="melting-grid">

			<div class="melting-field">
			    <label>Net Wt.</label>
			    <span>
				${this.format_number(
					row.net_wt
				)}
			    </span>
			</div>


			<div class="melting-field">
			    <label>Metal Amt.</label>
			    <span>
				${this.format_number(
					row.metal_amt
				)}
			    </span>
			</div>


			<div class="melting-field">
			    <label>Sales Vou. No.</label>
			    <span>
				${frappe.utils.escape_html(
					row.sales_vou_no || ""
				)}
			    </span>
			</div>


			<div class="melting-field">
			    <label>916 Rate</label>
			    <span>
				${this.format_number(
					row.rate_916
				)}
			    </span>
			</div>


			<div class="melting-field">
			    <label>999 Rate</label>
			    <span>
				${this.format_number(
					row.rate_999
				)}
			    </span>
			</div>


			<div class="melting-field">
			    <label>Purity</label>
			    <span>
				${this.format_number(
					row.purity
				)}
			    </span>
			</div>


			<div class="melting-field">
			    <label>Fine Wt.</label>
			    <span>
				${this.format_number(
					row.fine_wt
				)}
			    </span>
			</div>

		    </div>


		    <!-- ====================================
			 MELTING CALCULATION
		    ===================================== -->

		    <div class="melting-grid melting-calculation">

			<div class="melting-field">
			    <label>
				Before Avg Purity %
			    </label>

			    <span>
				${this.format_number(
					row.before_weighted_avg_purity
				)}
			    </span>
			</div>


			<!-- MELTING WEIGHT INPUT -->

			<div class="melting-field melting-input-field">

			    <label>
				Melting Weight
			    </label>

			    <input
				type="number"
				class="melting-weight"
				data-index="${index}"
				value="${melting_weight}"
				step="0.001"
				min="0"
			    >

			</div>


			<div class="melting-field">
			    <label>
				Melting Purity
			    </label>

			     <input
				type="number"
				class="melting-purity"
				data-index="${index}"
				value="${row.melting_purity || ""}"
				step="0.01"
				min="0"
				max="100"
			    >

			</div>


			<div class="melting-field">
			    <label>
				After Avg Purity %
			    </label>

			    <span class="melting-after-avg-purity">
				${this.format_number(
					row.after_weighted_avg_purity
				)}
			    </span>
			</div>


			<div class="melting-field">
			    <label>
				Fine Weight
			    </label>

			    <span class="melting-fine-weight">
				${this.format_number(
					row.after_fine_weight
				)}
			    </span>
			</div>

		    </div>


		    <!-- ====================================
			 DIFFERENCE
		    ===================================== -->

		    <div class="melting-grid">

			<div class="melting-field">
			    <label>
				Difference Weight
			    </label>

			    <span class="melting-difference-weight">
				${this.format_number(
					row.difference_weight
				)}
			    </span>
			</div>


			<div class="melting-field">
			    <label>
				Difference Purity
			    </label>

			    <span class="melting-difference-purity">
				${this.format_number(
					row.difference_purity
				)}
			    </span>
			</div>


			<div class="melting-field">
			    <label>
				Melting Fine Difference
			    </label>

			    <span class="melting-fine-difference">
				${this.format_number(
					row.melting_fine_difference
				)}
			    </span>
			</div>


			<!-- REMARK DROPDOWN -->

			<div class="melting-field melting-input-field">

			    <label>
				Remark
			    </label>

			    <select
				class="melting-remark"
				data-index="${index}"
			    >

				<option value="">
				    Select
				</option>

				<option
				    value="Melting"
				    ${remark === "Melting"
						    ? "selected"
						    : ""}
				>
				    Melting
				</option>

				<option
				    value="Vikrant"
				    ${remark === "Vikrant"
						    ? "selected"
						    : ""}
				>
				    Vikrant
				</option>

				<option
				    value="Jatin"
				    ${remark === "Jatin"
						    ? "selected"
						    : ""}
				>
				    Jatin
				</option>

				<option
				    value="Alpa"
				    ${remark === "Alpa"
						    ? "selected"
						    : ""}
				>
				    Alpa
				</option>

				<option
				    value="JR"
				    ${remark === "JR"
						    ? "selected"
						    : ""}
				>
				    JR
				</option>

			    </select>

			</div>


			<div class="melting-field">
			    <label>
				Melt Basis
			    </label>

			    <span>
				${frappe.utils.escape_html(
					row.melt_basis || ""
				)}
			    </span>
			</div>

		    </div>


		    <!-- ====================================
			 ALREADY MELTED
		    ===================================== -->

		    <div class="melting-footer">

			<div>

			    <label>
				Already Melt Wt.
			    </label>

			    <strong>
				${this.format_number(
					row.already_melting_wt
				)}
			    </strong>

			</div>


			<div>

			    <label>
				Already Melt Purity %
			    </label>

			    <strong>
				${this.format_number(
					row.already_melting_purity
				)}
			    </strong>

			</div>


			<div>

			    <label>
				After Melt Wt.
			    </label>

			    <strong>
				${
					row.after_melting_wt !==
						null &&
						row.after_melting_wt !==
						undefined &&
						row.after_melting_wt !== ""
						? this.format_number(
							row.after_melting_wt
						)
						: "-"
				}
			    </strong>

			</div>


			<div>

			    <label>
				After Melt Purity %
			    </label>

			    <strong>
				${
					row.after_melting_purity !==
						null &&
						row.after_melting_purity !==
						undefined &&
						row.after_melting_purity !== ""
						? this.format_number(
							row.after_melting_purity
						)
						: "-"
				}
			    </strong>

			</div>

		    </div>

		</div>

	    `;

		});


		html += `
	    </div>
	`;


		this.voucher_details.html(html);


		// =====================================================
		// MELTING WEIGHT EVENT
		// =====================================================

		this.voucher_details
			.off(
				"input.old_gold change.old_gold",
				".melting-weight , .melting-purity"
			);


		this.voucher_details
			.on(
				"input.old_gold change.old_gold",
				".melting-weight , .melting-purity",
				function () {

					const index =
						parseInt(
							$(this).attr("data-index"),
							10
						);
					const card = $(this).closest(".melting-card");

					const melting_weight =
						parseFloat(
							card.find(".melting-weight").val()
						) || 0;

					const melting_purity =
						parseFloat(
							card.find(".melting-purity").val()
						) || 0;	




					me.calculate_melting(
						index,
						melting_weight,
						melting_purity    
					);

				}
			);


		// =====================================================
		// REMARK EVENT
		// =====================================================

		this.voucher_details
			.off(
				"change.old_gold",
				".melting-remark"
			);


		this.voucher_details
			.on(
				"change.old_gold",
				".melting-remark",
				function () {

					const index =
						parseInt(
							$(this).attr("data-index"),
							10
						);


					const remark =
						$(this).val();


					if (
						me.voucher_items[index]
					) {

						me.voucher_items[index].remark =
							remark;

					}


					console.log(
						"Remark Changed:",
						index,
						remark
					);

				}
			);

		// Melting Weight
		this.voucher_details.on(
			"blur.old_gold",
			".melting-weight",
			function () {

				const index = parseInt(
					$(this).attr("data-index"),
					10
				);

				me.save_melting_row(index);
			}
		);


		// Melting Purity
		this.voucher_details.on(
			"blur.old_gold",
			".melting-purity",
			function () {

				const index = parseInt(
					$(this).attr("data-index"),
					10
				);

				me.save_melting_row(index);
			}
		);


		// Remark
		this.voucher_details.on(
			"change.old_gold",
			".melting-remark",
			function () {

				const index = parseInt(
					$(this).attr("data-index"),
					10
				);

				me.save_melting_row(index);
			}
		);
	}


	// ---------------------------------------------------------
	// CALCULATE MELTING
	// ---------------------------------------------------------
	calculate_melting(
		index,
		melting_weight,
		melting_purity
	) {

		const row =
			this.voucher_items[index];

		if (!row) {
			return;
		}


		const net_wt =
			parseFloat(row.net_wt) || 0;

		const purity = parseFloat(row.purity)||0;	


		// Fine Weight
		const fine_weight =
			melting_weight *
			melting_purity /
			100;


		// Difference in Weight
		const difference_weight =
			melting_weight -
			net_wt;

		const differenct_in_purity=  melting_purity- Math.round(purity) ;	

		const melting_fine_difference = fine_weight - (parseFloat(row.fine_wt)||0)	
		// Save values
		row.melting_weight =
			melting_weight;

		row.melting_purity =
			melting_purity;

		row.after_fine_weight =
			fine_weight;

		row.difference_weight =
			difference_weight;
		row.differenct_in_purity= differenct_in_purity;
		row.melting_fine_difference = melting_fine_difference;	




		// Current card
		const card =
			this.voucher_details
			.find(".melting-card")
			.eq(index);


		// Fine Weight
		card.find(".melting-fine-weight")
			.text(
				fine_weight.toFixed(2)
			);


		// Difference Weight
		card.find(".melting-difference-weight")
			.text(
				difference_weight.toFixed(2)
			);

		card.find(".melting-difference-purity").text(differenct_in_purity.toFixed(0))	
		card.find(".melting-fine-difference").text(melting_fine_difference.toFixed(2))	

	}

	// ---------------------------------------------------------
	// FORMAT NUMBER
	// ---------------------------------------------------------
	format_number(value) {

		if (
			value === null ||
			value === undefined ||
			value === ""
		) {

			return "0";

		}


		const number =
			parseFloat(value);


		if (isNaN(number)) {

			return frappe.utils.escape_html(
				String(value)
			);

		}


		return number.toLocaleString(
			"en-IN",
			{
				minimumFractionDigits: 0,
				maximumFractionDigits: 3
			}
		);

	}
	save_melting_row(index) {

		const me = this;

		if (!this.voucher_items || !this.voucher_items.length) {
			return;
		}

		console.log(
			"Saving all rows:",
			this.voucher_items.length
		);

		const rows_to_save = [];

		// ---------------------------------------------------------
		// COLLECT ALL ROWS
		// ---------------------------------------------------------

		this.voucher_items.forEach(function (row, row_index) {

			const card = me.voucher_details
				.find(".melting-card")
				.eq(row_index);

			if (!card.length) {
				return;
			}

			// -----------------------------------------------------
			// INPUT VALUES
			// -----------------------------------------------------

			const melting_weight =
				parseFloat(
					card.find(".melting-weight").val()
				) || null;

			const melting_purity =
				parseFloat(
					card.find(".melting-purity").val()
				) || null;

			const remark =
				card.find(".melting-remark").val() || "";


			// -----------------------------------------------------
			// CALCULATIONS
			// -----------------------------------------------------

			const net_wt =
				parseFloat(row.net_wt) || 0;
			var fine_wt_after_melting=null;    

			var difference__wt =null; 
			if(melting_weight && melting_purity){    
				var fine_wt_after_melting =    melting_weight * melting_purity / 100;


				var difference__wt =   melting_weight -  net_wt;
			}
			else{
				var fine_wt_after_melting=null;
				var difference__wt=null;
			}   


			// -----------------------------------------------------
			// UPDATE JS DATA
			// -----------------------------------------------------

			row.melting_weight =
				melting_weight;

			row.melting_purity =
				melting_purity;

			row.after_fine_weight =
				fine_wt_after_melting || null;

			row.fine_wt_after_melting =
				fine_wt_after_melting || null;

			row.difference_weight =
				difference__wt;

			row.difference__wt =
				difference__wt;

			row.remark =
				remark;


			// -----------------------------------------------------
			// UPDATE DISPLAY
			// -----------------------------------------------------
			if(fine_wt_after_melting){
			card.find(".melting-fine-weight")
				.text(
					fine_wt_after_melting.toFixed(3)
				);
			}
			if(difference__wt){

			card.find(".melting-difference-weight")
				.text(
					difference__wt.toFixed(3)
				);
			}


			// -----------------------------------------------------
			// ADD TO SAVE ARRAY
			// -----------------------------------------------------

			rows_to_save.push({

				sptranid:
				row.sptranid,

				vouno:
				row.VouNo || "",

				voudate:
				row.VouDate ||
				row.voudate ||
				null,

				net_wt:
				row.net_wt || 0,

				metal_amt:
				row.metal_amt || 0,

				sales_vou_no:
				row.sales_vou_no || "",

				rate_999:
				row.rate_999 || 0,

				rate_916:
				row.rate_916 || 0,

				purity:
				row.purity || 0,

				fine_wt:
				row.fine_wt || 0,

				melting_weight:
				melting_weight || null,

				melting_purity:
				melting_purity || null,

				fine_wt_after_melting:
				fine_wt_after_melting || null,

				difference__wt:
				difference__wt || null,

				difference_purity:
				row.difference_purity || null,

				difference_fine_wt:
				row.difference_fine_wt || null,

				remark:
				remark
			});

		});


		// ---------------------------------------------------------
		// SAVE EACH ROW
		// ---------------------------------------------------------

		let completed = 0;

		rows_to_save.forEach(function (row_data) {

			frappe.call({

				method:
				"vgjewellry.vg_jewellery.page.old_gold.old_gold.save_melting_data",

				args: row_data,

				callback: function (r) {

					completed++;

					console.log(
						"Saved row:",
						row_data.sptranid,
						r.message
					);

					if (completed === rows_to_save.length) {

						frappe.show_alert({
							message: __("All melting rows saved"),
							indicator: "green"
						});

					}

				}

			});

		});

	}
	save_melting_row_old(index) {

		const row = this.voucher_items[index];
		console.log(row);

		if (!row) {
			console.error("Row not found:", index);
			return;
		}

		const card = this.voucher_details
			.find(".melting-card")
			.eq(index);


		// ---------------------------------------------------------
		// INPUT VALUES
		// ---------------------------------------------------------

		const melting_weight =
			parseFloat(
				card.find(".melting-weight").val()
			) || 0;

		const melting_purity =
			parseFloat(
				card.find(".melting-purity").val()
			) || 0;

		const remark =
			card.find(".melting-remark").val() || "";


		// ---------------------------------------------------------
		// CALCULATIONS
		// ---------------------------------------------------------

		const net_wt =
			parseFloat(row.net_wt) || 0;

		const fine_wt_after_melting =
			melting_weight *
			melting_purity /
			100;

		const difference__wt =
			melting_weight -
			net_wt;


		// ---------------------------------------------------------
		// UPDATE JS DATA
		// ---------------------------------------------------------

		row.melting_weight =
			melting_weight;

		row.melting_purity =
			melting_purity;

		row.after_fine_weight =
			fine_wt_after_melting;

		row.fine_wt_after_melting =
			fine_wt_after_melting;

		row.difference_weight =
			difference__wt;

		row.difference__wt =
			difference__wt;

		row.remark =
			remark;


		// ---------------------------------------------------------
		// UPDATE DISPLAY
		// ---------------------------------------------------------

		card.find(".melting-fine-weight")
			.text(
				fine_wt_after_melting.toFixed(3)
			);

		card.find(".melting-difference-weight")
			.text(
				difference__wt.toFixed(3)
			);


		// ---------------------------------------------------------
		// SAVE TO FRAPPE
		// ---------------------------------------------------------

		frappe.call({

			method:
			"vgjewellry.vg_jewellery.page.old_gold.old_gold.save_melting_data",

			args: {

				sptranid:
				row.sptranid,
				item_name: row.item_name,

				vouno:
				row.VouNo || "",

				voudate:
				row.VouDate || row.voudate || null,

				net_wt:
				row.net_wt || 0,

				metal_amt:
				row.metal_amt || 0,

				sales_vou_no:
				row.sales_vou_no || "",

				rate_999:
				row.rate_999 || 0,

				rate_916:
				row.rate_916 || 0,

				purity:
				row.purity || 0,

				fine_wt:
				row.fine_wt || 0,

				melting_weight:
				melting_weight,

				melting_purity:
				melting_purity,

				fine_wt_after_melting:
				fine_wt_after_melting,

				difference__wt:
				difference__wt,

				difference_purity:
				row.difference_purity || 0,

				difference_fine_wt:
				row.difference_fine_wt || 0,

				remark:
				remark

			},

			callback: function (r) {

				if (
					r.message &&
					r.message.status === "success"
				) {

					console.log(
						"Saved:",
						r.message
					);

				}

			}

		});
	}

}
