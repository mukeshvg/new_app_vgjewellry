// Copyright (c) 2025, SamarthIT and contributors
// For license information, please see license.txt

frappe.ui.form.on("Product_Requisition_Form", {
	refresh(frm) {

	},
	onload: function(frm) {
		if (!frm.doc.branch) {
			frappe.call({
				method: "frappe.client.get",
				args: {
					doctype: "User",
					name: frappe.session.user
				},
				callback: function(r) {
					if (r.message && r.message.branch) {
						frm.set_value('branch', r.message.branch);
						frm.set_value('request_by', r.message.username);
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
					}
				}
			})
		}
	},
});
frappe.ui.form.on("Product_Requisition_Item", {
	item(frm, cdt, cdn) {

		let row=locals[cdt][cdn];
		frappe.call({
			method: "vgjewellry.master_api.get_variety_from_item",
			args: { item: row.item },
			callback(r) {
				if (r && r.message && r.message) {
		let grid_row = frm.fields_dict.product_details.grid.grid_rows_by_docname[cdn];
		console.log(grid_row)
		let fields = ["variety", "weight_range", "qty"];
		fields.forEach(f => {
			grid_row.on_grid_fields_dict[f].df.read_only = 0;
		})
		let variety_field = grid_row.on_grid_fields_dict.variety;
		variety_field.get_query = function() {
                    return {
                        filters: {
                            name: ["in", r.message]
                        }
                    };
                };
				}

			}
		})
	}
})
