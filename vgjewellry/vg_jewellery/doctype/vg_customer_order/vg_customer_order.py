import frappe
import tempfile
import cups
from frappe.model.document import Document
import datetime
import base64
from vgjewellry.VG_api import send_whatsapp_from_fb
from vgjewellry.VG_api import send_textwhatsapp_using_hisocial
import string, random
from frappe.model.document import Document
def random_alphanumeric(length=12):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
@frappe.whitelist()
def print_thermal(docname):
    doc = frappe.get_doc("VG_Customer_Order", docname)
    doc.print_thermal()
    #doc.send_whatsapp_on_new_order()
@frappe.whitelist(allow_guest=True)
def send_whatsapp_to_vendor(docname):
    doc = frappe.get_doc("VG_Customer_Order", docname)
    send_whatsapp_to_vendor=doc.send_whatsapp_to_vendor
    send_whatsapp_to_customer=doc.send_whatsapp_to_customer
    cust_name = doc.cust_name
    mobile_link=str(doc.contact_number)
    mobile = frappe.db.get_value("VG_Customer_Details",mobile_link, "mobile_no")
    assign_vendor = doc.assign_vendor
    order_date= doc.order_date
    creation= doc.creation
    delivery_date= doc.delivery_date
    vendor_delivery_date= doc.vendor_delivery_date
    metal=frappe.db.get_value("Item_Trad_Mst", doc.gold_karat, "metal_type")
    product_name=frappe.db.get_value("Item_Master", doc.prod_name, "item_name")
    gold_colour=doc.gold_colr
    approximate_net_weight=doc.app_net_wgt
    jewellery_type=doc.jew_type
    branch=doc.branch_name
    branch_text= frappe.db.get_value("Branch_Master",branch,"branch_short_name");
    gold_carat=doc.gold_karat
    customer_name = cust_name.title()
    jew_type = jewellery_type.title()
    raw_string= f"{docname}#{assign_vendor}#{creation}"
    encoded = base64.b64encode(raw_string.encode()).decode()
    base_url = frappe.utils.get_url()
    link= f"{base_url}/my_order?data={encoded}"


    vendor_name=frappe.db.get_value("Supplier_Master",assign_vendor,"supplier_name");
    assign_vendor_mobile1=frappe.db.get_value("Supplier_Master",assign_vendor,"order1");
    assign_vendor_mobile2=frappe.db.get_value("Supplier_Master",assign_vendor,"order2");
    assign_vendor_mobile3=frappe.db.get_value("Supplier_Master",assign_vendor,"order3");

    if isinstance(vendor_delivery_date, datetime.date):
        vendor_delivery_date_str = vendor_delivery_date.strftime("%d-%m-%Y")
    else:
        vendor_delivery_date = datetime.datetime.strptime(vendor_delivery_date, "%Y-%m-%d")
        vendor_delivery_date_str = vendor_delivery_date.strftime("%d-%m-%Y")
    if send_whatsapp_to_customer:
        if isinstance(delivery_date, datetime.date):
            delivery_date_str = delivery_date.strftime("%d-%m-%Y")
        else:
            delivery_date = datetime.datetime.strptime(delivery_date, "%Y-%m-%d")
            delivery_date_str = delivery_date.strftime("%d-%m-%Y")
        send_whatsapp_from_fb("customer_order_update",to=cta,body_variable=[customer_name,order_id,product_name,gold_colour,approximate_net_weight,delivery_date_str])
    account="repairing"
    if jewellery_type=="Gold":
        admin_no = "9512123883";
        account="gold_valsad_vapi"
        if branch_text == "SURAT":
            admin_no="9512127779"
            account="gold_surat"
    else:
        admin_no = "6352976423"
        account = "diamond"
    vendor_msg = f"""*Order update:*
    Dear *Mr./Ms. {vendor_name},*
    Please see the details of the recently updated booking order on your application.
    Order Number : {docname}
    Branch: {branch_text}
    Delivery Date: *{vendor_delivery_date_str}*
    Please see the order for fast process.
    *Regards,*
    *Shah Virchand Govanji Pvt. Ltd.*
    For Detail Info Please Visit Following Link
    {link}
    For any query kindly contact on {admin_no}"""
    if True or send_whatsapp_to_vendor:
        if assign_vendor_mobile1 is not None:
            send_textwhatsapp_using_hisocial(account,"91"+assign_vendor_mobile1,vendor_msg);
        if assign_vendor_mobile2 is not None:
            send_textwhatsapp_using_hisocial(account,"91"+assign_vendor_mobile2,vendor_msg);
        if assign_vendor_mobile3 is not None:
            send_textwhatsapp_using_hisocial(account,"91"+assign_vendor_mobile3,vendor_msg);



