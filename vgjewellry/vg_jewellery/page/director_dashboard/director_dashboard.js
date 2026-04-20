frappe.pages['director-dashboard'].on_page_load = function(wrapper) {

	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Director Dashboard',
		single_column: true
	});

	$(page.body).addClass('neo-dashboard');

	// ================= GLOBAL CSS =================
	$(`<style>
	@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

	* { box-sizing: border-box; }

	.neo-dashboard {
		background: #f0f2f8;
		padding: 10px !important;
		/*font-family:  sans-serif;*/
		min-height: 100vh;
	}

	/* ── RATE BAR (compact) ── */
	.rate-bar {
		display: flex;
		gap: 8px;
		margin-bottom: 10px;
	}
	.rate-pill {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: #1a2b6b;
		border-radius: 8px;
		padding: 6px 12px;
	}
	.rate-pill-label {
		font-size: 10px;
		color: rgba(255,255,255,0.6);
		font-weight: 500;
		letter-spacing: 0.5px;
		text-transform: uppercase;
	}
	.rate-pill-value {
		font-size: 13px;
		font-weight: 700;
		color: #fbbf24;
		/*font-family: "DM Mono", monospace;*/
	}

	/* ── FILTER BAR ── */
	.filter-bar {
		display: flex;
		gap: 6px;
		margin-bottom: 10px;
		align-items: center;
	}
	.filter-bar input[type="date"] {
		flex: 1;
		border-radius: 8px;
		border: 1px solid #d1d5db;
		padding: 6px 8px;
		font-size: 12px;
		/*font-family: "DM Sans", sans-serif;*/
		background: white;
		color: #1e293b;
		outline: none;
	}
	.filter-bar input[type="date"]:focus {
		border-color: #1a2b6b;
		box-shadow: 0 0 0 2px rgba(26,43,107,0.1);
	}
	.search-btn {
		background: #1a2b6b;
		color: white;
		border: none;
		border-radius: 8px;
		padding: 6px 14px;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		/*font-family: "DM Sans", sans-serif;*/
		transition: background 0.2s;
	}
	.search-btn:hover { background: #142258; }

	/* ── RADIO METHOD SELECTOR ── */
	.method-bar {
		display: flex;
		background: white;
		border-radius: 10px;
		padding: 4px;
		gap: 3px;
		margin-bottom: 12px;
		border: 1px solid #e2e8f0;
		box-shadow: 0 1px 4px rgba(0,0,0,0.05);
	}
	.method-bar label {
		flex: 1;
		text-align: center;
		padding: 6px 4px;
		border-radius: 7px;
		font-size: 11px;
		font-weight: 500;
		color: #64748b;
		cursor: pointer;
		transition: all 0.2s;
		line-height: 1.3;
		user-select: none;
	}
	.method-bar input[type="radio"] { display: none; }
	.method-bar input[type="radio"]:checked + label {
		background: #1a2b6b;
		color: white;
		font-weight: 600;
		box-shadow: 0 2px 6px rgba(26,43,107,0.25);
	}

	/* ── 5-COLUMN TABLE CARD ── */
	.ov-card {
		background: white;
		border-radius: 14px;
		overflow: hidden;
		box-shadow: 0 2px 10px rgba(0,0,0,0.06);
		border: 1px solid #e8ecf4;
		margin-bottom: 10px;
		cursor: pointer;
		transition: box-shadow 0.2s, transform 0.2s;
	}
	.ov-card:hover {
		box-shadow: 0 6px 20px rgba(26,43,107,0.12);
		transform: translateY(-1px);
	}
	.ov-card-header {
		background: linear-gradient(90deg, #1a2b6b 0%, #243a8a 100%);
		color: white;
		padding: 10px 14px;
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.4px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.ov-card-header .chevron {
		font-size: 10px;
		opacity: 0.7;
		transition: transform 0.25s;
	}
	.ov-card.open .chevron { transform: rotate(180deg); }

	/* 5 equal columns */
	.ov-table {
		width: 100%;
		border-collapse: collapse;
	}
	.ov-table th {
		background: #f8faff;
		color: #64748b;
		font-size: 9px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		padding: 6px 8px;
		text-align: right;
		border-bottom: 1px solid #edf0f7;
	}
	.ov-table th:first-child { text-align: left; }
	.ov-table td {
		padding: 8px 8px;
		font-size: 12px;
		/*font-family: "DM Mono", monospace;*/
		text-align: right;
		border-bottom: 1px solid #f1f4fb;
		color: #334155;
	}
	.ov-table td:first-child {
		text-align: left;
		/*font-family: "DM Sans", sans-serif;*/
		font-size: 11px;
		font-weight: 600;
		color: #475569;
	}
	.ov-table tr:last-child td { border-bottom: none; }
	.ov-table tr.net-row td { background: #f0f9f4; }
	.ov-table tr.net-row td { color: #15803d; font-weight: 600; }
	.ov-table tr.net-row td:first-child { color: #15803d; }
	.val-pos { color: #15803d !important; font-weight: 600 !important; }
	.val-neg { color: #dc2626 !important; font-weight: 600 !important; }
	.val-dim { color: #94a3b8; font-size: 10px; }

	/* ── DETAIL SECTION (4 KT cards) ── */
	.detail-section {
		margin-top: 2px;
	}
	.kt-section {
		background: white;
		border-radius: 14px;
		overflow: hidden;
		box-shadow: 0 2px 10px rgba(0,0,0,0.06);
		border: 1px solid #e8ecf4;
		margin-bottom: 10px;
	}
	.kt-section-header {
		background: linear-gradient(90deg, #243a8a 0%, #2d4ab0 100%);
		color: white;
		padding: 9px 14px;
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.3px;
	}

	/* ── BREAKDOWN ── */
	.bd-card {
		margin: 0 10px 10px;
		padding: 8px 10px;
		background: #f8faff;
		border-radius: 8px;
		border: 1px solid #e2e8f0;
	}
	.bd-row {
		display: flex;
		justify-content: space-between;
		padding: 5px 2px;
		font-size: 12px;
		border-bottom: 1px solid #edf0f7;
		color: #475569;
	}
	.bd-row:last-child { border-bottom: none; }
	.bd-row span:last-child {
		/*font-family: "DM Mono", monospace;*/
		font-weight: 500;
		color: #1e293b;
	}

	/* ── BACK BUTTON ── */
	.back-btn {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		background: white;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		padding: 6px 14px;
		font-size: 12px;
		font-weight: 500;
		color: #334155;
		cursor: pointer;
		/*font-family: "DM Sans", sans-serif;*/
		margin-bottom: 10px;
		transition: all 0.2s;
	}
	.back-btn:hover { background: #f8faff; border-color: #1a2b6b; color: #1a2b6b; }

	/* ── LOADING ── */
	.loading-state {
		text-align: center;
		padding: 40px 20px;
		color: #94a3b8;
		font-size: 13px;
	}
	.loading-dot {
		display: inline-block;
		width: 6px; height: 6px;
		border-radius: 50%;
		background: #1a2b6b;
		margin: 0 2px;
		animation: dotPulse 1.2s ease-in-out infinite;
	}
	.loading-dot:nth-child(2) { animation-delay: 0.2s; }
	.loading-dot:nth-child(3) { animation-delay: 0.4s; }
	@keyframes dotPulse {
		0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
		40% { transform: scale(1); opacity: 1; }
	}

	/* ── FADE IN ── */
	.fade-in {
		animation: fadeSlide 0.3s ease;
	}
	@keyframes fadeSlide {
		from { opacity: 0; transform: translateY(8px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	/* ── MOBILE ── */
	@media (max-width: 400px) {
		.ov-table th, .ov-table td { padding: 6px 4px; font-size: 10px; }
		.rate-pill-value { font-size: 12px; }
	}
	/* ── SUMMARY ── */
.sum-wrapper {
	padding: 8px;
	border-radius: 12px;
}

/* HEADING */
.sum-main-title {
	background: #111827;
	color: #e5e7eb;
	font-size: 11px;
	padding: 7px 8px;
	border-radius: 6px;
	margin-bottom: 8px;
	font-weight: 600;
	text-align: center;
	letter-spacing: 0.3px;
}

/* ROW */
.sum-box {
	display: flex;
	align-items: center;
	border-radius: 10px;
	padding: 8px;
	margin-bottom: 6px;
}

/* COLORS */
.sum-box.ketan { background: #dbeafe; }
.sum-box.other { background: #fef3c7; }

/* LEFT LABEL */
.sum-left {
	font-size: 11px;
	font-weight: 600;
	color: #1e293b;
	width: 60px;
}

/* RIGHT SIDE (EQUAL COLUMNS) */
.sum-right {
	display: flex;
	flex: 1;
}

/* FORCE EQUAL WIDTH */
.sum-col {
	flex: 1;
	text-align: center;
}

/* TITLE */
.sum-title {
	font-size: 9px;
	color: #64748b;
	margin-bottom: 2px;
}

/* VALUE */
.sum-value {
	font-size: 12px;
	font-weight: 700;
	color: #0f172a;
	/*font-family: "DM Mono", monospace;*/
}
/* BODY */
.kt-body {
	padding: 8px 10px;
}

/* EACH BLOCK (Sale / Purchase / Net) */
.kt-subsection {
	margin-bottom: 10px;
}

/* HEADING */
.kt-subtitle {
	font-size: 11px;
	font-weight: 700;
	color: #1e293b;
	margin-bottom: 4px;
}

/* ROW */
.val-row {
	display: grid;
	grid-template-columns: 50px 1fr 1fr;
	align-items: center;
	padding: 4px 0;
}

/* LABEL */
.val-label {
	font-size: 10px;
	font-weight: 600;
	color: #64748b;
}

/* AMOUNT */
.val-amt {
	text-align: right;
	font-size: 12px;
	font-weight: 700;
	/*font-family: "DM Mono", monospace;*/
	color: #0f172a;
}

/* WEIGHT */
.val-wt {
	text-align: right;
	font-size: 11px;
	font-weight:bold;
	color: #101112;
	/*font-family: "DM Mono", monospace;*/
}

/* DIVIDER */
.kt-subsection:not(:last-child) {
	border-bottom: 1px solid #eef2f7;
	padding-bottom: 6px;
}

/* MOBILE */
@media (max-width: 400px) {
	.val-row {
		grid-template-columns: 45px 1fr 1fr;
	}
	.val-amt { font-size: 11px; }
	.val-wt { font-size: 10px; }
}
/* MOBILE */
@media (max-width: 400px) {
	.sum-value { font-size: 11px; }
}
.kt-section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	cursor: pointer;
}

.kt-section .chevron {
	font-size: 10px;
	transition: transform 0.25s;
	opacity: 0.7;
}

.kt-section.open .chevron {
	transform: rotate(180deg);
}
/* =========================
   DESKTOP ONLY LAYOUT FIX
   ========================= */
@media (min-width: 768px) {

	/* ---- OVERVIEW: make it more compact & centered ---- */
	/*.sum-wrapper {
		display: flex;
		gap: 10px;
		justify-content: space-between;
	}*/

	.ov-card,.filter-bar,.rate-bar,.method-bar{
		width:350px;
	}
	.sum-box {
		flex: 1;
		margin-bottom: 0;
	}

	/* ---- DETAIL SECTION: 4 KT cards in ONE ROW ---- */
	.detail-section {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 10px;
		align-items: start;
	}

	.kt-section {
		margin-bottom: 0;
		height: fit-content;
	}

	/* make header look tighter on desktop */
	.kt-section-header {
		font-size: 11px;
		padding: 8px 10px;
	}

	.kt-body {
		max-height: 320px;
		overflow-y: auto;
	}

	/* optional: reduce spacing inside cards */
	.kt-subsection {
		margin-bottom: 8px;
	}
}
/* TABLE STYLE SUMMARY */
.sum-table {
	background: #f8faff;
	border-radius: 10px;
	border: 1px solid #e2e8f0;
	overflow: hidden;
}

.sum-row {
	display: flex;
	justify-content: space-between;
	padding: 8px 10px;
	border-bottom: 1px solid #edf0f7;
	font-size: 12px;
}

.sum-row:last-child {
	border-bottom: none;
}

.sum-cell.label {
	color: #475569;
	font-weight: 600;
}

.sum-cell.value {
	font-weight: 700;
	color: #0f172a;
	/*font-family: "DM Mono", monospace;*/
}

/* highlight total */
.sum-row.total {
	background: #ecfdf5;
}

.sum-row.total .value {
	color: #15803d;
}

/* optional: negative value */
.sum-row.total.negative .value {
	color: #dc2626;
}
	</style>`).appendTo(page.body);

	// ================= RATE BAR (compact) =================
	$(`
	<div class="rate-bar">
		<div class="rate-pill">
			<span class="rate-pill-label">Gold 24K</span>
			<span class="rate-pill-value" id="gold_rate">—</span>
		</div>
		<div class="rate-pill">
			<span class="rate-pill-label">Silver</span>
			<span class="rate-pill-value" id="silver_rate">—</span>
		</div>
	</div>
	`).appendTo(page.body);

	// ================= FILTER =================
	$(`
	<div class="filter-bar">
		<input type="date" class="from-date">
		<input type="date" class="to-date">
		<button class="search-btn get-data">
			<i class="fa fa-search"></i>
		</button>
	</div>
	`).appendTo(page.body);

	// ================= METHOD RADIO =================
	$(`
	<div class="method-bar">
		<input type="radio" name="method" id="m-both" value="both" >
		<label for="m-both">Both Methods</label>
		<input type="radio" name="method" id="m-ketan" value="ketan" checked>
		<label for="m-ketan">As per Ketan Sir</label>
		<input type="radio" name="method" id="m-other" value="other">
		<label for="m-other">As per Other</label>
	</div>
	`).appendTo(page.body);

	const content = $(`<div></div>`).appendTo(page.body);

	// ================= STATE =================
	let FULL_DATA = {};
	let FINE_DATA = {};
	let PAYMENT_DATA = {};
	let arihant_rate=0;
	let gold_can_purchase=0

	// ================= HELPERS =================
	function formatAmt(num) {
		if (!num) return '—';
		if (num >= 10000000) return '₹' + (num / 10000000).toFixed(2) + 'Cr';
		if (num >= 100000)   return '₹' + (num / 100000).toFixed(2) + 'L';
		return '₹' + Number(num).toLocaleString('en-IN');
	}
	function formatWt(w) {
		if (!w && w !== 0) return '—';
		return Number(w).toFixed(3) + 'g';
	}
	function getMethod() {
		return $('input[name="method"]:checked').val();
	}

	// ================= COLUMN HEADERS based on method =================
	function colHeaders() {
		const m = getMethod();
		if (m === 'ketan') return ['', 'Wt (K)', 'Amt (K)', '', ''];
		if (m === 'other') return ['', 'Wt (O)', 'Amt (O)', '', ''];
		return ['', 'Net Wt', 'Amt (K)', 'Wt (K)', 'Amt (O)'];
	}

	// build a <tr> for overview
	function ovRow(label, rowData, isNet) {
		const m = getMethod();
		const cls = isNet ? ' class="net-row"' : '';
		const netWt  = formatWt(rowData?.net_wt);
		const amtK   = formatAmt(rowData?.amt_ketan);
		const wtK    = formatWt(rowData?.wt_ketan);
		const amtO   = formatAmt(rowData?.amt_other);

		if (m === 'ketan') {
			return `<tr${cls}><td>${label}</td><td>${wtK}</td><td>${amtK}</td><td></td><td></td></tr>`;
		}
		if (m === 'other') {
			return `<tr${cls}><td>${label}</td><td>${formatWt(rowData?.wt_other)}</td><td>${amtO}</td><td></td><td></td></tr>`;
		}
		// both
		return `<tr${cls}><td>${label}</td><td>${netWt}</td><td>${amtK}</td><td>${wtK}</td><td>${amtO}</td></tr>`;
	}

	// ================= OVERVIEW CARD (24KT summary) =================

	function sumAllKT(data, field) {
	const keys = ['24kt', '22kt', '18kt', 'di'];

	let total = 0;

	keys.forEach(k => {
		let val = data?.[k]?.net?.[field];

		if (!val) return;

		// remove commas and convert
		val = Number(String(val).replace(/,/g, ''));

		if (!isNaN(val)) total += val;
	});

	return total;
}
function build24KTOverview() {

	const d = FULL_DATA;

	return {
		ketan: {
			amt: sumAllKT(d, 'cash_receipt'),
			wt:  sumAllKT(d, 'kt')
		},
		other: {
			amt: sumAllKT(d, 'fine_amt'),
			wt:  sumAllKT(d, 'fine_wt')
		}
	};
}
function renderSummary() {

	const overview = build24KTOverview();
	const m = getMethod();
	const arihant_gold_rate = arihant_rate
	const gold_can_purchase= total_wt_can_purchase

	const ketanAmt = overview.ketan.amt || 0;
	const otherAmt = overview.other.amt || 0;

	const ketanWt = overview.ketan.wt || 0;
	const otherWt = overview.other.wt || 0;

	const requiredAmt = ketanAmt + otherAmt;

	// 👉 adjust if needed
	const purchaseWt = ketanWt - otherWt;

	const isNegative = purchaseWt < 0;

	let rows = '';

	if (m === 'ketan') {

		rows = `
		<div class="sum-table">

			<div class="sum-row">
				<div class="sum-cell label">Amount</div>
				<div class="sum-cell value">${formatAmt(ketanAmt)}</div>
			</div>

			<div class="sum-row">
				<div class="sum-cell label">Sold Weight</div>
				<div class="sum-cell value">K: ${formatWt(ketanWt)}</div>
			</div>

			<div class="sum-row total ${isNegative ? 'negative' : ''}">
				<div class="sum-cell label">Wt Purchase As per Arihant(${arihant_gold_rate})</div>
				<div class="sum-cell value">${gold_can_purchase}</div>
			</div>

		</div>`;
	}

	else if (m === 'other') {

		rows = `
		<div class="sum-table">

			<div class="sum-row">
				<div class="sum-cell label">Amount</div>
				<div class="sum-cell value">${formatAmt(ketanAmt)}</div>
			</div>

			<div class="sum-row">
				<div class="sum-cell label">Sold Weight</div>
				<div class="sum-cell value">O: ${formatWt(otherWt)}</div>
			</div>

			<div class="sum-row total ${isNegative ? 'negative' : ''}">
				<div class="sum-cell label">Wt Purchase As per Arihant(${arihant_gold_rate})</div>
				<div class="sum-cell value">${gold_can_purchase}</div>
			</div>

		</div>`;
	}

	else {
		
		rows = `
		<div class="sum-table">

			<div class="sum-row">
				<div class="sum-cell label">Amount</div>
				<div class="sum-cell value">${formatAmt(ketanAmt)}</div>
			</div>

			<div class="sum-row">
				<div class="sum-cell label">Sold Weight</div>
				<div class="sum-cell value">
					K: ${formatWt(ketanWt)} &nbsp; | &nbsp;
					O: ${formatWt(otherWt)}
				</div>
			</div>

			<div class="sum-row total ${isNegative ? 'negative' : ''}">
				<div class="sum-cell label">Wt Purchase As per Arihant(${arihant_gold_rate})</div>
				<div class="sum-cell value">${gold_can_purchase}</div>
			</div>

		</div>`;
	}

	return `
	<div class="fade-in">
		<div class="ov-card" id="overview-card">

			<div class="ov-card-header">
				24 KT Overview
				<span class="chevron">▼</span>
			</div>

			<div class="sum-wrapper">
				<div class="sum-main-title">Net Wt to be Purchase</div>
				${rows}
			</div>

		</div>
	</div>`;
}

	function renderSummary1() {
		const overview = build24KTOverview();
	const d = FINE_DATA || {};
	const m = getMethod(); 

	function rowBlock(label, wt, amt, cls = '') {
		return `
		<div class="sum-box ${cls}">
			<div class="sum-left">
				<div class="sum-col">
					<div class="sum-title">&nbsp;</div>
					<div class="sum-value">${label}</div>
				</div>
			</div>

			<div class="sum-right">
				<div class="sum-col">
					<div class="sum-title">Amt</div>
					<div class="sum-value">${formatAmt(amt)}</div>
				</div>
				<div class="sum-col">
					<div class="sum-title">Wt</div>
					<div class="sum-value">${formatWt(wt)}</div>
				</div>
			</div>
		</div>`;
	}

	let rows = '';

		if (m === 'ketan') {
		rows += rowBlock(
			'Ketan',
			overview.ketan.wt,
			overview.ketan.amt,
			'ketan'
		);
	}
	else if (m === 'other') {
		rows += rowBlock(
			'Other',
			overview.other.wt,
		overview.other.amt,
			'other'
		);
	}
	else {
		rows += rowBlock(
			'Ketan',
			overview.ketan.wt,
			overview.ketan.amt,
			'ketan'
		);
		rows += rowBlock('Other', overview.other.wt, overview.other.amt, 'other');
	}

	return `
	<div class="fade-in">
		<div class="ov-card" id="overview-card">

			<div class="ov-card-header">
				24 KT Overview
				<span class="chevron">▼</span>
			</div>

			<div class="sum-wrapper">
				<div class="sum-main-title">Net Wt to be Purchase</div>
				${rows}
			</div>
		</div>
	</div>`;
}

	// ================= DETAILED SECTION (all 4 KTs) =================

