// Copyright (c) 2025, SamarthIT and contributors
// For license information, please see license.txt

frappe.ui.form.on("Product_Requisition_Form", {
	refresh(frm) {
		toggle_save(frm);
		let grid = frm.fields_dict.product_details.grid;

		// Prevent duplicate buttons
		if (grid.copy_row_added) return;
		grid.copy_row_added = true;

		// Add Copy Row button beside Add Row
		grid.add_custom_button(__('Copy Row'), function () {
			let selected = grid.get_selected_children();

			if (!selected.length) {
				frappe.msgprint(__('Please select a row to copy'));
				return;
			}

			let source = selected[0];
			let new_row = frm.add_child('product_details');

			/*// Copy all fields except system fields
			Object.keys(source).forEach(field => {
				if (!['name', 'idx', 'doctype','size',''].includes(field)) {
					new_row[field] = source[field];
				}
			});*/
			new_row.item = source.item;
			new_row.weight_range = source.weight_range;
			new_row.variety = source.variety;

			frm.refresh_field('product_details');
			grid.selected_children = [];
            		grid.wrapper.find('.grid-row-check').prop('checked', false);
		});
	},
	onload: function(frm) {
		frm.set_query("item", "product_details", function() {
			return {
				order_by: "item_name asc"
			};
		});

		toggle_save(frm);
		if (!frm.doc.branch) {
			frappe.call({
				method: "frappe.client.get",
				args: {
					doctype: "User",
					name: frappe.session.user
				},
				callback: function(r) {
					if (r.message && r.message.branch) {
						frm.set_value('branch', r.message.ornate_branch);
						frm.set_value('request_by', r.message.username);
					}
				}
			})
		}
		let order_roles_l = ['Administrator', 'Order'];
		let order_access_l = order_roles_l.some(role => frappe.user.has_role(role))
		if (order_access_l) {
			frm.set_df_property('requester_remark', 'read_only', false);	
		}
		let manager_roles_l = ['Administrator', 'Manager'];
		let manager_access_l = manager_roles_l.some(role => frappe.user.has_role(role))
		if (manager_access_l) {
			frm.set_df_property('manager_remark', 'read_only', false);	
		}
		let purchase_manager_roles_l = ['Administrator', 'Purchase Manager'];
		let pmanager_access_l = purchase_manager_roles_l.some(role => frappe.user.has_role(role))
		if (pmanager_access_l) {
			console.log("weere");
			frm.set_df_property('purchase_department_remark', 'read_only', false);	
		}
	},
});
frappe.ui.form.on("Product_Requisition_Item", {
	item(frm, cdt, cdn) {

		let row=locals[cdt][cdn];
		frappe.call({
			method: "vgjewellry.master_api.get_parent_variety_from_item",
			args: { item: row.item },
			callback(r) {
				if (r && r.message && r.message) {
					let grid_row = frm.fields_dict.product_details.grid.grid_rows_by_docname[cdn];
					let fields = ["variety", "weight_range","size", "qty","jota"];
					fields.forEach(f => {
						grid_row.on_grid_fields_dict[f].df.read_only = 0;
						if(f=="jota" && [86,17,57,10292,10276,10000061,10000036,10000018,10000010].indexOf(row.item) !=-1){
							grid_row.on_grid_fields_dict[f].df.hidden = 0;
						}
					})
					let variety_field = grid_row.on_grid_fields_dict.variety;
					variety_field.get_query = function() {
						return {
							filters: {
								name: ["in", r.message]
							},
							order_by: "item_name asc"
						};
					};
					let wt_field = grid_row.on_grid_fields_dict.weight_range;
					wt_field.get_query = function() {
						return {
							filters: {
								item: ["in", [row.item]]
							}
						};
					};
					let sz_field = grid_row.on_grid_fields_dict.size;
					sz_field.get_query = function() {
						return {
							filters: {
								item: ["in", [row.item]]
							}
						};
					};
				}

			}
		})
	}
})

function toggle_save(frm) {
	if (frm.doc.action_taken === "Action Taken" || frm.doc.action_taken === "Partial Action Taken") {
		frm.disable_save();      // disables Save
		frm.page.clear_primary_action(); // hides Save button
	} else {
		frm.enable_save();       // enables Save
		frm.page.set_primary_action(__('Save'), () => frm.save());
	}
}
