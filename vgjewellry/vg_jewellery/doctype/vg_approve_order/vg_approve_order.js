// Copyright (c) 2025, SamarthIT and contributors
// For license information, please see license.txt

// frappe.ui.form.on("VG_Approve_Order", {
// 	refresh(frm) {

// 	},
// });

frappe.ui.form.on("VG_Approve_Order", {
    refresh: function(frm) {
        const hasVGManagement = frappe.user.has_role("VG Management");
        const hasQC = frappe.user.has_role("QC");
        const hasParcel = frappe.user.has_role("Parcel");
        const hasLabeling = frappe.user.has_role("Labeling");

        const allFields = Object.keys(frm.fields_dict);

        // If VG Management role is assigned, show everything
        if (hasVGManagement) return;

        // QC Role → Show only QC fields
        if (hasQC) {
            allFields.forEach(fieldname => {
                frm.set_df_property(fieldname, "hidden", 1);
            });

            frm.set_df_property("qc_status", "hidden", 0);
            frm.set_df_property("qc_status", "read_only", 0);

            frm.set_df_property("remarks", "hidden", 0);
            frm.set_df_property("remarks", "read_only", 0);

            const qcSection = frm.fields_dict.qc_status.section;
            if (qcSection) {
                frm.set_df_property(qcSection.df.fieldname, "hidden", 0);
            }
            return;
        }

        // Parcel Role → Show only par_rec field
        if (hasParcel) {
            allFields.forEach(fieldname => {
                frm.set_df_property(fieldname, "hidden", 1);
            });

            frm.set_df_property("par_rec", "hidden", 0);
            frm.set_df_property("par_rec", "read_only", 0);

            const parcelSection = frm.fields_dict.par_rec.section;
            if (parcelSection) {
                frm.set_df_property(parcelSection.df.fieldname, "hidden", 0);
            }
            return;
        }

        // Labeling Role → Show only labeling_no field
        if (hasLabeling) {
            allFields.forEach(fieldname => {
                frm.set_df_property(fieldname, "hidden", 1);
            });

            frm.set_df_property("labeling_no", "hidden", 0);
            frm.set_df_property("labeling_no", "read_only", 0);

            const labelingSection = frm.fields_dict.labeling_no.section;
            if (labelingSection) {
                frm.set_df_property(labelingSection.df.fieldname, "hidden", 0);
            }
            return;
        }

        // If user has none of the roles, you can customize this block if needed
    },

    order_no: function(frm) {
        // Trigger fetching child table data when order_no changes
        fetch_and_populate_dia_details(frm);
        fetch_and_set_billing_data(frm);
    },

    
    before_save: function(frm) {
        // Ensure child table data is marked as dirty before saving
        if (frm.doc.dia_details && frm.doc.dia_details.length > 0) {
            frm.doc.dia_details.forEach(function(row) {
                frappe.model.set_value(row.doctype, row.name, "dia_shape", row.dia_shape);
            });
        }
    },

    on_submit: function(frm) {
        frappe.msgprint(__("Diamond Details have been saved successfully."));
    }
});


function fetch_and_populate_dia_details(frm) {

    if (cur_frm.doc.order_no) {
        frappe.call({
            method: "vgjewellry.VG_api.Get_Data_From_FSJ_Customer_CT", // Replace with your app/module path
            args: {
                parent: cur_frm.doc.order_no
            },
            callback: function(response) {

                if (response.message && response.message.length > 0) {
                    // Clear existing rows in the dia_details child table
                    frm.clear_table("dia_details"); // Adjust child table name if different

                    // Iterate through the query results and add to child table
                    $.each(response.message, function(i, row) {
                        let child = frm.add_child("dia_details"); // Adjust child table name if different
                        child.name = row.name;
                        child.parent = row.parent;
                        child.dia_shape = row.dia_shape;
                        child.dia_weight = row.dia_weight;
                        child.dia_pcs = row.dia_pcs;
                    });

                    // Refresh the child table to reflect changes
                    frm.refresh_field("dia_details");
                    frm.set_value("dia_details", frm.doc.dia_details);
                } else {
                    frappe.msgprint(__("No data found for Order No: {0}", [frm.doc.order_no]));
                }
            },
            error: function(err) {
                frappe.msgprint(__("Error fetching diamond details: {0}", [err.message]));
            }
        });
    }
}