class VG_Customer_Order(Document):
    def autoname(self):
        while True:
            name = random_alphanumeric(8)  #  uppercase + digits
            if not frappe.db.exists(self.doctype, name):
                self.name = name
                break
    def validate(self):
        session_user = frappe.session.user
        roles = frappe.get_roles(session_user)

        #if self.order_status == "Labeling" and "HO" in roles:
        #    frappe.throw("HO users cannot save orders with status 'Labeling'.")
        if "Billing" in roles:
            if self.order_status != "Resume" or self.order_status !="Hold":
                self.order_status = "Pending"
        elif "HO" in roles:
            if self.order_status == "Resume":
                if not self.vendor_delivery_date or not self.assign_vendor:
                    frappe.throw("Assigned Vendor or Vendor Delivery Date is not set")
                self.order_status = "Pending"
        elif "Labeling" in roles:
            if self.order_status == "Labeling":
                if not self.label_number:
                    frappe.throw("Label Number is not set")
                self.order_status = "At Counter"   
                
    def send_whatsapp_on_new_order(self):
        cust_name=self.cust_name
        mobile_link=str(self.contact_number)
        mobile = frappe.db.get_value("VG_Customer_Details",mobile_link, "mobile_no")
        assign_vendor = self.assign_vendor
        order_date= self.order_date
        delivery_date= self.delivery_date
        gold_colour=self.gold_colr
        approximate_net_weight=self.app_net_wgt
        jewellery_type=self.jew_type
        branch=self.branch_name
        branch_text= frappe.db.get_value("Branch_Master",branch,"branch_short_name");
        metal=frappe.db.get_value("Item_Trad_Mst", self.gold_karat, "metal_type")
        product_name=frappe.db.get_value("Item_Master", self.prod_name, "item_name")
        customer_name = cust_name.title()  
        jew_type = jewellery_type.title()
        #frappe.msgprint(jew_type)
        if isinstance(delivery_date, datetime.date):
            delivery_date_str = delivery_date.strftime("%d-%m-%Y")
        else:
            delivery_date = datetime.datetime.strptime(delivery_date, "%Y-%m-%d")
            delivery_date_str = delivery_date.strftime("%d-%m-%Y")
        customer_template_id = 'gold_order_valsad_vapi_new'
        customer_care = "02632229999"
        if jew_type.lower() == "gold":
            admin_no = "9512123883"
            if branch_text== "SURAT":
                admin_no = "9512127779"
                customer_care = "9512100886"
                customer_template_id = 'gold_order_surat_new'
        else:
            admin_no = "6352976423"
            customer_care = "02632229999"   
       
        country =  frappe.db.get_value("VG_Customer_Details",mobile_link, "country_reside")
        country_code=frappe.db.get_value("Country",country, "custom_dial_code")
        alter_country =  frappe.db.get_value("VG_Customer_Details",mobile_link, "alternate_no_country")
        alternate_country_code=frappe.db.get_value("Country",alter_country, "custom_dial_code")
        customer_to_array = [country_code + str(mobile)] if mobile else []

        if self.alt_number and self.alt_number and self.alt_number is not None and alternate_country_code is not None:
            customer_to_array.append(alternate_country_code + str(self.alt_number))
        for cta in customer_to_array:
            #frappe.msgprint(cta)
            order_id=self.name
            send_whatsapp_from_fb(template_name=customer_template_id,to=cta,body_variable=[customer_name,order_id,jewellery_type.title(),metal,product_name,gold_colour,delivery_date_str,customer_care])     

    @frappe.whitelist()    
    def print_thermal(self):
        name=self.cust_name
        mobile=str(self.contact_number)
        address=self.address
        date=str(self.order_date)
        net_wt=str(self.app_net_wgt)
        metal=frappe.db.get_value("Item_Trad_Mst", self.gold_karat, "metal_type")
        product_name=frappe.db.get_value("Item_Master", self.prod_name, "item_name")
        sales_person=frappe.db.get_value("Emp_Mst", self.sales_person, "emp_name")
        estimate=str(self.estimate_incl_gst) or ""
        labour_per=str(self.labour_pergram) or ""
        #size_leg=self.size_leg or ""
        size_leg= frappe.db.get_value("Size Master".self.size_leg,"size")
        order_no=str(self.name) or ""
        branch=frappe.db.get_value("Branch_Master", self.branch_name, "branch_short_name")
        counter=self.counter
        conn = cups.Connection()
        printers = conn.getPrinters()
        #return
        printer_ip = self.get_printer_name_list(self.branch_name,counter)
        #frappe.msgprint(str(printer_ip));
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
        data= "Order No:"+order_no+" \n Name:"+name+"\n Mobile:"+mobile+"\n Address:"+address+"\n Date:"+date+"\n Net Wt"+net_wt+"\n Labour(%):"+labour_per +"\n Metal:"+metal+"\n Approximate Amt:"+estimate+"\n Product Name:"+product_name+"\n Size:"+size_leg+"\n Sales Person:"+sales_person+"\n\n"+ "\x1D\x56\x41\x03"
        tmp = tempfile.NamedTemporaryFile()
        with open(tmp.name,"w") as f:
            f.write(data)
        job_id = conn.printFile(printer_name, tmp.name, "Order no {order_no} is printing on thermal printer", {"raw":"true"})
        f.close()
        #frappe.msgprint("Billing Order updated...."+counter)

    def get_printer_name_list(self ,branch ,counter):
        try:
            counter_doc = frappe.get_doc("Branch Counter", counter)
            counter_name = counter_doc.counter
            printers = frappe.get_all(
                    "Printer List",  # Name of the DocType
                    filters={"branch": branch, "counter": counter_name},  # Filters
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
