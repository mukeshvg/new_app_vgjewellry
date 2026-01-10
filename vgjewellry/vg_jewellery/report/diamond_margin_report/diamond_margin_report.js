// Copyright (c) 2026, SamarthIT and contributors
// For license information, please see license.txt

frappe.query_reports["Diamond Margin Report"] = {
	"filters": [
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
