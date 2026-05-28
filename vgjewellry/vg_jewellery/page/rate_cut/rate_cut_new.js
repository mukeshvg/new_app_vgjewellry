frappe.pages['rate-cut'].on_page_load = function(wrapper) {

    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Rate Cut',
        single_column: true
    });

    // =========================
    // GLOBAL STATE
    // =========================
    let addedRows = [];
    let apiData = {};
    let options = [];

    // =========================
    // UI
    // =========================
    $(page.body).html(`

        <style>
            .rate-cut-table {
                width: 100%;
                table-layout: fixed;
            }

            .rate-cut-table th,
            .rate-cut-table td {
                width: 120px;
                text-align: center;
                vertical-align: middle;
                word-wrap: break-word;
            }

            .vendor-link {
                color: #1f6feb;
                cursor: pointer;
                font-weight: 600;
            }
        </style>

        <div class="row mb-4">

            <div class="col-md-4">
                <div id="vendor-autocomplete"></div>
            </div>

            <div class="col-md-2">
                <label>Fine Wt (Ketan Sir)</label>
                <input type="number" step="0.001" id="fine_wt_input" class="form-control">
            </div>

            <div class="col-md-2" style="margin-top:24px;">
                <button class="btn btn-primary" id="add-row-btn">Add</button>
            </div>

        </div>

        <div id="vendor-table"></div>
    `);

    // =========================
    // RENDER TABLE (GLOBAL)
    // =========================
    function render_table() {

        let totalKetan = 0;
        let totalSelected = 0;
        let totalNet = 0;
        let totalOC = 0;

        let html = `
        <table class="table table-bordered rate-cut-table">
            <thead>
                <tr>
                    <th>Vendor</th>
                    <th>Fine Wt (Ketan)</th>
                    <th>Fine Wt Selected</th>
                    <th>Net Wt</th>
                    <th>OC</th>
                </tr>
            </thead>
            <tbody>
        `;

        addedRows.forEach((row, i) => {

            totalKetan += parseFloat(row.ketanFineWt || 0);
            totalSelected += parseFloat(row.selectedFineWt || 0);
            totalNet += parseFloat(row.netWt || 0);
            totalOC += parseFloat(row.oc || 0);

            html += `
                <tr>
                    <td>
                        <span class="vendor-link" data-index="${i}">
                            ${row.vendor}
                        </span>
                    </td>
                    <td>${row.ketanFineWt}</td>
                    <td>${row.selectedFineWt.toFixed(3)}</td>
                    <td>${row.netWt.toFixed(3)}</td>
                    <td>${row.oc.toFixed(2)}</td>
                </tr>
            `;
        });

        html += `
            <tr style="font-weight:bold;background:#f5f5f5;">
                <td>TOTAL</td>
                <td>${totalKetan.toFixed(3)}</td>
                <td>${totalSelected.toFixed(3)}</td>
                <td>${totalNet.toFixed(3)}</td>
                <td>${totalOC.toFixed(2)}</td>
            </tr>
        </tbody>
        </table>
        `;

        $('#vendor-table').html(html);

        bind_vendor_click();
    }

    // =========================
    // VENDOR CLICK
    // =========================
    function bind_vendor_click() {

        $('.vendor-link').on('click', function() {

            let index = $(this).data('index');
            let rowData = addedRows[index];

            frappe.call({
                method: "vgjewellry.rate_cut.get_saved_transactions",
                args: {
                    acc_mst_id: rowData.accMstId
                },
                callback: function(r) {

                    let savedSelected = (r.message || []).map(
                        x => x.item_tran_id
                    );

                    let vendorRecords = apiData[rowData.accMstId];

                    open_vendor_modal(
                        rowData,
                        vendorRecords,
                        savedSelected
                    );
                }
            });
        });
    }

    // =========================
    // MODAL
    // =========================
    function open_vendor_modal(rowData, records, savedSelected) {

        let d = new frappe.ui.Dialog({
            title: rowData.vendor,
            size: 'extra-large',
            fields: [
                {
                    fieldtype: 'HTML',
                    fieldname: 'content'
                }
            ]
        });

        let html = `
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th></th>
                    <th>Vou No</th>
                    <th>Date</th>
                    <th>Gross</th>
                    <th>Net</th>
                    <th>Fine</th>
                    <th>OC</th>
                </tr>
            </thead>
            <tbody>
        `;

        records.forEach(r => {

            let checked = savedSelected.includes(r.ItemTradMstID);

            html += `
                <tr>
                    <td>
                        <input type="checkbox"
                            class="txn-check"
                            data-id="${r.ItemTradMstID}"
                            ${checked ? "checked" : ""}>
                    </td>
                    <td>${r.VouNo}</td>
                    <td>${frappe.datetime.str_to_user(r.VouDate)}</td>
                    <td>${r.GrossWt}</td>
                    <td>${r.NetWt}</td>
                    <td>${r.FineWt}</td>
                    <td>${r.OtherCharge}</td>
                </tr>
            `;
        });

        html += `</tbody></table>`;

        d.fields_dict.content.$wrapper.html(html);

        d.set_primary_action("Save Selection", function() {

            let selectedRows = [];

            d.$wrapper.find(".txn-check:checked").each(function() {

                let id = $(this).data("id");

                let row = records.find(r =>
                    r.ItemTradMstID == id
                );

                if (row) selectedRows.push(row);
            });

            frappe.call({
                method: "vgjewellry.rate_cut.save_selected_transactions",
                args: {
                    vendor: rowData.vendor,
                    acc_mst_id: rowData.accMstId,
                    rows: JSON.stringify(selectedRows)
                },
                callback: function() {
                    frappe.msgprint("Saved");
                    d.hide();
                }
            });
        });

        d.show();
    }

    // =========================
    // LOAD API FIRST
    // =========================
    frappe.call({
        method: "vgjewellry.rate_cut.get_all_vendor_rate_cut",
        callback: function(r) {

            apiData = r.message || {};

            // build dropdown
            Object.keys(apiData).forEach(id => {
                let rec = apiData[id];
                if (rec.length) {
                    options.push({
                        label: rec[0].AccName,
                        value: id
                    });
                }
            });

            options.sort((a,b)=>a.label.localeCompare(b.label));

            let field = frappe.ui.form.make_control({
                parent: $('#vendor-autocomplete'),
                df: {
                    fieldtype: 'Autocomplete',
                    options: options.map(x => x.label)
                },
                render_input: true
            });

            // =========================
            // ADD BUTTON
            // =========================
            $('#add-row-btn').on('click', function() {

                let name = field.get_value();

                let vendor = options.find(x => x.label === name);

                if (!vendor) return frappe.msgprint("Select Vendor");

                let fineWt = parseFloat($('#fine_wt_input').val());

                if (isNaN(fineWt))
                    return frappe.msgprint("Enter Fine Wt");

                let rows = apiData[vendor.value];

                let totalFine = 0, totalNet = 0, totalOC = 0;

                rows.forEach(r => {
                    totalFine += parseFloat(r.FineWt || 0);
                    totalNet += parseFloat(r.NetWt || 0);
                    totalOC += parseFloat(r.OtherCharge || 0);
                });

                addedRows.push({
                    vendor: vendor.label,
                    accMstId: vendor.value,
                    ketanFineWt: fineWt,
                    selectedFineWt: totalFine,
                    netWt: totalNet,
                    oc: totalOC
                });

                render_table();

                $('#fine_wt_input').val('');
            });

            // initial render
            render_table();
        }
    });

};
