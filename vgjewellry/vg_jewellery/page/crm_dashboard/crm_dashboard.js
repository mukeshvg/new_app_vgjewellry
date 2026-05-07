frappe.pages['crm-dashboard'].on_page_load = function(wrapper) {

    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'CRM DASHBOARD',
        single_column: true
    });

    $(page.main).html(`

        <!-- FILTERS -->
        <div class="row mb-3">
            <div class="col-md-3">
                <input type="date" id="from_date" class="form-control">
            </div>

            <div class="col-md-3">
                <input type="date" id="to_date" class="form-control">
            </div>

            <div class="col-md-3" style="display:none">
                <select id="user_filter" class="form-control">
                    <option value="">All Users</option>
                </select>
            </div>

            <div class="col-md-3">
                <button class="btn btn-primary w-100" onclick="load_dashboard()">Apply</button>
            </div>
        </div>

        <!-- KPI CARDS -->
        <div class="row" id="kpi-cards"></div>

        <!-- CHARTS -->
        <div class="row mt-4">
            <div class="col-md-6">
                <div id="trend_chart"></div>
            </div>

            <div class="col-md-6">
                <div id="status_chart"></div>
            </div>
        </div>

        <!-- TABLE -->
        <div class="mt-4">
            <h5>Date Wise Call Summary (Click to View Details)</h5>

            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Total Calls</th>
                        <th>Answered</th>
                        <th>Not Interested</th>
                        <th>Wrong No</th>
                        <th>Not Received</th>
                        <th>Follow-ups</th>
                    </tr>
                </thead>
                <tbody id="report-table"></tbody>
            </table>
        </div>

        <!-- FOLLOW-UP LIST -->
        <div class="mt-4" style="display:none">
            <h5>Follow-up Leads</h5>
            <div id="followup_list"></div>
        </div>

    `);

    load_dashboard();
};

let global_date_data = {};

function load_dashboard() {

    frappe.call({
        method: "vgjewellry.daily_call_report.daily_call_report",

        args: {
            from_date: $('#from_date').val(),
            to_date: $('#to_date').val(),
            user: $('#user_filter').val()
        },

        callback: function(r) {

            let raw = r.message.data.data || [];

            let formatted = transform_api_data(raw);

            global_date_data = formatted.date_map;

            render_kpis(formatted.kpis);
            render_trend_chart(formatted.trend);
            render_status_chart(formatted.kpis);
            render_table(formatted.trend);
            render_followups(formatted.followups);
        }
    });
}

function transform_api_data(data) {

    let kpi = {
        total_calls: 0,
        answered: 0,
        not_interested: 0,
        wrong_number: 0,
        not_received: 0,
        followups: 0,
        conversion: 0
    };

    let date_map = {};
    let followups = [];

    data.forEach(d => {

        let calls = parseInt(d.total_calls || 0);
        let ans = parseInt(d.answered || 0);
        let ni = parseInt(d.not_interested || 0);
        let wn = parseInt(d.wrong_number || 0);
        let nr = parseInt(d.not_received || 0);
        let fu = parseInt(d.followup || 0);
        let notes = parseInt(d.notes_added || 0);

        // KPI
        kpi.total_calls += calls;
        kpi.answered += ans;
        kpi.not_interested += ni;
        kpi.wrong_number += wn;
        kpi.not_received += nr;
        kpi.followups += fu;

        // DATE GROUP
        if (!date_map[d.call_date]) {
            date_map[d.call_date] = {
                date: d.call_date,
                calls: 0,
                answered: 0,
                not_interested: 0,
                wrong_number: 0,
                not_received: 0,
                followups: 0,
                rows: []
            };
        }

        let obj = date_map[d.call_date];

        obj.calls += calls;
        obj.answered += ans;
        obj.not_interested += ni;
        obj.wrong_number += wn;
        obj.not_received += nr;
        obj.followups += fu;

        obj.rows.push({
            emp_id: d.emp_id,
            employee: d.employee_name,
            calls, answered: ans,
            not_interested: ni,
            wrong_number: wn,
            not_received: nr,
            followups: fu,
            notes
        });

        if (fu > 0) {
            followups.push({
                customer: d.employee_name,
                phone: "-",
                notes: `Follow-up required (${notes} notes)`,
                followup_date: d.call_date
            });
        }
    });

    kpi.conversion = kpi.total_calls
        ? ((kpi.followups / kpi.total_calls) * 100).toFixed(2)
        : 0;

    return {
        kpis: kpi,
        trend: Object.values(date_map),
        date_map: date_map,
        followups: followups
    };
}

