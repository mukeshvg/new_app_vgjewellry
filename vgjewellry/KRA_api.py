import frappe
import os
import pandas as pd

@frappe.whitelist()
def process_import(docname):
    doc = frappe.get_doc("Custom KRA Import", docname)

    try:
        # File URL (from attach field)
        file_url = doc.import_file

        # Handle private/public paths correctly
        if file_url.startswith("/private/files/"):
            filepath = frappe.get_site_path("private", "files", os.path.basename(file_url))
        else:
            filepath = frappe.get_site_path("public", "files", os.path.basename(file_url))

        if not os.path.exists(filepath):
            frappe.throw(f"File not found: {filepath}")

        # Now read CSV
        df = pd.read_csv(filepath)

        for _, row in df.iterrows():
            data = row.to_dict()
            name=get_or_create_kra(data)
            insert_kra(name,data)
        return "kra added successfully"

    except Exception:
        frappe.log_error(frappe.get_traceback(), "CSV Import Error")

import frappe
    
def get_or_create_kra(data):
    # Check if emp_code exists
    emp_code=data["EMP ID"]
    department=data["DEPARTMENT"];
    emp_name=data["NAME"]
    counter=data["COUNTER"]
    existing = frappe.db.get_value("Employee_KRA_System", {"emp_code": emp_code}, "name")
    if existing:
        frappe.db.sql(""" update tabEmployee_KRA_System set department=%s , emp_name=%s , counter=%s where emp_code=%s
        """,(department,emp_name, counter,emp_code))
        return existing 

    doc = frappe.get_doc("Branch_Master", {"Branch_Short_Name": data["BRANCH"]})
    branch = doc.name
    # Else insert new record
    frappe.db.sql("""
        INSERT INTO `tabEmployee_KRA_System` (emp_code, branch, department, emp_name, counter)
        VALUES (%s, %s, %s, %s, %s)
    """, (emp_code, branch, department, emp_name, counter))

    # Commit to DB
    frappe.db.commit()

    # Fetch newly created record's name
    new_name = frappe.db.get_value("Employee_KRA_System", {"emp_code": emp_code}, "name")
    return new_name


import decimal
def insert_kra(name,data):
    kra_mon = data["KRA MON"]
    kra = data["KRA"]
    weightage=decimal.Decimal(data["WEIGHTAGE"].replace("%",""))
    target=decimal.Decimal(data["TARGET"])
    achieve_target=decimal.Decimal(data["ACHIEVED TARGET"])
    try:
        frappe.db.sql(""" 
        INSERT INTO `tabEmp_KRA_CT` (`kra_mon`, `kra`, `weightage`, `target`, `achieve_target`, `parent`, `parentfield`, `parenttype`) 
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s)
        """,(kra_mon,kra,weightage,target,achieve_target,name,'kra_list','Employee_KRA_System'))
        frappe.db.commit()
    except DatabaseError as e:
        frappe.log_error(frappe.get_traceback(), "SQL Insert Error")
        frappe.throw(f"SQL Insert Failed: {str(e)}")

    except Exception as e:
        frappe.log_error(frappe.get_traceback(), "General Error")
        frappe.throw(f"An error occurred: {str(e)}")    
