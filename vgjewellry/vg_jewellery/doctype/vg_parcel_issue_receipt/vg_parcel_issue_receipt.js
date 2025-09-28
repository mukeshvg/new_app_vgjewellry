// Copyright (c) 2025, SamarthIT and contributors
// For license information, please see license.txt

// frappe.ui.form.on("VG_Parcel_Issue_Receipt", {
// 	refresh(frm) {

// 	},
// });
frappe.ui.form.on('VG_Parcel_Issue_Receipt', {
    refresh: function(frm) {
        // Triggered when the parcel_type field changes
        frm.fields_dict.parcel_type.$input.on('change', function() {
            updateFieldVisibility(frm);
        });

        // Triggered when the send_recive field changes
        frm.fields_dict.send_recive.$input.on('change', function() {
            updateFieldVisibility(frm);
        });
    },
    parcel_type: function(frm) {
        updateFieldVisibility(frm);
    },
    send_recive: function(frm) {
        updateFieldVisibility(frm);
    }
});

function updateFieldVisibility(frm) {
    if (frm.doc.parcel_type === 'Inside') {
        // Show only the fields needed
        frm.toggle_display('sender_emp_name', true);
        frm.toggle_display('sender_branch', true);
        frm.toggle_display('receiver_branch', true);
        frm.toggle_display('receiver_name', true);
        frm.toggle_display('remarks', true);
        frm.toggle_display('receiver_emp_name', true);

        // Hide the rest
        frm.toggle_display('sender_supplier', false);
        frm.toggle_display('send_recive', false);
        frm.toggle_display('receiver_supplier', false);
        frm.toggle_display('parcel_delivered_by_name', false); 
        frm.toggle_display('parcel_recieve_mo_number', false);
        frm.toggle_display('parcel_delivered_mo_number', false);
        frm.toggle_display('receiver_dept', false);
        frm.toggle_display('receiver_dept_section', false);
        frm.toggle_display('sourcemode', false);
        frm.toggle_display('parcel_receive_by_name', false);

        // Hide Department_Details fields
        frm.toggle_display('received_by', false);
        frm.toggle_display('rec_gold', false);
        frm.toggle_display('rec_silver', false);
        frm.toggle_display('vg_voucher_no', false);
        frm.toggle_display('vou_gold', false);
        frm.toggle_display('vou_silver', false);
        frm.toggle_display('app_diamond', false);
        frm.toggle_display('app_gold', false);
        frm.toggle_display('app_silver', false);

        // Required field rules
        frm.toggle_reqd('sender_emp_name', true);
        frm.toggle_reqd('sender_branch', true);
        frm.toggle_reqd('receiver_branch', true);
        frm.toggle_reqd('sender_supplier', false);
        frm.toggle_reqd('receiver_supplier', false);
    } else if (frm.doc.parcel_type === 'Outside') {
        if (frm.doc.send_recive == 'Send') {
            // Show only the specific fields for Outside and Send
            frm.toggle_display('sender_emp_name', true);
            frm.toggle_display('sender_branch', true);
            frm.toggle_display('receiver_supplier', true);
            frm.toggle_display('receiver_name', true);
            frm.toggle_display('remarks', true);
            frm.toggle_display('receiver_emp_name', true);
    
            // Hide all other fields
            frm.toggle_display('receiver_branch', false);
            frm.toggle_display('sender_supplier', false);
            frm.toggle_display('send_recive', true);  // Keep 'send_recive' visible
            frm.toggle_display('receiver_dept', false);
            // frm.toggle_display('receiver_emp_name', false);
            frm.toggle_display('receiver_dept_section', false);
            frm.toggle_display('received_by', false);
            frm.toggle_display('vg_voucher_no', false);
            frm.toggle_display('parcel_delivered_by_name', false);
            frm.toggle_display('parcel_delivered_mo_number', false);

    
            // Make fields mandatory for this case
            frm.toggle_reqd('sender_emp_name', true);
            frm.toggle_reqd('sender_branch', true);
            frm.toggle_reqd('receiver_supplier', true);
          

    
            // Fields not mandatory for this case
            frm.toggle_reqd('receiver_branch', false);
            frm.toggle_reqd('receiver_name', false);
            frm.toggle_reqd('remarks', false);
            frm.toggle_reqd('sender_supplier', false);
            frm.toggle_display('received_by', false);
            frm.toggle_display('rec_gold', false);
            frm.toggle_display('rec_silver', false);
            frm.toggle_display('vg_voucher_no', false);
            frm.toggle_display('vou_gold', false);
            frm.toggle_display('vou_silver', false);
            frm.toggle_display('app_diamond', false);
            frm.toggle_display('app_gold', false);
            frm.toggle_display('app_silver', false);

    } 
        } else if (frm.doc.send_recive == 'Receive') {
            // Show only the specific fields for Outside and Receive
            frm.toggle_display('sender_supplier', true);
            frm.toggle_display('receiver_branch', true);
            frm.toggle_display('receiver_emp_name', true);
            frm.toggle_display('source/mode', true);
            frm.toggle_display('parcel_delivered_mo_number', true);
            frm.toggle_display('parcel_delivered_by_name', true);
            frm.toggle_display('remarks', true);
            frm.toggle_display('receiver_dept_section', true);

            frm.toggle_display('receiver_dept', true);
            frm.toggle_display('dept_det', true);
            
           // frm.toggle_display('vg_voucher_no', false);
    
            // Hide all other fields
            frm.toggle_display('sender_emp_name', false);
            frm.toggle_display('sender_branch', false);
            frm.toggle_display('receiver_supplier', false);
            frm.toggle_display('parcel_recieve_mo_number', false);
            frm.toggle_display('parcel_receive_by_name', false);
            // frm.toggle_display('receiver_dept', false);
           
    
            // Make fields mandatory for this case
            frm.toggle_reqd('sender_supplier', true);
            frm.toggle_reqd('receiver_emp_name', false);
            frm.toggle_reqd('receiver_branch', true);
            frm.toggle_display('parcel_delivered_by_name', true);
    
            // Fields not mandatory for this case
            frm.toggle_reqd('sender_emp_name', false);
            frm.toggle_reqd('sender_branch', false);
            frm.toggle_reqd('receiver_supplier', false);
        
            frm.toggle_reqd('remarks', false);

            } else {
            // Handle other cases for 'Outside' if needed

            frm.toggle_display('sender_emp_name', false);
            // frm.toggle_display('source/mode', false);
            frm.toggle_display('sender_branch', false);
            frm.toggle_display('receiver_supplier', false);
            frm.toggle_display('sender_supplier', false);
            frm.toggle_display('receiver_branch', false);
    
            // Reset mandatory fields
            frm.toggle_reqd('sender_emp_name', false);
            // frm.toggle_reqd('source/mode', false);
            frm.toggle_reqd('sender_branch', false);
            frm.toggle_reqd('receiver_supplier', false);
            frm.toggle_reqd('sender_supplier', false);
            frm.toggle_reqd('receiver_branch', false);
        }
    }


