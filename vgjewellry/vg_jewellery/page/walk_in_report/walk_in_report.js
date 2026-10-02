frappe.pages['walk-in-report'].on_page_load = function(wrapper) {

    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'WALK-IN REPORT',
        single_column: true
    });

    $(page.main).html(`

        <!-- FILTERS -->
        <div class="row mb-3">

            <div class="col-md-3">
                <input type="date"
                    id="from_date"
                    class="form-control"
                    placeholder="From Date">
            </div>

            <div class="col-md-3">
                <input type="date"
                    id="to_date"
                    class="form-control"
                    placeholder="To Date">
            </div>
	    <div class="col-md-3"
                 id="branch_filter_container"
                 style="display:none">

                <select id="branch_filter"
                        class="form-control">

                    <option value="">
                        All Branches
                    </option>

                    <option value="15">
		        Valsad
                    </option>

                    <option value="16">
                        Vapi
                    </option>

                    <option value="17"> Surat </option>
                    <option value="18">CRM</option>

                </select>

            </div>

            <div class="col-md-3">
	        <div class="d-flex gap-2">
                <button
                    class="btn btn-primary w-50"
                    onclick="load_walkin_dashboard()">
                    Apply
                </button>
		<button
            	class="btn btn-secondary w-50"
            	onclick="clear_walkin_filters()">
            	Clear
        	</button>
            </div>
            </div>

        </div>


        <!-- KPI CARDS -->
        <div class="row" id="walkin-kpi-cards"></div>


        <!-- TREND CHART -->
        <div class="row mt-4">

            <div class="col-md-6">
                <div id="walkin_trend_chart"></div>
            </div>
	    <div class="col-md-6">
                <div id="status_chart"></div>
            </div>

        </div>


        <!-- DATE WISE TABLE -->
        <div class="mt-4">

            <h5>
                Date Wise Walk-In Summary
                <small class="text-muted">
                    (Click date to view counter details)
                </small>
            </h5>

            <table class="table table-bordered table-hover">

                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Total Walk-Ins</th>
                        <th>Conversion</th>
                        <th>Walkout</th>
                    </tr>
                </thead>

                <tbody id="walkin-report-table"></tbody>

            </table>

        </div>

    `);
    check_user_roles();	
    load_walkin_dashboard();
};

function clear_walkin_filters() {

    // Clear date filters
    $("#from_date").val("");
    $("#to_date").val("");

    // Clear branch filter
    $("#branch_filter").val("");

    // Reload dashboard without filters
    load_walkin_dashboard();
}

function check_user_roles() {

    frappe.call({
        method: "frappe.core.doctype.user.user.get_roles",

        args: {
            uid: frappe.session.user
        },

        callback: function(r) {

            let roles = r.message || [];


            let is_hr = roles.includes("HR");

            let is_administrator =
                frappe.session.user === "Administrator" ||
                roles.includes("Administrator");

            if (is_hr || is_administrator) {

                $("#branch_filter_container").show();

            } else {

                $("#branch_filter_container").hide();
            }
        }
    });
}


let global_walkin_date_data = {};

let global_walkin_counter_data = {};


// ============================================================
// LOAD DASHBOARD
// ============================================================

function load_walkin_dashboard() {
    	
    frappe.call({

        method: "vgjewellry.vg_jewellery.page.walk_in_report.walk_in_report.walk_in_report",

        args: {
            from_date: $('#from_date').val(),
            to_date: $('#to_date').val(),
	    branch: $("#branch_filter").val()	
        },
	freeze: true,
        freeze_message: "Loading Walk-In Report...",    

        callback: function(r) {


            if (!r.message) {

                frappe.msgprint("No data found");

                return;
            }

            let raw = [];

            if (
                r.message.data 
            ) {
                raw = r.message.data;
            }

            let formatted = transform_walkin_api_data(raw);

            global_walkin_date_data = formatted.date_map;

            render_walkin_kpis(formatted.kpis);

            render_walkin_trend_chart(formatted.trend);
	    
	    render_status_chart(formatted.kpis);	

            render_walkin_table(formatted.trend);

        },

        error: function(err) {

            console.error(err);

            frappe.msgprint(
                "Failed to fetch Walk-In Report"
            );

        }

    });
}


// ============================================================
// TRANSFORM API DATA
// ============================================================
//

