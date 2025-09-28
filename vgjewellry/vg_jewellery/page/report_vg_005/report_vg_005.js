frappe.pages['report_vg_005'].on_page_load = function(wrapper) {
	// var page = frappe.ui.make_app_page({
	// 	parent: wrapper,
	// 	title: 'ReOrder Stock 004',
	// 	single_column: true
	// });
	new MyPage(wrapper);
}

MyPage = Class.extend({

	init: function(wrapper) {
		this.page = frappe.ui.make_app_page({
			parent: wrapper,
			title: 'Non_Jewellery_Inventory_Report_005',
			single_column: true
		});
	  
	stdfn();
	window.thispage=this
	// getapidata();
	}
})

// For adding selection option in html, 
window.selectionhtml = `
 
`
// window.selectionhtml = `
// <form class="" action="index.html" method="post">
// 	<button type="button" name="button" onclick="getapidata()">Click Me</button>
// </form>
// `

function customselection(){
	// var daybfr = new Date();
	// daybfr.setDate(daybfr.getDate() - 14);       //FOR 15 DAYS BEFORE TODAY DATE
	// document.getElementById("sd").defaultValue = daybfr.toISOString().substr(0, 10);
	// var today = new Date();
	// document.getElementById("ed").defaultValue = today.toISOString().substr(0, 10);
}

function getapidata(){
	loadingicon();
	// var iv = document.getElementsByName('di');
	debugger;
	// alert(a[0].value);
	frappe.call({
	method: "vgjewellry.VG_api.Non_Jewellery_Inventory_Report_R005", //dotted path to server method
	// args: {"sd":iv[0].value,"ed":iv[1].value},
	callback: function(r) {
		debugger;
		stdPivotUi(r.message);
	}
	});
}

function stdfn(){
	  
	frappe.require([  
	  "/assets/vgjewellry/js/custom/usr_cust_format.js"], () => {
	  $(function(){
		  
		make(thispage,selectionhtml);
		customselection();
		getsrf();
	  });
	})
}