document.addEventListener("DOMContentLoaded", () => {
  const openHistoryBtn = document.getElementById("open-history-btn");

  const closeHistoryBtn = document.getElementById("close-history");

  const historySidebar = document.getElementById("order-history-sidebar");

  const historyOverlay = document.getElementById("history-overlay");

  const historyList = document.getElementById("history-list");

  const recentOrderCount = document.getElementById("recent-order-count");
  const fullHistoryList = document.getElementById("full-order-history-list");

  const historyEmpty = document.getElementById("order-history-empty");

  const historyResultCount = document.getElementById("history-result-count");

  const totalOrdersCount = document.getElementById("total-orders-count");

  const totalSpent = document.getElementById("total-spent");

  const favouriteStall = document.getElementById("favourite-stall");

  if (
    !openHistoryBtn ||
    !closeHistoryBtn ||
    !historySidebar ||
    !historyOverlay
  ) {
    return;
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatDate(dateValue) {
    const date = new Date(dateValue);

    return date.toLocaleDateString("en-SG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatTime(dateValue) {
    const date = new Date(dateValue);

    return date.toLocaleTimeString("en-SG", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getStatusClass(status) {
    switch (status) {
      case "Completed":
        return "completed";

      case "Preparing":
      case "Ready for Collection":
        return "preparing";

      case "Cancelled":
        return "cancelled";

      default:
        return "pending";
    }
  }

  function displayRecentOrders(orders) {
    historyList.innerHTML = "";

    recentOrderCount.textContent = `${orders.length} recent ${
      orders.length === 1 ? "order" : "orders"
    }`;

    if (orders.length === 0) {
      historyList.innerHTML = `
                    <div class="history-empty">
                        <span class="material-symbols-rounded">
                            receipt_long
                        </span>

                        <h3>No orders yet</h3>

                        <p>
                            Your recent orders will appear
                            here after you place one.
                        </p>

                        <a href="/html/order-hawker.html">
                            Start Ordering
                        </a>
                    </div>
                `;

      return;
    }

    orders.forEach((order) => {
      const card = document.createElement("article");

      card.className = "history-card";

      card.innerHTML = `
                    <div class="history-card-top">
                        <div class="history-stall-icon">
                            <span class="material-symbols-rounded">
                                restaurant
                            </span>
                        </div>

                        <div class="history-card-heading">
                            <h3>
                                ${escapeHTML(order.StallName)}
                            </h3>

                            <p>
                                Order #${order.OrderID}
                            </p>
                        </div>

                        <span
                            class="history-status
                            ${getStatusClass(order.OrderStatus)}"
                        >
                            ${escapeHTML(order.OrderStatus)}
                        </span>
                    </div>

                    <div class="history-order-info">
                        <div>
                            <span class="material-symbols-rounded">
                                shopping_bag
                            </span>

                            <p>
                                <strong>
                                    ${order.ItemCount}
                                    ${order.ItemCount === 1 ? "item" : "items"}
                                </strong>

                                <small>
                                    ${escapeHTML(order.OrderType)}
                                </small>
                            </p>
                        </div>

                        <div>
                            <span class="material-symbols-rounded">
                                calendar_today
                            </span>

                            <p>
                                <strong>
                                    ${formatDate(order.OrderDateTime)}
                                </strong>

                                <small>
                                    ${formatTime(order.OrderDateTime)}
                                </small>
                            </p>
                        </div>
                    </div>

                    <div class="history-total-row">
                        <span>Total amount</span>

                        <strong>
                            $${Number(order.TotalAmount).toFixed(2)}
                        </strong>
                    </div>

                    <div class="history-card-actions">
                        <button
                            type="button"
                            class="view-receipt-btn"
                            data-order-id="${order.OrderID}"
                        >
                            <span class="material-symbols-rounded">
                                description
                            </span>

                            Receipt
                        </button>

                        <button
                            type="button"
                            class="reorder-btn"
                            data-order-id="${order.OrderID}"
                        >
                            <span class="material-symbols-rounded">
                                refresh
                            </span>

                            Reorder
                        </button>
                    </div>
                `;

      historyList.appendChild(card);
    });
  }
  function displayFullOrderHistory(orders) {
    if (!fullHistoryList) {
      return;
    }

    fullHistoryList.innerHTML = "";

    historyResultCount.textContent = `Showing ${orders.length} ${
      orders.length === 1 ? "order" : "orders"
    }`;

    if (orders.length === 0) {
      historyEmpty.style.display = "block";
      return;
    }

    historyEmpty.style.display = "none";

    orders.forEach((order) => {
      const card = document.createElement("article");

      card.className = "full-history-card";

      card.innerHTML = `
      <div class="full-history-main">
        <div class="full-history-top">
          <div class="full-history-stall">
            <div class="full-history-stall-icon">
              <span class="material-symbols-rounded">
                restaurant
              </span>
            </div>

            <div>
              <h3>${escapeHTML(order.StallName)}</h3>

              <p>
                Order #${order.OrderID}
                •
                ${formatDate(order.OrderDateTime)}
              </p>
            </div>
          </div>

          <span class="full-history-status
            ${getStatusClass(order.OrderStatus)}">
            ${escapeHTML(order.OrderStatus)}
          </span>
        </div>

        <div class="full-history-details">
          <div class="full-history-detail">
            <span>Order Type</span>
            <strong>${escapeHTML(order.OrderType)}</strong>
          </div>

          <div class="full-history-detail">
            <span>Payment</span>
            <strong>${escapeHTML(order.PaymentMethod)}</strong>
          </div>

          <div class="full-history-detail">
            <span>Items</span>
            <strong>
              ${order.ItemCount}
              ${order.ItemCount === 1 ? "item" : "items"}
            </strong>
          </div>

          <div class="full-history-detail">
            <span>Time</span>
            <strong>${formatTime(order.OrderDateTime)}</strong>
          </div>
        </div>
      </div>

      <div class="full-history-side">
        <div class="full-history-total">
          <span>Total Amount</span>
          <strong>
            $${Number(order.TotalAmount).toFixed(2)}
          </strong>
        </div>

        <div class="full-history-actions">
          <button
            type="button"
            class="full-receipt-btn"
            data-order-id="${order.OrderID}"
          >
            View Receipt
          </button>

          <button
            type="button"
            class="full-reorder-btn"
            data-order-id="${order.OrderID}"
          >
            Reorder
          </button>
        </div>
      </div>
    `;

      fullHistoryList.appendChild(card);
    });
  }
  function updateHistoryOverview(orders) {
    totalOrdersCount.textContent = orders.length;

    const spent = orders.reduce(
      (sum, order) => sum + Number(order.TotalAmount),
      0,
    );

    totalSpent.textContent = `$${spent.toFixed(2)}`;

    if (orders.length === 0) {
      favouriteStall.textContent = "-";
      return;
    }

    const stallCounts = {};

    orders.forEach((order) => {
      stallCounts[order.StallName] = (stallCounts[order.StallName] || 0) + 1;
    });

    const mostOrderedStall = Object.entries(stallCounts).sort(
      (a, b) => b[1] - a[1],
    )[0][0];

    favouriteStall.textContent = mostOrderedStall;
  }
  async function loadFullOrderHistory() {
    if (!fullHistoryList) {
      return;
    }

    const customerID = sessionStorage.getItem("customerID");

    const accessToken = sessionStorage.getItem("accessToken");

    if (!customerID || !accessToken) {
      fullHistoryList.innerHTML = "";

      historyEmpty.style.display = "block";
      historyEmpty.querySelector("h2").textContent = "Please log in";

      historyEmpty.querySelector("p").textContent =
        "Log in to view your order history.";

      return;
    }

    try {
      const response = await fetch(`/orders/customer/${customerID}/recent`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load order history");
      }

      displayFullOrderHistory(data);
      updateHistoryOverview(data);
    } catch (error) {
      console.error("Load full order history error:", error);

      fullHistoryList.innerHTML = `
      <div class="history-page-loading">
        <span class="material-symbols-rounded">
          error
        </span>

        <p>Unable to load your orders.</p>
      </div>
    `;
    }
  }
  async function loadRecentOrders() {
    const customerID = sessionStorage.getItem("customerID");

    const accessToken = sessionStorage.getItem("accessToken");

    if (!customerID || !accessToken) {
      historyList.innerHTML = `
                    <div class="history-empty">
                        <span class="material-symbols-rounded">
                            lock
                        </span>

                        <h3>Log in to view orders</h3>

                        <p>
                            Your recent order history is
                            available after logging in.
                        </p>

                        <a href="/html/login.html">
                            Log In
                        </a>
                    </div>
                `;

      recentOrderCount.textContent = "Order history";

      return;
    }

    historyList.innerHTML = `
                <p class="history-loading">
                    Loading your recent orders...
                </p>
            `;

    try {
      const response = await fetch(`/orders/customer/${customerID}/recent`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to retrieve orders");
      }

      displayRecentOrders(data);
    } catch (error) {
      console.error("Load recent orders error:", error);

      historyList.innerHTML = `
                    <div class="history-empty">
                        <span class="material-symbols-rounded">
                            error
                        </span>

                        <h3>Unable to load orders</h3>

                        <p>
                            Please try opening the sidebar
                            again.
                        </p>
                    </div>
                `;
    }
  }

  function openHistory() {
    historySidebar.classList.add("active");

    historyOverlay.classList.add("active");

    document.body.style.overflow = "hidden";

    loadRecentOrders();
  }

  function closeHistory() {
    historySidebar.classList.remove("active");

    historyOverlay.classList.remove("active");

    document.body.style.overflow = "";
  }

  openHistoryBtn.addEventListener("click", openHistory);

  closeHistoryBtn.addEventListener("click", closeHistory);

  historyOverlay.addEventListener("click", closeHistory);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeHistory();
    }
  });

  historyList.addEventListener("click", (event) => {
    const receiptButton = event.target.closest(".view-receipt-btn");

    const reorderButton = event.target.closest(".reorder-btn");

    if (receiptButton) {
      const orderID = receiptButton.dataset.orderId;

      alert(`Receipt for Order #${orderID} will be implemented next.`);
    }

    if (reorderButton) {
      const orderID = reorderButton.dataset.orderId;

      alert(`Reorder for Order #${orderID} will be implemented next.`);
    }
  });
  loadFullOrderHistory();
});
