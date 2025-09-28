// Copyright (c) 2025, SamarthIT and contributors
// For license information, please see license.txt

// frappe.ui.form.on("VG Exhibition", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on('VG Exhibition', {
	onload:function(frm){
		cur_frm.fields_dict['to_visitors'].df.is_virtual = 0;
	},
	onload_post_render:function(frm){
		if (frm.doc.__islocal) {
			debugger;
			// frm.fields_dict.cus_details.grid.remove_all()
			cur_frm.doc.cus_details=[]
			cur_frm.refresh_fields();
			set_row_count();

		};
	},
	refresh: function(frm) {
		debugger
        set_row_count();
		// cur_frm.add_custom_button(__('Add'), function() {
        //     // Call set_row function
        //     set_row();
        // });
		Set_Count_Of_To_Visitors();
	},
	
});

function set_row_count() 
{
	    debugger;
		// let total_pcs_count = cur_frm.fields_dict['cus_details'].grid.grid_rows.length;
		let total_pcs_count = cur_frm.doc.cus_details.length;
		cur_frm.set_value('to_visitors', total_pcs_count)
		cur_frm.set_df_property('to_visitors', 'read_only', true);
}

function Set_Count_Of_To_Visitors()
{
	document.querySelector('.grid-add-row').onclick = function () {
		debugger;
		set_row_count();
	}
	document.querySelector('.grid-remove-rows').onblur = function () {
		debugger;
		set_row_count();
	}
}