frappe.provide("vgjewellery");

frappe.pages["product-stock-galler"].on_page_load = function (wrapper) {
    new vgjewellery.ProductStockGallery(wrapper);
};

vgjewellery.ProductStockGallery = class ProductStockGallery {

    constructor(wrapper) {
        this.wrapper = $(wrapper);
        this.page = null;
        this.filters = {};
this.item_list = [];
this.variety_list = [];
this.weight_list = [];
        this.init();
    }

    //====================================================
    // Initialization
    //====================================================

    init() {
        this.make_page();
        this.make_html();
        this.make_filters();
        this.bind_events();
        this.set_default_values();
	this.load_branches();

    }

    //====================================================
    // Create Page
    //====================================================

    make_page() {

        this.page = frappe.ui.make_app_page({
            parent: this.wrapper,
            title: __("Product Stock Gallery"),
            single_column: true
        });

    }

    //====================================================
    // Create HTML
    //====================================================

    make_html() {

        $(this.page.body).html(`
            <div class="product-stock-wrapper">

                <div class="row">

                    <div class="col-md-3 branch_area"></div>

                    <div class="col-md-3 item_area"></div>

                    <div class="col-md-3 variety_area"></div>

                    <div class="col-md-3 weight_area"></div>

                </div>

                <br>

                <div class="text-right">

                    <button class="btn btn-primary btn-search">
                        Search
                    </button>

                    <button class="btn btn-default btn-clear">
                        Clear
                    </button>

                </div>

                <hr>

                <div class="result_area"></div>

            </div>
        `);

    }

    //====================================================
    // Create All Filters
    //====================================================

    make_filters() {

        this.make_branch_filter();
        this.make_item_filter();
        this.make_variety_filter();
        this.make_weight_filter();

    }

    //====================================================
// Branch Filter
//====================================================
make_branch_filter() {
    let me = this;

    this.branch_list = [];
	this.branch_list = [
    {
        value: "ANY",
        label: "Any Branch"
    }
];

    this.filters.branch = frappe.ui.form.make_control({

        parent: $(this.page.body).find(".branch_area"),

        render_input: true,

        df: {

            label: __("Branch"),

            fieldname: "branch",

            fieldtype: "MultiSelectList",

            get_data(txt) {

                return me.branch_list;

            },

            onchange() {

                me.reset_item_filter();

                me.reset_variety_filter();

                me.reset_weight_filter();

                me.load_items();

            }

        }

    });

}


//====================================================
// Item Filter
//====================================================

make_item_filter() {

    let me = this;

    this.filters.item = frappe.ui.form.make_control({
        parent: $(this.page.body).find(".item_area"),
        render_input: true,
        df: {
            label: __("Item"),
            fieldname: "item",
            fieldtype: "MultiSelectList",

            get_data(txt) {

                return me.item_list || [];

            },

            onchange() {

                me.reset_variety_filter();
                me.reset_weight_filter();

                me.load_varieties();

            }
        }
    });

}


//====================================================
// Variety Filter
//====================================================

make_variety_filter() {

    let me = this;

    this.filters.variety = frappe.ui.form.make_control({
        parent: $(this.page.body).find(".variety_area"),
        render_input: true,
        df: {
            label: __("Variety"),
            fieldname: "variety",
            fieldtype: "MultiSelectList",

            get_data(txt) {

                return me.variety_list || [];

            },

            onchange() {

                me.reset_weight_filter();

                me.load_weight_ranges();

            }
        }
    });

}


//====================================================
// Weight Range Filter
//====================================================

make_weight_filter() {

    let me = this;

    this.filters.weight = frappe.ui.form.make_control({
        parent: $(this.page.body).find(".weight_area"),
        render_input: true,
        df: {
            label: __("Weight Range"),
            fieldname: "weight_range",
            fieldtype: "MultiSelectList",

            get_data(txt) {

                return me.weight_list || [];

            }
        }
    });

}	
    //====================================================
    // Events
    //====================================================

    bind_events() {

        let me = this;

        $(this.page.body).on("click", ".btn-search", function () {
            me.search();
        });

        $(this.page.body).on("click", ".btn-clear", function () {
            me.clear_filters();
        });

	    $(this.page.body).on("click", ".stock-pcs-btn", (e) => {

    e.preventDefault();

    const el = $(e.currentTarget);

    this.show_stock_images({
        branch_id: el.data("branch-id"),
        item_id: el.data("item-id"),
        variety_id: el.data("variety-id"),
        weight_range: el.data("weight-range")
    });

});
	    $(document).off("click", ".stock-image");
	    $(document).on("click",".stock-image",function(e){
e.preventDefault();
    e.stopPropagation();

    me.show_full_image($(this).attr("src"));

});

    }

async show_stock_images(filters) {

    frappe.dom.freeze("Loading Images...");

    try {

        let r = await this.call(
            "vgjewellry.vg_jewellery.page.product_stock_galler.product_stock_galler.get_stock_images",
            {
                branch_id: filters.branch_id,
                item_id: filters.item_id,
                variety_id: filters.variety_id,
                weight_range: filters.weight_range
            }
        );

        this.show_image_dialog(r.message || []);

    } finally {

        frappe.dom.unfreeze();

    }

}
show_image_dialog(images) {

    let html = '<div class="row">';

    images.forEach(img => {

        let src = img.ImagePath1 || "/assets/frappe/images/ui-placeholder.svg";
	     let image_url = "/external-image/" +
        src.split("/").map(encodeURIComponent).join("/");
   

        html += `
            <div class="col-md-3 mb-3">

                <div class="card stock-image">

                    <img class="stock-image"
			             src="${image_url}"


                         style="width:100%;height:220px;object-fit:contain;">

                    <div class="card-body">

                        <b>${img.LabelNo}</b>

                        <br>

                        Net Wt : ${img.NetWt}



                    </div>

                </div>

            </div>
        `;

    });

    html += "</div>";

    let d = new frappe.ui.Dialog({

        title: "Current Stock Images",

        size: "extra-large",

        fields: [
            {
                fieldtype: "HTML",
                fieldname: "images"
            }
        ]

    });

    d.show();

    d.fields_dict.images.$wrapper.html(html);

}

show_full_image_nto(src) {

    let d = new frappe.ui.Dialog({
        title: "Image Preview",
        size: "extra-large",
        fields: [
            {
                fieldtype: "HTML",
                fieldname: "preview"
            }
        ]
    });

    d.show();

    d.fields_dict.preview.$wrapper.html(`
        <style>

            .image-viewer{
                width:100%;
                height:80vh;
                background:#000;
                overflow:hidden;
                position:relative;
                display:flex;
                justify-content:center;
                align-items:center;
                touch-action:none;
            }

            #zoomImage{
                position:absolute;
                left:50%;
                top:50%;
                transform:translate(-50%,-50%) scale(1);
                transform-origin:center center;

                max-width:100%;
                max-height:100%;

                width:auto;
                height:auto;

                object-fit:contain;

                user-select:none;
                -webkit-user-drag:none;
                touch-action:none;
            }

            .viewer-toolbar{
                display:flex;
                justify-content:center;
                gap:10px;
                margin-bottom:10px;
            }

        </style>

        <div class="viewer-toolbar">

            <button class="btn btn-primary btn-sm" id="zoomIn">+</button>

            <button class="btn btn-primary btn-sm" id="zoomOut">-</button>

            <button class="btn btn-secondary btn-sm" id="zoomReset">
                Reset
            </button>

        </div>

        <div class="image-viewer" id="viewer">

            <img id="zoomImage" src="${src}" draggable="false">

        </div>
    `);

    const wrapper = d.fields_dict.preview.$wrapper;

    const viewer = wrapper.find("#viewer")[0];

    const image = wrapper.find("#zoomImage")[0];

    image.onload = () => {

        const vw = viewer.clientWidth;
        const vh = viewer.clientHeight;

        const iw = image.naturalWidth;
        const ih = image.naturalHeight;

        const scale = Math.min(vw / iw, vh / ih);

        image.style.width = (iw * scale) + "px";
        image.style.height = (ih * scale) + "px";

        image.style.maxWidth = "none";
        image.style.maxHeight = "none";

        this.enable_touch_zoom(viewer, image);

    };

    wrapper.find("#zoomIn").on("click", () => {

        image.scale = (image.scale || 1) + .25;

        image.style.transform =
            `translate(calc(-50% + ${image.tx || 0}px),
                       calc(-50% + ${image.ty || 0}px))
             scale(${image.scale})`;

    });

    wrapper.find("#zoomOut").on("click", () => {

        image.scale = Math.max(1, (image.scale || 1) - .25);

        image.style.transform =
            `translate(calc(-50% + ${image.tx || 0}px),
                       calc(-50% + ${image.ty || 0}px))
             scale(${image.scale})`;

    });

    wrapper.find("#zoomReset").on("click", () => {

        image.scale = 1;
        image.tx = 0;
        image.ty = 0;

        image.style.transform =
            "translate(-50%,-50%) scale(1)";

    });

}
show_full_image(src) {

    let dialog = new frappe.ui.Dialog({
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
        <style>

            .image-viewer{
                position:relative;
                width:100%;
                height:80vh;
                background:#000;
                overflow:hidden;
                border-radius:8px;
                touch-action:none;
                user-select:none;
            }

            .image-viewer img{
                position:absolute;
                left:50%;
                top:50%;
                transform:translate(-50%,-50%) scale(1);
                transform-origin:center center;
                max-width:none;
                max-height:none;
                cursor:grab;
                -webkit-user-drag:none;
                user-select:none;
		object-fit:
            }

            .viewer-toolbar{
                display:flex;
                justify-content:center;
                gap:10px;
                margin-bottom:10px;
            }

            .viewer-toolbar button{
                width:42px;
                height:42px;
                border:none;
                border-radius:50%;
                background:#007bff;
                color:#fff;
                font-size:20px;
                cursor:pointer;
            }

            .viewer-toolbar button:hover{
                background:#0056b3;
            }

        </style>

        <div class="viewer-toolbar">

            <button id="zoomIn">+</button>

            <button id="zoomOut">−</button>

            <button id="zoomReset">⟳</button>

        </div>

        <div class="image-viewer" id="viewer">

            <img
                id="zoomImage"
                src="${src}"
                draggable="false"
            >

        </div>
    `);

    const wrapper = dialog.fields_dict.preview.$wrapper;

    const container = wrapper.find("#viewer")[0];
    const image = wrapper.find("#zoomImage")[0];

    this.enable_touch_zoom(container, image);

    wrapper.find("#zoomIn").on("click", () => {

        image.scale = (image.scale || 1) + 0.25;

        image.style.transform =
            `translate(calc(-50% + ${image.tx||0}px),calc(-50% + ${image.ty||0}px)) scale(${image.scale})`;

    });

    wrapper.find("#zoomOut").on("click", () => {

        image.scale = Math.max(1,(image.scale||1)-0.25);

        image.style.transform =
            `translate(calc(-50% + ${image.tx||0}px),calc(-50% + ${image.ty||0}px)) scale(${image.scale})`;

    });

    wrapper.find("#zoomReset").on("click", () => {

        image.scale = 1;
        image.tx = 0;
        image.ty = 0;

        image.style.transform =
            "translate(-50%,-50%) scale(1)";

    });

}
show_full_image1(image) {

    let d = new frappe.ui.Dialog({
        title: "Image Preview",
        size: "extra-large",
        fields: [
            {
                fieldtype: "HTML",
                fieldname: "preview"
            }
        ]
    });

    d.show();

    d.fields_dict.preview.$wrapper.html(`
        <div id="viewer"
            style="
                width:100%;
                height:80vh;
                overflow:hidden;
                background:#000;
                touch-action:none;
                position:relative;
            ">

            <img
                id="zoomImage"
                src="${image}"
                draggable="false"
                style="
                    position:absolute;
                    left:50%;
                    top:50%;
                    max-width:none;
                    transform:translate(-50%,-50%) scale(1);
                    transform-origin:center center;
                    user-select:none;
                    -webkit-user-drag:none;
                ">

        </div>
    `);
setTimeout(() => {
       // this.enable_touch_zoom();
    }, 500);


}

enable_touch_zoom(container, image) {

    let scale = 1;
    let tx = 0;
    let ty = 0;

    let pointers = [];

    let startDistance = 0;
    let startScale = 1;

    let startX = 0;
    let startY = 0;

    let startTx = 0;
    let startTy = 0;

    let lastTap = 0;

    function update() {

        image.scale = scale;
        image.tx = tx;
        image.ty = ty;

        image.style.transform =
            `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(${scale})`;

    }

    function distance(a, b) {

        return Math.sqrt(
            Math.pow(a.clientX - b.clientX, 2) +
            Math.pow(a.clientY - b.clientY, 2)
        );

    }

    container.onpointerdown = function(e) {

        container.setPointerCapture(e.pointerId);

        pointers.push(e);

        // Double Tap
        let now = Date.now();

        if (now - lastTap < 250) {

            if (scale == 1) {

                scale = 2;

            } else {

                scale = 1;
                tx = 0;
                ty = 0;

            }

            update();
        }

        lastTap = now;

        if (pointers.length == 1) {

            startX = e.clientX;
            startY = e.clientY;

            startTx = tx;
            startTy = ty;

        }

        if (pointers.length == 2) {

            startDistance = distance(
                pointers[0],
                pointers[1]
            );

            startScale = scale;

        }

    };

    container.onpointermove = function(e) {

        for (let i = 0; i < pointers.length; i++) {

            if (pointers[i].pointerId == e.pointerId) {

                pointers[i] = e;
                break;

            }

        }

        // One Finger Pan
        if (pointers.length == 1) {

            tx = startTx + (e.clientX - startX);
            ty = startTy + (e.clientY - startY);

            update();

        }

        // Pinch Zoom
        if (pointers.length == 2) {

            let newDistance = distance(
                pointers[0],
                pointers[1]
            );

            scale = startScale * (newDistance / startDistance);

            if (scale < 1)
                scale = 1;

            if (scale > 8)
                scale = 8;

            update();

        }

    };

    container.onpointerup = function(e) {

        pointers = pointers.filter(
            p => p.pointerId !== e.pointerId
        );

    };

    container.onpointercancel = function(e) {

        pointers = pointers.filter(
            p => p.pointerId !== e.pointerId
        );

    };

    container.onpointerleave = function(e) {

        pointers = pointers.filter(
            p => p.pointerId !== e.pointerId
        );

    };

    // Mouse Wheel Zoom
    container.onwheel = function(e) {

        e.preventDefault();

        scale += e.deltaY < 0 ? 0.2 : -0.2;

        if (scale < 1)
            scale = 1;

        if (scale > 8)
            scale = 8;

        update();

    };

    update();

}
enable_touch_zoom2(container, image) {

    if (!container || !image) {
        console.log("Viewer not found.");
        return;
    }

    let scale = 1;
    let translateX = 0;
    let translateY = 0;

    let pointers = [];

    let startDistance = 0;
    let startScale = 1;

    let startX = 0;
    let startY = 0;

    let lastTap = 0;

    function updateTransform() {

        image.style.transform =
            `translate(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px)) scale(${scale})`;

    }

    function getDistance(p1, p2) {

        return Math.sqrt(
            Math.pow(p1.clientX - p2.clientX, 2) +
            Math.pow(p1.clientY - p2.clientY, 2)
        );

    }

    container.onpointerdown = function (e) {

        container.setPointerCapture(e.pointerId);

        pointers.push(e);

        let now = Date.now();

        // Double Tap
        if (now - lastTap < 300) {

            if (scale == 1) {
                scale = 2;
            } else {
                scale = 1;
                translateX = 0;
                translateY = 0;
            }

            updateTransform();
        }

        lastTap = now;

        if (pointers.length == 1) {

            startX = e.clientX - translateX;
            startY = e.clientY - translateY;

        }

        if (pointers.length == 2) {

            startDistance = getDistance(
                pointers[0],
                pointers[1]
            );

            startScale = scale;

        }

    };

    container.onpointermove = function (e) {

        for (let i = 0; i < pointers.length; i++) {

            if (pointers[i].pointerId == e.pointerId) {
                pointers[i] = e;
            }

        }

        // Pan
        if (pointers.length == 1) {

            translateX = e.clientX - startX;
            translateY = e.clientY - startY;

            updateTransform();

        }

        // Pinch Zoom
        if (pointers.length == 2) {

            let distance = getDistance(
                pointers[0],
                pointers[1]
            );

            scale = startScale * (distance / startDistance);

            if (scale < 1)
                scale = 1;

            if (scale > 8)
                scale = 8;

            updateTransform();

        }

    };

    container.onpointerup = function (e) {

        pointers = pointers.filter(
            p => p.pointerId != e.pointerId
        );

    };

    container.onpointercancel = function (e) {

        pointers = pointers.filter(
            p => p.pointerId != e.pointerId
        );

    };

}
enable_touch_zoom1() {

    const container = document.getElementById("viewer");
    const image = document.getElementById("zoomImage");

    let scale = 1;
    let translateX = 0;
    let translateY = 0;

    let pointers = [];

    let startDistance = 0;
    let startScale = 1;

    let startX = 0;
    let startY = 0;

    let lastTap = 0;

    function updateTransform() {

        image.style.transform =
            `translate(calc(-50% + ${translateX}px),
                       calc(-50% + ${translateY}px))
             scale(${scale})`;

    }

    function getDistance(p1,p2){

        return Math.sqrt(

            Math.pow(p1.clientX-p2.clientX,2)+
            Math.pow(p1.clientY-p2.clientY,2)

        );

    }

    container.onpointerdown = function(e){

        container.setPointerCapture(e.pointerId);

        pointers.push(e);

        // Double tap
        let now = Date.now();

        if(now-lastTap<300){

            scale = scale==1 ? 2 : 1;

            translateX=0;
            translateY=0;

            updateTransform();

        }

        lastTap=now;

        if(pointers.length==1){

            startX=e.clientX-translateX;
            startY=e.clientY-translateY;

        }

        if(pointers.length==2){

            startDistance=getDistance(
                pointers[0],
                pointers[1]
            );

            startScale=scale;

        }

    };

    container.onpointermove=function(e){

        for(let i=0;i<pointers.length;i++){

            if(pointers[i].pointerId==e.pointerId){

                pointers[i]=e;

            }

        }

        if(pointers.length==1){

            translateX=e.clientX-startX;
            translateY=e.clientY-startY;

            updateTransform();

        }

        if(pointers.length==2){

            let newDistance=getDistance(
                pointers[0],
                pointers[1]
            );

            scale=startScale*
                (newDistance/startDistance);

            if(scale<1)
                scale=1;

            if(scale>8)
                scale=8;

            updateTransform();

        }

    };

    container.onpointerup=function(e){

        pointers=pointers.filter(
            p=>p.pointerId!=e.pointerId
        );

    };

}

    //====================================================
    // Defaults
    //====================================================

    set_default_values() {

    }

    //====================================================
    // API
    //====================================================

    call(method, args = {}) {

        return frappe.call({
            method: method,
            args: args
        });

    }

    //====================================================
    // Branch
    //====================================================
async load_branches() {

    let r = await this.call(
        "vgjewellry.master_api.get_all_branch"
    );

    this.branch_list = [];
	this.branch_list = [
    {
        value: "ANY",
        label: "Any Branch"
    }
];


    if (r.message) {

        r.message.forEach(d => {

            this.branch_list.push({

                value: d.branch_id,

                label: d.branch,

                description: d.branch

            });

        });

    }

    this.filters.branch.refresh();


    this.load_items();

}


//====================================================
// Load Items
//====================================================
async load_items() {

    let branch = this.filters.branch.get_value();

    // Nothing selected
    if (!branch || branch.length === 0) {
        return;
    }

    let r = await this.call(
        "vgjewellry.vg_jewellery.page.product_stock_galler.product_stock_galler.get_all_branch_item",
        {
            branch: JSON.stringify(branch)
        }
    );

    this.item_list = [];

    if (r.message) {

        this.item_list = r.message.map(row => ({
            value: row.item_id,
            label: row.item,
            description: row.item
        }));

    }

    this.filters.item.refresh();

}

//====================================================
// Load Variety
//====================================================

async load_varieties() {

    let branch = this.filters.branch.get_value() || [];
    let item = this.filters.item.get_value() || [];

    if (!branch.length || !item.length) {
        return;
    }

    let r = await this.call(
        "vgjewellry.vg_jewellery.page.product_stock_galler.product_stock_galler.get_all_branch_item_variety",
        {
            branch: JSON.stringify(branch),
            item: JSON.stringify(item)
        }
    );

    this.variety_list = [];

    if (r.message) {

        this.variety_list = r.message.map(row => ({
            value: row.variety_id,
            label: row.variety,
            description: row.variety
        }));

    }

    this.filters.variety.refresh();

}


//====================================================
// Load Weight Range
//====================================================

async load_weight_ranges() {

    let branch = this.filters.branch.get_value() || [];
    let item = this.filters.item.get_value() || [];
    let variety = this.filters.variety.get_value() || [];

    if (!branch.length || !item.length || !variety.length) {
        return;
    }

    let r = await this.call(
        "vgjewellry.vg_jewellery.page.product_stock_galler.product_stock_galler.get_all_branch_item_variety_weight_range",
        {
            branch: JSON.stringify(branch),
            item: JSON.stringify(item),
            variety: JSON.stringify(variety)
        }
    );

    this.weight_list = [];

    if (r.message) {

        this.weight_list = r.message.map(row => ({
            value: row.weight_range,
            label: row.weight_range,
            description: row.weight_range
        }));

    }

    this.filters.weight.refresh();

}

render_table(data) {

    let wrapper = $(this.page.body).find(".result_area");

    wrapper.empty();

    if (!data || data.length === 0) {

        wrapper.html("<div class='text-center p-4'>No Data Found</div>");
        return;

    }

    if (this.datatable) {
        this.datatable.destroy();
    }

    this.datatable = new DataTable(wrapper[0], {

        columns: [
            "Branch",
            "Item",
            "Variety",
            "Weight Range",
            //"Ideal Weight",
            //"Stock Weight",
            "Stock Pcs",
            "Target Pcs"
        ],

        data: data.map(d => [
            d.branch,
            d.item,
            d.variety,
            d.weight_range,
            //d.ideal_weight,
            //d.stock_weight,
	    `<button class="btn btn-xs btn-primary stock-pcs-btn"
	        data-branch-id="${d.branch_id}"
        data-item-id="${d.item_id}"
        data-variety-id="${d.variety_id}"
        data-weight-range="${d.weight_range}">
        ${d.stock_pcs}
    </button>`,	
            d.target_pcs
        ]),

        serialNoColumn: true,
        inlineFilters: true,
        layout: "fluid"

    });

}
//====================================================
// Render Table
//====================================================

render_table1(data) {

    let wrapper = $(this.page.body).find(".result_area");

    wrapper.empty();

    if (!data.length) {

        wrapper.html(`
            <div class="text-muted text-center p-5">
                No Record Found
            </div>
        `);

        return;
    }

    if (this.datatable) {

        this.datatable.destroy();

    }

    let columns = [

        {
            name: "Branch",
            id: "branch",
            editable: false,
            width: 170
        },

        {
            name: "Item",
            id: "item",
            editable: false,
            width: 150
        },

        {
            name: "Variety",
            id: "variety",
            editable: false,
            width: 170
        },

        {
            name: "Weight Range",
            id: "weight_range",
            editable: false,
            width: 120
        },

        {
            name: "Qty",
            id: "qty",
            editable: false,
            width: 80
        },

        {
            name: "Weight",
            id: "weight",
            editable: false,
            width: 100
        }

    ];

    let rows = [];

    data.forEach(row => {

        rows.push([
            row.branch,
            row.item,
            row.variety,
            row.weight_range,
            row.qty,
            row.weight
        ]);

    });

    this.datatable = new DataTable(wrapper[0], {

        columns: columns,

        data: rows,

        layout: "fixed",

        checkboxColumn: false,

        serialNoColumn: true,

        inlineFilters: true,

        cellHeight: 35,

        noDataMessage: "No Records"

    });

}

    //====================================================
    // Render Cards
    //====================================================

    render_cards(data) {

    }

    //====================================================
    // Result
    //====================================================

//====================================================
// Render Result
//====================================================

render_result(data) {

    this.render_table(data);

}

    //====================================================
    // Grid
    //====================================================

    refresh_grid() {

    }

    //====================================================
    // Gallery
    //====================================================

    refresh_gallery() {

    }

    //====================================================
    // Export
    //====================================================

    export_excel() {

    }

    //====================================================
    // Filter Values
    //====================================================

    get_filters() {

        return {
            branch: this.filters.branch?.get_value() || [],
            item: this.filters.item?.get_value() || [],
            variety: this.filters.variety?.get_value() || [],
            weight_range: this.filters.weight?.get_value() || []
        };

    }

    //====================================================
    // Validation
    //====================================================

    validate_filters() {

        let filters = this.get_filters();

        if (!filters.branch.length) {
            frappe.msgprint(__("Please select Branch."));
            return false;
        }

        return true;

    }

    //====================================================
    // Clear
    //====================================================
//====================================================
// Clear Filters
//====================================================

clear_filters() {

    this.filters.branch.set_value([]);

    this.reset_item_filter();

    this.reset_variety_filter();

    this.reset_weight_filter();

    $(this.page.body).find(".result_area").empty();

}

//====================================================
// Branch Filter
//====================================================

make_branch_filter1() {

    let me = this;

    this.filters.branch = frappe.ui.form.make_control({
        parent: $(this.page.body).find(".branch_area"),
        render_input: true,
        df: {
            label: __("Branch"),
            fieldname: "branch",
            fieldtype: "MultiSelectList",
            reqd: 1,

            get_data(txt) {
                return frappe.db.get_link_options("Branch", txt);
            },

            onchange() {

                me.reset_item_filter();
                me.reset_variety_filter();
                me.reset_weight_filter();

                me.load_items();
            }
        }
    });

}


//====================================================
// Item Filter
//====================================================

make_item_filter() {

    let me = this;

    this.filters.item = frappe.ui.form.make_control({
        parent: $(this.page.body).find(".item_area"),
        render_input: true,
        df: {
            label: __("Item"),
            fieldname: "item",
            fieldtype: "MultiSelectList",

            get_data(txt) {

                return me.item_list || [];

            },

            onchange() {

                me.reset_variety_filter();
                me.reset_weight_filter();

                me.load_varieties();

            }
        }
    });

}


//====================================================
// Variety Filter
//====================================================

make_variety_filter() {

    let me = this;

    this.filters.variety = frappe.ui.form.make_control({
        parent: $(this.page.body).find(".variety_area"),
        render_input: true,
        df: {
            label: __("Variety"),
            fieldname: "variety",
            fieldtype: "MultiSelectList",

            get_data(txt) {

                return me.variety_list || [];

            },

            onchange() {

                me.reset_weight_filter();

                me.load_weight_ranges();

            }
        }
    });

}


//====================================================
// Weight Range Filter
//====================================================

make_weight_filter() {

    let me = this;

    this.filters.weight = frappe.ui.form.make_control({
        parent: $(this.page.body).find(".weight_area"),
        render_input: true,
        df: {
            label: __("Weight Range"),
            fieldname: "weight_range",
            fieldtype: "MultiSelectList",

            get_data(txt) {

                return me.weight_list || [];

            }
        }
    });

}
    //====================================================
    // Loading
    //====================================================

    show_loading() {

        frappe.dom.freeze("Loading...");

    }

    hide_loading() {

        frappe.dom.unfreeze();

    }

    //====================================================
    // Message
    //====================================================

    show_message(message) {

        frappe.msgprint(message);

    }

//====================================================
// Reset Item Filter
//====================================================
reset_item_filter() {

    this.item_list = [];

    if (this.filters.item) {
        this.filters.item.set_value([]);
        this.filters.item.refresh();
    }
}

//====================================================
// Reset Variety Filter
//====================================================
reset_variety_filter() {

    this.variety_list = [];

    if (this.filters.variety) {
        this.filters.variety.set_value([]);
        this.filters.variety.refresh();
    }
}

//====================================================
// Reset Weight Filter
//====================================================
reset_weight_filter() {

    this.weight_list = [];

    if (this.filters.weight) {
        this.filters.weight.set_value([]);
        this.filters.weight.refresh();
    }
}

//====================================================
// Search
//====================================================

async search() {

    let branch = this.filters.branch.get_value() || [];
    let item = this.filters.item.get_value() || [];
    let variety = this.filters.variety.get_value() || [];
    let weight_range = this.filters.weight.get_value() || [];

    if (!branch.length) {
        frappe.msgprint(__("Please select Branch."));
        return;
    }

    if (!item.length) {
        frappe.msgprint(__("Please select Item."));
        return;
    }

    this.show_loading();

    try {

        let r = await this.call(
            "vgjewellry.vg_jewellery.page.product_stock_galler.product_stock_galler.get_todays_stock",
            {
                branch: JSON.stringify(branch),
                item: JSON.stringify(item),
                variety: JSON.stringify(variety),
                weight_range: JSON.stringify(weight_range)
            }
        );

        this.stock_data = r.message || [];

        this.render_table(this.stock_data);

    } catch (e) {

        frappe.msgprint(e.message);

    } finally {

        this.hide_loading();

    }

}
};
