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



        /*this.page.set_primary_action("Save", () => {

            this.save();

        });*/



        //this.make_page();
        this.make_list_page();


    }

make_list_page() {

    this.add_css();

    $(this.page.body).html(`

        <div class="pr-container">

            <div class="pr-card">

                <button 
                class="btn btn-primary"
                id="add_requisition">

                    + Add Product Requisition

                </button>

            </div>


            <div class="pr-card">

                <div class="product-title">
                    Product Requisition List
                </div>

                <div id="requisition_list">
                    
                </div>

            </div>


        </div>

    `);


    $("#add_requisition").click(() => {

        this.make_page();

    });


    this.load_requisition_list();

}
load_requisition_list(){

    frappe.call({

        method:"frappe.client.get_list",

        args:{
            doctype:"Product_Requisition_Form",

            fields:[
                "name",
                "request_by",
                "sales_person",
                "sales_person.sales_man_name",
                "creation"
            ],

            order_by:"creation desc"

        },

        callback:(r)=>{


            let html = `

            <table class="table table-bordered">

            <tr>
                <th>Name</th>
                <th>Request By</th>
                <th>Sales Person</th>
                
                <th>Date</th>
            </tr>

            `;


            (r.message || []).forEach(row=>{

let date = frappe.datetime.str_to_obj(row.creation);

    let formatted_date =
        String(date.getDate()).padStart(2, "0") + "-" +
        String(date.getMonth() + 1).padStart(2, "0") + "-" +
        date.getFullYear();

                html += `

                <tr>

                <td>
    <a href="#" 
       class="req-link"
       data-name="${row.name}">
        ${row.name}
    </a>
</td>

                <td>
                    ${row.request_by || ""}
                </td>

               
				<td>
    ${row.sales_man_name || ""}
</td>
                <td>
                    ${formatted_date|| ""}
                </td>

                </tr>

                `;


            });


            html += `</table>`;


            $("#requisition_list").html(html);
            $(".req-link").click((e)=>{

    e.preventDefault();

    let name = $(e.currentTarget).data("name");

    this.load_requisition_for_edit(name);

});


        }

    });


}

