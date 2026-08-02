frappe.pages['quotation-bank'].on_page_load = function (wrapper) {

    new QuotationBank(wrapper);

};

class QuotationBank {

    constructor(wrapper) {

        this.wrapper = wrapper;

        this.page = frappe.ui.make_app_page({
            parent: wrapper,
            title: "Quotation Bank",
            single_column: true
        });

        this.products = [];
        this.filtered_products = [];
        this.selected_products = [];

        this.filters = {};
	 this.filter_data = {};

this.selected_filters = {

    vendor: [],

    metal: [],

    item: [],

    design_no: []

};   

        this.page_size = 40;
        this.page = 0;
        this.loading = false;

        this.make();

    }

    make() {

        $(this.page.body).html(`

<div class="quotation-bank">

    <!-- Filter Sidebar -->

    <div class="filter-sidebar">

        <div class="filter-header">

            <h4>Filters</h4>

            <button class="btn btn-xs btn-default close-filter">
                ×
            </button>

        </div>

        <div class="filter-body">

            <div id="vendor_filter"></div>

            <hr>

            <div id="metal_filter"></div>

            <hr>

            <div id="item_filter"></div>

        </div>

        <div class="filter-footer">

            <button class="btn btn-primary btn-sm apply-filter">
                Apply
            </button>

            <button class="btn btn-default btn-sm reset-filter">
                Reset
            </button>

        </div>

    </div>

    <!-- Main Area -->

    <div class="quotation-content">
<div class="quotation-toolbar">

    <div class="left-toolbar">

        <button class="btn btn-default open-filter">
            <i class="fa fa-filter"></i>
            Filters
        </button>

        <button class="btn btn-primary select-all">
            Select All
        </button>

        <button class="btn btn-default unselect-all">
            Unselect All
        </button>

    </div>

    <div class="middle-toolbar">

        <input
            class="form-control quotation-search"
            placeholder="Search Item / Vendor / Design">

    </div>

    <div class="right-toolbar">

        <button class="btn btn-success add-cart">
            <i class="fa fa-shopping-cart"></i>
            Add to Cart
        </button>

        <button class="btn btn-danger remove-selection">
            Remove
        </button>

        <div class="selected-counter">

            <div class="selected-text">
                0 Selected
            </div>

            <div class="filter-count"></div>

        </div>

    </div>

</div>

        </div>

        <div class="product-grid">

        </div>

        <div class="loading-area">

        </div>

    </div>

</div>

        `);

        this.bind_events();

        this.load_products();

    }

