// Copyright (c) 2025, SamarthIT and contributors
// For license information, please see license.txt

frappe.query_reports["IssueReceipt"] = {
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
};
