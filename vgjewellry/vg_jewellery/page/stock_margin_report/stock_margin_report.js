const REPORT_PATH = "vgjewellry.vg_jewellery.report.stock_margin_report.stock_margin_report";

frappe.query_reports["Stock Margin Report"] = {
    filters: [
        { fieldname: "branch_id", label: __("Branch"), fieldtype: "Select", options: [""] },
        { fieldname: "item_mst_id", label: __("Item Name"), fieldtype: "Select", options: [""] },
        { fieldname: "variety_mst_id", label: __("Variety"), fieldtype: "Select", options: [""] },
        { fieldname: "label_no", label: __("Label No"), fieldtype: "Data" },
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
