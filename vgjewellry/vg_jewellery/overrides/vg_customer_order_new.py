import frappe
def get_permission_query_conditions(user):
    if not user or user == "Administrator":
        return ""

    roles = frappe.get_roles(user)
    user_doc = frappe.get_doc("User", user)
    #frappe.msgprint(str(roles))

    conditions = []

    if "Order" in roles:
        # Defensive: only add if the attribute exists and has value
        if hasattr(user_doc, "branch") and user_doc.branch:
            conditions.append(f"`tabVG_Customer_Order`.`branch_name` = '{user_doc.branch}'")
        if hasattr(user_doc, "jewellery_type") and user_doc.jewellery_type:
            conditions.append(f"`tabVG_Customer_Order`.`jew_type` = '{user_doc.jewellery_type}'")
        if hasattr(user_doc, "counter") and user_doc.counter:
            conditions.append(f"`tabVG_Customer_Order`.`counter` = '{user_doc.counter}'")
            
    elif "Billing" in roles:
        if hasattr(user_doc, "branch") and user_doc.branch:
            conditions.append(f"`tabVG_Customer_Order`.`branch_name` = '{user_doc.branch}'")
    elif "HO" in roles or "Labeling" in roles:
        if hasattr(user_doc, "jewellery_type") and user_doc.jewellery_type:
            conditions.append(f"`tabVG_Customer_Order`.`jew_type` = '{user_doc.jewellery_type}'")
        if hasattr(user_doc, "jewellery_type") and user_doc.jewellery_type and user_doc.jewellery_type=="Gold":
            if user_doc.branch == "B-000004": #Surat Branch
                conditions.append(f"`tabVG_Customer_Order`.`branch_name` = '{user_doc.branch}'")
            else:
                conditions.append(f"`tabVG_Customer_Order`.`branch_name` != 'B-000004'")
                

    #frappe.msgprint(str(conditions))        

    # Combine all conditions
    return " AND ".join(conditions) if conditions else ""
