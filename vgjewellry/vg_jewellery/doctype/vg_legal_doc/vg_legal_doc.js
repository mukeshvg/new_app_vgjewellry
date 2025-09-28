// Copyright (c) 2025, SamarthIT and contributors
// For license information, please see license.txt

frappe.ui.form.on("VG_Legal_Doc", {
    validate: function(frm) {
        const c_per_num = frm.doc.c_per_num; 
        if (!/^\d{10}$/.test(c_per_num)) {
            frappe.msgprint("Please enter a valid 10-digit mobile number.");
            frappe.validated = false;
        }
    }
});
