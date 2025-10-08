frappe.ui.form.on("Received From NCH", {
	refresh(frm) {
		if (!frm.doc.receive_date) {
			frm.set_value('receive_date', frappe.datetime.get_today());
		}
		frm.set_value('enter_by', frm.doc.owner);
	},
	voucher_no: function(frm) {
        if (frm.doc.voucher_no) {
            frappe.db.get_doc('Issued For NCH', frm.doc.voucher_no)
                .then(doc => {
                    frm.set_value('receive_pcs', doc.pcs); 
                })
                .catch(err => {
                    frappe.msgprint('Unable to fetch data for this voucher.');
                    console.error(err);
                });
        }
    }
});
