frappe.pages['price-estimation'].on_page_load = function(wrapper) {
	new PriceEstimation(wrapper);
};

class PriceEstimation {

	constructor(wrapper) {
		this.wrapper = $(wrapper);

		this.page = frappe.ui.make_app_page({
			parent: wrapper,
			title: "Price Estimation",
			single_column: true
		});

		this.search_timeout = null;
		this.request_id = 0;

		this.make();
		this.bind_events();
	}

	make() {

		this.page.main.html(`
	    <div class="price-estimation-page">

		<div class="form-group" style="max-width:450px; position:relative;">

		    <label>Search Lable</label>

		    <input
			type="text"
			class="form-control"
			id="item-search"
			placeholder="Search Label..."
			autocomplete="off"
		    >

		    <div
			id="item-search-results"
			style="
			    position:absolute;
			    top:100%;
			    left:0;
			    right:0;
			    background:white;
			    border:1px solid #d1d8dd;
			    z-index:1000;
			    display:none;
			    max-height:250px;
			    overflow-y:auto;
			    box-shadow:0 4px 8px rgba(0,0,0,0.1);
			"
		    ></div>

		</div>

		<div id="label-details"></div>

	    </div>
	`);

	}

	bind_events() {

		const me = this;

		// Search input event
		this.page.main.on(
			"input",
			"#item-search",
			function() {

				const search_text = $(this).val().trim();

				clearTimeout(me.search_timeout);

				if (search_text.length < 2) {
					me.request_id++;
					$("#item-search-results").hide().empty();
					return;
				}

				// Debounce 300ms
				me.search_timeout = setTimeout(() => {
					me.search_items(search_text);
				}, 300);

			}
		);

		// Select search result
		this.page.main.on(
			"click",
			".item-search-option",
			function() {

				const item_name = $(this).data("name");
				const item_label = $(this).text();

				$("#item-search").val(item_label);

				$("#item-search-results").hide().empty();

				 me.get_label_details(item_name);

				me.select_item(item_name);

			}
		);

		// Hide dropdown on outside click
		$(document).on("click.price-estimation", (e) => {

			if (!$(e.target).closest(
				".price-estimation-page"
			).length) {
				$("#item-search-results").hide();
			}

		});

	}

	search_items(search_text) {

		const me = this;

		const current_request = ++this.request_id;

		frappe.call({

			method: "vgjewellry.vg_jewellery.page.price_estimation.price_estimation.search_items",

			args: {
				search_text: search_text
			},

			callback: function(r) {

				// Ignore outdated responses
				if (current_request !== me.request_id) {
					return;
				}

				me.render_search_results(r.message || []);

			}

		});

	}

	render_search_results(data) {

		const results = $("#item-search-results");

		results.empty();

		if (!data.length) {
			results.html(`
	    <div style="padding:10px;">
		No items found
	    </div>
	`).show();

			return;
		}

		data.forEach(item => {

			const option = $("<div>")
				.addClass("item-search-option")
				.attr("data-name", item.label_no)
				.text(item.display_label)
				.css({
					padding: "10px",
					cursor: "pointer",
					borderBottom: "1px solid #eee"
				});

			results.append(option);

		});

		results.show();
	}	

	select_item(item_name) {

		console.log("Selected Item:", item_name);

		// Add your selected item logic here

		$("#selected-item-details").html(`
	    <div class="alert alert-info">
		Selected Item: ${frappe.utils.escape_html(item_name)}
	    </div>
	`);

	}

