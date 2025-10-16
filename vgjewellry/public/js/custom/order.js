frappe.ui.form.on('VG_Customer_Order', {
	onload: function(frm) {
		// Only set if branch is not already filled
		if (!frm.doc.branch_name) {
			frappe.call({
				method: "frappe.client.get",
				args: {
					doctype: "User",
					name: frappe.session.user
				},
				callback: function(r) {
					if (r.message && r.message.branch) {
						frm.set_value('branch_name', r.message.branch);
						frm.set_value('jew_type', r.message.jewellery_type);
						frm.set_value('counter', r.message.counter);
						frm.toggle_display('diamond_details_section',false);	    
						if(r.message.jewellery_type=="Diamond"){
							frm.toggle_display('diamond_details_section',true);
						}
						/*frm.set_query('print_on_counter', function(){
				return {
					filters:{
						branch:["=", r.message.branch]
					}
				}
			})
			frm.set_value('print_on_counter', r.message.counter);*/   
						frappe.db.get_list("Supplier_Master",{
							fields: ["name","supplier_code"],
							filters:{
								"supplier_code":["like","%"+r.message.jewellery_type]
							},
							limit_page_length: 1000
						}).then(records=>{
							var codes=[]
							var t=[]
							records.forEach((rec)=>{
								codes.push(rec.name)
								t.push(rec.supplier_code)
							})
							frm.set_query('assign_vendor', function(){
								return {
									filters:{
										name:["in",codes]
									}
								}
							})
						})	
						frappe.db.get_list("Branch Counter Item",{
							fields: ["item"],
							filters:{
								"branch":r.message.branch,
								"counter":r.message.counter
							},
							limit_page_length: 100
						}).then(records=>{
							var items=[]
							records.forEach((rec)=>{
								items.push(rec.item)
							})
							frm.set_query('prod_name', function(){
								return {
									filters:{
										name:["in",items]
									}
								}
							})
							frm.set_query('gold_karat',function(){
								return {
									filters:{
										name:["in",['M-000801','M-000802','M-000807','M-000817','M-000816']]
									}
								}
							})
						})    
					}
				}
			});
		}
	},
	refresh: function(frm) {
		const isHO = frappe.user_roles.includes("HO");
		const isLabeling = frm.doc.order_status === "Labeling";
		console.log(frm.doc.order_status)
		if (isHO && isLabeling) {	
			// frm.disable_save();
		}
		frappe.db.get_list("Supplier_Master",{
			fields: ["name","supplier_code"],
			filters:{
				"supplier_code":["like","%"+frm.doc.jew_type]
			},
			limit_page_length: 1000
		}).then(records=>{
			var codes=[]
			var t=[]
			records.forEach((rec)=>{
				codes.push(rec.name)
				t.push(rec.supplier_code)
			})
			frm.set_query('assign_vendor', function(){
				return {
					filters:{
						name:["in",codes]
					}
				}
			})
		})	
		frm.set_query('gold_karat',function(){
			return {
				filters:{
					name:["in",['M-000801','M-000802','M-000807','M-000817','M-000816']]
				}
			}
		})
	}	
});

