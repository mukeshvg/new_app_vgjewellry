# Copyright (c) 2025, SamarthIT and contributors
# For license information, please see license.txt

# # import frappe
# from frappe.model.document import Document


# class VG_Customer_Order(Document):
# 	pass


import frappe
import tempfile
import cups
from frappe.model.document import Document


class VG_Customer_Order(Document):
    def on_update(self):
        name=self.cust_name
        mobile=str(self.contact_number)
        address=self.address
        date=self.order_date
        net_wt=str(self.app_net_wgt)
        metal=frappe.db.get_value("Item_Trad_Mst", self.gold_karat, "metal_type")
        product_name=frappe.db.get_value("Item_Master", self.prod_name, "item_name")
        sales_person=frappe.db.get_value("Emp_Mst", self.sales_person, "emp_name")
        estimate=str(self.estimate_gst)
        labour_per=str(self.labour_per)
        size_leg=self.size_leg or ""
        order_no=str(self.name)
        branch=frappe.db.get_value("Branch_Master", self.branch_name, "branch_short_name")
        counter=self.counter
        conn = cups.Connection()
        printers = conn.getPrinters()
        #frappe.msgprint(str(printers));
        #return
        printer_ip = self.get_printer_name_list(self.branch_name,counter)
        if printer_ip is None:
            frappe.msgprint("Printer for Branch "+branch+" and Counter "+counter+" is not map")
            return
        #frappe.msgprint("Billing Order updated...."+printer_ip)
        #return
        printer_name = printer_ip
        #printer_uri = "ipp://"+printer_ip+"/printer"
        #frappe.msgprint("Billing Order updated...."+printer_uri)
        #return
        #data= b"Order No:"+order_no+" \n Name:"+name+"\n Mobile:"+mobile+"\n Address:"+address+"\n Date:"+date+"\n Net Wt"+net_wt+"\n Labour(%):"+labour_per +"\n Metal:"+metal+"\n Approximate Amt:"+net_wt+"\n Product Name:"+product_name+"\n Size:"+size_leg+"\n Sales Person:"+sales_person+"\n\n"+ b"\x1D\x56\x41\x03"
        data= "Order No:"+order_no+" \n Name:"+name+"\n Mobile:"+mobile+"\n Address:"+address+"\n Date:"+date+"\n Net Wt"+net_wt+"\n Labour(%):"+labour_per +"\n Metal:"+metal+"\n Approximate Amt:"+net_wt+"\n Product Name:"+product_name+"\n Size:"+size_leg+"\n Sales Person:"+sales_person+"\n\n"+ "\x1D\x56\x41\x03"
        tmp = tempfile.NamedTemporaryFile()
        with open(tmp.name,"w") as f:
            f.write(data)
        job_id = conn.printFile(printer_name, tmp.name, "Order no {order_no} is printing on thermal printer", {"raw":"true"})
        #job_id = conn.printFile(printer_uri, tmp.name, "Order no {order_no} is printing on thermal printer", {"raw":"true"})
        f.close()
        #frappe.msgprint("Billing Order updated...."+counter)

    def get_printer_name_list(self ,branch ,counter):
        try:
            printers = frappe.get_all(
            "Printer List",  # Name of the DocType
            filters={"branch": branch, "counter": counter},  # Filters
            fields=["printer_name"],  # Only fetch printer_ip field
            limit_page_length=1  # Limit results to just one record
            )
            if printers:
                return printers[0]["printer_name"]
            else:
                return None
        except frappe.DoesNotExistError:
            return None
        except Exception as e:
            frappe.log_error(f"Error fetching printer for branch {branch} and counter {counter}: {str(e)}")
            return None
