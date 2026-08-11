frappe.pages['quotation-import-new'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Quotation Import New',
		single_column: true
	});

	page.add_inner_button(__('Download Sample'), function () {
		window.open('/api/method/vgjewellry.vg_jewellery.page.quotation_import_new.quotation_import_new.download_sample');
	});

	let html = `
	<div class="mt-4">
	    <input type="file" id="quotation_file" accept=".xlsx,.xls"/>

	    <br><br>

	    <button class="btn btn-primary" id="upload_excel">
		Upload Excel
	    </button>
	</div>
    `;

	$(page.body).html(html);
	$('#upload_excel').click(function () {

		let file = $('#quotation_file')[0].files[0];

		if (!file){
			frappe.msgprint("Please select Excel File");
			return;
		}
		frappe.dom.freeze("Uploading quotation... Please wait.");


		let form_data = new FormData();
		form_data.append("file", file);
		$.ajax({
			url: "/api/method/vgjewellry.vg_jewellery.page.quotation_import_new.quotation_import_new.upload_excel",
			type: "POST",
			data: form_data,
			processData:false,
			contentType:false,
			headers: {
				"X-Frappe-CSRF-Token": frappe.csrf_token
			},

			success:function(r){
				frappe.dom.unfreeze();

				if (r.message && r.message.success) {
					frappe.msgprint({
						title: "Success",
						indicator: "green",
						message: r.message.message
					});
				} else {
					frappe.msgprint(r.message);
				}

			}
		});

	});


}
