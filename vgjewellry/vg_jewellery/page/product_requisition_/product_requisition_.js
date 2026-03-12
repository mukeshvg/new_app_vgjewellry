frappe.pages['product-requisition-'].on_page_load = function(wrapper) {
	// Load Font Awesome from CDN with absolute webfont URLs (avoids local 404s)
	if (!document.getElementById('fa-cdn-link')) {
		var faLink = document.createElement('link');
		faLink.id = 'fa-cdn-link';
		faLink.rel = 'stylesheet';
		faLink.crossOrigin = 'anonymous';
		faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
		document.head.appendChild(faLink);
	}
	// Load flatpickr CSS + JS via CDN (once)
	if (!document.getElementById('flatpickr-css-cdn')) {
		var fpCss = document.createElement('link');
		fpCss.id  = 'flatpickr-css-cdn';
		fpCss.rel = 'stylesheet';
		fpCss.href = 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css';
		document.head.appendChild(fpCss);
	}
	if (!document.getElementById('flatpickr-js-cdn')) {
		var fpScript = document.createElement('script');
		fpScript.id  = 'flatpickr-js-cdn';
		fpScript.src = 'https://cdn.jsdelivr.net/npm/flatpickr';
		document.head.appendChild(fpScript);
	}
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Product Requisition New',
		single_column: true
	});
	$(wrapper).html(`
	 <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

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
            --cyan: #06b6d4;
            --cyan-light: #cffafe;
            --teal: #14b8a6;
            --teal-light: #ccfbf1;
            --dark: #1e293b;
            --gray: #64748b;
            --light-gray: #e2e8f0;
            --lighter-gray: #f1f5f9;
            --bg: #f8fafc;
            --white: #ffffff;
            --shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }

        body {
            font-family: 'Inter', sans-serif;
            background: var(--bg);
            color: var(--dark);
            min-height: 100vh;
            font-size: 14px;
        }

        /* Sidebar */
        .sidebar {
            position: fixed;
            left: 0;
            top: 0;
            width: 260px;
            height: 100vh;
            background: linear-gradient(180deg, #1e1b4b 0%, #312e81 100%);
            padding: 20px 15px;
            z-index: 1000;
            transition: transform 0.3s ease;
            overflow-y: auto;
        }

        .sidebar::-webkit-scrollbar {
            width: 5px;
        }

        .sidebar::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.2);
            border-radius: 5px;
        }

        .sidebar-header {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 15px 25px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            margin-bottom: 20px;
        }

        .sidebar-logo {
            width: 45px;
            height: 45px;
            border-radius: 12px;
            background: linear-gradient(135deg, var(--gold), #fbbf24);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            color: white;
        }

        .sidebar-brand h2 {
            color: white;
            font-size: 18px;
            font-weight: 700;
        }

        .sidebar-brand span {
            color: rgba(255,255,255,0.5);
            font-size: 11px;
        }

        .nav-menu {
            list-style: none;
        }

        .nav-section {
            color: rgba(255,255,255,0.4);
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin: 25px 0 10px;
            padding-left: 15px;
        }

        .nav-item {
            margin-bottom: 4px;
        }

        .nav-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 11px 15px;
            color: rgba(255,255,255,0.7);
            text-decoration: none;
            border-radius: 10px;
            transition: all 0.2s ease;
            font-size: 13px;
            font-weight: 500;
        }

        .nav-link:hover, .nav-link.active {
            background: rgba(255,255,255,0.1);
            color: white;
        }

        .nav-link.active {
            background: var(--primary);
        }

        .nav-link i {
            width: 20px;
            text-align: center;
        }

        .nav-badge {
            margin-left: auto;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 11px;
            font-weight: 600;
        }

        .nav-badge.danger { background: var(--danger); color: white; }
        .nav-badge.success { background: var(--success); color: white; }
        .nav-badge.warning { background: var(--warning); color: white; }
        .nav-badge.teal { background: var(--teal); color: white; }

        /* Main Content */
        .main-content {
            margin-left: 0px;
            padding: 20px 25px;
            min-height: 100vh;
        }

        /* Header */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            flex-wrap: wrap;
            gap: 15px;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .menu-toggle {
            display: none;
            width: 40px;
            height: 40px;
            border-radius: 10px;
            border: none;
            background: white;
            color: var(--dark);
            cursor: pointer;
            box-shadow: var(--shadow);
        }

        .header-left h1 {
            font-size: 24px;
            font-weight: 800;
            color: var(--dark);
        }

        .header-left h1 i {
            color: var(--gold);
            margin-right: 10px;
        }

        .header-right {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .header-btn {
            width: 42px;
            height: 42px;
            border-radius: 10px;
            border: none;
            background: white;
            color: var(--gray);
            cursor: pointer;
            box-shadow: var(--shadow);
            position: relative;
            transition: all 0.2s ease;
        }

        .header-btn:hover {
            color: var(--primary);
            transform: translateY(-2px);
        }

        .header-btn .badge {
            position: absolute;
            top: -4px;
            right: -4px;
            min-width: 18px;
            height: 18px;
            background: var(--danger);
            color: white;
            border-radius: 9px;
            font-size: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .user-profile {
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 6px 16px 6px 6px;
            background: white;
            border-radius: 30px;
            box-shadow: var(--shadow);
        }

        .user-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary), var(--purple));
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 700;
            font-size: 13px;
        }

        .user-info h4 {
            font-size: 13px;
            font-weight: 600;
        }

        .user-info span {
            font-size: 11px;
            color: var(--gray);
        }

        /* Stats Row */
        .stats-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(155px, 1fr));
            gap: 12px;
            margin-bottom: 20px;
        }

        .stat-card {
            background: white;
            border-radius: 12px;
            padding: 16px;
            box-shadow: var(--shadow);
            display: flex;
            align-items: center;
            gap: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 2px solid transparent;
        }

        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: var(--shadow-md);
        }

        .stat-card.active {
            border-color: var(--primary);
        }

        .stat-icon {
            width: 42px;
            height: 42px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
        }

        .stat-icon.pending { background: var(--warning-light); color: var(--warning); }
        .stat-icon.approved { background: var(--success-light); color: var(--success); }
        .stat-icon.rejected { background: var(--danger-light); color: var(--danger); }
        .stat-icon.delivered { background: var(--teal-light); color: var(--teal); }

        .stat-info h3 {
            font-size: 20px;
            font-weight: 800;
        }

        .stat-info p {
            font-size: 10px;
            color: var(--gray);
        }

        /* Status Tabs */
        .status-tabs {
            display: flex;
            gap: 4px;
            background: white;
            padding: 5px;
            border-radius: 10px;
            box-shadow: var(--shadow);
            margin-bottom: 15px;
            flex-wrap: wrap;
            overflow-x: auto;
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
            transition: all 0.2s ease;
            white-space: nowrap;
        }

        .status-tab:hover {
            background: var(--lighter-gray);
        }

        .status-tab.active {
            background: var(--primary);
            color: white;
        }

        .status-tab .count {
            padding: 1px 6px;
            border-radius: 6px;
            font-size: 9px;
            background: rgba(0,0,0,0.1);
        }

        .status-tab.active .count {
            background: rgba(255,255,255,0.2);
        }

        /* Toolbar */
        .toolbar {
            background: white;
            border-radius: 12px;
            padding: 12px 15px;
            margin-bottom: 15px;
            box-shadow: var(--shadow);
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            align-items: center;
        }

        .search-box {
            flex: 1;
            min-width: 220px;
            position: relative;
        }

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
        }

        .search-box input:focus {
            outline: none;
            border-color: var(--primary);
        }

        .filter-select {
            padding: 9px 12px;
            border: 2px solid var(--light-gray);
            border-radius: 8px;
            font-size: 12px;
            cursor: pointer;
            background: white;
            min-width: 120px;
        }

        .btn {
            padding: 9px 16px;
            border-radius: 8px;
            border: none;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            transition: all 0.2s ease;
        }

        .btn-primary { background: var(--primary); color: white; }
        .btn-primary:hover { background: var(--primary-dark); }
        .btn-success { background: var(--success); color: white; }
        .btn-danger { background: var(--danger); color: white; }
        .btn-warning { background: var(--warning); color: white; }
        .btn-teal { background: var(--teal); color: white; }
        .btn-outline { background: white; border: 2px solid var(--light-gray); color: var(--gray); }
        .btn-outline:hover { border-color: var(--primary); color: var(--primary); }
        .btn-sm { padding: 7px 12px; font-size: 11px; }

        /* Requisition Container */
        .requisition-container {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        /* Requisition Card */
        .requisition-card {
            background: white;
            border-radius: 14px;
            box-shadow: var(--shadow);
            overflow: hidden;
        }

        .req-header {
            padding: 15px 18px;
            background: linear-gradient(135deg, var(--lighter-gray), white);
            border-bottom: 1px solid var(--light-gray);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
        }

        .req-header-left {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .req-checkbox {
            width: 20px;
            height: 20px;
            border: 2px solid var(--light-gray);
            border-radius: 5px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        }

        .req-checkbox.checked {
            background: var(--primary);
            border-color: var(--primary);
        }

        .req-checkbox.checked::after {
            content: '\f00c';
            font-family: 'Font Awesome 6 Free';
            font-weight: 900;
            color: white;
            font-size: 10px;
        }

        .req-info h3 {
            font-size: 16px;
            font-weight: 700;
            color: var(--primary);
        }

        .req-meta {
            display: flex;
            gap: 12px;
            margin-top: 4px;
            flex-wrap: wrap;
        }

        .req-meta span {
            font-size: 11px;
            color: var(--gray);
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .req-meta span i {
            color: var(--gold);
            font-size: 10px;
        }

        .req-badges {
            display: flex;
            gap: 6px;
        }

        .badge {
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
        }

        .badge-pending { background: var(--warning-light); color: var(--warning); }
        .badge-approved { background: var(--success-light); color: var(--success); }
        .badge-rejected { background: var(--danger-light); color: var(--danger); }
        .badge-delivered { background: var(--teal-light); color: var(--teal); }
        .badge-high { background: var(--danger-light); color: var(--danger); }
        .badge-medium { background: var(--warning-light); color: var(--warning); }
        .badge-low { background: var(--success-light); color: var(--success); }

        /* Products Grid */
        .products-grid {
            padding: 15px;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
            gap: 15px;
        }

        /* Product Card */
        .product-card {
            background: var(--lighter-gray);
            border-radius: 14px;
            overflow: hidden;
            transition: all 0.3s ease;
            position: relative;
            border: 2px solid transparent;
        }

        .product-card:hover {
            box-shadow: var(--shadow-md);
        }

        .product-card.status-approved {
            border-color: var(--success);
        }

        .product-card.status-rejected {
            border-color: var(--danger);
        }

        .product-card.status-delivered {
            border-color: var(--teal);
        }

        .product-card.removed {
            display: none;
        }

        /* Remove Button */
        .remove-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            width: 26px;
            height: 26px;
            border-radius: 50%;
            background: var(--danger);
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            z-index: 10;
            opacity: 0;
            transition: all 0.2s ease;
        }

        .product-card:hover .remove-btn {
            opacity: 1;
        }

        /* Image Comparison */
        .image-comparison {
            display: grid;
            grid-template-columns: 1fr 1fr;
            background: white;
        }

        .image-section {
            padding: 10px;
            text-align: center;
            position: relative;
        }

        .image-section:first-child {
            border-right: 2px dashed var(--light-gray);
        }

        .image-label {
            position: absolute;
            top: 6px;
            left: 6px;
            padding: 2px 6px;
            border-radius: 8px;
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
            z-index: 5;
        }

        .image-label.existing {
            background: var(--info-light);
            color: var(--info);
        }

        .image-label.required {
            background: var(--purple-light);
            color: var(--purple);
        }

        .product-image-wrapper {
            width: 100%;
            height: 100px;
            border-radius: 8px;
            overflow: hidden;
            background: var(--lighter-gray);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            position: relative;
            margin-top: 14px;
        }

        .product-image-wrapper img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
        }

        .product-image-wrapper:hover img {
            transform: scale(1.05);
        }

        .image-zoom {
            position: absolute;
            bottom: 5px;
            right: 5px;
            width: 22px;
            height: 22px;
            background: rgba(0,0,0,0.6);
            color: white;
            border-radius: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            opacity: 0;
            transition: opacity 0.2s;
        }

        .product-image-wrapper:hover .image-zoom {
            opacity: 1;
        }

        .stock-badge {
            position: absolute;
            bottom: 5px;
            left: 5px;
            padding: 2px 6px;
            border-radius: 6px;
            font-size: 8px;
            font-weight: 600;
            background: white;
            box-shadow: var(--shadow);
        }

        .stock-badge.in-stock { color: var(--success); }
        .stock-badge.low-stock { color: var(--warning); }
        .stock-badge.no-stock { color: var(--danger); }

        /* Status Overlay on Image */
        .status-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 9px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: var(--shadow-md);
        }

        .status-overlay.approved { background: rgba(16, 185, 129, 0.95); color: white; }
        .status-overlay.rejected { background: rgba(239, 68, 68, 0.95); color: white; }
        .status-overlay.delivered { background: rgba(20, 184, 166, 0.95); color: white; }

        /* Match Indicator */
        .match-indicator {
            padding: 5px 8px;
            text-align: center;
            font-size: 9px;
            font-weight: 600;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
        }

        .match-indicator.match { background: var(--success-light); color: var(--success); }
        .match-indicator.partial { background: var(--warning-light); color: var(--warning); }

        /* Product Details */
        .product-details {
            padding: 12px;
        }

        .product-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
        }

        .product-title h4 {
            font-size: 13px;
            font-weight: 700;
            color: var(--dark);
            margin-bottom: 2px;
        }

        .product-title span {
            font-size: 10px;
            color: var(--gray);
        }

        .product-status-badge {
            padding: 3px 8px;
            border-radius: 10px;
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
        }

        /* Specs Grid */
        .specs-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 5px;
            margin-bottom: 10px;
        }

        .spec-box {
            background: white;
            padding: 6px 4px;
            border-radius: 6px;
            text-align: center;
        }

        .spec-box label {
            display: block;
            font-size: 7px;
            color: var(--gray);
            text-transform: uppercase;
            letter-spacing: 0.2px;
            margin-bottom: 1px;
        }

        .spec-box span {
            font-size: 11px;
            font-weight: 700;
            color: var(--dark);
        }

        .spec-box span.ai { color: var(--info); }
        .spec-box span.zero { color: var(--danger); }
        .spec-box span.low { color: var(--warning); }
        .spec-box span.good { color: var(--success); }

        .ai-tag {
            background: linear-gradient(135deg, var(--primary), var(--info));
            color: white;
            padding: 1px 3px;
            border-radius: 3px;
            font-size: 6px;
            margin-left: 2px;
        }

        /* Manager Input Section */
        .manager-inputs {
            background: white;
            border-radius: 10px;
            padding: 10px;
            margin-bottom: 10px;
        }

        .input-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-bottom: 8px;
        }

        .input-row.three-cols {
            grid-template-columns: 1fr 1fr 1fr;
        }

        .input-group {
            display: flex;
            flex-direction: column;
            gap: 3px;
        }

        .input-group label {
            font-size: 9px;
            font-weight: 600;
            color: var(--gray);
            text-transform: uppercase;
            display: flex;
            align-items: center;
            gap: 3px;
        }

        .input-group label i {
            color: var(--primary);
            font-size: 10px;
        }

        .input-group label .required {
            color: var(--danger);
        }

        .input-group input,
        .input-group textarea,
        .input-group select {
            padding: 7px 9px;
            border: 2px solid var(--light-gray);
            border-radius: 6px;
            font-size: 11px;
            transition: all 0.2s ease;
        }

        .input-group input:focus,
        .input-group textarea:focus,
        .input-group select:focus {
            outline: none;
            border-color: var(--primary);
        }

        .input-group textarea {
            resize: none;
            min-height: 50px;
        }

        .input-group select {
            cursor: pointer;
            background: white;
        }

        /* flatpickr altInput inherits full width */
        .input-group .flatpickr-input.flatpickr-alt-input {
            width: 100%;
            box-sizing: border-box;
        }
        .input-group input.flatpickr-input:not(.flatpickr-alt-input) {
            display: none !important;
        }

        /* Action Select Styling */
        .action-select {
            font-weight: 600;
        }

        .action-select.approved {
            border-color: var(--success);
            background: var(--success-light);
            color: var(--success);
        }

        .action-select.rejected {
            border-color: var(--danger);
            background: var(--danger-light);
            color: var(--danger);
        }

        .action-select.pending {
            border-color: var(--warning);
            background: var(--warning-light);
            color: var(--warning);
        }

        /* Reason Select */
        .reason-section {
            display: none;
            margin-top: 8px;
        }

        .reason-section.show {
            display: block;
        }

        .reason-badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 15px;
            font-size: 10px;
            font-weight: 600;
            margin-right: 5px;
            margin-bottom: 5px;
        }

        .reason-badge.low-season { background: #e0f2fe; color: #0284c7; }
        .reason-badge.over-stock { background: #fef3c7; color: #d97706; }
        .reason-badge.high-demand { background: #dcfce7; color: #16a34a; }
        .reason-badge.budget { background: #fce7f3; color: #db2777; }
        .reason-badge.quality { background: #f3e8ff; color: #9333ea; }

        .full-width {
            grid-column: 1 / -1;
        }

        /* Action Buttons */
        .product-actions {
            display: flex;
            gap: 5px;
            flex-wrap: wrap;
        }

        .action-btn {
            padding: 7px 10px;
            border-radius: 6px;
            border: none;
            font-size: 10px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 4px;
            transition: all 0.2s ease;
        }

        .action-btn:hover {
            transform: translateY(-1px);
        }

        .action-btn.save { background: var(--primary); color: white; }
        .action-btn.deliver { background: var(--teal); color: white; }
        .action-btn.compare { background: var(--info); color: white; }
        .action-btn.undo { background: var(--gray); color: white; }

        /* Delivery Info */
        .delivery-info {
            background: var(--teal-light);
            border-radius: 8px;
            padding: 10px;
            margin-top: 8px;
            font-size: 10px;
        }

        .delivery-info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
        }

        .delivery-info-row:last-child {
            margin-bottom: 0;
        }

        .delivery-info-row label {
            color: var(--teal);
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .delivery-info-row span {
            color: var(--dark);
            font-weight: 500;
        }

        /* Approval Info */
        .approval-info {
            background: var(--success-light);
            border-radius: 8px;
            padding: 10px;
            margin-top: 8px;
            font-size: 10px;
        }

        .approval-info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
        }

        .approval-info-row:last-child {
            margin-bottom: 0;
        }

        .approval-info-row label {
            color: var(--success);
            font-weight: 600;
        }

        .approval-info-row span {
            color: var(--dark);
            font-weight: 500;
        }

        /* Rejection Info */
        .rejection-info {
            background: var(--danger-light);
            border-radius: 8px;
            padding: 10px;
            margin-top: 8px;
            font-size: 10px;
            color: var(--danger);
        }

        /* Card Footer */
        .req-footer {
            padding: 12px 18px;
            background: var(--lighter-gray);
            border-top: 1px solid var(--light-gray);
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
        }

        .req-summary {
            display: flex;
            gap: 18px;
        }

        .summary-item {
            text-align: center;
        }

        .summary-item label {
            display: block;
            font-size: 8px;
            color: var(--gray);
            text-transform: uppercase;
        }

        .summary-item span {
            font-size: 15px;
            font-weight: 800;
        }

        .summary-item span.success { color: var(--success); }
        .summary-item span.warning { color: var(--warning); }
        .summary-item span.danger { color: var(--danger); }
        .summary-item span.teal { color: var(--teal); }

        .req-actions {
            display: flex;
            gap: 6px;
        }

        /* Image Modal */
        .image-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 3000;
            padding: 20px;
        }

        .image-modal.active {
            display: flex;
        }

        .image-modal-content {
            background: white;
            border-radius: 16px;
            max-width: 80vw;
            width: 80vw;
            max-height: 85vh;
            overflow: hidden;
            margin: 0 auto;
            animation: modalZoom 0.3s ease;
        }

        @keyframes modalZoom {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }

        .image-modal-header {
            padding: 15px 20px;
            border-bottom: 1px solid var(--light-gray);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .image-modal-header h3 {
            font-size: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .image-modal-close {
            width: 34px;
            height: 34px;
            border-radius: 8px;
            border: none;
            background: var(--lighter-gray);
            cursor: pointer;
            font-size: 14px;
        }

        .image-comparison-full {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            padding: 20px;
        }

        .image-full-section {
            text-align: center;
        }

        .image-full-section h4 {
            font-size: 12px;
            margin-bottom: 10px;
            color: var(--gray);
        }

        .image-full-wrapper {
            width: 100%;
            height: 280px;
            border-radius: 12px;
            overflow: hidden;
            background: var(--lighter-gray);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .image-full-wrapper img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }

        .image-modal-footer {
            padding: 15px 20px;
            background: var(--lighter-gray);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        /* Standard Modal */
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            padding: 20px;
        }

        .modal-overlay.active {
            display: flex;
        }

        .modal {
            background: white;
            border-radius: 14px;
            width: 100%;
            max-width: 420px;
            overflow: hidden;
            animation: modalSlide 0.3s ease;
        }

        @keyframes modalSlide {
            from { transform: translateY(-30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
            padding: 15px 18px;
            border-bottom: 1px solid var(--light-gray);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .modal-header h3 {
            font-size: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .modal-close {
            width: 30px;
            height: 30px;
            border-radius: 6px;
            border: none;
            background: var(--lighter-gray);
            cursor: pointer;
        }

        .modal-body {
            padding: 18px;
        }

        .modal-footer {
            padding: 12px 18px;
            background: var(--lighter-gray);
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }

        .form-group {
            margin-bottom: 12px;
        }

        .form-group label {
            display: block;
            font-size: 11px;
            font-weight: 600;
            margin-bottom: 5px;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 9px 11px;
            border: 2px solid var(--light-gray);
            border-radius: 8px;
            font-size: 12px;
        }

        .form-group textarea {
            min-height: 70px;
            resize: vertical;
        }

        /* Toast */
        .toast-container {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 4000;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .toast {
            padding: 12px 18px;
            border-radius: 10px;
            color: white;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
            box-shadow: var(--shadow-lg);
            animation: toastSlide 0.3s ease;
            min-width: 260px;
            font-size: 12px;
        }

        @keyframes toastSlide {
            from { transform: translateX(100px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }

        .toast.success { background: linear-gradient(135deg, var(--success), #059669); }
        .toast.error { background: linear-gradient(135deg, var(--danger), #dc2626); }
        .toast.warning { background: linear-gradient(135deg, var(--warning), #d97706); }
        .toast.info { background: linear-gradient(135deg, var(--info), #2563eb); }

        /* Loading */
        .loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255,255,255,0.9);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 5000;
        }

        .loading-overlay.active {
            display: flex;
        }

        .spinner {
            width: 45px;
            height: 45px;
            border: 4px solid var(--light-gray);
            border-top-color: var(--primary);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        /* Sidebar Overlay */
        .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 999;
            display: none;
        }

        .sidebar-overlay.active {
            display: block;
        }

        /* Empty State */
        .empty-state {
            text-align: center;
            padding: 50px 20px;
        }

        .empty-state i {
            font-size: 45px;
            color: var(--light-gray);
            margin-bottom: 12px;
        }

        .empty-state h3 {
            font-size: 16px;
            color: var(--dark);
            margin-bottom: 5px;
        }

        .empty-state p {
            color: var(--gray);
            font-size: 12px;
        }

        /* Responsive */
        @media (max-width: 1200px) {
            .sidebar {
                transform: translateX(-100%);
            }

            .sidebar.active {
                transform: translateX(0);
            }

            .main-content {
                margin-left: 0;
            }

            .menu-toggle {
                display: flex;
                align-items: center;
                justify-content: center;
            }
        }

        @media (max-width: 768px) {
            .products-grid {
                grid-template-columns: 1fr;
            }

            .specs-grid {
                grid-template-columns: repeat(2, 1fr);
            }

            .input-row {
                grid-template-columns: 1fr;
            }

            .input-row.three-cols {
                grid-template-columns: 1fr;
            }

            .image-comparison-full {
                grid-template-columns: 1fr;
            }

            .req-summary {
                flex-wrap: wrap;
                gap: 10px;
            }
        }
    </style>
</head>
<body>
    <!-- Sidebar Overlay -->
    <div class="sidebar-overlay" id="sidebarOverlay" onclick="toggleSidebar()"></div>

    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar" style="display:none">
        <div class="sidebar-header">
            <div class="sidebar-logo">
                <i class="fas fa-gem"></i>
            </div>
            <div class="sidebar-brand">
                <h2>JewelStock</h2>
                <span>Manager Portal</span>
            </div>
        </div>

        <ul class="nav-menu">
            <li class="nav-section">Overview</li>
            <li class="nav-item">
                <a href="#" class="nav-link active">
                    <i class="fas fa-th-large"></i>
                    Dashboard
                </a>
            </li>

            <li class="nav-section">Approvals</li>
            <li class="nav-item">
                <a href="#" class="nav-link" onclick="filterByTab('pending')">
                    <i class="fas fa-clock"></i>
                    Pending
                    <span class="nav-badge danger" id="navPending">8</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="#" class="nav-link" onclick="filterByTab('approved')">
                    <i class="fas fa-check-circle"></i>
                    Approved
                    <span class="nav-badge success" id="navApproved">5</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="#" class="nav-link" onclick="filterByTab('delivered')">
                    <i class="fas fa-truck"></i>
                    Delivered
                    <span class="nav-badge teal" id="navDelivered">3</span>
                </a>
            </li>
            <li class="nav-item">
                <a href="#" class="nav-link" onclick="filterByTab('rejected')">
                    <i class="fas fa-times-circle"></i>
                    Rejected
                </a>
            </li>

            <li class="nav-section">Reports</li>
            <li class="nav-item">
                <a href="#" class="nav-link">
                    <i class="fas fa-chart-bar"></i>
                    Analytics
                </a>
            </li>
            <li class="nav-item">
                <a href="#" class="nav-link">
                    <i class="fas fa-cog"></i>
                    Settings
                </a>
            </li>
        </ul>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
        <!-- Header -->
        <header class="header" style="display:none">
            <div class="header-left">
                <button class="menu-toggle" onclick="toggleSidebar()">
                    <i class="fas fa-bars"></i>
                </button>
                <h1><i class="fas fa-clipboard-check"></i> Requisition Manager</h1>
            </div>
            <div class="header-right">
                <button class="header-btn" onclick="refreshData()">
                    <i class="fas fa-sync-alt"></i>
                </button>
                <button class="header-btn">
                    <i class="fas fa-bell"></i>
                    <span class="badge">5</span>
                </button>
                <div class="user-profile">
                    <div class="user-avatar">RM</div>
                    <div class="user-info">
                        <h4>Rajesh Mehta</h4>
                        <span>Manager</span>
                    </div>
                </div>
            </div>
        </header>

        <!-- Stats Row -->
        <div class="stats-row">
            <div class="stat-card" onclick="filterByTab('pending')">
                <div class="stat-icon pending"><i class="fas fa-clock"></i></div>
                <div class="stat-info">
                    <h3 id="statPending">8</h3>
                    <p>Pending</p>
                </div>
            </div>
            <div class="stat-card" onclick="filterByTab('approved')">
                <div class="stat-icon approved"><i class="fas fa-check-circle"></i></div>
                <div class="stat-info">
                    <h3 id="statApproved">5</h3>
                    <p>Approved</p>
                </div>
            </div>
            <div class="stat-card" onclick="filterByTab('delivered')">
                <div class="stat-icon delivered"><i class="fas fa-truck"></i></div>
                <div class="stat-info">
                    <h3 id="statDelivered">3</h3>
                    <p>Delivered</p>
                </div>
            </div>
            <div class="stat-card" onclick="filterByTab('rejected')">
                <div class="stat-icon rejected"><i class="fas fa-times-circle"></i></div>
                <div class="stat-info">
                    <h3 id="statRejected">2</h3>
                    <p>Rejected</p>
                </div>
            </div>
        </div>

        <!-- Status Tabs -->
        <div class="status-tabs">
            <button class="status-tab active" data-tab="all" onclick="filterByTab('all')">
                <i class="fas fa-th-large"></i> All <span class="count" id="tabAll">22</span>
            </button>
            <button class="status-tab" data-tab="pending" onclick="filterByTab('pending')">
                <i class="fas fa-clock"></i> Pending <span class="count" id="tabPending">8</span>
            </button>
            <button class="status-tab" data-tab="approved" onclick="filterByTab('approved')">
                <i class="fas fa-check"></i> Approved <span class="count" id="tabApproved">5</span>
            </button>
            <button class="status-tab" data-tab="delivered" onclick="filterByTab('delivered')">
                <i class="fas fa-truck"></i> Delivered <span class="count" id="tabDelivered">3</span>
            </button>
            <button class="status-tab" data-tab="rejected" onclick="filterByTab('rejected')">
                <i class="fas fa-times"></i> Rejected <span class="count" id="tabRejected">2</span>
            </button>
        </div>

        <!-- Toolbar -->
        <div class="toolbar">
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="searchInput" placeholder="Search PR No, Item, Variety..." oninput="debounceSearch()">
            </div>
            <!--<select class="filter-select" id="itemFilter" onchange="applyFilters()">
                <option value="">All Items</option>
                <option value="RING">Ring</option>
                <option value="BALI">Bali</option>
                <option value="NECKLACE">Necklace</option>
                <option value="BANGLES">Bangles</option>
            </select>
            <select class="filter-select" id="matchFilter" onchange="applyFilters()">
                <option value="">All Match</option>
                <option value="match">Matching</option>
            </select>-->
            <button class="btn btn-outline" onclick="resetFilters()">
                <i class="fas fa-redo"></i> Reset
            </button>
            <!--<button class="btn btn-success" onclick="approveAllMatching()">
                <i class="fas fa-check-double"></i> Approve Matching
            </button>-->
        </div>

        <!-- Requisitions Container -->
        <div class="requisition-container" id="requisitionContainer">
            <!-- Cards rendered here -->
        </div>
    </main>

    <!-- Image Modal -->
    <div class="image-modal" id="imageModal" onclick="closeImageModal()">
        <div class="image-modal-content" onclick="event.stopPropagation()" style="display:flex; flex-direction:column; max-height:90vh;">
            <div class="image-modal-header" style="flex-shrink:0;">
                <h3 id="modalImageTypeIcon"></h3>
                <button class="image-modal-close" onclick="closeImageModal()"><i class="fas fa-times"></i></button>
            </div>
            <!-- Zoom controls -->
            <div style="display:flex;align-items:center;gap:6px;padding:6px 16px 0;flex-shrink:0;background:#f8fafc;">
                <button onclick="modalZoom(0.25)" title="Zoom In"
                    style="width:30px;height:30px;border-radius:7px;border:1px solid var(--light-gray);background:white;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;color:var(--dark);">
                    <i class="fas fa-search-plus"></i></button>
                <button onclick="modalZoom(-0.25)" title="Zoom Out"
                    style="width:30px;height:30px;border-radius:7px;border:1px solid var(--light-gray);background:white;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;color:var(--dark);">
                    <i class="fas fa-search-minus"></i></button>
                <button onclick="modalZoomReset()" title="Reset"
                    style="width:30px;height:30px;border-radius:7px;border:1px solid var(--light-gray);background:white;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;color:var(--dark);">
                    <i class="fas fa-undo"></i></button>
                <span id="modalZoomLabel" style="font-size:11px;color:var(--gray);margin-left:2px;min-width:36px;">100%</span>
                <span style="font-size:10px;color:var(--gray);margin-left:4px;"><i class="fas fa-hand-paper"></i> Drag to pan &nbsp;·&nbsp; <i class="fas fa-mouse"></i> Scroll to zoom</span>
            </div>
            <!-- Pannable / zoomable image viewport -->
            <div id="modalImgViewport"
                 style="overflow:hidden;position:relative;flex-shrink:0;height:52vh;background:#f8fafc;cursor:grab;user-select:none;">
                <img id="modalSingleImage" src="" alt="Product Image"
                     style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(1);transform-origin:center center;
                            max-width:100%;max-height:100%;object-fit:contain;border-radius:10px;
                            box-shadow:0 4px 20px rgba(0,0,0,0.15);transition:none;pointer-events:none;">
            </div>
            <!-- Thumbnail strip — shown only for existing stock images -->
            <div id="modalThumbStrip" style="display:none; flex-shrink:0; padding:10px 16px; background:#fff; border-top:1px solid var(--light-gray); overflow-x:auto; white-space:nowrap;">
                <div id="modalThumbLoader" style="text-align:center; padding:8px; color:var(--gray); font-size:12px;">
                    <i class="fas fa-spinner fa-spin"></i> Loading thumbnails...
                </div>
                <div id="modalThumbList" style="display:inline-flex; gap:8px; align-items:flex-end;"></div>
            </div>
            <div class="image-modal-footer" style="flex-shrink:0;">
                <div id="modalMatchInfo" style="font-size:12px; color:var(--gray);"></div>
                <button class="btn btn-outline" onclick="closeImageModal()"><i class="fas fa-times"></i> Close</button>
            </div>
        </div>
    </div>

    <!-- Stock Images Modal -->
    <div class="modal-overlay" id="stockImagesModal" onclick="closeStockModal()" style="z-index:4000;">
        <div class="modal" style="max-width:780px; width:95vw; max-height:90vh; display:flex; flex-direction:column;" onclick="event.stopPropagation()">
            <div class="modal-header" style="flex-shrink:0;">
                <h3><i class="fas fa-warehouse" style="color:var(--info)"></i> <span id="stockModalTitle">Existing Stock Images</span></h3>
                <button class="modal-close" onclick="closeStockModal()"><i class="fas fa-times"></i></button>
            </div>
            <!-- Selected / preview image -->
            <div style="flex-shrink:0; background:#f8fafc; padding:14px 20px; border-bottom:1px solid var(--light-gray); text-align:center;">
                <img id="stockModalPreview" src="" alt="Preview"
                     style="max-height:220px; max-width:100%; object-fit:contain; border-radius:10px; box-shadow:0 2px 12px rgba(0,0,0,0.12);">
            </div>
            <!-- Thumbnail grid -->
            <div id="stockModalGrid" style="overflow-y:auto; padding:16px 20px; flex:1; display:flex; flex-direction:column; gap:16px;"></div>
            <div class="modal-footer" style="flex-shrink:0;">
                <span id="stockModalMeta" style="font-size:11px; color:var(--gray);"></span>
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-primary btn-sm" onclick="confirmStockSelection()">
                        <i class="fas fa-check"></i> Use Selected
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="closeStockModal()">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Remove Modal -->
    <div class="modal-overlay" id="removeModal">
        <div class="modal">
            <div class="modal-header">
                <h3><i class="fas fa-trash" style="color:var(--danger)"></i> Remove Product</h3>
                <button class="modal-close" onclick="closeModal('removeModal')"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <p style="color:var(--gray); margin-bottom:12px; font-size:12px;">Remove this product from requisition?</p>
                <div id="removeProductInfo" style="background:var(--lighter-gray); padding:10px; border-radius:8px;"></div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeModal('removeModal')">Cancel</button>
                <button class="btn btn-danger" onclick="confirmRemove()"><i class="fas fa-trash"></i> Remove</button>
            </div>
        </div>
    </div>

    <!-- Deliver Modal -->
    <div class="modal-overlay" id="deliverModal">
        <div class="modal">
            <div class="modal-header">
                <h3><i class="fas fa-truck" style="color:var(--teal)"></i> Deliver to Sales</h3>
                <button class="modal-close" onclick="closeModal('deliverModal')"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div id="deliverProductInfo" style="background:var(--lighter-gray); padding:10px; border-radius:8px; margin-bottom:12px;"></div>
                <div class="form-group">
                    <label>Delivery Notes (Optional)</label>
                    <textarea id="deliveryNotes" placeholder="Notes for sales team..."></textarea>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-outline" onclick="closeModal('deliverModal')">Cancel</button>
                <button class="btn btn-teal" onclick="confirmDeliver()"><i class="fas fa-truck"></i> Deliver</button>
            </div>
        </div>
    </div>

    <!-- Toast Container -->
    <div class="toast-container" id="toastContainer"></div>

    <!-- Loading -->
    <div class="loading-overlay" id="loadingOverlay">
        <div class="spinner"></div>
    </div>
		`);

        window.requisitionData = [];
        window.currentPage = 1;
        window.pageSize = 10;
        window.hasMore = false;
        window.totalCount = 0;
        window.loadedCount = 0;
        var approvalReasons = [];
        var rejectionReasons = [];

        window.loadPage = function loadPage(page, append) {
            frappe.call({
                method: 'vgjewellry.product_requisition.get_product_details_new_format',
                args: { page: page, page_size: window.pageSize, search: window.currentSearch || '' },
                callback: function(response) {
                    if (!response || !response.message) return;
                    var msg = response.message;

                    if (page === 1) {
                        window.requisitionData = msg.all_item || [];
                        approvalReasons = msg.excess_reason;
                        rejectionReasons = msg.reject_reason;
                    } else {
                        window.requisitionData = window.requisitionData.concat(msg.all_item || []);
                    }

                    window.hasMore = msg.has_more;
                    window.totalCount = msg.total_count || 0;
                    window.loadedCount = window.requisitionData.length;
                    window.currentPage = page;

                    if (append) {
                        appendCards(msg.all_item || []);
                    } else {
                        renderCards(window.requisitionData);
                        // Auto-filter to 'all' on first load so everything is visible
                        if (page === 1 && !window.currentSearch) {
                            window.filterByTab('all');
                        }
                    }
                    renderLoadMoreBtn();
                }
            });
        }

        loadPage(1, false);
        loadStatusCounts();


        // Rejection Reasons

        // Called once on load with full server-side counts (ignores pagination)
        function updateStatusTabs(counts) {
            const byId = id => document.getElementById(id);
            const total     = counts ? counts.total     : 0;
            const pending   = counts ? counts.pending   : 0;
            const approved  = counts ? counts.approved  : 0;
            const delivered = counts ? counts.delivered : 0;
            const rejected  = counts ? counts.rejected  : 0;

            // Tab counts
            if (byId('tabAll'))      byId('tabAll').textContent      = total;
            if (byId('tabPending'))  byId('tabPending').textContent  = pending;
            if (byId('tabApproved')) byId('tabApproved').textContent = approved;
            if (byId('tabDelivered'))byId('tabDelivered').textContent= delivered;
            if (byId('tabRejected')) byId('tabRejected').textContent = rejected;

            // Top stat cards
            if (byId('statPending'))  byId('statPending').textContent  = pending;
            if (byId('statApproved')) byId('statApproved').textContent = approved;
            if (byId('statDelivered'))byId('statDelivered').textContent= delivered;
            if (byId('statRejected')) byId('statRejected').textContent = rejected;

            // Sidebar badges
            if (byId('navPending'))  byId('navPending').textContent  = pending;
            if (byId('navApproved')) byId('navApproved').textContent = approved;
            if (byId('navDelivered'))byId('navDelivered').textContent= delivered;
        }

        // Fetch full counts from server once, independently of pagination
        function loadStatusCounts() {
            frappe.call({
                method: 'vgjewellry.product_requisition.get_status_counts',
                callback: function(r) {
                    if (r && r.message) updateStatusTabs(r.message);
                }
            });
        }

        function buildReqCard(req) {
            const activeProducts = req.products || [];
            if (activeProducts.length === 0) return null;
            const pending   = activeProducts.filter(p => p.status === 'pending').length;
            const approved  = activeProducts.filter(p => p.status === 'approved').length;
            const delivered = activeProducts.filter(p => p.status === 'delivered').length;
            const rejected  = activeProducts.filter(p => p.status === 'rejected').length;
            const card = document.createElement('div');
            card.className = 'requisition-card';
            card.innerHTML = `
                <div class="req-header">
                    <div class="req-header-left">
                        <div class="req-checkbox" onclick="toggleReqSelect('${req.id}')"></div>
                        <div class="req-info">
                            <h3>${req.id}</h3>
                            <div class="req-meta">
                                <span><i class="fas fa-user"></i> ${req.requestedBy}</span>
                                <span><i class="fas fa-store"></i> ${req.counter}</span>
                                <span><i class="fas fa-calendar"></i> ${formatDate(req.requestDate)}</span>
                            </div>
                            ${req.remark ? `<div style="margin-top:6px;display:flex;align-items:flex-start;gap:6px;">
                                <i class="fas fa-comment-dots" style="color:var(--gold);font-size:11px;margin-top:2px;flex-shrink:0;"></i>
                                <span style="font-size:11px;color:var(--dark);font-style:italic;">"${req.remark}"</span>
                            </div>` : ''}
                        </div>
                    </div>
                    <div class="req-badges">
                        <span class="badge badge-${req.priority}">${req.priority}</span>
                    </div>
                </div>
                <div class="products-grid">
                    ${activeProducts.map(p => renderProductCard(req.id, p)).join('')}
                </div>
                <div class="req-footer">
                    <div class="req-summary">
                        <div class="summary-item"><label>Total</label><span>${activeProducts.length}</span></div>
                        <div class="summary-item"><label><i class="fas fa-clock" style="color:var(--warning)"></i> Pending</label><span class="warning">${pending}</span></div>
                        <div class="summary-item"><label><i class="fas fa-check-circle" style="color:var(--success)"></i> Approved</label><span class="success">${approved}</span></div>
                        <div class="summary-item"><label><i class="fas fa-truck" style="color:var(--teal)"></i> Delivered</label><span class="teal">${delivered}</span></div>
                        <div class="summary-item"><label><i class="fas fa-times-circle" style="color:var(--danger)"></i> Rejected</label><span class="danger">${rejected}</span></div>
                    </div>
                    <div class="req-actions">
                        ${pending > 0 ? `<button class="btn btn-success btn-sm" onclick="approveAllPending('${req.id}')"><i class="fas fa-check-double"></i> Approve All</button>` : ''}
                        ${approved > 0 ? `<button class="btn btn-teal btn-sm" onclick="deliverAllApproved('${req.id}')"><i class="fas fa-truck"></i> Deliver All</button>` : ''}
                    </div>
                </div>`;
            return card;
        }

        // After cards are in the DOM, auto-fetch first stock image for each product with in_stock > 0
        function autoLoadExistingImages(reqs) {
            (reqs || []).forEach(req => {
                (req.products || []).forEach(p => {
                    if (!p.in_stock || p.in_stock <= 0) return;

                    const imgEl = document.getElementById(`existing-img-${req.id}-${p.id}`);
                    if (!imgEl) return;

                    const branch_id  = parseInt(p.branch_id || p.branch || req.branch_id || req.branch, 10);
                    const item_id    = parseInt(p.item_id, 10);
                    const variety_id = parseInt(p.variety_id, 10);
                    const wt_range   = p.weight_range;

                    if (!branch_id || !item_id || !variety_id || !wt_range) return;

                    frappe.call({
                        method: "vgjewellry.product_requisition_for_po.get_existing_product_image_manager",
                        type: "POST",
                        args: { branch_id, item_id, variety_id, wt_range },
                        callback: function(r) {
                            if (!r.message || !Object.keys(r.message).length) return;

                            // Find own branch first, fallback to first available
                            const branches = Object.keys(r.message).sort((a, b) => {
                                if (a == branch_id) return -1;
                                if (b == branch_id) return 1;
                                return a - b;
                            });

                            for (const branch of branches) {
                                const imgs = r.message[branch];
                                if (imgs && imgs.length && imgs[0].ImagePath1) {
                                    const imgPath = imgs[0].ImagePath1.replace(/\\/g, '/');
                                    const el = document.getElementById(`existing-img-${req.id}-${p.id}`);
                                    if (el) el.src = imgPath;
                                    break;
                                }
                            }
                        }
                    });
                });
            });
        }

        function initDatePickers() {
            function attachPickers() {
                document.querySelectorAll('input[id^="date-"]').forEach(function(el) {
                    if (el._flatpickr) return;
                    var fp = flatpickr(el, {
                        dateFormat: 'Y-m-d',
                        altInput: true,
                        altFormat: 'd/m/Y',
                        minDate: 'today',
                        allowInput: false,
                        disableMobile: true,
                        clickOpens: true,
                        onReady: function(selectedDates, dateStr, instance) {
                            // Style the altInput to match .input-group inputs
                            var alt = instance.altInput;
                            if (alt) {
                                alt.style.cssText = [
                                    'width:100%',
                                    'padding:7px 9px',
                                    'border:2px solid var(--light-gray)',
                                    'border-radius:6px',
                                    'font-size:11px',
                                    'cursor:pointer',
                                    'background:white',
                                    'box-sizing:border-box'
                                ].join(';');
                                alt.placeholder = 'dd/mm/yyyy';
                                // clicking altInput opens calendar
                                alt.addEventListener('click', function() { fp.open(); });
                            }
                        }
                    });
                });
            }

            if (typeof flatpickr !== 'undefined') {
                attachPickers();
            } else {
                var poll = setInterval(function() {
                    if (typeof flatpickr !== 'undefined') {
                        clearInterval(poll);
                        attachPickers();
                    }
                }, 50);
            }
        }

        function renderCards(data) {
            const container = document.getElementById('requisitionContainer');
            container.innerHTML = '';
            if (!data || data.length === 0) {
                container.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><h3>No Requisitions Found</h3><p>Try changing filters</p></div>`;
                return;
            }
            data.forEach(req => {
                const card = buildReqCard(req);
                if (card) container.appendChild(card);
            });
            autoLoadExistingImages(data);
            initDatePickers();
        }

        function appendCards(newData) {
            const container = document.getElementById('requisitionContainer');
            // Remove load more btn if exists before appending
            const oldBtn = document.getElementById('loadMoreBtn');
            if (oldBtn) oldBtn.remove();
            (newData || []).forEach(req => {
                const card = buildReqCard(req);
                if (card) container.appendChild(card);
            });
            autoLoadExistingImages(newData);
            initDatePickers();
        }

        function renderLoadMoreBtn() {
            const container = document.getElementById('requisitionContainer');
            const oldBtn = document.getElementById('loadMoreBtn');
            if (oldBtn) oldBtn.remove();

            const loaded  = window.loadedCount  || 0;
            const total   = window.totalCount   || 0;
            const pct     = total > 0 ? Math.round((loaded / total) * 100) : 100;
            const remaining = Math.max(total - loaded, 0);

            const wrapper = document.createElement('div');
            wrapper.id = 'loadMoreBtn';
            wrapper.style.cssText = 'padding: 18px 0 8px; text-align:center;';
            wrapper.innerHTML = `
                <div style="max-width:420px; margin:0 auto;">
                    <!-- Progress bar -->
                    <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--gray); margin-bottom:6px;">
                        <span><i class="fas fa-layer-group" style="margin-right:4px; color:var(--primary);"></i>
                            <b style="color:var(--dark);">${loaded}</b> of <b style="color:var(--dark);">${total}</b> requisitions loaded
                        </span>
                        <span style="color:var(--primary); font-weight:600;">${pct}%</span>
                    </div>
                    <div style="background:var(--light-gray); border-radius:99px; height:6px; overflow:hidden; margin-bottom:12px;">
                        <div style="height:100%; width:${pct}%; background:linear-gradient(90deg, var(--primary), var(--purple)); border-radius:99px; transition:width 0.4s ease;"></div>
                    </div>
                    ${window.hasMore ? `
                    <button class="btn btn-outline"
                        style="padding:9px 28px; font-size:12px; border-radius:10px; border:2px solid var(--primary); color:var(--primary); font-weight:600;"
                        onclick="loadPage(window.currentPage + 1, true)">
                        <i class="fas fa-chevron-down" style="margin-right:6px;"></i>
                        Load More
                        <span style="margin-left:6px; font-size:11px; color:var(--gray);">(${remaining} remaining)</span>
                    </button>` : `
                    <div style="font-size:12px; color:var(--success); font-weight:600;">
                        <i class="fas fa-check-circle" style="margin-right:5px;"></i>All requisitions loaded
                    </div>`}
                </div>`;
            container.appendChild(wrapper);
        }
	function renderProductCard(reqId, p) {
            const stockClass = getStockClass(p.in_stock, p.suggested);

            return `
            <div class="product-card status-${p.status}" id="product-${reqId}-${p.id}">
                <button class="remove-btn" onclick="removeProduct('${reqId}', '${p.id}')" title="Remove"><i class="fas fa-times"></i></button>

                <div class="image-comparison">
                    <div class="image-section">
                        <span class="image-label existing">Existing</span>
                        <div class="product-image-wrapper" onclick="openExistingStockImages('${reqId}', '${p.id}')">
                            <img id="existing-img-${reqId}-${p.id}" src="${getExistingImage(p.sku)}" alt="Existing">
                            <span class="image-zoom"><i class="fas fa-search-plus"></i></span>
                            <span class="stock-badge ${stockClass}">${getStockLabel(p.inStock)}</span>
                            ${p.status === 'approved' ? '<div class="status-overlay approved"><i class="fas fa-check"></i> Approved</div>' : ''}
                            ${p.status === 'rejected' ? '<div class="status-overlay rejected"><i class="fas fa-times"></i> Rejected</div>' : ''}
                            ${p.status === 'delivered' ? '<div class="status-overlay delivered"><i class="fas fa-truck"></i> Delivered</div>' : ''}
                        </div>
                    </div>
                    <div class="image-section">
                        <span class="image-label required">Required</span>
                        <div class="product-image-wrapper" onclick="openSingleImageModal('${reqId}', '${p.id}')">
                            <img src="${p.req_img}" alt="Required">
                            <span class="image-zoom"><i class="fas fa-search-plus"></i></span>
                        </div>
                    </div>
                </div>


                <div class="product-details">
                    <div class="product-header">
                        <div class="product-title">
                            <h4>${p.item} - ${p.variety}</h4>
                            <span>WT: ${p.weight_range} | Size: ${p.size}</span>
                        </div>
                        <span class="product-status-badge ${getStatusBadgeClass(p.status)}">${getStatusIcon(p.status)} ${p.status}</span>
                    </div>

                    <div class="specs-grid">
                        <div class="spec-box"><label>Suggested<span class="ai-tag">AI</span></label><span class="ai">${p.suggested}</span></div>
                        <div class="spec-box"><label>In Stock</label><span class="${p.in_stock === 0 ? 'zero' : p.in_stock < 5 ? 'low' : 'good'}" style="cursor:pointer;" onclick="openExistingStockImages('${reqId}', '${p.id}')">${p.in_stock}</span></div>
                        <div class="spec-box"><label>Qty Req</label><span id="qty-req-${reqId}-${p.id}">${p.qty}</span></div>
                        <div class="spec-box"><label>Excess/Short</label><span style="color:var(--primary)">${p.diff}</span></div>
                    </div>

                    ${p.status === 'pending' ? renderPendingActions(reqId, p) : ''}
                    ${p.status === 'approved' ? renderApprovedInfo(reqId, p) : ''}
                    ${p.status === 'delivered' ? renderDeliveredInfo(p) : ''}
                    ${p.status === 'rejected' ? renderRejectedInfo(reqId, p) : ''}
                </div>
            </div>`;
        }

	function getTodayDate() { return new Date().toISOString().split('T')[0]; }

        function getReasonLabel(value, type) {
            const list = type === 'approval' ? approvalReasons : rejectionReasons;
	    console.log(list);	
            const found = list.find(r => r.value === value);
            return found ? found.label : value;
		
        }

        function getReasonBadgeClass(value) {
            const found = approvalReasons.find(r => r.value === value);
            return found ? found.class : '';
        }

	function renderPendingActions(reqId, p) {
            return `
            <div class="manager-inputs">
                <div class="input-row three-cols">
                    <div class="input-group">
                        <label><i class="fas fa-boxes"></i> Qty Given</label>
			<select id="qty-${reqId}-${p.id}" class="action-select" >
			<option>1</option>
			<option>2</option>
			<option>3</option>
			<option>4</option>
			<option>5</option>
			<option>6</option>
			<option>7</option>
			<option>8</option>
			<option>9</option>
			<option>10</option>
			</select>
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-tasks"></i> Action <span class="required">*</span></label>
                        <select id="action-${reqId}-${p.id}" class="action-select" onchange="handleActionChange('${reqId}', '${p.id}')">
                            <option value="">Select Action</option>
                            <option value="approved">✓ Approve</option>
                            <option value="rejected">✗ Reject</option>
                            <option value="pending">⏳ Keep Pending</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label><i class="fas fa-calendar-alt"></i> Delivery Date</label>
                        <input type="text" id="date-${reqId}-${p.id}" placeholder="dd/mm/yyyy" autocomplete="off"
                               style="cursor:pointer;" readonly>
                    </div>
                </div>

                <div class="reason-section" id="approveReason-${reqId}-${p.id}">
                    <div class="input-group">
                        <label><i class="fas fa-tag"></i> Approval Reason</label>
                        <select id="approvalReason-${reqId}-${p.id}">
                            ${approvalReasons.map(r => `<option value="${r.value}">${r.label}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="reason-section" id="rejectReason-${reqId}-${p.id}">
                    <div class="input-group">
                        <label><i class="fas fa-exclamation-triangle"></i> Rejection Reason <span class="required">*</span></label>
                        <select id="rejectionReason-${reqId}-${p.id}">
                            ${rejectionReasons.map(r => `<option value="${r.value}">${r.label}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="input-row">
                    <div class="input-group full-width">
                        <label><i class="fas fa-comment-alt"></i> Manager Remarks</label>
                        <textarea id="remarks-${reqId}-${p.id}" placeholder="Add remarks...">${p.managerRemarks || ''}</textarea>
                    </div>
                </div>
            </div>
            <div class="product-actions">
                <!--<button class="action-btn compare" onclick="openImageModal('${reqId}', '${p.id}')"><i class="fas fa-images"></i> Compare</button>-->
                <button class="action-btn save" onclick="saveProduct('${reqId}', '${p.id}')"><i class="fas fa-save"></i> Save</button>
            </div>`;
        }

        function renderApprovedInfo(reqId, p) {
            return `
            <div class="manager-inputs" style="background:var(--success-light);border-radius:10px;padding:12px;margin-top:8px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                    <i class="fas fa-check-circle" style="color:var(--success);font-size:16px;"></i>
                    <span style="font-weight:700;color:var(--success);font-size:13px;">Approved by Manager</span>
                </div>
                <div class="specs-grid" style="grid-template-columns:repeat(3,1fr);gap:8px;">
                    <div class="spec-box" style="background:white;">
                        <label>Qty Approved</label>
                        <span style="color:var(--success);font-weight:700;">${p.qty_approved != null ? p.qty_approved : p.qty}</span>
                    </div>
                    <div class="spec-box" style="background:white;">
                        <label>Qty Requested</label>
                        <span>${p.qty}</span>
                    </div>
                    <div class="spec-box" style="background:white;">
                        <label><i class="fas fa-calendar-check" style="color:var(--success);"></i> Delivery Date</label>
                        <span style="color:var(--primary);font-weight:600;">${p.delivery_date ? formatDate(p.delivery_date) : '—'}</span>
                    </div>
                </div>
                ${p.manager_reason ? `
                <div style="margin-top:8px;padding:8px 10px;background:white;border-radius:8px;border-left:3px solid var(--success);">
                    <span style="font-size:10px;color:var(--gray);text-transform:uppercase;font-weight:600;">Reason</span>
                    <div style="font-size:12px;color:var(--dark);margin-top:2px;">${p.manager_reason}</div>
                </div>` : ''}
                ${p.manager_remarks ? `
                <div style="margin-top:8px;padding:8px 10px;background:white;border-radius:8px;">
                    <span style="font-size:10px;color:var(--gray);text-transform:uppercase;font-weight:600;"><i class="fas fa-comment-alt"></i> Remarks</span>
                    <div style="font-size:12px;color:var(--dark);margin-top:2px;">${p.manager_remarks}</div>
                </div>` : ''}
            </div>`;
        }

        function renderRejectedInfo(reqId, p) {
            return `
            <div class="manager-inputs" style="background:var(--danger-light);border-radius:10px;padding:12px;margin-top:8px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                    <i class="fas fa-times-circle" style="color:var(--danger);font-size:16px;"></i>
                    <span style="font-weight:700;color:var(--danger);font-size:13px;">Rejected by Manager</span>
                </div>
                <div class="specs-grid" style="grid-template-columns:repeat(2,1fr);gap:8px;">
                    <div class="spec-box" style="background:white;">
                        <label>Qty Requested</label>
                        <span>${p.qty}</span>
                    </div>
                    <div class="spec-box" style="background:white;">
                        <label>Status</label>
                        <span style="color:var(--danger);font-weight:700;">Rejected</span>
                    </div>
                </div>
                ${p.manager_reason ? `
                <div style="margin-top:8px;padding:8px 10px;background:white;border-radius:8px;border-left:3px solid var(--danger);">
                    <span style="font-size:10px;color:var(--gray);text-transform:uppercase;font-weight:600;">Rejection Reason</span>
                    <div style="font-size:12px;color:var(--dark);margin-top:2px;">${p.manager_reason}</div>
                </div>` : ''}
                ${p.manager_remarks ? `
                <div style="margin-top:8px;padding:8px 10px;background:white;border-radius:8px;">
                    <span style="font-size:10px;color:var(--gray);text-transform:uppercase;font-weight:600;"><i class="fas fa-comment-alt"></i> Remarks</span>
                    <div style="font-size:12px;color:var(--dark);margin-top:2px;">${p.manager_remarks}</div>
                </div>` : ''}
            </div>`;
        }

        function renderDeliveredInfo(p) {
            return `
            <div class="manager-inputs" style="background:var(--teal-light);border-radius:10px;padding:12px;margin-top:8px;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
                    <i class="fas fa-truck" style="color:var(--teal);font-size:16px;"></i>
                    <span style="font-weight:700;color:var(--teal);font-size:13px;">Delivered</span>
                </div>
                <div class="specs-grid" style="grid-template-columns:repeat(3,1fr);gap:8px;">
                    <div class="spec-box" style="background:white;">
                        <label>Qty Delivered</label>
                        <span style="color:var(--teal);font-weight:700;">${p.qty_approved != null ? p.qty_approved : p.qty}</span>
                    </div>
                    <div class="spec-box" style="background:white;">
                        <label>Qty Requested</label>
                        <span>${p.qty}</span>
                    </div>
                    <div class="spec-box" style="background:white;">
                        <label><i class="fas fa-calendar-check" style="color:var(--teal);"></i> Delivery Date</label>
                        <span style="color:var(--primary);font-weight:600;">${p.delivery_date ? formatDate(p.delivery_date) : '—'}</span>
                    </div>
                </div>
                ${p.manager_remarks ? `
                <div style="margin-top:8px;padding:8px 10px;background:white;border-radius:8px;">
                    <span style="font-size:10px;color:var(--gray);text-transform:uppercase;font-weight:600;"><i class="fas fa-comment-alt"></i> Remarks</span>
                    <div style="font-size:12px;color:var(--dark);margin-top:2px;">${p.manager_remarks}</div>
                </div>` : ''}
            </div>`;
        }

	 function formatDate(dateStr) {
            if (!dateStr) return '';
            return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        }


	 function getStockClass(stock, suggested) {
            if (stock === 0) return 'no-stock';
            if (stock < suggested * 0.5) return 'low-stock';
            return 'in-stock';
        }
	 const existingImages = {};
	const requiredImages = {};

	 function getExistingImage(sku) { return existingImages[sku] || existingImages['default']; }
        function getRequiredImage(sku) { return requiredImages[sku] || requiredImages['default']; }
	function getStockLabel(stock) {
            if (stock === 0) return 'Out of Stock';
            if (stock < 5) return 'Low Stock';
            return `${stock} pcs`;
        }
	 function getStatusBadgeClass(status) {
            const classes = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected', delivered: 'badge-delivered' };
            return classes[status] || 'badge-pending';
        }

        function getStatusIcon(status) {
            const icons = {
                pending:   '<i class="fas fa-clock"></i>',
                approved:  '<i class="fas fa-check-circle"></i>',
                delivered: '<i class="fas fa-truck"></i>',
                rejected:  '<i class="fas fa-times-circle"></i>'
            };
            return icons[status] || '<i class="fas fa-circle"></i>';
        }

}
	function handleActionChange(reqId, productId) {
            const actionSelect = document.getElementById(`action-${reqId}-${productId}`);
            const approveSection = document.getElementById(`approveReason-${reqId}-${productId}`);
            const rejectSection = document.getElementById(`rejectReason-${reqId}-${productId}`);
            const action = actionSelect.value;

            // Update select styling
            actionSelect.className = `action-select ${action}`;

            // Show/hide reason sections
            approveSection.classList.remove('show');
            rejectSection.classList.remove('show');

	    var qty_req=$(`#qty-req-${reqId}-${productId}`).text()
	    var qty_given =  $(`#qty-${reqId}-${productId}`).val()
	    	
            if (action === 'approved' && qty_req != qty_given ) {
                approveSection.classList.add('show');
            } else if (action === 'rejected') {
                rejectSection.classList.add('show');
            }
        }

        var _searchTimer = null;
        window.currentSearch = '';

        window.debounceSearch = function() {
            clearTimeout(_searchTimer);
            _searchTimer = setTimeout(function() {
                var q = $("#searchInput").val().trim();
                if (q === window.currentSearch) return;
                window.currentSearch = q;
                window.currentPage = 1;
                window.requisitionData = [];
                loadPage(1, false);
            }, 400);
        };

        // kept for compatibility but no longer used for DOM filtering
        window.applyFilters = function() { window.debounceSearch(); };
	window.currentTab = 'all';

	window.filterByTab = function(tab) {
		window.currentTab = tab;

		// Update active tab highlight
		document.querySelectorAll('.status-tab').forEach(function(btn) {
			btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
		});

		// Show/hide product cards by status
		document.querySelectorAll('.requisition-card').forEach(function(card) {
			var productCards = card.querySelectorAll('.product-card');
			var visibleCount = 0;

			productCards.forEach(function(pc) {
				if (tab === 'all') {
					pc.style.display = '';
					visibleCount++;
				} else {
					var show = pc.classList.contains('status-' + tab);
					pc.style.display = show ? '' : 'none';
					if (show) visibleCount++;
				}
			});

			// Hide the whole requisition-card if none of its products match
			card.style.display = visibleCount > 0 ? '' : 'none';
		});
	}

	window.resetFilters = function(){
		$("#searchInput").val("");
		window.currentSearch = '';
		window.currentPage = 1;
		window.requisitionData = [];
		loadPage(1, false);
		window.filterByTab('all');
	}
        // Opens modal showing ALL required images fetched from DB for this requisition item
        window.openSingleImageModal = function(reqId, productId) {
            const data    = window.requisitionData || [];
            const req     = data.find(r => String(r.id) === String(reqId));
            const product = req ? req.products.find(p => String(p.id) === String(productId)) : null;
            const name    = product ? (product.item + ' - ' + product.variety) : '';

            const modalEl    = document.getElementById('imageModal');
            const iconEl     = document.getElementById('modalImageTypeIcon');
            const imgEl      = document.getElementById('modalSingleImage');
            const matchEl    = document.getElementById('modalMatchInfo');
            const thumbStrip = document.getElementById('modalThumbStrip');
            const thumbList  = document.getElementById('modalThumbList');
            const thumbLoader= document.getElementById('modalThumbLoader');

            if (iconEl) iconEl.innerHTML = '<i class="fas fa-shopping-cart" style="color:var(--purple);margin-right:8px;"></i> Required Images — ' + name;
            if (matchEl) matchEl.textContent = '';

            // Show first image immediately from DOM while we load the rest
            let firstSrc = '';
            const card = document.getElementById('product-' + reqId + '-' + productId);
            if (card) {
                const reqImg = card.querySelector('.image-section:last-child img');
                if (reqImg) firstSrc = reqImg.src;
            }
            if (imgEl) imgEl.src = firstSrc || '';

            // Show thumb strip with spinner
            if (thumbStrip) thumbStrip.style.display = 'block';
            if (thumbList)  thumbList.innerHTML = '';
            if (thumbLoader) thumbLoader.style.display = 'block';
            if (modalEl)    modalEl.classList.add('active');

            if (!product || !product.used_ids) {
                if (thumbLoader) thumbLoader.style.display = 'none';
                if (thumbList)   thumbList.innerHTML = '<span style="font-size:11px;color:var(--gray);padding:8px;">No image info available.</span>';
                return;
            }

            // Fetch all images for this requisition item from DB
            frappe.call({
                method: "vgjewellry.product_requisition.get_item_image",
                type: "POST",
                args: { used_id: product.used_ids },
                callback: function(r) {
                    if (thumbLoader) thumbLoader.style.display = 'none';

                    const images = r.message;
                    if (!images || !images.length) {
                        if (thumbList) thumbList.innerHTML = '<span style="font-size:11px;color:var(--gray);padding:8px;">No images found.</span>';
                        return;
                    }

                    // Set main image to first result
                    const firstPath = (images[0] || '').replace(/\\/g, '/');
                    if (imgEl && firstPath) imgEl.src = firstPath;

                    // Build thumbnail strip
                    let thumbHTML = '';
                    images.forEach(function(imgPath, idx) {
                        const cleanPath = (imgPath || '').replace(/\\/g, '/');
                        const safePath  = cleanPath.replace(/'/g, "\\'");
                        const border    = idx === 0
                            ? 'border-color:var(--purple);box-shadow:0 0 0 2px var(--purple-light);'
                            : 'border-color:var(--light-gray);';
                        thumbHTML += '<div onclick="switchRequiredModalImage(this,\'' + safePath + '\')"'
                            + ' style="cursor:pointer;border:2px solid;' + border + 'border-radius:8px;overflow:hidden;flex-shrink:0;transition:all 0.15s;text-align:center;">'
                            + '<img src="' + cleanPath + '" style="width:60px;height:60px;object-fit:cover;display:block;">'
                            + '<div style="font-size:9px;color:var(--gray);padding:2px 3px;">Image ' + (idx + 1) + '</div>'
                            + '</div>';
                    });
                    if (thumbList) thumbList.innerHTML = thumbHTML;
                }
            });
        };

        // Switch main preview when a required-image thumbnail is clicked
        window.switchRequiredModalImage = function(el, imgPath) {
            const imgEl = document.getElementById('modalSingleImage');
            if (imgEl) imgEl.src = imgPath;
            _mzReset(false);
            const strip = document.getElementById('modalThumbList');
            if (strip) {
                strip.querySelectorAll('div[onclick]').forEach(function(t) {
                    t.style.borderColor = 'var(--light-gray)';
                    t.style.boxShadow   = 'none';
                });
            }
            el.style.borderColor = 'var(--purple)';
            el.style.boxShadow   = '0 0 0 2px var(--purple-light)';
        };

        // Switch the main preview image when a thumbnail is clicked
        window.switchModalImage = function(el, imgPath, reqId, productId) {
            const imgEl = document.getElementById('modalSingleImage');
            if (imgEl) imgEl.src = imgPath;
            _mzReset(false);
            window.setExistingThumbnail(reqId, productId, imgPath);
            const strip = document.getElementById('modalThumbList');
            if (strip) {
                strip.querySelectorAll('div[onclick]').forEach(function(t) {
                    t.style.borderColor = 'var(--light-gray)';
                    t.style.boxShadow   = 'none';
                });
            }
            el.style.borderColor = 'var(--primary)';
            el.style.boxShadow   = '0 0 0 2px var(--primary-light)';
        };

        // openImageModal — alias for Compare button (shows required image)
        window.openImageModal = function(reqId, productId) {
            window.openSingleImageModal(reqId, productId);
        };

        // ── Zoom / Pan state ──────────────────────────────────────────────────
        var _mz = {
            scale: 1, tx: 0, ty: 0,
            dragging: false, startX: 0, startY: 0, originTx: 0, originTy: 0,
            MIN: 0.5, MAX: 8
        };

        function _mzApply(animate) {
            const img = document.getElementById('modalSingleImage');
            const lbl = document.getElementById('modalZoomLabel');
            if (!img) return;
            img.style.transition = animate ? 'transform 0.18s ease' : 'none';
            img.style.transform  = 'translate(calc(-50% + ' + _mz.tx + 'px), calc(-50% + ' + _mz.ty + 'px)) scale(' + _mz.scale + ')';
            if (lbl) lbl.textContent = Math.round(_mz.scale * 100) + '%';
        }

        function _mzReset(animate) {
            _mz.scale = 1; _mz.tx = 0; _mz.ty = 0;
            _mzApply(animate);
        }

        window.modalZoom = function(delta) {
            _mz.scale = Math.min(_mz.MAX, Math.max(_mz.MIN, _mz.scale + delta));
            _mzApply(true);
        };

        window.modalZoomReset = function() { _mzReset(true); };

        // ── Mouse drag-to-pan ─────────────────────────────────────────────────
        (function() {
            function viewport() { return document.getElementById('modalImgViewport'); }

            function onDown(e) {
                if (e.button !== undefined && e.button !== 0) return;
                _mz.dragging = true;
                _mz.startX   = e.clientX || (e.touches && e.touches[0].clientX) || 0;
                _mz.startY   = e.clientY || (e.touches && e.touches[0].clientY) || 0;
                _mz.originTx = _mz.tx;
                _mz.originTy = _mz.ty;
                const vp = viewport();
                if (vp) vp.style.cursor = 'grabbing';
                e.preventDefault();
            }

            function onMove(e) {
                if (!_mz.dragging) return;
                const cx = e.clientX || (e.touches && e.touches[0].clientX) || 0;
                const cy = e.clientY || (e.touches && e.touches[0].clientY) || 0;
                _mz.tx = _mz.originTx + (cx - _mz.startX);
                _mz.ty = _mz.originTy + (cy - _mz.startY);
                _mzApply(false);
                e.preventDefault();
            }

            function onUp(e) {
                if (!_mz.dragging) return;
                _mz.dragging = false;
                const vp = viewport();
                if (vp) vp.style.cursor = _mz.scale > 1 ? 'grab' : 'grab';
            }

            // Attach once, delegate via the live viewport element
            document.addEventListener('mousedown',  function(e) { if (viewport() && viewport().contains(e.target)) onDown(e); });
            document.addEventListener('mousemove',  onMove);
            document.addEventListener('mouseup',    onUp);
            document.addEventListener('touchstart', function(e) { if (viewport() && viewport().contains(e.target)) onDown(e); }, { passive: false });
            document.addEventListener('touchmove',  onMove, { passive: false });
            document.addEventListener('touchend',   onUp);

            // Scroll-to-zoom on viewport
            document.addEventListener('wheel', function(e) {
                const vp = viewport();
                if (!vp || !vp.contains(e.target)) return;
                e.preventDefault();
                const delta = e.deltaY < 0 ? 0.15 : -0.15;
                _mz.scale = Math.min(_mz.MAX, Math.max(_mz.MIN, _mz.scale + delta));
                _mzApply(false);
            }, { passive: false });
        })();
        // ─────────────────────────────────────────────────────────────────────

        window.closeImageModal = function() {
            const modalEl = document.getElementById('imageModal');
            if (modalEl) {
                modalEl.classList.remove('active');
                _mzReset(false);   // reset zoom/pan when closed
            }
        };

        // openExistingStockImages — opens imageModal with main image + thumbnail strip
        window.openExistingStockImages = function(reqId, productId) {
            const data    = window.requisitionData || [];
            const req     = data.find(r => String(r.id) === String(reqId));
            if (!req || !req.products) { frappe.msgprint(__('Requisition not found')); return; }

            const product = req.products.find(p => String(p.id) === String(productId));
            if (!product) { frappe.msgprint(__('Product not found')); return; }

            const branch_id  = parseInt(product.branch_id || product.branch || req.branch_id || req.branch, 10);
            const item_id    = parseInt(product.item_id, 10);
            const variety_id = parseInt(product.variety_id, 10);
            const wt_range   = product.weight_range;

            const modalEl    = document.getElementById('imageModal');
            const iconEl     = document.getElementById('modalImageTypeIcon');
            const imgEl      = document.getElementById('modalSingleImage');
            const thumbStrip = document.getElementById('modalThumbStrip');
            const thumbList  = document.getElementById('modalThumbList');
            const thumbLoader= document.getElementById('modalThumbLoader');
            const matchEl    = document.getElementById('modalMatchInfo');

            // Show current card thumbnail immediately so modal opens fast
            const domExist = document.getElementById('existing-img-' + reqId + '-' + productId);
            if (imgEl) imgEl.src = domExist ? domExist.src : '';
            if (iconEl) iconEl.innerHTML = '<i class="fas fa-warehouse" style="color:var(--info);margin-right:8px;"></i> Existing Stock — ' + product.item + ' - ' + product.variety;
            if (matchEl) matchEl.textContent = '';

            // Show thumb strip with spinner
            if (thumbStrip) thumbStrip.style.display = 'block';
            if (thumbList)  thumbList.innerHTML = '';
            if (thumbLoader) thumbLoader.style.display = 'block';
            if (modalEl) modalEl.classList.add('active');

            if (!branch_id || !item_id || !variety_id || !wt_range) {
                if (thumbLoader) thumbLoader.style.display = 'none';
                if (thumbList) thumbList.innerHTML = '<span style="font-size:11px;color:var(--gray);padding:8px;">Missing product info.</span>';
                return;
            }

            frappe.call({
                method: "vgjewellry.product_requisition_for_po.get_existing_product_image_manager",
                type: "POST",
                args: { branch_id: branch_id, item_id: item_id, variety_id: variety_id, wt_range: wt_range },
                callback: function(r) {
                    if (thumbLoader) thumbLoader.style.display = 'none';
                    if (!r.message || !Object.keys(r.message).length) {
                        if (thumbList) thumbList.innerHTML = '<span style="font-size:11px;color:var(--gray);padding:8px;">No stock images found.</span>';
                        return;
                    }
                    var branches = Object.keys(r.message);
                    branches.sort(function(a, b) {
                        if (a == branch_id) return -1;
                        if (b == branch_id) return 1;
                        return a - b;
                    });
                    var thumbHTML = '';
                    var isFirst   = true;
                    branches.forEach(function(branch) {
                        var imgs = r.message[branch];
                        if (!imgs || !imgs.length) return;
                        var branchCode = imgs[0].BranchCode || branch;
                        var ownLabel   = branch == branch_id ? ' ★' : '';
                        thumbHTML += '<div style="display:inline-flex;flex-direction:column;align-items:center;margin-right:6px;">'
                                   + '<span style="font-size:9px;color:var(--gray);font-weight:700;margin-bottom:4px;white-space:nowrap;">' + branchCode + ownLabel + '</span>'
                                   + '<div style="display:inline-flex;gap:6px;">';
                        imgs.forEach(function(img_obj) {
                            var img_path = img_obj.ImagePath1.replace(/\\/g, '/');
                            var border   = isFirst ? 'border-color:var(--primary);box-shadow:0 0 0 2px var(--primary-light);' : 'border-color:var(--light-gray);';
                            var safeImg  = img_path.replace(/'/g, "\\'");
                            thumbHTML += '<div onclick="switchModalImage(this,\'' + safeImg + '\',\'' + reqId + '\',\'' + productId + '\')"'
                                       + ' style="cursor:pointer;border:2px solid;' + border + 'border-radius:8px;overflow:hidden;flex-shrink:0;transition:all 0.15s;text-align:center;">'
                                       + '<img src="' + img_path + '" style="width:60px;height:60px;object-fit:cover;display:block;">'
                                       + '<div style="font-size:9px;color:var(--gray);padding:2px 3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60px;">' + (img_obj.LabelNo || '') + '</div>'
                                       + '</div>';
                            if (isFirst) {
                                if (imgEl) imgEl.src = img_path;
                                window.setExistingThumbnail(reqId, productId, img_path);
                            }
                            isFirst = false;
                        });
                        thumbHTML += '</div></div>';
                    });
                    if (thumbList) thumbList.innerHTML = thumbHTML;
                }
            });
        };

        window.closeStockModal = function() {
            document.getElementById('stockImagesModal').style.display = 'none';
        };

        window.setExistingThumbnail = function(reqId, productId, imgPath) {
            const thumb = document.getElementById(`existing-img-${reqId}-${productId}`);
            if (thumb) thumb.src = imgPath;
        };

        window.saveProduct = function(reqId, productId) {
            const data = (window.requisitionData || []);
            const req = data.find(r => String(r.id) === String(reqId));
            if (!req || !req.products) {
                frappe.msgprint(__('Requisition not found'));
                return;
            }

            const product = req.products.find(p => String(p.id) === String(productId));
            if (!product) {
                frappe.msgprint(__('Product not found'));
                return;
            }

            const qtyReqEl = document.getElementById(`qty-req-${reqId}-${productId}`);
            const qtyGivenEl = document.getElementById(`qty-${reqId}-${productId}`);
            const actionEl = document.getElementById(`action-${reqId}-${productId}`);
            const approveEl = document.getElementById(`approvalReason-${reqId}-${productId}`);
            const rejectEl = document.getElementById(`rejectionReason-${reqId}-${productId}`);
            const remarksEl = document.getElementById(`remarks-${reqId}-${productId}`);
            const dateEl = document.getElementById(`date-${reqId}-${productId}`);

            const qtyReq = qtyReqEl ? parseInt(qtyReqEl.textContent || qtyReqEl.innerText || '0', 10) || 0 : 0;
            const qtyGiven = qtyGivenEl ? parseInt(qtyGivenEl.value || '0', 10) || 0 : 0;
            const action = actionEl ? actionEl.value : '';

            const approveReason = approveEl ? approveEl.value : '';
            const rejectReason = rejectEl ? rejectEl.value : '';
            const remarks = remarksEl ? remarksEl.value : '';
            const deliveryDate = dateEl ? dateEl.value : '';

            const selected_images = product.req_img || '';

            if (!selected_images) {
                frappe.msgprint(__('Product Images For Forwarding To Purchase Department'));
                return;
            }

            if (!action || action === 'pending') {
                frappe.msgprint(__('Please Select Action.'));
                return;
            }

            if (action === 'approved' && qtyReq < qtyGiven && !approveReason) {
                frappe.msgprint(__('Please select a reason for the action.'));
                return;
            }

            if ((action === 'approved' && qtyReq > qtyGiven && !rejectReason) ||
                (action === 'rejected' && !rejectReason)) {
                frappe.msgprint(__('Please select a reason for the action.'));
                return;
            }

            if (action === 'approved' && !deliveryDate) {
                frappe.msgprint(__('Please select a delivery date.'));
                return;
            }

            const status =
                action === 'approved' ? 'Approve' :
                action === 'rejected' ? 'Reject' : '';

            frappe.call({
                method: "vgjewellry.product_requisition.save_product_details",
                type: "POST",
                args: {
                    used_ids: product.used_ids,
                    branch_id: product.branch,
                    item_id: product.item_id,
                    variety_id: product.variety_id,
                    wt_id: product.wt_id,
                    size_id: product.size_id,
                    jota: product.jota,
                    suggested: product.suggested,
                    in_stock: product.in_stock,
                    diff: product.diff,
                    qty_req: qtyReq,
                    qty_given: qtyGiven,
                    status: status,
                    approve_reason: action === 'approved' ? approveReason : '',
                    //reject_reason: action === 'rejected' ? rejectReason : (action === 'approved' && qtyReq > qtyGiven ? rejectReason : ''),
                    reject_reason: action === 'rejected' ? rejectReason : '',
                    remarks: remarks,
                    delivery_date: deliveryDate,
                    selected_images: selected_images
                },
                callback: function (r) {
                    if (!r.exc) {
                        // 1. Update in-memory data — mark product as approved/rejected
                        var reqData = (window.requisitionData || []).find(function(r) { return String(r.id) === String(reqId); });
                        if (reqData) {
                            var prodData = (reqData.products || []).find(function(p) { return String(p.id) === String(productId); });
                            if (prodData) prodData.status = action === 'approved' ? 'approved' : 'rejected';
                        }

                        // 2. Remove the product card from DOM
                        const card = document.getElementById('product-' + reqId + '-' + productId);
                        if (card && card.parentNode) card.parentNode.removeChild(card);

                        // 3. Update the req-card footer summary counts
                        var reqCard = document.querySelector('.requisition-card [onclick*="' + reqId + '"]');
                        if (reqCard) reqCard = reqCard.closest('.requisition-card');
                        if (reqCard && reqData) {
                            var prods = reqData.products || [];
                            var pending   = prods.filter(function(p){ return p.status === 'pending'; }).length;
                            var approved  = prods.filter(function(p){ return p.status === 'approved'; }).length;
                            var delivered = prods.filter(function(p){ return p.status === 'delivered'; }).length;
                            var rejected  = prods.filter(function(p){ return p.status === 'rejected'; }).length;
                            var summaryItems = reqCard.querySelectorAll('.summary-item span');
                            if (summaryItems.length >= 5) {
                                summaryItems[0].textContent = prods.length;
                                summaryItems[1].textContent = pending;
                                summaryItems[2].textContent = approved;
                                summaryItems[3].textContent = delivered;
                                summaryItems[4].textContent = rejected;
                            }
                            // 4. Re-apply current tab filter — hides card if no visible products remain
                            var tab = window.currentTab || 'all';
                            var productCards = reqCard.querySelectorAll('.product-card');
                            var visibleCount = 0;
                            productCards.forEach(function(pc) {
                                if (tab === 'all') { pc.style.display = ''; visibleCount++; }
                                else {
                                    var show = pc.classList.contains('status-' + tab);
                                    pc.style.display = show ? '' : 'none';
                                    if (show) visibleCount++;
                                }
                            });
                            reqCard.style.display = visibleCount > 0 ? '' : 'none';
                        }

                        // 5. Refresh global status counts in tabs/stat cards
                        loadStatusCounts();

                        frappe.show_alert({ message: __('Saved Successfully!'), indicator: 'green' });
                    }
                }
            });
        };

// Legacy Product Requisition page functions copied from product_requistion.js
frappe.pages['product-requistion'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Product Requisition',
		single_column: true
	});
	$(wrapper).html(`
	<style>
	.image-thumb-wrapper { display:inline-block; margin:10px; position:relative; }
.image-thumb { max-width:150px; max-height:150px; cursor:zoom-in; border-radius:6px; border:2px solid transparent; }
.image-thumb.selected { border-color:#2490ef; }
.image-checkbox { position:absolute; top:6px; left:6px; z-index:2; }
.replace-img-btn {
    position: absolute;
    bottom: 4px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 11px;
    padding: 2px 6px;
}

.image-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.85);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}
.image-overlay img {
    max-width: 90%;
    max-height: 90%;
    transition: transform 0.15s ease;
}
.image-overlay .close {
    position:absolute;
    top:20px;
    right:30px;
    font-size:32px;
    color:#fff;
    cursor:pointer;
    z-index:999;
}
	/* Whole table look */
.modern-table {
    background: #121212;
    border-collapse: separate;
    border-spacing: 0 8px !important;
}

/* Header */
.modern-table thead th {
    background: #1e1e1e !important;
    color: #e0e0e0;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    padding: 10px 6px;
    border: none !important;
}

/* Body rows */
.modern-table tbody tr {
    background: #1b1b1b;
    border-radius: 10px;
    overflow: hidden;
}

.modern-table tbody tr:hover {
    background: #242424;
    transition: 0.2s;
}

/* Table cells */
.modern-table td {
    padding: 10px 8px !important;
    color: #dcdcdc;
    border-top: 1px solid #2a2a2a !important;
}

/* First & last column rounding */
.modern-table tbody tr td:first-child {
    border-radius: 8px 0 0 8px;
}

.modern-table tbody tr td:last-child {
    border-radius: 0 8px 8px 0;
}

/* Small Form Elements */
.modern-table select,
.modern-table input,
.modern-table textarea {
    background: #262626;
    border: 1px solid #3a3a3a;
    color: #e8e8e8;
    padding: 4px 6px !important;
    border-radius: 6px;
    font-size: 13px;
}

/* Select dropdowns same height */
.modern-table select {
    height: 30px;
}

/* Date picker smaller */
.modern-table input[type=date] {
    height: 30px;
}

/* Textarea */
.modern-table textarea {
    height: 35px;
    resize: none;
}

/* Save button */
.save-btn {
    background: #0dbf58;
    color: black;
    border: none;
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 6px;
    transition: 0.2s;
}

.save-btn:hover {
    background: #13d367;
}

</style>
<h2 style="text-align:center;margin-top:10px">Product Requisition</h2>
	<div style="padding:0 10px">
	<table class="table table-striped table-hover align-middle modern-table" id="item-order-table">
    <thead class="table-dark">
	<tr>
	    <th>Sr No</th>
	    <th>Item</th>
	    <th>Variety</th>
	    <th>WT Range</th>
	    <th>Size</th>
	    <th>JOTA</th>
	    <th>Suggested</th>
	    <th>In Stock</th>
	    <th>Excess/ Short</th>
	    <th>Qty Req</th>
	    <th>Qty Given</th>
	    <th>Action</th>
	    <th>Reason</th>
	    <th>Remarks</th>
	    <th>Delivery Date</th>
	    <th>Save</th>
	</tr>
    </thead>

    <tbody id="product-req-table-body">
	<!-- Row Generated Dynamically -->
    </tbody>
</table>
</div>
		`);

	frappe.call({
		method:'vgjewellry.product_requisition.get_product_details',
		callback: function(response) {
			if(response && response.message.all_item.length>0){
				approve_reason=response.message.excess_reason
				approve_reason_option="";
				for(var j in approve_reason){
					approve_reason_option+=`<option>`+approve_reason[j]['name']+`</option>`
				}
				reject_reason=response.message.reject_reason
				reject_reason_option="";
				for(var j in reject_reason){
					reject_reason_option+=`<option>`+reject_reason[j]['name']+`</option>`
				}
				msg=response.message.all_item
				var str=""
				for(var k in msg){
					str+=`
					<tr>
					<td>`+msg[k]["name"]+`</td>
			    <td>
				<input type="hidden" class="req_selected_images" value="" >
				<input type="hidden" class="req_used_ids" value="`+msg[k]['used_ids']+`" >
				<input type="hidden" class="req_branch_id" value="`+msg[k]['branch']+`" >
				<input type="hidden" class="req_item_id" value="`+msg[k]['item_id']+`" >
				<input type="hidden" class="req_variety_id" value="`+msg[k]['variety_id']+`" >
				<input type="hidden" class="req_wt_id" value="`+msg[k]['wt_id']+`" >
				<input type="hidden" class="req_wt_range" value="`+msg[k]['weight_range']+`" >
				<input type="hidden" class="req_size_id" value="`+msg[k]['size_id']+`" >
			    `+msg[k]["item"]+`</td>
			    <td>`+msg[k]["variety"]+`</td>
			    <td>`+msg[k]["weight_range"]+`</td>
			    <td>`+msg[k]["size"]+`</td>
			    <td class="req_jota">`+msg[k]["jota"]+`</td>
			    <td class="req_suggested">`+msg[k]["suggested"]+`</td>
			    <td class="req_in_stock in_stock_img">`+msg[k]["in_stock"]+`</td>
			    <td class="req_in_diff">`+msg[k]["diff"]+`</td>
			    <td class="qty-req user-add-img">`+msg[k]["qty"]+`</td>
			    <td>
				<select class="form-select form-select-sm action-select qty-given">
					<option>1</option>
					<option>2</option>
					<option>3</option>
					<option>4</option>
					<option>5</option>
					<option>6</option>
					<option>7</option>
					<option>8</option>
					<option>9</option>
					<option>10</option>
				</select>
			    </td>
			    <td>
				<select class="form-select form-select-sm action-select status-select">
					<option value="">Select Action</option>
					<option>Approve</option>
					<option>Reject</option>
				</select>
			    </td>
			    <td>
				<select class="form-select form-select-sm reason-select approve-reason mt-1 d-none">
					<option value="">Select Reason</option>
					`+approve_reason_option+`
				</select>
				<select class="form-select form-select-sm reason-select reject-reason mt-1 d-none">
					<option value="">Select Reason</option>
					`+reject_reason_option+`
				</select>
			    </td>
			    <td><textarea class="form-control form-control-sm remarks-box" rows="1"></textarea><br>
				`+msg[k]["remark"]+`<br>By `+msg[k]['remark_user']+`
			    </td>
			    <td><input type="text" class="form-control form-control-sm req-delivery-date "  placeholder="dd-mm-yyyy" ></td>
			    <td><button type="button" class="btn btn-success btn-sm w-100 req-save-order">Save</button></td>
			</tr>`
				}
				$("#product-req-table-body").html(str)
				initDeliveryDatePickers();
			}
		}
	})
	$('<link>')
		.attr('rel', 'stylesheet')
		.attr('href', '/assets/vgjewellry/css/flatpickr.min.css')
		.appendTo('head');
	frappe.require([
		"assets/vgjewellry/js/flatpickr.min.js"
	], function() {
		// Initialize all date pickers
		flatpickr(".req-delivery-date", {
			dateFormat: "d-m-Y"
		});
	});
	function initDeliveryDatePickers() {
		$(".req-delivery-date").each(function() {
			// Only initialize if not already initialized
			if (!this._flatpickr) {
				flatpickr(this, { dateFormat: "d-m-Y" });
			}
		});
	}
	$(document).on("change", ".qty-given", function () {
		let row = $(this).closest("tr");
		update_status(row)
	});
	$(document).on("change", ".status-select", function () {
		let row = $(this).closest("tr");
		update_status(row)
	});
	function update_status(row){

		var qtyReq = parseInt(row.find('.qty-req').text())
		var qtyGiven = parseInt(row.find('.qty-given').val());
		var approveReasonSelect = row.find('.approve-reason');
		var rejectReasonSelect = row.find('.reject-reason');
		var status=row.find(".status-select").val();
		if (qtyReq < qtyGiven && status=="Approve") {
			// Show Reason to approve and hide Reason to reject
			approveReasonSelect.removeClass('d-none');
			rejectReasonSelect.addClass('d-none');
		} 
		else if(qtyReq == qtyGiven && status=="Approve"){
			approveReasonSelect.addClass('d-none');
			rejectReasonSelect.addClass('d-none');

		}
		else {
			// Show Reason to reject and hide Reason to approve
			rejectReasonSelect.removeClass('d-none');
			approveReasonSelect.addClass('d-none');
		}
	}
	$(document).on("click", ".in_stock_img", function () {
		var row = $(this).closest('tr');
		var branch_id  = parseInt(row.find('.req_branch_id').val());
		var item_id    = parseInt(row.find('.req_item_id').val());
		var variety_id = parseInt(row.find('.req_variety_id').val());
		var wt_range   = row.find('.req_wt_range').val();

		var modalEl   = document.getElementById('stockImagesModal');
		var titleEl   = document.getElementById('stockModalTitle');
		var gridEl    = document.getElementById('stockModalGrid');
		var previewEl = document.getElementById('stockModalPreview');
		var metaEl    = document.getElementById('stockModalMeta');

		window._stockModal = window._stockModal || {};
		window._stockModal.reqId       = null;
		window._stockModal.productId   = null;
		window._stockModal.selectedImg = null;

		titleEl.textContent     = 'Stock Images';
		gridEl.innerHTML        = '<div style="text-align:center;padding:30px;color:var(--gray);"><i class="fas fa-spinner fa-spin fa-2x"></i><p style="margin-top:10px;">Loading images...</p></div>';
		previewEl.src           = '';
		previewEl.style.display = 'none';
		metaEl.textContent      = '';
		modalEl.style.display   = 'flex';

		frappe.call({
			method: "vgjewellry.product_requisition_for_po.get_existing_product_image_manager",
			type: "POST",
			args: { branch_id: branch_id, item_id: item_id, variety_id: variety_id, wt_range: wt_range },
			callback: function(r) {
				if (!r.message || !Object.keys(r.message).length) {
					gridEl.innerHTML = '<div style="text-align:center;padding:30px;color:var(--gray);"><i class="fas fa-image fa-2x"></i><p style="margin-top:10px;">No images found.</p></div>';
					return;
				}
				var branches = Object.keys(r.message);
				branches.sort((a, b) => { if (a == branch_id) return -1; if (b == branch_id) return 1; return a - b; });

				var firstImgPath = null, totalImgs = 0, gridHTML = '';
				branches.forEach(branch => {
					var imgs = r.message[branch];
					if (!imgs || !imgs.length) return;
					var branchCode = imgs[0].BranchCode || branch;
					gridHTML += `<div>
						<div style="font-size:12px;font-weight:700;color:var(--primary);margin-bottom:8px;padding:4px 8px;background:var(--primary-light);border-radius:6px;display:inline-block;">
							<i class="fas fa-store" style="margin-right:5px;"></i>\${branchCode}
							\${branch == branch_id ? '<span style="margin-left:6px;font-size:10px;background:var(--primary);color:white;padding:1px 6px;border-radius:10px;">Your Branch</span>' : ''}
						</div>
						<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:8px;">`;

					imgs.forEach(img_obj => {
						var img_path = img_obj.ImagePath1.replace(/\\/g, '/');
						if (!firstImgPath) firstImgPath = img_path;
						totalImgs++;
						gridHTML += `<div class="stock-thumb-item" data-img="\${img_path}"
							onclick="selectStockThumb(this, \'\${img_path}\')"
							style="cursor:pointer;text-align:center;border:2px solid var(--light-gray);border-radius:10px;padding:8px;transition:all 0.2s;width:130px;flex-shrink:0;">
							<img src="\${img_path}" style="width:110px;height:110px;object-fit:cover;border-radius:7px;display:block;margin:0 auto;">
							<div style="margin-top:5px;font-size:10px;color:var(--gray);font-weight:600;">\${img_obj.LabelNo || ''}</div>
							<div style="font-size:10px;color:var(--gray);">\${img_obj.NetWt ? img_obj.NetWt + 'g' : ''}</div>
						</div>`;
					});
					gridHTML += `</div></div>`;
				});

				gridEl.innerHTML   = gridHTML;
				metaEl.textContent = totalImgs + ' image' + (totalImgs !== 1 ? 's' : '') + ' found';
				if (firstImgPath) {
					var firstThumb = gridEl.querySelector('.stock-thumb-item');
					if (firstThumb) selectStockThumb(firstThumb, firstImgPath);
				}
			}
		});
	})
	$(document).on("click", ".user-add-img", function () {
		var row = $(this).closest('tr');
		var used_id = row.find('.req_used_ids').val()
		frappe.call({
			method: "vgjewellry.product_requisition.get_item_image",
			type: "POST",
			args: {
				used_id: used_id,
			},callback: function (r) {
				if (r.message && Object.keys(r.message).length > 0) {
					let html = `
					<div id="image-overlay-dialog" class="image-overlay">
    <span class="close" onclick="closeImage()">✖</span>
     <img id="overlay-img-dialog">
</div><input type="file" id="replace-image-input" accept="image/*" hidden>`;


					r.message.forEach(img_obj => {
						let img_path = img_obj.replace(/\\/g, '/');
						html += `
    <div class="image-thumb-wrapper">
	<input type="checkbox" class="image-checkbox" data-img="${img_path}">
	<img src="${img_path}" class="image-thumb" data-full="${img_path}">
	<button type="button"
            class="btn btn-xs btn-secondary replace-img-btn"
            data-img="${img_path}">
        Replace
    </button>
    </div>`;
						// if already full URL, use as is
					});
					function getSelectedImages(d) {
						return d.$wrapper.find('.image-checkbox:checked')
							.map(function () {
								return $(this).data('img');
							})
							.get();
					}

					let d = new frappe.ui.Dialog({
						title: 'Select Product Images For Forwarding To Purchase Department ',
						size: 'large',
						fields: [
							{ fieldname: 'images_html', fieldtype: 'HTML', options: html }
						],
						primary_action_label: 'Forward Selected Images',
						primary_action() {
							let selected = getSelectedImages(d);
							row.find('.req_selected_images').val(selected)

							if (!selected.length) {
								frappe.msgprint("Please select at least one image");
								return;
							}

							// TODO: frappe.call to forward selected images
							frappe.msgprint(`Selected Images:<br>${selected.join("<br>")}`);
						}
					});
					d.show();
					let currentReplaceImg = null;

d.$wrapper.on('click', '.replace-img-btn', function (e) {
    e.stopPropagation(); // prevent image click

    currentReplaceImg = $(this).data('img');

    d.$wrapper.find('#replace-image-input').click();
});
					d.$wrapper.on('change', '#replace-image-input', function (e) {
    const file = e.target.files[0];
    if (!file || !currentReplaceImg) return;

    let formData = new FormData();
    formData.append("file", file);
    formData.append("old_image", currentReplaceImg);
    formData.append("used_id", used_id); // ✅ from row

    frappe.call({
        method: "vgjewellry.product_requisition.replace_item_image",
        args: formData,
        freeze: true,
        callback: function (r) {
            if (r.message) {
                const newPath = r.message;

                const wrapper = d.$wrapper
                    .find(`.replace-img-btn[data-img="${currentReplaceImg}"]`)
                    .closest('.image-thumb-wrapper');

                wrapper.find('.image-thumb')
                    .attr('src', newPath)
                    .attr('data-full', newPath);

                wrapper.find('.replace-img-btn').attr('data-img', newPath);
                wrapper.find('.image-checkbox').attr('data-img', newPath);

                currentReplaceImg = null;

                frappe.show_alert({
                    message: "Image replaced successfully",
                    indicator: "green"
                });
            }
        }
    });
});


					// Bind events AFTER dialog renders
					d.$wrapper.on('click', '.image-thumb', function () {
						const src = $(this).data('full');
						const overlay = d.$wrapper.find('#image-overlay-dialog');
						const img = d.$wrapper.find('#overlay-img-dialog');

						zoomLevel = 1;
						img.css('transform', 'scale(1)');
						img.attr('src', src);
						overlay.show();

						img.off('wheel').on('wheel', function (e) {
							e.preventDefault();
							zoomLevel += e.originalEvent.deltaY < 0 ? 0.1 : -0.1;
							zoomLevel = Math.min(Math.max(zoomLevel, 0.5), 4);
							img.css('transform', `scale(${zoomLevel})`);
						});
					});

					// Close overlay
					d.$wrapper.on('click', '.image-overlay .close', function () {
						d.$wrapper.find('#image-overlay-dialog').hide();
					});
					d.$wrapper.on('change', '.image-checkbox', function () {
						$(this).siblings('.image-thumb').toggleClass('selected', this.checked);
					});
				} else {
					frappe.msgprint("No images found.");
				}
			}

		});
	});
	// Event listener for Save button click
	$(document).on('click', '.req-save-order', function () {
		// Find the closest row (tr) for the clicked Save button
		var row = $(this).closest('tr');

		// Get the values from the row
		var used_ids = row.find('.req_used_ids').val();  // Branch
		var branch_id = parseInt(row.find('.req_branch_id').val());  // Branch
		var item_id = parseInt(row.find('.req_item_id').val());  // Item
		var variety_id = parseInt(row.find('.req_variety_id').val());  // Variety
		var wt_id = parseInt(row.find('.req_wt_id').val());  // Weight Range
		var size_id = parseInt(row.find('.req_size_id').val());  // Size
		var jota = parseInt(row.find('.req_jota').text());  // Jota
		var suggested = parseInt(row.find('.req_suggested').text());  // Suggested
		var in_stock = parseInt(row.find('.req_in_stock').text());  // In Stock
		var diff = parseInt(row.find('.req_in_diff').text());  // Diff
		var qtyReq = parseInt(row.find('.qty-req').text());  // Quantity Requested
		var qtyGiven = parseInt(row.find('.qty-given').val());  // Quantity Given
		var status = row.find('.status-select').val();  // Status (Approve/Reject)
		var approveReason = row.find('.approve-reason').val();  // Reason for approval
		var rejectReason = row.find('.reject-reason').val();  // Reason for rejection
		var remarks = row.find('.remarks-box').val();  // Remarks
		var deliveryDate = row.find('.req-delivery-date').val();  // Delivery Date
		var selected_images=row.find('.req_selected_images').val();
		if(selected_images == ""){
			alert("Product Images For Forwarding To Purchase Department")
			return;
		}
		if(status==""){
			alert("Please Select Action.");
			return;
		}
		if (qtyReq < qtyGiven && status=="Approve" && approveReason === "") {
			alert("Please select a reason for the action.");
			return;
		}
		console.log(rejectReason);
		if((qtyReq > qtyGiven && status=="Approve" && rejectReason ==="")|| (status=="Reject" && rejectReason ==="")){

			alert("Please select a reason for the action.");
			return;
		}


		if (deliveryDate === "" && status=="Approve") {
			alert("Please select a delivery date.");
			return; 
		}


		// You can now send the data to a server using AJAX, or perform any other operation with the data
		// Example: Saving the data to the server using AJAX

		frappe.call({
			method: "vgjewellry.product_requisition.save_product_details",
			type: "POST",
			args: {
				used_ids: used_ids,
				branch_id: branch_id,
				item_id: item_id,
				variety_id: variety_id,
				wt_id: wt_id,
				size_id: size_id,
				jota: jota,
				suggested:suggested,
				in_stock:in_stock,
				diff:diff,    
				qty_req: qtyReq,
				qty_given: qtyGiven,
				status: status,
				approve_reason: approveReason,
				reject_reason: rejectReason,
				remarks: remarks,
				delivery_date: deliveryDate,
				selected_images: selected_images
			},
			callback: function (r) {
				if (!r.exc) {
					row.remove();
					frappe.msgprint("Saved Successfully!");
				}
			}
		});



		// Optional: Disable the Save button after saving or change its text
		$(this).prop('disabled', true);
		$(this).text('Saved');
	});

}