function render_kpis(kpi) {

    $('#kpi-cards').html(`
        <div class="col-md-3"><div class="card p-3">Total Calls<br><b>${kpi.total_calls}</b></div></div>
        <div class="col-md-3"><div class="card p-3">Answered<br><b>${kpi.answered}</b></div></div>
        <div class="col-md-3"><div class="card p-3">Follow-ups<br><b>${kpi.followups}</b></div></div>
        <!--<div class="col-md-3"><div class="card p-3">Conversion %<br><b>${kpi.conversion}%</b></div></div>-->
    `);
}
function render_trend_chart(data) {

    new frappe.Chart("#trend_chart", {
        title: "Daily Trend",
        type: 'line',
        height: 250,

        data: {
            labels: data.map(d => formatDate(d.date)),
            datasets: [
                { name: "Calls", values: data.map(d => d.calls) },
                { name: "Answered", values: data.map(d => d.answered) },
                { name: "Follow-ups", values: data.map(d => d.followups) }
            ]
        }
    });
}

function render_status_chart(kpi) {

    new frappe.Chart("#status_chart", {
        title: "Call Status",
        type: 'pie',
        height: 250,

        data: {
            labels: ["Answered", "Not Interested", "Wrong Number", "Not Received"],
            datasets: [{
                values: [
                    kpi.answered,
                    kpi.not_interested,
                    kpi.wrong_number,
                    kpi.not_received
                ]
            }]
        }
    });
}

function render_table(data) {

    let rows = '';

    data.forEach(d => {

        rows += `
            <tr style="cursor:pointer" onclick="show_day_details('${d.date}')">
                <td><b>${formatDate(d.date)}</b></td>
                <td>${d.calls}</td>
                <td>${d.answered}</td>
                <td>${d.not_interested}</td>
                <td>${d.wrong_number}</td>
                <td>${d.not_received}</td>
                <td>${d.followups}</td>
            </tr>
        `;
    });

    $('#report-table').html(rows);
}

function show_day_details(date) {

    let data = global_date_data[date];

    let rows = '';

    data.rows.forEach(r => {

        rows += `
            <tr>
                <td>
                    <a href="#" onclick="load_employee_notes('${r.emp_id}')">
                        ${r.employee}
                    </a>
                </td>
                <td>${r.calls}</td>
                <td>${r.answered}</td>
                <td>${r.not_interested}</td>
                <td>${r.wrong_number}</td>
                <td>${r.not_received}</td>
                <td>${r.followups}</td>
            </tr>
        `;
    });

    let html = `
        <div class="modal fade show" style="display:block;background:rgba(0,0,0,0.5)">
            <div class="modal-dialog modal-lg modal-xl">
                <div class="modal-content">

                    <div class="modal-header">
                        <h4>${formatDate(date)} - Call Details</h4>
                        <button class="btn btn-danger" onclick="$('.modal').remove()">X</button>
                    </div>

                    <div class="modal-body">

                        <table class="table table-bordered table-sm" id="dayTable">

                            <thead>

                                <!-- HEADER -->
                                <tr>
                                    <th>Employee</th>
                                    <th>Total Calls</th>
                                    <th>Answered</th>
                                    <th>Not Interested</th>
                                    <th>Wrong No</th>
                                    <th>Not Received</th>
                                    <th>Follow-ups</th>
                                </tr>

                                <!-- FILTER ROW -->
                                <tr>
                                    <th><input class="form-control form-control-sm col-filter" data-col="0" placeholder="Search"></th>
                                    <th><input class="form-control form-control-sm col-filter" data-col="1" placeholder="Search"></th>
                                    <th><input class="form-control form-control-sm col-filter" data-col="2" placeholder="Search"></th>
                                    <th><input class="form-control form-control-sm col-filter" data-col="3" placeholder="Search"></th>
                                    <th><input class="form-control form-control-sm col-filter" data-col="4" placeholder="Search"></th>
                                    <th><input class="form-control form-control-sm col-filter" data-col="5" placeholder="Search"></th>
                                    <th><input class="form-control form-control-sm col-filter" data-col="6" placeholder="Search"></th>
                                </tr>

                            </thead>

                            <tbody>
                                ${rows}
                            </tbody>

                        </table>

                    </div>

                </div>
            </div>
        </div>
    `;

    $('body').append(html);
}


function render_followups(data) {

    let html = '<ul class="list-group">';

    data.forEach(f => {

        html += `
            <li class="list-group-item">
                <b>${f.customer}</b><br>
                <small>${f.notes}</small><br>
                <span class="badge badge-warning">${f.followup_date}</span>
            </li>
        `;
    });

    html += '</ul>';

    $('#followup_list').html(html);
}

function load_employee_notes(emp_id) {
	frappe.call({
        method: "vgjewellry.daily_call_report.employee_call_report",   
        type: "POST",
        args: {
            emp_id: emp_id
        },
        callback: function(r) {

            if (r.message) {
                render_employee_notes(r.message.data);
            } else {
                frappe.msgprint("No data found");
            }

        },
        error: function(err) {
            console.log(err);
            frappe.msgprint("Failed to fetch employee notes");
        }
    });
}