function ktDetailCard(title, kd) {
	const m = getMethod(); // 👈 add this

	function valueRow(label, wt, amt) {
		const cls = label === 'Ketan' ? 'ketan' : 'other';

		return `
		<div class="val-row ${cls}">
			<div class="val-label">${label}</div>
			<div class="val-amt">${formatAmt(amt)}</div>
			<div class="val-wt">${formatWt(wt)}</div>
		</div>`;
	}

	function sectionBlock(name, data) {

		if (name === 'Purchase') {
	return `
	<div class="kt-subsection">
		<div class="kt-subtitle">${name}</div>

		<div class="val-row">
			<div class="val-label">Old Gold</div>
			<div class="val-amt">${formatAmt(data?.amt_other)}</div>
			<div class="val-wt">${formatWt(data?.wt_other)}</div>
		</div>
	</div>`;
}

	// 👉 NORMAL (Sale / Net)
	let rows = '';

	if (getMethod() === 'ketan') {
		rows += valueRow('Ketan', data?.wt_ketan, data?.amt_ketan);
	}
	else if (getMethod() === 'other') {
		rows += valueRow('Other', data?.wt_other, data?.amt_other);
	}
	else {
		rows += valueRow('Ketan', data?.wt_ketan, data?.amt_ketan);
		rows += valueRow('Other', data?.wt_other, data?.amt_other);
	}

	if (name === 'Net') return ``;
	return `
	<div class="kt-subsection">
		<div class="kt-subtitle">${name}</div>
		${rows}
	</div>`;
}

	return `
	<div class="kt-section collapsible">
<div class="kt-section-header kt-toggle">
			${title}
			<span class="chevron">▼</span>
		</div>

		<div class="kt-body" >

			${sectionBlock('Sale', kd?.sale)}
			${sectionBlock('Purchase', kd?.purchase)}
			${sectionBlock('Net', kd?.net)}

		</div>

	</div>`;
}
$(document).on('click', '.kt-toggle', function() {

	const parent = $(this).closest('.kt-section');
	const body = parent.find('.kt-body');

	body.slideToggle(150);
	parent.toggleClass('open');
});

