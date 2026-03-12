frappe.pages['product-requisition-for-po'].on_page_load = function(wrapper) {
	// ── CDN dependencies ────────────────────────────────────────────────────
	if (!document.getElementById('fa-cdn-link')) {
		var faLink = document.createElement('link');
		faLink.id = 'fa-cdn-link'; faLink.rel = 'stylesheet'; faLink.crossOrigin = 'anonymous';
		faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
		document.head.appendChild(faLink);
	}
	if (!document.getElementById('flatpickr-css-cdn')) {
		var fpCss = document.createElement('link');
		fpCss.id = 'flatpickr-css-cdn'; fpCss.rel = 'stylesheet';
		fpCss.href = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css';
		document.head.appendChild(fpCss);
	}
	if (!document.getElementById('flatpickr-js-cdn')) {
		var fpScript = document.createElement('script');
		fpScript.id = 'flatpickr-js-cdn';
		fpScript.src = 'https://cdn.jsdelivr.net/npm/flatpickr';
		document.head.appendChild(fpScript);
	}

	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Product Requisition For Purchase',
		single_column: true
	});

	$(wrapper).html(`
	<style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
            --primary: #6366f1; --primary-dark: #4f46e5; --primary-light: #e0e7ff;
            --gold: #d97706; --gold-light: #fef3c7;
            --success: #10b981; --success-light: #d1fae5;
            --warning: #f59e0b; --warning-light: #fef3c7;
            --danger: #ef4444;  --danger-light: #fee2e2;
            --info: #3b82f6;    --info-light: #dbeafe;
            --purple: #8b5cf6;  --purple-light: #ede9fe;
            --teal: #14b8a6;    --teal-light: #ccfbf1;
            --dark: #1e293b;    --gray: #64748b;
            --light-gray: #e2e8f0; --lighter-gray: #f1f5f9;
            --bg: #f8fafc;      --white: #ffffff;
            --shadow: 0 1px 3px rgba(0,0,0,.1);
            --shadow-md: 0 4px 6px -1px rgba(0,0,0,.1);
            --shadow-lg: 0 10px 15px -3px rgba(0,0,0,.1);
        }
        body { font-family:'Inter',sans-serif; background:var(--bg); color:var(--dark); min-height:100vh; font-size:14px; }
        .main-content { padding:20px 25px; min-height:100vh; }
        .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:25px; flex-wrap:wrap; gap:15px; }
        .header-left h1 { font-size:22px; font-weight:800; color:var(--dark); }
        .header-left h1 i { color:var(--gold); margin-right:10px; }
        .header-right { display:flex; align-items:center; gap:10px; }
        .stats-row { display:grid; grid-template-columns:repeat(auto-fit,minmax(155px,1fr)); gap:12px; margin-bottom:20px; }
        .stat-card { background:white; border-radius:12px; padding:16px; box-shadow:var(--shadow); display:flex; align-items:center; gap:12px; cursor:pointer; transition:all .2s ease; border:2px solid transparent; }
        .stat-card:hover { transform:translateY(-2px); box-shadow:var(--shadow-md); }
        .stat-card.active { border-color:var(--primary); }
        .stat-icon { width:42px; height:42px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:16px; }
        .stat-icon.pending   { background:var(--warning-light); color:var(--warning); }
        .stat-icon.approved  { background:var(--success-light); color:var(--success); }
        .stat-icon.rejected  { background:var(--danger-light);  color:var(--danger);  }
        .stat-icon.total     { background:var(--teal-light);    color:var(--teal);    }
        .stat-info h3 { font-size:20px; font-weight:800; }
        .stat-info p  { font-size:10px; color:var(--gray); }
        .status-tabs { display:flex; gap:4px; background:white; padding:5px; border-radius:10px; box-shadow:var(--shadow); margin-bottom:15px; flex-wrap:wrap; overflow-x:auto; }
        .status-tab { padding:8px 14px; border:none; background:transparent; border-radius:8px; font-size:11px; font-weight:600; color:var(--gray); cursor:pointer; display:flex; align-items:center; gap:5px; transition:all .2s ease; white-space:nowrap; }
        .status-tab:hover { background:var(--lighter-gray); }
        .status-tab.active { background:var(--primary); color:white; }
        .status-tab .count { padding:1px 6px; border-radius:6px; font-size:9px; background:rgba(0,0,0,.1); }
        .status-tab.active .count { background:rgba(255,255,255,.2); }
        .toolbar { background:white; border-radius:12px; padding:12px 15px; margin-bottom:15px; box-shadow:var(--shadow); display:flex; flex-wrap:wrap; gap:10px; align-items:center; }
        .search-box { flex:1; min-width:220px; position:relative; }
        .search-box i { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--gray); font-size:13px; }
        .search-box input { width:100%; padding:9px 12px 9px 36px; border:2px solid var(--light-gray); border-radius:8px; font-size:12px; }
        .search-box input:focus { outline:none; border-color:var(--primary); }
        .btn { padding:9px 16px; border-radius:8px; border:none; font-size:12px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:all .2s ease; }
        .btn-primary  { background:var(--primary); color:white; }
        .btn-primary:hover { background:var(--primary-dark); }
        .btn-success  { background:var(--success); color:white; }
        .btn-info     { background:var(--info);    color:white; }
        .btn-outline  { background:white; border:2px solid var(--light-gray); color:var(--gray); }
        .btn-outline:hover { border-color:var(--primary); color:var(--primary); }
        .btn-sm { padding:7px 12px; font-size:11px; }
        .requisition-container { display:flex; flex-direction:column; gap:20px; }
        .requisition-card { background:white; border-radius:14px; box-shadow:var(--shadow); overflow:hidden; }
        .req-header { padding:15px 18px; background:linear-gradient(135deg,var(--lighter-gray),white); border-bottom:1px solid var(--light-gray); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
        .req-header-left { display:flex; align-items:center; gap:12px; }
        .req-info h3 { font-size:16px; font-weight:700; color:var(--primary); }
        .req-meta { display:flex; gap:12px; margin-top:4px; flex-wrap:wrap; }
        .req-meta span { font-size:11px; color:var(--gray); display:flex; align-items:center; gap:4px; }
        .req-meta span i { color:var(--gold); font-size:10px; }
        .req-badges { display:flex; gap:6px; }
        .badge { padding:3px 8px; border-radius:12px; font-size:9px; font-weight:700; text-transform:uppercase; }
        .badge-pending   { background:var(--warning-light); color:var(--warning); }
        .badge-approved  { background:var(--success-light); color:var(--success); }
        .badge-rejected  { background:var(--danger-light);  color:var(--danger);  }
        .badge-po        { background:var(--info-light);    color:var(--info);    }
        .products-grid { padding:15px; display:grid; grid-template-columns:repeat(auto-fill,minmax(420px,1fr)); gap:15px; }
        .product-card { background:var(--lighter-gray); border-radius:14px; overflow:hidden; transition:all .3s ease; position:relative; border:2px solid transparent; }
        .product-card:hover { box-shadow:var(--shadow-md); }
        .product-card.status-approved { border-color:var(--success); }
        .product-card.status-rejected { border-color:var(--danger);  }
        .image-comparison { display:grid; grid-template-columns:1fr 1fr; background:white; }
        .image-section { padding:10px; text-align:center; position:relative; }
        .image-section:first-child { border-right:2px dashed var(--light-gray); }
        .image-label { position:absolute; top:6px; left:6px; padding:2px 6px; border-radius:8px; font-size:8px; font-weight:700; text-transform:uppercase; z-index:5; }
        .image-label.existing { background:var(--info-light);   color:var(--info);   }
        .image-label.required { background:var(--purple-light); color:var(--purple); }
        .product-image-wrapper { width:100%; height:100px; border-radius:8px; overflow:hidden; background:var(--lighter-gray); display:flex; align-items:center; justify-content:center; cursor:pointer; position:relative; margin-top:14px; }
        .product-image-wrapper img { width:100%; height:100%; object-fit:cover; transition:transform .3s ease; }
        .product-image-wrapper:hover img { transform:scale(1.05); }
        .image-zoom { position:absolute; bottom:5px; right:5px; width:22px; height:22px; background:rgba(0,0,0,.6); color:white; border-radius:5px; display:flex; align-items:center; justify-content:center; font-size:10px; opacity:0; transition:opacity .2s; }
        .product-image-wrapper:hover .image-zoom { opacity:1; }
        .status-overlay { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); padding:5px 12px; border-radius:15px; font-size:9px; font-weight:700; display:flex; align-items:center; gap:4px; box-shadow:var(--shadow-md); }
        .status-overlay.approved { background:rgba(16,185,129,.95); color:white; }
        .status-overlay.rejected { background:rgba(239,68,68,.95);  color:white; }
        .product-details { padding:12px; }
        .product-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px; }
        .product-title h4 { font-size:13px; font-weight:700; color:var(--dark); margin-bottom:2px; }
        .product-title span { font-size:10px; color:var(--gray); }
        .product-status-badge { padding:3px 8px; border-radius:10px; font-size:8px; font-weight:700; text-transform:uppercase; }
        .ideal-table-wrapper { background:white; border-radius:10px; padding:10px; margin-bottom:10px; }
        .ideal-table-wrapper h5 { font-size:10px; font-weight:700; color:var(--gray); text-transform:uppercase; letter-spacing:.5px; margin-bottom:6px; display:flex; align-items:center; gap:5px; }
        .ideal-table { width:100%; border-collapse:collapse; font-size:11px; }
        .ideal-table th { background:var(--lighter-gray); padding:5px 7px; text-align:center; font-size:9px; font-weight:700; color:var(--gray); text-transform:uppercase; border-bottom:1px solid var(--light-gray); }
        .ideal-table td { padding:5px 7px; text-align:center; border-bottom:1px solid var(--lighter-gray); }
        .ideal-table tr:last-child td { border-bottom:none; }
        .ideal-table tr.own-branch td { background:var(--primary-light); font-weight:600; }
        .in-stock-btn { padding:3px 8px; border-radius:5px; border:none; background:var(--info-light); color:var(--info); font-size:10px; font-weight:600; cursor:pointer; transition:all .2s ease; }
        .in-stock-btn:hover { background:var(--info); color:white; }
        .manager-info-panel { background:var(--gold-light); border-radius:10px; padding:10px; margin-bottom:10px; border-left:3px solid var(--gold); }
        .manager-info-panel h5 { font-size:10px; font-weight:700; color:var(--gold); text-transform:uppercase; margin-bottom:6px; display:flex; align-items:center; gap:5px; }
        .manager-info-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; }
        .m-info-box { background:white; padding:6px; border-radius:6px; text-align:center; }
        .m-info-box label { display:block; font-size:8px; color:var(--gray); text-transform:uppercase; margin-bottom:2px; }
        .m-info-box span  { font-size:12px; font-weight:700; color:var(--dark); }
        .m-info-remark { background:white; border-radius:6px; padding:6px 8px; margin-top:5px; font-size:11px; color:var(--dark); }
        .manager-inputs { background:white; border-radius:10px; padding:10px; margin-bottom:10px; }
        .input-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:8px; }
        .input-row.three-cols { grid-template-columns:1fr 1fr 1fr; }
        .input-group { display:flex; flex-direction:column; gap:3px; }
        .input-group label { font-size:9px; font-weight:600; color:var(--gray); text-transform:uppercase; display:flex; align-items:center; gap:3px; }
        .input-group label i { color:var(--primary); font-size:10px; }
        .input-group label .required { color:var(--danger); }
        .input-group input, .input-group textarea, .input-group select { padding:7px 9px; border:2px solid var(--light-gray); border-radius:6px; font-size:11px; transition:all .2s ease; }
        .input-group input:focus, .input-group textarea:focus, .input-group select:focus { outline:none; border-color:var(--primary); }
        .input-group textarea { resize:none; min-height:50px; }
        .input-group select   { cursor:pointer; background:white; }
        .input-group .flatpickr-input.flatpickr-alt-input { width:100%; box-sizing:border-box; }
        .input-group input.flatpickr-input:not(.flatpickr-alt-input) { display:none !important; }
        .full-width { grid-column:1/-1; }
        .action-select { font-weight:600; }
        .action-select.approved { border-color:var(--success); background:var(--success-light); color:var(--success); }
        .action-select.rejected { border-color:var(--danger);  background:var(--danger-light);  color:var(--danger);  }
        .reason-section { display:none; margin-top:8px; }
        .reason-section.show { display:block; }
        .product-actions { display:flex; gap:5px; flex-wrap:wrap; }
        .action-btn { padding:7px 10px; border-radius:6px; border:none; font-size:10px; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:4px; transition:all .2s ease; }
        .action-btn:hover { transform:translateY(-1px); }
        .action-btn.save     { background:var(--primary); color:white; }
        .action-btn.view-img { background:var(--purple);  color:white; }
        .req-footer { padding:12px 18px; background:var(--lighter-gray); border-top:1px solid var(--light-gray); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; }
        .req-summary { display:flex; gap:18px; }
        .summary-item { text-align:center; }
        .summary-item label { display:block; font-size:8px; color:var(--gray); text-transform:uppercase; }
        .summary-item span  { font-size:15px; font-weight:800; }
        .summary-item span.success { color:var(--success); }
        .summary-item span.warning { color:var(--warning); }
        .summary-item span.danger  { color:var(--danger);  }
        .req-actions { display:flex; gap:6px; }
        .image-modal { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,.9); display:none; align-items:center; justify-content:center; z-index:3000; padding:20px; }
        .image-modal.active { display:flex; }
        .image-modal-content { background:white; border-radius:16px; max-width:80vw; width:80vw; max-height:85vh; overflow:hidden; margin:0 auto; animation:modalZoom .3s ease; }
        @keyframes modalZoom { from{transform:scale(.9);opacity:0} to{transform:scale(1);opacity:1} }
        .image-modal-header { padding:15px 20px; border-bottom:1px solid var(--light-gray); display:flex; justify-content:space-between; align-items:center; }
        .image-modal-header h3 { font-size:15px; display:flex; align-items:center; gap:8px; }
        .image-modal-close { width:34px; height:34px; border-radius:8px; border:none; background:var(--lighter-gray); cursor:pointer; font-size:14px; }
        .image-modal-footer { padding:15px 20px; background:var(--lighter-gray); display:flex; justify-content:space-between; align-items:center; }
        .toast-container { position:fixed; top:20px; right:20px; z-index:4000; display:flex; flex-direction:column; gap:8px; }
        .toast { padding:12px 18px; border-radius:10px; color:white; font-weight:500; display:flex; align-items:center; gap:8px; box-shadow:var(--shadow-lg); animation:toastSlide .3s ease; min-width:260px; font-size:12px; }
        @keyframes toastSlide { from{transform:translateX(100px);opacity:0} to{transform:translateX(0);opacity:1} }
        .toast.success { background:linear-gradient(135deg,var(--success),#059669); }
        .loading-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(255,255,255,.9); display:none; align-items:center; justify-content:center; z-index:5000; }
        .loading-overlay.active { display:flex; }
        .spinner { width:45px; height:45px; border:4px solid var(--light-gray); border-top-color:var(--primary); border-radius:50%; animation:spin .8s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .empty-state { text-align:center; padding:50px 20px; }
        .empty-state i  { font-size:45px; color:var(--light-gray); margin-bottom:12px; }
        .empty-state h3 { font-size:16px; color:var(--dark); margin-bottom:5px; }
        .empty-state p  { color:var(--gray); font-size:12px; }
        @media(max-width:768px) {
            .products-grid { grid-template-columns:1fr; }
            .input-row, .input-row.three-cols { grid-template-columns:1fr; }
            .manager-info-grid { grid-template-columns:1fr 1fr; }
        }
    </style>

    <main class="main-content">
        <header class="header">
            <div class="header-left">
                <h1><i class="fas fa-shopping-cart"></i> Purchase Requisition</h1>
            </div>
            <div class="header-right">
                <button class="btn btn-outline btn-sm" onclick="refreshData()">
                    <i class="fas fa-sync-alt"></i> Refresh
                </button>
                <a href="./product-assignment--" class="btn btn-info btn-sm">
                    <i class="fas fa-tasks"></i> Go Product Assignment
                </a>
            </div>
        </header>

        <div class="stats-row">
            <div class="stat-card" onclick="filterByTab('pending')">
                <div class="stat-icon pending"><i class="fas fa-clock"></i></div>
                <div class="stat-info"><h3 id="statPending">0</h3><p>Pending</p></div>
            </div>
            <div class="stat-card" onclick="filterByTab('approved')">
                <div class="stat-icon approved"><i class="fas fa-check-circle"></i></div>
                <div class="stat-info"><h3 id="statApproved">0</h3><p>Approved</p></div>
            </div>
            <div class="stat-card" onclick="filterByTab('rejected')">
                <div class="stat-icon rejected"><i class="fas fa-times-circle"></i></div>
                <div class="stat-info"><h3 id="statRejected">0</h3><p>Rejected</p></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon total"><i class="fas fa-layer-group"></i></div>
                <div class="stat-info"><h3 id="statTotal">0</h3><p>Total</p></div>
            </div>
        </div>

        <div class="status-tabs">
            <button class="status-tab active" data-tab="all" onclick="filterByTab('all')">
                <i class="fas fa-th-large"></i> All <span class="count" id="tabAll">0</span>
            </button>
            <button class="status-tab" data-tab="pending" onclick="filterByTab('pending')">
                <i class="fas fa-clock"></i> Pending <span class="count" id="tabPending">0</span>
            </button>
            <button class="status-tab" data-tab="approved" onclick="filterByTab('approved')">
                <i class="fas fa-check"></i> Approved <span class="count" id="tabApproved">0</span>
            </button>
            <button class="status-tab" data-tab="rejected" onclick="filterByTab('rejected')">
                <i class="fas fa-times"></i> Rejected <span class="count" id="tabRejected">0</span>
            </button>
        </div>

        <div class="toolbar">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="searchInput" placeholder="Search Branch, Item, Variety..." oninput="debounceSearch()">
            </div>
            <button class="btn btn-outline" onclick="resetFilters()">
                <i class="fas fa-redo"></i> Reset
            </button>
        </div>

        <div class="requisition-container" id="requisitionContainer"></div>
    </main>

    <!-- Image Modal -->
    <div class="image-modal" id="imageModal" onclick="closeImageModal()">
        <div class="image-modal-content" onclick="event.stopPropagation()" style="display:flex;flex-direction:column;max-height:90vh;">
            <div class="image-modal-header" style="flex-shrink:0;">
                <h3 id="modalImageTypeIcon"></h3>
                <button class="image-modal-close" onclick="closeImageModal()"><i class="fas fa-times"></i></button>
            </div>
            <div style="display:flex;align-items:center;gap:6px;padding:6px 16px 0;flex-shrink:0;background:#f8fafc;">
                <button onclick="modalZoom(0.25)" style="width:30px;height:30px;border-radius:7px;border:1px solid var(--light-gray);background:white;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--dark);"><i class="fas fa-search-plus"></i></button>
                <button onclick="modalZoom(-0.25)" style="width:30px;height:30px;border-radius:7px;border:1px solid var(--light-gray);background:white;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--dark);"><i class="fas fa-search-minus"></i></button>
                <button onclick="modalZoomReset()" style="width:30px;height:30px;border-radius:7px;border:1px solid var(--light-gray);background:white;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--dark);"><i class="fas fa-undo"></i></button>
                <span id="modalZoomLabel" style="font-size:11px;color:var(--gray);margin-left:2px;min-width:36px;">100%</span>
                <span style="font-size:10px;color:var(--gray);margin-left:4px;"><i class="fas fa-hand-paper"></i> Drag &nbsp;·&nbsp; Scroll to zoom</span>
            </div>
            <div id="modalImgViewport" style="overflow:hidden;position:relative;flex-shrink:0;height:52vh;background:#f8fafc;cursor:grab;user-select:none;">
                <img id="modalSingleImage" src="" alt="" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(1);transform-origin:center center;max-width:100%;max-height:100%;object-fit:contain;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,.15);transition:none;pointer-events:none;">
            </div>
            <div id="modalThumbStrip" style="display:none;flex-shrink:0;padding:10px 16px;background:#fff;border-top:1px solid var(--light-gray);overflow-x:auto;white-space:nowrap;">
                <div id="modalThumbLoader" style="text-align:center;padding:8px;color:var(--gray);font-size:12px;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>
                <div id="modalThumbList" style="display:inline-flex;gap:8px;align-items:flex-end;"></div>
            </div>
            <div class="image-modal-footer" style="flex-shrink:0;">
                <div id="modalMatchInfo" style="font-size:12px;color:var(--gray);"></div>
                <button class="btn btn-outline" onclick="closeImageModal()"><i class="fas fa-times"></i> Close</button>
            </div>
        </div>
    </div>

    <div class="toast-container" id="toastContainer"></div>
    <div class="loading-overlay" id="loadingOverlay"><div class="spinner"></div></div>
	`);

	// ── Pagination state ───────────────────────────────────────────────────────
	window.poRequisitionData = [];
	window.poCurrentPage     = 1;
	window.poPageSize        = 10;
	window.poHasMore         = false;
	window.poTotalCount      = 0;
	window.poLoadedCount     = 0;
	window.poCurrentSearch   = '';
	window.poCurrentTab      = 'all';
	var approvalReasons  = [];
	var rejectionReasons = [];

	// ── Load page (paginated) ──────────────────────────────────────────────────
	window.loadPage = function(page, append) {
		frappe.call({
			method: 'vgjewellry.product_requisition_for_po.get_product_details_new_format',
			args: { page: page, page_size: window.poPageSize, search: window.poCurrentSearch || '' },
			callback: function(response) {
				if (!response || !response.message) return;
				var msg = response.message;

				if (page === 1) {
					approvalReasons  = msg.excess_reason || [];
					rejectionReasons = msg.reject_reason || [];
					window.poRequisitionData = msg.all_item || [];
				} else {
					window.poRequisitionData = window.poRequisitionData.concat(msg.all_item || []);
				}

				window.poHasMore     = msg.has_more;
				window.poTotalCount  = msg.total_count || 0;
				window.poLoadedCount = window.poRequisitionData.length;
				window.poCurrentPage = page;

				if (append) {
					appendCards(msg.all_item || []);
				} else {
					renderAllCards(window.poRequisitionData);
					if (page === 1 && !window.poCurrentSearch) filterByTab('all');
				}
				renderLoadMoreBtn();
			}
		});
	};

	loadPage(1, false);
	loadStatusCounts();

	// ── Global status counts (non-paginated, for tabs/stats) ──────────────────
	function loadStatusCounts() {
		frappe.call({
			method: 'vgjewellry.product_requisition_for_po.get_po_status_counts',
			callback: function(r) { if (r && r.message) updateStatusTabs(r.message); }
		});
	}

	function updateStatusTabs(c) {
		setText('statTotal',    c.total    || 0);
		setText('statPending',  c.pending  || 0);
		setText('statApproved', c.approved || 0);
		setText('statRejected', c.rejected || 0);
		setText('tabAll',      c.total    || 0);
		setText('tabPending',  c.pending  || 0);
		setText('tabApproved', c.approved || 0);
		setText('tabRejected', c.rejected || 0);
	}

	function setText(id, v) { var el = document.getElementById(id); if (el) el.textContent = v; }

	window.refreshData = function() {
		window.poCurrentPage = 1; window.poRequisitionData = [];
		loadPage(1, false); loadStatusCounts();
	};

	// ── Render all cards (fresh) ───────────────────────────────────────────────
	function renderAllCards(data) {
		var container = document.getElementById('requisitionContainer');
		container.innerHTML = '';
		if (!data || !data.length) {
			container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><h3>No Requisitions Found</h3><p>All items processed or no data available</p></div>';
			return;
		}
		var groups = {}, order = [];
		data.forEach(function(p) {
			var k = String(p.branch);
			if (!groups[k]) { groups[k] = { branch: p.branch, branch_name: p.branch_name, items: [] }; order.push(k); }
			groups[k].items.push(p);
		});
		order.forEach(function(k) { container.appendChild(buildGroupCard(groups[k])); });
		autoLoadImages(data);
		initDatePickers();
	}

	// ── Append cards (load more) ───────────────────────────────────────────────
	function appendCards(newData) {
		var container = document.getElementById('requisitionContainer');
		var oldBtn = document.getElementById('loadMoreBtn');
		if (oldBtn) oldBtn.remove();

		var groups = {}, order = [];
		newData.forEach(function(p) {
			var k = String(p.branch);
			if (!groups[k]) { groups[k] = { branch: p.branch, branch_name: p.branch_name, items: [] }; order.push(k); }
			groups[k].items.push(p);
		});
		order.forEach(function(k) {
			var g = groups[k];
			var existing = container.querySelector('[data-branch="' + g.branch + '"]');
			if (existing) {
				var grid = existing.querySelector('.products-grid');
				g.items.forEach(function(p) { grid.insertAdjacentHTML('beforeend', renderProductCard(p)); });
			} else {
				container.appendChild(buildGroupCard(g));
			}
		});
		autoLoadImages(newData);
		initDatePickers();
	}

	// ── Progress bar + Load More button ───────────────────────────────────────
	function renderLoadMoreBtn() {
		var container = document.getElementById('requisitionContainer');
		var oldBtn = document.getElementById('loadMoreBtn'); if (oldBtn) oldBtn.remove();

		var loaded    = window.poLoadedCount || 0;
		var total     = window.poTotalCount  || 0;
		var pct       = total > 0 ? Math.round((loaded / total) * 100) : 100;
		var remaining = Math.max(total - loaded, 0);

		var wrapper = document.createElement('div');
		wrapper.id = 'loadMoreBtn';
		wrapper.style.cssText = 'padding:18px 0 8px;text-align:center;';
		wrapper.innerHTML =
			'<div style="max-width:420px;margin:0 auto;">' +
				'<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--gray);margin-bottom:6px;">' +
					'<span><i class="fas fa-layer-group" style="margin-right:4px;color:var(--primary);"></i>' +
					'<b style="color:var(--dark);">' + loaded + '</b> of <b style="color:var(--dark);">' + total + '</b> items loaded</span>' +
					'<span style="color:var(--primary);font-weight:600;">' + pct + '%</span>' +
				'</div>' +
				'<div style="background:var(--light-gray);border-radius:99px;height:6px;overflow:hidden;margin-bottom:12px;">' +
					'<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--primary),var(--purple));border-radius:99px;transition:width .4s ease;"></div>' +
				'</div>' +
				(window.poHasMore
					? '<button class="btn btn-outline" style="padding:9px 28px;font-size:12px;border-radius:10px;border:2px solid var(--primary);color:var(--primary);font-weight:600;" onclick="loadPage(window.poCurrentPage+1,true)">' +
					  '<i class="fas fa-chevron-down" style="margin-right:6px;"></i>Load More' +
					  '<span style="margin-left:6px;font-size:11px;color:var(--gray);">(' + remaining + ' remaining)</span></button>'
					: '<div style="font-size:12px;color:var(--success);font-weight:600;"><i class="fas fa-check-circle" style="margin-right:5px;"></i>All items loaded</div>') +
			'</div>';
		container.appendChild(wrapper);
	}

	// ── Build branch group card ───────────────────────────────────────────────
	function buildGroupCard(group) {
		var items = group.items;
		var pending  = items.filter(function(i) { return getItemStatus(i) === 'pending';  }).length;
		var approved = items.filter(function(i) { return getItemStatus(i) === 'approved'; }).length;
		var rejected = items.filter(function(i) { return getItemStatus(i) === 'rejected'; }).length;

		var card = document.createElement('div');
		card.className = 'requisition-card';
		card.setAttribute('data-branch', String(group.branch));
		card.innerHTML =
			'<div class="req-header">' +
				'<div class="req-header-left"><div class="req-info">' +
					'<h3><i class="fas fa-store" style="color:var(--gold);margin-right:6px;"></i>' + (group.branch_name || group.branch) + '</h3>' +
					'<div class="req-meta">' +
						'<span><i class="fas fa-boxes"></i> ' + items.length + ' items</span>' +
						'<span><i class="fas fa-clock"></i> ' + pending + ' pending</span>' +
					'</div>' +
				'</div></div>' +
				'<div class="req-badges"><span class="badge badge-po">Purchase Dept</span></div>' +
			'</div>' +
			'<div class="products-grid">' + items.map(renderProductCard).join('') + '</div>' +
			'<div class="req-footer">' +
				'<div class="req-summary">' +
					'<div class="summary-item"><label>Total</label><span>' + items.length + '</span></div>' +
					'<div class="summary-item"><label><i class="fas fa-clock" style="color:var(--warning)"></i> Pending</label><span class="warning">' + pending + '</span></div>' +
					'<div class="summary-item"><label><i class="fas fa-check-circle" style="color:var(--success)"></i> Approved</label><span class="success">' + approved + '</span></div>' +
					'<div class="summary-item"><label><i class="fas fa-times-circle" style="color:var(--danger)"></i> Rejected</label><span class="danger">' + rejected + '</span></div>' +
				'</div>' +
				'<div class="req-actions"></div>' +
			'</div>';
		return card;
	}

	// ── Product card HTML ──────────────────────────────────────────────────────
	function getItemStatus(p) {
		if (!p.pd_status || p.pd_status === '') return 'pending';
		return p.pd_status; // 'approved' | 'rejected'
	}

	function renderProductCard(p) {
		var status = getItemStatus(p);

		var idealRows = '';
		(p.ideal || []).forEach(function(row) {
			if (!row.b) return;
			var isOwn = row.b === p.branch_name;
			idealRows += '<tr' + (isOwn ? ' class="own-branch"' : '') + '>' +
				'<td>' + row.b + (isOwn ? ' <span style="font-size:8px;color:var(--primary);">★</span>' : '') + '</td>' +
				'<td>' + (row.s || 0) + '</td>' +
				'<td><button class="in-stock-btn" data-branch="' + p.branch + '" data-item="' + p.item_id + '" data-variety="' + p.variety_id + '" data-wt="' + p.weight_range + '" onclick="openBranchStockImages(this)">' + (row.i || 0) + '</button></td>' +
				'<td style="color:' + (row.d > 0 ? 'var(--danger)' : 'var(--success)') + ';font-weight:700;">' + (row.d > 0 ? '+' : '') + row.d + '</td>' +
				'</tr>';
		});

		var managerPanel =
			'<div class="manager-info-panel">' +
				'<h5><i class="fas fa-user-tie"></i> Manager Decision</h5>' +
				'<div class="manager-info-grid">' +
					'<div class="m-info-box"><label>Qty Req</label><span id="po-qty-req-' + p.id + '">' + (p.qty || 0) + '</span></div>' +
					'<div class="m-info-box"><label>Mgr Approved</label><span style="color:var(--success);font-weight:700;">' + (p.qty_manager || '—') + '</span></div>' +
					'<div class="m-info-box"><label>M. Action</label><span style="color:var(--primary);">' + (p.ms || '—') + '</span></div>' +
				'</div>' +
				(p.mar || p.mrr ? '<div class="m-info-remark"><i class="fas fa-tag" style="color:var(--gold);margin-right:4px;"></i><b>Reason:</b> ' + (p.mar || p.mrr) + '</div>' : '') +
				(p.mr  ? '<div class="m-info-remark"><i class="fas fa-comment-alt" style="color:var(--gray);margin-right:4px;"></i>' + p.mr + '</div>' : '') +
				(p.mdd ? '<div class="m-info-remark" style="color:var(--teal);"><i class="fas fa-calendar-check" style="margin-right:4px;"></i><b>M. Delivery:</b> ' + formatDate(p.mdd) + '</div>' : '') +
			'</div>';

		var actionSection = '';
		if (status === 'pending')  actionSection = renderPendingActions(p);
		if (status === 'approved') actionSection = renderApprovedInfo(p);
		if (status === 'rejected') actionSection = renderRejectedInfo(p);

		return (
			'<div class="product-card status-' + status + '" id="po-product-' + p.id + '">' +
				'<div class="image-comparison">' +
					'<div class="image-section">' +
						'<span class="image-label existing">Existing</span>' +
						'<div class="product-image-wrapper" onclick="openExistingStockImages(\'' + p.id + '\')">' +
							'<img id="existing-img-' + p.id + '" src="" alt="" style="display:none;">' +
							'<div id="existing-ph-' + p.id + '" style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;color:var(--gray);"><i class="fas fa-warehouse" style="font-size:22px;margin-bottom:4px;"></i><span style="font-size:9px;">View Stock</span></div>' +
							'<span class="image-zoom"><i class="fas fa-search-plus"></i></span>' +
							(status === 'approved' ? '<div class="status-overlay approved"><i class="fas fa-check"></i> Approved</div>' : '') +
							(status === 'rejected' ? '<div class="status-overlay rejected"><i class="fas fa-times"></i> Rejected</div>' : '') +
						'</div>' +
					'</div>' +
					'<div class="image-section">' +
						'<span class="image-label required">Required</span>' +
						'<div class="product-image-wrapper" onclick="openRequiredImages(\'' + p.id + '\')">' +
							'<img id="required-img-' + p.id + '" src="" alt="" style="display:none;">' +
							'<div id="required-ph-' + p.id + '" style="display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;color:var(--gray);"><i class="fas fa-image" style="font-size:22px;margin-bottom:4px;"></i><span style="font-size:9px;">Select Images</span></div>' +
							'<span class="image-zoom"><i class="fas fa-search-plus"></i></span>' +
						'</div>' +
					'</div>' +
				'</div>' +
				'<div class="product-details">' +
					'<div class="product-header">' +
						'<div class="product-title"><h4>' + p.item + ' — ' + p.variety + '</h4><span>WT: ' + p.weight_range + ' | Size: ' + (p.size || '—') + ' | Jota: ' + (p.jota || '—') + '</span></div>' +
						'<span class="product-status-badge ' + getStatusBadgeClass(status) + '">' + getStatusIcon(status) + ' ' + status + '</span>' +
					'</div>' +
					'<div class="ideal-table-wrapper">' +
						'<h5><i class="fas fa-chart-bar" style="color:var(--info);"></i> Branch Stock Analysis</h5>' +
						'<table class="ideal-table"><thead><tr><th>Branch</th><th>Suggested</th><th>In Stock</th><th>Diff</th></tr></thead><tbody>' + idealRows + '</tbody></table>' +
					'</div>' +
					managerPanel + actionSection +
				'</div>' +
			'</div>'
		);
	}

	function renderPendingActions(p) {
		var qtyOpts = [1,2,3,4,5,6,7,8,9,10].map(function(n) {
			return '<option value="' + n + '"' + (n == (p.qty_manager || 1) ? ' selected' : '') + '>' + n + '</option>';
		}).join('');
		var apOpts = approvalReasons.map(function(r)  { return '<option value="' + r.value + '">' + r.label + '</option>'; }).join('');
		var rejOpts = rejectionReasons.map(function(r) { return '<option value="' + r.value + '">' + r.label + '</option>'; }).join('');
		return (
			'<div class="manager-inputs">' +
				'<div class="input-row three-cols">' +
					'<div class="input-group"><label><i class="fas fa-boxes"></i> Qty Given</label><select id="po-qty-' + p.id + '" class="action-select">' + qtyOpts + '</select></div>' +
					'<div class="input-group"><label><i class="fas fa-tasks"></i> Action <span class="required">*</span></label>' +
						'<select id="po-action-' + p.id + '" class="action-select" onchange="handlePOActionChange(\'' + p.id + '\')">' +
							'<option value="">Select Action</option><option value="Approve">✓ Approve</option><option value="Reject">✗ Reject</option>' +
						'</select>' +
					'</div>' +
					'<div class="input-group"><label><i class="fas fa-calendar-alt"></i> Delivery Date</label>' +
						'<input type="text" id="po-date-' + p.id + '" placeholder="dd/mm/yyyy" autocomplete="off" style="cursor:pointer;" readonly>' +
					'</div>' +
				'</div>' +
				'<div class="reason-section" id="po-approveReason-' + p.id + '"><div class="input-group"><label><i class="fas fa-tag"></i> Approval Reason</label><select id="po-approvalReason-' + p.id + '">' + apOpts + '</select></div></div>' +
				'<div class="reason-section" id="po-rejectReason-' + p.id + '"><div class="input-group"><label><i class="fas fa-exclamation-triangle"></i> Rejection Reason <span class="required">*</span></label><select id="po-rejectionReason-' + p.id + '">' + rejOpts + '</select></div></div>' +
				'<div class="input-row"><div class="input-group full-width"><label><i class="fas fa-comment-alt"></i> Remarks</label><textarea id="po-remarks-' + p.id + '" placeholder="Add remarks..."></textarea></div></div>' +
			'</div>' +
			'<div class="product-actions">' +
				'<button class="action-btn view-img" onclick="openRequiredImages(\'' + p.id + '\')"><i class="fas fa-images"></i> Select Images</button>' +
				'<button class="action-btn save" onclick="savePOProduct(\'' + p.id + '\')"><i class="fas fa-save"></i> Save</button>' +
			'</div>'
		);
	}

	function renderApprovedInfo(p) {
		return '<div class="manager-inputs" style="background:var(--success-light);border-radius:10px;padding:12px;margin-top:8px;">' +
			'<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;"><i class="fas fa-check-circle" style="color:var(--success);font-size:16px;"></i><span style="font-weight:700;color:var(--success);font-size:13px;">Approved by Purchase Dept</span></div>' +
			'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">' +
				'<div style="background:white;padding:6px 4px;border-radius:6px;text-align:center;"><span style="font-size:7px;display:block;color:var(--gray);text-transform:uppercase;">Qty Given</span><span style="font-size:11px;font-weight:700;color:var(--success);">' + (p.qty_given_by_po || p.qty_manager || '—') + '</span></div>' +
				'<div style="background:white;padding:6px 4px;border-radius:6px;text-align:center;"><span style="font-size:7px;display:block;color:var(--gray);text-transform:uppercase;">Qty Req</span><span style="font-size:11px;font-weight:700;">' + (p.qty || 0) + '</span></div>' +
				'<div style="background:white;padding:6px 4px;border-radius:6px;text-align:center;"><span style="font-size:7px;display:block;color:var(--gray);text-transform:uppercase;">PD Delivery</span><span style="font-size:11px;font-weight:700;color:var(--primary);">' + (p.pd_delivery_date ? formatDate(p.pd_delivery_date) : '—') + '</span></div>' +
			'</div>' +
			(p.pd_reason  ? '<div style="margin-top:8px;padding:8px 10px;background:white;border-radius:8px;border-left:3px solid var(--success);"><span style="font-size:10px;color:var(--gray);font-weight:600;">Reason</span><div style="font-size:12px;color:var(--dark);margin-top:2px;">' + p.pd_reason + '</div></div>' : '') +
			(p.pd_remarks ? '<div style="margin-top:8px;padding:8px 10px;background:white;border-radius:8px;"><span style="font-size:10px;color:var(--gray);font-weight:600;"><i class="fas fa-comment-alt"></i> Remarks</span><div style="font-size:12px;color:var(--dark);margin-top:2px;">' + p.pd_remarks + '</div></div>' : '') +
			'</div>';
	}

	function renderRejectedInfo(p) {
		return '<div class="manager-inputs" style="background:var(--danger-light);border-radius:10px;padding:12px;margin-top:8px;">' +
			'<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;"><i class="fas fa-times-circle" style="color:var(--danger);font-size:16px;"></i><span style="font-weight:700;color:var(--danger);font-size:13px;">Rejected by Purchase Dept</span></div>' +
			'<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">' +
				'<div style="background:white;padding:6px 4px;border-radius:6px;text-align:center;"><span style="font-size:7px;display:block;color:var(--gray);text-transform:uppercase;">Qty Requested</span><span style="font-size:11px;font-weight:700;">' + (p.qty || 0) + '</span></div>' +
				'<div style="background:white;padding:6px 4px;border-radius:6px;text-align:center;"><span style="font-size:7px;display:block;color:var(--gray);text-transform:uppercase;">Status</span><span style="font-size:11px;font-weight:700;color:var(--danger);">Rejected</span></div>' +
			'</div>' +
			(p.pd_reason ? '<div style="margin-top:8px;padding:8px 10px;background:white;border-radius:8px;border-left:3px solid var(--danger);"><span style="font-size:10px;color:var(--gray);font-weight:600;">Rejection Reason</span><div style="font-size:12px;color:var(--dark);margin-top:2px;">' + p.pd_reason + '</div></div>' : '') +
			'</div>';
	}

	// ── Auto-load thumbnails ───────────────────────────────────────────────────
	function autoLoadImages(items) {
		(items || []).forEach(function(p) {
			var bId = parseInt(p.branch, 10), iId = parseInt(p.item_id, 10), vId = parseInt(p.variety_id, 10), wt = p.weight_range;
			if (bId && iId && vId && wt) {
				frappe.call({
					method: 'vgjewellry.product_requisition_for_po.get_existing_product_image_manager',
					type: 'POST', args: { branch_id: bId, item_id: iId, variety_id: vId, wt_range: wt },
					callback: function(r) {
						if (!r.message || !Object.keys(r.message).length) return;
						var brs = Object.keys(r.message).sort(function(a, b) { return a == bId ? -1 : b == bId ? 1 : a - b; });
						for (var i = 0; i < brs.length; i++) {
							var imgs = r.message[brs[i]];
							if (imgs && imgs.length && imgs[0].ImagePath1) {
								var el = document.getElementById('existing-img-' + p.id);
								var ph = document.getElementById('existing-ph-'  + p.id);
								if (el) { el.src = imgs[0].ImagePath1.replace(/\\/g, '/'); el.style.display = ''; }
								if (ph) ph.style.display = 'none';
								break;
							}
						}
					}
				});
			}
			frappe.call({
				method: 'vgjewellry.product_requisition_for_po.get_item_image',
				type: 'POST', args: { req_id: p.id },
				callback: function(r) {
					if (!r.message || !r.message.length) return;
					var first = (r.message[0] || '').replace(/\\/g, '/');
					if (!first) return;
					var el = document.getElementById('required-img-' + p.id);
					var ph = document.getElementById('required-ph-'  + p.id);
					if (el) { el.src = first; el.style.display = ''; }
					if (ph) ph.style.display = 'none';
				}
			});
		});
	}

	// ── Date pickers ───────────────────────────────────────────────────────────
	function initDatePickers() {
		function attach() {
			document.querySelectorAll('input[id^="po-date-"]').forEach(function(el) {
				if (el._flatpickr) return;
				var fp = flatpickr(el, {
					dateFormat: 'Y-m-d', altInput: true, altFormat: 'd/m/Y',
					minDate: 'today', allowInput: false, disableMobile: true, clickOpens: true,
					onReady: function(sd, ds, instance) {
						var a = instance.altInput;
						if (a) { a.style.cssText = 'width:100%;padding:7px 9px;border:2px solid var(--light-gray);border-radius:6px;font-size:11px;cursor:pointer;background:white;box-sizing:border-box;'; a.placeholder = 'dd/mm/yyyy'; a.addEventListener('click', function() { fp.open(); }); }
					}
				});
			});
		}
		if (typeof flatpickr !== 'undefined') attach();
		else { var poll = setInterval(function() { if (typeof flatpickr !== 'undefined') { clearInterval(poll); attach(); } }, 50); }
	}

	// ── Action change ──────────────────────────────────────────────────────────
	window.handlePOActionChange = function(id) {
		var aEl = document.getElementById('po-action-'        + id);
		var apEl= document.getElementById('po-approveReason-' + id);
		var rEl = document.getElementById('po-rejectReason-'  + id);
		var qrEl= document.getElementById('po-qty-req-'       + id);
		var qgEl= document.getElementById('po-qty-'           + id);
		var action = aEl ? aEl.value : '';
		if (aEl) aEl.className = 'action-select ' + (action === 'Approve' ? 'approved' : action === 'Reject' ? 'rejected' : '');
		if (apEl) apEl.classList.remove('show');
		if (rEl)  rEl.classList.remove('show');
		var qr = qrEl ? parseInt(qrEl.textContent || '0', 10) : 0;
		var qg = qgEl ? parseInt(qgEl.value || '0', 10) : 0;
		if (action === 'Approve' && qr !== qg) { if (apEl) apEl.classList.add('show'); }
		else if (action === 'Reject') { if (rEl) rEl.classList.add('show'); }
	};

	// ── Save ───────────────────────────────────────────────────────────────────
	window.savePOProduct = function(id) {
		var item = (window.poRequisitionData || []).find(function(i) { return String(i.id) === String(id); });
		if (!item) { frappe.msgprint(__('Item not found')); return; }

		var action        = (document.getElementById('po-action-'          + id) || {}).value || '';
		var qtyGiven      = parseInt(((document.getElementById('po-qty-'   + id) || {}).value || '0'), 10);
		var approveReason = (document.getElementById('po-approvalReason-'  + id) || {}).value || '';
		var rejectReason  = (document.getElementById('po-rejectionReason-' + id) || {}).value || '';
		var remarks       = (document.getElementById('po-remarks-'         + id) || {}).value || '';
		var deliveryDate  = (document.getElementById('po-date-'            + id) || {}).value || '';
		var cardEl        = document.getElementById('po-product-' + id);
		var selectedImages= cardEl ? (cardEl.getAttribute('data-selected-images') || '') : '';

		if (!selectedImages) { frappe.msgprint(__('Please select product images first (click "Select Images").')); return; }
		if (!action)         { frappe.msgprint(__('Please select an action.')); return; }
		var qtyReq = parseInt((item.qty_manager || item.qty || 0), 10);
		if (action === 'Approve' && qtyReq < qtyGiven && !approveReason) { frappe.msgprint(__('Please select an approval reason.')); return; }
		if ((action === 'Approve' && qtyReq > qtyGiven && !rejectReason) || (action === 'Reject' && !rejectReason)) { frappe.msgprint(__('Please select a rejection reason.')); return; }
		if (action === 'Approve' && !deliveryDate) { frappe.msgprint(__('Please select a delivery date.')); return; }

		frappe.call({
			method: 'vgjewellry.product_requisition_for_po.save_product_details',
			type: 'POST',
			args: {
				id: id, used_ids: item.used_ids || '',
				branch_id: item.branch, item_id: item.item_id, variety_id: item.variety_id,
				wt_id: item.wt_id, size_id: item.size_id, jota: item.jota,
				suggested: 0, in_stock: 0, diff: 0,
				qty_req: qtyReq, qty_given: qtyGiven, status: action,
				approve_reason: action === 'Approve' ? approveReason : '',
				reject_reason:  action === 'Reject'  ? rejectReason  : '',
				remarks: remarks, delivery_date: deliveryDate, selected_images: selectedImages
			},
			callback: function(r) {
				if (!r.exc) {
					var found = (window.poRequisitionData || []).find(function(i) { return String(i.id) === String(id); });
					if (found) found.pd_status = action === 'Approve' ? 'approved' : 'rejected';
					var card = document.getElementById('po-product-' + id);
					if (card && card.parentNode) card.parentNode.removeChild(card);
					filterByTab(window.poCurrentTab || 'all');
					loadStatusCounts();
					frappe.show_alert({ message: __('Saved Successfully!'), indicator: 'green' });
				}
			}
		});
	};

	// ── Image modal openers ────────────────────────────────────────────────────
	window.openExistingStockImages = function(itemId) {
		var item = (window.poRequisitionData || []).find(function(i) { return String(i.id) === String(itemId); });
		if (!item) return;
		_openModal('<i class="fas fa-warehouse" style="color:var(--info);margin-right:8px;"></i> Existing Stock — ' + item.item + ' - ' + item.variety, '');
		frappe.call({
			method: 'vgjewellry.product_requisition_for_po.get_existing_product_image',
			type: 'POST', args: { branch_id: parseInt(item.branch, 10), item_id: parseInt(item.item_id, 10), variety_id: parseInt(item.variety_id, 10), wt_range: item.weight_range },
			callback: function(r) { _fillBranchThumbs(r.message, item.branch); }
		});
	};

	window.openBranchStockImages = function(btn) {
		_openModal('<i class="fas fa-store" style="color:var(--info);margin-right:8px;"></i> Branch Stock Images', '');
		frappe.call({
			method: 'vgjewellry.product_requisition_for_po.get_existing_product_image',
			type: 'POST', args: { branch_id: btn.getAttribute('data-branch'), item_id: btn.getAttribute('data-item'), variety_id: btn.getAttribute('data-variety'), wt_range: btn.getAttribute('data-wt') },
			callback: function(r) { _fillBranchThumbs(r.message, btn.getAttribute('data-branch')); }
		});
	};

	window.openRequiredImages = function(itemId) {
		var item = (window.poRequisitionData || []).find(function(i) { return String(i.id) === String(itemId); });
		if (!item) return;
		_openModal(
			'<i class="fas fa-shopping-cart" style="color:var(--purple);margin-right:8px;"></i> Select Images for Supplier — ' + item.item + ' - ' + item.variety,
			'<button class="btn btn-primary btn-sm" onclick="confirmImgSel(\'' + itemId + '\')"><i class="fas fa-check"></i> Confirm Selection</button>'
		);
		var cardEl = document.getElementById('po-product-' + itemId);
		var alreadySel = cardEl ? (cardEl.getAttribute('data-selected-images') || '').split(',').filter(Boolean) : [];

		frappe.call({
			method: 'vgjewellry.product_requisition_for_po.get_item_image',
			type: 'POST', args: { req_id: itemId },
			callback: function(r) {
				var tLoader = document.getElementById('modalThumbLoader');
				var tList   = document.getElementById('modalThumbList');
				var imgEl   = document.getElementById('modalSingleImage');
				if (tLoader) tLoader.style.display = 'none';
				var imgs = r.message || [];
				if (!imgs.length) { if (tList) tList.innerHTML = '<span style="font-size:11px;color:var(--gray);padding:8px;">No images found.</span>'; return; }
				var first = (imgs[0] || '').replace(/\\/g, '/');
				if (imgEl && first) { imgEl.src = first; _mzReset(false); }
				var html = '';
				imgs.forEach(function(imgPath, idx) {
					var clean = (imgPath || '').replace(/\\/g, '/');
					var safe  = clean.replace(/'/g, "\\'");
					var sel   = alreadySel.indexOf(clean) !== -1 || idx === 0;
					var bdr   = sel ? 'border-color:var(--purple);box-shadow:0 0 0 2px var(--purple-light);' : 'border-color:var(--light-gray);';
					html += '<div onclick="toggleImgSel(this,\'' + safe + '\',\'' + itemId + '\')" data-selected="' + (sel ? '1' : '0') + '" style="cursor:pointer;border:2px solid;' + bdr + 'border-radius:8px;overflow:hidden;flex-shrink:0;position:relative;">' +
						(sel ? '<div style="position:absolute;top:2px;right:2px;background:var(--purple);color:white;border-radius:50%;width:16px;height:16px;font-size:9px;display:flex;align-items:center;justify-content:center;z-index:2;"><i class="fas fa-check"></i></div>' : '') +
						'<img src="' + clean + '" style="width:60px;height:60px;object-fit:cover;display:block;">' +
						'<div style="font-size:9px;color:var(--gray);padding:2px 3px;">Image ' + (idx + 1) + '</div></div>';
				});
				if (tList) tList.innerHTML = html;
			}
		});
	};

	window.toggleImgSel = function(el, imgPath, itemId) {
		var imgEl = document.getElementById('modalSingleImage');
		if (imgEl) { imgEl.src = imgPath; _mzReset(false); }
		var isSel = el.getAttribute('data-selected') === '1';
		if (isSel) {
			el.setAttribute('data-selected', '0'); el.style.borderColor = 'var(--light-gray)'; el.style.boxShadow = 'none';
			var tick = el.querySelector('div[style*="position:absolute"]'); if (tick) tick.remove();
		} else {
			el.setAttribute('data-selected', '1'); el.style.borderColor = 'var(--purple)'; el.style.boxShadow = '0 0 0 2px var(--purple-light)';
			var t = document.createElement('div'); t.style.cssText = 'position:absolute;top:2px;right:2px;background:var(--purple);color:white;border-radius:50%;width:16px;height:16px;font-size:9px;display:flex;align-items:center;justify-content:center;z-index:2;'; t.innerHTML = '<i class="fas fa-check"></i>'; el.insertBefore(t, el.firstChild);
		}
	};

	window.confirmImgSel = function(itemId) {
		var list = document.getElementById('modalThumbList'); if (!list) return;
		var sel = []; list.querySelectorAll('div[data-selected="1"]').forEach(function(el) { var img = el.querySelector('img'); if (img) sel.push(img.src); });
		if (!sel.length) { frappe.show_alert({ message: 'Please select at least one image.', indicator: 'orange' }); return; }
		var cardEl = document.getElementById('po-product-' + itemId);
		if (cardEl) cardEl.setAttribute('data-selected-images', sel.join(','));
		closeImageModal();
		frappe.show_alert({ message: sel.length + ' image(s) selected!', indicator: 'green' });
	};

	// ── Modal helpers ──────────────────────────────────────────────────────────
	function _openModal(title, matchHTML) {
		var m=document.getElementById('imageModal'), ic=document.getElementById('modalImageTypeIcon'), img=document.getElementById('modalSingleImage');
		var ts=document.getElementById('modalThumbStrip'), tl=document.getElementById('modalThumbList'), tlo=document.getElementById('modalThumbLoader'), mi=document.getElementById('modalMatchInfo');
		if (ic) ic.innerHTML = title; if (mi) mi.innerHTML = matchHTML || '';
		if (img) img.src = ''; if (ts) ts.style.display = 'block'; if (tl) tl.innerHTML = ''; if (tlo) tlo.style.display = 'block';
		if (m) m.classList.add('active'); _mzReset(false);
	}

	function _fillBranchThumbs(msgMap, currentBId) {
		var tLoader=document.getElementById('modalThumbLoader'), tList=document.getElementById('modalThumbList'), imgEl=document.getElementById('modalSingleImage');
		if (tLoader) tLoader.style.display = 'none';
		if (!msgMap || !Object.keys(msgMap).length) { if (tList) tList.innerHTML = '<span style="font-size:11px;color:var(--gray);padding:8px;">No stock images found.</span>'; return; }
		var branches = Object.keys(msgMap).sort(function(a, b) { return a == currentBId ? -1 : b == currentBId ? 1 : a - b; });
		var html = '', isFirst = true;
		branches.forEach(function(br) {
			var imgs = msgMap[br]; if (!imgs || !imgs.length) return;
			var bc = imgs[0].BranchCode || br, own = br == currentBId ? ' ★' : '';
			html += '<div style="display:inline-flex;flex-direction:column;align-items:center;margin-right:6px;"><span style="font-size:9px;color:var(--gray);font-weight:700;margin-bottom:4px;white-space:nowrap;">' + bc + own + '</span><div style="display:inline-flex;gap:6px;">';
			imgs.forEach(function(obj) {
				var p = obj.ImagePath1.replace(/\\/g, '/'), safe = p.replace(/'/g, "\\'");
				var bdr = isFirst ? 'border-color:var(--primary);box-shadow:0 0 0 2px var(--primary-light);' : 'border-color:var(--light-gray);';
				html += '<div onclick="switchImg(this,\'' + safe + '\')" style="cursor:pointer;border:2px solid;' + bdr + 'border-radius:8px;overflow:hidden;flex-shrink:0;text-align:center;"><img src="' + p + '" style="width:60px;height:60px;object-fit:cover;display:block;"><div style="font-size:9px;color:var(--gray);padding:2px 3px;max-width:60px;overflow:hidden;text-overflow:ellipsis;">' + (obj.LabelNo || '') + '</div></div>';
				if (isFirst && imgEl) imgEl.src = p; isFirst = false;
			});
			html += '</div></div>';
		});
		if (tList) tList.innerHTML = html;
	}

	window.switchImg = function(el, imgPath) {
		var imgEl = document.getElementById('modalSingleImage'); if (imgEl) imgEl.src = imgPath; _mzReset(false);
		var strip = document.getElementById('modalThumbList');
		if (strip) strip.querySelectorAll('div[onclick^="switchImg"]').forEach(function(t) { t.style.borderColor = 'var(--light-gray)'; t.style.boxShadow = 'none'; });
		el.style.borderColor = 'var(--primary)'; el.style.boxShadow = '0 0 0 2px var(--primary-light)';
	};

	// ── Zoom / Pan ─────────────────────────────────────────────────────────────
	var _mz = { scale:1, tx:0, ty:0, dragging:false, startX:0, startY:0, originTx:0, originTy:0, MIN:.5, MAX:8 };
	function _mzApply(an) {
		var img=document.getElementById('modalSingleImage'), lbl=document.getElementById('modalZoomLabel');
		if (!img) return;
		img.style.transition = an ? 'transform .18s ease' : 'none';
		img.style.transform  = 'translate(calc(-50% + ' + _mz.tx + 'px), calc(-50% + ' + _mz.ty + 'px)) scale(' + _mz.scale + ')';
		if (lbl) lbl.textContent = Math.round(_mz.scale * 100) + '%';
	}
	function _mzReset(a) { _mz.scale=1; _mz.tx=0; _mz.ty=0; _mzApply(a); }
	window.modalZoom      = function(d) { _mz.scale = Math.min(_mz.MAX, Math.max(_mz.MIN, _mz.scale+d)); _mzApply(true); };
	window.modalZoomReset = function() { _mzReset(true); };
	(function() {
		function vp() { return document.getElementById('modalImgViewport'); }
		function dn(e) { if (e.button !== undefined && e.button !== 0) return; _mz.dragging=true; _mz.startX=e.clientX||(e.touches&&e.touches[0].clientX)||0; _mz.startY=e.clientY||(e.touches&&e.touches[0].clientY)||0; _mz.originTx=_mz.tx; _mz.originTy=_mz.ty; var v=vp(); if(v) v.style.cursor='grabbing'; e.preventDefault(); }
		function mv(e) { if(!_mz.dragging) return; _mz.tx=_mz.originTx+(e.clientX||(e.touches&&e.touches[0].clientX)||0)-_mz.startX; _mz.ty=_mz.originTy+(e.clientY||(e.touches&&e.touches[0].clientY)||0)-_mz.startY; _mzApply(false); e.preventDefault(); }
		function up() { if(!_mz.dragging) return; _mz.dragging=false; var v=vp(); if(v) v.style.cursor='grab'; }
		document.addEventListener('mousedown',  function(e) { if(vp()&&vp().contains(e.target)) dn(e); });
		document.addEventListener('mousemove',  mv);
		document.addEventListener('mouseup',    up);
		document.addEventListener('touchstart', function(e) { if(vp()&&vp().contains(e.target)) dn(e); }, {passive:false});
		document.addEventListener('touchmove',  mv, {passive:false});
		document.addEventListener('touchend',   up);
		document.addEventListener('wheel', function(e) { var v=vp(); if(!v||!v.contains(e.target)) return; e.preventDefault(); _mz.scale=Math.min(_mz.MAX,Math.max(_mz.MIN,_mz.scale+(e.deltaY<0?.15:-.15))); _mzApply(false); }, {passive:false});
	})();
	window.closeImageModal = function() { var m=document.getElementById('imageModal'); if(m){m.classList.remove('active');_mzReset(false);} };

	// ── Filter ─────────────────────────────────────────────────────────────────
	window.filterByTab = function(tab) {
		window.poCurrentTab = tab;
		document.querySelectorAll('.status-tab').forEach(function(b) { b.classList.toggle('active', b.getAttribute('data-tab') === tab); });
		document.querySelectorAll('.requisition-card').forEach(function(card) {
			var pcs = card.querySelectorAll('.product-card'), vis = 0;
			pcs.forEach(function(pc) { var show = tab === 'all' || pc.classList.contains('status-' + tab); pc.style.display = show ? '' : 'none'; if (show) vis++; });
			card.style.display = vis > 0 ? '' : 'none';
		});
	};

	// ── Search ─────────────────────────────────────────────────────────────────
	var _st = null;
	window.debounceSearch = function() {
		clearTimeout(_st);
		_st = setTimeout(function() {
			var q = (document.getElementById('searchInput').value || '').trim();
			if (q === window.poCurrentSearch) return;
			window.poCurrentSearch = q; window.poCurrentPage = 1; window.poRequisitionData = [];
			loadPage(1, false);
		}, 400);
	};

	window.resetFilters = function() {
		document.getElementById('searchInput').value = '';
		window.poCurrentSearch = ''; window.poCurrentPage = 1; window.poRequisitionData = [];
		loadPage(1, false); filterByTab('all');
	};

	// ── Utils ──────────────────────────────────────────────────────────────────
	function formatDate(d) { if (!d) return ''; return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }); }
	function getStatusBadgeClass(s) { return { pending:'badge-pending', approved:'badge-approved', rejected:'badge-rejected' }[s] || 'badge-pending'; }
	function getStatusIcon(s) { return { pending:'<i class="fas fa-clock"></i>', approved:'<i class="fas fa-check-circle"></i>', rejected:'<i class="fas fa-times-circle"></i>' }[s] || '<i class="fas fa-circle"></i>'; }
};
