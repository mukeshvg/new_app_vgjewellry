// Copyright (c) 2025, SamarthIT and contributors
// For license information, please see license.txt

// frappe.ui.form.on("VG_Billing_Order", {
// 	refresh(frm) {

// 	},
// });

// frappe.ui.form.on("VG_Billing_Order", {
//     refresh: function(frm) {
//         calculate_amt_paid_total(frm);
//     },

//     // Recalculate on child table changes
//     adv_payment_add: function(frm) {
//         calculate_amt_paid_total(frm);
//     },

//     adv_payment_remove: function(frm) {
//         calculate_amt_paid_total(frm);
//     },

//     // You may also want to track changes within child rows
//     validate: function(frm) {
//         calculate_amt_paid_total(frm);
//     }
// });

// frappe.ui.form.on("VD_Advance_Amount_CT", {
//     amt_paid: function(frm, cdt, cdn) {
//         calculate_amt_paid_total(frm);
//     }
// });

// function calculate_total_amount(frm) {
//     let total_sum = 0;

//     // Iterate over all rows in the child table, excluding the Grand Total row
//     $.each(frm.doc.adv_payment || [], function(i, row) {
//         // Skip the "Grand Total" row
//         if (row.is_total_row) {
//             return;
//         }

//         // Add totalamount to the sum if it's greater than zero (or is a valid number)
//         if (row.amount && row.amount > 0) {
//             total_sum += row.amount;
//         }
//     });

//     // Round total_sum to the nearest integer
//     total_sum = Math.round(total_sum);

//     // Assume amount is a field in the main doctype from which the Grand Total should be added
//     let amount = frm.doc.amount || 0;

//     // Add the total_sum to amount to get totalamount1
//     let adjusted_total = Math.round(amount + total_sum);  // Change subtraction to addition

//     // Set the adjusted total to the main doctype field 'totalamount1'
//     frm.set_value('totalamount1', adjusted_total);

//     // Refresh only the 'totalamount1' field to ensure the updated value is visible on the form
//     frm.refresh_field('totalamount1');

// }

// frappe.ui.form.on("VG_Billing_Order", {
//     refresh: function(frm) {
//         calculate_total_amount(frm);
//     },

//     adv_payment_add: function(frm) {
//         calculate_total_amount(frm);
//     },

//     adv_payment_remove: function(frm) {
//         calculate_total_amount(frm);
//     },

//     validate: function(frm) {
//         calculate_total_amount(frm);
//     }
// });

// frappe.ui.form.on("VD_Advance_Amount_CT", {
//     amt_paid: function(frm, cdt, cdn) {
//         calculate_total_amount(frm);
//     }
// });

// function calculate_total_amount(frm) {
//     let total_sum = 0;

//     $.each(frm.doc.adv_payment || [], function(i, row) {
//         if (row.amt_paid && row.amt_paid > 0) {
//             total_sum += row.amt_paid;
//         }
//     });

//     total_sum = Math.round(total_sum);

//     frm.set_value('amount', total_sum);
//     frm.refresh_field('amount');
// }
// //     // Assume amount is a field in the main doctype from which the Grand Total should be added


frappe.ui.form.on("VG_Billing_Order", {
    refresh: function (frm) {
        debugger;
        frm.add_custom_button("Send WhatsApp Message", function () {
            // Validate required fields
            if (!frm.doc.order_no || !frm.doc.ord_status) {
                frappe.msgprint(__("Order No and Order Status are required."));
                return;
            }

            frappe.call({
                method: "vgjewellry.VG_api.send_billing_order_status_message", // update with your actual Python method path
                args: {
                    order_no: frm.doc.order_no,
                    ord_status: frm.doc.ord_status
                },
                callback: function (r) {
                    debugger;
                    if (!r.exc) {
                        if (r.message.status === "success") {
                            frappe.msgprint({
                                title: __("Message Sent"),
                                message: `WhatsApp message sent to <b>${r.message.mobile}</b>:<br><br>${r.message.message.replace(/\n/g, "<br>")}`,
                                indicator: "green"
                            });
                        } else {
                            frappe.msgprint({
                                title: __("Error"),
                                message: r.message.message,
                                indicator: "red"
                            });
                        }
                    } else {
                        frappe.msgprint(__("An error occurred while sending the message."));
                    }
                }
            });
        });
    }
});


frappe.ui.form.on("VG_Billing_Order", {
    refresh: function(frm) {
        frm.add_custom_button("Send WhatsApp Message", function () {
            // Validate required fields
            if (!frm.doc.order_no || !frm.doc.ord_status) {
                frappe.msgprint(__("Order No and Order Status are required."));
                return;
            }

            frappe.call({
                method: "vgjewellry.VG_api.send_billing_order_status_message", // update with your actual Python method path
                args: {
                    order_no: frm.doc.order_no,
                    ord_status: frm.doc.ord_status
                },
                callback: function (r) {
                    if (!r.exc) {
                        if (r.message.status === "success") {
                            frappe.msgprint({
                                title: __("Message Sent"),
                                message: `WhatsApp message sent to <b>${r.message.mobile}</b>:<br><br>${r.message.message.replace(/\n/g, "<br>")}`,
                                indicator: "green"
                            });
                        } else {
                            frappe.msgprint({
                                title: __("Error"),
                                message: r.message.message,
                                indicator: "red"
                            });
                        }
                    } else {
                        frappe.msgprint(__("An error occurred while sending the message."));
                    }
                }
            });
        });

        calculate_total_amount(frm);
        fetch_and_populate_dia_details(frm);
    },

    order_no: function(frm) {
        // Trigger fetching child table data when order_no changes
        fetch_and_populate_dia_details(frm);
    },

    adv_payment_add: function(frm) {
        calculate_total_amount(frm);
    },

    adv_payment_remove: function(frm) {
        calculate_total_amount(frm);
    },

    validate: function(frm) {
        calculate_total_amount(frm);
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

frappe.ui.form.on("VD_Advance_Amount_CT", {
    amt_paid: function(frm, cdt, cdn) {
        calculate_total_amount(frm);
    }
});

function calculate_total_amount(frm) {
    let total_sum = 0;

    $.each(frm.doc.adv_payment || [], function(i, row) {
        if (row.amt_paid && row.amt_paid > 0) {
            total_sum += row.amt_paid;
        }
    });

    total_sum = Math.round(total_sum);

    frm.set_value('amount', total_sum);
    frm.refresh_field('amount');
}

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
                    // frappe.msgprint(__("No data found for Order No: {0}", [frm.doc.order_no]));
                }
            },
            error: function(err) {
                // frappe.msgprint(__("Error fetching diamond details: {0}", [err.message]));
            }
        });
    }
}


