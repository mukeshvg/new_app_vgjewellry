frappe.provide("vg.quotation_bank");

frappe.pages["quotation-bank"].on_page_load = function (wrapper) {

    new QuotationBank(wrapper);

};

class QuotationBank {

    constructor(wrapper) {

        this.wrapper = $(wrapper);
        this.page = frappe.ui.make_app_page({
            parent: wrapper,
            title: "Quotation Bank",
            single_column: true
        });

        // Data
        this.products = [];
        this.filtered_products = [];
        this.selected_products = new Set();

        // Pagination
        this.page_no = 0;
        this.page_length = 40;
        this.loading = false;
        this.has_more = true;

        // Search
        this.search = "";

        // Filters
        this.filters = {
            vendor: [],
            metal: [],
            item: [],
            diamond_wt: [],
            vendor_design_number: []
        };
	this.filter_options = {};
        this.make();

        this.bind_events();
	this.load_filters();    
    
	this.load_cart_count();
        this.load_data();
    }

    make() {

        this.page.main.html(`

<div class="quotation-bank">

    <!-- Toolbar -->

    <div class="qb-toolbar">

        <div class="qb-search"></div>

        <div class="qb-filters"></div>

        <div class="qb-actions"></div>
	  <button class="btn btn-primary btn-sm" id="apply-filter">
            <i class="fa fa-filter"></i> Apply Filter
        </button>

        <button class="btn btn-default btn-sm" id="clear-filter">
            Clear
        </button>

    </div>

    <!-- Summary -->

    <div class="qb-summary">
    <div class="qb-summary-item stock-summary">
        <span>Stock:</span>
        <b class="stock-count">0</b>
        <span>Pcs</span>
        <span>| Dia:</span>
        <b class="stock-dia-wt">0.000</b>
    </div>


    <div class="qb-summary-item sale-summary">
        <span>Sale:</span>
        <b class="sale-count">0</b>
        <span>Pcs</span>
        <span>| Dia:</span>
        <b class="sale-dia-wt">0.000</b>
    </div>
        <span class="selected-count">

            0 Selected

        </span>

    </div>

    <!-- Product Grid -->

    <div class="product-grid"></div>

    <!-- Loading -->

    <div class="loading-area"></div>

</div>

        `);

        this.make_toolbar();

    }
	make_toolbar() {

        const me = this;

        // Search

        this.search_box = this.page.add_field({
            label: "Search",
            fieldname: "search",
            fieldtype: "Data",
            placeholder: "Vendor / Item / Design"
        });

        $(".qb-search").append(
            this.search_box.$wrapper
        );

        // Vendor

        /*this.vendor_filter = this.page.add_field({

            label: "Vendor",

            fieldname: "vendor",

            fieldtype: "MultiSelectList",

            get_data(txt) {

                return me.get_filter_options(
                    "vendor",
                    txt
                );

            }

        });*/

	this.diamond_filter = this.page.add_field({

    label: "Diamond Wt",

    fieldname: "diamond_wt",

    fieldtype: "MultiSelectList",

    get_data(txt) {

        return me.get_filter_options(
            "diamond_wt",
            txt
        );

    }

});	


        // Metal

        this.metal_filter = this.page.add_field({

            label: "Metal",

            fieldname: "metal",

            fieldtype: "MultiSelectList",

            get_data(txt) {

                return me.get_filter_options(
                    "metal",
                    txt
                );

            }

        });


        // Item

        this.item_filter = this.page.add_field({

            label: "Item",

            fieldname: "item",

            fieldtype: "MultiSelectList",

            get_data(txt) {

                return me.get_filter_options(
                    "item",
                    txt
                );

            }

        });
this.date_range = this.page.add_field({

    label: "Date Range",

    fieldname: "date_range",

    fieldtype: "DateRange"

});



        $(".qb-filters").append(
            this.item_filter.$wrapper
        );
        $(".qb-filters").append(
            this.metal_filter.$wrapper
        );
        $(".qb-filters").append(
            this.diamond_filter.$wrapper
        );
	$(".qb-filters").append(
    	this.date_range.$wrapper
	);

        // Design

        /*this.design_filter = this.page.add_field({

            label: "Design",

            fieldname: "vendor_design_number",

            fieldtype: "MultiSelectList",

            get_data(txt) {

                return me.get_filter_options(
                    "vendor_design_number",
                    txt
                );

            }

        });

        $(".qb-filters").append(
            this.design_filter.$wrapper
        );*/

        // Buttons

        this.page.add_inner_button("Refresh", () => {

            this.refresh();

        });

        this.page.add_inner_button("Select All", () => {

            this.select_all();

        });

        this.page.add_inner_button("Clear", () => {

            this.clear_selection();

        });

        this.page.add_inner_button("Add To Cart", () => {

            this.add_to_cart();

        });
       this.page.add_inner_button(`
    <i class="fa fa-shopping-cart"></i>
    Cart (<span id="cart-count">0</span>)
`, () => {

	window.location.href = "/app/vg-quotation-cart";
    //frappe.set_route("vg-quotation-cart");

});

    }

load_cart_count() {

    frappe.call({

        method: "vgjewellry.vg_jewellery.page.quotation_bank.quotation_bank.get_cart_count",

        callback: (r) => {

            $("#cart-count").text(r.message || 0);

        }

    });

}
load_filters() {

    const me = this;

    frappe.call({
        method: "vgjewellry.vg_jewellery.page.quotation_bank.quotation_bank.get_filter_options",
        callback(r) {

            if (!r.message) return;

            me.filter_options = r.message;
		console.log(r.message)
		me.filter_options.diamond_wt = [

"0-0.100",
"0.101-0.200",
"0.201-0.300",
"0.301-0.400",
"0.401-0.500",
"0.501-0.700",
"0.701-1.000",
"1.001-1.250",
"1.251-1.500",
"1.501-1.750",
"1.751-2.000",
"2.001-2.250",
"2.251-2.500",
"2.501-3.000",
"3.001-3.500",
"3.501-4.000",
"4.001-5.000",
"5.001-6.000",
"6.001-7.000",
"7.001-8.000",
"8.001-9.000",
"9.001-10.000",
"10.001-12.000",
"12.001-15.000",
"15.001-17.000",
"17.001-20.000",
"20.001-25.000",
"25.001-30.000",
"30.001-40.000",
"40.001-50.000",
"50.001-60.000",
"60.001-70.000",
"70.001-80.000",
"80.001-90.000",
"90.001-100.000",
        "100.001-999.000"
];

        }
    });

}
	load_data(reset = true) {

    if (this.loading) return;

    const me = this;

    this.loading = true;

    if (reset) {
        this.page_no = 0;
        this.products = [];
        this.filtered_products = [];
        this.has_more = true;
    }

    $(".loading-area").html(`
        <div class="text-center p-4">
            <i class="fa fa-spinner fa-spin"></i>
            Loading Quotations...
        </div>
    `);

    frappe.call({

        method:
        "vgjewellry.vg_jewellery.page.quotation_bank.quotation_bank.get_quotations",

        args: {

            start: me.page_no * me.page_length,

            page_length: me.page_length,

            search: me.search,

            filters: me.filters

        },

        freeze: false,

        callback(r) {

            me.loading = false;

            $(".loading-area").empty();

            if (!r.message) return;

            let rows = r.message.quotations || [];

            if (rows.length < me.page_length) {
                me.has_more = false;
            }

	    me.image_server_url = r.image_server_url	
            me.current_stock = r.message.current_stock || [];

    me.sale_data = r.message.sale_data || [];		

            if (reset) {
                me.products = rows;
            } else {
                me.products.push(...rows);
            
	    }

		    let summary = r.message.summary || {};


    $(".stock-count")
        .html(summary.stock_count || 0);


    $(".stock-dia-wt")
        .html(
            Number(summary.stock_diamond_wt || 0)
            .toFixed(3)
        );


    $(".sale-count")
        .html(summary.sale_count || 0);


    $(".sale-dia-wt")
        .html(
            Number(summary.sale_diamond_wt || 0)
            .toFixed(3)
        );


            me.filtered_products = [...me.products];

            me.render_cards();

        }

    });

}

render_cards() {

    const me = this;

    let html = "";

    if (!this.filtered_products.length) {

        $(".product-grid").html(`
            <div class="text-center p-5">
                <img src="/assets/frappe/images/ui-states/empty-state.svg"
                     style="width:180px;margin-bottom:15px;">
                <h4>No Quotations Found</h4>
            </div>
        `);

        $(".selected-count").html("0 Selected");
        return;
    }

    this.filtered_products.forEach(function (d) {

        const selected = me.selected_products.has(d.name);

        html += `

<div class="qb-card ${selected ? 'selected' : ''}"
     data-name="${d.name}">

    <div class="qb-image">

        <img class="preview-image"
             data-image="${d.image || ''}"
             loading="lazy"
             src="${d.image || '/assets/frappe/images/ui-states/default-avatar.png'}">

    </div>

    <!--<div class="qb-header">

        <div class="qb-item">
            ${d.item || ""}
        </div>

        <div class="qb-design">
            ${d.vendor_design_number || ""}
        </div>

    </div>-->

    <div class="qb-body">
<table class="table table-borderless qb-table">

    <tr><td>Item</td><td>${d.item || ""}</td></tr>
    <tr><td>Design</td><td>${d.vendor_design_number || ""}</td></tr>
    <tr><td>Metal</td><td>${d.metal || ""}</td></tr>

    <tr><td>Gross</td><td>${Number(d.gr_wt || 0).toFixed(3)}</td></tr>
    <tr><td>Net</td><td>${Number(d.net_wt || 0).toFixed(3)}</td></tr>

    <tr><td>Dia Shape</td><td>${d.diamond_shape|| "-"}</td></tr>

    <tr><td>Dia Size</td><td>${d.diamond_size || "-"}</td></tr>

    <tr><td>Dia Pcs</td><td>${d.total_diamond_pcs || "0"}</td></tr>

    <tr><td>Dia Wt</td><td>${d.total_diamond_wt || "0.000"}</td></tr>

    <tr><td>Stone</td><td>${d.total_stone_pcs || 0} (${Number(d.total_stone_wt || 0).toFixed(3)})</td></tr>

</table>
        <div class="qb-total">

            ${frappe.format(
                d.total_amount || 0,
                {fieldtype:"Currency" ,precision: 0}
            )}

        </div>

    </div>

<div class="qb-footer">

    <button
        class="btn btn-default btn-xs preview-btn"
        data-name="${d.name}">

        <i class="fa fa-search-plus"></i>

        Quick View

    </button>

    <button
        class="btn btn-success btn-xs add-cart-btn"
        data-name="${d.name}">

        <i class="fa fa-shopping-cart"></i>

        Cart

    </button>

    <button
        class="btn ${selected?"btn-primary":"btn-outline-primary"} btn-xs select-btn"
        data-name="${d.name}">

        ${selected?"Selected":"Select"}

    </button>

</div>
   <!-- <div class="qb-footer">

        <button
            class="btn btn-xs btn-default preview-btn"
            data-name="${d.name}">

            <i class="fa fa-search-plus"></i>

            Preview

        </button>

        <button
            class="btn btn-xs ${selected ? 'btn-success' : 'btn-primary'} select-btn"
            data-name="${d.name}">

            ${selected ? "Selected" : "Select"}

        </button>

    </div>-->

</div>

`;

    });

    $(".product-grid").html(html);

    $(".selected-count").html(

        `${this.selected_products.size} Selected from ${this.filtered_products.length}`

    );

}


bind_events() {

    const me = this;

	    function refresh() {

        me.search = me.search_box.get_value() || "";

        me.filters.vendor =
            me.vendor_filter.get_value();

        me.filters.metal =
            me.metal_filter.get_value();

        me.filters.item =
            me.item_filter.get_value();

        me.filters.vendor_design_number =
            me.design_filter.get_value();

        me.load_data(true);

    }

    me.search_box.$input.on(
        "keyup",
        frappe.utils.debounce(refresh,400)
    );

    /*me.vendor_filter.$input.on(
        "change",
        refresh
    );

    me.metal_filter.$input.on(
        "change",
        refresh
    );

    me.item_filter.$input.on(
        "keyup",
        frappe.utils.debounce(refresh,400)
    );

    me.design_filter.$input.on(
        "keyup",
        frappe.utils.debounce(refresh,400)
    );*/

	$(document).on("click", "#apply-filter", () => {

    this.search = this.search_box.get_value() || "";

    //this.filters.vendor = this.vendor_filter.get_value() || [];
    this.filters.diamond_wt = this.diamond_filter.get_value() || [];		
    this.filters.metal = this.metal_filter.get_value() || [];
    this.filters.item = this.item_filter.get_value() || [];
    //this.filters.vendor_design_number = this.design_filter.get_value() || [];
    let range = this.date_range.get_value() || [];


	this.filters.from_date = range[0];
	this.filters.to_date = range[1];

    this.load_data(true);

});
	$(document).on("click", "#clear-filter", () => {

    this.search_box.set_value("");

   // this.vendor_filter.set_value([]);
   this.diamond_filter.set_value([]);
    this.metal_filter.set_value([]);
    this.item_filter.set_value([]);
    //this.design_filter.set_value([]);

    this.filters = {
        vendor: [],
        metal: [],
        item: [],
        vendor_design_number: []
    };

    this.load_data(true);

});
    // Search

    this.search_box.$input.on("keyup", frappe.utils.debounce(function () {

        me.search = $(this).val();

        me.load_data(true);

    }, 400));

    // Infinite Scroll

    $(window).on("scroll.quotation_bank", function () {

        if (!me.has_more) return;

        if (me.loading) return;

        let bottom =
            $(window).scrollTop() +
            $(window).height();

        if (bottom >= $(document).height() - 200) {

            me.page_no++;

            me.load_data(false);

        }

    });
	$(document).on("click",".select-btn",function(e){

    e.stopPropagation();

    me.toggle_selection(

        $(this).data("name")

    );

});

$(document).on("click",".preview-btn",function(e){

    e.stopPropagation();

    me.preview_product(

        $(this).data("name")

    );

});

$(document).on("click",".qb-card",function(){

    me.toggle_selection(

        $(this).data("name")

    );

});

$(document).on("mousemove",".qb-preview-image",function(e){

    const rect=this.getBoundingClientRect();

    const x=((e.clientX-rect.left)/rect.width)*100;

    const y=((e.clientY-rect.top)/rect.height)*100;

    $(this).css({

        "transform":"scale(2)",

        "transform-origin":`${x}% ${y}%`

    });

});

$(document).on("mouseleave",".qb-preview-image",function(){

    $(this).css({

        transform:"scale(1)"

    });

});
$(document).on("click",".add-cart-btn",function(e){

    e.stopPropagation();

    const name=$(this).data("name");
    me.add_to_cart(name)	

    /*frappe.show_alert({

        message:`${name} added to cart`,

        indicator:"green"

    });*/

});

$(document).on("click",".stock-summary",function(){

    me.show_stock_sale_modal(
        "Current Stock",
        me.current_stock
    );

});


$(document).on("click",".sale-summary",function(){

    me.show_stock_sale_modal(
        "Sale Data",
        me.sale_data
    );

});
}

show_stock_sale_modal(title, data){


    if(!data || !data.length){

        frappe.msgprint("No data found");

        return;

    }


    let html = `

    <div class="stock-image-grid">

    `;


    data.forEach(d => {


        html += `

        <div class="stock-image-card">


            <img src="http://192.168.1.5:51/${d.ImagePath1 || '/assets/frappe/images/ui-states/default-avatar.png'}">


            <div class="stock-detail">

                <div>
                    Net WT:
                    <b>
                    ${Number(d.NetWt || 0).toFixed(3)}
                    </b>
                </div>


                <div>
                    Diamond WT:
                    <b>
                    ${Number(d.DiamondWt || 0).toFixed(3)}
                    </b>
                </div>


            </div>


        </div>

        `;

    });


    html += `</div>`;


    let dialog = new frappe.ui.Dialog({

        title:title,

        size:"extra-large",

        fields:[
            {
                fieldtype:"HTML",
                fieldname:"grid"
            }
        ]

    });


    dialog.show();


    dialog.fields_dict.grid.$wrapper.html(html);

}
    refresh() {
	    this.load_data(true);
    }

select_all() {

    this.filtered_products.forEach(d => {

        this.selected_products.add(d.name);

    });
}

clear_selection() {

    this.selected_products.clear();

    this.render_cards();

}

add_to_cart(quotation_id =null) {

	    let quotation_ids = [];

    // Individual Add to Cart
    if (quotation_id) {

        quotation_ids = [quotation_id];

    }
    // Bulk Add to Cart
    else {

        if (!this.selected_products.size) {
            frappe.msgprint("Please select quotation(s).");
            return;
        }

        quotation_ids = Array.from(this.selected_products);
    }

	/*this.selected_products.add($(this).data("name"));

    if (!this.selected_products.size) {
        frappe.msgprint("Please select quotation(s).");
        return;
    }*/

    let dialog = new frappe.ui.Dialog({
        title: "Add to Cart",
        size: "small",

        fields: [
            {
                fieldtype: "Link",
                fieldname: "branch",
                label: "Branch",
                options: "Ornate_Branch_Master",
                reqd: 1
            },
            {
                fieldtype: "Small Text",
                fieldname: "remark",
                label: "Remark"
            }
        ],

        primary_action_label: "Add to Cart",

        primary_action: (values) => {

            if (!values.branch) {
                frappe.msgprint("Please select Branch");
                return;
            }

            dialog.hide();

            frappe.call({
                method: "vgjewellry.vg_jewellery.page.quotation_bank.quotation_bank.add_to_cart",

                freeze: true,

                args: {
                    quotation_ids: quotation_ids,
                    branch: values.branch,
                    remark: values.remark || ""
                },

                callback: (r) => {

                    if (!r.message) {
                        return;
                    }

                    let msg = "";

                    if (r.message.added.length) {
                        msg += `
                            <div style="color:green">
                                ${r.message.added.length}
                                product(s) added to cart.
                            </div>
                        `;
                    }

                    if (r.message.skipped.length) {
                        msg += `
                            <div style="color:red">
                                ${r.message.skipped.length}
                                product(s) already in cart.
                            </div>
                        `;
                    }

                    frappe.msgprint({
                        title: "Cart Status",
                        indicator: "green",
                        message: msg
                    });

                    this.selected_products.clear();

                    $(".qb-card").removeClass("selected");

                    $(".select-btn")
                        .removeClass("btn-primary")
                        .addClass("btn-outline-primary")
                        .text("Select");

                    $(".selected-count").html(
                        `0 Selected from ${this.filtered_products.length}`
                    );

                    this.load_cart_count();
                }
            });
        }
    });

    // Branch custom query
    dialog.fields_dict.branch.get_query = function () {
        return {
            query: "vgjewellry.vg_jewellery.page.quotation_bank.quotation_bank.branch_query"
        };
    };

    dialog.show();

    // ----------------------------------------------------
    // Dialog overflow
    // ----------------------------------------------------

    dialog.$wrapper.find(".modal-dialog").css({
        "overflow": "visible"
    });

    dialog.$wrapper.find(".modal-content").css({
        "overflow": "visible"
    });

    dialog.$wrapper.find(".modal-body").css({
        "overflow": "visible"
    });

    // ----------------------------------------------------
    // Branch above Remark
    // ----------------------------------------------------

    dialog.$wrapper
        .find('[data-fieldname="branch"]')
        .css({
            "position": "relative",
            "z-index": "1000"
        });

    dialog.$wrapper
        .find('[data-fieldname="remark"]')
        .css({
            "position": "relative",
            "z-index": "1"
        });
}


get_filter_options(field, txt) {

    let data = this.filter_options?.[field] || [];

    txt = (txt || "").toLowerCase();

    return data
        .filter(d => !txt || d.toLowerCase().includes(txt))
        .map(d => ({
            value: d,
            description: d
        }));
}

get_filter_options1(field, txt) {

    let values = [];

    this.products.forEach(d => {

        if (d[field]) {

            values.push(d[field]);

        }

    });

    values = [...new Set(values)];

    values.sort();

    return values
        .filter(d => {

            if (!txt) return true;

            return d
                .toLowerCase()
                .includes(txt.toLowerCase());

        })
        .map(d => ({
            value: d,
            description: d
        }));

}
toggle_selection(name){

    if(this.selected_products.has(name)){

        this.selected_products.delete(name);

    }else{

        this.selected_products.add(name);

    }

    this.render_cards();

}
preview_product(name) {

    const row = this.products.find(d => d.name === name);

    if (!row) return;

    const dialog = new frappe.ui.Dialog({
        title: `${row.item || ""} - ${row.vendor_design_number || ""}`,
        size: "extra-large",
        fields: [
            {
                fieldtype: "HTML",
                fieldname: "details"
            }
        ]
    });

    dialog.show();
    
    let diamond_html = "";

if (row.diamond_details && row.diamond_details.length) {

    diamond_html = `
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th colspan="6">Diamond Details</th>
                </tr>
                <tr>
                    <th>#</th>
                    <th>Shape</th>
                    <th>Size</th>
                    <th>Pcs</th>
                    <th>Wt</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
    `;

    row.diamond_details.forEach((d, i) => {

        diamond_html += `
            <tr>
                <td>${i + 1}</td>
                <td>${d.diamond_shape || d.shape || ""}</td>
                <td>${d.diamond_size || d.size || ""}</td>
                <td>${d.diamond_pcs || d.pcs || 0}</td>
                <td>${Number(d.diamond_wt || d.wt || 0).toFixed(3)}</td>
                <td>${frappe.format(d.diamond_amount || d.amount || 0, {fieldtype: "Currency", precision: 0})}</td>
            </tr>
        `;
    });

    diamond_html += `
            </tbody>
        </table>
    `;
}
    
let stone_html = "";

if (row.stone_details && row.stone_details.length) {

    stone_html = `
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th colspan="6">Stone Details</th>
                </tr>
                <tr>
                    <th>#</th>
                    <th>Pcs</th>
                    <th>Wt</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
    `;

    row.stone_details.forEach((d, i) => {

        stone_html += `
            <tr>
                <td>${i + 1}</td>
                <td>${d.stone_pcs || d.pcs || 0}</td>
                <td>${Number(d.stone_wt || d.wt || 0).toFixed(3)}</td>
                <td>${frappe.format(d.stone_amount || d.amount || 0, {fieldtype: "Currency" ,precision: 0})}</td>
            </tr>
        `;
    });

    stone_html += `
            </tbody>
        </table>
    `;
}

    dialog.fields_dict.details.$wrapper.html(`

<div class="qb-dialog">

    <div class="qb-dialog-left">

        <img
            src="${row.image || "/assets/frappe/images/ui-states/default-avatar.png"}"
            class="dialog-main-image">

    </div>

    <div class="qb-dialog-right">

        <table class="table table-bordered">

            <tr><th colspan="4">Basic Details</th></tr>

            <tr>
                <td>Vendor</td>
                <td>${row.vendor || ""}</td>
                <td>Vendor Code</td>
                <td>${row.vendor_code || ""}</td>
            </tr>

            <tr>
                <td>Item</td>
                <td>${row.item || ""}</td>
                <td>Design</td>
                <td>${row.vendor_design_number || ""}</td>
            </tr>

            <tr>
                <td>Metal</td>
                <td colspan="3">${row.metal || ""}</td>
            </tr>

            <tr>
                <td>Gross Weight</td>
                <td>${Number(row.gr_wt || 0).toFixed(3)}</td>

                <td>Net Weight</td>
                <td>${Number(row.net_wt || 0).toFixed(3)}</td>
            </tr>
            <tr>
                <td>Gold Value</td>
                <td>${Number(row.gold_value || 0).toFixed()}</td>
                <td>Total Labour</td>
                <td>${Number(row.total_labour || 0).toFixed()}</td>
            </tr>

        </table>

        ${diamond_html}
        ${stone_html}


        <div class="dialog-total">

            Total :
            ${frappe.format(row.total_amount || 0,{fieldtype:"Currency",precision:0})}

        </div>

    </div>

</div>

`);

}
}

