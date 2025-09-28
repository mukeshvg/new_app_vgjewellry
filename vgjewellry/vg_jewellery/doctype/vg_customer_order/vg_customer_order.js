// Copyright (c) 2025, SamarthIT and contributors
// For license information, please see license.txt

// frappe.ui.form.on("VG_Customer_Order", {
// 	refresh(frm) {

// 	},
// });

// frappe.ui.form.on("VG_Customer_Order", {
//     label_no: function(frm) {
//         if (frm.doc.label_no) {
//             frappe.call({
//                 method: "vgjewellry.VG_api.labelno", // Replace with your correct path
//                 args: {
//                     labelno: frm.doc.label_no
//                 },
//                 callback: function(r) {
//                     if (r.message && r.message.length > 0) {
//                         frm.set_value("labour_per", r.message[0].LabourPer);
//                     } 
//                 }
//             });
//         }
//     },
//     cur_frm.doc.labour_per < 
// });

// frappe.ui.form.on("VG_Customer_Order", {
//     label_no: function(frm) {
//         debugger;
//         if (frm.doc.label_no) {
//             frappe.call({
//                 method: "vgjewellry.VG_api.labelno", // Make sure this path is correct
//                 args: {
//                     labelno: frm.doc.label_no
//                 },
//                 callback: function(r) {
//                     debugger;
//                     if (r.message && r.message.length > 0) {
//                         let new_labour_per = r.message[0].LabourPer;
//                         let current_labour_per = frm.doc.labour_per || 0;

//                         // Only set the value if new one is greater than or equal to current
//                         if (new_labour_per >= current_labour_per) {
//                             frm.set_value("labour_per", new_labour_per);
//                         } else {
//                             frappe.msgprint(__("New Labour % is less than current value. Not updated."));
//                         }
//                     }
//                 }
//             });
//         }
//     }
// // });

// frappe.ui.form.on("VG_Customer_Order", {
//     onload: function(frm) {
//         // Store the initial value when the form loads
//         frm.new_labour_per = frm.doc.labour_per;

//         if (frm.is_new() && !frm.doc.order_date) {
//         frm.set_value("order_date", frappe.datetime.get_today());
//     }
//     },

//     label_no: function(frm) {
  
//         if (frm.doc.label_no) {
//             frappe.call({
//                 method: "vgjewellry.VG_api.labelno",
//                 args: {
//                     labelno: frm.doc.label_no
//                 },
//                 callback: function(r) {

//                     if (r.message && r.message.length > 0) {
//                         frm.new_labour_per = r.message[0].LabourPer;  // Store for comparison
//                         frm.set_value("labour_per", r.message[0].LabourPer);
//                     }
//                 }
//             });
//         }
//     },

//     labour_per: function(frm) {

//         let previous_value = frm.new_labour_per || 0;
//         let current_value = frm.doc.labour_per || 0;

//         console.log("Previous Labour Per:", previous_value);
//         console.log("Current Labour Per:", current_value);

//         if (current_value < previous_value) {
//             frappe.msgprint(`Labour Per decreased from ${previous_value} so provide correct value.`);
//             // Optionally, reset to previous value:
//             // frm.set_value("labour_per", previous_value);
//         }
//     },
//         order_date: function(frm) {
//         let selected_date = frappe.datetime.str_to_obj(frm.doc.order_date);
//         let today = frappe.datetime.str_to_obj(frappe.datetime.get_today());

//         if (selected_date < today) {
//             frappe.msgprint("Order Date cannot be in the past.");
//             frm.set_value("order_date", frappe.datetime.get_today());
//         }
//     }
// });

// frappe.ui.form.on("VG_Customer_Order", {
// 	// your existing code...

// 	after_save: function(frm) {
// 		// Call WhatsApp message API after order is saved
// 		frappe.call({
// 			method: "vgjewellry.VG_api.send_single_order_message",
// 			args: {
// 				order_id: frm.doc.name
// 			},
// 			callback: function(r) {
// 				if (r.message) {
// 					frappe.msgprint("WhatsApp message sent to customer.");
// 				}
// 			}
// 		});
// 	}
// });


// frappe.ui.form.on("VG_Customer_Order", {
//     refresh: function(frm) {
//         if (!frm.is_new()) {
//             frm.add_custom_button("Send WhatsApp Message", function() {
//                 // if (!frm.doc.contact_number) {
//                 //     frappe.msgprint("Please enter the customer's mobile number (contact_number).");
//                 //     return;
//                 // }

