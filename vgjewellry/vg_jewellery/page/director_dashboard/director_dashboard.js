frappe.pages['director-dashboard'].on_page_load = function(wrapper) {

	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Director Dashboard',
		single_column: true
	});

	$(page.body).addClass('neo-dashboard');

	// ================= GLOBAL CSS =================
	$(`<style>
	.clickable {
	cursor: pointer;
}

.clickable:hover {
	text-decoration: underline;
	opacity: 0.8;
}
.bd-card {
	margin-top: 10px;
	padding: 10px;
	background: #f9fafb;
	border-radius: 10px;
	border: 1px solid #eee;
}


.bd-row:last-child {
	border-bottom: none;
}
/* Alternating row colors */
.bd-row:nth-child(odd) {
	background: #f8fafc;  /* very light grey */
}

.bd-row:nth-child(even) {
	background: #ffffff;
}

/* keep spacing clean */
.bd-row {
	display: flex;
	justify-content: space-between;
	padding: 8px 10px;
	font-size: 13px;
	border-radius: 6px;
}
/* BASE BACKGROUND */
.neo-dashboard {
	background: #f4f6f9;  /* soft corporate grey */
	padding: 8px !important;
	font-family: "Inter", sans-serif;
}

/* CARD */
.kt-card {
	background: #ffffff;
	border-radius: 12px;
	padding: 10px;
	box-shadow: 0 2px 8px rgba(0,0,0,0.04); /* subtle */
	border: 1px solid #e6e9ef; /* clean border */
}

/* HEADER */
.kt-header {
	font-size: 13px;
	font-weight: 600;
	color: #1e293b; /* dark slate (professional) */
	margin-bottom: 8px;
}

/* LABEL ROW */
.kt-label-row {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	font-size: 10px;
	color: #6b7280; /* muted grey */
	text-align: right;
	margin-bottom: 4px;
	letter-spacing: 0.3px;
}

/* DATA ROW */
.kt-data-row {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
}

/* BLOCK */
.kt-block {
	display: flex;
	flex-direction: column;
	align-items: flex-end;
	gap: 2px;
}

/* WEIGHT (PRIMARY METRIC) */
.weight {
	font-size: 13px;
	font-weight: 600;
	color: #334155; /* slate grey (not flashy) */
}

/* AMOUNT (SECONDARY) */
.amount {
	font-size: 13px;
	font-weight: 500;
	color: #111827; /* near black */
	white-space: nowrap;
}

/* NET (POSITIVE - CORPORATE GREEN) */
.weight.net,
.amount.net {
	color: #15803d; /* deep green (not neon) */
}

/* SUBTLE DIVIDER BETWEEN ROWS */
.kt-card:not(:last-child) {
	margin-bottom: 2px;
}

/* MOBILE SMALL */
@media (max-width: 380px) {
	.weight, .amount {
		font-size: 12px;
	}
}
/* HEADER */
.neo-header {
	background: linear-gradient(135deg, #1f3bb3, #0d1b3e);
	border-radius: 20px;
	padding: 18px;
	color: white;
	margin-bottom: 15px;
	box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.neo-title {
	font-size: 18px;
	font-weight: 600;
	margin-bottom: 10px;
}

/* RATE STRIP */
.rate-strip {
	display: flex;
	gap: 10px;
}

.rate-box {
	flex: 1;
	background: rgba(255,255,255,0.08);
	padding: 10px;
	border-radius: 12px;
	text-align: center;
	backdrop-filter: blur(10px);
}

.rate-label {
	font-size: 11px;
	opacity: 0.7;
}

.rate-value {
	font-size: 16px;
	font-weight: 600;
}

/* FILTER */
.filter-bar {
	display: flex;
	gap: 8px;
	margin: 12px 0;
}

.filter-bar input {
	flex: 1;
	border-radius: 10px;
	border: 1px solid #ddd;
	padding: 6px 8px;
}

.filter-bar button {
	border-radius: 10px;
}

/* CARDS */
.card-grid {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 12px;
}

.neo-card {
	background: white;
	border-radius: 16px;
	padding: 14px;
	box-shadow: 0 6px 18px rgba(0,0,0,0.05);
	transition: all 0.25s ease;
	cursor: pointer;
}

.neo-card:hover {
	transform: translateY(-4px);
	box-shadow: 0 12px 25px rgba(0,0,0,0.1);
}

.card-title {
	font-size: 13px;
	color: #777;
	margin-bottom: 8px;
}

.card-row {
	display: flex;
	justify-content: space-between;
	font-size: 15px;
	font-weight: 600;
}

.green { color: #16a34a; }
.blue { color: #1f3bb3; }

/* TABLE */
.neo-table {
	width: 100%;
	background: white;
	border-radius: 16px;
	overflow: hidden;
	box-shadow: 0 6px 18px rgba(0,0,0,0.05);
}

.neo-table th {
	background: #1f3bb3;
	color: white;
	padding: 10px;
	font-size: 13px;
}

.neo-table td {
	padding: 10px;
	font-size: 13px;
	border-bottom: 1px solid #eee;
	text-align: center;
}

.back-btn {
	margin-top: 12px;
}

/* ANIMATION */
.fade-in {
	animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
	from {opacity: 0; transform: translateY(10px);}
	to {opacity: 1; transform: translateY(0);}
}

/* MOBILE */
@media(max-width:768px){
	.card-grid {
		grid-template-columns: 1fr;
	}
}

</style>`).appendTo(page.body);

	// ================= HEADER =================
	const header = $(`
	<div class="neo-header">
		<div class="neo-title">📊 Business Snapshot</div>

		<div class="rate-strip">
			<div class="rate-box">
				<div class="rate-label">Gold 24K</div>
				<div class="rate-value" id="gold_rate">₹</div>
			</div>
			<div class="rate-box">
				<div class="rate-label">Silver</div>
				<div class="rate-value" id="silver_rate">₹</div>
			</div>
		</div>
	</div>
	`).appendTo(page.body);

	// ================= FILTER =================
	const filters = $(`
	<div class="filter-bar">
		<input type="date" class="from-date">
		<input type="date" class="to-date">
		<button class="btn btn-primary btn-sm get-data">
			<i class="fa fa-search"></i>
		</button>
	</div>
	`).appendTo(page.body);

	const content = $(`<div></div>`).appendTo(page.body);

	// ================= STATE =================
	let FULL_DATA = {};
	let FINE_DATA = {};

	// ================= CARD =================
	function card(title, d, type) {
		return `
		<div class="neo-card" data-type="${type}">
			<div class="card-title">${title}</div>
			<div class="card-row">
				<span class="blue">Wt: ${d.weight || 0}</span>
				<span class="green">₹ ${d.amount || 0}</span>
			</div>
		</div>`;
	}

	// ================= SUMMARY =================
	function formatAmount(num) {
	if (!num) return 0;

	// Convert to Indian format (short)
	if (num >= 10000000) return (num / 10000000).toFixed(2) + "Cr";
	if (num >= 100000) return (num / 100000).toFixed(2) + "L";

	return num.toLocaleString("en-IN");
}

