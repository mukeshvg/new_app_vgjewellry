frappe.pages['branch-transfer-requ'].on_page_load = function(wrapper) {
	// Load Font Awesome from CDN
	if (!document.getElementById('fa-cdn-link')) {
		var faLink = document.createElement('link');
		faLink.id = 'fa-cdn-link';
		faLink.rel = 'stylesheet';
		faLink.crossOrigin = 'anonymous';
		faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
		document.head.appendChild(faLink);
	}

	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Branch Transfer Request',
		single_column: true
	});

	$(wrapper).html(`
	<style>
		* { margin: 0; padding: 0; box-sizing: border-box; }

		:root {
			--primary: #6366f1;
			--primary-dark: #4f46e5;
			--primary-light: #e0e7ff;
			--gold: #d97706;
			--gold-light: #fef3c7;
			--success: #10b981;
			--success-light: #d1fae5;
			--warning: #f59e0b;
			--warning-light: #fef3c7;
			--danger: #ef4444;
			--danger-light: #fee2e2;
			--info: #3b82f6;
			--info-light: #dbeafe;
			--purple: #8b5cf6;
			--purple-light: #ede9fe;
			--teal: #14b8a6;
			--teal-light: #ccfbf1;
			--dark: #1e293b;
			--gray: #64748b;
			--light-gray: #e2e8f0;
			--lighter-gray: #f1f5f9;
			--bg: #f8fafc;
			--white: #ffffff;
			--shadow: 0 1px 3px rgba(0,0,0,0.1);
			--shadow-md: 0 4px 6px -1px rgba(0,0,0,0.1);
			--shadow-lg: 0 10px 15px -3px rgba(0,0,0,0.1);
		}

		body {
			font-family: 'Inter', sans-serif;
			background: var(--bg);
			color: var(--dark);
			font-size: 14px;
		}

		/* ── Page ── */
		.btr-page {
			padding: 20px 25px;
			min-height: 100vh;
			background: var(--bg);
		}

		/* ── Header ── */
		.btr-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 20px;
			flex-wrap: wrap;
			gap: 14px;
		}

		.btr-header-left {
			display: flex;
			align-items: center;
			gap: 14px;
		}

		.btr-header-icon {
			width: 48px;
			height: 48px;
			border-radius: 14px;
			background: linear-gradient(135deg, var(--primary), var(--purple));
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 20px;
			color: white;
			box-shadow: var(--shadow-md);
			flex-shrink: 0;
		}

		.btr-header-left h1 {
			font-size: 22px;
			font-weight: 800;
			color: var(--dark);
			line-height: 1.2;
		}

		.btr-header-left h1 small {
			display: block;
			font-size: 12px;
			font-weight: 400;
			color: var(--gray);
			margin-top: 2px;
		}

		/* ── Stat cards row ── */
		.stats-row {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
			gap: 12px;
			margin-bottom: 18px;
		}

		.stat-card {
			background: white;
			border-radius: 12px;
			padding: 14px 16px;
			box-shadow: var(--shadow);
			display: flex;
			align-items: center;
			gap: 12px;
			border: 2px solid transparent;
			transition: all 0.2s;
			cursor: pointer;
		}

		.stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
		.stat-card.active { border-color: var(--primary); }

		.stat-icon {
			width: 40px;
			height: 40px;
			border-radius: 10px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 15px;
			flex-shrink: 0;
		}

		.stat-icon.all      { background: var(--primary-light); color: var(--primary); }
		.stat-icon.accept   { background: var(--success-light); color: var(--success); }
		.stat-icon.another  { background: var(--warning-light); color: var(--warning); }
		.stat-icon.reject   { background: var(--danger-light);  color: var(--danger); }
		.stat-icon.sent     { background: var(--teal-light);    color: var(--teal); }
		.stat-icon.pending  { background: var(--info-light);    color: var(--info); }

		.stat-info h3 { font-size: 20px; font-weight: 800; }
		.stat-info p  { font-size: 10px; color: var(--gray); }

		/* ── Toolbar ── */
		.btr-toolbar {
			background: white;
			border-radius: 12px;
			padding: 12px 16px;
			margin-bottom: 16px;
			box-shadow: var(--shadow);
			display: flex;
			flex-wrap: wrap;
			gap: 10px;
			align-items: center;
		}

		.search-box { flex: 1; min-width: 200px; position: relative; }

		.search-box i {
			position: absolute;
			left: 12px;
			top: 50%;
			transform: translateY(-50%);
			color: var(--gray);
			font-size: 13px;
		}

		.search-box input {
			width: 100%;
			padding: 9px 12px 9px 36px;
			border: 2px solid var(--light-gray);
			border-radius: 8px;
			font-size: 12px;
			outline: none;
			transition: border-color 0.2s;
		}

		.search-box input:focus { border-color: var(--primary); }

		.btr-count-badge {
			background: var(--primary-light);
			color: var(--primary-dark);
			padding: 5px 14px;
			border-radius: 20px;
			font-size: 12px;
			font-weight: 700;
			white-space: nowrap;
		}

		/* ── Buttons ── */
		.btn {
			padding: 9px 16px;
			border-radius: 8px;
			border: none;
			font-size: 12px;
			font-weight: 600;
			cursor: pointer;
			display: inline-flex;
			align-items: center;
			gap: 6px;
			transition: all 0.2s;
			text-decoration: none;
		}

		.btn-primary  { background: var(--primary); color: white; }
		.btn-primary:hover { background: var(--primary-dark); }
		.btn-outline  { background: white; border: 2px solid var(--light-gray); color: var(--gray); }
		.btn-outline:hover { border-color: var(--primary); color: var(--primary); }
		.btn-sm { padding: 7px 12px; font-size: 11px; }

		/* ── Status tabs ── */
		.status-tabs {
			display: flex;
			gap: 4px;
			background: white;
			padding: 5px;
			border-radius: 10px;
			box-shadow: var(--shadow);
			margin-bottom: 16px;
			flex-wrap: wrap;
		}

		.status-tab {
			padding: 8px 14px;
			border: none;
			background: transparent;
			border-radius: 8px;
			font-size: 11px;
			font-weight: 600;
			color: var(--gray);
			cursor: pointer;
			display: flex;
			align-items: center;
			gap: 5px;
			transition: all 0.2s;
			white-space: nowrap;
		}

		.status-tab:hover  { background: var(--lighter-gray); }
		.status-tab.active { background: var(--primary); color: white; }

		.status-tab .count {
			padding: 1px 6px;
			border-radius: 6px;
			font-size: 9px;
			background: rgba(0,0,0,0.1);
		}

		.status-tab.active .count { background: rgba(255,255,255,0.25); }

		/* ── Cards grid ── */
		.cards-grid {
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
			gap: 16px;
		}

		/* ── Individual transfer card ── */
		.bt-card {
			background: white;
			border-radius: 14px;
			box-shadow: var(--shadow);
			overflow: hidden;
			border: 2px solid transparent;
			transition: all 0.25s;
			display: flex;
			flex-direction: column;
		}

		.bt-card:hover {
			box-shadow: var(--shadow-md);
			transform: translateY(-2px);
		}

		.bt-card.status-accept  { border-color: var(--success); }
		.bt-card.status-reject  { border-color: var(--danger); }
		.bt-card.status-another { border-color: var(--warning); }
		.bt-card.status-sent    { border-color: var(--teal); }

		/* Image section */
		.bt-card-img {
			position: relative;
			width: 100%;
			height: 170px;
			background: var(--lighter-gray);
			overflow: hidden;
			cursor: pointer;
		}

		.bt-card-img img {
			width: 100%;
			height: 100%;
			object-fit: cover;
			transition: transform 0.3s;
		}

		.bt-card-img:hover img { transform: scale(1.06); }

		.img-zoom-hint {
			position: absolute;
			bottom: 7px;
			right: 7px;
			width: 24px;
			height: 24px;
			background: rgba(0,0,0,0.55);
			color: white;
			border-radius: 6px;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 11px;
			opacity: 0;
			transition: opacity 0.2s;
		}

		.bt-card-img:hover .img-zoom-hint { opacity: 1; }

		.img-status-overlay {
			position: absolute;
			top: 8px;
			left: 8px;
			padding: 4px 10px;
			border-radius: 14px;
			font-size: 9px;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 0.4px;
			box-shadow: var(--shadow);
		}

		.img-status-overlay.accept  { background: rgba(16,185,129,0.92);  color: white; }
		.img-status-overlay.reject  { background: rgba(239,68,68,0.92);   color: white; }
		.img-status-overlay.another { background: rgba(245,158,11,0.92);  color: white; }
		.img-status-overlay.sent    { background: rgba(20,184,166,0.92);  color: white; }
		.img-status-overlay.none    { background: rgba(100,116,139,0.85); color: white; }

		.img-label-chip {
			position: absolute;
			bottom: 7px;
			left: 7px;
			background: white;
			padding: 2px 8px;
			border-radius: 8px;
			font-size: 10px;
			font-weight: 700;
			color: var(--dark);
			box-shadow: var(--shadow);
			font-family: monospace;
		}

		/* Card body */
		.bt-card-body {
			padding: 12px 14px;
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: 10px;
		}

		.bt-card-title {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			gap: 8px;
		}

		.bt-card-title h4 {
			font-size: 14px;
			font-weight: 700;
			color: var(--dark);
			line-height: 1.3;
		}

		.bt-card-title .sub {
			font-size: 10px;
			color: var(--gray);
			margin-top: 2px;
			display: block;
		}

		.branch-chip {
			display: inline-flex;
			align-items: center;
			gap: 4px;
			background: var(--primary-light);
			color: var(--primary-dark);
			padding: 3px 9px;
			border-radius: 10px;
			font-size: 10px;
			font-weight: 600;
			white-space: nowrap;
			flex-shrink: 0;
		}

		/* Specs grid */
		.specs-grid {
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: 5px;
		}

		.spec-box {
			background: var(--lighter-gray);
			padding: 6px 4px;
			border-radius: 6px;
			text-align: center;
		}

		.spec-box label {
			display: block;
			font-size: 8px;
			color: var(--gray);
			text-transform: uppercase;
			letter-spacing: 0.3px;
			margin-bottom: 2px;
		}

		.spec-box span {
			font-size: 11px;
			font-weight: 700;
			color: var(--dark);
		}

		/* Date row */
		.bt-date-row {
			display: flex;
			align-items: center;
			gap: 6px;
			font-size: 11px;
			color: var(--gray);
		}

		.bt-date-row i { color: var(--gold); font-size: 11px; }

		/* Manager inputs */
		.manager-inputs {
			background: var(--lighter-gray);
			border-radius: 10px;
			padding: 10px;
		}

		.input-group {
			display: flex;
			flex-direction: column;
			gap: 4px;
			margin-bottom: 8px;
		}

		.input-group:last-child { margin-bottom: 0; }

		.input-group label {
			font-size: 9px;
			font-weight: 600;
			color: var(--gray);
			text-transform: uppercase;
			display: flex;
			align-items: center;
			gap: 4px;
		}

		.input-group label i { color: var(--primary); font-size: 10px; }

		.input-group select {
			padding: 7px 9px;
			border: 2px solid var(--light-gray);
			border-radius: 6px;
			font-size: 11px;
			font-weight: 600;
			background: white;
			cursor: pointer;
			outline: none;
			transition: border-color 0.2s;
		}

		.input-group select:focus,
		.input-group select:hover { border-color: var(--primary); }

		.input-group select.picked-accept  { border-color: var(--success); background: var(--success-light); color: var(--success); }
		.input-group select.picked-reject  { border-color: var(--danger);  background: var(--danger-light);  color: var(--danger); }
		.input-group select.picked-another { border-color: var(--warning); background: var(--warning-light); color: var(--warning); }
		.input-group select.picked-sent    { border-color: var(--teal);    background: var(--teal-light);    color: var(--teal); }

		/* Card footer */
		.bt-card-footer {
			padding: 10px 14px;
			background: var(--lighter-gray);
			border-top: 1px solid var(--light-gray);
			font-size: 10px;
			color: var(--gray);
			display: flex;
			align-items: center;
			gap: 5px;
		}

		.bt-card-footer i { color: var(--primary); }

		/* ── Empty / Loader ── */
		.btr-empty {
			text-align: center;
			padding: 70px 20px;
			grid-column: 1 / -1;
		}

		.btr-empty-icon {
			width: 72px;
			height: 72px;
			border-radius: 50%;
			background: var(--primary-light);
			display: flex;
			align-items: center;
			justify-content: center;
			margin: 0 auto 20px;
			font-size: 28px;
			color: var(--primary);
		}

		.btr-empty h3 { font-size: 18px; font-weight: 700; color: var(--dark); margin-bottom: 8px; }
		.btr-empty p  { font-size: 13px; color: var(--gray); }

		.btr-loader {
			text-align: center;
			padding: 60px 20px;
			color: var(--gray);
			font-size: 13px;
			grid-column: 1 / -1;
		}

		.btr-loader i {
			font-size: 28px;
			color: var(--primary);
			display: block;
			margin-bottom: 12px;
			animation: btr-spin 1s linear infinite;
		}

		@keyframes btr-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

		/* ── Lightbox ── */
		.btr-lightbox {
			display: none;
			position: fixed;
			inset: 0;
			background: rgba(0,0,0,0.88);
			z-index: 9999;
			align-items: center;
			justify-content: center;
		}

		.btr-lightbox.active { display: flex; }

		.btr-lightbox img {
			max-width: 90vw;
			max-height: 90vh;
			border-radius: 14px;
			box-shadow: var(--shadow-lg);
			animation: lbZoom 0.25s ease;
		}

		@keyframes lbZoom { from { transform: scale(0.88); opacity: 0; } to { transform: scale(1); opacity: 1; } }

		.btr-lb-close {
			position: fixed;
			top: 20px;
			right: 24px;
			background: white;
			border: none;
			width: 36px;
			height: 36px;
			border-radius: 50%;
			font-size: 15px;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			color: var(--dark);
			box-shadow: var(--shadow-md);
		}
	</style>

	<!-- Lightbox -->
	<div class="btr-lightbox" id="btr-lightbox">
		<button class="btr-lb-close" onclick="document.getElementById('btr-lightbox').classList.remove('active')">
			<i class="fa fa-times"></i>
		</button>
		<img id="btr-lb-img" src="" alt="Product">
	</div>

	<div class="btr-page">

		<!-- Page header -->
		<div class="btr-header">
			<div class="btr-header-left">
				<div class="btr-header-icon"><i class="fa fa-code-branch"></i></div>
				<h1>
					Branch Transfer Request
					<small>Review and manage incoming transfer requests</small>
				</h1>
			</div>
		</div>

		<!-- Stat cards -->
		<div class="stats-row">
			<div class="stat-card" onclick="btr_filter_tab('all')">
				<div class="stat-icon all"><i class="fa fa-th-large"></i></div>
				<div class="stat-info"><h3 id="stat-all">0</h3><p>All</p></div>
			</div>
			<div class="stat-card active" onclick="btr_filter_tab('pending')">
				<div class="stat-icon pending"><i class="fa fa-clock"></i></div>
				<div class="stat-info"><h3 id="stat-pending">0</h3><p>Pending</p></div>
			</div>
			<div class="stat-card" onclick="btr_filter_tab('accept')">
				<div class="stat-icon accept"><i class="fa fa-check-circle"></i></div>
				<div class="stat-info"><h3 id="stat-accept">0</h3><p>Accepted</p></div>
			</div>
			<div class="stat-card" onclick="btr_filter_tab('another')">
				<div class="stat-icon another"><i class="fa fa-sync-alt"></i></div>
				<div class="stat-info"><h3 id="stat-another">0</h3><p>Alt Requested</p></div>
			</div>
			<div class="stat-card" onclick="btr_filter_tab('reject')">
				<div class="stat-icon reject"><i class="fa fa-times-circle"></i></div>
				<div class="stat-info"><h3 id="stat-reject">0</h3><p>Rejected</p></div>
			</div>
			<div class="stat-card" onclick="btr_filter_tab('sent')">
				<div class="stat-icon sent"><i class="fa fa-paper-plane"></i></div>
				<div class="stat-info"><h3 id="stat-sent">0</h3><p>Product Sent</p></div>
			</div>
		</div>

		<!-- Status tabs -->
		<div class="status-tabs">
			<button class="status-tab" data-tab="all" onclick="btr_filter_tab('all')">
				<i class="fa fa-th-large"></i> All <span class="count" id="tab-all">0</span>
			</button>
			<button class="status-tab active" data-tab="pending" onclick="btr_filter_tab('pending')">
				<i class="fa fa-clock"></i> Pending <span class="count" id="tab-pending">0</span>
			</button>
			<button class="status-tab" data-tab="accept" onclick="btr_filter_tab('accept')">
				<i class="fa fa-check"></i> Accept <span class="count" id="tab-accept">0</span>
			</button>
			<button class="status-tab" data-tab="another" onclick="btr_filter_tab('another')">
				<i class="fa fa-sync-alt"></i> Give Another <span class="count" id="tab-another">0</span>
			</button>
			<button class="status-tab" data-tab="reject" onclick="btr_filter_tab('reject')">
				<i class="fa fa-times"></i> Reject <span class="count" id="tab-reject">0</span>
			</button>
			<button class="status-tab" data-tab="sent" onclick="btr_filter_tab('sent')">
				<i class="fa fa-paper-plane"></i> Product Sent <span class="count" id="tab-sent">0</span>
			</button>
		</div>

		<!-- Toolbar -->
		<div class="btr-toolbar">
			<div class="search-box">
				<i class="fa fa-search"></i>
				<input type="text" id="btr-search" placeholder="Search by Branch, Item, Variety, Label…">
			</div>
			<span class="btr-count-badge" id="btr-count">Loading…</span>
			<button class="btn btn-outline btn-sm" onclick="load_data()">
				<i class="fa fa-sync-alt"></i> Refresh
			</button>
		</div>

		<!-- Cards grid -->
		<div class="cards-grid" id="cart-container">
			<div class="btr-loader">
				<i class="fa fa-circle-notch"></i>
				Loading transfer requests…
			</div>
		</div>

	</div>
	`);

	load_data();
}

