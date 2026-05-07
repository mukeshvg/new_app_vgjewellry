import frappe
from frappe import _
import requests

@frappe.whitelist(allow_guest=True)
def daily_call_report(from_date=None, to_date=None , user=None):

    #url = "http://localhost/jewel_new/server/notes_mst_lapsed_customer.php"
    url = "https://vgjewel.in/crm/server/api/follow_up/notes_mst_lapsed_customer.php"

    payload = {
        "from_date": from_date,
        "to_date": to_date,
        "user": "user"
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": "token api_key:api_secret"
    }

    try:
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=30
        )

        response.raise_for_status()

        result = response.json()

        return {
            "status": "success",
            "message": _("API called successfully"),
            "data": result
        }

    except requests.exceptions.RequestException as e:

        frappe.log_error(
            title="POST API Error",
            message=str(e)
        )

        return {
            "status": "error",
            "message": _("API request failed"),
            "error": str(e)
        }



@frappe.whitelist(allow_guest=True)
def employee_call_report(emp_id, udate=None):

    #url = "http://localhost/jewel_new/server/get_employeewise_lapsed_customer_notes.php"
    url = "https://vgjewel.in/crm/server/api/follow_up/get_employeewise_lapsed_customer_notes.php"

    payload = {
        "emp_id": emp_id,
        "date": udate
    }

    headers = {
        "Content-Type": "application/json",
        "Authorization": "token api_key:api_secret"
    }

    try:
        response = requests.post(
            url,
            json=payload,
            headers=headers,
            timeout=30
        )

        response.raise_for_status()

        result = response.json()

        return {
            "status": "success",
            "message": _("API called successfully"),
            "data": result
        }

    except requests.exceptions.RequestException as e:

        frappe.log_error(
            title="POST API Error",
            message=str(e)
        )

        return {
            "status": "error",
            "message": _("API request failed"),
            "error": str(e)
        }