function transform_walkin_api_data(data) {

    let kpi = {
        total_walkin: 0,
        conversion: 0,
        walkout: 0,
        conversion_percentage: 0
    };

    let date_map = {};

    data.forEach(d => {

        let type = (d.type || "").toLowerCase();

        // --------------------------------------------------
        // KPI
        // --------------------------------------------------

        kpi.total_walkin++;

        if (type === "conversion") {
            kpi.conversion++;
        }

        if (type === "walkout") {
            kpi.walkout++;
        }

        // --------------------------------------------------
        // DATE GROUP
        // --------------------------------------------------

        let date = d.entry_date;

        if (!date_map[date]) {

            date_map[date] = {
                date: date,

                total_walkin: 0,
                conversion: 0,
                walkout: 0,

                counter_map: {}
            };
        }

        let date_obj = date_map[date];

        // Date totals
        date_obj.total_walkin++;

        if (type === "conversion") {
            date_obj.conversion++;
        }

        if (type === "walkout") {
            date_obj.walkout++;
        }

        // --------------------------------------------------
        // COUNTER GROUP
        // --------------------------------------------------

        let counter = d.counter || "-";

        if (!date_obj.counter_map[counter]) {

            date_obj.counter_map[counter] = {

                counter: counter,

                total_walkin: 0,
                conversion: 0,
                walkout: 0,

                rows: []
            };
        }

        let counter_obj = date_obj.counter_map[counter];

        // Counter totals
        counter_obj.total_walkin++;

        if (type === "conversion") {
            counter_obj.conversion++;
        }

        if (type === "walkout") {
            counter_obj.walkout++;
        }

        // --------------------------------------------------
        // INDIVIDUAL RECORD
        // --------------------------------------------------

        counter_obj.rows.push({

            id: d.id,

            branch: d.branch || "-",

            counter: d.counter || "-",

            type: d.type || "-",

            walkout_reason: d.walkout_reason || "-",

            walkout_remark: d.walkout_remark || "-",

            entry_date: d.entry_date || "-",

            entry_time: d.entry_time || "-",

            created_at: d.created_at || "-"
        });
    });

    // ------------------------------------------------------
    // CONVERSION %
    // ------------------------------------------------------

    if (kpi.total_walkin > 0) {

        kpi.conversion_percentage = (
            (kpi.conversion / kpi.total_walkin) * 100
        ).toFixed(2);
    }

    // ------------------------------------------------------
    // CONVERT DATE MAP TO ARRAY
    // ------------------------------------------------------

    let trend = Object.values(date_map);

    // ------------------------------------------------------
    // CONVERT COUNTER MAP TO ARRAY
    // ------------------------------------------------------

    trend.forEach(date_obj => {

        date_obj.counters = Object.values(
            date_obj.counter_map
        );

        delete date_obj.counter_map;
    });

    return {

        kpis: kpi,

        trend: trend,

        date_map: date_map
    };
}

function transform_walkin_api_data1(data) {

    let kpi = {

        total_walkin: 0,

        conversion: 0,

        walkout: 0

    };


    let date_map = {};


    data.forEach(d => {

        /*
         * Change these field names if your API
         * returns different names.
         */

        let date = d.entry_date || d.date || d.walkin_date;

        let walkin = parseInt(
            d.total_walkin ||
            d.walkin ||
            d.total ||
            0
        );

        let conversion = parseInt(
            d.conversion ||
            d.converted ||
            0
        );

        let walkout = parseInt(
            d.walkout ||
            d.walk_out ||
            0
        );


        if (!date) {
            return;
        }


        // ====================================================
        // KPI
        // ====================================================

        kpi.total_walkin += walkin;

        kpi.conversion += conversion;

        kpi.walkout += walkout;


        // ====================================================
        // DATE GROUP
        // ====================================================

        if (!date_map[date]) {

            date_map[date] = {

                date: date,

                walkin: 0,

                conversion: 0,

                walkout: 0,

                rows: []

            };

        }


        let obj = date_map[date];


        obj.walkin += walkin;

        obj.conversion += conversion;

        obj.walkout += walkout;


        /*
         * Keep original record.
         *
         * This will be used for the
         * counter-wise drill down.
         */
        obj.rows.push(d);

    });


    return {

        kpis: kpi,

        trend: Object.values(date_map),

        date_map: date_map

    };

}