async load_requisition_for_edit(name){


    frappe.call({

        method:"frappe.client.get",

        args:{
            doctype:"Product_Requisition_Form",
            name:name
        },


        callback: async (r)=>{


            if(!r.message)
                return;


            let doc = r.message;


            // Open form page
            this.make_page();


            // Header fields
            $("#request_by").val(doc.request_by || "");


            if(this.sales_control){

                this.sales_control.set_value(
                    doc.sales_person
                );

            }



            // Load child products

            this.products = [];


            for (let row of doc.product_details) {

    let item_name = await this.get_display_value(
        "Ornate_Item_Master",
        row.item,
        "item_name"
    );

    let variety_name = await this.get_display_value(
        "Ornate_Variety_Master",
        row.variety,
        "variety_name"
    );

    let weight_range_name = await this.get_display_value(
        "weight_range",
        row.weight_range,
        "weight_range"
    );

    let size_name = await this.get_display_value(
        "Ornate_Size_Master",
        row.size,
        "size"
    );


    this.products.push({

        item: row.item,
        item_name: item_name,

        variety: row.variety,
        variety_name: variety_name,

        weight_range: row.weight_range,
        weight_range_name: weight_range_name,

        size: row.size,
        size_name: size_name,

        qty: row.qty,

        pcs: row.pcs,

        jota: row.jota,

        requester_remark: row.requester_remark,

        image_1: row.image_1,

        image_2: row.image_2,

        image_3: row.image_3,

        image_4: row.image_4

    });

}



            this.render_product_list();



            // Existing document edit mode
            this.doc_name = name;


            frappe.show_alert({

                message:"Loaded "+name+" for editing",

                indicator:"orange"

            });


        }


    });


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
                        
                        <input 
                        class="form-control" type="hidden"
                        id="branch">


                    </div>




                    <div class="pr-field">


                        <div id="sales_person"></div>


                    </div>


                </div>


            </div>





            <!-- Single Product Entry -->

            <div class="product-card">



                <div class="product-title">

                    Add Product

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
                        id="qty"
                        type="number"
                        class="form-control"
                        value="1">


                    </div>






                    <div class="pr-field">


                        <label>
                            Pcs
                        </label>


                        <input
                        id="pcs"
                        type="number"
                        class="form-control"
                        value="1">


                    </div>






                    <div class="pr-field">


                        <label>
                            Jota
                        </label>


                        <select
                        id="jota"
                        class="form-control">
                        <option value=""></option>
                        <option>2</option>
                        <option>4</option>
                        <option>6</option>
                        <option>8</option>
                        <option>10</option>
                        <option>12</option>
                        </select>


                    </div>



               





                <div class="pr-field" style1="grid-column: span 2;">
        <label>Requester Remark</label>

        <textarea style="height:50px"
            id="remark"
            class="form-control remark-box"
            rows="2"
            placeholder="Enter remark..."></textarea>
    </div>
     </div>
                    
<br>

<div class="pr-field">

    <label>
        Product Images
    </label>


    <div class="pr-grid">


        <div>
            <small>Image 1</small>

            <input 
            type="file"
            id="image1"
            class="form-control product-image"
            accept="image/*">

            <div id="preview1" class="image-preview"></div>

        </div>



        <div>
            <small>Image 2</small>

            <input 
            type="file"
            id="image2"
            class="form-control product-image"
            accept="image/*">

            <div id="preview2" class="image-preview"></div>

        </div>



        <div>
            <small>Image 3</small>

            <input 
            type="file"
            id="image3"
            class="form-control product-image"
            accept="image/*">

            <div id="preview3" class="image-preview"></div>

        </div>



        <div>
            <small>Image 4</small>

            <input 
            type="file"
            id="image4"
            class="form-control product-image"
            accept="image/*">

            <div id="preview4" class="image-preview"></div>

        </div>


    </div>

</div>


                </div>






                <br>


                <button
                class="btn btn-primary"
                id="add_product">


                + Add Product


                </button>
                <button
class="btn btn-secondary"
id="back_list"
style="margin-left:10px">

Back

</button>
                <button
class="btn btn-secondary"
id="cancel_edit"
style="display:none; margin-left:10px;">

Cancel Edit

</button>




            </div>







            <!-- Added Product List -->


            <div class="pr-card">


                <div class="product-title">

                    Added Products
                    
                    <button
    class="btn btn-success"
    id="save_requisition"
    style="float:right">

        Save

    </button>

                </div>



                <div id="product_list">


                </div>



            </div>




        </div>


        `);




        this.bind_events();


        this.load_user_details();


        this.make_sales_person_control();


        this.make_item_control();
		this.handle_image_preview();



    }


cancel_edit() {

    this.edit_index = null;

    this.clear_product_form();

    $("#add_product").text("+ Add Product");

    $("#cancel_edit").hide();


    frappe.show_alert({

        message: "Edit cancelled",

        indicator: "blue"

    });

}

    bind_events() {


        let me = this;



        $("#add_product").click(function() {


            me.add_product_row();


        });
         $("#cancel_edit").click(function() {

        me.cancel_edit();

    });
    $("#back_list").click(function(){

    me.make_list_page();

});

 $("#save_requisition").click(function(){

        me.save();

    });

    }
    make_item_control() {


        let item_control = frappe.ui.form.make_control({


            parent: $(".item-field")[0],


            df: {

                fieldtype: "Link",

                label: "Item",

                options: "Ornate_Item_Master",

                only_select: 1,

                no_create: 1,



                onchange: () => {


                    let item = item_control.get_value();



                    if (item) {


                        this.load_item_details(item);


                        this.toggle_jota_field(item);


                    }


                }


            },


            render_input: true


        });



        item_control.refresh();



        this.item_control = item_control;



    }




    load_item_details(item) {


        frappe.call({


            method: "vgjewellry.master_api.get_parent_variety_from_item",


            args: {


                item: item


            },


            callback: (r) => {


                if (!r.message)
                    return;




                $(".variety-field").empty();

                $(".weight-field").empty();

                $(".size-field").empty();




                let variety_control = frappe.ui.form.make_control({


                    parent: $(".variety-field")[0],


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


                                order_by: "variety_name asc"


                            };


                        }



                    },


                    render_input: true



                });



                variety_control.refresh();



                this.variety_control = variety_control;




                let weight_control = frappe.ui.form.make_control({



                    parent: $(".weight-field")[0],



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



                    render_input: true



                });




                weight_control.refresh();



                this.weight_control = weight_control;




                let size_control = frappe.ui.form.make_control({



                    parent: $(".size-field")[0],



                    df: {



                        fieldtype: "Link",



                        label: "Size",



                        options: "Ornate_Size_Master",



                        only_select: 1,



                        no_create: 1,



                        get_query: function() {



                            return {


                                filters: {


                                    item: item


                                },
                                order_by: "size asc"


                            };


                        }



                    },



                    render_input: true



                });




                size_control.refresh();



                this.size_control = size_control;



            }



        });



    }




    toggle_jota_field(item) {


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


            $("#jota").closest(".pr-field").show();


        } else {


            $("#jota").closest(".pr-field").hide();


        }



    }

    async add_product_row() {

  // Validation

    let sales_person = this.sales_control
        ? this.sales_control.get_value()
        : "";


    let item = this.item_control
        ? this.item_control.get_value()
        : "";


    let variety = this.variety_control
        ? this.variety_control.get_value()
        : "";


    let weight_range = this.weight_control
        ? this.weight_control.get_value()
        : "";


    let size = this.size_control
        ? this.size_control.get_value()
        : "";


    let qty = $("#qty").val();

    let pcs = $("#pcs").val();


    let image1 = $("#image1")[0];


    if (!sales_person) {

        frappe.msgprint("Please select Sales Person");

        return;

    }


    if (!item) {

        frappe.msgprint("Please select Item");

        return;

    }


    if (!variety) {

        frappe.msgprint("Please select Variety");

        return;

    }


    if (!weight_range) {

        frappe.msgprint("Please select Weight Range");

        return;

    }


    if (!size) {

        frappe.msgprint("Please select Size");

        return;

    }


    if (!qty || Number(qty) <= 0) {

        frappe.msgprint("Please enter valid Quantity");

        return;

    }


    if (!pcs || Number(pcs) <= 0) {

        frappe.msgprint("Please enter valid Pcs");

        return;

    }


    // Image 1 required only for new product
    if (this.edit_index == null && (!image1 || !image1.files.length)) {

        frappe.msgprint("Please upload Image 1");

        return;

    }
      



        if (!item) {


            frappe.msgprint("Please select Item");

            return;


        }
  let var_name=  this.variety_control ?  this.variety_control.get_value() : "";
                let wt_name=this.weight_control ? this.weight_control.get_value() : "";
                var sz_name= this.size_control ?    this.size_control.get_value() : "";
                
            



        let row = {

image_1:"",
    image_2:"",
    image_3:"",
    image_4:"",
            item: item,



            variety: this.variety_control ?
                this.variety_control.get_value() : "",



            weight_range: this.weight_control ?
                this.weight_control.get_value() : "",



            size: this.size_control ?
                this.size_control.get_value() : "",
                
                  // Display values (for table)

    item_name: await this.get_display_value(
        "Ornate_Item_Master",
        item,
        "item_name"
    ),



    variety_name: await this.get_display_value(
        "Ornate_Variety_Master",
        var_name,
        "variety_name"
    ),



    weight_range_name: await this.get_display_value(
        "weight_range",
        wt_name,
        "weight_range"
    ),



    size_name: await this.get_display_value(
        "Ornate_Size_Master",
        sz_name,
        "size"
    ),



            qty: $("#qty").val(),



            pcs: $("#pcs").val(),



            jota: $("#jota").val(),



            requester_remark: $("#remark").val()



        };


/*let images = [

    {
        id:"#image1",
        field:"image_1"
    },

    {
        id:"#image2",
        field:"image_2"
    },

    {
        id:"#image3",
        field:"image_3"
    },

    {
        id:"#image4",
        field:"image_4"
    }

];


for(let img of images){

    let input = $(img.id)[0];


    if(input && input.files.length){

        row[img.field] = await this.upload_image(
            input.files[0]
        );

    }

}*/
// Preserve old images while editing
let old_row = this.edit_index != null ? this.products[this.edit_index] : {};

let images = [

    { id:"#image1", field:"image_1" },
    { id:"#image2", field:"image_2" },
    { id:"#image3", field:"image_3" },
    { id:"#image4", field:"image_4" }

];

for (let img of images) {

    let input = $(img.id)[0];

    if (input && input.files.length) {

        // Upload new image
        row[img.field] = await this.upload_image(input.files[0]);

    } else if (this.edit_index != null) {

        // Keep old image while editing
        row[img.field] = old_row[img.field] || "";

    }

}

        if (this.edit_index !== undefined) {
    this.products[this.edit_index] = row;
    this.edit_index = undefined;
    $("#add_product").text("+ Add Product");
        $("#cancel_edit").hide();

} else {
    this.products.push(row);
}



        this.render_product_list();



        this.clear_product_form();



    }


get_display_value(doctype, name, field){


    if(!name)
        return "";


    return new Promise((resolve)=>{


        frappe.db.get_value(
            doctype,
            name,
            field,
            (r)=>{

			
                if(r &&  r[field]){

                    resolve(r[field]);

                }
                else{

                    resolve(name);

                }


            }
        );


    });


}

render_product_list(){


let html = `


<table class="table table-bordered">


<thead>

<tr>

<th>Item</th>

<th>Variety</th>

<th>Weight</th>

<th>Size</th>

<th>Qty</th>

<th>Pcs</th>

<th>Images</th>

<th>Action</th>


</tr>

</thead>


<tbody>


`;




this.products.forEach((row,index)=>{



html += `


<tr>


<td>${row.item_name || row.item || ""}</td>


<td>${row.variety_name || row.variety || ""}</td>


<td>${row.weight_range_name || row.weight_range || ""}</td>


<td>${row.size_name || row.size || ""}</td>


<td>${row.qty || 0}</td>


<td>${row.pcs || 0}</td>



<td>


${row.image_1 ? 
`<img src="${row.image_1}" 
style="width:50px;height:50px;object-fit:cover;">`
:""}


${row.image_2 ? 
`<img src="${row.image_2}" 
style="width:50px;height:50px;object-fit:cover;">`
:""}


${row.image_3 ? 
`<img src="${row.image_3}" 
style="width:50px;height:50px;object-fit:cover;">`
:""}


${row.image_4 ? 
`<img src="${row.image_4}" 
style="width:50px;height:50px;object-fit:cover;">`
:""}


</td>





<td>


<button
class="btn btn-sm btn-warning edit-product"
data-index="${index}">

Edit

</button>



<button
class="btn btn-sm btn-danger remove-product"
data-index="${index}">

Delete

</button>



</td>



</tr>


`;



});





html += `


</tbody>

</table>


`;



$("#product_list").html(html);





$(".remove-product").click((e)=>{


let index=$(e.currentTarget).data("index");


this.products.splice(index,1);


this.render_product_list();


});





$(".edit-product").click((e)=>{


let index=$(e.currentTarget).data("index");


this.edit_product_row(index);


});



}
   




    clear_product_form(){


    if(this.item_control){

        this.item_control.set_value("");

    }


    if(this.variety_control){

        this.variety_control.set_value("");

    }


    if(this.weight_control){

        this.weight_control.set_value("");

    }


    if(this.size_control){

        this.size_control.set_value("");

    }



    $("#qty").val(1);

    $("#pcs").val(1);

    $("#jota").val("");

    $("#remark").val("");



    $(".variety-field").empty();

    $(".weight-field").empty();

    $(".size-field").empty();



    // clear images

    $(".product-image").val("");

    $(".image-preview").empty();


}
    
    upload_image(file){

    return new Promise((resolve,reject)=>{


        let form_data = new FormData();

        form_data.append("file",file);



        fetch("/api/method/upload_file",{

            method:"POST",

            headers:{
                "X-Frappe-CSRF-Token":frappe.csrf_token
            },

            body:form_data

        })


        .then(res=>res.json())


        .then(res=>{


            if(res.message && res.message.file_url){

                resolve(res.message.file_url);

            }
            else{

                reject(res);

            }

        })


        .catch(err=>reject(err));


    });

}
    async save() {


        if (this.products.length === 0) {


            frappe.msgprint("Please add at least one product");


            return;


        }




        let doc = {


            doctype: "Product_Requisition_Form",



            request_by: $("#request_by").val(),

			branch: $("#branch").val(),


            sales_person: this.sales_control ?
                this.sales_control.get_value() : "",



            product_details: []



        };




        this.products.forEach((row) => {



            doc.product_details.push({



                doctype: "Product_Requisition_Item",



                item: row.item,



                variety: row.variety,



                weight_range: row.weight_range,



                size: row.size,



                qty: row.qty,



                pcs: row.pcs,



                jota: row.jota,



                requester_remark: row.requester_remark,
                image_1:row.image_1,

image_2:row.image_2,

image_3:row.image_3,

image_4:row.image_4



            });



        });

var method="";
if(this.doc_name){

    doc.name = this.doc_name;

    method = "frappe.client.save";

}
else{

    method = "frappe.client.insert";

}

        frappe.call({



                method: method,



            args: {


                doc: doc


            },



            freeze: true,



            freeze_message: "Saving Product Requisition...",




            callback: (r) => {



                if (r.message) {



                    frappe.msgprint(

                        "Saved " + r.message.name

                    );



                    this.products = [];

					this.make_list_page();
                    //this.render_product_list();



                }



            }



        });



    }
    
    async edit_product_row(index) {

    let row = this.products[index];
    

    // Store editing index
    this.edit_index = index;

    // Load item
    this.item_control.set_value(row.item);
    setTimeout(() => {

    this.variety_control.set_value(row.variety);
    this.weight_control.set_value(row.weight_range);
    this.size_control.set_value(row.size);

}, 500);
    

    // Wait until Variety, Weight & Size controls are created
    await this.load_item_details(row.item);

    // Set dependent values
    if (this.variety_control) {
        this.variety_control.set_value(row.variety);
    }

    if (this.weight_control) {
        this.weight_control.set_value(row.weight_range);
    }

    if (this.size_control) {
        this.size_control.set_value(row.size);
    }

    // Other fields
    $("#qty").val(row.qty);
    $("#pcs").val(row.pcs);
    $("#jota").val(row.jota);
    $("#remark").val(row.requester_remark);

    // Clear file inputs (files cannot be set programmatically)
    $("#image1, #image2, #image3, #image4").val("");

    // Show existing image previews
    $("#preview1").html(
        row.image_1
            ? `<img src="${row.image_1}" class="img-thumbnail" style="width:100px;height:100px;object-fit:cover;">`
            : ""
    );

    $("#preview2").html(
        row.image_2
            ? `<img src="${row.image_2}" class="img-thumbnail" style="width:100px;height:100px;object-fit:cover;">`
            : ""
    );

    $("#preview3").html(
        row.image_3
            ? `<img src="${row.image_3}" class="img-thumbnail" style="width:100px;height:100px;object-fit:cover;">`
            : ""
    );

    $("#preview4").html(
        row.image_4
            ? `<img src="${row.image_4}" class="img-thumbnail" style="width:100px;height:100px;object-fit:cover;">`
            : ""
    );

    // Optional UI changes
    $("#add_product").text("Update Product");
    $("#cancel_edit").show();

    frappe.show_alert({
        message: "Product loaded for editing",
        indicator: "orange"
    });

}
    


handle_image_preview(){


    $(".product-image").on("change",function(){


        let input=this;


        if(!input.files.length)
            return;



        let file=input.files[0];


        if(!file.type.startsWith("image/")){


            frappe.msgprint("Please select image");

            input.value="";

            return;

        }



        let id=$(input).attr("id");

        let preview=id.replace("image","preview");



        let reader=new FileReader();



        reader.onload=function(e){


            $("#"+preview).html(`


            <img src="${e.target.result}"
            class="img-thumbnail"
            style="
            width:100px;
            height:100px;
            object-fit:cover;
            ">


            `);


        };


        reader.readAsDataURL(file);



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
.btn-open {
    display: none !important;
}

.pr-container{
    max-width:1300px;
    margin:15px auto;
    padding:10px 15px;
    background:#f6f8fb;
}

.remark-box{
    min-height:40px;
    height:40px;
    resize:none;
    padding-top:8px;
}

#jota{
    height:38px;
}
.pr-card,
.product-card{
    background:#fff;
    border:1px solid #e3e8ef;
    border-radius:10px;
    padding:15px 18px;
    margin-bottom:14px;
    box-shadow:0 2px 8px rgba(0,0,0,.04);
}

.product-title{
    font-size:16px;
    font-weight:600;
    color:#2c3e50;
    margin-bottom:12px;
    padding-bottom:8px;
    border-bottom:1px solid #edf1f5;
}

.pr-grid{
    display:grid;
    grid-template-columns:repeat(4,minmax(180px,1fr));
    gap:12px;
}

.pr-field{
    margin-bottom:6px;
}

.pr-field label{
    margin-bottom:3px;
    font-size:11px;
    font-weight:600;
    color:#6b7280;
    text-transform:uppercase;
}

.form-control{
    height:34px;
    border-radius:6px;
    font-size:13px;
    border:1px solid #d7dde6;
}

textarea.form-control{
    min-height:60px;
    resize:vertical;
}

.btn{
    border-radius:6px;
    padding:6px 14px;
    font-size:13px;
    font-weight:600;
}

.table{
    margin-top:10px;
    font-size:13px;
}

.table thead th{
    background:#f4f7fa;
    padding:10px;
    font-weight:600;
}

.table tbody td{
    padding:8px 10px;
    vertical-align:middle;
}

.table tbody tr:hover{
    background:#f9fbfd;
}

.image-preview img{
    width:70px;
    height:70px;
    border-radius:6px;
    object-fit:cover;
}

.product-image{
    height:34px;
}

@media(max-width:992px){
    .pr-grid{
        grid-template-columns:repeat(2,1fr);
    }
}

@media(max-width:576px){
    .pr-grid{
        grid-template-columns:1fr;
    }
}
</style>


        `);



    }
}




