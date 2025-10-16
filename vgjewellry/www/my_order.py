import frappe, requests, base64, os
from datetime import datetime


def get_context(context):
    # get parameter from URL (query string ?param=value)
    param_value = frappe.form_dict.get("data")
    decoded_bytes = base64.b64decode(param_value)
    decoded_str = decoded_bytes.decode()
    parts = decoded_str.split("#")
    if len(parts) !=3:
        context.error = "Please contanct whoever send link"
    order_id, vendor, created_at = parts
    if order_id:
        try:
            order= frappe.get_doc("VG_Customer_Order",{"name":order_id,"assign_vendor":vendor,"creation":created_at})
            branch_id = order.branch_name
            context.branch = frappe.db.get_value("Branch_Master",branch_id,"Branch_Name")
            context.order_no= order_id
            order_date_obj = datetime.strptime(str(order.order_date), "%Y-%m-%d")
            context.order_date = order_date_obj.strftime("%d-%m-%Y")
            if order.vendor_delivery_date:
                delivery_date_obj = datetime.strptime(str(order.vendor_delivery_date), "%Y-%m-%d")
                context.delivery_date = delivery_date_obj.strftime("%d-%m-%Y")
            else:
                context.delivery_date =""
            product_id = order.prod_name
            context.product_name= frappe.db.get_value("Item_Master",product_id,"item_name")
            context.jewellery_type= order.jew_type
            context.approximate_net_weight= order.app_net_wgt
            context.gold_colour = order.gold_colr
            gold_karat_id = order.gold_karat
            context.gold_karat=gold_karat_id
            if gold_karat_id:
                context.gold_karat =frappe.db.get_value("Item_Trad_Mst",gold_karat_id,"metal_type")   
            else:
                context.gold_karat=gold_karat_id
            context.size_length= order.size_leg
            context.broadness = order.broadness
            context.pcs = order.pcs
            context.sample_sent="No" if order.sample_send==0 else "Yes"
            context.sample_weight=order.sam_wgt
            context.voucher_no=order.voucher_no
            context.with_or_without_certi = "No" if order.send_with_certi==0 else "Yes"
            context.description = order.description
            context.dia_details=order.dia_details
            base_url = frappe.utils.get_url()
            image_list = []
            for ir in order.main_image_table:
                image_url = base_url + ir.main_image
                ext = os.path.splitext(image_url)[1][1:] 
                filename = os.path.basename(image_url)
                try:
                    resp = requests.get(image_url)
                    if resp.status_code == 200:
                        data_uri = f"data:image/{ext};base64," + base64.b64encode(resp.content).decode("utf-8")
                    else:
                        data_uri = ""
                except:
                    data_uri = ""

                image_list.append({
                    "data_uri": data_uri,
                    "image_url": image_url,
                    "filename": filename
                })
            context.product_images=image_list
            sample_image_list = []
            for ir in order.sample_image_table:
                image_url = base_url + ir.sample_image
                ext = os.path.splitext(image_url)[1][1:] 
                filename = os.path.basename(image_url)
                try:
                    resp = requests.get(image_url)
                    if resp.status_code == 200:
                        data_uri = f"data:image/{ext};base64," + base64.b64encode(resp.content).decode("utf-8")
                    else:
                        data_uri = ""
                except:
                    data_uri = ""

                sample_image_list.append({
                    "data_uri": data_uri,
                    "image_url": image_url,
                    "filename": filename
                })
            context.sample_images=sample_image_list
        except frappe.DoesNotExistError:
            context.error = f"Order  not found"   
    else:
        context.error = "Please pass ?customer=CUSTOMER_ID in URL"       
    return context

