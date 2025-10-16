if (!window.fabric) {
	const fabricScript = document.createElement('script');
	//fabricScript.src = "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.1/fabric.min.js";
	fabricScript.src = "/assets/vgjewellry/js/fabric.min.js";
	document.head.appendChild(fabricScript);
}

frappe.ui.form.on("VG_Customer_Order", {
	refresh: function (frm) {

		frm.fields_dict["labour_pergram"].$input.on("blur", function() {
			setTimeout(function(){
				let max_per=0;
				if(frm.doc.labour_pergram !=undefined){
					max_per=parseInt(frm.doc.labour_pergram)
				}
				frm.doc.label_table.forEach(row => {
					max_per=max_per< parseInt(row.label_labour)?parseInt(row.label_labour):max_per;
				})
				frm.set_value('labour_pergram',max_per);
				frm.refresh_field('labour_pergram');	
			},200);		
		});
		frappe.dom.set_style(`[data-fieldname="main_image_table"] .grid-row {min-height: 80px !important;}`);
		frappe.dom.set_style(`[data-fieldname="sample_image_table"] .grid-row {min-height: 80px !important;}`);
		frappe.dom.set_style(`[data-fieldname="label_table"] .grid-row {min-height: 80px !important;}`);
		frm.fields_dict["main_image_table"].grid.wrapper
			.off('click', 'img.main-attach-click')	
			.on('click', 'img.main-attach-click', function () {
				const row_name = $(this).closest('.grid-row').attr('data-name');
				const row = locals["Order Main Images"][row_name];
				open_fabric_editor(
					row.main_image,
					frm,
					row.doctype,
					row.name,
					'main_image',
					'main_attach_image',
					'main_image_table'
				);
			});
		frm.fields_dict["sample_image_table"].grid.wrapper
			.off('click', 'img.main-attach-click')	
			.on('click', 'img.main-attach-click', function () {
				const row_name = $(this).closest('.grid-row').attr('data-name');
				const row = locals["Order Sample Image"][row_name];
				open_fabric_editor(
					row.sample_image,
					frm,
					row.doctype,
					row.name,
					'sample_image',
					'sample_image_preview',
					'sample_image_table'
				);
			});
	}
});

