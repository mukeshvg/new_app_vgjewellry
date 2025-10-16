import frappe

def has_permission(doc=None, ptype=None, user=None):
    # Default to current user if not specified
    user = user or frappe.session.user
    roles = frappe.get_roles(user)
    #frappe.msgprint("Billing Order updated"+str(roles))

    # Restrict "Create" permission for certain roles
    if ptype == "create":
        if "Billing" in roles:
            return False  # Deny create access

    # Allow all other operations
    return True

