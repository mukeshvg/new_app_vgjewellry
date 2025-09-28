// Copyright (c) 2025, SamarthIT and contributors
// For license information, please see license.txt

// Copyright (c) 2024, Samarth Group and contributors
// For license information, please see license.txt

frappe.ui.form.on('Company_Sim_Info', {
	refresh: function(frm) {
		frm.toggle_reqd(['device_no', 'device_name', 'imei_no'], frm.doc.device_details === "Company");

		let cov = cur_frm.fields_dict.device_details.input;
        cov.onchange = function () {
        if (cur_frm.doc.device_details === "Company") {
        // Show the fields and set them as required if "Company" is selected
        frm.toggle_display('device_no', true);
        frm.toggle_display('device_name', true);
        frm.toggle_display('imei_no', true);

        frm.set_df_property('device_no', 'reqd', 1);
        frm.set_df_property('device_name', 'reqd', 1);
        frm.set_df_property('imei_no', 'reqd', 1);
        } else {
        // Hide the fields if "Owner" is selected
        frm.toggle_display('device_no', false);
        frm.toggle_display('device_name', false);
        frm.toggle_display('imei_no', false);

        frm.set_df_property('device_no', 'reqd', 0);
        frm.set_df_property('device_name', 'reqd', 0);
        frm.set_df_property('imei_no', 'reqd', 0);
    }
};
	},
	validate: function(frm) {
        const c_per_num = frm.doc.mobile_no; 
        if (!/^\d{10}$/.test(c_per_num)) {
            frappe.msgprint("Please enter a valid 10-digit mobile number.");
            frappe.validated = false;
        }

    }
});
