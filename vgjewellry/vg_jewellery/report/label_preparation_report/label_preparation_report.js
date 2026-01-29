// Copyright (c) 2026, vg and contributors
// For license information, please see license.txt

frappe.query_reports["Label Preparation Report"] = {
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

	]
};
