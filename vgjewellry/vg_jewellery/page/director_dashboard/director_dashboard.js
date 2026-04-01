frappe.pages['director-dashboard'].on_page_load = function(wrapper) {

	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Director Dashboard',
		single_column: true
	});

	$(page.body).addClass('corp-dashboard');

	// ================= CSS =================
	$(`<style>

	.corp-dashboard {
		background: #f4f6fb;
		padding: 20px;
		font-family: "Inter", sans-serif;
	}

	/* HEADER (Dark Card) */
	.top-banner {
		background: linear-gradient(135deg, #1f3bb3, #0d1b3e);
		border-radius: 20px;
		padding: 20px;
		color: white;
		margin-bottom: 20px;
		display: flex;
		flex-wrap: wrap;
		gap: 15px;
		align-items: center;
	}


	/* FILTERS */
	.filters {
		display: flex;
		gap: 10px;
		margin-bottom: 20px;
	}

	.filters input, .filters button {
		border-radius: 10px;
	}

	/* TABS */
	.tabs {
		display: flex;
		gap: 10px;
		margin-bottom: 20px;
	}

	.tab {
		flex: 1;
		padding: 10px;
		border-radius: 10px;
		border: none;
		background: #e9edf5;
		font-weight: 500;
		cursor: pointer;
	}

	.tab.active {
		background: #1f3bb3;
		color: white;
	}

	/* KPI CARDS */
	.card-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 15px;
	}


	/* STATS ROW */
	.stats-row {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 15px;
		margin-top: 20px;
	}

	.stat-box {
		background: white;
		padding: 20px;
		border-radius: 15px;
		text-align: center;
		box-shadow: 0 4px 10px rgba(0,0,0,0.05);
	}

	.stat-value {
		font-size: 22px;
		font-weight: bold;
	}

	.stat-label {
		font-size: 13px;
		color: #6c757d;
	}

	/* MOBILE */
	@media (max-width: 768px) {
		.card-grid {
			grid-template-columns: 1fr;
		}

		.stats-row {
			grid-template-columns: repeat(2, 1fr);
		}

		.filters {
			flex-direction: column;
		}
	}

	</style>`).appendTo(page.body);

	// ================= HEADER =================
	const header = $(`
<div class="rate-strip">

    <div class="rate-box">
	<div class="rate-label">Gold 24K / 1G</div>
	<div class="rate-value" id="gold_rate">₹ </div>
    </div>

    <div class="rate-box">
	<div class="rate-label">Silver / 1KG</div>
	<div class="rate-value" id="silver_rate">₹ </div>
    </div>


</div>
`).appendTo(page.body);
	$(`<style>

.rate-strip {
    display: flex;
    gap: 10px;
    overflow-x: auto;
    padding: 10px;
    border-radius: 14px;
    background: linear-gradient(135deg, #1f3bb3, #0d1b3e);
    margin-bottom: 15px;
}

/* hide scrollbar (clean look) */
.rate-strip::-webkit-scrollbar {
    display: none;
}

/* each item */
.rate-box {
    min-width: 110px;
    flex: 0 0 auto;
    background: rgba(255,255,255,0.08);
    padding: 10px;
    border-radius: 10px;
    text-align: center;
}

/* label */
.rate-label {
    font-size: 12px;
    color: rgba(255,255,255,0.7);
}

/* value */
.rate-value {
    font-size: 16px;
    font-weight: 600;
    color: #fff;
}

/* desktop center align */
@media (min-width: 768px) {
    .rate-strip {
	justify-content: center;
    }
}

</style>`).appendTo(page.body);
	// ================= FILTERS =================
	//
	const filters = $(`
<div class="date-strip">

    <input type="date" class="date-input from-date">
    <input type="date" class="date-input to-date">
<button class="btn btn-primary btn-sm get-data" title="Get Data">
    <i class="fa fa-search"></i>
</button>	

</div>
`).appendTo(page.body);
	$(`<style>

.date-strip {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 15px;
}

/* Date inputs */
.date-input {
    flex: 1; /* equal width */
    height: 36px;
    border-radius: 10px;
    border: 1px solid #d0d5dd;
    padding: 0 8px;
    font-size: 13px;
    background: #fff;
}

/* Button */

.get-data {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 10px;
}

.get-data i {
    font-size: 14px;
}

/* Mobile tweak */
@media (max-width: 480px) {
    .date-input {
	font-size: 12px;
	padding: 0 6px;
    }

    .get-data {
	padding: 0 10px;
    }
}

</style>`).appendTo(page.body);

	// ================= TABS =================
	$(`
	<div class="tabs">
		<button class="tab active" data-tab="22kt">22 KT</button>
		<button class="tab" data-tab="18kt">18 KT</button>
		<button class="tab" data-tab="di">DI</button>
		<button class="tab" data-tab="24kt">24 KT</button>
	</div>
	`).appendTo(page.body);

	$(`<style>
.kpi-card {
    background: white;
    border-radius: 15px;
    padding: 18px;
    box-shadow: 0 6px 16px rgba(0,0,0,0.05);
}

.kpi-title {
    font-size: 14px;
    color: #6c757d;
    margin-bottom: 10px;
    font-weight: 500;
}

.kpi-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.kpi-left {
    font-size: 16px;
    font-weight: 500;
    color: #1f3bb3;
}

.kpi-right {
    font-size: 16px;
    font-weight: 600;
    color: #28a745;
}
</style>`).appendTo(page.body);

	const content = $(`<div></div>`).appendTo(page.body);

	// ================= FUNCTIONS =================
	function card(title, d) {
		return `
		 <div class="kpi-card">
	<div class="kpi-title">${title}</div>
	<div class="kpi-row">
	    <div class="kpi-left">Wt: ${d.weight || 0}</div>
	    <div class="kpi-right">₹ ${d.amount || 0}</div>
	</div>
    </div> `;
	}

	function render(data, tab) {
		return `
		<h4 style="margin-bottom:10px">${tab.toUpperCase()} Summary</h4>
		<div class="card-grid">
			${card("Today Sale", data.today || {})}
			${card("Old Gold Purchase", data.old || {})}
			${card("Net Sale", data.net || {})}
		</div>

		<div class="stats-row" style="display:none">
			<div class="stat-box">
				<div class="stat-value">₹ 48.25L</div>
				<div class="stat-label">Today's Sales</div>
			</div>
			<div class="stat-box">
				<div class="stat-value">147</div>
				<div class="stat-label">Orders</div>
			</div>
			<div class="stat-box">
				<div class="stat-value">89</div>
				<div class="stat-label">Customers</div>
			</div>
			<div class="stat-box">
				<div class="stat-value">₹ 1.25Cr</div>
				<div class="stat-label">Revenue</div>
			</div>
		</div>
		`;
			}

				function loadData() {
					const tab = $('.tab.active').data('tab');

					content.html("Loading...");

					frappe.call({
						method: 'vgjewellry.dashboard.get_data',
						args: {
							from_date: $('.from-date').val(),
							to_date: $('.to-date').val()
						},
						callback: function(r) {
							content.html(render(r.message.data[tab], tab));
							$("#gold_rate").text('₹ '+r.message.rate.g)
							$("#silver_rate").text('₹ '+r.message.rate.s)
						}
					});
				}

				// ================= EVENTS =================
				$(document).on('click', '.get-data', loadData);

				$(document).on('click', '.tab', function() {
					$('.tab').removeClass('active');
					$(this).addClass('active');
					loadData();
				});

				// Default load
				const today = frappe.datetime.get_today();
				$('.from-date').val(today);
				$('.to-date').val(today);

				loadData();
			};