function render_employee_notes(response) {

    let data = response.data || [];
    let rows = '';
    let cnt = 0;

    data.forEach(d => {
        cnt++;

        rows += `
            <tr>
                <td>${cnt}</td>
                <td>${d.mobile_no}</td>
                <td>${d.note}</td>
                <td>${d.call_status}</td>
                <td>${formatDateTime(d.created_time_date)}</td>
                <td>${d.answered_status || "-"}</td>
                <td>${formatDate(d.reminder_date) || "-"}</td>
            </tr>
        `;
    });

    let html = `
        <div class="modal fade show" style="display:block;background:rgba(0,0,0,0.5)">
            <div class="modal-dialog modal-lg modal-xl">
                <div class="modal-content">

                    <div class="modal-header">
                        <h4>Employee Notes</h4>
                        <button class="btn btn-danger" onclick="$('.modal').remove()">X</button>
                    </div>

                    <div class="modal-body">

                        <table class="table table-bordered table-sm" id="employeeNotesTable">

                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Mobile</th>
                                    <th>Note</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Answer Status</th>
                                    <th>Reminder</th>
                                </tr>

                                <tr>
                                    <th></th>
                                    <th><input class="form-control form-control-sm column-filter" data-col="1" placeholder="Search Mobile"></th>
                                    <th><input class="form-control form-control-sm column-filter" data-col="2" placeholder="Search Note"></th>
                                    <th><input class="form-control form-control-sm column-filter" data-col="3" placeholder="Search Status"></th>
                                    <th><input class="form-control form-control-sm column-filter" data-col="4" placeholder="Search Date"></th>
                                    <th><input class="form-control form-control-sm column-filter" data-col="5" placeholder="Search Answer"></th>
                                    <th><input class="form-control form-control-sm column-filter" data-col="6" placeholder="Search Reminder"></th>
                                </tr>
                            </thead>

                            <tbody>
                                ${rows}
                            </tbody>

                        </table>

                    </div>

                </div>
            </div>
        </div>
    `;

    $('body').append(html);
}

$(document).on('keyup', '.col-filter', function () {

    let table = $(this).closest('table');

    let filters = {};

    table.find('.col-filter').each(function () {
        let col = $(this).data('col');
        filters[col] = $(this).val().toLowerCase();
    });

    table.find('tbody tr').each(function () {

        let show = true;

        $(this).find('td').each(function (index) {

            let text = $(this).text().toLowerCase();

            if (filters[index] && text.indexOf(filters[index]) === -1) {
                show = false;
            }
        });

        $(this).toggle(show);
    });
});
$(document).on('keyup', '.column-filter', function () {

    let table = $(this).closest('table');

    let filters = {};

    table.find('.column-filter').each(function () {
        let col = $(this).data('col');
        filters[col] = $(this).val().toLowerCase();
    });

    table.find('tbody tr').each(function () {

        let show = true;

        $(this).find('td').each(function (index) {

            let text = $(this).text().toLowerCase();

            if (filters[index] && text.indexOf(filters[index]) === -1) {
                show = false;
            }
        });

        $(this).toggle(show);
    });
});
function render_employee_notes1(response) {

    let data = response.data || [];

    let rows = '';

    let cnt=0;	
    data.forEach(d => {
	cnt++;    
        rows += `
            <tr>
                <td>${cnt}</td>
                <td>${d.mobile_no}</td>
                <td>${d.note}</td>
                <td>${d.call_status}</td>
                <td>${formatDateTime(d.created_time_date)}</td>
                <td>${d.answered_status || "-"}</td>
                <td>${formatDate(d.reminder_date) || "-"}</td>
            </tr>
        `;
    });

    let html = `
        <div class="modal fade show" style="display:block;background:rgba(0,0,0,0.5)">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">

                    <div class="modal-header">
                        <h4>Employee Notes</h4>
                        <button class="btn btn-danger" onclick="$('.modal').remove()">X</button>
                    </div>

                    <div class="modal-body">
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Mobile</th>
                                    <th>Note</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Answer Status</th>
                                    <th>Reminder</th>
                                </tr>
                            </thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>

                </div>
            </div>
        </div>
    `;

    $('body').append(html);
}

function formatDate(dateStr) {
    if (!dateStr) return "-";

    let d = new Date(dateStr);
    let day = ("0" + d.getDate()).slice(-2);
    let month = ("0" + (d.getMonth() + 1)).slice(-2);
    let year = d.getFullYear();

    return `${day}-${month}-${year}`;
}

function formatDateTime(dateStr) {
    if (!dateStr) return "-";

    let d = new Date(dateStr);

    if (isNaN(d.getTime())) return dateStr;

    let day = ("0" + d.getDate()).slice(-2);
    let month = ("0" + (d.getMonth() + 1)).slice(-2);
    let year = d.getFullYear();

    let hours = ("0" + d.getHours()).slice(-2);
    let minutes = ("0" + d.getMinutes()).slice(-2);
    let seconds = ("0" + d.getSeconds()).slice(-2);

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}
