frappe.pages['image-search'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Image Search',
		single_column: true
	});
}