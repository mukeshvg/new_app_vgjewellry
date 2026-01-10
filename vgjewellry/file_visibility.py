import frappe
import os
import shutil
from frappe.utils.logger import get_logger



PUBLIC_PREFIX = "/files/"
PRIVATE_PREFIX = "/private/files/"


#PRIVATE_PREFIX = "/private/"
#PUBLIC_PREFIX = "/public/"


def make_images_public(doc, method=None):
    """
    Called from `on_change`
    Runs AFTER document (parent + child) is saved to DB
    Safe to update DB and File records here
    """

    logger = frappe.logger("file_visibility")
    logger.setLevel("INFO")
    # Child table fieldname = product_details
    for row in doc.product_details:

        image_url = row.image_1
        
        if not image_url:
            continue

        # Skip if already public
        if image_url.startswith(PUBLIC_PREFIX):
            continue

        logger.info(image_url +" -public prefix- "+PUBLIC_PREFIX+ " "+ str(image_url.startswith(PUBLIC_PREFIX)))
        #continue
        # Fetch File document
        try:
            file_doc = frappe.get_doc("File", {"file_url": image_url})
        except frappe.DoesNotExistError:
            logger.warning(f"File not found for URL: {image_url}")
            continue

        # Already public → nothing to do
        if not file_doc.is_private:
            continue

        # Compute paths
        old_path = file_doc.get_full_path()
        new_path = old_path.replace(PRIVATE_PREFIX, PUBLIC_PREFIX)

        # Ensure target directory exists
        os.makedirs(os.path.dirname(new_path), exist_ok=True)

        # Move file (only once)
        if os.path.exists(old_path) and not os.path.exists(new_path):
            shutil.move(old_path, new_path)
            logger.info(f"Moved file: {old_path} → {new_path}")

        # Update File record safely (NO recursion)
        #public_url = file_doc.file_url.replace(PRIVATE_PREFIX, PUBLIC_PREFIX)
        public_url = file_doc.file_url.replace(PRIVATE_PREFIX, PUBLIC_PREFIX)

        file_doc.db_set("is_private", 0, update_modified=False)
        file_doc.db_set("file_url", public_url, update_modified=False)

        # Update child table field in DB
        frappe.db.set_value(
            row.doctype,
            row.name,
            "image_1",
            public_url,
            update_modified=False
        )

        logger.info(f"Updated image URL for row {row.name}: {public_url}")


def make_images_public2(doc, method=None):
    """
    Convert private child table images to public files safely
    """
    l=frappe.logger("nnn")
    l.setLevel("INFO")
    l.info("Server Script Executed")
    l.info(f"s{doc.product_details}")
    for row in doc.product_details:
        image_url = row.image_1

        if not image_url:
            continue

        # Skip if already public
        if image_url.startswith(PUBLIC_PREFIX):
            continue

        # Get File doc
        try:
            file_doc = frappe.get_doc("File", {"file_url": image_url})
        except frappe.DoesNotExistError:
            continue

        # Skip if already public
        if not file_doc.is_private:
            #_update_child(row, file_doc.file_url)
            continue

        old_path = file_doc.get_full_path()
        new_path = old_path.replace(PRIVATE_PREFIX, PUBLIC_PREFIX)
        l.info("new"+new_path)

        # Ensure directory exists
        os.makedirs(os.path.dirname(new_path), exist_ok=True)

        # Move file only once
        if os.path.exists(old_path) and not os.path.exists(new_path):
            shutil.move(old_path, new_path)

        # Update File doc
        file_doc.is_private = 0
        file_doc.file_url = file_doc.file_url.replace(
            PRIVATE_PREFIX, PUBLIC_PREFIX
        )
        l.info("new"+file_doc.file_url)
        file_doc.save(ignore_permissions=True)

        # Update child table value
        _update_child(row, file_doc.file_url)


def _update_child(row, public_url):
    """
    Ensure child table is updated in DB
    """
    l=frappe.logger("nnn")
    l.setLevel("INFO")
    l.info("--")
    l.info(f"{public_url}")
    if row.image_1 != public_url:
        frappe.db.set_value(
            row.doctype,
            row.name,
            "image_1",
            public_url
        )

