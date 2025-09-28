// Copyright (c) 2025, SamarthIT and contributors
// For license information, please see license.txt

// frappe.ui.form.on("UserOptions", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on("UserOptions", "refresh", function(frm) {
	samempcode(frm);
});

function samempcode(frm) {
    debugger;
	if (cur_frm.doc.sam_emp_code) {
		frappe.call({
			method: "vgjewellry.VG_api.emp_data", 
			args: {"emp_code":cur_frm.doc.sam_emp_code},
			callback: function(r) {
                debugger;
				frm.set_df_property('sam_emp_code', 'description', r.message['emp_name']);
			}
		});
	}
};

frappe.ui.form.on('UserOptions', {
	'sam_emp_code': function(frm) {
		samempcode(frm);
	}
});