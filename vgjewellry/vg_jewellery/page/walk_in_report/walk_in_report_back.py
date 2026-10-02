import frappe
import pyodbc
import os
import pymysql
from datetime import date
from decimal import Decimal
from frappe.utils.logger import get_logger
import re
from datetime import datetime, timedelta
import requests
from frappe.utils import today


value = os.getenv('mysqlodbc')
def connect():
    conn = pyodbc.connect(value,autocommit=True)
    conn.set_attr(pyodbc.SQL_ATTR_TXN_ISOLATION,pyodbc.SQL_TXN_READ_UNCOMMITTED)
    return conn

@frappe.whitelist()
def walk_in_report(from_date=None, to_date=None, branch=None):
    con = connect()
    cursor=con.cursor()

    conditions = []
    values = {}
    values = []

    # ---------------------------------------------------------
    # DATE FILTER
    # ---------------------------------------------------------

    if from_date:
        conditions.append("entry_date >= ?")
        values.append(from_date)

    if to_date:
        conditions.append("entry_date <= ?")
        values.append(to_date)

    # ---------------------------------------------------------
    # BRANCH FILTER
    # ---------------------------------------------------------

    if branch:
        conditions.append("branch = %(branch)s")
        values.append(branch)

    # ---------------------------------------------------------
    # WHERE
    # ---------------------------------------------------------

    where_clause = ""

    if conditions:
        where_clause = "WHERE " + " AND ".join(conditions)

    # ---------------------------------------------------------
    # GET WALK-IN DATA
    # ---------------------------------------------------------

    qry =f"""
        SELECT
            id,
            branch,
            counter,
            entry_date,
            entry_time,
            type,
            walkout_reason,
            walkout_remark,
            created_at
        FROM walkouts
        {where_clause}
        ORDER BY
            entry_date DESC,
            entry_time DESC,
            id DESC
        """
    if values:
        cursor.execute(qry, values)
    else:
        cursor.execute(qry)
    #cursor.execute(qry,(values))
    rows = cursor.fetchall()
    columns = [desc[0] for desc in cursor.description]

    data = [
        dict(zip(columns, row))
        for row in rows
    ]

    # ---------------------------------------------------------
    # SUMMARY
    # ---------------------------------------------------------

    total_walkin = len(data)

    conversion = 0
    walkout = 0

    for row in data:

        if row.get('type') == "conversion":
            conversion += 1

        elif row.get('type') == "walkout":
            walkout += 1

    # ---------------------------------------------------------
    # CONVERSION %
    # ---------------------------------------------------------

    conversion_percentage = 0

    if total_walkin > 0:

        conversion_percentage = round(
            (conversion / total_walkin) * 100,
            2
        )

    # ---------------------------------------------------------
    # RETURN
    # ---------------------------------------------------------

    return {
        "data": data,

        "summary": {
            "total_walkin": total_walkin,
            "conversion": conversion,
            "walkout": walkout,
            "conversion_percentage": conversion_percentage
        }
    }

