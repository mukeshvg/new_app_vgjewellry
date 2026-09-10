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
		this.load_branches();
		this.bind_events();
	}


	// ---------------------------------------------------------
	// CREATE HTML
	// ---------------------------------------------------------
	make_html() {

		this.wrapper.find(".layout-main-section").html(`

	    <div class="old-gold-container">

		<div class="row">
		<!-- BRANCH -->
    <div class="col-md-3">
	<div class="form-group">

	    <label>Branch</label>

	    <select
		class="form-control"
		id="branch"
	    >
		<option value="">Select Branch</option>
	    </select>

	</div>
    </div>


    <!-- FROM DATE -->
    <div class="col-md-2">
	<div class="form-group">

	    <label>From Date</label>

	    <input
		type="date"
		class="form-control"
		id="from_date"
	    >

	</div>
    </div>


    <!-- TO DATE -->
    <div class="col-md-2">
	<div class="form-group">

	    <label>To Date</label>

	    <input
		type="date"
		class="form-control"
		id="to_date"
	    >

	</div>
    </div>

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

		    <!-- VOUCHER NO -->
		    <div class="col-md-2">

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

		this.branch =  this.wrapper.find("#branch");
		this.from_date =  this.wrapper.find("#from_date");
		this.to_date =  this.wrapper.find("#to_date");
		this.metal = this.wrapper.find("#metal");
		this.voucher_no =this.wrapper.find("#voucher_no");

		this.suggestions =this.wrapper.find("#voucher_suggestions");

		this.voucher_details =	this.wrapper.find("#voucher_details");
		const today = frappe.datetime.get_today();

		this.from_date.val(today);
		this.to_date.val(today);

	}

	load_branches() {

		const me = this;

		frappe.call({

			method:
			"vgjewellry.vg_jewellery.page.old_gold.old_gold.get_branches",

			freeze: true,

			freeze_message: "Loading branches...",

			callback: function (r) {

				me.branch.empty();

				me.branch.append(`
		<option value="-1">
		    All Branch
		</option>
	    `);

				if (!r.message) {
					return;
				}

				r.message.forEach(function (branch) {

					me.branch.append(`
		    <option value="${branch.name}">
			${frappe.utils.escape_html(
				branch.branch_name
			)}
		    </option>
		`);

				});
				me.branch.val("-1");
				me.load_vouchers();	
			}

		});

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
		this.metal.on("change", function () {
			me.load_vouchers();
		});

		this.branch.on("change", function () {
			me.load_vouchers();
		});

		this.from_date.on("change", function () {
			me.load_vouchers();
		});

		this.to_date.on("change", function () {
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

	load_vouchers() {

		const me = this;

		// ---------------------------------------------------------
		// GET ALL FILTER VALUES
		// ---------------------------------------------------------

		const branch = this.branch.val() || "All";
		const from_date = this.from_date.val() || "";
		const to_date = this.to_date.val() || "";
		const metal = this.metal.val() || "";
		const voucher_no = this.voucher_no.val() || "";



		// ---------------------------------------------------------
		// RESET VOUCHER DATA
		// ---------------------------------------------------------

		this.voucher_list = {};
		this.voucher_items = [];

		this.suggestions.empty();
		this.voucher_details.empty();


		// ---------------------------------------------------------
		// REQUIRED FILTERS
		// ---------------------------------------------------------

		if ( !from_date || !to_date) {
			return;
		}


		// ---------------------------------------------------------
		// SEND ALL FILTERS TO BACKEND
		// ---------------------------------------------------------

		frappe.call({

			method:
			"vgjewellry.vg_jewellery.page.old_gold.old_gold.get_voucher_details",

			args: {

				branch: branch,

				from_date: from_date,

				to_date: to_date,

				metal: metal,

				voucher_no: voucher_no

			},

			freeze: true,

			freeze_message: "Loading vouchers...",

			callback: function (r) {

				if (r.message) {

					me.voucher_list = r.message;
					me.render_voucher_details(r.message)    

				} else {

					me.voucher_list = {};

				}


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

render_voucher_details(data, set_source = true) {

    const me = this;


    // ---------------------------------------------------------
    // KEEP ORIGINAL DATA
    // ---------------------------------------------------------

    if (set_source) {

        this.voucher_items =
            Array.isArray(data)
                ? data
                : [];

    }


    const rows =
        Array.isArray(data)
            ? data
            : [];


    // ---------------------------------------------------------
    // NO DATA
    // ---------------------------------------------------------

    if (!rows.length) {

        this.voucher_details.html(`
            <div class="alert alert-warning">
                No voucher details found.
            </div>
        `);

        return;
    }


    // ---------------------------------------------------------
    // CREATE TABLE
    // ---------------------------------------------------------

    let html = `

        <div class="old-gold-grid-wrapper">

            <table class="old-gold-grid">

                <thead>

                    <!-- =========================================
                         HEADER
                    ========================================== -->

                    <tr class="og-header">

                        <th
                            data-column="VouDate"
                            class="og-sort"
                        >
                            Vou Date
                            <span class="og-sort-icon">↕</span>
                        </th>


                        <th
                            data-column="VouNo"
                            class="og-sort"
                        >
                            Vou No
                            <span class="og-sort-icon">↕</span>
                        </th>


                        <th
                            data-column="item_name"
                            class="og-sort"
                        >
                            Item Name
                            <span class="og-sort-icon">↕</span>
                        </th>


                        <th
                            data-column="net_wt"
                            class="og-sort"
                        >
                            Net Wt
                            <span class="og-sort-icon">↕</span>
                        </th>


                        <th
                            data-column="purity"
                            class="og-sort"
                        >
                            Purity
                            <span class="og-sort-icon">↕</span>
                        </th>


                        <th
                            data-column="fine_wt"
                            class="og-sort"
                        >
                            Fine Wt
                            <span class="og-sort-icon">↕</span>
                        </th>


                        <th
                            data-column="metal_amt"
                            class="og-sort"
                        >
                            Metal Amt
                            <span class="og-sort-icon">↕</span>
                        </th>


                        <th
                            data-column="rate_916"
                            class="og-sort"
                        >
                            916
                            <span class="og-sort-icon">↕</span>
                        </th>


                        <th
                            data-column="rate_999"
                            class="og-sort"
                        >
                            999
                            <span class="og-sort-icon">↕</span>
                        </th>


                        <th>
                            Remark
                        </th>

                    </tr>


                    <!-- =========================================
                         SEARCH ROW
                    ========================================== -->

                    <tr class="og-search-row">

                        <th>
                            <input
                                type="text"
                                class="og-search"
                                data-column="VouDate"
                                placeholder="Search"
                            >
                        </th>


                        <th>
                            <input
                                type="text"
                                class="og-search"
                                data-column="VouNo"
                                placeholder="Search"
                            >
                        </th>


                        <th>
                            <input
                                type="text"
                                class="og-search"
                                data-column="item_name"
                                placeholder="Search"
                            >
                        </th>


                        <th>
                            <input
                                type="text"
                                class="og-search"
                                data-column="net_wt"
                                placeholder="Search"
                            >
                        </th>


                        <th>
                            <input
                                type="text"
                                class="og-search"
                                data-column="purity"
                                placeholder="Search"
                            >
                        </th>


                        <th>
                            <input
                                type="text"
                                class="og-search"
                                data-column="fine_wt"
                                placeholder="Search"
                            >
                        </th>


                        <th>
                            <input
                                type="text"
                                class="og-search"
                                data-column="metal_amt"
                                placeholder="Search"
                            >
                        </th>


                        <th>
                            <input
                                type="text"
                                class="og-search"
                                data-column="rate_916"
                                placeholder="Search"
                            >
                        </th>


                        <th>
                            <input
                                type="text"
                                class="og-search"
                                data-column="rate_999"
                                placeholder="Search"
                            >
                        </th>


                        <th></th>

                    </tr>

                </thead>


                <tbody>
    `;


    // ---------------------------------------------------------
    // DATA ROWS
    // ---------------------------------------------------------

    rows.forEach(function (row) {


        // IMPORTANT:
        // Find the index in the ORIGINAL array.
        // This keeps melting/save working after filtering.

        const original_index =
            me.voucher_items.indexOf(row);


        const melting_weight =
            row.melting_weight !== undefined &&
            row.melting_weight !== null
                ? row.melting_weight
                : "";


        const melting_purity =
            row.melting_purity !== undefined &&
            row.melting_purity !== null
                ? row.melting_purity
                : "";


        const remark =
            row.remark || "";


        // =====================================================
        // MAIN ROW
        // =====================================================

        html += `

            <tr
                class="og-main-row"
                data-index="${original_index}"
            >

                <!-- VOUCHER DATE -->

                <td>

                    <span class="og-value">
                        ${frappe.utils.escape_html(
                            row.VouDate || ""
                        )}
                    </span>

                </td>


                <!-- VOUCHER NO -->

                <td>

                    <span class="og-voucher">
                        ${frappe.utils.escape_html(
                            row.VouNo || ""
                        )}
                    </span>

                </td>


                <!-- ITEM NAME -->

                <td class="og-item">

                    ${frappe.utils.escape_html(
                        row.item_name || ""
                    )}

                </td>


                <!-- NET WT -->

                <td>

                    <span class="og-value">
                        ${me.format_number(
                            row.net_wt
                        )}
                    </span>

                </td>


                <!-- PURITY -->

                <td>

                    <span class="og-value">
                        ${me.format_number(
                            row.purity
                        )}
                    </span>

                </td>


                <!-- FINE WT -->

                <td>

                    <span class="og-value">
                        ${me.format_number(
                            row.fine_wt
                        )}
                    </span>

                </td>


                <!-- METAL AMOUNT -->

                <td>

                    <span class="og-value">
                        ${me.format_number(
                            row.metal_amt
                        )}
                    </span>

                </td>


                <!-- 916 -->

                <td>

                    <span class="og-value">
                        ${me.format_number(
                            row.rate_916
                        )}
                    </span>

                </td>


                <!-- 999 -->

                <td>

                    <span class="og-value">
                        ${me.format_number(
                            row.rate_999
                        )}
                    </span>

                </td>


                <!-- REMARK -->

                <td>

                    <select
                        class="og-select melting-remark"
                        data-index="${original_index}"
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

                </td>

            </tr>


            <!-- =================================================
                 MELTING / CALCULATION ROW
            ================================================= -->

            <tr
                class="og-calculation-row"
                data-index="${original_index}"
            >

                <td></td>

                <td></td>


                <td class="og-calculation-title">
                    Melting Details
                </td>


                <!-- MELTING WEIGHT -->

                <td class="og-melting-cell">

                    <label class="og-input-label">
                        Melting Wt
                    </label>

                    <input
                        type="number"
                        class="og-input melting-weight"
                        data-index="${original_index}"
                        value="${melting_weight}"
                        step="0.001"
                        min="0"
                    >

                </td>


                <!-- MELTING PURITY -->

                <td class="og-melting-cell">

                    <label class="og-input-label">
                        Melting Purity
                    </label>

                    <input
                        type="number"
                        class="og-input melting-purity"
                        data-index="${original_index}"
                        value="${melting_purity}"
                        step="0.01"
                        min="0"
                        max="100"
                    >

                </td>


                <!-- FINE WT AFTER MELTING -->

                <td class="og-melting-cell">

                    <label class="og-input-label">
                        Fine Wt After Melt
                    </label>

                    <span class="og-result melting-fine-weight">

                        ${me.format_number(
                            row.after_fine_weight
                        )}

                    </span>

                </td>


                <!-- DIFFERENCE WT -->

                <td class="og-melting-cell">

                    <label class="og-input-label">
                        Diff Wt
                    </label>

                    <span class="diff-wt">

                        ${me.format_number(
                            row.difference_weight
                        )}

                    </span>

                </td>


                <!-- DIFFERENCE PURITY -->

                <td class="og-melting-cell">

                    <label class="og-input-label">
                        Diff %
                    </label>

                    <span class="diff-purity">

                        ${me.format_number(
                            row.differenct_in_purity
                        )}

                    </span>

                </td>


                <!-- DIFFERENCE FINE WT -->

                <td class="og-melting-cell">

                    <label class="og-input-label">
                        Diff Fine Wt
                    </label>

                    <span class="diff-fine-wt">

                        ${me.format_number(
                            row.melting_fine_difference
                        )}

                    </span>

                </td>


                <td></td>

            </tr>

        `;

    });


    html += `

                </tbody>

            </table>

        </div>

    `;


    // ---------------------------------------------------------
    // DISPLAY TABLE
    // ---------------------------------------------------------

    this.voucher_details.html(html);


    // =========================================================
    // MELTING WEIGHT / PURITY
    // =========================================================

    this.voucher_details
        .off(
            "input.old_gold change.old_gold",
            ".melting-weight, .melting-purity"
        )
        .on(
            "input.old_gold change.old_gold",
            ".melting-weight, .melting-purity",
            function () {

                const index =
                    parseInt(
                        $(this).attr("data-index"),
                        10
                    );


                const row =
                    me.voucher_items[index];


                if (!row) {
                    return;
                }


                const calculation_row =
                    $(this).closest(
                        ".og-calculation-row"
                    );


                const melting_weight =
                    parseFloat(
                        calculation_row
                            .find(".melting-weight")
                            .val()
                    ) || 0;


                const melting_purity =
                    parseFloat(
                        calculation_row
                            .find(".melting-purity")
                            .val()
                    ) || 0;


                me.calculate_melting(
                    index,
                    melting_weight,
                    melting_purity
                );

            }
        );


    // =========================================================
    // REMARK CHANGE
    // =========================================================

    this.voucher_details
        .off(
            "change.old_gold",
            ".melting-remark"
        )
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


                if (me.voucher_items[index]) {

                    me.voucher_items[index].remark =
                        remark;

                }


                me.save_melting_row(index);

            }
        );


    // =========================================================
    // MELTING WEIGHT BLUR
    // =========================================================

    this.voucher_details
        .off(
            "blur.old_gold",
            ".melting-weight"
        )
        .on(
            "blur.old_gold",
            ".melting-weight",
            function () {

                const index =
                    parseInt(
                        $(this).attr("data-index"),
                        10
                    );


                me.save_melting_row(index);

            }
        );


    // =========================================================
    // MELTING PURITY BLUR
    // =========================================================

    this.voucher_details
        .off(
            "blur.old_gold",
            ".melting-purity"
        )
        .on(
            "blur.old_gold",
            ".melting-purity",
            function () {

                const index =
                    parseInt(
                        $(this).attr("data-index"),
                        10
                    );


                me.save_melting_row(index);

            }
        );


    // =========================================================
    // SORT
    // =========================================================

    this.voucher_details
        .off(
            "click.old_gold",
            ".og-sort"
        )
        .on(
            "click.old_gold",
            ".og-sort",
            function () {

                const column =
                    $(this).attr("data-column");


                me.sort_voucher_items(
                    column
                );

            }
        );


    // =========================================================
    // SEARCH
    // =========================================================

    this.voucher_details
        .off(
            "input.old_gold",
            ".og-search"
        )
        .on(
            "input.old_gold",
            ".og-search",
            function () {

                me.filter_voucher_items();

            }
        );

}




// =========================================================
// SORT HEADER
// =========================================================

sort_header(label, field, column) {

	return `

	<th class="og-sort"
	    data-field="${field}"
	    data-column="${column}">

	    <div class="og-header-content">

		<span>
		    ${label}
		</span>

		<span class="og-sort-icon">
		    ↕
		</span>

	    </div>

	</th>

    `;
}


// =========================================================
// SEARCH CELL
// =========================================================

search_cell(column, placeholder) {

	return `

	<th>

	    <input
		type="text"
		class="og-search"
		data-column="${column}"
		placeholder="${placeholder}"
	    >

	</th>

    `;
}



sort_voucher_items(column) {

	if (!this.sort_state) {
		this.sort_state = {};
	}

	if (!this.sort_state[column]) {
		this.sort_state[column] = "asc";
	}
	else {
		this.sort_state[column] =
			this.sort_state[column] === "asc"
			? "desc"
			: "asc";
	}


	const direction =
		this.sort_state[column];


	this.voucher_items.sort(function (a, b) {

		let value_a = a[column];
		let value_b = b[column];


		// Numeric columns
		const numeric_columns = [
			"net_wt",
			"metal_amt",
			"rate_916",
			"rate_999",
			"purity",
			"fine_wt",
			"difference_weight",
			"differenct_in_purity",
			"melting_fine_difference"
		];


		if (
			numeric_columns.includes(column)
		) {

			value_a =
				parseFloat(value_a) || 0;

			value_b =
				parseFloat(value_b) || 0;

		}
		else {

			value_a =
				String(value_a || "")
				.toLowerCase();

			value_b =
				String(value_b || "")
				.toLowerCase();

		}


		if (value_a < value_b) {
			return direction === "asc"
				? -1
				: 1;
		}

		if (value_a > value_b) {
			return direction === "asc"
				? 1
				: -1;
		}

		return 0;

	});


	this.render_voucher_details(
		this.voucher_items
	);

}


filter_voucher_items() {

    const filters = {};


    // ---------------------------------------------------------
    // READ SEARCH BOXES
    // ---------------------------------------------------------

    this.voucher_details
        .find(".og-search")
        .each(function () {

            const column =
                $(this).attr("data-column");


            const value =
                String(
                    $(this).val() || ""
                )
                .trim()
                .toLowerCase();


            if (value) {

                filters[column] =
                    value;

            }

        });


    // ---------------------------------------------------------
    // FILTER ORIGINAL DATA
    // ---------------------------------------------------------

    const filtered =
        this.voucher_items.filter(
            function (row) {

                return Object.entries(filters)
                    .every(
                        function ([column, search]) {

                            const value =
                                String(
                                    row[column] ?? ""
                                )
                                .toLowerCase();


                            return value.includes(
                                search
                            );

                        }
                    );

            }
        );


    // ---------------------------------------------------------
    // REMEMBER SEARCH VALUES
    // ---------------------------------------------------------

    const search_values = {};


    this.voucher_details
        .find(".og-search")
        .each(function () {

            const column =
                $(this).attr("data-column");


            search_values[column] =
                $(this).val();

        });


    // ---------------------------------------------------------
    // RENDER FILTERED DATA
    //
    // false = DON'T replace voucher_items
    // ---------------------------------------------------------

    this.render_voucher_details(
        filtered,
        false
    );


    // ---------------------------------------------------------
    // RESTORE SEARCH VALUES
    // ---------------------------------------------------------

    this.voucher_details
        .find(".og-search")
        .each(function () {

            const column =
                $(this).attr("data-column");


            $(this).val(
                search_values[column] || ""
            );

        });

}



// ---------------------------------------------------------
// CALCULATE MELTING
// ---------------------------------------------------------
calculate_melting(index, melting_weight, melting_purity) {

    const row = this.voucher_items[index];

    if (!row) {
        return;
    }

    const net_wt = parseFloat(row.net_wt) || 0;
    const purity = parseFloat(row.purity) || 0;
    const original_fine_wt = parseFloat(row.fine_wt) || 0;

    // Fine weight after melting
    const fine_weight =
        melting_weight * melting_purity / 100;

    // Difference in weight
    const difference_weight =
        melting_weight - net_wt;

    // Difference in purity
    const difference_purity =
        melting_purity - Math.round(purity);

    // Difference in fine weight
    const melting_fine_difference =
        fine_weight - original_fine_wt;


    // ---------------------------------------------------------
    // UPDATE JS DATA
    // ---------------------------------------------------------

    row.melting_weight = melting_weight;
    row.melting_purity = melting_purity;
    row.after_fine_weight = fine_weight;
    row.fine_wt_after_melting = fine_weight;

    row.difference_weight = difference_weight;
    row.difference__wt = difference_weight;

    row.differenct_in_purity = difference_purity;
    row.difference_purity = difference_purity;

    row.melting_fine_difference = melting_fine_difference;
    row.difference_fine_wt = melting_fine_difference;


    // ---------------------------------------------------------
    // FIND CURRENT CALCULATION ROW
    // ---------------------------------------------------------

    const calculation_row =
        this.voucher_details
            .find(`.og-calculation-row[data-index="${index}"]`);


    if (!calculation_row.length) {
        return;
    }


    // ---------------------------------------------------------
    // UPDATE DISPLAY
    // ---------------------------------------------------------

    calculation_row
        .find(".melting-fine-weight")
        .text(this.format_number(fine_weight));

    calculation_row
        .find(".diff-wt")
        .text(this.format_number(difference_weight));

    calculation_row
        .find(".diff-purity")
        .text(this.format_number(difference_purity));

    calculation_row
        .find(".diff-fine-wt")
        .text(this.format_number(melting_fine_difference));
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

    const row = this.voucher_items[index];

    if (!row) {
        return;
    }

    const calculation_row =
        this.voucher_details
            .find(`.og-calculation-row[data-index="${index}"]`);

    if (!calculation_row.length) {
        return;
    }


    // ---------------------------------------------------------
    // GET CURRENT VALUES
    // ---------------------------------------------------------

    const melting_weight =
        parseFloat(
            calculation_row.find(".melting-weight").val()
        ) || null;

    const melting_purity =
        parseFloat(
            calculation_row.find(".melting-purity").val()
        ) || null;

    const remark =
        this.voucher_details
            .find(`.melting-remark[data-index="${index}"]`)
            .val() || "";


    // ---------------------------------------------------------
    // CALCULATE VALUES
    // ---------------------------------------------------------

    const net_wt =
        parseFloat(row.net_wt) || 0;

    const purity =
        parseFloat(row.purity) || 0;

    const fine_wt =
        parseFloat(row.fine_wt) || 0;


    let fine_wt_after_melting = null;
    let difference_wt = null;
    let difference_purity = null;
    let difference_fine_wt = null;


    if (
        melting_weight !== null &&
        melting_purity !== null
    ) {

        fine_wt_after_melting =
            melting_weight * melting_purity / 100;

        difference_wt =
            melting_weight - net_wt;

        difference_purity =
            melting_purity - Math.round(purity);

        difference_fine_wt =
            fine_wt_after_melting - fine_wt;
    }


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
        difference_wt;

    row.difference__wt =
        difference_wt;

    row.differenct_in_purity =
        difference_purity;

    row.difference_purity =
        difference_purity;

    row.melting_fine_difference =
        difference_fine_wt;

    row.difference_fine_wt =
        difference_fine_wt;

    row.remark =
        remark;


    // ---------------------------------------------------------
    // SAVE TO DATABASE
    // ---------------------------------------------------------

    frappe.call({

        method:
            "vgjewellry.vg_jewellery.page.old_gold.old_gold.save_melting_data",

        args: {

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
                melting_weight,

            melting_purity:
                melting_purity,

            fine_wt_after_melting:
                fine_wt_after_melting,

            difference__wt:
                difference_wt,

            difference_purity:
                difference_purity,

            difference_fine_wt:
                difference_fine_wt,

            remark:
                remark
        },

        freeze: true,

        freeze_message: "Saving melting data...",

        callback: function (r) {

            if (!r.exc) {

                frappe.show_alert({
                    message: __("Melting data saved"),
                    indicator: "green"
                });

            }

        }

    });
}



}