// ============================================================
// KPI CARDS
// ============================================================

function render_walkin_kpis(kpi) {

    let conversion_percentage = 0;


    if (kpi.total_walkin > 0) {

        conversion_percentage =
            (
                kpi.conversion /
                kpi.total_walkin
            ) * 100;

    }


    $('#walkin-kpi-cards').html(`

        <div class="col-md-4">

            <div class="card p-3 shadow-sm">

                <div class="text-muted">
                    Total Walk-In
                </div>

                <h3 class="mb-0">
                    ${kpi.total_walkin}
                </h3>

            </div>

        </div>


        <div class="col-md-4">

            <div class="card p-3 shadow-sm">

                <div class="text-muted">
                    Conversion
                </div>

                <h3 class="mb-0">

                    ${kpi.conversion}

                    <small style="font-size:16px">
                        (${conversion_percentage.toFixed(2)}%)
                    </small>

                </h3>

            </div>

        </div>


        <div class="col-md-4">

            <div class="card p-3 shadow-sm">

                <div class="text-muted">
                    Walkout
                </div>

                <h3 class="mb-0">
                    ${kpi.walkout}
                </h3>

            </div>

        </div>

    `);

}


// ============================================================
// TREND CHART
// ============================================================

function render_walkin_trend_chart(data) {

    $('#walkin_trend_chart').empty();


    if (!data || !data.length) {

        $('#walkin_trend_chart').html(
            '<div class="text-muted p-3">No data available</div>'
        );

        return;

    }


    data = [...data].sort((a, b) => {
        return new Date(a.date) - new Date(b.date);
    });	
    new frappe.Chart("#walkin_trend_chart", {

        title: "Daily Walk-In Trend",

        type: 'line',

        height: 280,

        data: {

            labels: data.map(
                d => formatDate(d.date)
            ),

            datasets: [

                /*{
                    name: "Walk-In",
                    values: data.map(
                        d => d.total_walkin
                    )
                },*/

                {
                    name: "Conversion",
                    values: data.map(
                        d => d.conversion
                    )
                },

                {
                    name: "Walkout",
                    values: data.map(
                        d => d.walkout
                    )
                }

            ]

        }

    });

}

function render_status_chart(kpi) {

    new frappe.Chart("#status_chart", {
        title: "Walk-inn",
        type: 'pie',
        height: 250,

        data: {
            labels: ["Conversion","Walkout"],
            datasets: [{
                values: [
                    kpi.conversion,
                    kpi.walkout,
                ]
            }]
        }
    });
}


// ============================================================
// DATE WISE TABLE
// ============================================================

function render_walkin_table(data) {

    let rows = '';


    if (!data.length) {

        rows = `

            <tr>

                <td colspan="4"
                    class="text-center text-muted">

                    No records found

                </td>

            </tr>

        `;

    }


    data.forEach(d => {

        rows += `

            <tr
                style="cursor:pointer"
                onclick="show_walkin_day_details('${d.date}')">

                <td>
                    <b>
                        ${formatDate(d.date)}
                    </b>
                </td>

                <td>
                    ${d.total_walkin}
                </td>

                <td>
                    ${d.conversion}
                </td>

                <td>
                    ${d.walkout}
                </td>

            </tr>

        `;

    });


    $('#walkin-report-table').html(rows);

}


// ============================================================
// DATE CLICK
// ============================================================

