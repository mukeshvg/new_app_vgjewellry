frappe.listview_settings['VG_Customer_Order'] = {
	onload(listview) {
		function updateTitleFromQuery() {
			const queryParams = new URLSearchParams(window.location.search);
			const orderStatus = queryParams.get('order_status');
			//console.log(orderStatus);

			if (orderStatus) {
				if(orderStatus=='["in",["Pending","Resume"]]'){
					listview.page.set_title(`Unassigned Vendor Orders`);
				}
				else
					listview.page.set_title(`${orderStatus} Orders`);
			} 
		}

		updateTitleFromQuery();
		setInterval(updateTitleFromQuery, 100);
	
	 /*frappe.call({
            method: "frappe.client.get",
            args: {
                doctype: "User",
                name: frappe.session.user
            },
            callback: function(response) {
                const user = response.message;
                const preferred = user.jewellery_type;
		console.log(user);
                if (preferred) {
                    listview.filter_area.add([[ "jewellery_type", "=", preferred ]]);
                }
            }
        });*/
    }
};

