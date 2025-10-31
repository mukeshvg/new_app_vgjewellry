import frappe, requests

@frappe.whitelist(allow_guest=True)
def proxy_search(query=None):
    r = requests.get("http://192.168.1.63:8000/initial")
    return r.json()

import frappe
import requests

@frappe.whitelist(allow_guest=True)
def search(query, branch=None, item=None):
    """
    Sends POST request to external server and returns the response.
    """
    url = "http://192.168.1.63:8000/search"

    # Prepare data
    data = {"query": query}
    if branch:
        data["branch"] = branch
    if item:
        data["item"] = item

    try:
        # Send POST request to external server
        response = requests.post(url, data=data, timeout=10)
        response.raise_for_status()  # Raise error for bad status

        # Parse JSON response
        results = response.json()
        return results

    except requests.exceptions.RequestException as e:
        # Handle errors
        frappe.throw(f"Error while searching: {e}")


import frappe
import requests
from werkzeug.utils import secure_filename

@frappe.whitelist(allow_guest=True)
def image_search(branch=None, item=None):
    """
    Receives an image via FormData and forwards it to external server.
    """
    uploaded_file = frappe.local.request.files.get("image")
    if not uploaded_file:
        frappe.throw("No image uploaded")

    # Prepare file for requests
    files = {
        "image": (
            secure_filename(uploaded_file.filename),
            uploaded_file.stream,
            uploaded_file.content_type
        )
    }

    # Optional data
    data = {}
    if branch:
        data["branch"] = branch
    if item:
        data["item"] = item

    try:
        url = "http://192.168.1.63:8000/search"  # External search server
        response = requests.post(url, files=files, data=data, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        frappe.throw(f"Error sending image search request: {e}")

