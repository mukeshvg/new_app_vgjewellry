// Copyright (c) 2025, SamarthIT and contributors
// For license information, please see license.txt

frappe.ui.form.on("VG_In_Out_Non_Jewellery_Item", {
    refresh: function(frm) {
        debugger; 
    },

    item_category: function(frm) {  
        debugger; 
        if (frm.doc.item_category) { 
            frm.set_df_property('item_category', 'read_only', true); 
            frm.set_query('item_name', function(doc) {
                return {
                    filters: {
                        "item_category": frm.doc.item_category
                    }
                };
            });
        } 
    }
});
