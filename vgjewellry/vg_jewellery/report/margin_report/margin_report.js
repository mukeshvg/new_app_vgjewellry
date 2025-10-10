// Copyright (c) 2025, mitesh and contributors
// For license information, please see license.txt

frappe.query_reports["Margin Report"] = {
    onload: function(report) {
        // Inject WebDataRocks CSS
        if (!document.getElementById("wdr-css")) {
            const css = document.createElement("link");
            css.id = "wdr-css";
            css.rel = "stylesheet";
            css.href = "https://cdn.webdatarocks.com/latest/webdatarocks.min.css";
            document.head.appendChild(css);
        }

        // Inject WebDataRocks Toolbar JS
        if (!document.getElementById("wdr-toolbar")) {
            const script1 = document.createElement("script");
            script1.id = "wdr-toolbar";
            script1.src = "https://cdn.webdatarocks.com/latest/webdatarocks.toolbar.min.js";
            script1.onload = function () {
                console.log("WebDataRocks toolbar loaded");
            };
            document.body.appendChild(script1);
        }

        // Inject WebDataRocks Main JS
        if (!document.getElementById("wdr-js")) {
            const script2 = document.createElement("script");
            script2.id = "wdr-js";
            script2.src = "https://cdn.webdatarocks.com/latest/webdatarocks.js";
            script2.onload = function () {
                console.log("WebDataRocks loaded");
                frappe.query_reports["Margin Report"].render_wdr(report);
            };
            document.body.appendChild(script2);
        } else {
            // Already loaded
            frappe.query_reports["Margin Report"].render_wdr(report);
        }
    },

    // Separate function to render WDR after load
    render_wdr: function(report) {
        // Create container
        if (!document.getElementById("wdr-container")) {
            const div = document.createElement("div");
            div.id = "wdr-container";
            div.style = "height:500px;";
            report.page.wrapper.append(div);
        }

        // Fetch data
        frappe.query_reports["Margin Report"].get_data(report);
    },

get_data: function(report, retries = 10) {
    if (!window.webdatarocks) {
        if (retries > 0) {
            console.log("Waiting for WebDataRocks to be ready...");
            setTimeout(() => {
                frappe.query_reports["Margin Report"].get_data(report, retries - 1);
            }, 300);
        } else {
            console.warn("WebDataRocks not ready after multiple attempts.");
        }
        return;
    }

    frappe.call({
        method: "frappe.desk.query_report.run",
        args: {
            report_name: "Margin Report",
            filters: report.get_values()
        },
        callback: function(r) {
            if (r.message) {
                const cols = r.message.columns.map(col => col.label);
                const data = r.message.result.map(row => {
                console.log(data)
                    const obj = {};
                    r.message.columns.forEach((col, i) => {
                        obj[col.label] = row[i];
                    });
                    return obj;
                });

                new WebDataRocks({
                    container: "#wdr-container",
                    toolbar: true,
                    report: {
                        dataSource: {
                            data: data
                        }
                    }
                });
            }
        }
    });
},


    filters: [
        {
            fieldname: "from_date",
            label: __("From Date"),
            fieldtype: "Date",
	    default: frappe.datetime.add_days(frappe.datetime.get_today(), -5),	
           // default: frappe.datetime.add_months(frappe.datetime.nowdate(), -1)
        },
        {
            fieldname: "to_date",
            label: __("To Date"),
            fieldtype: "Date",
            default: frappe.datetime.nowdate()
        }
    ]
};


/*frappe.query_reports["Margin Report"] = {
	"filters": [
		{
			"fieldname": "from_date",
			"label": __("From Date"),
			"fieldtype": "Date",
			"default": frappe.datetime.add_days(frappe.datetime.get_today(), -30),
			"reqd": 1
		},
		{
			"fieldname": "to_date",
			"label": __("To Date"),
			"fieldtype": "Date",
			"default": frappe.datetime.get_today(),
			"reqd": 1
		}
	],
	onload: function(report) {
		// Remove auto refresh on filter change
		report.page.remove_inner_button('Refresh');

		// Add custom button
		report.page.add_inner_button(__('Apply Filters'), function () {
			report.refresh();
		});
		// Clear default table
		//report.page.clear();
		report.page.main.empty();

		// Add pivot container to the page
		report.page.main.append('<div id="wdr-pivot" style="height:600px;"></div>');
		//report.page.append('<div id="wdr-pivot" style="height:600px;"></div>');
		
	},
	refresh: function(report) {
		const filters = report.get_values();

		frappe.call({
			method: "frappe.desk.query_report.run",
			args: {
				report_name: "Margin Report",
				filters: filters
			},
			callback: function(r) {
				if (r.message) {
					// r.message contains { columns: [...], result: [...] }
					// Convert result array into array of dicts for WebDataRocks

					const columns = r.message.columns;
					const results = r.message.result;

					// Map results array to array of objects with keys from columns
					const data = results.map(row => {
						let obj = {};
						for(let i = 0; i < columns.length; i++) {
							obj[columns[i].fieldname] = row[i];
						}
						return obj;
					});
					console.log(data);

					load_pivot_table(data, "wdr-pivot", {
						rows: [{ uniqueName: "branch" }],
						columns: [{ uniqueName: "voucher_date" }],
						measures: [
							{ uniqueName: "margin", aggregation: "sum" },
							{ uniqueName: "sales_amount", aggregation: "sum" }
						]
					});
				} else {
					frappe.msgprint(__('No data found.'));
				}
			}
		});
	}

};*/
