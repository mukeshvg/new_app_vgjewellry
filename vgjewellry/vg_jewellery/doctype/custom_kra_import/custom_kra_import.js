// Copyright (c) 2025, SamarthIT and contributors
// For license information, please see license.txt

frappe.ui.form.on("Custom KRA Import", {
	refresh(frm) {
		if (frm.doc.status === "Pending" || frm.doc.status === "Failed") {
			frm.add_custom_button("Start Import", function() {
				frappe.call({
					method: "vgjewellry.KRA_api.process_import",
					args: { docname: frm.doc.name },
					callback: function(r) {
						console.log(r);
						alert(r.message)
						frm.reload_doc();
					}
				});
			});
		}
	},
});
