// Copyright (c) 2025, SamarthIT and contributors
// For license information, please see license.txt
/*frappe.require([
	// jQuery UI (needed for pivotUI drag & drop)
    "https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.css",

    // Core chart libs
    "https://cdnjs.cloudflare.com/ajax/libs/d3/5.16.0/d3.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/c3/0.7.20/c3.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/c3/0.7.20/c3.min.css",

    // PivotTable.js core
   // "https://cdnjs.cloudflare.com/ajax/libs/pivottable/2.23.0/pivot.min.js",
	 "assets/vgjewellry/js/pivot.js",
    "https://cdnjs.cloudflare.com/ajax/libs/pivottable/2.23.0/pivot.min.css",
     "assets/vgjewellry/js/pivot_multi.js", 	

    // Pivot renderers
    "https://cdnjs.cloudflare.com/ajax/libs/pivottable/2.23.0/d3_renderers.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/pivottable/2.23.0/c3_renderers.min.js"
]);*/
frappe.query_reports["Labeling Count"] = {
	"filters": [
		{
            fieldname: "from_date",
            label: __("From Date"),
            fieldtype: "Date",
            "default": frappe.datetime.month_start(),
        },
        {
            fieldname: "to_date",
            label: __("To Date"),
            fieldtype: "Date",
            default: frappe.datetime.nowdate()
        }
	],
	// hook after table render
    /*"after_datatable_render": function(datatable) {
	    return;
	    let result = frappe.query_report.data || [];

    // Convert into array of objects
    let pivotData = result.map(row => row);

    // Clear default table
    $(datatable.wrapper).empty();

        // Add a container
        let container = $('<div id="pivot-container" style="margin:20px;"></div>').appendTo(datatable.wrapper);

        // Render pivot with charts enabled
        $("#pivot-container").pivotUI(pivotData, {
            rows: ["user","item_name"],        // default row
            vals: ["gross_wt","net_wt"],          // default value
            aggregatorName: "Sum",     // default aggregator
            rendererName: "Table",     // default renderer

            renderers: $.extend(
                $.pivotUtilities.renderers,
                $.pivotUtilities.c3_renderers,
                $.pivotUtilities.d3_renderers
            )
        });
	 setTimeout(() => {
            makeCollapsibleTree();
        }, 5500);    
    }*/
};
function makeCollapsibleTree() {
    $("#pivot-container table.pvtTable tbody tr").each(function () {
        let firstCell = $(this).find("td.pvtRowLabel").first();

        if (firstCell.length && $(this).find("td.pvtRowLabel").length > 1) {
            let labelText = firstCell.text();
            firstCell.empty();

            // Wrap in details/summary
            let details = $(`<details open><summary>${labelText}</summary></details>`);
            firstCell.append(details);

            // Add click handler to toggle children
            details.on("toggle", function () {
                let isOpen = this.open;
                let parentRow = $(this).closest("tr");
                let parentIndent = parentRow.find("td.pvtRowLabel").length;

                parentRow.nextAll("tr").each(function () {
                    let indent = $(this).find("td.pvtRowLabel").length;
                    if (indent <= parentIndent) return false; // stop at next same level
                    $(this).toggle(isOpen);
                });
            });
        }
    });
}
