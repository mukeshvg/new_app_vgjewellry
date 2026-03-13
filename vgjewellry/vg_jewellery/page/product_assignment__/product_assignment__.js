frappe.pages['product-assignment--'].on_page_load = function(wrapper) {
	// ── CDN dependencies ────────────────────────────────────────────────────
	if (!document.getElementById('fa-cdn-link')) {
		var faLink = document.createElement('link');
		faLink.id = 'fa-cdn-link'; faLink.rel = 'stylesheet'; faLink.crossOrigin = 'anonymous';
		faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
		document.head.appendChild(faLink);
	}

	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Product Assignment PD',
		single_column: true
	});

	$(wrapper).html(`
	<style>
		* { margin:0; padding:0; box-sizing:border-box; }
		:root {
			--primary:#6366f1; --primary-dark:#4f46e5; --primary-light:#e0e7ff;
			--gold:#d97706; --gold-light:#fef3c7;
			--success:#10b981; --success-light:#d1fae5;
			--warning:#f59e0b; --warning-light:#fef3c7;
			--danger:#ef4444; --danger-light:#fee2e2;
			--info:#3b82f6; --info-light:#dbeafe;
			--purple:#8b5cf6; --purple-light:#ede9fe;
			--teal:#14b8a6; --teal-light:#ccfbf1;
			--dark:#1e293b; --gray:#64748b;
			--light-gray:#e2e8f0; --lighter-gray:#f1f5f9;
			--bg:#f8fafc; --white:#ffffff;
			--shadow:0 1px 3px rgba(0,0,0,.1);
			--shadow-md:0 4px 6px -1px rgba(0,0,0,.1);
			--shadow-lg:0 10px 15px -3px rgba(0,0,0,.1);
		}
		body { font-family:'Inter',sans-serif; background:var(--bg); color:var(--dark); font-size:14px; }
		.pa-main { padding:20px 25px; min-height:100vh; }

		/* Header */
		.pa-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:25px; flex-wrap:wrap; gap:15px; }
		.pa-header-left h1 { font-size:22px; font-weight:800; color:var(--dark); }
		.pa-header-left h1 i { color:var(--gold); margin-right:10px; }
		.pa-header-right { display:flex; align-items:center; gap:10px; }

		/* Stat cards */
		.pa-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(155px,1fr)); gap:12px; margin-bottom:20px; }
		.pa-stat { background:white; border-radius:12px; padding:16px; box-shadow:var(--shadow); display:flex; align-items:center; gap:12px; }
		.pa-stat-icon { width:42px; height:42px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:16px; }
		.pa-stat-icon.total   { background:var(--teal-light);    color:var(--teal);    }
		.pa-stat-icon.pending { background:var(--warning-light);  color:var(--warning); }
		.pa-stat-icon.done    { background:var(--success-light);  color:var(--success); }
		.pa-stat-info h3 { font-size:20px; font-weight:800; }
		.pa-stat-info p  { font-size:10px; color:var(--gray); }

		/* Buttons */
		.btn-pa { padding:9px 16px; border-radius:8px; border:none; font-size:12px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:5px; transition:all .2s ease; text-decoration:none; }
		.btn-pa-primary  { background:var(--primary); color:white; }
		.btn-pa-primary:hover  { background:var(--primary-dark); color:white; }
		.btn-pa-success  { background:var(--success); color:white; }
		.btn-pa-success:hover  { background:#059669; color:white; }
		.btn-pa-info     { background:var(--info); color:white; }
		.btn-pa-info:hover     { background:#2563eb; color:white; }
		.btn-pa-outline  { background:white; border:2px solid var(--light-gray); color:var(--gray); }
		.btn-pa-outline:hover  { border-color:var(--primary); color:var(--primary); }
		.btn-pa-purple   { background:var(--purple); color:white; }
		.btn-pa-gold     { background:var(--gold); color:white; }
		.btn-pa-sm { padding:6px 11px; font-size:11px; }

		/* Assignment cards container */
		.pa-cards { display:flex; flex-direction:column; gap:18px; }

		/* Each assignment card */
		.pa-card { background:white; border-radius:14px; box-shadow:var(--shadow); overflow:hidden; transition:box-shadow .2s; }
		.pa-card:hover { box-shadow:var(--shadow-md); }

		/* Card header */
		.pa-card-header { padding:14px 18px; background:linear-gradient(135deg,var(--lighter-gray),white); border-bottom:1px solid var(--light-gray); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; }
		.pa-card-title { font-size:15px; font-weight:700; color:var(--primary); display:flex; align-items:center; gap:8px; }
		.pa-card-meta { display:flex; gap:10px; margin-top:3px; flex-wrap:wrap; }
		.pa-card-meta span { font-size:11px; color:var(--gray); display:flex; align-items:center; gap:4px; }
		.pa-card-meta span i { color:var(--gold); font-size:10px; }
		.badge-pa { padding:3px 8px; border-radius:12px; font-size:9px; font-weight:700; text-transform:uppercase; }
		.badge-pa-info    { background:var(--info-light);    color:var(--info);    }
		.badge-pa-success { background:var(--success-light); color:var(--success); }
		.badge-pa-warning { background:var(--warning-light); color:var(--warning); }

		/* Card body — 3-col grid */
		.pa-card-body { padding:15px 18px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:14px; align-items:start; }
		@media(max-width:900px) { .pa-card-body { grid-template-columns:1fr 1fr; } }
		@media(max-width:600px) { .pa-card-body { grid-template-columns:1fr; } }

		/* Section panels inside card */
		.pa-panel { background:var(--lighter-gray); border-radius:10px; padding:12px; }
		.pa-panel h5 { font-size:10px; font-weight:700; color:var(--gray); text-transform:uppercase; letter-spacing:.5px; margin-bottom:8px; display:flex; align-items:center; gap:5px; }
		.pa-info-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
		.pa-info-box  { background:white; border-radius:6px; padding:6px 8px; }
		.pa-info-box label { display:block; font-size:8px; color:var(--gray); text-transform:uppercase; margin-bottom:1px; }
		.pa-info-box span  { font-size:12px; font-weight:700; color:var(--dark); }
		.pa-info-full { background:white; border-radius:6px; padding:6px 8px; grid-column:1/-1; }
		.pa-info-full label { display:block; font-size:8px; color:var(--gray); text-transform:uppercase; margin-bottom:1px; }
		.pa-info-full span  { font-size:11px; color:var(--dark); font-weight:600; }

		/* Stock table */
		.pa-stock-table { width:100%; border-collapse:collapse; font-size:11px; }
		.pa-stock-table th { background:white; padding:5px 7px; text-align:center; font-size:9px; font-weight:700; color:var(--gray); text-transform:uppercase; border-bottom:1px solid var(--light-gray); }
		.pa-stock-table td { padding:5px 7px; text-align:center; border-bottom:1px solid #e9edf2; }
		.pa-stock-table tr:last-child td { border-bottom:none; }
		.in-stock-btn { padding:3px 8px; border-radius:5px; border:none; background:var(--info-light); color:var(--info); font-size:10px; font-weight:600; cursor:pointer; transition:all .2s; }
		.in-stock-btn:hover { background:var(--info); color:white; }

		/* Qty highlights */
		.qty-box { background:white; border-radius:8px; padding:8px 10px; text-align:center; margin-bottom:6px; }
		.qty-box label { display:block; font-size:8px; color:var(--gray); text-transform:uppercase; margin-bottom:2px; }
		.qty-box .qty-val { font-size:18px; font-weight:800; }
		.qty-val.success { color:var(--success); }
		.qty-val.warning { color:var(--warning); }
		.qty-val.info    { color:var(--info);    }

		/* Reason/Remark panel */
		.pa-remark-block { background:white; border-radius:6px; padding:6px 8px; margin-bottom:5px; border-left:3px solid var(--light-gray); font-size:11px; color:var(--dark); }
		.pa-remark-block.pd    { border-left-color:var(--success); }
		.pa-remark-block.mgr   { border-left-color:var(--gold); }
		.pa-remark-label { font-size:8px; color:var(--gray); text-transform:uppercase; font-weight:700; margin-bottom:2px; }

		/* Action panel */
		.pa-action-panel { background:var(--lighter-gray); border-radius:10px; padding:12px; display:flex; flex-direction:column; gap:8px; }
		.pa-input-group { display:flex; flex-direction:column; gap:3px; }
		.pa-input-group label { font-size:9px; font-weight:600; color:var(--gray); text-transform:uppercase; display:flex; align-items:center; gap:3px; }
		.pa-input-group label i { color:var(--primary); }
		.pa-input-group .supplier-link input,
		.pa-input-group .supplier-link .form-control { padding:7px 9px; border:2px solid var(--light-gray); border-radius:6px; font-size:11px; width:100%; }
		.pa-input-group .supplier-link input:focus { outline:none; border-color:var(--primary); }

		/* Empty state */
		.pa-empty { text-align:center; padding:60px 20px; }
		.pa-empty i { font-size:48px; color:var(--light-gray); margin-bottom:14px; display:block; }
		.pa-empty h3 { font-size:17px; color:var(--dark); margin-bottom:6px; }
		.pa-empty p  { color:var(--gray); font-size:12px; }

		/* Image thumb (dialog) */
		.image-thumb-wrapper { display:inline-block; margin:8px; position:relative; }
		.image-thumb { max-width:150px; max-height:150px; cursor:zoom-in; border-radius:8px; border:2px solid transparent; transition:border-color .2s; }
		.image-thumb:hover { border-color:var(--primary); }
		.image-thumb.selected { border-color:var(--primary); }
		.image-checkbox { position:absolute; top:6px; left:6px; z-index:2; }
		.image-overlay { position:fixed; inset:0; background:rgba(0,0,0,.88); display:none; align-items:center; justify-content:center; z-index:9999; }
		.image-overlay img { max-width:90%; max-height:90%; transition:transform .15s ease; }
		.image-overlay .close { position:absolute; top:20px; right:30px; font-size:32px; color:#fff; cursor:pointer; z-index:999; }

		/* Loading */
		.pa-loading { text-align:center; padding:40px; color:var(--gray); font-size:13px; }
		.pa-loading i { font-size:28px; margin-bottom:8px; display:block; color:var(--primary); }
	</style>

	<main class="pa-main">
		<header class="pa-header">
			<div class="pa-header-left">
				<h1><i class="fas fa-boxes"></i> Product Assignment</h1>
			</div>
			<div class="pa-header-right">
				<a href="./product-requisition-for-po" class="btn-pa btn-pa-outline btn-pa-sm">
					<i class="fas fa-arrow-left"></i> Go Requisition
				</a>
				<a href="./vg-purchase-cart" class="btn-pa btn-pa-info btn-pa-sm">
					<i class="fas fa-shopping-cart"></i> Go Cart
				</a>
			</div>
		</header>

		<div class="pa-stats">
			<div class="pa-stat">
				<div class="pa-stat-icon total"><i class="fas fa-layer-group"></i></div>
				<div class="pa-stat-info"><h3 id="pa-stat-total">0</h3><p>Total Items</p></div>
			</div>
			<div class="pa-stat">
				<div class="pa-stat-icon pending"><i class="fas fa-clock"></i></div>
				<div class="pa-stat-info"><h3 id="pa-stat-pending">0</h3><p>Pending Assignment</p></div>
			</div>
			<div class="pa-stat">
				<div class="pa-stat-icon done"><i class="fas fa-check-circle"></i></div>
				<div class="pa-stat-info"><h3 id="pa-stat-done">0</h3><p>Added to Cart</p></div>
			</div>
		</div>

		<div id="pa-cards-container" class="pa-cards">
			<div class="pa-loading"><i class="fas fa-spinner fa-spin"></i> Loading assignments...</div>
		</div>
	</main>
	`);

	frappe.call({
		method:'vgjewellry.product_requisition_for_po.get_product_details_for_assignment',
		callback: function(response) {
			var container = document.getElementById('pa-cards-container');
			if (!response || !response.message || !response.message.all_item || !response.message.all_item.length) {
				container.innerHTML = '<div class="pa-empty"><i class="fas fa-inbox"></i><h3>No Assignments Found</h3><p>All items assigned or no data available.</p></div>';
				return;
			}

			var approve_reason = response.message.excess_reason || [];
			var reject_reason  = response.message.reject_reason  || [];
			var approve_reason_option = approve_reason.map(function(r) { return '<option>' + r.name + '</option>'; }).join('');
			var reject_reason_option  = reject_reason.map(function(r)  { return '<option>' + r.name + '</option>'; }).join('');

			var msg = response.message.all_item;
			var total = msg.length;
			document.getElementById('pa-stat-total').textContent   = total;
			document.getElementById('pa-stat-pending').textContent  = total;
			document.getElementById('pa-stat-done').textContent     = 0;

			var html = '';
			for (var k in msg) {
				var item = msg[k];
				var idealRows = '';
				var ideal = item.ideal || [];
				for (var n in ideal) {
					if (!ideal[n].b) continue;
					idealRows += '<tr>' +
						'<td>' + ideal[n].b + '</td>' +
						'<td>' + (ideal[n].s || 0) + '</td>' +
						'<td><button class="in-stock-btn in_stock_img" data-appqty="' + item.qty_po + '" data-id="' + item.id + '">' + (ideal[n].i || 0) + '</button></td>' +
						'<td style="color:' + (ideal[n].d > 0 ? 'var(--danger)' : 'var(--success)') + ';font-weight:700;">' + (ideal[n].d > 0 ? '+' : '') + ideal[n].d + '</td>' +
					'</tr>';
				}

				html += '<div class="pa-card" id="pa-card-' + item.id + '">' +

					// ── Card header ──────────────────────────────────────────
					'<div class="pa-card-header">' +
						'<div>' +
							'<div class="pa-card-title"><i class="fas fa-store" style="color:var(--gold);"></i>' + (item.branch_name || item.branch) + '</div>' +
							'<div class="pa-card-meta">' +
								'<span><i class="fas fa-gem"></i> ' + item.item + '</span>' +
								'<span><i class="fas fa-palette"></i> ' + item.variety + '</span>' +
								'<span><i class="fas fa-weight-hanging"></i> ' + item.weight_range + '</span>' +
								(item.size ? '<span><i class="fas fa-ruler"></i> ' + item.size + '</span>' : '') +
								(item.jota ? '<span><i class="fas fa-tag"></i> Jota: ' + item.jota + '</span>' : '') +
							'</div>' +
						'</div>' +
						'<span class="badge-pa badge-pa-info">Assignment</span>' +
					'</div>' +

					// ── Card body ─────────────────────────────────────────────
					'<div class="pa-card-body">' +

						// Col 1 — Item info + stock table
						'<div>' +
							'<div class="pa-panel" style="margin-bottom:10px;">' +
								'<h5><i class="fas fa-info-circle" style="color:var(--primary);"></i> Item Details</h5>' +
								'<div class="pa-info-grid">' +
									'<div class="pa-info-box"><label>Item</label><span>' + item.item + '</span></div>' +
									'<div class="pa-info-box"><label>Variety</label><span>' + item.variety + '</span></div>' +
									'<div class="pa-info-box"><label>Wt Range</label><span>' + item.weight_range + '</span></div>' +
									'<div class="pa-info-box"><label>Size</label><span>' + (item.size || '—') + '</span></div>' +
									'<div class="pa-info-box"><label>Jota</label><span>' + (item.jota || '—') + '</span></div>' +
									'<div class="pa-info-box"><label>ID</label><span style="font-size:9px;">' + item.id + '</span></div>' +
								'</div>' +
								// hidden fields
								'<input type="hidden" class="req_id"         value="' + item.id          + '">' +
								'<input type="hidden" class="req_branch_id"  value="' + item.branch      + '">' +
								'<input type="hidden" class="req_item_id"    value="' + item.item_id     + '">' +
								'<input type="hidden" class="req_variety_id" value="' + item.variety_id  + '">' +
								'<input type="hidden" class="req_wt_id"      value="' + item.wt_id       + '">' +
								'<input type="hidden" class="req_wt_range"   value="' + item.weight_range + '">' +
								'<input type="hidden" class="req_size_id"    value="' + (item.size_id || '') + '">' +
							'</div>' +
							'<div class="pa-panel">' +
								'<h5><i class="fas fa-chart-bar" style="color:var(--info);"></i> Branch Stock Analysis</h5>' +
								'<table class="pa-stock-table"><thead><tr><th>Branch</th><th>Suggested</th><th>In Stock</th><th>Diff</th></tr></thead><tbody>' + idealRows + '</tbody></table>' +
							'</div>' +
						'</div>' +

						// Col 2 — Qty + Reasons/Remarks
						'<div>' +
							'<div class="pa-panel" style="margin-bottom:10px;">' +
								'<h5><i class="fas fa-cubes" style="color:var(--success);"></i> Quantities</h5>' +
								'<div class="qty-box" style="margin-bottom:6px;">' +
									'<label>PO Approved Qty</label>' +
									'<div class="qty-val success">' +
										'<button type="button" class="btn-pa btn-pa-success btn-pa-sm user-add-img" data-id="' + item.id + '" style="margin:0 auto;">' +
											'<i class="fas fa-images"></i> ' + item.qty_po +
										'</button>' +
									'</div>' +
								'</div>' +
								'<div class="qty-box" style="margin-bottom:6px;">' +
									'<label>Branch Transfer Qty</label>' +
									'<div class="qty-val info">' +
										'<button type="button" class="btn-pa btn-pa-info btn-pa-sm show-branch-transfer" data-req_id="' + item.id + '" data-qty="' + item.qty_bt + '" style="margin:0 auto;">' +
											'<i class="fas fa-exchange-alt"></i> ' + item.qty_bt +
										'</button>' +
									'</div>' +
								'</div>' +
								'<div class="qty-box">' +
									'<label>Cart Qty Remaining</label>' +
									'<div class="qty-val warning" style="font-size:18px;font-weight:800;">' + item.qty_cart + '</div>' +
								'</div>' +
							'</div>' +
							'<div class="pa-panel">' +
								'<h5><i class="fas fa-comment-dots" style="color:var(--gold);"></i> Reasons & Remarks</h5>' +
								(item.pdr ? '<div class="pa-remark-block pd"><div class="pa-remark-label">PD Reason</div>' + item.pdr + '</div>' : '') +
								((item.mar || item.mrr) ? '<div class="pa-remark-block mgr"><div class="pa-remark-label">Manager Reason</div>' + (item.mar || '') + (item.mrr || '') + '</div>' : '') +
								(item.pr ? '<div class="pa-remark-block pd"><div class="pa-remark-label">PD Remark</div>' + item.pr + '</div>' : '') +
								(item.mr ? '<div class="pa-remark-block mgr"><div class="pa-remark-label">Manager Remark</div>' + item.mr + '</div>' : '') +
							'</div>' +
						'</div>' +

						// Col 3 — Supplier + action
						'<div>' +
							'<div class="pa-action-panel">' +
								'<h5 style="font-size:10px;font-weight:700;color:var(--gray);text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px;display:flex;align-items:center;gap:5px;"><i class="fas fa-truck" style="color:var(--primary);"></i> Supplier & Action</h5>' +
								'<div class="pa-input-group">' +
									'<label><i class="fas fa-store"></i> Select Supplier <span style="color:var(--danger);">*</span></label>' +
									'<div class="supplier-link" data-row="' + k + '"></div>' +
								'</div>' +
								'<button type="button" class="btn-pa btn-pa-success req-save-order" style="width:100%;justify-content:center;margin-top:4px;">' +
									'<i class="fas fa-cart-plus"></i> Add To Cart' +
								'</button>' +
							'</div>' +
						'</div>' +

					'</div>' + // end card-body
				'</div>'; // end pa-card
			}

			container.innerHTML = html;
			initDeliveryDatePickers();

			// Init supplier link controls
			$('.supplier-link').each(function() {
				var row_index = $(this).data('row');
				var supplier = frappe.ui.form.make_control({
					parent: this,
					df: {
						fieldtype: 'Link',
						options: 'Ornate_Supplier_Master',
						fieldname: 'supplier_' + row_index,
						placeholder: 'Select Supplier'
					},
					render_input: true
				});
				supplier.refresh();
			});
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

	$(document).on("click", ".user-add-img", function () {
		var id = $(this).data('id');
		frappe.call({
			method: "vgjewellry.product_requisition_for_po.get_item_image_for_pd",
			type: "POST",
			args: {
				req_id: id,
			},callback: function (r) {
				if (r.message && Object.keys(r.message).length > 0) {
					let html = `
					<div id="image-overlay-dialog" class="image-overlay">
    <span class="close" onclick="closeImage()">✖</span>
     <img id="overlay-img-dialog">
</div>`;


					r.message.forEach(img_obj => {
						let img_path = img_obj.replace(/\\/g, '/');
						html += `
    <div class="image-thumb-wrapper">
	<!--<input type="checkbox" class="image-checkbox" data-img="${img_path}">-->
	<img src="${img_path}" class="image-thumb" data-full="${img_path}">
    </div>`;
						// if already full URL, use as is
					});function getSelectedImages(d) {
						return d.$wrapper.find('.image-checkbox:checked')
							.map(function () {
								return $(this).data('img');
							})
							.get();
					}
					let d = new frappe.ui.Dialog({
						title: 'Product Images For Forwarding To Supplier ',
						size: 'large',
						fields: [
							{ fieldname: 'images_html', fieldtype: 'HTML', options: html }
						],
						//primary_action_label: 'Remove Selected Images',
						/*primary_action() {
							let selected = getSelectedImages(d);
							row.find('.req_selected_images').val(selected)

							if (!selected.length) {
								frappe.msgprint("Please select at least one image");
								return;
							}

					// TODO: frappe.call to forward selected images
							frappe.msgprint(`Selected Images:<br>${selected.join("<br>")}`);
						}*/
				});
					d.show();
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


	$(document).on("click", ".in_stock_img", function () {
		var card = $(this).closest('.pa-card');
		var id         = card.find('.req_id').val();
		var branch_id  = card.find('.req_branch_id').val();
		var item_id    = card.find('.req_item_id').val();
		var variety_id = card.find('.req_variety_id').val();
		var wt_range   = card.find('.req_wt_range').val();
		var po_qty     = $(this).data('appqty');
		frappe.call({
			method: "vgjewellry.product_requisition_for_po.get_existing_product_image",
			type: "POST",
			args: {
				branch_id: branch_id,
				item_id: item_id,
				variety_id: variety_id,
				wt_range: wt_range,
			},callback: function (r) {
				if (r.message && Object.keys(r.message).length > 0) {
					let html = '';
					let branches = Object.keys(r.message);

					// Move clicked branch to first
					branches.sort((a,b) => {
						if (a == branch_id) return -1;
						if (b == branch_id) return 1;
						return a - b; // sort remaining numerically
					});

					let branch_code={};			 
					branches.forEach(branch => {
						r.message[branch].forEach(img_obj => {
							branch_code[branch]=img_obj["BranchCode"]
						})
					})			 

					branches.forEach(branch => {
						html += `<h4>Branch: ${branch_code[branch]}</h4><div style="margin-bottom:15px;">`;

						r.message[branch].forEach(img_obj => {
							let img_path = img_obj.ImagePath1.replace(/\\/g, '/');
							// if already full URL, use as is
							html += `<div style="display:inline-block; margin:5px; text-align:center;    margin-left: auto;
    margin-right: auto; border: 1px solid #ccc; padding: 10px;">
				    <img src="${img_path}" style="max-width:150px; max-height:150px; display:block;" />
				    <div>Label: ${img_obj.LabelNo}</div>
				    <div>Wt: ${img_obj.NetWt}</div>
				    `;
							if(branch !=branch_id){
								if(img_obj.is_exists){
									html+=`<div style="color:red">Already Requested</div>`
								}else{
									html+=`<input type="checkbox" class="image_checkbox" data-branch="${branch}"  data-img-id="${img_obj.LabelNo}" data-requested="${branch_id}" data-id="${id}" />`
								}
							}	

							html+=`</div>`;
						});

						html += '</div><hr>';
					});

					let d = new frappe.ui.Dialog({
						title: 'Product Images by Branch',
						size: 'large',
						fields: [
							{ fieldname: 'images_html', fieldtype: 'HTML', options: html }
						]
					});

					d.set_primary_action('Branch Transfer', function() {
						let selectedImages = [];

						// Collect selected images based on checkbox
						$('.image_checkbox:checked').each(function() {
							var obj={label_no:$(this).data('img-id'),"branch":$(this).data('branch'),"requested":$(this).data("requested"),id:$(this).data('id')}
							selectedImages.push(obj);
							console.log(selectedImages.length)	
							$("#selected_images_info_span").text(selectedImages.length);
						});

						if (selectedImages.length > 0) {
							// Send data to backend via AJAX or frappe call
							frappe.call({
								method: "vgjewellry.product_requisition_for_po.transfer_images_to_branch",
								type: "POST",
								args: {
									selected_image_ids: JSON.stringify(selectedImages),
								},
								callback: function(r) {
									if (r.message) {
										frappe.msgprint("Branch transfer successful!");
										if(selectedImages.length == po_qty){
											$('#pa-card-' + id).remove();
										}
										 d.hide();
									} else {
										frappe.msgprint("Error in transferring images.");
									}
								}
							});
						} else {
							frappe.msgprint("Please select at least one image.");
						}
					});
					$(d.$wrapper).on('change', '.image_checkbox', function() {
						 let selectedImagesCount = $('.image_checkbox:checked').length;
						 if(selectedImagesCount >po_qty){
							  $(this).prop('checked', false);
							 selectedImagesCount--;
							frappe.throw(__("You can not select Branch Transter Qty more than Approved Qty."));
						 }
						 $('#selected_images_info_span').text(selectedImagesCount);

					})

					// Set button class to success (This will apply success styling to the button)
					$(d.$wrapper).find('.btn-primary').addClass('btn-success');
					d.show();
					$(d.footer).prepend(`
    <div  style="margin-right:auto; font-weight:600;">Approved Qty: <span id="bt_approved_qty">`+po_qty+`</div>
    <div id="selected_images_info"
	 style="margin-right:auto; font-weight:600;">
	Selected Branch Transfer Qty: <span id="selected_images_info_span">0</span>
    </div>
`);
				} else {
					frappe.msgprint("No images found.");
				}
			}

		});
	});

	// Event listener for Save button click
	$(document).on('click', '.req-save-order', function () {
		var card = $(this).closest('.pa-card');
		let supplier = card.find(".supplier-link input").val();

		if (!supplier) {
			frappe.msgprint("Please select a supplier.");
			return;
		}
		let supplier_pk = card.find(".supplier-link .control-value a").data("name");

		var id = card.find('.req_id').val();

		used_ids = "";
		frappe.call({
			method: "vgjewellry.product_requisition_for_po.save_supplier",
			type: "POST",
			args: {
				id: id,
				supplier: supplier_pk
			},
			callback: function (r) {
				if (!r.exc) {
					// Update stat counts
					var total   = parseInt(document.getElementById('pa-stat-total').textContent)   || 0;
					var pending = parseInt(document.getElementById('pa-stat-pending').textContent) || 0;
					var done    = parseInt(document.getElementById('pa-stat-done').textContent)    || 0;
					document.getElementById('pa-stat-pending').textContent = Math.max(pending - 1, 0);
					document.getElementById('pa-stat-done').textContent    = done + 1;
					card.remove();
					frappe.show_alert({ message: 'Added to Cart Successfully!', indicator: 'green' });
				}
			}
		});

		$(this).prop('disabled', true);
		$(this).html('<i class="fas fa-check"></i> Added To Cart');
	});
	$(document).on('click', '.show-branch-transfer', function () {
		var html="";
		var id=$(this).data('req_id');
		var qty=$(this).data('qty');
		if(qty == 0){
			frappe.msgprint("No Item From Branch Transfer.");
			return;
		}
		frappe.call({
			method: "vgjewellry.branch_transfer.show_branch_transfer",
			type: "POST",
			args: {
				req_id: id},
			callback: function (r) {
				var bt=r.message
				for (let item in bt) {
					var items=bt[item];
					html += '<div style="background:white;border-radius:14px;box-shadow:0 1px 3px rgba(0,0,0,.1);overflow:hidden;margin-bottom:14px;">';
					html += '<div style="display:flex;gap:16px;padding:14px;">';
					html += '<div style="flex-shrink:0;"><img style="width:100px;height:100px;object-fit:contain;border-radius:10px;border:1px solid #e2e8f0;" src="' + items['im'] + '" alt="Item Image" /></div>';
					html += '<div style="flex:1;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;">';
					var fields = [
						['Date of Request', items.c],
						['Transfer From',   items['rec_b']],
						['Transfer To',     items['req_b']],
						['Item',            items['i']],
						['Variety',         items['v']],
						['Weight Range',    items['w']],
						['Label No',        items['ln']],
						['Manager Status',  items['s']],
						['Request ID',      items.id],
						['Product Send On', items['ps']]
					];
					fields.forEach(function(f) {
						html += '<div style="background:#f1f5f9;border-radius:8px;padding:7px 9px;">' +
							'<div style="font-size:8px;color:#64748b;text-transform:uppercase;font-weight:700;margin-bottom:2px;">' + f[0] + '</div>' +
							'<div style="font-size:12px;font-weight:700;color:#1e293b;">' + (f[1] || '—') + '</div>' +
						'</div>';
					});
					html += '</div></div></div>';
				}
				let d = new frappe.ui.Dialog({
					title: 'Branch Transfer Request',
					size: 'large',
					fields: [
						{ fieldname: 'images_html', fieldtype: 'HTML', options: html }
					]
				});
				d.show()
			}
		});
	});
}
