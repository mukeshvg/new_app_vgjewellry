frappe.pages['report_001'].on_page_load = function(wrapper) {
	// var page = frappe.ui.make_app_page({
	// 	parent: wrapper,
	// 	title: 'Sales Report 001',
	// 	single_column: true
	// });
	new MyPage(wrapper);
}

MyPage = Class.extend({

	init: function(wrapper) {
		this.page = frappe.ui.make_app_page({
			parent: wrapper,
			title: 'Sales Report 001',
			single_column: true
		});
	  
	stdfn();
	window.thispage=this
	// getapidata();
	}
})

// For adding selection option in html, 
window.selectionhtml = `
	<label for="stddate">FromDate:</label>
	<input type="date" id="sd" name="di" placeholder="FromDate" value="" />
	<label for="enddate">ToDate:  </label>
	<input type="date" id="ed" name="di" placeholder="ToDate" value="" />
	<label for="branch">Branch:</label>
	<select name="di" id="branch">
		<option value=0>ALL</option>
		<option value=6>VALSAD BRANCH</option>
		<option value=7>VAPI BRANCH</option>
		<option value=8>SURAT BRANCH</option>
		<option value=9>HO BRANCH</option>
  	</select>
	<br>
`	
function customselection(){
	var daybfr = new Date();
	daybfr.setDate(daybfr.getDate() - 7);       //FOR 7 DAYS BEFORE TODAY DATE
	document.getElementById("sd").defaultValue = daybfr.toISOString().substr(0, 10);
	var today = new Date();
	document.getElementById("ed").defaultValue = today.toISOString().substr(0, 10);
}

function getapidata(){
	debugger;
	loadingicon();
	var iv = document.getElementsByName('di');

	debugger;
	// alert(a[0].value);
	frappe.call({
	method: "vgjewellry.VG_api.StockReport_R001", //dotted path to server method
	args: {"sd":iv[0].value,"ed":iv[1].value,"branch":iv[2].value},
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