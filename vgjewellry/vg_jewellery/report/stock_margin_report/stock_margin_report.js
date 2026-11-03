const REPORT_PATH = "vgjewellry.vg_jewellery.report.stock_margin_report.stock_margin_report";

frappe.query_reports["Stock Margin Report"] = {
    filters: [
        { fieldname: "label_no", label: __("Label No"), fieldtype: "Data" },
        { fieldname: "branch_id", label: __("Branch"), fieldtype: "Select", options: [""] },
        { fieldname: "item_mst_id", label: __("Item Name"), fieldtype: "Select", options: [""] },
        { fieldname: "item_trad_mst_id", label: __("Metal"), fieldtype: "Select", options: [""] },
        { fieldname: "variety_mst_id", label: __("Variety"), fieldtype: "Select", options: [""] },
        { fieldname: "supplier_code", label: __("Supplier"), fieldtype: "Select", options: [""] },
        { fieldname: "style_id", label: __("Style Id"), fieldtype: "Select", options: [""] },
    ],

    onload: function (report) {
        frappe.call({
            method: `${REPORT_PATH}.get_filter_options`,
            callback: function (r) {
                const options = r.message || {};
                Object.keys(options).forEach((fieldname) => {
                    const filter = report.get_filter(fieldname);
                    if (!filter) return;
                    filter.df.options = [""].concat(options[fieldname]).join("\n");
                    filter.refresh();
                });
            },
        });
    },
};