function renderSummary() {

	function ktOverviewCard(d) {
		return `
		<div class="kt-card overview-card" >

			<div class="kt-header">24 KT Overview</div>

			<!-- LABEL ROW -->
			<div class="kt-label-row">
				<div>Sale</div>
				<div>Purchase</div>
				<div>Net</div>
			</div>

			<!-- DATA ROW -->
			<div class="kt-data-row">

				<div class="kt-block">
					<div class="weight">${d.today?.weight || 0}</div>
					<div class="amount clickable" data-type="24kt" data-mode="today">₹ ${formatAmount(d.today?.amount)}</div>
				</div>

				<div class="kt-block">
					<div class="weight">${d.old?.weight || 0}</div>
					<div class="amount clickable" data-type="24kt" data-mode="today">₹ ${formatAmount(d.old?.amount)}</div>
				</div>

				<div class="kt-block">
					<div class="weight net">${d.net?.weight || 0}</div>
					<div class="amount net clickable" data-type="24kt" data-mode="today">₹ ${formatAmount(d.net?.amount)}</div>
				</div>

			</div>
			<div class="overview-drill"></div>
		</div>`;
	}

	return `
	<div class="fade-in">
		${ktOverviewCard(FINE_DATA || {})}
	</div>
	`;
}

$(document).on('click', '.clickable', function(e) {

	e.stopPropagation(); // 🔥 IMPORTANT (prevents card click)

	const el = $(this);
	const type = el.data('type');     // 24kt
	const mode = el.data('mode');     // today / old / net

	const parent = el.closest('.kt-card');
	const container = parent.find('.overview-drill');

	// toggle
	if (container.html()) {
		container.html('');
		return;
	}

	const data = FULL_DATA[type]?.breakdown?.[mode] || {};

	container.html(renderBreakdownRow(data));
});

