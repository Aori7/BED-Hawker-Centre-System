/*
hard coded/ temporary data 
    orderValues
    orderTrendsData
    selectedStallId 
*/

/* =====================================================
     PAGE ELEMENTS
     ===================================================== */

/* Compact stall header elements */
const stallHeader = document.querySelector(".stall-selector-section");
const dashboardHeader = document.querySelector(".dashboard-header");
const navigationBar = document.querySelector(".nav-bar");

/* Dashboard time filter elements */
const timePeriodSelect = document.getElementById("time-period");
const previousPeriodButton = document.getElementById("previous-period-button");
const nextPeriodButton = document.getElementById("next-period-button");
const selectedPeriodText = document.getElementById("selected-period-text");

/* summary card elements */
const revenueValue = document.getElementById("revenue-value");

/* Order Trends elements */
const trendDescription = document.getElementById("trend-description");
const comparisonBox = document.getElementById("order-comparison");
const comparisonValue = document.getElementById("comparison-value");
const comparisonDescription = document.getElementById("comparison-description");

/* =====================================================
     COMPACT STALL HEADER
     ===================================================== */

function updateStallHeader() {
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

/* =====================================================
   DASHBOARD TIME FILTER
   ===================================================== */

// Temporary stall ID until the stall selector is connected to the backend.
const selectedStallId = 1;

let selectedDashboardDate = new Date();

function copyDate(date) {
  return new Date(date.getTime());
}

function getStartOfWeek(date) {
  const startDate = copyDate(date);
  const dayNumber = startDate.getDay();
  const daysSinceMonday = dayNumber === 0 ? 6 : dayNumber - 1;

  startDate.setDate(startDate.getDate() - daysSinceMonday);
  return startDate;
}

function formatDateForApi(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDashboardDateRange() {
  const selectedPeriod = timePeriodSelect.value;
  let startDate = copyDate(selectedDashboardDate);
  let endDate;

  if (selectedPeriod === "daily") {
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

function formatFullDate(date) {
  return new Intl.DateTimeFormat("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function updateSelectedPeriodText() {
  const selectedPeriod = timePeriodSelect.value;

  if (selectedPeriod === "daily") {
    selectedPeriodText.textContent = formatFullDate(selectedDashboardDate);
  }

  if (selectedPeriod === "weekly") {
    const weekStart = getStartOfWeek(selectedDashboardDate);
    const weekEnd = copyDate(weekStart);

    weekEnd.setDate(weekEnd.getDate() + 6);
    selectedPeriodText.textContent =
      formatFullDate(weekStart) + " – " + formatFullDate(weekEnd);
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

async function loadRevenue() {
  try {
    const dateRange = getDashboardDateRange();

    const response = await fetch(
      `/vendor-dashboard/${selectedStallId}/revenue` +
        `?startDate=${dateRange.startDate}` +
        `&endDate=${dateRange.endDate}`,
    );

    if (!response.ok) {
      throw new Error(`Revenue request failed: ${response.status}`);
    }

    const data = await response.json();

    revenueValue.textContent = `$${Number(data.Revenue).toFixed(2)}`;
  } catch (error) {
    console.error("Error loading revenue:", error);
    revenueValue.textContent = "NA";
  }
}

function changeDashboardPeriod(direction) {
  const selectedPeriod = timePeriodSelect.value;

  if (selectedPeriod === "daily") {
    selectedDashboardDate.setDate(selectedDashboardDate.getDate() + direction);
  }

  if (selectedPeriod === "weekly") {
    selectedDashboardDate.setDate(
      selectedDashboardDate.getDate() + 7 * direction,
    );
  }

  if (selectedPeriod === "monthly") {
    selectedDashboardDate.setMonth(
      selectedDashboardDate.getMonth() + direction,
    );
  }

  if (selectedPeriod === "yearly") {
    selectedDashboardDate.setFullYear(
      selectedDashboardDate.getFullYear() + direction,
    );
  }

  updateDashboardForSelectedPeriod();
}

function updateDashboardForSelectedPeriod() {
  updateSelectedPeriodText();
  loadRevenue();

  console.log({
    period: timePeriodSelect.value,
    selectedDate: selectedDashboardDate.toISOString(),
  });
}

/* =====================================================
     ORDERS DOUGHNUT CHART
     ===================================================== */

/*Temporary sample data.*/
const orderValues = [18, 20, 12];

const centreTextPlugin = {
  id: "centreText",

  afterDraw(chart) {
    const context = chart.ctx;
    const chartArea = chart.chartArea;
    const centreX = (chartArea.left + chartArea.right) / 2;
    const centreY = (chartArea.top + chartArea.bottom) / 2;
    const currentOrderValues = chart.data.datasets[0].data;
    const totalOrders = currentOrderValues.reduce(function (total, value) {
      return total + value;
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

const ordersChart = new Chart(document.getElementById("ordersChart"), {
  type: "doughnut",

  data: {
    labels: ["Dine-in", "Pickup", "Delivery"],

    datasets: [
      {
        data: orderValues,
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

    /*
            A larger percentage creates a larger hole
            in the centre of the chart.
          */
    cutout: "66%",

    plugins: {
      /*
              We are using our own HTML legend, so the
              default Chart.js legend is hidden.
            */
      legend: {
        display: false,
      },

      tooltip: {
        callbacks: {
          /*
                  Controls the text displayed when the
                  vendor hovers over a chart section.
                */
          label(context) {
            const value = context.raw;

            const currentValues = context.chart.data.datasets[0].data;

            const total = currentValues.reduce(function (sum, currentValue) {
              return sum + currentValue;
            }, 0);

            const percentage =
              total === 0 ? 0 : Math.round((value / total) * 100);

            return value + " orders · " + percentage + "%";
          },
        },
      },
    },
  },

  plugins: [centreTextPlugin],
});

/* =====================================================
     ORDER TRENDS BAR CHART
     ===================================================== */

/*
    Temporary sample data.

    Later, these values will come from the backend based
    on the selected stall, date and time period.
  */
const orderTrendData = {
  daily: {
    labels: [
      "11 Jul",
      "12 Jul",
      "13 Jul",
      "14 Jul",
      "15 Jul",
      "16 Jul",
      "17 Jul",
    ],

    values: [31, 38, 29, 45, 36, 42, 50],

    description: "Orders grouped by day over the last seven days.",
  },

  weekly: {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],

    values: [31, 35, 29, 41, 46, 58, 50],

    description: "Orders received on each day of the selected week.",
  },

  monthly: {
    labels: ["1–7 Jul", "8–14 Jul", "15–21 Jul", "22–31 Jul"],

    values: [205, 246, 228, 271],

    description:
      "Orders grouped into weekly date ranges for the selected month.",
  },

  yearly: {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],

    values: [720, 680, 790, 755, 830, 910, 875, 940, 885, 960, 1010, 1085],

    description: "Orders received during each month of the selected year.",
  },
};

/*
    Stores the indexes of the bars selected by the vendor.

    A maximum of two bars may be selected.
  */
let selectedBars = [];

/*
    Returns the colour for each bar.

    Selected bars use the darker orange so they remain
    visually distinguishable.
  */
function createBarColours(numberOfBars) {
  return Array.from(
    {
      length: numberOfBars,
    },

    function (_, index) {
      if (selectedBars.includes(index)) {
        return "#c4480c";
      }

      return "rgba(250, 129, 18, 0.68)";
    },
  );
}

const initialTrendData = orderTrendData[timePeriodSelect.value];

const orderTrendChart = new Chart(
  document.getElementById("order-trend-chart"),
  {
    type: "bar",

    data: {
      labels: initialTrendData.labels,

      datasets: [
        {
          label: "Orders",

          data: initialTrendData.values,

          backgroundColor: createBarColours(initialTrendData.values.length),

          borderColor: "#c4480c",

          borderWidth: 1,

          borderRadius: 7,

          borderSkipped: false,

          /*
                Controls the maximum thickness of each bar.
              */
          maxBarThickness: 48,
        },
      ],
    },

    options: {
      responsive: true,

      maintainAspectRatio: false,

      /*
            Makes the mouse pointer change when the vendor
            hovers over a selectable bar.
          */
      onHover(event, chartElements) {
        event.native.target.style.cursor =
          chartElements.length > 0 ? "pointer" : "default";
      },

      /*
            Runs when a bar is clicked.
          */
      onClick(event, chartElements) {
        if (chartElements.length === 0) {
          return;
        }

        const clickedIndex = chartElements[0].index;

        selectComparisonBar(clickedIndex);
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

          title: {
            display: true,

            text: "Period",
          },
        },

        y: {
          beginAtZero: true,

          ticks: {
            precision: 0,

            color: "#696969",
          },

          grid: {
            color: "rgba(34, 34, 34, 0.08)",
          },

          title: {
            display: true,

            text: "Number of orders",
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
              return context.raw + " orders";
            },

            afterLabel() {
              return "Click to compare";
            },
          },
        },
      },
    },
  },
);

/* =====================================================
     ORDER TRENDS BAR SELECTION
     ===================================================== */

/*
    Selects or removes a bar from the comparison.
  */
function selectComparisonBar(clickedIndex) {
  const existingSelection = selectedBars.indexOf(clickedIndex);

  /*
      Clicking an already-selected bar deselects it.
    */
  if (existingSelection !== -1) {
    selectedBars.splice(existingSelection, 1);
  } else if (selectedBars.length < 2) {
    selectedBars.push(clickedIndex);
  } else {
    /*
        If two bars are already selected, clicking a new
        bar starts a new comparison.
      */
    selectedBars = [clickedIndex];
  }

  updateSelectedBarColours();

  updateComparisonResult();
}

/*
    Refreshes the bar colours after a selection changes.
  */
function updateSelectedBarColours() {
  const numberOfBars = orderTrendChart.data.labels.length;

  orderTrendChart.data.datasets[0].backgroundColor =
    createBarColours(numberOfBars);

  orderTrendChart.update();
}

/*
    Displays the percentage difference between the two
    selected bars.
  */
function updateComparisonResult() {
  comparisonBox.classList.remove("increase", "decrease", "no-change");

  if (selectedBars.length === 0) {
    comparisonValue.textContent = "Select two bars";

    comparisonDescription.textContent = "Click any two bars in the chart.";

    return;
  }

  if (selectedBars.length === 1) {
    const selectedIndex = selectedBars[0];

    const selectedLabel = orderTrendChart.data.labels[selectedIndex];

    comparisonValue.textContent = selectedLabel + " selected";

    comparisonDescription.textContent = "Select one more bar to compare.";

    return;
  }

  const firstIndex = selectedBars[0];

  const secondIndex = selectedBars[1];

  const firstLabel = orderTrendChart.data.labels[firstIndex];

  const secondLabel = orderTrendChart.data.labels[secondIndex];

  const firstValue = orderTrendChart.data.datasets[0].data[firstIndex];

  const secondValue = orderTrendChart.data.datasets[0].data[secondIndex];

  /*
      A percentage difference cannot be calculated using
      zero as the starting value.
    */
  if (firstValue === 0) {
    comparisonValue.textContent = "Comparison unavailable";

    comparisonDescription.textContent = firstLabel + " recorded zero orders.";

    return;
  }

  const percentageDifference = ((secondValue - firstValue) / firstValue) * 100;

  const roundedDifference = Math.abs(Math.round(percentageDifference));

  if (percentageDifference > 0) {
    comparisonBox.classList.add("increase");

    comparisonValue.textContent = "↑ " + roundedDifference + "%";

    comparisonDescription.textContent =
      secondLabel + " had more orders than " + firstLabel + ".";
  } else if (percentageDifference < 0) {
    comparisonBox.classList.add("decrease");

    comparisonValue.textContent = "↓ " + roundedDifference + "%";

    comparisonDescription.textContent =
      secondLabel + " had fewer orders than " + firstLabel + ".";
  } else {
    comparisonBox.classList.add("no-change");

    comparisonValue.textContent = "No change";

    comparisonDescription.textContent =
      firstLabel + " and " + secondLabel + " had the same order total.";
  }
}

/*
    Updates the chart when the vendor changes the main
    dashboard time filter.
  */
function updateOrderTrendChart() {
  const selectedPeriod = timePeriodSelect.value;

  const selectedData = orderTrendData[selectedPeriod];

  /*
      Previous bar selections are cleared because the
      chart now represents different periods.
    */
  selectedBars = [];

  orderTrendChart.data.labels = selectedData.labels;
  orderTrendChart.data.datasets[0].data = selectedData.values;
  orderTrendChart.data.datasets[0].backgroundColor = createBarColours(
    selectedData.values.length,
  );
  trendDescription.textContent = selectedData.description;
  updateComparisonResult();
  orderTrendChart.update();
}

/* =====================================================
     EVENT LISTENERS
     ===================================================== */

window.addEventListener("scroll", updateStallHeader);
window.addEventListener("resize", updateStallHeader);

previousPeriodButton.addEventListener("click", function () {
  changeDashboardPeriod(-1);
});

nextPeriodButton.addEventListener("click", function () {
  changeDashboardPeriod(1);
});

timePeriodSelect.addEventListener("change", function () {
  updateDashboardForSelectedPeriod();
  updateOrderTrendChart();
});

/* =====================================================
     INITIAL PAGE SETUP
     ===================================================== */

updateStallHeader();
updateDashboardForSelectedPeriod();
updateOrderTrendChart();
