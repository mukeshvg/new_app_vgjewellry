// frappe.pages['report_vg_002'].on_page_load = function(wrapper) {
// 	var page = frappe.ui.make_app_page({
// 		parent: wrapper,
// 		title: 'Emp KRA Performance Report 002',
// 		single_column: true
// 	});
// }
frappe.pages['report_vg_002'].on_page_load = function(wrapper) {
	// var page = frappe.ui.make_app_page({
	// 	parent: wrapper,
	// 	title: 'Emp KRA Performance Report 006',
	// 	single_column: true
	// });
	new MyPage(wrapper);
}



MyPage = Class.extend({

	init: function (wrapper) {
		this.page = frappe.ui.make_app_page({
			parent: wrapper,
			title: 'Emp KRA Performance Report 002',
			single_column: true
		});

		stdfn();
		window.thispage = this;
		// getapidata();
	}
})
window.selectionhtml = `
`

function customselection() {

}

function getapidata() {
	loadingicon();
	let usern=null;
	debugger;
	if(frappe.user_roles.includes("HR"))
	{
		frappe.call({
			method: "vgjewellry.VG_api.Emp_KRA_Performance_Report_R002", //dotted path to server method
			callback: function (r) {
				debugger;
				stdPivotUi(r.message);
			}
		});
	}
	else{
		var user = frappe.session.user;
		frappe.call({
			method: "vgjewellry.VG_api.Get_Empcode", //dotted path to server method
			
			args: { "username": user },
			async: false,
			callback: function (r) {
				debugger;
				 usern=r.message[0].sam_emp_code
				console.log(usern);
				return usern;
			}
			
		});
		frappe.call({
			method: "vgjewellry.VG_api.Emp_KRA_Performance_Report_R002_1", //dotted path to server method
			async: false,
			args:{"ec":usern},
			callback: function (r) {
				debugger;
				stdPivotUi(r.message);
			}
		});

	}
}

function stdfn() {

	frappe.require([
		"/assets/vgjewellry/js/custom/usr_cust_format.js"
	], () => {
		$(function () {
			debugger
			make(thispage, selectionhtml);
			customselection();
			getsrf();

		});
	})
}