$(document).on('click', '.overview-card', function() {

	// prevent duplicate render
	if ($('#detail-section').length) {
		$('#detail-section').remove();
		return;
	}

	// append BELOW summary (not replace)
	content.append(`
		<div id="detail-section">
			${renderTable()}
		</div>
	`);
});
	/*$(document).on('click', '.neo-card, .overview-card', function() {
	content.html(renderTable());
});*/

	// ================= TABLE =================
		function renderTable() {
function ktCard(name, d, type) {
	return `
	<div class="kt-card kt-click" data-type="${type}">

		<div class="kt-header">${name}</div>

		<div class="kt-label-row">
			<div>Sale</div>
			<div>Purchase</div>
			<div>Net</div>
		</div>

		<div class="kt-data-row">
			<div class="kt-block">
				<div class="weight">${d.today?.weight || 0}</div>
				<div class="amount">₹ ${formatAmount(d.today?.amount)}</div>
			</div>

			<div class="kt-block">
				<div class="weight">${d.old?.weight || 0}</div>
				<div class="amount">₹ ${formatAmount(d.old?.amount)}</div>
			</div>

			<div class="kt-block">
				<div class="weight net">${d.net?.weight || 0}</div>
				<div class="amount net">₹ ${formatAmount(d.net?.amount)}</div>
			</div>
		</div>

		<!-- 👇 drilldown container -->
		<div class="kt-drill"></div>

	</div>`;
}

	return `
	<div class="fade-in">

		<h4 class="section-title">Detailed Breakdown</h4>

		<div class="kt-container">
			${ktCard("24 KT", FULL_DATA['24kt'])}
			${ktCard("22 KT", FULL_DATA['22kt'])}
			${ktCard("18 KT", FULL_DATA['18kt'])}
		</div>

		<button class="btn btn-secondary btn-sm back-btn">⬅ Back</button>

	</div>
	`;
}

function renderBreakdownRow(data) {

	const row = (label, val) => `
	<div class="bd-row">
		<span>${label}</span>
		<span>₹ ${formatAmount(val)}</span>
	</div>`;

	return `
	<div class="bd-card fade-in">
		${row("Cash", data.cash)}
		${row("Card", data.card)}
		${row("Bank", data.bank)}
		${row("Old Gold", data.old_gold)}
		${row("Scheme", data.scheme)}
		${row("Payable", data.payable)}
		${row("Receivable", data.receivable)}
		${row("Tax", data.tax)}
	</div>`;
}
$(document).on('click', '.kt-click', function() {

	const el = $(this);
	const type = el.data('type');
	const container = el.find('.kt-drill');

	// toggle
	if (container.html()) {
		container.html('');
		return;
	}

	const data = FULL_DATA[type]?.breakdown || {};

	container.html(renderBreakdownRow(data));
});
	// ================= LOAD =================
	function loadData() {

		content.html("Loading...");

		frappe.call({
			method: 'vgjewellry.dashboard.get_data',
			args: {
				from_date: $('.from-date').val(),
				to_date: $('.to-date').val()
			},
			callback: function(r) {

				FULL_DATA = r.message.data;
				FINE_DATA = r.message.fine_data;

				content.html(renderSummary());

				$("#gold_rate").text('₹ ' + r.message.rate.g);
				$("#silver_rate").text('₹ ' + r.message.rate.s);
			}
		});
	}

	// ================= EVENTS =================
	$(document).on('click', '.get-data', loadData);

	$(document).on('click', '.neo-card', function() {
		content.html(renderTable());
	});

	$(document).on('click', '.back-btn', function() {
		content.html(renderSummary());
	});

	// ================= INIT =================
	const today = frappe.datetime.get_today();
	$('.from-date').val(today);
	$('.to-date').val(today);

	loadData();
};
