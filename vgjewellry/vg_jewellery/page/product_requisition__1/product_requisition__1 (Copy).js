frappe.pages['product-requisition--1'].on_page_load = function(wrapper) {

    new ProductRequisition(wrapper);

};


class ProductRequisition {

    constructor(wrapper) {

        this.wrapper = wrapper;
        this.products = [];
        this.product_count = 0;

        this.page = frappe.ui.make_app_page({
            parent: wrapper,
            title: "Product Requisition For Counter",
            single_column: true
        });


        this.page.set_primary_action("Save", () => {

            this.save();

        });


        this.make_page();

    }

  
  make_sales_person_control() {

    let sales_control = frappe.ui.form.make_control({

        parent: $("#sales_person")[0],

        df: {
            fieldtype: "Link",
            label: "Sales Person",
            options: "Ornate_Salesman",
            only_select: 1,
            no_create: 1
        },

        render_input: true

    });


    sales_control.refresh();

    this.sales_control = sales_control;

}
  
  load_user_details() {
    frappe.call({
        method: "frappe.client.get",
        args: {
            doctype: "User",
            name: frappe.session.user
        },
        callback: (r) => {
            if (r.message) {
                // Requested By
                $("#request_by").val(r.message.username || "");

                // Branch
                $("#branch").val(r.message.ornate_branch || "");
            }
        }
    });
}

    make_page() {


        this.add_css();


        $(this.page.body).html(`

        <div class="pr-container">


            <!-- Header -->

            <div class="pr-card">

                <div class="pr-grid">


                    <div class="pr-field">

                        <label>
                            Request By
                        </label>

                        <input 
                            class="form-control"
                            id="request_by">

                    </div>



                    <div class="pr-field">

                        

                        <div id="sales_person"></div>

                    </div>


                </div>


            </div>




            <!-- Add Product Button -->

            <div class="pr-add-section">

                <button 
                    class="btn btn-primary"
                    id="add_product">

                    + Add Product

                </button>


            </div>




            <!-- Product Cards -->

            <div id="product_container">


            </div>



        </div>

        `);



        this.bind_events();
        this.load_user_details();
        this.make_sales_person_control();


    }




    bind_events() {


        let me = this;


        $("#add_product").click(function() {

            me.add_product_card();

        });


    }


upload_image(file) {

    return new Promise((resolve, reject) => {

        let form_data = new FormData();

        form_data.append("file", file);


        fetch("/api/method/upload_file", {

            method: "POST",

            headers: {
                "X-Frappe-CSRF-Token": frappe.csrf_token
            },

            body: form_data

        })

        .then(res => res.json())

        .then(res => {

            if (res.message && res.message.file_url) {

                resolve(res.message.file_url);

            } else {

                reject(res);

            }

        })

        .catch(err => {

            reject(err);

        });


    });

}

 async save() {
let doc = {

        doctype: "Product_Requisition_Form",

        request_by: $("#request_by").val(),

        sales_person: this.sales_control
            ? this.sales_control.get_value()
            : "",

        product_details: []

    };
    let cards = $("#product_container .product-card");


for (let card_element of cards) {


    let card = $(card_element);


    let image_urls = {


        image_1: "",
        image_2: "",
        image_3: "",
        image_4: ""


    };


    let images = [

        {
            selector: ".image1",
            field: "image_1"
        },

        {
            selector: ".image2",
            field: "image_2"
        },

        {
            selector: ".image3",
            field: "image_3"
        },

        {
            selector: ".image4",
            field: "image_4"
        }

    ];



    for (let img of images) {


        let input = card.find(img.selector)[0];


        if (input && input.files.length) {


            let file = input.files[0];


            let url = await this.upload_image(file);


            image_urls[img.field] = url;


        }


    }



    let row = {


        doctype: "Product_Requisition_Item",


        item: card.data("item_control")
            ? card.data("item_control").get_value()
            : "",


        variety: card.data("variety_control")
            ? card.data("variety_control").get_value()
            : "",


        weight_range: card.data("weight_control")
            ? card.data("weight_control").get_value()
            : "",


        size: card.data("size_control")
            ? card.data("size_control").get_value()
            : "",


        qty: card.find(".qty").val(),


        pcs: card.find(".pcs").val(),


        jota: card.find(".jota").val(),


        requester_remark: card.find(".remark").val(),



        image_1: image_urls.image_1,


        image_2: image_urls.image_2,


        image_3: image_urls.image_3,


        image_4: image_urls.image_4


    };


    doc.product_details.push(row);


}
frappe.call({

        method: "frappe.client.insert",

        args: {
            doc: doc
        },

        freeze: true,

        freeze_message: "Saving Product Requisition...",


        callback: function(r) {

            if(r.message) {

                frappe.msgprint(
                    "Saved " + r.message.name
                );

            }

        }

    });

}