function mapKTData(raw) {
	console.log(raw);
	if (!raw) return {};

	function mapRow(r) {
		return {
			amt_ketan: r?.cash_receipt,
			wt_ketan:  r?.kt,
			amt_other: r?.fine_amt,
			wt_other:  r?.fine_wt
		};
	}

	return {
		sale:     mapRow(raw.today),
		purchase: {
  amt_other: raw.old?.amount,
  wt_other: raw.old?.weight
		},
		net: {
			amt_ketan: raw.net?.cash_receipt,
			wt_ketan:  raw.net?.kt,
			amt_other: raw.net?.fine_amt,
			wt_other:  raw.net?.fine_wt
		}
	};
}
function renderDetailSection() {
	return `
	<div class="detail-section fade-in" id="detail-section">
		${ktDetailCard('24 KT', mapKTData(FULL_DATA['24kt']))}
		${ktDetailCard('22 KT', mapKTData(FULL_DATA['22kt']))}
		${ktDetailCard('18 KT', mapKTData(FULL_DATA['18kt']))}
		${ktDetailCard('18 DI', mapKTData(FULL_DATA['di']))}
		<button class="back-btn">← Back to Summary</button>
	</div>`;
}
function formatAmt(num) {
	if (num === null || num === undefined || num === '') return '—';

	// convert "33,91,926" → 3391926
	let n = Number(String(num).replace(/,/g, ''));

	if (isNaN(n)) return '—';

	// Indian format with ₹
	return '₹' + n.toLocaleString('en-IN');
}
function formatAmt1(num) {
	if (!num) return '—';

	num = String(num).replace(/,/g, ''); // 👈 remove commas
	num = Number(num);

	if (isNaN(num)) return '—';

	if (num >= 10000000) return '₹' + (num / 10000000).toFixed(2) + 'Cr';
	if (num >= 100000)   return '₹' + (num / 100000).toFixed(2) + 'L';

	return '₹' + num.toLocaleString('en-IN');
}
function formatWt(w) {
	if (!w && w !== 0) return '—';

	w = String(w).replace(/,/g, '');
	w = Number(w);

	if (isNaN(w)) return '—';

	return w.toFixed(3) + '';
}
	function renderDetailSection1() {
		return `
		<div class="detail-section fade-in" id="detail-section">
			${ktDetailCard('24 KT', FULL_DATA['24kt'])}
			${ktDetailCard('22 KT', FULL_DATA['22kt'])}
			${ktDetailCard('18 KT', FULL_DATA['18kt'])}
			${ktDetailCard('18 DI', FULL_DATA['di'])}
			<button class="back-btn">← Back to Summary</button>
		</div>`;
	}

	// ================= OVERVIEW CLICK (toggle detail below) =================
	$(document).on('click', '#overview-card', function() {
		if ($('#detail-section').length) {
			$('#detail-section').remove();
			$(this).removeClass('open');
		} else {
			$(this).addClass('open');
			content.append(renderDetailSection());
		}
	});

	// ================= BACK BUTTON =================
	$(document).on('click', '.back-btn', function() {
		$('#detail-section').remove();
		$('#overview-card').removeClass('open');
	});

	// ================= METHOD CHANGE – REFRESH RENDER =================
	$(document).on('change', 'input[name="method"]', function() {
		if (Object.keys(FULL_DATA).length) {
			const detailOpen = $('#detail-section').length > 0;
			content.html(renderSummary());
			if (detailOpen) {
				$('#overview-card').addClass('open');
				content.append(renderDetailSection());
			}
		}
	});

	// ================= LOAD =================
	function loadData() {
		content.html(`
		<div class="loading-state">
			<div style="margin-bottom:12px;">
				<span class="loading-dot"></span>
				<span class="loading-dot"></span>
				<span class="loading-dot"></span>
			</div>
			Fetching data…
		</div>`);

		frappe.call({
			method: 'vgjewellry.dashboard.get_data',
			args: {
				from_date: $('.from-date').val(),
				to_date:   $('.to-date').val()
			},
			callback: function(r) {
				FULL_DATA    = r.message.data        || {};
				FINE_DATA    = r.message.fine_data   || {};
				PAYMENT_DATA = r.message.payment_data|| {};

				arihant_rate = r.message.arihant_rate || 0
				total_wt_can_purchase = r.message.total_wt_can_purchase||0
				

				content.html(renderSummary());

				$('#gold_rate').text('₹' + (r.message.rate?.g || '—'));
				$('#silver_rate').text('₹' + (r.message.rate?.s || '—'));
			}
		});
	}

	// ================= EVENTS =================
	$(document).on('click', '.get-data', loadData);

	// ================= INIT =================
	const today = frappe.datetime.get_today();
	$('.from-date').val(today);
	$('.to-date').val(today);
	loadData();
};
