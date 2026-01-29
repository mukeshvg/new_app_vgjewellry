import frappe


def execute(filters=None):
    columns = get_columns()
    data = get_data(filters)
    return columns, data

def get_columns():
    return [
        {
            "label": "Received Date",
            "fieldname": "receive_date",
            "fieldtype": "Date",
            "width": 120
        },
        {
            "label": "Total Received PCS",
            "fieldname": "receive_pcs   ",
            "fieldtype": "Int",
            "width": 160
        }
    ]

def get_data(filters):
    return frappe.db.sql("""
        SELECT
            receive_date,
            SUM(receive_pcs) AS total_received_pcs
        FROM
            `tabReceived From NCH And Inhouse`
        GROUP BY
            receive_date
        ORDER BY
            receive_date
    """, as_dict=True)    