frappe.ui.form.on("VG_Customer_Order", {
	onload: function(frm) {
		const style=document.createElement('style');
		style.innerHTML=`.awesomplete .small { display:none !important;}`;
		document.head.appendChild(style)
		const save_btn = document.querySelector('[data-label="Save"]');
		if (save_btn) {
			save_btn.style.display = 'none';
			frm.add_custom_button(__('Save Order'), function() {

			})
		}
		const allowed_roles = ['Administrator', 'Billing']; 
		const has_access = allowed_roles.some(role => frappe.user.has_role(role))   
		if (!has_access) {
			frm.toggle_display('advance_section1', false);
			frm.toggle_display('advance_section2', false);
		}else{
			frm.toggle_display('rate_apply_of_section',true);
		}

		let allowed_roles_2 = ['Billing'];
		let has_access_2 = allowed_roles_2.some(role => frappe.user.has_role(role))
		if (has_access_2) {
			const section_fieldnames = ['order_type_section', 'order_date_section','customer_details_section','branch_name_section','gold_colour_section','diamond_details_section','broadness_section','label_no_section','main_image_section','sample_send_section','sample_weight_section','sample_image_section','send_certificate_section']; 
			let section_active = false;

			frm.meta.fields.forEach(field => {
				if (section_fieldnames.includes(field.fieldname) && field.fieldtype === 'Section Break') {
					section_active = true;
					return;
				}

				if (section_active && field.fieldtype === 'Section Break') {
					section_active = false;
					return;
				}

				if (section_active) {
					frm.set_df_property(field.fieldname, 'read_only', has_access_2);
				}
			});
			frm.set_df_property("size_leg", 'read_only', 1);
		}




		// Store the initial value when the form loads
		frm.new_labour_per = frm.doc.labour_per;

		if (frm.is_new() && !frm.doc.order_date) {
			frm.set_value("order_date", frappe.datetime.get_today());
		}
	},

	/*rate_apply_of: function(frm){
		if(frm.doc.rate_apply_of=="Fix Rate"){
			frm.set_df_property('gold_rate_pergram', 'read_only', 0);
		}else{
			frm.set_value("gold_rate_pergram","");
			frm.set_df_property('gold_rate_pergram', 'read_only', true);
		}
		frm.refresh_field('gold_rate_pergram');
	},*/

	label_no: function(frm) {
		if (frm.doc.label_no) {
			frappe.call({
				method: "vgjewellry.VG_api.labelno",
				args: {
					labelno: frm.doc.label_no
				},
				callback: function(r) {

					if (r.message && r.message.length > 0) {
						frm.new_labour_per = r.message[0].LabourPer;  // Store for comparison
						frm.set_value("labour_per", r.message[0].LabourPer);
					}
				}
			});
		}
	},
	refresh: function(frm) {
		const save_btn = document.querySelector('[data-label="Save"]');
		if (save_btn) {
			let at_order_roles=['Administrator','Order'];
			let at_order_access= at_order_roles.some(role => frappe.user.has_role(role))
			if(at_order_access && frm.doc.order_status=="New"){
				frm.fields_dict.delivery_date.datepicker.update({ 
					minDate: new Date(frappe.datetime.get_today()),
				});
				//frm.set_df_property('print_on_counter', 'hidden', 0);
				save_btn.style.display = 'none';
				//frm.set_primary_action(__('Save Order'), function() {
				let save_order_btn=frm.add_custom_button(__('Save Order'), function() {
					frm.save().then(() => {
						frappe.call({
							method: "vgjewellry.vg_jewellery.doctype.vg_customer_order.vg_customer_order.print_thermal",
							args: {
								docname: frm.doc.name
							},
							callback: function(r) {
								if (r.message) {
									frappe.msgprint(r.message);
								}
							}
						});
					})


				});
				save_order_btn.addClass('order-custom-save-btn');
				frappe.dom.set_style(`
					.custom-actions:has(.order-custom-save-btn) {
						display:block !important;
					}
				`);
			}
		}
		const allowed_roles = ['Administrator', 'Billing'];
		const has_access = allowed_roles.some(role => frappe.user.has_role(role))  
		if (has_access && frm.doc.order_status=="New") {
			frm.add_custom_button(__('Resume & Print'), function() {
				if (!frm.doc.name) {
					return;
				}
				frm.set_value("order_status",'Resume');
				frm.save();
				frm.print_doc({
					print_format: 'VG_Customer_Order', 
					with_letterhead: true
				});

			});
			frm.add_custom_button(__('Hold & Print'), function() {
				if (!frm.doc.name) {
					return;
				}
				frm.set_value("order_status",'Hold');
				frm.save();
				frm.print_doc({
					print_format: 'VG_Customer_Order', 
					with_letterhead: true
				});

			});
		}	

		let ho_roles = ['Administrator', 'HO']; 
		let ho_access = ho_roles.some(role => frappe.user.has_role(role))  
		if(ho_access){
			frm.toggle_display('assign_vendor_section',true);			
			frm.toggle_display('order_updates_section',true);
			frm.toggle_display('admin_notesvisible_to_admin_only',true);
			frm.toggle_display('rate_apply_of_section',true);
			frm.set_df_property('rate_apply_of', 'read_only', true);
			frm.set_df_property('advance_amount', 'read_only', true);
			frm.toggle_display('advance_section2',true);
			frm.set_df_property('contact_number','hidden',true);
			frm.set_df_property('alt_number','hidden',true);
			frm.set_df_property('address','hidden',true);
			frm.set_df_property('assign_vendor', 'reqd', 1);
			frm.set_df_property('vendor_delivery_date', 'reqd', 1);
			frm.fields_dict.vendor_delivery_date.datepicker.update({ // Here date is the Todo field name.

				minDate: new Date(frm.doc.order_date),
				maxDate: new Date(frm.doc.delivery_date),
			});
		}
		if ((ho_access && frm.doc.order_status=="Pending" && frm.doc.assign_vendor) ||(ho_access && frm.doc.order_status=="Pending" && !frm.doc.assign_vendor) ) {
			/*var disable_field_ho=["order_type","order_date","delivery_date","sales_person","branch_name","counter","prod_name","app_net_wgt","gold_colr","gold_karat","size_leg","broadness1","description","pcs","jew_type","label_table","gold_rate_pergram","labour_pergram","estimate_incl_gst","sample_send","no_sam_send","sam_wgt","voucher_no","send_with_certi","send_witho_cert","assign_vendor","vendor_delivery_date","refference_by","main_image_table","sample_image_table"];
			disable_field_ho.forEach(fieldname => {
				frm.set_df_property(fieldname, 'read_only', true);
			})*/
			frm.toggle_display('send_whatsapp_cust_vendor_section',true);
			frm.set_value("send_whatsapp_to_vendor", 1);
			frm.add_custom_button(__('Received Order'), function() {
				if (!frm.doc.name) {
					return;
				}
				frm.set_value("order_status",'Under QC');
				frm.save();

			});
			frm.add_custom_button(__('Update Order'), function() {
				frm.save().then(() => {
					frappe.call({
						method: "vgjewellry.vg_jewellery.doctype.vg_customer_order.vg_customer_order.send_whatsapp_to_vendor",
						args: {
							docname: frm.doc.name
						},
						callback: function(r) {
							if (r.message) {
								frappe.msgprint(r.message);
							}
						}
					});
				})

			})
		}
		else if (ho_access && frm.doc.order_status=="Under QC") {
			frm.add_custom_button(__('Send To Labeling'), function() {
				if (!frm.doc.name) {
					return;
				}
				frm.set_value("order_status",'Labeling');
				frm.save();
			})
		}

		let ho_roles_l = ['Administrator', 'Labeling']; 
		let ho_access_l = ho_roles_l.some(role => frappe.user.has_role(role))   
		console.log("jii")
		if (ho_access_l && frm.doc.order_status=="Labeling") {
			frm.set_df_property('label_number', 'hidden', 0);
			frm.set_df_property('label_number', 'reqd', 1);
			frm.toggle_display('customer_details_section',false);
			var disable_field=["order_type","order_date","delivery_date","sales_person","branch_name","counter","prod_name","app_net_wgt","gold_colr","gold_karat","size_leg","broadness1","description","pcs","jew_type","label_table","gold_rate_pergram","labour_pergram","estimate_incl_gst","sample_send","no_sam_send","sam_wgt","voucher_no","send_with_certi","send_witho_cert","required_featur"];
			disable_field.forEach(fieldname => {
				frm.set_df_property(fieldname, 'read_only', true);
			})	
			setTimeout(() => {
				const save_btn = document.querySelector('[data-label="Save"]');
				if (save_btn) {
					save_btn.innerHTML = '<span class="hidden-xs">Send to Counter</span>';
				}
				frm.add_custom_button(__('Send To Counter'), function() {
					if (!frm.doc.name) {
						return;
					}
					frm.save()
						.then(() => {
							// Save success
							frm.set_value("order_status", "At Counter");
						})
						.catch(() => {
							frm.set_value("order_status", "Labeling");
							frm.save();
						});
				})
			}, 100);
		}
		let at_counter_roles=['Administrator','Order'];
		let at_counter_access= at_counter_roles.some(role => frappe.user.has_role(role))
		if(at_counter_access && frm.doc.order_status=="At Counter"){
			frm.set_df_property('label_number', 'hidden', 0);
			frm.set_df_property('label_number', 'read_only', true);
			frm.toggle_display('rate_apply_of_section',true);
			var disable_counter=["order_type","order_date","delivery_date","sales_person","branch_name","counter","prod_name","app_net_wgt","gold_colr","gold_karat","size_leg","broadness1","description","pcs","jew_type","label_table","gold_rate_pergram","labour_pergram","estimate_incl_gst","sample_send","no_sam_send","sam_wgt","voucher_no","send_with_certi","send_witho_cert","contact_number","rate_apply_of"];
			disable_counter.forEach(fieldname => {
				frm.set_df_property(fieldname, 'read_only', true);
			})	
			setTimeout(() => {
				const save_btn = document.querySelector('[data-label="Save"]');
				if (save_btn) {
					save_btn.style.display = 'none';
				}
				frm.add_custom_button(__(`Send Msg (${frm.doc.message_counter})`), function() {
					if (!frm.doc.name) {
						return;
					}
					frappe.call({
						method: "vgjewellry.VG_api.send_order_delivery_msg",
						args: {
							name: frm.doc.name
						},
						callback: function (r) {
							frappe.dom.unfreeze();
							console.log(r.message)
						}
					})
				})
			}, 100);
		}

	},

	prod_name : function(frm)
	{
		frm.set_query("size_leg",function(){
			return {
				filters:{
					item:["in",[frm.doc.prod_name]]
				}
			}
		})
		frm.fields_dict["size_leg"].df.only_select = 0;
		frm.refresh_field("size_leg");
	},

	//labour_pergram: function(frm) {
	/*frm.fields_dict["labour_pergram"].$input.on("blur", function() {
		let max_per=0;
		if(frm.doc.labour_pergram !=undefined){
			max_per=frm.doc.labour_pergram
		}
		frm.doc.label_table.forEach(row => {
			max_per=max_per<row.label_labour?row.label_labour:max_per;
		})
		frm.set_value('labour_pergram',max_per);
	}),*/
	order_date: function(frm) {
		let selected_date = frappe.datetime.str_to_obj(frm.doc.order_date);
		let today = frappe.datetime.str_to_obj(frappe.datetime.get_today());

		if (selected_date < today) {
			frappe.msgprint("Order Date cannot be in the past.");
			frm.set_value("order_date", frappe.datetime.get_today());
		}
	},
	rate_apply_of:function(frm){
		if(frm.doc.rate_apply_of=="Fix Rate"){
			frm.set_df_property('gold_rate_pergram', 'read_only', 0);
		}else{
			frm.set_value("gold_rate_pergram","");
			frm.set_df_property('gold_rate_pergram', 'read_only', true);
		}
		frm.refresh_field('gold_rate_pergram');

		let rate_apply_type= frm.doc.rate_apply_of;
		let gold_karat = frm.doc.gold_karat
		if (rate_apply_type=="Fix Rate"){
			frappe.call({
				method: "vgjewellry.VG_api.get_gold_rate",
				args: {
					gold_karat:gold_karat
				},
				callback: function (r) {
					console.log(r.message)
					frm.set_value("gold_rate_pergram",r.message[0]["rate"]);
					frm.set_df_property('gold_rate_pergram', 'read_only', true);
					frm.refresh_field('gold_rate_pergram');
				}	

			})
		}
	}
});
function set_section_editable(frm, section_fieldname, editable) {
	let section_fields = frm.fields_dict[section_fieldname].df.fields;
	section_fields.forEach(f => {
		console.log(f.fieldname)
		frm.set_df_property(f.fieldname, 'read_only', editable ? 0 : 1);
	});
}
frappe.ui.form.on('Order Label Number', {
	label_number(frm, cdt, cdn) {
		/*window.frm = frm
		window.cdt = cdt
		window.cdn = cdn*/
		const child = locals[cdt][cdn];
		const label_number = child.label_number;
		if (label_number) {
			frappe.call({
				method: "vgjewellry.VG_api.get_image",
				args: {
					label_number: label_number
				},
				callback: function (r) {
					frappe.dom.unfreeze();
					if (r.message && r.message.url) {
						frappe.model.set_value(cdt, cdn, 'image_to_display_url', r.message.url);
						//let img_html = `<img src="${r.message.url}" class="main-attach-click"  onclick="open_fabric_editor('${r.message.url}',window.frm,window.cdt,window.cdn,'image_to_display_url','image_preview','label_number')" style="max-width:60px; max-height:60px;" />`;
						let img_html = `<img src="${r.message.url}" class="main-attach-click"  onclick="open_fabric_editor('${r.message.url}','${frm.docname}','${cdt}','${cdn}','image_to_display_url','image_preview','label_number')" style="max-width:60px; max-height:60px;" />`;
						frappe.model.set_value(cdt, cdn, 'label_labour', r.message.labour);
						frappe.model.set_value(cdt, cdn, 'image_preview', img_html);
						let max_per=0;
						if(frm.doc.labour_pergram !=undefined){
							max_per=frm.doc.labour_pergram
						}
						frm.doc.label_table.forEach(row => {
							max_per=max_per<row.label_labour?row.label_labour:max_per;
						})

						frm.set_value('labour_pergram',max_per);
						frm.refresh_field('label_table');
					}
				}
			});
		}
	},
});
frappe.ui.form.on('Order Main Images', {
	main_image: function(frm, cdt, cdn) {
		/*window.frm = frm
		window.cdt = cdt
		window.cdn = cdn*/
		let row = frappe.get_doc(cdt, cdn);

		if (row.main_image) {
			/*row.main_attach_image = `
		<img src="${row.main_image}"  class="main-attach-click"  onclick="open_fabric_editor('${row.main_image}',window.frm,window.cdt,window.cdn,'main_image','main_attach_image','main_image_table')"  style="max-width:60px; max-height:60px; border:1px solid #ddd; padding:2px;">
	    `;*/
			row.main_attach_image = `
		<img src="${row.main_image}" class="main-attach-click"
		     onclick="open_fabric_editor('${row.main_image}', '${frm.docname}', '${cdt}', '${cdn}', 'main_image', 'main_attach_image', 'main_image_table')"
		     style="max-width:60px; max-height:60px; border:1px solid #ddd; padding:2px;">
	    `;
		} else {
			row.main_attach_image = "";
		}
		frm.refresh_field("main_image_table"); 
	}
});
frappe.ui.form.on('Order Sample Image', {
	sample_image: function(frm, cdt, cdn) {
		/*window.frm = frm
		window.cdt = cdt
		window.cdn = cdn*/
		let row = frappe.get_doc(cdt, cdn);

		if (row.sample_image) {
			row.sample_image_preview = `
		<img src="${row.sample_image}" class="main-attach-click" onclick="open_fabric_editor('${row.sample_image}','${frm.docname}','${cdt}','${cdn}','image','sample_image_preview','order_sample_image')"  style="max-width:60px; max-height:60px; border:1px solid #ddd; padding:2px;">
	    `;
		} else {
			row.sample_image_preview = "";
		}
		frm.refresh_field("order_sample_image"); 
	}
});
frappe.ui.form.on('VD_Advance_Amount_CT',{
	amt_paid: function (frm,cdt,cdn){
		calculate_advance(frm)
	},

	adv_payment_remove: function (frm,cdt,cdn){
		calculate_advance(frm)
	},
	adv_pay_type: function(frm,cdt,cdn){
		let row = locals[cdt][cdn];
		frm.fields_dict["adv_payment"].grid.toggle_enable("old_gold_weight", row.adv_pay_type == "Old Gold", row.name);


		frm.refresh_field("adv_payment");

	},
	adv_payment_add: function (frm,cdt,cdn){
		let row = locals[cdt][cdn];
		frm.fields_dict["adv_payment"].grid.toggle_enable("old_gold_weight", row.adv_pay_type == "Old Gold", row.name);


		frm.refresh_field("adv_payment");
	},

});
function calculate_advance(frm){
	let advance=0;
	(frm.doc.adv_payment || []).forEach(row =>{
		advance+= row.amt_paid ||0
	})
	frm.set_value("advance_amount",advance);
}
window.open_fabric_editor = function(image_url,docname,cdt,cdn,img_text,img_preview,parent_div) {
	let canvas=null;
	let row = frappe.get_doc(cdt, cdn);
	let frm = cur_frm;
	if (canvas) {
		canvas.dispose();
		canvas = null;
	}
	let dialog = new frappe.ui.Dialog({
		title: 'Edit Image',
		size: 'large',
		fields: [
			{
				fieldtype: 'HTML',
				fieldname: 'canvas_area'
			}
		],
		primary_action_label: 'Save',
		primary_action() {
			const dataUrl = canvas.toDataURL({ format: 'jpeg', quality: 0.95 });

			// Upload the image to Frappe's File Doctype
			frappe.call({
				method: 'vgjewellry.VG_api.attach_file',
				args: {
					filename: `marked_image_${frappe.datetime.now_datetime()}.jpg`,
					filedata: dataUrl,
					doctype: cur_frm.doctype,
					docname: cur_frm.docname,
					is_private: 0  // or 1 if you want private
				},
				callback: function (res) {
					if (res.message && res.message.file_url) {
						const file_url = res.message.file_url;
						console.log(img_text);	
						// Set the file URL to the image field
						//frappe.model.set_value(cdt, cdn, 'image_to_display_url', file_url); 
						frappe.model.set_value(cdt, cdn, img_text, file_url); 
						/*let img_html = `<img src="${file_url}" class="main-attach-click"  onclick="open_fabric_editor('${file_url}',window.frm,cdt,cdn,'${img_text}','${img_preview}','${parent_div}')"  style="max-width:60px; max-height:60px;" />`;*/
						let img_html = `
			    <img src="${file_url}"
				 class="main-attach-click"
				 onclick="open_fabric_editor('${file_url}', '${docname}', '${cdt}', '${cdn}', '${img_text}', '${img_preview}', '${parent_div}')"
				 style="max-width:60px; max-height:60px;" />
			`;

						//frappe.model.set_value(cdt, cdn, 'image_preview', img_html);
						frappe.model.set_value(cdt, cdn, img_preview, img_html);
						//frm.refresh_field('label_table');
						frm.refresh_field(parent_div);
						//frm.set_value('image_to_display_url', file_url);
					} else {
						frappe.msgprint(__('Something went wrong while uploading the file.'));
					}
				}
			});
			dialog.hide();
		}
	});

	dialog.onhide = () => {
		if (canvas) {
			canvas.dispose();
			canvas = null;
		}
		const wrapper = dialog.fields_dict.canvas_area.wrapper;
		wrapper.innerHTML = '';
	};
	dialog.show();

	const canvas_wrapper = dialog.fields_dict.canvas_area.wrapper;
	canvas_wrapper.innerHTML = `
	<div style="overflow:auto">
	    <canvas id="fabric_canvas" width="750" height="500" style="border:1px solid #ccc;"></canvas>
	</div>
    `;

	setTimeout(() => {
		canvas = new fabric.Canvas('fabric_canvas');
		const maxCanvasWidth = 750;
		const maxCanvasHeight = 500;
		canvas.setWidth(maxCanvasWidth);
		canvas.setHeight(maxCanvasHeight);
		fabric.Image.fromURL(image_url, function(img) {
			const scale = Math.min(
				maxCanvasWidth / img.width,
				maxCanvasHeight / img.height
			);

			img.scale(scale);

			// Center the image
			img.set({
				left: (maxCanvasWidth - img.width * scale) / 2,
				top: (maxCanvasHeight - img.height * scale) / 2,
				selectable: false
			});
			//		canvas.setWidth(img.width);
			//		canvas.setHeight(img.height);
			canvas.add(img);
			img.sendToBack();
			canvas.isDrawingMode = true;
			canvas.freeDrawingBrush.width = 3;
			canvas.freeDrawingBrush.color = 'red';
		}, { crossOrigin: 'anonymous' });
		canvas.renderAll();
	}, 200);
};