//                 frappe.call({
//                     method: "vgjewellry.VG_api.send_single_order_message",
//                     args: {
//                         order_id: frm.doc.name
//                     },
//                     callback: function(r) {
//                         if (r.message) {
//                             frappe.msgprint("✅ WhatsApp message sent successfully.");
//                         } else {
//                             frappe.msgprint("❌ Failed to send WhatsApp message.");
//                         }
//                     }
//                 });
//             }).addClass("btn-primary");
//         }
//     }
// });

// frappe.ui.form.on("VG_Customer_Order", {
//     onload: function(frm) {
//         // Store the initial value when the form loads
//         frm.new_labour_per = frm.doc.labour_per;

//         if (frm.is_new() && !frm.doc.order_date) {
//         frm.set_value("order_date", frappe.datetime.get_today());
//     }
//     },

//     label_no: function(frm) {
  
//         if (frm.doc.label_no) {
//             frappe.call({
//                 method: "vgjewellry.VG_api.labelno",
//                 args: {
//                     labelno: frm.doc.label_no
//                 },
//                 callback: function(r) {

//                     if (r.message && r.message.length > 0) {
//                         frm.new_labour_per = r.message[0].LabourPer;  // Store for comparison
//                         frm.set_value("labour_per", r.message[0].LabourPer);
//                     }
//                 }
//             });
//         }
//     },


    


//             // refresh: function(frm) {
//     // Only add button if message hasn't been sent yet
// //     if (!frm.doc.whatsapp_sent) {
// //         frm.add_custom_button(__('Send WhatsApp Message'), function() {
// //             if (!frm.doc.name) return;

// //             frappe.call({
// //                 method: "vgjewellry.VG_api.send_single_order_message",
// //                 args: {
// //                     name: frm.doc.name
// //                 },
// //                 callback: function(r) {
// //                     if (!r.exc) {
// //                         frappe.msgprint(r.message || "Message sent successfully.");

// //                         // Mark as sent
// //                         frm.set_value("whatsapp_sent", 1);
// //                         frm.save();  // Save the state so it persists
// //                     }
// //                 }
// //             });
// //         });
// //     }
// // }
//     refresh: function(frm) {

//         // Add a custom button to send WhatsApp message
//         frm.add_custom_button(__('Send WhatsApp Message'), function() {
//             if (!frm.doc.name) {
//                 // frappe.msgprint("Order ID not found.");
//                 return;
//             }

//             frappe.call({
//                 method: "vgjewellry.VG_api.send_single_order_message", // change `your_app` to your actual app name
//                 args: {
//                     name: frm.doc.name
//                     // No need to pass contact_number, it's fetched internally
//                 },
//                 callback: function(r) {

//                     if (!r.exc) {
//                         frappe.msgprint(r.message || "Message sent successfully.");
//                     }
//                 }
//             });
//         });

//          // 🔒 Make fields read-only after save
//     if (!frm.is_new()) {
//         frm.fields.forEach(function(field) {
//             if (
//                 field.df.fieldtype !== "Section Break" &&
//                 field.df.fieldtype !== "Column Break" &&
//                 field.df.fieldname
//             ) {
//                 frm.set_df_property(field.df.fieldname, "read_only", 1);
//             }
//         });     

//         frm.disable_save(); // Optional: disable Save button too
//     }
//     },

//     labour_per: function(frm) {

//         let previous_value = frm.new_labour_per || 0;
//         let current_value = frm.doc.labour_per || 0;

//         console.log("Previous Labour Per:", previous_value);
//         console.log("Current Labour Per:", current_value);

//         if (current_value < previous_value) {
//             frappe.msgprint(`Labour Per decreased from ${previous_value} so provide correct value.`);
//             // Optionally, reset to previous value:
//             // frm.set_value("labour_per", previous_value);
//         }
//     },
//         order_date: function(frm) {
//         let selected_date = frappe.datetime.str_to_obj(frm.doc.order_date);
//         let today = frappe.datetime.str_to_obj(frappe.datetime.get_today());

//         if (selected_date < today) {
//             frappe.msgprint("Order Date cannot be in the past.");
//             frm.set_value("order_date", frappe.datetime.get_today());
//         }
//     }
// });


