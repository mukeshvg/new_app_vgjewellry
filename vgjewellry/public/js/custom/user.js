frappe.ui.form.on('User', {
    branch: function(frm) {
        set_counter_query(frm);
    },

    jewellery_type: function(frm) {
        set_counter_query(frm);
    },

    refresh: function(frm) {
        set_counter_query(frm);
    }
});

function set_counter_query(frm) {
    if (!frm.doc.branch || !frm.doc.jewellery_type) {
        return;
    }

    frm.set_query('counter', function() {
        return {
            filters: {
                branch: frm.doc.branch,
                jewellery_type: frm.doc.jewellery_type
            }
        };
    });
}

