document.addEventListener("DOMContentLoaded", () => {
  const accessToken = sessionStorage.getItem("accessToken");
  let selectedStallId = sessionStorage.getItem("selectedStallId");
  let selectedDashboardDate = new Date();
  let ordersChart = null;
  let orderTrendChart = null;
  let selectedBars = [];

  // Page elements
  const stallHeader = document.querySelector(".stall-selector-section");
  const dashboardHeader = document.querySelector(".dashboard-header");
  const navigationBar = document.querySelector(".nav-bar");
  const stallSelect = document.querySelector("#stall-select");
  const selectedStallName = document.querySelector("#selected-stall-name");
  const selectedStallAddress = document.querySelector(
    "#selected-stall-address",
  );
  const selectedStallDescription = document.querySelector(
    "#selected-stall-description",
  );
  const selectedStallRating = document.querySelector("#selected-stall-rating");
  const selectedStallHygieneGrade = document.querySelector(
    "#selected-stall-hygiene-grade",
  );
  const timePeriodSelect = document.querySelector("#time-period");
  const previousPeriodButton = document.querySelector(
    "#previous-period-button",
  );
  const nextPeriodButton = document.querySelector("#next-period-button");
  const selectedPeriodText = document.querySelector("#selected-period-text");
  const dashboardMessage = document.querySelector("#dashboard-message");
  const revenueValue = document.querySelector("#revenue-value");
  const totalOrdersValue = document.querySelector("#total-orders-value");
  const totalUnavailableItemsValue = document.querySelector(
    "#total-unavailable-items-value",
  );
  const totalComplaintsValue = document.querySelector(
    "#total-complaints-value",
  );
  const ordersBreakdownDescription = document.querySelector(
    "#orders-breakdown-description",
  );
  const dineInPercentage = document.querySelector("#dine-in-percentage");
  const pickupPercentage = document.querySelector("#pickup-percentage");
  const deliveryPercentage = document.querySelector("#delivery-percentage");
  const dineInCount = document.querySelector("#dine-in-count");
  const pickupCount = document.querySelector("#pickup-count");
  const deliveryCount = document.querySelector("#delivery-count");
  const cancelledOrdersCount = document.querySelector(
    "#cancelled-orders-count",
  );
  const trendDescription = document.querySelector("#trend-description");
  const comparisonValue = document.querySelector("#comparison-value");
  const comparisonDescription = document.querySelector(
    "#comparison-description",
  );
  const topMenuItemsList = document.querySelector("#top-menu-items-list");
  const noTopMenuItems = document.querySelector("#no-top-menu-items");
  const unavailableMenuItemsList = document.querySelector(
    "#unavailable-menu-items-list",
  );
  const noUnavailableItems = document.querySelector("#no-unavailable-items");
  const activePromotionsList = document.querySelector(
    "#active-promotions-list",
  );
  const noActivePromotions = document.querySelector("#no-active-promotions");

  // Redirect when not logged in
  if (!accessToken) {
    alert("Please log in first.");
    window.location.href = "login.html";
    return;
  }

  // Send request to backend
  async function vendorFetch(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...options.headers,
      },
    });

    let data = {};

    try {
      data = await response.json();
    } catch (error) {
      throw new Error("The server returned an invalid response.");
    }

    if (!response.ok) {
      throw new Error(data.error || "Request failed.");
    }

    return data;
  }

  // Prevent unsafe HTML
  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // Show dashboard message
  function showDashboardMessage(message) {
    if (!dashboardMessage) {
      return;
    }

    dashboardMessage.textContent = message;
    dashboardMessage.hidden = false;
  }

  // Hide dashboard message
  function hideDashboardMessage() {
    if (dashboardMessage) {
      dashboardMessage.hidden = true;
    }
  }

  // Update compact stall header
  function updateStallHeader() {
    if (!stallHeader || !dashboardHeader || !navigationBar) {
      return;
    }

    const navHeight = navigationBar.offsetHeight;
    const compactHeaderHeight = 76;
    const dashboardPosition = dashboardHeader.getBoundingClientRect().top;
    const dashboardIsVisible =
      dashboardPosition >= navHeight + compactHeaderHeight + 10;

    if (dashboardIsVisible) {
      stallHeader.classList.remove("compact");
    } else {
      stallHeader.classList.add("compact");
    }
  }

  // Create one stall option
  function createStallOption(stall) {
    return `
      <option value="${stall.StallID}">
        ${escapeHtml(stall.StallName)}
      </option>
    `;
  }

  // Display selected stall information
  function displaySelectedStall(stalls) {
    const selectedStall = stalls.find(
      (stall) => String(stall.StallID) === String(selectedStallId),
    );

    if (!selectedStall) {
      return;
    }

    const address = [selectedStall.HCName, selectedStall.StallUnitNo]
      .filter(Boolean)
      .join(", ");

    if (selectedStallName) {
      selectedStallName.textContent = selectedStall.StallName || "";
    }

    if (selectedStallAddress) {
      selectedStallAddress.textContent = address;
    }

    if (selectedStallDescription) {
      selectedStallDescription.textContent =
        selectedStall.StallDescription || "";
      selectedStallDescription.hidden = !selectedStall.StallDescription;
    }

    if (selectedStallRating) {
      selectedStallRating.textContent = "";
      selectedStallRating.hidden = true;
    }

    if (selectedStallHygieneGrade) {
      if (selectedStall.HygieneGrade) {
        selectedStallHygieneGrade.textContent = `Hygiene Grade ${selectedStall.HygieneGrade}`;
        selectedStallHygieneGrade.className = `stall-hygiene-grade grade-${selectedStall.HygieneGrade.toLowerCase()}`;
        selectedStallHygieneGrade.hidden = false;
      } else {
        selectedStallHygieneGrade.textContent = "Not inspected";
        selectedStallHygieneGrade.className = "stall-hygiene-grade grade-none";
        selectedStallHygieneGrade.hidden = false;
      }
    }
  }

  // Load vendor stalls
  async function loadVendorStalls() {
    try {
      const stalls = await vendorFetch("/vendor-stalls");

      if (!Array.isArray(stalls) || stalls.length === 0) {
        selectedStallId = null;
        sessionStorage.removeItem("selectedStallId");

        if (stallSelect) {
          stallSelect.innerHTML = '<option value="">No stalls found</option>';
          stallSelect.disabled = true;
        }

        if (selectedStallName) {
          selectedStallName.textContent = "No stalls found";
        }

        if (selectedStallAddress) {
          selectedStallAddress.textContent = "";
        }

        showDashboardMessage("No stalls are linked to this vendor.");
        return false;
      }

      if (stallSelect) {
        stallSelect.innerHTML = stalls.map(createStallOption).join("");
        stallSelect.disabled = false;
      }

      const selectedStallExists = stalls.some(
        (stall) => String(stall.StallID) === String(selectedStallId),
      );

      if (!selectedStallExists) {
        selectedStallId = String(stalls[0].StallID);
        sessionStorage.setItem("selectedStallId", selectedStallId);
      }

      if (stallSelect) {
        stallSelect.value = selectedStallId;
      }

      displaySelectedStall(stalls);
      return true;
    } catch (error) {
      console.error("Error loading vendor stalls:", error);

      if (stallSelect) {
        stallSelect.innerHTML =
          '<option value="">Unable to load stalls</option>';
        stallSelect.disabled = true;
      }

      if (selectedStallName) {
        selectedStallName.textContent = "Unable to load stalls";
      }

      showDashboardMessage(error.message);
      return false;
    }
  }

  // Copy date
  function copyDate(date) {
    return new Date(date.getTime());
  }

  // Get start of week
  function getStartOfWeek(date) {
    const startDate = copyDate(date);
    const dayNumber = startDate.getDay();
    const daysSinceMonday = dayNumber === 0 ? 6 : dayNumber - 1;

    startDate.setDate(startDate.getDate() - daysSinceMonday);
    startDate.setHours(0, 0, 0, 0);

    return startDate;
  }

  // Format date for API
  function formatDateForApi(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  // Get selected dashboard date range
  function getDashboardDateRange() {
    const selectedPeriod = timePeriodSelect.value;
    let startDate = copyDate(selectedDashboardDate);
    let endDate;

    if (selectedPeriod === "daily") {
      startDate.setHours(0, 0, 0, 0);
      endDate = copyDate(startDate);
      endDate.setDate(endDate.getDate() + 1);
    }

    if (selectedPeriod === "weekly") {
      startDate = getStartOfWeek(selectedDashboardDate);
      endDate = copyDate(startDate);
      endDate.setDate(endDate.getDate() + 7);
    }

    if (selectedPeriod === "monthly") {
      startDate = new Date(
        selectedDashboardDate.getFullYear(),
        selectedDashboardDate.getMonth(),
        1,
      );
      endDate = new Date(
        selectedDashboardDate.getFullYear(),
        selectedDashboardDate.getMonth() + 1,
        1,
      );
    }

    if (selectedPeriod === "yearly") {
      startDate = new Date(selectedDashboardDate.getFullYear(), 0, 1);
      endDate = new Date(selectedDashboardDate.getFullYear() + 1, 0, 1);
    }

    return {
      startDate: formatDateForApi(startDate),
      endDate: formatDateForApi(endDate),
    };
  }

  // Format full date
  function formatFullDate(date) {
    return new Intl.DateTimeFormat("en-SG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  // Update selected period text
  function updateSelectedPeriodText() {
    const selectedPeriod = timePeriodSelect.value;

    if (selectedPeriod === "daily") {
      selectedPeriodText.textContent = formatFullDate(selectedDashboardDate);
    }

    if (selectedPeriod === "weekly") {
      const weekStart = getStartOfWeek(selectedDashboardDate);
      const weekEnd = copyDate(weekStart);

      weekEnd.setDate(weekEnd.getDate() + 6);
      selectedPeriodText.textContent = `${formatFullDate(weekStart)} – ${formatFullDate(weekEnd)}`;
    }

    if (selectedPeriod === "monthly") {
      selectedPeriodText.textContent = new Intl.DateTimeFormat("en-SG", {
        month: "long",
        year: "numeric",
      }).format(selectedDashboardDate);
    }

    if (selectedPeriod === "yearly") {
      selectedPeriodText.textContent = String(
        selectedDashboardDate.getFullYear(),
      );
    }
  }

  // Update next period button
  function updateNextPeriodButton() {
    const today = new Date();
    const nextDate = copyDate(selectedDashboardDate);
    const selectedPeriod = timePeriodSelect.value;

    today.setHours(0, 0, 0, 0);

    if (selectedPeriod === "daily") {
      nextDate.setDate(nextDate.getDate() + 1);
    }

    if (selectedPeriod === "weekly") {
      nextDate.setDate(nextDate.getDate() + 7);
    }

    if (selectedPeriod === "monthly") {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    if (selectedPeriod === "yearly") {
      nextDate.setFullYear(nextDate.getFullYear() + 1);
    }

    nextDate.setHours(0, 0, 0, 0);
    nextPeriodButton.disabled = nextDate > today;
  }

  // Change selected period
  function changeDashboardPeriod(direction) {
    const selectedPeriod = timePeriodSelect.value;
    const proposedDate = copyDate(selectedDashboardDate);
    const today = new Date();

    if (selectedPeriod === "daily") {
      proposedDate.setDate(proposedDate.getDate() + direction);
    }

    if (selectedPeriod === "weekly") {
      proposedDate.setDate(proposedDate.getDate() + 7 * direction);
    }

    if (selectedPeriod === "monthly") {
      proposedDate.setMonth(proposedDate.getMonth() + direction);
    }

    if (selectedPeriod === "yearly") {
      proposedDate.setFullYear(proposedDate.getFullYear() + direction);
    }

    today.setHours(0, 0, 0, 0);
    proposedDate.setHours(0, 0, 0, 0);

    if (proposedDate > today) {
      return;
    }

    selectedDashboardDate = proposedDate;
    loadDashboard();
  }

  // Format money
  function formatMoney(value) {
    return `$${Number(value || 0).toFixed(2)}`;
  }

  // Calculate percentage
  function calculatePercentage(value, total) {
    if (!total) {
      return 0;
    }

    return Math.round((Number(value || 0) / Number(total)) * 100);
  }

  // Chart centre text
  const centreTextPlugin = {
    id: "centreText",
    afterDraw(chart) {
      const context = chart.ctx;
      const chartArea = chart.chartArea;
      const centreX = (chartArea.left + chartArea.right) / 2;
      const centreY = (chartArea.top + chartArea.bottom) / 2;
      const values = chart.data.datasets[0].data;
      const totalOrders = values.reduce((total, value) => {
        return total + Number(value || 0);
      }, 0);

      context.save();
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillStyle = "#222222";
      context.font = "800 30px Arial";
      context.fillText(totalOrders, centreX, centreY - 9);
      context.fillStyle = "#777777";
      context.font = "600 13px Arial";
      context.fillText("Total Orders", centreX, centreY + 19);
      context.restore();
    },
  };

  // Create orders doughnut chart
  function createOrdersChart() {
    const canvas = document.querySelector("#ordersChart");

    if (!canvas || typeof Chart === "undefined") {
      return;
    }

    ordersChart = new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: ["Dine-in", "Pickup", "Delivery"],
        datasets: [
          {
            data: [0, 0, 0],
            backgroundColor: ["#f28c28", "#ffc166", "#8f6b4f"],
            borderColor: "#ffffff",
            borderWidth: 4,
            hoverOffset: 10,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "66%",
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label(context) {
                const value = Number(context.raw || 0);
                const values = context.chart.data.datasets[0].data;
                const total = values.reduce((sum, currentValue) => {
                  return sum + Number(currentValue || 0);
                }, 0);
                const percentage = calculatePercentage(value, total);

                return `${value} orders · ${percentage}%`;
              },
            },
          },
        },
      },
      plugins: [centreTextPlugin],
    });
  }

  // Create bar colours
  function createBarColours(numberOfBars) {
    return Array.from({ length: numberOfBars }, (_, index) => {
      if (selectedBars.includes(index)) {
        return "#c4480c";
      }

      return "rgba(250,129,18,0.68)";
    });
  }

  // Create order trend chart
  function createOrderTrendChart() {
    const canvas = document.querySelector("#order-trend-chart");

    if (!canvas || typeof Chart === "undefined") {
      return;
    }

    orderTrendChart = new Chart(canvas, {
      type: "bar",
      data: {
        labels: [],
        datasets: [
          {
            label: "Orders",
            data: [],
            backgroundColor: [],
            borderColor: "#c4480c",
            borderWidth: 1,
            borderRadius: 7,
            borderSkipped: false,
            maxBarThickness: 48,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        onHover(event, chartElements) {
          event.native.target.style.cursor =
            chartElements.length > 0 ? "pointer" : "default";
        },
        onClick(event, chartElements) {
          if (chartElements.length === 0) {
            return;
          }

          selectComparisonBar(chartElements[0].index);
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              color: "#696969",
              maxRotation: 45,
              minRotation: 0,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              color: "#696969",
            },
            grid: {
              color: "rgba(34,34,34,0.08)",
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label(context) {
                return `${context.raw} completed orders`;
              },
            },
          },
        },
      },
    });
  }

  // Reset bar comparison
  function resetComparison() {
    selectedBars = [];

    if (comparisonValue) {
      comparisonValue.textContent = "Select two bars";
    }

    if (comparisonDescription) {
      comparisonDescription.textContent = "Click any two bars in the chart.";
    }
  }

  // Select comparison bar
  function selectComparisonBar(index) {
    if (!orderTrendChart) {
      return;
    }

    if (selectedBars.includes(index)) {
      selectedBars = selectedBars.filter((selectedIndex) => {
        return selectedIndex !== index;
      });
    } else if (selectedBars.length < 2) {
      selectedBars.push(index);
    } else {
      selectedBars = [selectedBars[1], index];
    }

    orderTrendChart.data.datasets[0].backgroundColor = createBarColours(
      orderTrendChart.data.datasets[0].data.length,
    );
    orderTrendChart.update();
    updateComparison();
  }

  // Update comparison result
  function updateComparison() {
    if (!orderTrendChart || !comparisonValue || !comparisonDescription) {
      return;
    }

    if (selectedBars.length !== 2) {
      comparisonValue.textContent = "Select two bars";
      comparisonDescription.textContent = "Click any two bars in the chart.";
      return;
    }

    const firstIndex = selectedBars[0];
    const secondIndex = selectedBars[1];
    const labels = orderTrendChart.data.labels;
    const values = orderTrendChart.data.datasets[0].data;
    const firstValue = Number(values[firstIndex] || 0);
    const secondValue = Number(values[secondIndex] || 0);
    const difference = secondValue - firstValue;
    const percentage =
      firstValue === 0
        ? 0
        : Math.abs(Math.round((difference / firstValue) * 100));
    const direction =
      difference > 0 ? "increase" : difference < 0 ? "decrease" : "change";

    comparisonValue.textContent =
      difference === 0 ? "No difference" : `${percentage}% ${direction}`;
    comparisonDescription.textContent =
      `${labels[firstIndex]}: ${firstValue} orders · ` +
      `${labels[secondIndex]}: ${secondValue} orders`;
  }

  // Format trend label
  function formatTrendLabel(periodStart) {
    const date = new Date(periodStart);
    const selectedPeriod = timePeriodSelect.value;

    if (selectedPeriod === "yearly") {
      return new Intl.DateTimeFormat("en-SG", {
        month: "short",
      }).format(date);
    }

    if (selectedPeriod === "monthly") {
      const endDate = copyDate(date);

      endDate.setDate(endDate.getDate() + 6);

      return `${formatFullDate(date)} – ${formatFullDate(endDate)}`;
    }

    return new Intl.DateTimeFormat("en-SG", {
      day: "numeric",
      month: "short",
    }).format(date);
  }

  // Get order trend description
  function getTrendDescription() {
    const selectedPeriod = timePeriodSelect.value;

    if (selectedPeriod === "daily") {
      return "Completed orders during the selected day.";
    }

    if (selectedPeriod === "weekly") {
      return "Completed orders for each day of the selected week.";
    }

    if (selectedPeriod === "monthly") {
      return "Completed orders grouped by week for the selected month.";
    }

    return "Completed orders grouped by month for the selected year.";
  }

  // Load dashboard summary
  async function loadSummary(dateRange) {
    const baseUrl = `/vendor-dashboard/${selectedStallId}`;
    const results = await Promise.all([
      vendorFetch(
        `${baseUrl}/revenue?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
      ),
      vendorFetch(
        `${baseUrl}/total-orders?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
      ),
      vendorFetch(`${baseUrl}/total-unavailable-items`),
      vendorFetch(
        `${baseUrl}/total-complaints?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
      ),
    ]);

    const revenue = results[0];
    const totalOrders = results[1];
    const unavailableItems = results[2];
    const totalComplaints = results[3];

    revenueValue.textContent = formatMoney(revenue.Revenue);
    totalOrdersValue.textContent = String(totalOrders.TotalOrders || 0);
    totalUnavailableItemsValue.textContent =
      `${unavailableItems.TotalUnavailableItems || 0}/` +
      `${unavailableItems.TotalMenuItems || 0}`;
    totalComplaintsValue.textContent = String(
      totalComplaints.TotalComplaints || 0,
    );
  }

  // Load orders breakdown
  async function loadOrdersBreakdown(dateRange) {
    const data = await vendorFetch(
      `/vendor-dashboard/${selectedStallId}/orders-breakdown` +
        `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
    );

    const dineIn = Number(data.DineIn || 0);
    const pickup = Number(data.Pickup || 0);
    const delivery = Number(data.Delivery || 0);
    const totalOrders = Number(data.TotalOrders || 0);
    const cancelled = Number(data.CancelledOrders || 0);

    dineInCount.textContent = String(dineIn);
    pickupCount.textContent = String(pickup);
    deliveryCount.textContent = String(delivery);
    cancelledOrdersCount.textContent = String(cancelled);

    dineInPercentage.textContent = `${calculatePercentage(dineIn, totalOrders)}% of orders`;
    pickupPercentage.textContent = `${calculatePercentage(pickup, totalOrders)}% of orders`;
    deliveryPercentage.textContent = `${calculatePercentage(delivery, totalOrders)}% of orders`;

    if (ordersBreakdownDescription) {
      ordersBreakdownDescription.textContent =
        "Breakdown of completed orders for the selected period.";
    }

    if (ordersChart) {
      ordersChart.data.datasets[0].data = [dineIn, pickup, delivery];
      ordersChart.update();
    }
  }

  // Load order trend
  async function loadOrderTrend(dateRange) {
    const filterType = timePeriodSelect.value;
    const data = await vendorFetch(
      `/vendor-dashboard/${selectedStallId}/order-trend` +
        `?startDate=${dateRange.startDate}` +
        `&endDate=${dateRange.endDate}` +
        `&filterType=${filterType}`,
    );

    const trendRows = Array.isArray(data.orderTrend) ? data.orderTrend : [];
    const labels = trendRows.map((row) => {
      return formatTrendLabel(row.PeriodStart);
    });
    const values = trendRows.map((row) => {
      return Number(row.TotalOrders || 0);
    });

    resetComparison();
    trendDescription.textContent = getTrendDescription();

    if (orderTrendChart) {
      orderTrendChart.data.labels = labels;
      orderTrendChart.data.datasets[0].data = values;
      orderTrendChart.data.datasets[0].backgroundColor = createBarColours(
        values.length,
      );
      orderTrendChart.update();
    }
  }

  // Load top menu items
  async function loadTopMenuItems(dateRange) {
    const items = await vendorFetch(
      `/vendor-dashboard/${selectedStallId}/top-menu-items` +
        `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
    );

    topMenuItemsList.innerHTML = "";

    if (!Array.isArray(items) || items.length === 0) {
      noTopMenuItems.hidden = false;
      return;
    }

    noTopMenuItems.hidden = true;

    topMenuItemsList.innerHTML = items
      .slice(0, 3)
      .map((item) => {
        const imageHtml = item.ImageURL
          ? `
          <img
            class="top-menu-item-image"
            src="${escapeHtml(item.ImageURL)}"
            alt="${escapeHtml(item.ItemName)}"
          />
        `
          : "";

        return `
        <li class="menu-item-card">
          ${imageHtml}
          <strong class="menu-item-name">
            ${escapeHtml(item.ItemName)}
          </strong>
          <span class="menu-item-orders">
            Orders: ${Number(item.TotalOrders || 0)}
          </span>
        </li>
      `;
      })
      .join("");
  }

  // Load unavailable menu items
  async function loadUnavailableMenuItems() {
    const items = await vendorFetch(
      `/vendor-dashboard/${selectedStallId}/unavailable-menu-items`,
    );

    unavailableMenuItemsList.innerHTML = "";

    if (!Array.isArray(items) || items.length === 0) {
      noUnavailableItems.hidden = false;
      return;
    }

    noUnavailableItems.hidden = true;
    unavailableMenuItemsList.innerHTML = items
      .map((item) => {
        return `
          <li class="menu-item-card">
            ${escapeHtml(item.ItemName)}
          </li>
        `;
      })
      .join("");
  }

  // Format promotion date
  function formatPromotionDate(dateValue) {
    if (!dateValue) {
      return "-";
    }

    return new Intl.DateTimeFormat("en-SG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateValue));
  }

  // Load active promotions
  async function loadActivePromotions() {
    const promotions = await vendorFetch(
      `/vendor-dashboard/${selectedStallId}/active-promotions`,
    );

    activePromotionsList.innerHTML = "";

    if (!Array.isArray(promotions) || promotions.length === 0) {
      noActivePromotions.hidden = false;
      return;
    }

    noActivePromotions.hidden = true;
    activePromotionsList.innerHTML = promotions
      .map((promotion) => {
        return `
          <li class="promotion-card">
            ${escapeHtml(promotion.PromotionName)}
            <small>
              ${formatPromotionDate(promotion.StartDate)}
              –
              ${formatPromotionDate(promotion.EndDate)}
            </small>
          </li>
        `;
      })
      .join("");
  }

  // Reset dashboard display
  function resetDashboardValues() {
    revenueValue.textContent = "—";
    totalOrdersValue.textContent = "—";
    totalUnavailableItemsValue.textContent = "—";
    totalComplaintsValue.textContent = "—";
    topMenuItemsList.innerHTML = "";
    unavailableMenuItemsList.innerHTML = "";
    activePromotionsList.innerHTML = "";
    noTopMenuItems.hidden = true;
    noUnavailableItems.hidden = true;
    noActivePromotions.hidden = true;
  }

  // Load complete dashboard
  async function loadDashboard() {
    if (!selectedStallId) {
      showDashboardMessage("Select a stall to view the dashboard.");
      return;
    }

    updateSelectedPeriodText();
    updateNextPeriodButton();
    resetDashboardValues();
    hideDashboardMessage();

    const dateRange = getDashboardDateRange();

    try {
      await Promise.all([
        loadSummary(dateRange),
        loadOrdersBreakdown(dateRange),
        loadOrderTrend(dateRange),
        loadTopMenuItems(dateRange),
        loadUnavailableMenuItems(),
        loadActivePromotions(),
      ]);
    } catch (error) {
      console.error("Error loading dashboard:", error);
      showDashboardMessage(error.message);
    }
  }

  // Change selected stall
  stallSelect?.addEventListener("change", async () => {
    selectedStallId = stallSelect.value;

    if (!selectedStallId) {
      return;
    }

    sessionStorage.setItem("selectedStallId", selectedStallId);

    try {
      const stalls = await vendorFetch("/vendor-stalls");
      displaySelectedStall(stalls);
      await loadDashboard();
    } catch (error) {
      console.error("Error changing stall:", error);
      showDashboardMessage(error.message);
    }
  });

  // Change dashboard period
  previousPeriodButton?.addEventListener("click", () => {
    changeDashboardPeriod(-1);
  });

  nextPeriodButton?.addEventListener("click", () => {
    changeDashboardPeriod(1);
  });

  timePeriodSelect?.addEventListener("change", () => {
    selectedDashboardDate = new Date();
    selectedDashboardDate.setHours(0, 0, 0, 0);
    loadDashboard();
  });

  // Compact stall header
  window.addEventListener("scroll", updateStallHeader);
  window.addEventListener("resize", updateStallHeader);

  // Initial page load
  async function initialiseDashboardPage() {
    selectedDashboardDate.setHours(0, 0, 0, 0);
    createOrdersChart();
    createOrderTrendChart();
    updateStallHeader();

    const stallsLoaded = await loadVendorStalls();

    if (!stallsLoaded) {
      return;
    }

    await loadDashboard();
  }

  initialiseDashboardPage();
});