	bind_events() {

    const me = this;

    $(document).on("click", ".open-filter", function () {

        $(".filter-sidebar").addClass("show");

    });

    $(document).on("click", ".close-filter", function () {

        $(".filter-sidebar").removeClass("show");

    });

    $(document).on("click", ".reset-filter", function () {

        $("input[type=checkbox]").prop("checked", false);

        me.filters = {};

        me.filtered_products = [...me.products];

        me.render_products();
	    me.update_filter_count();

    });

    $(document).on("keyup", ".quotation-search", function () {

        me.search($(this).val());

    });

		$(window).on("scroll",function(){

    if(me.loading) return;

    if(
        $(window).scrollTop()+$(window).height()+200
        >=$(document).height()
    ){

        me.page++;

        me.load_products(false);

    }

});

$(document).on("click", ".quotation-card", function () {

    let name = $(this).data("name");

    me.toggle_selection(name);

});	
		$(document).on("click",".apply-filter",function(){

    me.apply_filters();

});
		$(document).on("click",".reset-filter",function(){

    me.selected_filters={

        vendor:[],

        metal:[],

        item:[],

        design_no:[]

    };

    $(".dynamic-filter").prop("checked",false);

    me.filtered_products=[...me.products];

    me.render_products();
  me.update_filter_count();			

});

$(document).on("click",".add-cart",()=>{

    me.add_to_cart();

});

$(document).on("click",".remove-selection",()=>{

    me.remove_selected();

});
}

show_loading(){

    $(".loading-area").html(`

        <div class="text-center p-3">

            <i class="fa fa-spinner fa-spin"></i>

            Loading...

        </div>

    `);

}

hide_loading(){

    $(".loading-area").html("");

}
show_image(image) {

    if (!image) {

        frappe.msgprint("No Image Available");

        return;

    }

    const dialog = new frappe.ui.Dialog({

        title: "Image Preview",

        size: "extra-large",

        fields: [

            {

                fieldtype: "HTML",

                fieldname: "preview"

            }

        ]

    });

    dialog.show();

    dialog.fields_dict.preview.$wrapper.html(`

<div id="image-container">

    <img
        id="zoom-image"
        src="${image}"
    >

</div>

    `);

    this.enable_zoom();

}
enable_zoom() {

    let img = $("#zoom-image");

    img.on("mousemove", function (e) {

        let x = e.offsetX / $(this).width() * 100;

        let y = e.offsetY / $(this).height() * 100;

        $(this).css({

            "transform-origin": x + "% " + y + "%",

            "transform": "scale(2.5)"

        });

    });

    img.on("mouseleave", function () {

        $(this).css({

            "transform": "scale(1)"

        });

    });

}

load_products(reset = true) {

    const me = this;

    if (me.loading) return;

    me.loading = true;

    if (reset) {

        me.page = 0;

        me.products = [];

    }

    frappe.call({

        method:
        "vgjewellry.vg_jewellery.page.quotation_bank.quotation_bank.get_quotations",

        args:{

            start:me.page*me.page_size,

            page_length:me.page_size,

            filters:me.selected_filters,

            search:$(".quotation-search").val()

        },

        callback:function(r){

            me.loading=false;

            if(!r.message) return;

            if(reset){

                me.products=r.message;

            }else{

                me.products.push(...r.message);

            }

            me.filtered_products=[...me.products];

            me.render_products();

        }

    });

}

load_products1(reset = true) {

    const me = this;

    if (me.loading) return;

    me.loading = true;

    $(".loading-area").html(`
        <div class="text-center" style="padding:20px;">
            <i class="fa fa-spinner fa-spin"></i> Loading...
        </div>
    `);

    if (reset) {
        me.page = 0;
        me.products = [];
        me.filtered_products = [];
    }

    frappe.call({
        method: "frappe.client.get_list",
        args: {

            doctype: "Quotation Upload",

            fields: [
                "name",
                "vendor",
                "vendor_code",
                "item",
                "design_no",
                "metal",
                "image",
                "gr_wt",
                "net_wt",
                "gold_value",
                "dia_shape1",
                "dia_size1",
                "dia_pcs1",
                "dia_wt1",
                "dia_rate1",
                "dia_amt1",
                "dia_shape2",
                "dia_size2",
                "dia_pcs2",
                "dia_wt2",
                "dia_rate2",
                "dia_amt2",
                "stone_pcs",
                "stone_wt",
                "stone_amt",
                "labour",
                "total_amt"
            ],

            order_by: "modified desc",

            limit_start: me.page * me.page_size,

            limit_page_length: me.page_size

        },

        freeze: false,

        callback: function (r) {

            me.loading = false;

            $(".loading-area").html("");

            if (!r.message) return;

            if (reset) {

                me.products = r.message;

            } else {

                me.products.push(...r.message);

            }

            me.filtered_products = [...me.products];

            me.build_filters();

            me.render_products();
		me.update_filter_count();

        }

    });

}
render_filters() {

    const me = this;

    let html = "";

    Object.keys(me.filter_data).forEach(function (filter_name) {

        let values = Object.keys(me.filter_data[filter_name]).sort();

        html += `

<div class="filter-group">

<div class="filter-title">

${frappe.utils.to_title_case(filter_name.replace("_"," "))}

</div>

`;

        values.forEach(function (value, index) {

            html += `

<label class="filter-checkbox filter-item ${index>5?'hide-filter':''}">

<input

type="checkbox"

class="dynamic-filter"

data-filter="${filter_name}"

value="${value}"

>

${value}

<span>

(${me.filter_data[filter_name][value]})

</span>

</label>

`;

        });

        if (values.length > 6) {

            html += `

<div class="show-more"

data-filter="${filter_name}">

Show More

</div>

`;

        }

        html += "</div>";

    });

    $(".filter-body").html(html);

}
render_filters1() {

    const me = this;

    let html = "";

    Object.keys(me.filter_data).forEach(function (filter_name) {

        html += `

<div class="filter-group">

    <div class="filter-title">

        ${frappe.utils.to_title_case(filter_name.replace("_"," "))}

    </div>

`;

        Object.keys(me.filter_data[filter_name]).sort().forEach(function (value) {

            html += `

<label class="filter-checkbox">

<input

type="checkbox"

class="dynamic-filter"

data-filter="${filter_name}"

value="${value}"

>

${value}

<span>

(${me.filter_data[filter_name][value]})

</span>

</label>

`;

        });

        html += "</div>";

    });

    $(".filter-body").html(html);

}

load_more() {

    this.page++;

    this.load_products(false);

}

bind_events() {

    const me = this;

    $(document).on("click", ".open-filter", function () {

        $(".filter-sidebar").addClass("show");

    });

    $(document).on("click", ".close-filter", function () {

        $(".filter-sidebar").removeClass("show");

    });

    $(document).on("click", ".reset-filter", function () {

        $("input[type=checkbox]").prop("checked", false);

        me.filters = {};

        me.filtered_products = [...me.products];

        me.render_products();
	    me.update_filter_count();

    });

let search_timer;

$(document).on("keyup",".quotation-search",function(){

    clearTimeout(search_timer);

    search_timer=setTimeout(()=>{

        me.load_products(true);

    },400);

});
    // Infinite Scroll
    $(window).on("scroll", function () {

        if (me.loading) return;

        const scrollTop = $(window).scrollTop();
        const winHeight = $(window).height();
        const docHeight = $(document).height();

        if (scrollTop + winHeight >= docHeight - 150) {

            me.load_more();

        }

    });
	$(document).on("change", ".dynamic-filter", function () {

    const filter = $(this).data("filter");

    const value = $(this).val();

    if ($(this).is(":checked")) {

        if (!me.selected_filters[filter].includes(value)) {

            me.selected_filters[filter].push(value);
		me.update_filter_count();

        }

    } else {

        me.selected_filters[filter] =

            me.selected_filters[filter].filter(d => d != value);

    }

});
	$(document).on("click", ".show-more", function () {

    let parent = $(this).closest(".filter-group");

    parent.find(".hide-filter").toggle();

    if ($(this).text() == "Show More") {

        $(this).text("Show Less");

    } else {

        $(this).text("Show More");

    }

});
$(document).on("click",".apply-filter",function(){

    me.load_products(true);

    $(".filter-sidebar").removeClass("show");

});
	$(document).on("click", ".quotation-preview", function (e) {

    e.stopPropagation();

    me.show_image(

        $(this).data("image")

    );

});
$(document).on("dblclick", ".quotation-card", function () {

    me.show_details(

        $(this).data("name")

    );

});
$(document).on("click",".select-all",()=>{

    me.select_all();

});

$(document).on("click",".unselect-all",()=>{

    me.clear_selection();

});
}

add_to_cart() {

    if(this.selected_products.length==0){

        frappe.msgprint("Please select quotations.");

        return;

    }

    console.log(this.selected_products);

    frappe.show_alert({

        message:
            this.selected_products.length+
            " quotation(s) selected.",

        indicator:"green"

    });

}

remove_selected(){

    if(this.selected_products.length==0){

        frappe.msgprint("Please select quotations.");

        return;

    }

    frappe.confirm(

        "Remove selected quotations?",

        ()=>{

            this.products=this.products.filter(d=>{

                return !this.selected_products.includes(d.name);

            });

            this.filtered_products=[...this.products];

            this.selected_products=[];

            this.render_products();

            this.build_filters();

            frappe.show_alert({

                message:"Removed",

                indicator:"green"

            });

        }

    );

}

show_details(name) {

    let doc = this.products.find(d => d.name == name);

    if (!doc) return;

    let html = `

<table class="table table-bordered">

<tr><th>Vendor</th><td>${doc.vendor}</td></tr>

<tr><th>Vendor Code</th><td>${doc.vendor_code}</td></tr>

<tr><th>Item</th><td>${doc.item}</td></tr>

<tr><th>Design No</th><td>${doc.design_no}</td></tr>

<tr><th>Metal</th><td>${doc.metal}</td></tr>

<tr><th>Gross Wt</th><td>${doc.gr_wt}</td></tr>

<tr><th>Net Wt</th><td>${doc.net_wt}</td></tr>

<tr><th>Gold Value</th><td>${format_currency(doc.gold_value)}</td></tr>

<tr><th>Dia Shape 1</th><td>${doc.dia_shape1}</td></tr>

<tr><th>Dia Size 1</th><td>${doc.dia_size1}</td></tr>

<tr><th>Dia Pcs 1</th><td>${doc.dia_pcs1}</td></tr>

<tr><th>Dia Wt 1</th><td>${doc.dia_wt1}</td></tr>

<tr><th>Dia Shape 2</th><td>${doc.dia_shape2}</td></tr>

<tr><th>Dia Size 2</th><td>${doc.dia_size2}</td></tr>

<tr><th>Dia Pcs 2</th><td>${doc.dia_pcs2}</td></tr>

<tr><th>Dia Wt 2</th><td>${doc.dia_wt2}</td></tr>

<tr><th>Stone Pcs</th><td>${doc.stone_pcs}</td></tr>

<tr><th>Stone Wt</th><td>${doc.stone_wt}</td></tr>

<tr><th>Stone Amt</th><td>${format_currency(doc.stone_amt)}</td></tr>

<tr><th>Labour</th><td>${format_currency(doc.labour)}</td></tr>

<tr><th>Total</th><td>${format_currency(doc.total_amt)}</td></tr>

</table>

`;

    let d = new frappe.ui.Dialog({

        title: doc.item,

        size: "large",

        fields: [

            {

                fieldtype: "HTML",

                fieldname: "details"

            }

        ]

    });

    d.show();

    d.fields_dict.details.$wrapper.html(html);

}

toggle_selection(name) {

    let index = this.selected_products.indexOf(name);

    if (index == -1) {

        this.selected_products.push(name);

    } else {

        this.selected_products.splice(index, 1);

    }

    this.render_products();

}
render_products() {

    const me = this;

    let html = "";

    if (me.filtered_products.length === 0) {

        $(".product-grid").html(`
            <div class="text-center" style="padding:80px;">
                <h4>No Quotations Found</h4>
            </div>
        `);

        $(".selected-text").html("0 Selected");
        return;
    }

    me.filtered_products.forEach(function (d) {

        let selected = me.selected_products.includes(d.name);

        html += `

<div class="quotation-card ${selected ? "selected" : ""}"
     data-name="${d.name}">

    <div class="quotation-image">

        <img
            src="${d.image || '/assets/frappe/images/ui-states/default-avatar.png'}"
            class="quotation-preview"
            data-image="${d.image || ''}"
        >

    </div>

    <div class="quotation-details">

        <div class="title">
            ${d.item || ""}
        </div>

        <div class="row">
            <span>Vendor</span>
            <b>${d.vendor || ""}</b>
        </div>

        <div class="row">
            <span>Vendor Code</span>
            <b>${d.vendor_code || ""}</b>
        </div>

        <div class="row">
            <span>Design No</span>
            <b>${d.design_no || ""}</b>
        </div>

        <div class="row">
            <span>Metal</span>
            <b>${d.metal || ""}</b>
        </div>

        <div class="row">
            <span>Gross Wt</span>
            <b>${flt(d.gr_wt || 0).toFixed(3)}</b>
        </div>

        <div class="row">
            <span>Net Wt</span>
            <b>${flt(d.net_wt || 0).toFixed(3)}</b>
        </div>

        <div class="row">
            <span>Gold Value</span>
            <b>${format_currency(d.gold_value || 0)}</b>
        </div>

        <div class="row">
            <span>Dia Shape 1</span>
            <b>${d.dia_shape1 || "-"}</b>
        </div>

        <div class="row">
            <span>Dia Size 1</span>
            <b>${d.dia_size1 || "-"}</b>
        </div>

        <div class="row">
            <span>Dia Pcs 1</span>
            <b>${d.dia_pcs1 || 0}</b>
        </div>

        <div class="row">
            <span>Dia Wt 1</span>
            <b>${flt(d.dia_wt1 || 0).toFixed(3)}</b>
        </div>

        <div class="row">
            <span>Dia Shape 2</span>
            <b>${d.dia_shape2 || "-"}</b>
        </div>

        <div class="row">
            <span>Dia Size 2</span>
            <b>${d.dia_size2 || "-"}</b>
        </div>

        <div class="row">
            <span>Dia Pcs 2</span>
            <b>${d.dia_pcs2 || 0}</b>
        </div>

        <div class="row">
            <span>Dia Wt 2</span>
            <b>${flt(d.dia_wt2 || 0).toFixed(3)}</b>
        </div>

        <div class="row">
            <span>Stone Pcs</span>
            <b>${d.stone_pcs || 0}</b>
        </div>

        <div class="row">
            <span>Stone Wt</span>
            <b>${flt(d.stone_wt || 0).toFixed(3)}</b>
        </div>

        <div class="row">
            <span>Stone Amt</span>
            <b>${format_currency(d.stone_amt || 0)}</b>
        </div>

        <div class="row">
            <span>Labour</span>
            <b>${format_currency(d.labour || 0)}</b>
        </div>

        <div class="row total">
            <span>Total</span>
            <b>${format_currency(d.total_amt || 0)}</b>
        </div>

    </div>

</div>

`;

    });

    $(".product-grid").html(html);

    $(".selected-text").html(
        `<b>${me.selected_products.length}</b> selected from <b>${me.filtered_products.length}</b>`
    );

    me.update_filter_count();

}
build_filters() {

    const me = this;

    me.filter_data = {

        vendor: {},

        metal: {},

        item: {},

        design_no: {}

    };

    me.products.forEach(function (d) {

        if (d.vendor) {

            if (!me.filter_data.vendor[d.vendor]) {

                me.filter_data.vendor[d.vendor] = 0;

            }

            me.filter_data.vendor[d.vendor]++;

        }

        if (d.metal) {

            if (!me.filter_data.metal[d.metal]) {

                me.filter_data.metal[d.metal] = 0;

            }

            me.filter_data.metal[d.metal]++;

        }

        if (d.item) {

            if (!me.filter_data.item[d.item]) {

                me.filter_data.item[d.item] = 0;

            }

            me.filter_data.item[d.item]++;

        }

        if (d.design_no) {

            if (!me.filter_data.design_no[d.design_no]) {

                me.filter_data.design_no[d.design_no] = 0;

            }

            me.filter_data.design_no[d.design_no]++;

        }

    });

    me.render_filters();

}
apply_filters() {

    const me = this;

    me.filtered_products = me.products.filter(function (d) {

        // Vendor
        if (
            me.selected_filters.vendor.length &&
            !me.selected_filters.vendor.includes(d.vendor)
        ) {
            return false;
        }

        // Metal
        if (
            me.selected_filters.metal.length &&
            !me.selected_filters.metal.includes(d.metal)
        ) {
            return false;
        }

        // Item
        if (
            me.selected_filters.item.length &&
            !me.selected_filters.item.includes(d.item)
        ) {
            return false;
        }

        // Design No
        if (
            me.selected_filters.design_no.length &&
            !me.selected_filters.design_no.includes(d.design_no)
        ) {
            return false;
        }

        return true;

    });

    me.render_products();
	me.update_filter_count();

    $(".filter-sidebar").removeClass("show");

}
search(text) {

    const me = this;

    text = text.toLowerCase().trim();

    if (!text) {

        me.apply_filters();

        return;

    }

    let data = me.products.filter(function (d) {

        // Apply selected filters first

        if (
            me.selected_filters.vendor.length &&
            !me.selected_filters.vendor.includes(d.vendor)
        )
            return false;

        if (
            me.selected_filters.metal.length &&
            !me.selected_filters.metal.includes(d.metal)
        )
            return false;

        if (
            me.selected_filters.item.length &&
            !me.selected_filters.item.includes(d.item)
        )
            return false;

        if (
            me.selected_filters.design_no.length &&
            !me.selected_filters.design_no.includes(d.design_no)
        )
            return false;

        let str = (
            (d.item || "") +
            " " +
            (d.vendor || "") +
            " " +
            (d.vendor_code || "") +
            " " +
            (d.design_no || "") +
            " " +
            (d.metal || "")
        ).toLowerCase();

        return str.includes(text);

    });

    me.filtered_products = data;

    me.render_products();
	me.update_filter_count();

}
update_filter_count() {

    let total = 0;

    Object.keys(this.selected_filters).forEach(key => {

        total += this.selected_filters[key].length;

    });

    $(".filter-count").html(

        total + " Filter(s)"

    );

}
select_all() {

    this.selected_products = [];

    this.filtered_products.forEach(d => {

        this.selected_products.push(d.name);

    });

    this.render_products();

}
clear_selection() {

    this.selected_products = [];

    this.render_products();

}


}