function show_walkin_day_details(date) {

    let data = global_walkin_date_data[date];


    if (!data) {

        frappe.msgprint(
            "No details found for this date"
        );

        return;

    }


    /*
     * Group records by counter
     */

    let counter_map = {};


    data.counters.forEach(d => {

        let counter =
            d.counter ||
            d.counter_name ||
            "-";


        if (!counter_map[counter]) {

            counter_map[counter] = {

                counter: counter,

                total_walkin: 0,

                conversion: 0,

                walkout: 0,

                rows: []

            };

        }


        let obj =
            counter_map[counter];


        let walkin = parseInt(
            d.total_walkin ||
            d.walkin ||
            d.total ||
            0
        );


        let conversion = parseInt(
            d.conversion ||
            d.converted ||
            0
        );


        let walkout = parseInt(
            d.walkout ||
            d.walk_out ||
            0
        );


        obj.total_walkin += walkin;

        obj.conversion += conversion;

        obj.walkout += walkout;


        obj.rows.push(d);

    });


    global_walkin_counter_data =
        counter_map;


    let counter_rows = '';


    Object.values(counter_map).forEach(c => {

        counter_rows += `

            <tr
                style="cursor:pointer"
                onclick="show_counter_details('${escape_html_attribute(c.counter)}')">

                <td>

                    <a href="javascript:void(0)">

                        ${escape_html(c.counter)}

                    </a>

                </td>

                <td>
                    ${c.total_walkin}
                </td>

                <td>
                    ${c.conversion}
                </td>

                <td>
                    ${c.walkout}
                </td>

            </tr>

        `;

    });


    let html = `

        <div
            class="modal fade show walkin-day-modal"
            style="
                display:block;
                background:rgba(0,0,0,0.5)
            ">

            <div class="modal-dialog modal-lg modal-xl">

                <div class="modal-content">


                    <div class="modal-header">

                        <h4>
                            ${formatDate(date)}
                            - Counter Wise Walk-In
                        </h4>

                        <button
                            class="btn btn-danger"
                            onclick="
                                $('.walkin-day-modal').remove()
                            ">

                            X

                        </button>

                    </div>


                    <div
                        class="modal-body"
                        style="
                            height:77vh;
                            overflow-y:auto
                        ">


                        <table
                            class="table table-bordered table-hover"
                            id="counterTable">

                            <thead>

                                <tr>

                                    <th>
                                        Counter
                                    </th>

                                    <th>
                                        Total Walk-In
                                    </th>

                                    <th>
                                        Conversion
                                    </th>

                                    <th>
                                        Walkout
                                    </th>

                                </tr>


                                <tr>

                                    <th>

                                        <input
                                            class="form-control form-control-sm counter-filter"
                                            data-col="0"
                                            placeholder="Search Counter">

                                    </th>


                                    <th>

                                        <input
                                            class="form-control form-control-sm counter-filter"
                                            data-col="1"
                                            placeholder="Search">

                                    </th>


                                    <th>

                                        <input
                                            class="form-control form-control-sm counter-filter"
                                            data-col="2"
                                            placeholder="Search">

                                    </th>


                                    <th>

                                        <input
                                            class="form-control form-control-sm counter-filter"
                                            data-col="3"
                                            placeholder="Search">

                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                ${counter_rows}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>

        </div>

    `;


    $('body').append(html);

}


// ============================================================
// COUNTER CLICK
// ============================================================