	get_label_details(label_no) {

    const me = this;

    const container = this.page.main.find("#label-details");

    container.html(`
        <div class="text-muted">
            <i class="fa fa-spinner fa-spin"></i>
            Loading Label Details...
        </div>
    `);

    frappe.call({

        method: "vgjewellry.vg_jewellery.page.price_estimation.price_estimation.get_label_details",

        args: {
            label_no: label_no
        },

        callback: function(r) {

            if (r.message) {

                me.render_label_details(r.message);

            } else {

                container.html(`
                    <div class="text-muted">
                        No details found.
                    </div>
                `);

            }

        }

    });

}
render_label_details(data) {
    const me = this;	

    if (Array.isArray(data)) {
        data = data[0];
    }

   let src = data.ImagePath1 || "/assets/frappe/images/ui-placeholder.svg";
   let image_url = "/external-image/" +
   src.split("/").map(encodeURIComponent).join("/");
	
    const container = this.page.main.find("#label-details");

    if (!data) {
        container.html(`
            <div class="alert alert-warning">
                No Label Details Found
            </div>
        `);
        return;
    }

    const val = (value) => frappe.utils.escape_html(
        String(value ?? "")
    );

    const num = (value, decimals = 2) => {
        return Number(value || 0).toFixed(decimals);
    };

    // Field generator
    const field = (label, value, name, options = {}) => {

        const {
            editable = false,
            button = false,
            select = false,
            right = false
        } = options;

        let control = "";

        if (select) {
            control = `
                <select class="form-control sc-input" id="${name}">
                    <option value="Net Wt">Net Wt.</option>
                    <option value="Gr Wt">Gr Wt.</option>
                </select>
            `;
        } else {
            control = `
                <input
                    type="text"
                    class="form-control sc-input"
                    id="${name}"
                    value="${val(value)}"
                    ${editable ? "" : "readonly"}
                >
            `;
        }

        return `
            <div class="col-md-6 col-sm-6 col-xs-6">
                <div class="sc-field">

                    <label class="${right ? 'sc-right-label' : ''}">
                        ${label}
                    </label>

                    <div class="sc-control">
                        ${control}

                        ${button ? `
                            <button
                                type="button"
                                class="btn sc-check"
                                data-field="${name}">
                                <i class="fa fa-check text-success"></i>
                            </button>
                        ` : ""}
                    </div>

                </div>
            </div>
        `;
    };

    let html = `

        <style>

            .sc-form {
                background: #fff;
                padding: 12px 5px;
            }

            .sc-field {
                margin-bottom: 12px;
            }

            .sc-field label {
                display: block;
                font-size: 12px;
                font-weight: 500;
                margin-bottom: 5px;
                color: #333;
                text-align: left;
            }

            /* Right column labels */
            .sc-field label.sc-right-label {
                text-align: right;
            }

            /* Every textbox with visible border */
            .sc-form .sc-input {
                display: block;
                width: 100%;
                height: 36px !important;
                border: 1px solid #c7c7c7 !important;
                border-radius: 4px !important;
                background: #fff !important;
                box-shadow: none !important;
                padding: 6px 9px !important;
                font-size: 12px;
                color: #333;
                text-align: right;
            }

            .sc-form .sc-input:focus {
                border: 1px solid #6cace4 !important;
                outline: none;
                box-shadow: 0 0 3px rgba(51,122,183,.25) !important;
            }

            .sc-form .sc-input[readonly] {
                background: #fff !important;
                opacity: 1;
            }

            .sc-control {
                display: flex;
                gap: 5px;
                align-items: center;
            }

            .sc-control .sc-input {
                min-width: 0;
                flex: 1;
            }

            .sc-check {
                height: 36px;
                min-width: 36px;
                padding: 5px;
                border: 1px solid #80b5e8 !important;
                background: white !important;
                border-radius: 4px;
            }

            .sc-details-btn {
                height: 36px;
                white-space: nowrap;
                color: #337ab7;
                border: 1px solid #80b5e8 !important;
                background: white;
                font-size: 11px;
                border-radius: 4px;
            }

            .sc-form .row {
                margin-left: -5px;
                margin-right: -5px;
            }

            .sc-form .row > div {
                padding-left: 5px;
                padding-right: 5px;
            }

            .sc-net-amount {
                margin-top: 5px;
            }

            .sc-total {
                font-size: 14px !important;
            }

	    #sc-grand-total {
		font-size: 14px !important;
                font-weight: 600;
	    }

        </style>

        <div class="sc-form">
	     <div class="row" style="display: flex; align-items: center; justify-content: center;">
		 <img src="${image_url}" class="image-thumb" data-full="${image_url}">
	     </div>

            <div class="row">

                ${field("Item", data.Item, "sc-item")}
                ${field("Label No", data.label_no || data.DLabelNo, "sc-label", {right:true})}

                ${field("Gr Wt", num(data.GrossWt, 3), "sc-gr-wt", {button:true})}
                ${field("Total", num(data.Total,0), "sc-total-amount", {right:true})}

                ${field("Net Wt.", num(data.NetWt, 3), "sc-net-wt")}
                ${field("Pcs", data.Pcs || 1, "sc-pcs", {button:true, right:true})}

                ${field("M. Rate", num(data.MetalRate,0), "sc-m-rate", {button:true})}
                ${field("M. Amt.", num(data.MetalAmt,0), "sc-m-amt", {right:true})}

                <div class="col-md-12 col-sm-12 col-xs-12">
                    <div class="sc-field">
                        <label>Lab. On</label>
                        <select class="form-control sc-input" id="sc-lab-on">
                            <option value="Net Wt">Net Wt.</option>
                            <option value="Gr Wt">Gr Wt.</option>
                        </select>
                    </div>
                </div>

                ${field("Lab. Rate", num(data.LabourRate,0), "sc-lab-rate", {button:true})}
                ${field("Lab. Amt.", num(data.LabourAmount,0), "sc-lab-amt", {right:true})}

                ${field("V. Add.%", num(data.v_add), "sc-v-add", {button:true})}
                ${field("V. A. Wt.", num(data.v_a_wt, 3), "sc-va-wt", {button:true, right:true})}

                ${field("V. A. Amt.", num(data.v_a_amt), "sc-va-amt")}
                ${field("Di. Wt/Pcs", data.DiamondWt+"/"+data.DiamondPcs || "0.000/0", "sc-di-wt", {right:true})}

                ${field("Di. Amt.", num(data.DiamondAmt,0), "sc-di-amt")}
                ${field("St. Wt/Pcs", data.StoneAmt+"/"+data.StonePcs || "0.000/0", "sc-st-wt", {right:true})}

                ${field("St. Amt.", num(data.StoneAmt,0), "sc-st-amt")}

                <div class="col-md-12 col-sm-12 col-xs-12">
                    <div class="sc-field">
                        <label>Ot. Chg.</label>
                        <div class="sc-control">

                            <input
                                type="text"
                                class="form-control sc-input"
                                id="sc-ot-chg"
                                value="${val(num(data.OtherCharge,0))}"
                            >

                            <button
                                class="btn sc-details-btn"
                                id="sc-details">
                                <i class="fa fa-diamond"></i>
                                DETAILS
                            </button>

                        </div>
                    </div>
                </div>

                <div class="col-md-12 col-sm-12 col-xs-12">
                    <div class="sc-field sc-net-amount">
                        <label>Net Amt.</label>
                        <input
                            type="text"
                            class="form-control sc-input sc-total"
                            id="sc-net-amt"
                            value="${val(num(data.NetAmt,0))}"
                            readonly
                        >
                    </div>
                </div>

                ${field("GST", num(data.Gst,0), "sc-gst")}
                ${field("Total", num(data.Total,0), "sc-grand-total", {right:true})}

            </div>
	<div class="text-center" style="margin:10px 0;">
    <button type="button" class="btn btn-primary" id="print-label">
        <i class="fa fa-print"></i> PRINT
    </button>
</div>
        </div>
    `;

    container.html(html);

    container.find("#print-label").on("click", function () {
    me.print_estimate(data);
});			

    container.find("#sc-lab-on").val(data.lab_on || "Net Wt");

    container.find("#sc-details").on("click", function() {
        me.show_details(data);
    });

    container.find(".sc-check").on("click", function() {
        const field_name = $(this).data("field");
        console.log("Confirmed field:", field_name);
    });

}


print_estimate(data) {

    const win = window.open("", "_blank", "width=400,height=700");

    if (!win) {
        frappe.msgprint("Please allow popups to print.");
        return;
    }

    const v = (value) =>
        frappe.utils.escape_html(String(value ?? ""));

    const n = (value) =>
        Number(value || 0).toFixed(2);

    const weight = (value) =>
        Number(value || 0).toFixed(3);

    const today = frappe.datetime.now_date();
    const formatted_date = frappe.datetime.str_to_user(today);	

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
    <title>Estimate</title>

    <style>

        @page {
            size: 80mm auto;
            margin: 0;
        }

        * {
            box-sizing: border-box;
        }

        body {
            width: 76mm;
            margin: 0 auto;
            padding: 5mm 2mm 3mm;
            font-family: Arial, sans-serif;
            font-size: 14px;
            color: #000;
        }

        .heading {
            text-align: center;
            font-size: 25px;
            font-weight: bold;
            text-decoration: underline;
            margin-bottom: 14px;
        }

        .row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            min-height: 25px;
            white-space: nowrap;
        }

