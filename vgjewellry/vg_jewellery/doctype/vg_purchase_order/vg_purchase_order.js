// Client Script → Doctype: VG Purchase Order
frappe.ui.form.on("Vg Purchase Order", {
    refresh(frm) {
        apply_dynamic_filters(frm);
    }
});

function apply_dynamic_filters(frm) {
    const table_field = "item_details";        // Change if your child table fieldname is different
    const item_field = "item";                 // Change if your Item fieldname is different
    const size_depend = "item_name";                 // Change if your Item fieldname is different
    const weight_field = "weight_range";       // Change if different
    const size_field = "size";                 // Change if your Size fieldname is different

    // 1. Apply filter in the normal grid (for both fields)
    const grid = frm.fields_dict[table_field]?.grid;
    if (!grid) return;

    // Weight Range filter in grid
    grid.get_field(weight_field).get_query = function(doc, cdt, cdn) {
        const row = locals[cdt][cdn];
        return row[item_field] ? { filters: { item: row[item_field] } } : {};
    };

    // Size filter in grid
    grid.get_field(size_field).get_query = function(doc, cdt, cdn) {
        const row = locals[cdt][cdn];
        return row[size_depend] ? { filters: { item: row[size_depend] } } : {};
    };
}

// This runs whenever Item changes → in grid OR in pop-up
frappe.ui.form.on("Vg Purchase Order Item", {
    item(frm, cdt, cdn) {
        const row = locals[cdt][cdn];

        // Clear both dependent fields
        frappe.model.set_value(cdt, cdn, "weight_range", "");
        frappe.model.set_value(cdt, cdn, "size", "");

        // Apply filters in the currently open row (pop-up or normal grid)
        setTimeout(() => {
            const open_form = frappe.ui.form.get_open_grid_form();

            const apply_filter = (field_name) => {
                if (open_form) {
                    // Inside pop-up
                    const field = open_form.get_field(field_name);
                    if (field) {
                        field.get_query = () => {
			    if(field_name=="size"){	
                            return row.item ? { filters: { item: row.item } } : {};
			   }		    
                            return row.item ? { filters: { item: row.item } } : {};
                        };
                        field.refresh();
                    }
                } else {
                    // Normal grid
                    frm.fields_dict.item_details?.grid.refresh_field(field_name);
                }
            };

            apply_filter("weight_range");
            apply_filter("size");

        }, 100);
    }
});

/*frappe.ui.form.on("Vg Purchase Order", {
    refresh(frm) {
        apply_weight_range_filters(frm);
    }
});

function apply_weight_range_filters(frm) {
    const child_table_field = "item_details";        
    const item_field         = "item";               
    const weight_field       = "weight_range";       

    // 1. Filter in the normal grid
    frm.fields_dict[child_table_field].grid.get_field(weight_field).get_query = function(doc, cdt, cdn) {
        const row = locals[cdt][cdn];
        if (row[item_field]) {
            return { filters: { item: row[item_field] } };   
        }
        return {};
    };
}

// This is the important part – runs whenever Item changes (grid OR pop-up)
frappe.ui.form.on("Vg Purchase Order Item", {
    item(frm, cdt, cdn) {
        const row = locals[cdt][cdn];

        // Clear old weight_range
        frappe.model.set_value(cdt, cdn, "weight_range", "");

        // Apply filter to the weight_range field in the CURRENTLY OPEN row (works in pop-up too)
        setTimeout(() => {
            const open_grid = frappe.ui.form.get_open_grid_form();
            if (open_grid) {
                // We are inside the pop-up
                const field = open_grid.get_field("weight_range");
                if (field) {
                    field.get_query = () => {
                        return row.item ? { filters: { item: row.item  } } : {};
                    };
                    field.refresh();
                }
            } else {
                // We are in normal grid – refresh the column
                frm.fields_dict.item_details.grid.refresh_field("weight_range");
            }
        }, 100);
    }
});*/