function show_counter_details(counter) {

    let data =  global_walkin_counter_data[counter];


    if (!data) {

        frappe.msgprint(
            "No records found for this counter"
        );

        return;

    }


    let rows = '';


    data.rows[0].rows.forEach((d, index) => {

        let branch =
            d.branch ||
            d.branch_name ||
            "-";


        let counter_name =
            d.counter ||
            d.counter_name ||
            "-";


        let type =
            d.type ||
            d.walkin_type ||
            "-";


        let walkout_reason =
            d.walkout_reason ||
            d.walk_out_reason ||
            "-";


        let walkout_remark =
            d.walkout_remark ||
            d.walk_out_remark ||
            d.remark ||
            "-";


        let entry_date =
            d.entry_date ||
            d.date ||
            "-";


        let entry_time =
            d.entry_time ||
            d.time ||
            "-";


        rows += `

            <tr>

                <td>
                    ${escape_html(branch)}
                </td>

                <td>
                    ${escape_html(counter_name)}
                </td>

                <td>
                    ${escape_html(type)}
                </td>

                <td>
                    ${escape_html(walkout_reason)}
                </td>

                <td>
                    ${escape_html(walkout_remark)}
                </td>

                <td>
                    ${formatDate(entry_date)}
                </td>

                <td>
                    ${escape_html(entry_time)}
                </td>

            </tr>

        `;

    });


    let html = `

        <div
            class="modal fade show walkin-counter-modal"
            style="
                display:block;
                background:rgba(0,0,0,0.5)
            ">

            <div class="modal-dialog modal-lg modal-xl">

                <div class="modal-content">


                    <div class="modal-header">

                        <h4>
                            ${escape_html(counter)}
                            - Walk-In Details
                        </h4>

                        <button
                            class="btn btn-danger"
                            onclick="
                                $('.walkin-counter-modal').remove()
                            ">

                            X

                        </button>

                    </div>


                    <div
                        class="modal-body"
                        style="
                            height:77vh;
                            overflow-y:auto
                        ">


                        <table
                            class="table table-bordered table-sm"
                            id="walkinDetailTable">

                            <thead>

                                <tr>

                                    <th>
                                        Branch
                                    </th>

                                    <th>
                                        Counter
                                    </th>

                                    <th>
                                        Type
                                    </th>

                                    <th>
                                        Walkout Reason
                                    </th>

                                    <th>
                                        Walkout Remark
                                    </th>

                                    <th>
                                        Entry Date
                                    </th>

                                    <th>
                                        Entry Time
                                    </th>

                                </tr>


                                <tr>

                                    <th>
                                        <input
                                            class="form-control form-control-sm walkin-detail-filter"
                                            data-col="0"
                                            placeholder="Search Branch">
                                    </th>

                                    <th>
                                        <input
                                            class="form-control form-control-sm walkin-detail-filter"
                                            data-col="1"
                                            placeholder="Search Counter">
                                    </th>

                                    <th>
                                        <input
                                            class="form-control form-control-sm walkin-detail-filter"
                                            data-col="2"
                                            placeholder="Search Type">
                                    </th>

                                    <th>
                                        <input
                                            class="form-control form-control-sm walkin-detail-filter"
                                            data-col="3"
                                            placeholder="Search Reason">
                                    </th>

                                    <th>
                                        <input
                                            class="form-control form-control-sm walkin-detail-filter"
                                            data-col="4"
                                            placeholder="Search Remark">
                                    </th>

                                    <th>
                                        <input
                                            class="form-control form-control-sm walkin-detail-filter"
                                            data-col="5"
                                            placeholder="Search Date">
                                    </th>

                                    <th>
                                        <input
                                            class="form-control form-control-sm walkin-detail-filter"
                                            data-col="6"
                                            placeholder="Search Time">
                                    </th>

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


// ============================================================
// COUNTER TABLE FILTER
// ============================================================

$(document).on(
    'keyup',
    '.counter-filter',
    function() {

        let table =
            $(this).closest('table');


        let filters = {};


        table.find(
            '.counter-filter'
        ).each(function() {

            let col =
                $(this).data('col');

            filters[col] =
                $(this)
                    .val()
                    .toLowerCase();

        });


        table.find('tbody tr').each(
            function() {

                let show = true;


                $(this)
                    .find('td')
                    .each(function(index) {

                        let text =
                            $(this)
                                .text()
                                .toLowerCase();


                        if (
                            filters[index] &&
                            text.indexOf(
                                filters[index]
                            ) === -1
                        ) {

                            show = false;

                        }

                    });


                $(this).toggle(show);

            }
        );

    }
);


// ============================================================
// DETAIL TABLE FILTER
// ============================================================

$(document).on(
    'keyup',
    '.walkin-detail-filter',
    function() {

        let table =
            $(this).closest('table');


        let filters = {};


        table.find(
            '.walkin-detail-filter'
        ).each(function() {

            let col =
                $(this).data('col');

            filters[col] =
                $(this)
                    .val()
                    .toLowerCase();

        });


        table.find('tbody tr').each(
            function() {

                let show = true;


                $(this)
                    .find('td')
                    .each(function(index) {

                        let text =
                            $(this)
                                .text()
                                .toLowerCase();


                        if (
                            filters[index] &&
                            text.indexOf(
                                filters[index]
                            ) === -1
                        ) {

                            show = false;

                        }

                    });


                $(this).toggle(show);

            }
        );

    }
);


// ============================================================
// ESCAPE HTML
// ============================================================

function escape_html(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "-";
    }


    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function escape_html_attribute(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }


    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");

}


// ============================================================
// DATE FORMAT
// ============================================================

function formatDate(dateStr) {

    if (!dateStr) {
        return "-";
    }


    let d = new Date(dateStr);


    if (isNaN(d.getTime())) {
        return dateStr;
    }


    let day =
        ("0" + d.getDate()).slice(-2);


    let month =
        ("0" + (d.getMonth() + 1)).slice(-2);


    let year =
        d.getFullYear();


    return `${day}-${month}-${year}`;

}

