import frappe, requests, base64, os
from datetime import datetime


def get_context(context):
    # get parameter from URL (query string ?param=value)
    param_value = frappe.form_dict.get("data")
    decoded_bytes = base64.b64decode(param_value)
    decoded_str = decoded_bytes.decode()
    parts = decoded_str.split("#")
    context.p=parts[0]
    if len(parts) !=3:
        context.error = "Please contanct whoever send link"
    order_id, supplier_id, created_at = parts
    if order_id:
        try:
            order= frappe.get_doc("Vg Purchase Order",{"name":order_id,"supplier":supplier_id,"creation":created_at})
            branch_id = order.branch
            context.branch = frappe.db.get_value("Ornate_Branch_Master",branch_id,"branch_name")
            context.po_no= order_id
            order_date_obj = datetime.strptime(str(order.delivery_date), "%Y-%m-%d")
            context.order_date = order_date_obj.strftime("%d-%m-%Y")
            if order.delivery_date:
                delivery_date_obj = datetime.strptime(str(order.delivery_date), "%Y-%m-%d")
                context.delivery_date = delivery_date_obj.strftime("%d-%m-%Y")
            else:
                context.delivery_date =""
            supplier_name = None
            if supplier_id:
                supplier_name = frappe.db.get_value("Ornate_Supplier_Master",supplier_id,"supplier_name")
            context.supplier_name = supplier_name
            base_url = frappe.utils.get_url()
            item_list = []
            purchase_doc = frappe.get_doc("Vg Purchase Order", order_id)
            for idx, item in enumerate(purchase_doc.item_details, start=1):
                metal_id = item.metal
                metal_name = None
                if metal_id:
                    metal_name = frappe.db.get_value("Ornate_Item_Trade_Master", metal_id, "trade_short_name")

                item_id=item.item
                item_name = None
                if item_id:
                    item_name = frappe.db.get_value("Ornate_Item_Master", item_id, "item_name")

                wt_id= item.weight_range
                wt_name = None
                if wt_id:
                    wt_name = frappe.db.get_value("weight_range",wt_id,"weight_range")

                size_id = item.size

                if size_id and frappe.db.exists("Ornate_Size_Master", size_id):
                    size_name = frappe.db.get_value("Ornate_Size_Master", size_id, "size")
                else:
                    size_name = ""

                image_1 = None
                image_2 = None
                image_3 = None
                image_4 = None
                filename1 = None
                filename2 = None
                filename3 = None
                filename4 = None
                data_uri1= None
                data_uri2= None
                data_uri3= None
                data_uri4= None
                if item.image_1 != None:
                    image_1 = base_url + item.image_1
                    ext = os.path.splitext(image_1)[1][1:]
                    filename1 = os.path.basename(image_1)
                    try:
                        resp = requests.get(image_1)
                        if resp.status_code == 200:
                            data_uri1 = f"data:image/{ext};base64," + base64.b64encode(resp.content).decode("utf-8")
                        else:
                            data_uri1 = ""
                    except:
                        data_uri1 = ""

                if item.image_2 != None:
                    image_2 = base_url + item.image_2
                    ext = os.path.splitext(image_2)[1][1:]
                    filename2 = os.path.basename(image_2)
                    try:
                        resp = requests.get(image_2)
                        if resp.status_code == 200:
                            data_uri2 = f"data:image/{ext};base64," + base64.b64encode(resp.content).decode("utf-8")
                        else:
                            data_uri2 = ""
                    except:
                        data_uri2 = ""
                if item.image_3 != None:
                    image_3 = base_url + item.image_3
                    ext = os.path.splitext(image_3)[1][1:]
                    filename3 = os.path.basename(image_3)
                    try:
                        resp = requests.get(image_2)
                        if resp.status_code == 200:
                            data_uri3 = f"data:image/{ext};base64," + base64.b64encode(resp.content).decode("utf-8")
                        else:
                            data_uri3 = ""
                    except:
                        data_uri3 = ""
                
                if item.image_4 != None:
                    image_4 = base_url + item.image_4
                    ext = os.path.splitext(image_4)[1][1:]
                    filename4 = os.path.basename(image_4)
                    try:
                        resp = requests.get(image_4)
                        if resp.status_code == 200:
                            data_uri4 = f"data:image/{ext};base64," + base64.b64encode(resp.content).decode("utf-8")
                        else:
                            data_uri4 = ""
                    except:
                        data_uri4 = ""
                item_list.append({
                    "sr":idx,
                    "data_uri1": data_uri1,
                    "image_1": image_1,
                    "filename1": filename1,
                    "data_uri2": data_uri2,
                    "image_2": image_2,
                    "filename2": filename2,
                    "data_uri3": data_uri3,
                    "image_3": image_3,
                    "filename3": filename3,
                    "data_uri4": data_uri4,
                    "image_4": image_4,
                    "filename4": filename4,
                    "item": item_name,
                    "metal":metal_name,
                    "metal_color":item.metal_color,
                    "wt_range":wt_name,
                    "diamond_carat_range":item.diamond_carat_range,
                    "size":size_name,
                    "qty":item.qty,
                    "pcs":item.pcs,
                    "total_weight":item.total_weight
                })
            context.items = item_list

        except frappe.DoesNotExistError:
            context.error = f"Po not found"
    else:
        context.error = "Please pass ?customer=CUSTOMER_ID in URL"
    return context



