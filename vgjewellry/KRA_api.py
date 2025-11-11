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

        names=""
        for _, row in df.iterrows():
            data = row.to_dict()
            name=get_or_create_kra(data)
            insert_kra(name,data)
        return "kra added successfully"

    except Exception:
        return f"CSV Import Error: {frappe.get_traceback()}"
        frappe.log_error(frappe.get_traceback(), "CSV Import Error")

import frappe
    
def get_or_create_kra(data1):
    # Check if emp_code exists
    emp_code=data1["EMP ID"]
    department=data1["DEPARTMENT"];
    emp_name=data1["NAME"]
    counter=data1["COUNTER"]
    existing = frappe.db.get_value("Employee_KRA_System", {"emp_code": emp_code}, "name")
    if existing:
        frappe.db.sql(""" update tabEmployee_KRA_System set department=%s , emp_name=%s , counter=%s where emp_code=%s
        """,(department,emp_name, counter,emp_code))
        frappe.db.sql(""" update tabEmp_Mst set curent=1 where emp_code=%s
        """,(emp_code))
        return existing 

    doc = frappe.get_doc("Branch_Master", {"Branch_Short_Name": data1["BRANCH"]})
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
def insert_kra(name,data1):
    kra_mon = data1["KRA MON"]
    kra = data1["KRA"]
    #weightage=decimal.Decimal(data1["WEIGHTAGE"].replace("%",""))
    weightage_value = data1.get("WEIGHTAGE", "")
    if isinstance(weightage_value, str) and "%" in weightage_value:
        weightage_value = weightage_value.replace("%", "")
    weightage = decimal.Decimal(str(weightage_value or 0))
    target=decimal.Decimal(data1["TARGET"])
    achieve_target=decimal.Decimal(data1["ACHIEVED TARGET"])
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
