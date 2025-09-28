// Copyright (c) 2025, SamarthIT and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Printer List", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on("Printer List", {
    after_save: function(frm) {
        frappe.call({
            method: "vgjewellry.printer_list.print_test_copies",
            args: {
                printer_name: frm.doc.printer_name,
                branch: frm.doc.branch,
                counter: frm.doc.counter,
                printer_ip: frm.doc.printer_ip
            },
            callback: function(r) {
                if (r.message) {
                    frappe.msgprint(r.message);
                }
            }
        });
    }
});