/* ─────────────────────────────────────
   Helpers
───────────────────────────────────────*/
function btr_status_key(s) {
	if (!s) return 'pending';
	var l = s.toLowerCase();
	if (l.includes('another'))   return 'another';   // must be before 'accept' check
	if (l === 'accept')          return 'accept';
	if (l === 'reject')          return 'reject';
	if (l === 'product send')    return 'sent';
	return 'pending';
}

var _btr_all_items  = [];
var _btr_active_tab = 'pending';

function btr_filter_tab(tab) {
	_btr_active_tab = tab;

	document.querySelectorAll('.stat-card').forEach(function(c) { c.classList.remove('active'); });
	var statMap = { all:'stat-all', accept:'stat-accept', another:'stat-another', reject:'stat-reject', sent:'stat-sent', pending:'stat-pending' };
	var el = document.getElementById(statMap[tab]);
	if (el) el.closest('.stat-card').classList.add('active');

	document.querySelectorAll('.status-tab').forEach(function(t) {
		t.classList.toggle('active', t.dataset.tab === tab);
	});

	btr_apply_filters();
}

function btr_apply_filters() {
	var q = (document.getElementById('btr-search') ? document.getElementById('btr-search').value : '').toLowerCase().trim();
	var visible = 0;

	document.querySelectorAll('.bt-card').forEach(function(card) {
		var sk    = card.dataset.statusKey || 'none';
		var srch  = (card.dataset.search || '').toLowerCase();
		var tabOk = (_btr_active_tab === 'all') || (sk === _btr_active_tab);
		var srchOk = !q || srch.includes(q);
		var show = tabOk && srchOk;
		card.style.display = show ? '' : 'none';
		if (show) visible++;
	});

	document.getElementById('btr-count').textContent = visible + ' record' + (visible !== 1 ? 's' : '');
}