// frappe.ui.form.on("VG_Customer_Order", {
//     refresh: function(frm) {
//         if (frm.doc.order_no) {
//             frappe.call({
//                 method: "vgjewellry.VG_api.Get_Data_From_Billing_Order",
//                 args: {
//                     order_no: frm.doc.order_no
//                 },
//                 callback: function(r) {
//                     if (!r.exc) {
//                         frappe.msgprint(r.message || "Data fetched successfully.");
//                     }
//                 }
//             });
//         }
//     }
// });


// frappe.ui.form.on("VG_Customer_Order", {
//     refresh: function (frm) {
//         if (frm.doc.name) {
//             frappe.call({
//                 method: "vgjewellry.VG_api.Get_Data_From_Billing_Order",
//                 args: {
//                     order_no: frm.doc.name   // 👈 'name' is the ID of the current order
//                 },
//                 callback: function (r) {
//                     if (r.message && r.message.length > 0) {
//                         // ✅ Make all fields read-only if linked in billing order
//                         frm.fields.forEach(function (field) {
//                             if (
//                                 field.df.fieldtype !== "Section Break" &&
//                                 field.df.fieldtype !== "Column Break" &&
//                                 field.df.fieldname
//                             ) {
//                                 frm.set_df_property(field.df.fieldname, "read_only", 1);
//                             }
//                         });

//                         // ✅ Make child tables read-only too
//                         frm.meta.fields.forEach((df) => {
//                             if (df.fieldtype === "Table") {
//                                 frm.fields_dict[df.fieldname].grid.update_docfield_property("read_only", 1);
//                             }
//                         });

//                         frappe.msgprint("This order is already linked in Billing Order. It is now read-only.");
//                     }
//                 }
//             });
//         }
//     }
// });

// frappe.ui.form.on("VG_Customer_Order", {
//     onload: function(frm) {
//         // Store the initial value when the form loads
//         frm.new_labour_per = frm.doc.labour_per;

//         if (frm.is_new() && !frm.doc.order_date) {
//         frm.set_value("order_date", frappe.datetime.get_today());
//     }
//     },

//     label_no: function(frm) {
  
//         if (frm.doc.label_no) {
//             frappe.call({
//                 method: "vgjewellry.VG_api.labelno",
//                 args: {
//                     labelno: frm.doc.label_no
//                 },
//                 callback: function(r) {

//                     if (r.message && r.message.length > 0) {
//                         frm.new_labour_per = r.message[0].LabourPer;  // Store for comparison
//                         frm.set_value("labour_per", r.message[0].LabourPer);
//                     }
//                 }
//             });
//         }
//     },
//     refresh: function(frm) {

//         // Add a custom button to send WhatsApp message
//         frm.add_custom_button(__('Send WhatsApp Message'), function() {
//             if (!frm.doc.name) {
//                 // frappe.msgprint("Order ID not found.");
//                 return;
//             }

//             frappe.call({
//                 method: "vgjewellry.VG_api.send_single_order_message", // change `your_app` to your actual app name
//                 args: {
//                     name: frm.doc.name
//                     // No need to pass contact_number, it's fetched internally
//                 },
//                 callback: function(r) {

//                     if (!r.exc) {
//                         frappe.msgprint(r.message || "Message sent successfully.");
//                     }
//                 }
//             });
//         });
        
//         if (frm.doc.name) {
//             frappe.call({
//                 method: "vgjewellry.VG_api.Get_Data_From_Billing_Order",
//                 args: {
//                     order_no: frm.doc.name   // 👈 'name' is the ID of the current order
//                 },
//                 callback: function (r) {
//                     if (r.message && r.message.length > 0) {
//                         // ✅ Make all fields read-only if linked in billing order
//                         frm.fields.forEach(function (field) {
//                             if (
//                                 field.df.fieldtype !== "Section Break" &&
//                                 field.df.fieldtype !== "Column Break" &&
//                                 field.df.fieldname
//                             ) {
//                                 frm.set_df_property(field.df.fieldname, "read_only", 1);
//                             }
//                         });

//                         // ✅ Make child tables read-only too
//                         frm.meta.fields.forEach((df) => {
//                             if (df.fieldtype === "Table") {
//                                 frm.fields_dict[df.fieldname].grid.update_docfield_property("read_only", 1);
//                             }
//                         });

//                         frappe.msgprint("This order is already linked in Billing Order. It is now read-only.");
//                     }
//                 }
//             });
//         }

