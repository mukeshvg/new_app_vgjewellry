import frappe
import pyodbc
import os


value = os.getenv("mysqlodbc")


def connect():
    conn = pyodbc.connect(value, autocommit=True)
    conn.set_attr(
        pyodbc.SQL_ATTR_TXN_ISOLATION,
        pyodbc.SQL_TXN_READ_UNCOMMITTED
    )
    return conn


@frappe.whitelist()
def walk_in_report(from_date=None, to_date=None, branch=None):

    # ---------------------------------------------------------
    # USER / ROLE
    # ---------------------------------------------------------

    current_user = frappe.session.user
    roles = frappe.get_roles(current_user)

    is_manager = "Manager" in roles
    is_hr = "HR" in roles
    is_administrator = "Administrator" in roles



    # ---------------------------------------------------------
    # GET USER BRANCH
    # ---------------------------------------------------------

    user_branch = None

    if is_administrator:
        pass
    elif is_hr:
        pass
    elif is_manager:

        user_branch = frappe.db.get_value(
            "User",
            current_user,
            "ornate_branch"
        )

        if not user_branch:
            frappe.throw(
                "Branch is not assigned to your user account."
            )
    # ---------------------------------------------------------
    # DATABASE CONNECTION
    # ---------------------------------------------------------

    con = connect()
    cursor = con.cursor()

    conditions = []
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

    if branch:
        conditions.append("branch = ?")
        values.append(branch)
    # ---------------------------------------------------------
    # BRANCH ACCESS
    # ---------------------------------------------------------
    
    branch_mapping = {
        "6": "15",
        "7": "16",
        "8": "17"
    }

    user_branch = branch_mapping.get(
        str(user_branch),
        str(user_branch)
    )

    if is_administrator:
        pass
    elif is_hr:
        pass
    elif is_manager:

        # Manager can only see their own branch
        conditions.append("branch = ?")
        values.append(user_branch)



    # ---------------------------------------------------------
    # WHERE CLAUSE
    # ---------------------------------------------------------

    where_clause = ""

    if conditions:

        where_clause = "WHERE " + " AND ".join(conditions)

    # ---------------------------------------------------------
    # QUERY
    # ---------------------------------------------------------

    qry = f"""
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

    # ---------------------------------------------------------
    # EXECUTE
    # ---------------------------------------------------------

    cursor.execute(qry, values)

    rows = cursor.fetchall()

    # ---------------------------------------------------------
    # CONVERT TO DICTIONARY
    # ---------------------------------------------------------

    columns = [
        desc[0]
        for desc in cursor.description
    ]

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

        if row.get("type") == "conversion":

            conversion += 1

        elif row.get("type") == "walkout":

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

            "conversion_percentage":
                conversion_percentage
        },

        "user_info": {

            "user": current_user,

            "roles": roles,

            "is_manager": is_manager,

            "is_hr": is_hr,

            "is_administrator": is_administrator,

            "branch": user_branch
        }
    }