        .challan {
            font-size: 15px;
            font-weight: bold;
        }

        .separator {
            border-top: 2px solid #000;
            margin: 5px 0;
        }

        .weight-row {
            font-size: 14px;
            min-height: 40px;
        }

        .weight-label {
            width: 40%;
        }

        .weight-value {
            width: 30%;
            text-align: right;
        }

        .weight-amount {
            width: 30%;
            text-align: right;
        }

        .labour-row {
            margin-top: 0;
        }

        .amount-section {
            margin-top: 32px;
            padding-left: 34%;
        }

        .amount-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 28px;
            font-size: 15px;
            white-space: nowrap;
        }

        .amount-label {
            font-weight: bold;
        }

        .amount-value {
            text-align: right;
            min-width: 100px;
        }

        .amount-line {
            border-top: 2px solid #000;
        }

        .total-row {
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 37px;
            font-size: 17px;
            font-weight: bold;
            padding: 0 2px;
            margin-top: 5px;
        }

        .split-row {
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            font-weight: bold;
            padding: 8px 5px 5px;
            border-bottom: 2px dotted #000;
        }

        @media print {
            body {
                width: 76mm;
                margin: 0;
            }
        }

    </style>
    </head>

    <body>

        <div class="heading">Estimate</div>

        <div class="row challan">
            <span>CHALLAN NO. ${v(data.challan_no || "-")}</span>
            <span>COPY1</span>
        </div>

        <div class="row">
            <span>Name ${v(data.customer_name || "GENERAL CUSTOMER")}</span>
            <span>Code&nbsp;&nbsp; ${v(data.code || "820")}</span>
        </div>

        <div class="row">
            <span>Dt&nbsp;&nbsp;&nbsp; ${formatted_date}</span>
            <span>Rate&nbsp;&nbsp;&nbsp; ${n(data.MetalRate)}</span>
        </div>

        <div class="separator"></div>

        <div class="row weight-row">
            <span>${v(data.DLabelNo || "-")}</span>
            <span>G.Weight</span>
            <span>${weight(data.GrossWt)}gms</span>
        </div>

        <div class="row weight-row">
            <span>N.Weight</span>
            <span>${weight(data.NetAmt)}gms</span>
            <span>${v(data.Pcs)}</span>
            <span>${n(data.MetalAmt)}</span>
        </div>

        <div class="row weight-row">
            <span>L.C.</span>
            <span>${v(data.LabourPer )} %</span>
            <span>${n(data.LabourAmount)}</span>
        </div>

        <div class="amount-section">

            <div class="amount-row">
                <span class="amount-label">Discount</span>
                <span class="amount-value">${n(data.discount)}</span>
            </div>

            <div class="amount-row amount-line">
                <span class="amount-label">Amount</span>
                <span class="amount-value">${n(data.NetAmt)}</span>
            </div>

            <div class="amount-row amount-line">
                <span class="amount-label">Approx GST</span>
                <span class="amount-value">${n(data.Gst)}</span>
            </div>

        </div>

        <div class="total-row">
            <span>TOTAL</span>
            <span>${n(data.Total)}</span>
        </div>

        <div class="split-row">
            <span>Split Wt.</span>
            <span>Split Pcs.</span>
        </div>

    </body>
    </html>
    `;

    win.document.open();
    win.document.write(html);
    win.document.close();

    win.onload = function() {
        win.focus();
        win.print();
        win.close();
    };

}


show_details(data) {

    const me = this;

    let details = data.details || data.stone_details || [];

    const dialog = new frappe.ui.Dialog({
        title: "Details",
        size: "large",
        fields: [
            {
                fieldtype: "HTML",
                fieldname: "details_html"
            }
        ]
    });

    const escape = (value) => frappe.utils.escape_html(
        String(value ?? "")
    );
   const num = (value, decimals = 2) => {
        return Number(value || 0).toFixed(decimals);
    };

    let html = `
        <style>

            .detail-card {
                border: 1px solid #6da3db;
                border-radius: 5px;
                padding: 10px;
                margin-bottom: 13px;
                background: #fff;
                position: relative;
            }

            .detail-card-header {
                display: flex;
                justify-content: center;
                align-items: center;
                margin-bottom: 8px;
                position: relative;
            }

            .detail-card-header input {
                width: 15px;
                height: 15px;
            }

            .detail-card-header .detail-menu {
                position: absolute;
                right: 0;
                top: -5px;
                border: none;
                background: transparent;
                color: #777;
                font-size: 18px;
            }

            .detail-row {
                display: flex;
                gap: 8px;
                margin-bottom: 7px;
            }

            .detail-field {
                width: 50%;
                min-width: 0;
            }

            .detail-field label {
                display: block;
                font-size: 11px;
                font-weight: 500;
                margin-bottom: 3px;
                color: #333;
            }

            .detail-input-group {
                display: flex;
                gap: 4px;
                align-items: center;
            }

            .detail-input {
                width: 100%;
                min-width: 0;
                height: 34px;
                border: 1px solid #ccc !important;
                border-radius: 4px;
                padding: 5px 7px;
                font-size: 11px;
                text-align: right;
                background: white !important;
                box-shadow: none !important;
            }

            .detail-input:focus {
                border-color: #6da3db !important;
                outline: none;
            }

            .detail-input.text-value {
                text-align: left;
            }

            .detail-check {
                width: 30px;
                min-width: 30px;
                height: 34px;
                border: 1px solid #80b5e8;
                background: white;
                border-radius: 4px;
                color: green;
            }

            .detail-actions {
                display: flex;
                justify-content: center;
                gap: 5px;
                margin-top: 15px;
            }

            .detail-actions .btn {
                background: #398b38;
                color: white;
                border: none;
                font-size: 11px;
            }

        </style>

        <div class="details-container">
    `;

    details.forEach((d, index) => {

        html += `

            <div class="detail-card" data-index="${index}">

                <div class="detail-card-header">

                    <input
                        type="checkbox"
                        class="detail-selected"
                        data-index="${index}"
                        checked
                    >

                    <button
                        class="detail-menu"
                        data-index="${index}"
                        type="button">
                        ⋮
                    </button>

                </div>

                <div class="detail-row">

                    <div class="detail-field">
                        <label>Pcs Name</label>
                        <input
                            class="detail-input text-value"
                            data-field="pcs_name"
                            value="${escape(d.pcs_name || d.PcsName || "")}"
                        >
                    </div>

                    <div class="detail-field">
                        <label>Style</label>
                        <input
                            class="detail-input text-value"
                            data-field="style"
                            value="${escape(d.style || d.Style || "")}"
                        >
                    </div>

                </div>

                <div class="detail-row">

                    <div class="detail-field">
                        <label>Weight</label>

                        <div class="detail-input-group">

                            <input
                                class="detail-input"
                                data-field="weight"
                                value="${escape(d.NetWt ?? d.Weight ?? 0)}"
                            >

                            <button class="detail-check" type="button">
                                <i class="fa fa-check"></i>
                            </button>

                        </div>
                    </div>

                    <div class="detail-field">
                        <label>Pcs</label>

                        <div class="detail-input-group">

                            <input
                                class="detail-input"
                                data-field="pcs"
                                value="${escape(d.pcs ?? d.Pcs ?? 0)}"
                            >

                            <button class="detail-check" type="button">
                                <i class="fa fa-check"></i>
                            </button>

                        </div>
                    </div>

                </div>

                <div class="detail-row">

                    <div class="detail-field">
                        <label>Rate</label>

                        <div class="detail-input-group">

                            <input
                                class="detail-input"
                                data-field="rate"
                                value="${escape(d.SalesRate ?? 0)}"
                            >

                            <button class="detail-check" type="button">
                                <i class="fa fa-check"></i>
                            </button>

                        </div>
                    </div>

                    <div class="detail-field">
                        <label>Amount</label>

                        <input
                            class="detail-input"
                            data-field="amount"
                            value="${(num(d.SalesAmount,0) ?? 0)}"
                        >

                    </div>

                </div>

            </div>

        `;

    });

    html += `

        </div>

        <div class="detail-actions">

            <button class="btn btn-sm btn-add-detail">
                ADD NEW
            </button>

            <button class="btn btn-sm btn-update-detail">
                UPDATE
            </button>

            <button class="btn btn-sm btn-close-detail">
                CLOSE
            </button>

        </div>

    `;

    dialog.show();

    const wrapper = dialog.fields_dict.details_html.$wrapper;

    wrapper.html(html);

    // Add new detail card
    wrapper.on("click", ".btn-add-detail", function() {

        const index = wrapper.find(".detail-card").length;

        const new_data = {
            pcs_name: "",
            style: "",
            weight: 0,
            pcs: 0,
            rate: 0,
            amount: 0
        };

        const new_card = $(`
            <div class="detail-card" data-index="${index}">

                <div class="detail-card-header">
                    <input type="checkbox" class="detail-selected" checked>
                    <button class="detail-menu" type="button">⋮</button>
                </div>

                <div class="detail-row">
                    <div class="detail-field">
                        <label>Pcs Name</label>
                        <input class="detail-input text-value"
                            data-field="pcs_name" value="">
                    </div>

                    <div class="detail-field">
                        <label>Style</label>
                        <input class="detail-input text-value"
                            data-field="style" value="">
                    </div>
                </div>

                <div class="detail-row">
                    <div class="detail-field">
                        <label>Weight</label>
                        <div class="detail-input-group">
                            <input class="detail-input" data-field="weight" value="0">
                            <button class="detail-check"><i class="fa fa-check"></i></button>
                        </div>
                    </div>

                    <div class="detail-field">
                        <label>Pcs</label>
                        <div class="detail-input-group">
                            <input class="detail-input" data-field="pcs" value="0">
                            <button class="detail-check"><i class="fa fa-check"></i></button>
                        </div>
                    </div>
                </div>

                <div class="detail-row">
                    <div class="detail-field">
                        <label>Rate</label>
                        <div class="detail-input-group">
                            <input class="detail-input" data-field="rate" value="0">
                            <button class="detail-check"><i class="fa fa-check"></i></button>
                        </div>
                    </div>

                    <div class="detail-field">
                        <label>Amount</label>
                        <input class="detail-input" data-field="amount" value="0">
                    </div>
                </div>

            </div>
        `);

        wrapper.find(".details-container").append(new_card);

    });

    // Close dialog
    wrapper.on("click", ".btn-close-detail", function() {
        dialog.hide();
    });

    // Remove card using menu
    wrapper.on("click", ".detail-menu", function() {

        const card = $(this).closest(".detail-card");

        frappe.confirm(
            "Remove this detail?",
            function() {
                card.remove();
            }
        );

    });

    // Update details
    wrapper.on("click", ".btn-update-detail", function() {

        let updated_details = [];

        wrapper.find(".detail-card").each(function() {

            const card = $(this);

            if (!card.find(".detail-selected").is(":checked")) {
                return;
            }

            let item = {};

            card.find("[data-field]").each(function() {

                item[$(this).data("field")] = $(this).val();

            });

            updated_details.push(item);

        });

        console.log("Updated Details:", updated_details);

        // Use this data for your next calculation/API call
        me.updated_details = updated_details;

        frappe.show_alert({
            message: "Details updated successfully",
            indicator: "green"
        });

    });

}

show_details1(data) {

    const dialog = new frappe.ui.Dialog({
        title: "Diamond & Stone Details",
        size: "large",
        fields: [
            {
                fieldtype: "HTML",
                fieldname: "details"
            }
        ]
    });

    let html = `
        <style>
            .sc-details-table {
                width: 100%;
                border-collapse: collapse !important;
                margin-bottom: 20px;
            }

            .sc-details-table th,
            .sc-details-table td {
                border: 1px solid #bfc5ca !important;
                padding: 9px 8px !important;
                font-size: 12px;
            }

            .sc-details-table th {
                background: #f1f3f5;
                font-weight: 600;
                text-align: center;
            }

            .sc-details-table td {
                background: white;
            }

            .sc-details-heading {
                font-size: 14px;
                font-weight: 600;
                margin: 15px 0 8px;
            }
        </style>

        <div class="sc-details-heading">
            <i class="fa fa-diamond"></i> Diamond Details
        </div>

        <div class="table-responsive">
            <table class="sc-details-table">

                <thead>
                    <tr>
                        <th>Shape</th>
                        <th>Size</th>
                        <th>Pcs</th>
                        <th>Wt</th>
                        <th>Rate</th>
                        <th>Amount</th>
                    </tr>
                </thead>

                <tbody>
    `;

    (data.diamond_details || []).forEach(d => {

        html += `
            <tr>
                <td>${frappe.utils.escape_html(String(d.diamond_shape || ""))}</td>
                <td>${frappe.utils.escape_html(String(d.diamond_size || ""))}</td>
                <td class="text-right">${d.diamond_pcs || 0}</td>
                <td class="text-right">${Number(d.diamond_wt || 0).toFixed(3)}</td>
                <td class="text-right">${Number(d.diamond_rate || 0).toFixed(2)}</td>
                <td class="text-right">${Number(d.diamond_amount || 0).toFixed(2)}</td>
            </tr>
        `;

    });

    if (!data.diamond_details || !data.diamond_details.length) {
        html += `
            <tr>
                <td colspan="6" class="text-center text-muted">
                    No Diamond Details
                </td>
            </tr>
        `;
    }

    html += `
                </tbody>
            </table>
        </div>

        <div class="sc-details-heading">
            <i class="fa fa-circle"></i> Stone Details
        </div>

        <div class="table-responsive">
            <table class="sc-details-table">

                <thead>
                    <tr>
                        <th>Pcs</th>
                        <th>Wt</th>
                        <th>Rate</th>
                        <th>Amount</th>
                    </tr>
                </thead>

                <tbody>
    `;

    (data.stone_details || []).forEach(d => {

        html += `
            <tr>
                <td class="text-right">${d.stone_pcs || 0}</td>
                <td class="text-right">${Number(d.stone_wt || 0).toFixed(3)}</td>
                <td class="text-right">${Number(d.stone_rate || 0).toFixed(2)}</td>
                <td class="text-right">${Number(d.stone_amount || 0).toFixed(2)}</td>
            </tr>
        `;

    });

    if (!data.stone_details || !data.stone_details.length) {
        html += `
            <tr>
                <td colspan="4" class="text-center text-muted">
                    No Stone Details
                </td>
            </tr>
        `;
    }

    html += `
                </tbody>
            </table>
        </div>
    `;

    dialog.show();

    dialog.fields_dict.details.$wrapper.html(html);

}


}
