import frappe, requests

@frappe.whitelist(allow_guest=True)
def proxy_search(query=None):
    r = requests.get("http://192.168.1.63:8000/initial")
    return r.json()