//     },

//     labour_per: function(frm) {

//         let previous_value = frm.new_labour_per || 0;
//         let current_value = frm.doc.labour_per || 0;

//         console.log("Previous Labour Per:", previous_value);
//         console.log("Current Labour Per:", current_value);

//         if (current_value < previous_value) {
//             frappe.msgprint(`Labour Per decreased from ${previous_value} so provide correct value.`);
//             // Optionally, reset to previous value:
//             // frm.set_value("labour_per", previous_value);
//         }
//     },
//         order_date: function(frm) {
//         let selected_date = frappe.datetime.str_to_obj(frm.doc.order_date);
//         let today = frappe.datetime.str_to_obj(frappe.datetime.get_today());

//         if (selected_date < today) {
//             frappe.msgprint("Order Date cannot be in the past.");
//             frm.set_value("order_date", frappe.datetime.get_today());
//         }
//     }
// });




frappe.ui.form.on("VG_Customer_Order", {
    onload: function(frm) {
        frm.new_labour_per = frm.doc.labour_per;

        if (frm.is_new() && !frm.doc.order_date) {
            frm.set_value("order_date", frappe.datetime.get_today());
        }
    },

    label_no: function(frm) {
        if (frm.doc.label_no) {
            frappe.call({
                method: "vgjewellry.VG_api.labelno",
                args: {
                    labelno: frm.doc.label_no
                },
                callback: function(r) {
                    if (r.message && r.message.length > 0) {
                        frm.new_labour_per = r.message[0].LabourPer;
                        frm.set_value("labour_per", r.message[0].LabourPer);
                    }
                }
            });
        }
    },

    refresh: function(frm) {
        // WhatsApp Button
        frm.add_custom_button(__('Send WhatsApp Message'), function() {
            if (!frm.doc.name) return;

            frappe.call({
                method: "vgjewellry.VG_api.send_single_order_message",
                args: { name: frm.doc.name },
                callback: function(r) {
                    if (!r.exc) {
                        frappe.msgprint(r.message || "Message sent successfully.");
                    }
                }
            });
        });

        // Make fields read-only if linked to Billing Order
        if (frm.doc.name) {
            frappe.call({
                method: "vgjewellry.VG_api.Get_Data_From_Billing_Order",
                args: { order_no: frm.doc.name },
                callback: function (r) {
                    if (r.message && r.message.length > 0) {
                        frm.fields.forEach(function (field) {
                            if (field.df.fieldtype !== "Section Break" && field.df.fieldtype !== "Column Break" && field.df.fieldname) {
                                frm.set_df_property(field.df.fieldname, "read_only", 1);
                            }
                        });

                        frm.meta.fields.forEach((df) => {
                            if (df.fieldtype === "Table") {
                                frm.fields_dict[df.fieldname].grid.update_docfield_property("read_only", 1);
                            }
                        });

                        frappe.msgprint("This order is already linked in Billing Order. It is now read-only.");
                    }
                }
            });
        }
    },

    labour_per: function(frm) {
        let previous_value = frm.new_labour_per || 0;
        let current_value = frm.doc.labour_per || 0;

        if (current_value < previous_value) {
            frappe.msgprint(`Labour Per decreased from ${previous_value}, please provide correct value.`);
        }
    },

    order_date: function(frm) {
        let selected_date = frappe.datetime.str_to_obj(frm.doc.order_date);
        let today = frappe.datetime.str_to_obj(frappe.datetime.get_today());

        if (selected_date < today) {
            frappe.msgprint("Order Date cannot be in the past.");
            frm.set_value("order_date", frappe.datetime.get_today());
        }
    },

    after_save: function(frm) {
        if (frm.doc.name) {
            frappe.call({
                method: "vgjewellry.VG_api.send_single_order_message",
                args: {
                    name: frm.doc.name,
                    reprint: frm.doc.reprint  // Optional: pass to backend if needed
                },
                callback: function(r) {
                    if (!r.exc) {
                        if (frm.doc.reprint) {
                            frappe.msgprint(r.message || "Reprint WhatsApp message sent.");
                            frappe.db.set_value(frm.doctype, frm.docname, "reprint", 0);
                        } else {
                            frappe.msgprint(r.message || "WhatsApp message sent.");
                        }
                    }
                }
            });
        }
    }
});