    add_css() {


        if ($("#pr-css").length)
            return;



        $("head").append(`


<style id="pr-css">
.awesomplete .small{
	display:none;
}

.image-preview{
    margin-top:10px;
}

.thumb-box{
    position:relative;
    display:inline-block;
}

.remove-thumb{
    position:absolute;
    top:-5px;
    right:-5px;
    border-radius:50%;
}

.pr-container{

    padding:20px;
    max-width:1400px;
    margin:auto;

}



.pr-card,
.product-card{


    background:var(--card-bg);
    border:1px solid var(--border-color);
    border-radius:12px;
    padding:25px;
    margin-bottom:20px;


}



.pr-grid{


    display:grid;
    grid-template-columns:1fr 1fr;
    gap:20px;


}



.pr-field label{


    display:block;
    font-weight:600;
    margin-bottom:7px;


}



.product-title{


    font-size:18px;
    font-weight:700;
    margin-bottom:20px;
    color:var(--text-color);


}



.pr-add-section{


    margin-bottom:20px;


}



.product-card{


    box-shadow:0 3px 10px rgba(0,0,0,.08);


}



@media(max-width:768px){


.pr-grid{

    grid-template-columns:1fr;

}


}



</style>


        `);


    }



    add_product_card() {


        this.product_count++;

        let id = this.product_count;



        $("#product_container").append(`


    <div class="product-card"
         data-id="${id}">


        <div class="product-header">


            <div class="product-title">

                Product ${id}

            </div>


            <div>

                <button 
                    class="btn btn-sm btn-secondary copy-product">

                    Copy

                </button>


                <button 
                    class="btn btn-sm btn-danger delete-product">

                    Delete

                </button>


            </div>


        </div>





        <div class="pr-grid">



            <div class="pr-field">

               

                    <div class="item-field"></div>


            </div>




            <div class="pr-field">

                

                <div class="variety-field"></div>


            </div>





            <div class="pr-field">

               

               <div class="weight-field"></div>


            </div>





            <div class="pr-field">

                

                <div class="size-field"></div>

            </div>






            <div class="pr-field">

                <label>
                    Quantity
                </label>

                <input 
                    type="number"
                    class="form-control qty"
                    value="1">

            </div>






            <div class="pr-field">

                <label>
                    Pcs
                </label>

                <input 
                    type="number"
                    class="form-control pcs"
                    value="1">

            </div>






            <div class="pr-field">

                <label>
                    Jota
                </label>

                <input 
                    class="form-control jota">

            </div>



        </div>





        <div class="pr-field remark-box">


            <label>
                Requester Remark
            </label>


            <textarea 
                class="form-control remark"
                rows="4"
                placeholder="Enter item specific remark">

            </textarea>


        </div>




        <div class="image-section">


            <label>
                Product Images
            </label>


            <div class="image-grid">


                <div>
                    <small>Image 1</small>
                    <input 
                        type="file"
                        class="form-control image1"
                        accept="image/*">
                          <div class="image-preview preview1"></div>
                </div>



                <div>
                    <small>Image 2</small>
                    <input 
                        type="file"
                        class="form-control image2"
                        accept="image/*">
                        <div class="image-preview preview2"></div>

                </div>



                <div>
                    <small>Image 3</small>
                    <input 
                        type="file"
                        class="form-control image3"
                        accept="image/*">
                        <div class="image-preview preview3"></div>

                </div>



                <div>
                    <small>Image 4</small>
                    <input 
                        type="file"
                        class="form-control image4"
                        accept="image/*">
                        <div class="image-preview preview4"></div>
                </div>



            </div>


        </div>




    </div>


    `);


let card = $("#product_container .product-card").last();
this.handle_image_preview(card);

    let item_control = frappe.ui.form.make_control({
        parent: card.find(".item-field")[0],
        df: {
            fieldtype: "Link",
            options: "Ornate_Item_Master",
            label: "Item",
            only_select: 1,
        no_create: 1,
        onchange: () => {

            let item = item_control.get_value();

            

            if (item) {
                this.load_item_details(item, card);
                this.toggle_jota_field(item, card);
            }

        }
        },
        
        render_input: true
    });

    item_control.refresh();
    card.data("item_control", item_control);
   

    }

handle_image_preview(card) {

    card.find("input[type='file']").on("change", function() {

        let input = this;

        if (!input.files || !input.files[0])
            return;


        let file = input.files[0];


        if (!file.type.startsWith("image/")) {

            frappe.msgprint("Please select image file");
            input.value = "";
            return;

        }


        let image_class = $(input)
            .attr("class")
            .split(" ")
            .find(c => c.startsWith("image"));


        let preview_class = image_class.replace("image", "preview");


        let reader = new FileReader();


        reader.onload = function(e) {

            card.find("." + preview_class).html(`

                <div class="thumb-box">

                    <img src="${e.target.result}"
                         class="img-thumbnail"
                         style="
                            width:100px;
                            height:100px;
                            object-fit:cover;
                         ">

                    <button 
                        type="button"
                        class="btn btn-xs btn-danger remove-thumb">

                        ×

                    </button>

                </div>

            `);

        };


        reader.readAsDataURL(file);

    });


    card.on("click", ".remove-thumb", function() {

        let box = $(this).closest(".thumb-box");

        box.closest(".image-preview").empty();

    });

}

toggle_jota_field(item, card) {

    let jota_items = [
        86,
        17,
        57,
        10292,
        10276,
        10000061,
        10000036,
        10000018,
        10000010
    ];


    if (jota_items.includes(Number(item))) {

        card.find(".jota").closest(".pr-field").show();

    } else {

        card.find(".jota").closest(".pr-field").hide();

    }

}

load_item_details(item, card) {


    frappe.call({

        method: "vgjewellry.master_api.get_parent_variety_from_item",

        args: {
            item: item
        },

        callback: (r) => {

            if (!r.message)
                return;

card.find(".variety-field").empty();
    card.find(".weight-field").empty();
    card.find(".size-field").empty();
            // Variety Link Control
            let variety_control = frappe.ui.form.make_control({

                parent: card.find(".variety-field")[0],

                df: {
                    fieldtype: "Link",
                    label: "Variety",
                    options: "Ornate_Variety_Master",
                    only_select: 1,
        			no_create: 1,
                    get_query: function() {
                        return {
                            filters: {
                                name: ["in", r.message]
                            },
                            order_by: "item_name asc"
                        };
                    }
                },

                render_input: true

            });

            variety_control.refresh();
            card.data("variety_control", variety_control);



            // Weight Range
            let weight_control = frappe.ui.form.make_control({

                parent: card.find(".weight-field")[0],

                df: {
                    fieldtype: "Link",
                    label: "Weight Range",
                    options: "weight_range",
                    only_select: 1,
        			no_create: 1,
                    get_query: function() {
                        return {
                            filters: {
                                item: item
                            }
                        };
                    }
                },

                render_input:true

            });

            weight_control.refresh();
            card.data("weight_control", weight_control);



            // Size
            let size_control = frappe.ui.form.make_control({

                parent: card.find(".size-field")[0],

                df: {
                    fieldtype:"Link",
                    label:"Size",
                    options:"Ornate_Size_Master",
                    only_select: 1,
        			no_create: 1,
                    get_query:function(){

                        return {
                            filters:{
                                item:item
                            }
                        };

                    }
                },

                render_input:true

            });


            size_control.refresh();
			card.data("size_control", size_control);

        }

    });

}
    handle_image_upload() {

        let me = this;


        $(".product-card").off(
            "change",
            ".product-image"
        );


        $(document).on(
            "change",
            ".product-image",
            function(e) {


                let input = this;

                let card = $(this)
                    .closest(".product-card");


                let preview_box = card.find(
                    ".image-preview"
                );


                let files = Array.from(
                    input.files
                );


                if (files.length > 1) {

                    frappe.msgprint(
                        "Only one image allowed per field"
                    );

                    input.value = "";

                    return;

                }



                let file = files[0];


                if (!file)
                    return;



                if (!file.type.startsWith("image/")) {


                    frappe.msgprint(
                        "Please select image file"
                    );

                    input.value = "";

                    return;

                }




                let reader = new FileReader();


                reader.onload = function(ev) {


                    preview_box.html(`


                <div class="preview-image">


                    <img src="${ev.target.result}">


                    <button 
                    class="btn btn-xs btn-danger remove-image">

                    ×

                    </button>


                </div>


                `);



                };


                reader.readAsDataURL(file);



            });



    }
  
}    
