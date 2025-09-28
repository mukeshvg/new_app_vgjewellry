frappe.pages["report_vg_004"].on_page_load = function (wrapper) {
  // var page = frappe.ui.make_app_page({
  // 	parent: wrapper,
  // 	title: 'SJ_Catalogue (dev)',
  // 	single_column: true
  // });

  new MyPage(wrapper);
};

var minNetWt = 0;
var maxNetWt = 0;

MyPage = Class.extend({
  init: function (wrapper) {
    this.page = frappe.ui.make_app_page({
      parent: wrapper,
      title: "VG_Catalogue",
      single_column: true,
    });

    stdfn();
    window.thispage = this;
    this.render();
  },

  render: function () {
    $(this.page.main).append(
      `<div id="pivot"></div><div id="grid_container"></div>`
    );
  },
});

window.selectionhtml = `
	<div class="row">
<div class="col-lg-2 col-md-12 flex flex-column mx-1">
<label for="item_selector" class="font-weight-bold">Item Name</label>
<select name="di" id="item_selector">  </select>
</div>


<div class="col-lg-2 col-md-12 flex flex-column mx-1">
<label for="min_net_wt" class="font-weight-bold">Net Weight (Min)</label>
<input type="number" id="min_net_wt" name="min_nw" value="" />
</div>


<div class="col-lg-2 col-md-12 flex flex-column mx-1">
<label for="max_net_wt" class="font-weight-bold">Net Weight (Max)</label>
<input type="number" id="max_net_wt" name="max_nw" value="" />
</div>


<div class="col-lg-2 col-md-12 flex flex-column mx-1">
<label for="branch_selector" class="font-weight-bold">Branch</label>
	<select name="branch" id="branch_selector">
		<option value=0>ALL</option>
		<option value=6>VALSAD BRANCH</option>
		<option value=7>VAPI BRANCH</option>
		<option value=8>SURAT BRANCH</option>
		<option value=9>HO BRANCH</option>
  	</select>
    </div>
<div class="col-lg-1 col-md-12 flex flex-column mx-auto">
  <button class="btn btn-primary my-auto" id="submit_button">Submit</button>
</div>
</div>
    <br>
`;

function getSelectionData() {
  items.sort().forEach((item) => {
    $("#item_selector").append(`<option>${item}</optio  n>`);
  });
}


function renderTable(data) {
  $(document)
    .off("click", "img.product-image")
    .on("click", "img.product-image", function () {
      let imgSrc = $(this).attr("src");
      let d = new frappe.ui.Dialog({
        title: "Image Preview",
        size: "large",
        primary_action_label: "Close",
        primary_action: () => d.hide(),
        fields: [
          {
            fieldtype: "HTML",
            fieldname: "image_preview",
            options: `<img src="${imgSrc}" style="max-width: 100%; max-height: 80vh;">`,
          },
        ],
      });

      d.show();
    });

  frappe.require("/assets/frappe/js/frappe/ui/datatable.js", function () {

    let columns = [
      {
        name: "Image",
        align: "center",
        data: "Image",
        height: "auto",
        format: function (item) {
          return item
            ? `<div style="height: 150px; width: 150px; overflow: hidden"><img class="product-image mx-auto" src="${item}" style="object-fit: cover; height: 150px; width: 150px;" width="100" height="100" alt="Product Image"/></div>`
            : "No image";
        },
      },
      { id: "LabelNo", align: "center", name: "Label No" },
      { id: "ItemName", align: "center", name: "ItemName" },
      { id: "VarietyName", align: "center", name: "VarietyName" },
      // { id: "tradname", align: "center", name: "Trad Name" },
      { id: "NetWt", align: "center", name: "NetWt" },
      // { id: "varietyname", align: "center", name: "Variety Name" },

    ];

    new DataTable("#grid_container", {
      columns: columns,
      data: data,
      layout: "fluid",
      destroy: true,
      dynamicRowHeight: true,
      cellHeight: 150, // overridden from 150 to 50
      rowHeight: 0,
      inlineFilters: true,
    });   
    
    setTimeout(() => {
      const filterRow = document.querySelector("#grid_container .dt-row-filter .dt-filter.dt-input");
      if (filterRow) {
          filterRow.style.height = "60px";  // Corrected property name
          filterRow.style.display = "flex"; // alignItems works with display: flex
          filterRow.style.alignItems = "center";
          filterRow.style.padding = "20px";
      }
      document.querySelector(".dt-row.dt-row-filter").style.height = "60px";

      document.querySelectorAll("#grid_container .dt-filter.dt-input").forEach(input => {
          input.style.height = "40px";
          input.style.fontSize = "16px";
          input.style.padding = "20px";
      });
  }, 100);
  });
  
}

function getapidata(
  item_name = "BALI 22",
  min_net_wt,
  max_net_wt,
  branch
) {
  frappe.dom.freeze();
  frappe.call({
    method: "vgjewellry.VG_api.SJ_GP_020", //dotted path to server method
    args: {
      item_name: item_name,
      net_wt_from: min_net_wt,
      net_wt_to: max_net_wt,
      branch,
    },
    callback: function (r) {
      debugger;
      console.log(">> ", r);
      setTimeout(() => renderTable(r.message), 100);
      frappe.dom.unfreeze();
      //   stdPivotUi(r.message);
    },
    always: function () {
      frappe.dom.unfreeze();
    },
  });
}

function stdfn() {
  frappe.require(["/assets/vgjewellry/js/custom/usr_cust_format.js"], () => {
    $(function () {
      // make(thispage,selectionhtml);
      $(thispage.page.main).prepend(window.selectionhtml);
      getSelectionData();
      $("#max_net_wt").val(0);
      $("#min_net_wt").val(0);

      $(document).on("click", "#submit_button", function (e) {
        let item_name = $("#item_selector option:selected").text();
        let branch = $("#branch_selector option:selected").val();
        let main_variety = $("#main_variety_selector option:selected").text();

        minNetWt = parseFloat($("#min_net_wt").val());
        maxNetWt = parseFloat($("#max_net_wt").val());
        getapidata(item_name, minNetWt, maxNetWt, branch);
      });
      customselection();
      getsrf();
    });
  });
}

const items = [
  "DIAMOND PENDANT 22KT",
  "DIAMOND RING 22KT",
  "DIAMOND BRACELET 22KT",
  "DIAMOND BANGLES 22KT",
  "BAJU BANDH",
  "BRACELET",
  "CHAIN",
  "BANGLES",
  "BALI",
  "BOR",
  "PENDANT(M)",
  "SET",
  "RING",
  "PENDANT SET",
  "NOSE PIN",
  "MANGALSUTRA",
  "KANSER",
  "DIAMOND TOPS 18DIA",
  "DIAMOND SET 18DIA",
  "DIAMOND RING 18DIA",
  "DIAMOND PENDANT 18DIA",
  "DIAMOND NOSEPIN",
  "DIAMOND BRACELET 18DIA",
  "DIAMOND ORNAMENTS",
  "DIAMOND BANGLES 18DIA",
  "DIAMOND P.SET 18DIA",
  "VILANDI PENDANT 22KT",
  "VILANDI TOPS 22KT",
  "VILANDI RING 22KT",
  "VILANDI NECKLACE 22KT",
  "VILANDI KADA 22KT",
  "VILANDI CHAIN 22KT",
  "VILANDI BRACELET 22KT"
];