// ✅ New function to fetch and set billing data
function fetch_and_set_billing_data(frm) {

    if (frm.doc.order_no) {
        frappe.call({
            method: "vgjewellry.VG_api.Get_Data_From_VG_Billing",
            args: {
                name: frm.doc.order_no
            },
            callback: function(r) {

                if (r.message && r.message.length > 0) {
                    const billing = r.message[0];
                    // Set form fields if they exist
                    frm.set_value("amount", billing.amount);
                    frm.set_value("ref_by", billing.ref_by);
                    frm.set_value("rate_apply_of", billing.rate_apply_of);
                    frm.set_value("gold_rate_pgrm", parseInt(billing.gold_rate_pgrm));
                    frm.set_value("design_code", billing.design_code);
                } else {
                    frappe.msgprint(__("No billing data found for this Order No."));
                }
            }
        });
    }
}

// frappe.ui.form.on("VG_Approve_Order", {
//     refresh: function(frm) {
//         const hasVGManagement = frappe.user.has_role("VG Management");
//         const hasParcel = frappe.user.has_role("Parcel");

//         // If user has VG Management role, do nothing (show full form)
//         if (hasVGManagement) {
//             return;
//         }

//         // If user doesn't have VG Management but has Parcel role
//         if (hasParcel) {
//             // Hide all fields
//             frm.fields.forEach(field => {
//                 frm.set_df_property(field.df.fieldname, "hidden", 1);
//             });

//             // Unhide only par_rec
//             frm.set_df_property("par_rec", "hidden", 0);
//             frm.set_df_property("par_rec", "read_only", 0);

//             // Unhide parent section of par_rec (if any)
//             const parRecField = frm.fields_dict.par_rec;
//             if (parRecField && parRecField.section) {
//                 frm.set_df_property(parRecField.section.df.fieldname, "hidden", 0);
//             }
//         }

//         // Optional: if user has neither role, you can show a message or apply defaults
//     }
// });

// frappe.ui.form.on("VG_Approve_Order", {
//     refresh: function(frm) {
//         const hasVGManagement = frappe.user.has_role("VG Management");
//         const hasQC = frappe.user.has_role("QC");
//         const hasParcel = frappe.user.has_role("Parcel");
//         const hasLabeling = frappe.user.has_role("Labeling");

//         const allFields = Object.keys(frm.fields_dict);

//         // If VG Management role is assigned, show everything
//         if (hasVGManagement) return;

//         // QC Role → Show only QC fields
//         if (hasQC) {
//             allFields.forEach(fieldname => {
//                 frm.set_df_property(fieldname, "hidden", 1);
//             });

//             frm.set_df_property("qc_status", "hidden", 0);
//             frm.set_df_property("qc_status", "read_only", 0);

//             frm.set_df_property("remarks", "hidden", 0);
//             frm.set_df_property("remarks", "read_only", 0);

//             const qcSection = frm.fields_dict.qc_status.section;
//             if (qcSection) {
//                 frm.set_df_property(qcSection.df.fieldname, "hidden", 0);
//             }
//             return;
//         }

//         // Parcel Role → Show only par_rec field
//         if (hasParcel) {
//             allFields.forEach(fieldname => {
//                 frm.set_df_property(fieldname, "hidden", 1);
//             });

//             frm.set_df_property("par_rec", "hidden", 0);
//             frm.set_df_property("par_rec", "read_only", 0);

//             const parcelSection = frm.fields_dict.par_rec.section;
//             if (parcelSection) {
//                 frm.set_df_property(parcelSection.df.fieldname, "hidden", 0);
//             }
//             return;
//         }

//         // Labeling Role → Show only labeling_no field
//         if (hasLabeling) {
//             allFields.forEach(fieldname => {
//                 frm.set_df_property(fieldname, "hidden", 1);
//             });

//             frm.set_df_property("labeling_no", "hidden", 0);
//             frm.set_df_property("labeling_no", "read_only", 0);

//             const labelingSection = frm.fields_dict.labeling_no.section;
//             if (labelingSection) {
//                 frm.set_df_property(labelingSection.df.fieldname, "hidden", 0);
//             }
//             return;
//         }

//         // If user has none of the roles, you can customize this block if needed
//     }
// });

