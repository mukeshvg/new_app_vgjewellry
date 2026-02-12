frappe.pages['product-requisition-'].on_page_load = function(wrapper) {
	frappe.require([
		'/assets/vgjewellry/css/fontawesome.min.css',
		'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css']);
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
        .stat-icon.mismatch { background: var(--purple-light); color: var(--purple); }

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
        .match-indicator.mismatch { background: var(--danger-light); color: var(--danger); }

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
            max-width: 900px;
            width: 100%;
            max-height: 85vh;
            overflow: hidden;
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
            <div class="stat-card" onclick="filterByTab('mismatch')">
                <div class="stat-icon mismatch"><i class="fas fa-exclamation-triangle"></i></div>
                <div class="stat-info">
                    <h3 id="statMismatch">4</h3>
                    <p>Mismatch</p>
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
                <input type="text" id="searchInput" placeholder="Search PR No, Item, Variety..." onkeyup="applyFilters()">
            </div>
            <select class="filter-select" id="itemFilter" onchange="applyFilters()">
                <option value="">All Items</option>
                <option value="RING">Ring</option>
                <option value="BALI">Bali</option>
                <option value="NECKLACE">Necklace</option>
                <option value="BANGLES">Bangles</option>
            </select>
            <select class="filter-select" id="matchFilter" onchange="applyFilters()">
                <option value="">All Match</option>
                <option value="match">Matching</option>
                <option value="mismatch">Mismatch</option>
            </select>
            <button class="btn btn-outline" onclick="resetFilters()">
                <i class="fas fa-redo"></i> Reset
            </button>
            <button class="btn btn-success" onclick="approveAllMatching()">
                <i class="fas fa-check-double"></i> Approve Matching
            </button>
        </div>

        <!-- Requisitions Container -->
        <div class="requisition-container" id="requisitionContainer">
            <!-- Cards rendered here -->
        </div>
    </main>

    <!-- Image Modal -->
    <div class="image-modal" id="imageModal">
        <div class="image-modal-content">
            <div class="image-modal-header">
                <h3><i class="fas fa-images" style="color:var(--gold)"></i> <span id="modalProductName"></span></h3>
                <button class="image-modal-close" onclick="closeImageModal()"><i class="fas fa-times"></i></button>
            </div>
            <div class="image-comparison-full">
                <div class="image-full-section">
                    <h4><i class="fas fa-warehouse" style="color:var(--info)"></i> Existing Stock</h4>
                    <div class="image-full-wrapper">
                        <img id="modalExistingImage" src="" alt="Existing">
                    </div>
                </div>
                <div class="image-full-section">
                    <h4><i class="fas fa-shopping-cart" style="color:var(--purple)"></i> Required</h4>
                    <div class="image-full-wrapper">
                        <img id="modalRequiredImage" src="" alt="Required">
                    </div>
                </div>
            </div>
            <div class="image-modal-footer">
                <div id="modalMatchInfo"></div>
                <div style="display:flex; gap:8px;">
                    <button class="btn btn-outline" onclick="closeImageModal()">Close</button>
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

	var approvalReasons = [];
        var rejectionReasons = [];
	frappe.call({
                method:'vgjewellry.product_requisition.get_product_details_new_format',
                callback: function(response) {
                        if(response && response.message.all_item.length>0){
				approvalReasons=response.message.excess_reason
				rejectionReasons=response.message.reject_reason
				renderCards(response.message.all_item)
			}
		}
	})

        // Rejection Reasons

	function renderCards(filteredData) {
            const container = document.getElementById('requisitionContainer');
            container.innerHTML = '';

            let displayData = filteredData;
            /*if (currentTab !== 'all') {
                displayData = filteredData.filter(req => {
                    return req.products.some(p => {
                        if (currentTab === 'mismatch') return p.imageMatch === 'mismatch' && p.status === 'pending' && !p.removed;
                        return p.status === currentTab && !p.removed;
                    });
                });
            }*/

            if (displayData.length === 0) {
                container.innerHTML = `<div class="empty-state"><i class="fas fa-inbox"></i><h3>No Requisitions Found</h3><p>Try changing filters</p></div>`;
                return;
            }

            displayData.forEach(req => {
                //const activeProducts = req.products.filter(p => !p.removed);
                const activeProducts = req.products;
                if (activeProducts.length === 0) return;

                let productsToShow = activeProducts;
                /*if (currentTab !== 'all') {
                    productsToShow = activeProducts.filter(p => {
                        if (currentTab === 'mismatch') return p.imageMatch === 'mismatch' && p.status === 'pending';
                        return p.status === currentTab;
                    });
                }*/
                if (productsToShow.length === 0) return;

                const pending = activeProducts.filter(p => p.status === 'pending').length;
                const approved = activeProducts.filter(p => p.status === 'approved').length;
                const delivered = activeProducts.filter(p => p.status === 'delivered').length;
                const rejected = activeProducts.filter(p => p.status === 'rejected').length;

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
                            </div>
                        </div>
                        <div class="req-badges">
                            <span class="badge badge-${req.priority}">${req.priority}</span>
                        </div>
                    </div>
                    <div class="products-grid">
                        ${productsToShow.map(p => renderProductCard(req.id, p)).join('')}
                    </div>
                    <div class="req-footer">
                        <div class="req-summary">
                            <div class="summary-item"><label>Total</label><span>${activeProducts.length}</span></div>
                            <div class="summary-item"><label>Pending</label><span class="warning">${pending}</span></div>
                            <div class="summary-item"><label>Approved</label><span class="success">${approved}</span></div>
                            <div class="summary-item"><label>Delivered</label><span class="teal">${delivered}</span></div>
                            <div class="summary-item"><label>Rejected</label><span class="danger">${rejected}</span></div>
                        </div>
                        <div class="req-actions">
                            ${pending > 0 ? `<button class="btn btn-success btn-sm" onclick="approveAllPending('${req.id}')"><i class="fas fa-check-double"></i> Approve All</button>` : ''}
                            ${approved > 0 ? `<button class="btn btn-teal btn-sm" onclick="deliverAllApproved('${req.id}')"><i class="fas fa-truck"></i> Deliver All</button>` : ''}
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        }
	function renderProductCard(reqId, p) {
            const match = getMatchInfo(p.imageMatch);
            const stockClass = getStockClass(p.in_stock, p.suggested);

            return `
            <div class="product-card status-${p.status}" id="product-${reqId}-${p.id}">
                <button class="remove-btn" onclick="removeProduct('${reqId}', '${p.id}')" title="Remove"><i class="fas fa-times"></i></button>

                <div class="image-comparison">
                    <div class="image-section">
                        <span class="image-label existing">Existing</span>
                        <div class="product-image-wrapper" onclick="openImageModal('${reqId}', '${p.id}')">
                            <img src="${getExistingImage(p.sku)}" alt="Existing">
                            <span class="image-zoom"><i class="fas fa-search-plus"></i></span>
                            <span class="stock-badge ${stockClass}">${getStockLabel(p.inStock)}</span>
                            ${p.status === 'approved' ? '<div class="status-overlay approved"><i class="fas fa-check"></i> Approved</div>' : ''}
                            ${p.status === 'rejected' ? '<div class="status-overlay rejected"><i class="fas fa-times"></i> Rejected</div>' : ''}
                            ${p.status === 'delivered' ? '<div class="status-overlay delivered"><i class="fas fa-truck"></i> Delivered</div>' : ''}
                        </div>
                    </div>
                    <div class="image-section">
                        <span class="image-label required">Required</span>
                        <div class="product-image-wrapper" onclick="openImageModal('${reqId}', '${p.id}')">
                            <img src="${getRequiredImage(p.sku)}" alt="Required">
                            <span class="image-zoom"><i class="fas fa-search-plus"></i></span>
                        </div>
                    </div>
                </div>

                <div class="match-indicator ${match.class}"><i class="fas fa-${match.icon}"></i> ${match.text}</div>

                <div class="product-details">
                    <div class="product-header">
                        <div class="product-title">
                            <h4>${p.item} - ${p.variety}</h4>
                            <span>${p.description} | WT: ${p.weight_range} | Size: ${p.size}</span>
                        </div>
                        <span class="product-status-badge ${getStatusBadgeClass(p.status)}">${p.status}</span>
                    </div>

                    <div class="specs-grid">
                        <div class="spec-box"><label>Suggested<span class="ai-tag">AI</span></label><span class="ai">${p.suggested}</span></div>
                        <div class="spec-box"><label>In Stock</label><span class="${p.in_stock === 0 ? 'zero' : p.in_stock < 5 ? 'low' : 'good'}">${p.in_stock}</span></div>
                        <div class="spec-box"><label>Qty Req</label><span id="qty-req-${reqId}-${p.id}">${p.qty}</span></div>
                        <div class="spec-box"><label>Excess/Short</label><span style="color:var(--primary)">${p.diff}</span></div>
                    </div>

                    ${true || p.status === 'pending' ? renderPendingActions(reqId, p) : ''}
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
                        <input type="date" id="date-${reqId}-${p.id}" value="${p.deliveryDate || ''}" min="${getTodayDate()}">
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
                        <textarea id="remarks-${reqId}-${p.id}" placeholder="Add remarks...">${p.managerRemarks}</textarea>
                    </div>
                </div>
            </div>
            <div class="product-actions">
                <button class="action-btn compare" onclick="openImageModal('${reqId}', '${p.id}')"><i class="fas fa-images"></i> Compare</button>
                <button class="action-btn save" onclick="saveProduct('${reqId}', '${p.id}')"><i class="fas fa-save"></i> Save</button>
            </div>`;
        }

	 function formatDate(dateStr) {
            if (!dateStr) return '';
            return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        }


	function getMatchInfo(match) {
            const info = {
                match: { class: 'match', icon: 'check-circle', text: 'Match' },
                partial: { class: 'partial', icon: 'exclamation-circle', text: 'Partial' },
                mismatch: { class: 'mismatch', icon: 'times-circle', text: 'Mismatch' }
            };
            return info[match] || info.mismatch;
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
