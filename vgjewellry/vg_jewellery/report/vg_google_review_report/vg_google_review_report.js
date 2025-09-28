// Copyright (c) 2025, SamarthIT and contributors
// For license information, please see license.txt

// frappe.query_reports["VG_Google_Review_Report"] = {
// 	"filters": [

// 	]
// };
frappe.query_reports["VG_Google_Review_Report"] = {
	"filters": [
		{
			"fieldname": "from_date",
			"label": "From Date",
			"fieldtype": "Date",
			"reqd": 1,
			"default": frappe.datetime.add_days(frappe.datetime.nowdate(), -7)
		},
		{
			"fieldname": "to_date",
			"label": "To Date",
			"fieldtype": "Date",
			"reqd": 1,
			"default": frappe.datetime.nowdate()
		}
	]
};