function btr_update_counts() {
	var counts = { all: 0, accept: 0, another: 0, reject: 0, sent: 0, pending: 0 };
	document.querySelectorAll('.bt-card').forEach(function(card) {
		counts.all++;
		var sk = card.dataset.statusKey || 'pending';
		if (counts[sk] !== undefined) counts[sk]++;
	});
	['all','accept','another','reject','sent','pending'].forEach(function(k) {
		var el  = document.getElementById('stat-' + k);
		var tab = document.getElementById('tab-' + k);
		if (el)  el.textContent  = counts[k];
		if (tab) tab.textContent = counts[k];
	});
}

function btr_colour_select($sel, value, type) {
	$sel.removeClass('picked-accept picked-reject picked-another picked-sent');
	if (!value) return;
	if (type === 'status') {
		var sk = btr_status_key(value);
		if (sk !== 'none') $sel.addClass('picked-' + sk);
	} else if (type === 'send' && value === 'Product Send') {
		$sel.addClass('picked-sent');
	}
}

function btr_open_lightbox(src) {
	document.getElementById('btr-lb-img').src = src;
	document.getElementById('btr-lightbox').classList.add('active');
}

/* ─────────────────────────────────────
   Load data
───────────────────────────────────────*/
function load_data() {
	$("#cart-container").html(`
		<div class="btr-loader">
			<i class="fa fa-circle-notch"></i>
			Loading transfer requests…
		</div>
	`);
	$("#btr-count").text("Loading…");

	frappe.call({
		method: 'vgjewellry.branch_transfer.get_all_branch_transfer_request',
		callback: function(response) {
			console.log(response);
			var bt = response.message || [];
			_btr_all_items = bt;

			if (bt.length === 0) {
				$("#cart-container").html(`
					<div class="btr-empty">
						<div class="btr-empty-icon"><i class="fa fa-inbox"></i></div>
						<h3>No Transfer Requests Found</h3>
						<p>There are no branch transfer requests at the moment.</p>
					</div>
				`);
				$("#btr-count").text("0 records");
				btr_update_counts();
				return;
			}

			var html = '';

			for (var item in bt) {
				var d  = bt[item];
				var sel = item["status"] == "Accept" ? "selected" : "";
				var sk  = btr_status_key(d.s);
				var statusPickedCls = d.s  ? ('picked-' + sk) : '';
				var sendPickedCls   = d.p === 'Product Send' ? 'picked-sent' : '';

				html += `
				<div class="bt-card status-${sk}"
					data-status-key="${sk}"
					data-search="${[d.b||'', d.i||'', d.v||'', d.ln||''].join(' ').toLowerCase()}">

					<!-- Product image -->
					<div class="bt-card-img" onclick="btr_open_lightbox('${d.im}')">
						<img src="${d.im}" alt="Product" onerror="this.style.opacity=0">
						<div class="img-status-overlay ${sk || 'pending'}">${d.s || 'Pending'}</div>
						<div class="img-label-chip">${d.ln || '—'}</div>
						<div class="img-zoom-hint"><i class="fa fa-search-plus"></i></div>
					</div>

					<!-- Body -->
					<div class="bt-card-body">

						<!-- Item name + branch chip -->
						<div class="bt-card-title">
							<div>
								<h4>${d.i || '—'}</h4>
								<span class="sub">
									<i class="fa fa-gem" style="color:var(--gold);margin-right:3px;"></i>${d.v || '—'}
								</span>
							</div>
							<span class="branch-chip">
								<i class="fa fa-building"></i>${d.b || '—'}
							</span>
						</div>

						<!-- Specs -->
						<div class="specs-grid">
							<div class="spec-box">
								<label>Weight Range</label>
								<span>${d.w || '—'}</span>
							</div>
							<div class="spec-box">
								<label>Label No</label>
								<span style="font-family:monospace;font-size:10px;">${d.ln || '—'}</span>
							</div>
							<div class="spec-box">
								<label>Product Send</label>
								<span style="color:${d.p === 'Product Send' ? 'var(--teal)' : 'var(--gray)'}">
									${d.p === 'Product Send' ? 'Yes' : 'No'}
								</span>
							</div>
						</div>

						<!-- Request date -->
						<div class="bt-date-row">
							<i class="fa fa-calendar-alt"></i>
							<span>${d.c || '—'}</span>
						</div>

						<!-- Manager action inputs -->
						<div class="manager-inputs">
							<div class="input-group">
								<label><i class="fa fa-tasks"></i> Manager Status</label>
								<select class="status-select ${statusPickedCls}"
									data-rid="${d.rid}"
									data-tid="${d.tid}">
									<option value="">Select</option>
									<option value="Accept"
										${d.s === "Accept" ? "selected" : ""}>
										Accept
									</option>
									<option value="Reject"
										${d.s === "Reject" ? "selected" : ""}>
										Reject
									</option>
									<option value="Accept But Give Me Another"
										${d.s === "Accept But Give Me Another" ? "selected" : ""}>
										Accept But Give Me Another
									</option>
								</select>
							</div>

							<div class="input-group" ${d.s === "Reject" ? 'style="display:none"' : ""}>
								<label><i class="fa fa-paper-plane"></i> Is Product Send</label>
								<select class="is-product-send ${sendPickedCls}"
									data-rid="${d.rid}"
									data-tid="${d.tid}">
									<option value="">Select</option>
									<option ${d.p === "Product Send" ? "selected" : ""} value="Product Send">Yes</option>
								</select>
							</div>
						</div>

					</div>

					<!-- Footer: req ID -->
					<div class="bt-card-footer">
						<i class="fa fa-hashtag"></i>
						<span>Req ID: <strong>${d.rid || '—'}</strong></span>
					</div>

					<input type="hidden" class="req_id" value="${d.rid}">
				</div>
				`;
			}

			$("#cart-container").html(html);

			btr_update_counts();

			// colour selects that already have a saved value
			$('.status-select').each(function() {
				btr_colour_select($(this), $(this).val(), 'status');
			});
			$('.is-product-send').each(function() {
				btr_colour_select($(this), $(this).val(), 'send');
			});

			btr_apply_filters();

			$('#btr-search').off('input').on('input', function() {
				btr_apply_filters();
			});
		}
	});

	/* ── Status select change ── */
	$(document).off("change", ".status-select").on("change", ".status-select", function () {
		const status = $(this).val();
		const $sel   = $(this);
		if (!status) return;

		const card   = $(this).closest(".bt-card");
		var rid      = $(this).data('rid');
		var tid      = $(this).data('tid');
		console.log(rid);

		frappe.confirm(
			`Are you sure you want to set status to <b>${status}</b>?`,
			() => {
				update_branch_transfer_status(rid, tid, status);
				btr_colour_select($sel, status, 'status');
				var sk = btr_status_key(status);
				card.attr('data-status-key', sk);
				card.removeClass('status-accept status-reject status-another status-sent').addClass('status-' + sk);
				card.find('.img-status-overlay').removeClass('accept reject another sent none').addClass(sk).text(status);
				// show/hide Is Product Send based on status
				var $sendGroup = card.find('.is-product-send').closest('.input-group');
				if (status === 'Reject') {
					$sendGroup.hide();
				} else {
					$sendGroup.show();
				}
				btr_update_counts();
			},
			() => {
				$sel.val("");
				btr_colour_select($sel, '', 'status');
			}
		);
	});

	/* ── Is Product Send change ── */
	$(document).off("change", ".is-product-send").on("change", ".is-product-send", function () {
		const status = $(this).val();
		const $sel   = $(this);
		if (!status) return;

		const card = $(this).closest(".bt-card");
		var rid    = $(this).data('rid');
		var tid    = $(this).data('tid');
		console.log(rid);

		frappe.confirm(
			`Are you sure you want to set status to <b>${status}</b>?`,
			() => {
				update_branch_transfer_is_product_send(rid, tid, status);
				btr_colour_select($sel, status, 'send');
				card.find('.specs-grid .spec-box:last-child span').css('color', 'var(--teal)').text('Yes');
			},
			() => {
				$sel.val("");
				btr_colour_select($sel, '', 'send');
			}
		);
	});

	function update_branch_transfer_status(req_id, tid, status) {
		frappe.call({
			method: "vgjewellry.branch_transfer.update_status",
			args: { req_id: req_id, tid: tid, status: status },
			freeze: true,
			callback: function (r) {
				if (!r.exc) frappe.msgprint("Status updated successfully");
			}
		});
	}

	function update_branch_transfer_is_product_send(req_id, tid, status) {
		frappe.call({
			method: "vgjewellry.branch_transfer.is_product_send",
			args: { req_id: req_id, tid: tid, status: status },
			freeze: true,
			callback: function (r) {
				if (!r.exc) frappe.msgprint("Status updated successfully");
			}
		});
	}
}

/* Lightbox backdrop click to close */
document.addEventListener('click', function(e) {
	var lb = document.getElementById('btr-lightbox');
	if (lb && e.target === lb) lb.classList.remove('active');
});
