document.addEventListener("DOMContentLoaded", () => {
  const accessToken = sessionStorage.getItem("accessToken");
  let selectedStallId = sessionStorage.getItem("selectedStallId");

  // Element selectors
  const switchStallButton = document.querySelector("#switch-stall-button");
  const stallDropdown = document.querySelector("#stall-dropdown");
  const selectedStallName = document.querySelector("#selected-stall-name");
  const selectedStallAddress = document.querySelector(
    "#selected-stall-address",
  );
  const searchInput = document.querySelector("#order-search-input");
  const statusFilter = document.querySelector("#status-filter");
  const typeFilter = document.querySelector("#type-filter");
  const dateFilter = document.querySelector("#date-filter");
  const clearFilterButton = document.querySelector("#clear-filter-button");
  const ordersTableBody = document.querySelector("#orders-table-body");
  const noOrdersMessage = document.querySelector("#no-orders-message");
  const orderDialog = document.querySelector("#order-dialog");
  const dialogOrderId = document.querySelector("#dialog-order-id");
  const dialogBody = document.querySelector("#dialog-body");
  const dialogSecondaryClose = document.querySelector(
    "#dialog-secondary-close",
  );

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

    const data = await response.json();

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

  // Get stall options
  function getStallOptions() {
    return document.querySelectorAll(".stall-option");
  }

  // Create one stall option
  function createStallOption(stall) {
    const address = [stall.StallUnitNo, stall.HCName]
      .filter(Boolean)
      .join(" · ");

    return `
      <button
        type="button"
        class="stall-option"
        data-stall-id="${stall.StallID}"
        data-stall-name="${escapeHtml(stall.StallName)}"
        data-stall-address="${escapeHtml(address)}"
        data-action="select-stall"
      >
        <span class="stall-option-name">${escapeHtml(stall.StallName)}</span>
        <span class="stall-option-location">${escapeHtml(address)}</span>
      </button>
    `;
  }

  // Show orders message
  function showOrdersMessage(message) {
    if (!noOrdersMessage) {
      return;
    }

    noOrdersMessage.textContent = message;
    noOrdersMessage.hidden = false;
  }

  // Load stalls from backend
  async function loadVendorStalls() {
    try {
      const stalls = await vendorFetch("/vendor-stalls");

      if (!Array.isArray(stalls) || stalls.length === 0) {
        selectedStallId = null;
        sessionStorage.removeItem("selectedStallId");

        if (selectedStallName) {
          selectedStallName.textContent = "No stalls found";
        }

        if (selectedStallAddress) {
          selectedStallAddress.textContent = "";
        }

        if (stallDropdown) {
          stallDropdown.innerHTML = "";
        }
        showOrdersMessage("No stalls are linked to this vendor.");
        return false;
      }

      if (stallDropdown) {
        stallDropdown.innerHTML = stalls.map(createStallOption).join("");
      }

      const selectedStallExists = stalls.some(
        (stall) => String(stall.StallID) === String(selectedStallId),
      );

      if (!selectedStallExists) {
        selectedStallId = String(stalls[0].StallID);
        sessionStorage.setItem("selectedStallId", selectedStallId);
      }

      displaySelectedStall();
      return true;
    } catch (error) {
      console.error("Error loading vendor stalls:", error);

      if (selectedStallName) {
        selectedStallName.textContent = "Unable to load stalls";
      }
      showOrdersMessage(error.message);
      return false;
    }
  }

  // Close stall dropdown
  function closeStallDropdown() {
    if (!switchStallButton || !stallDropdown) {
      return;
    }

    switchStallButton.setAttribute("aria-expanded", "false");
    stallDropdown.hidden = true;
  }

  // Toggle stall dropdown
  function toggleStallDropdown() {
    if (!switchStallButton || !stallDropdown) {
      return;
    }

    const isOpen = switchStallButton.getAttribute("aria-expanded") === "true";

    switchStallButton.setAttribute("aria-expanded", String(!isOpen));
    stallDropdown.hidden = isOpen;
  }

  // Display selected stall
  function displaySelectedStall() {
    if (!selectedStallId) {
      return;
    }

    const selectedOption = document.querySelector(
      `.stall-option[data-stall-id="${selectedStallId}"]`,
    );

    if (!selectedOption) {
      return;
    }
    getStallOptions().forEach((option) => {
      option.classList.remove("active");
    });

    selectedOption.classList.add("active");

    if (selectedStallName) {
      selectedStallName.textContent = selectedOption.dataset.stallName || "";
    }

    if (selectedStallAddress) {
      selectedStallAddress.textContent =
        selectedOption.dataset.stallAddress || "";
    }
  }

  // Format date and time
  function formatDateTime(dateString) {
    if (!dateString) {
      return "-";
    }

    return new Date(dateString).toLocaleString("en-SG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Format date for filter
  function formatDateValue(dateString) {
    if (!dateString) {
      return "";
    }

    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Format money
  function formatMoney(value) {
    return `$${Number(value || 0).toFixed(2)}`;
  }

  // Get status class
  function getStatusClass(status) {
    switch (status) {
      case "Pending":
        return "status-pending";
      case "Preparing":
        return "status-preparing";
      case "Ready for Collection":
        return "status-ready";
      case "Completed":
        return "status-completed";
      case "Cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  }

  // Create status options
  function createStatusOptions(selectedStatus) {
    const statuses = [
      "Pending",
      "Preparing",
      "Ready for Collection",
      "Completed",
      "Cancelled",
    ];

    return statuses
      .map((status) => {
        const selected = status === selectedStatus ? " selected" : "";
        return `<option value="${status}"${selected}>${status}</option>`;
      })
      .join("");
  }

  // Create one order row
  function createOrderRow(order) {
    const customerName = order.CustomerName || "Unknown customer";
    const specialRequest = order.SpecialRequest ? "✓" : "-";
    const orderItems = encodeURIComponent(
      JSON.stringify(order.OrderItems || []),
    );

    return `
      <tr
        class="order-row"
        data-order-id="${order.OrderID}"
        data-customer-id="${order.CustomerID}"
        data-customer-name="${escapeHtml(customerName)}"
        data-date="${formatDateValue(order.OrderDateTime)}"
        data-date-time="${escapeHtml(order.OrderDateTime)}"
        data-order-type="${escapeHtml(order.OrderType)}"
        data-order-status="${escapeHtml(order.OrderStatus)}"
        data-subtotal="${order.Subtotal}"
        data-delivery-fee="${order.DeliveryFee}"
        data-total="${order.TotalAmount}"
        data-special-request="${escapeHtml(order.SpecialRequest || "")}"
        data-order-items="${orderItems}"
      >
        <td data-label="Order ID"><strong>#${order.OrderID}</strong></td>
        <td data-label="Customer">
          <strong>${escapeHtml(customerName)}</strong><br>
          <span>#${order.CustomerID}</span>
        </td>
        <td data-label="Date & Time">
          <time datetime="${escapeHtml(order.OrderDateTime)}">
            ${formatDateTime(order.OrderDateTime)}
          </time>
        </td>
        <td data-label="Total">${formatMoney(order.TotalAmount)}</td>
        <td data-label="Order Type">${escapeHtml(order.OrderType)}</td>
        <td class="special-request" data-label="Special Request">${specialRequest}</td>
        <td data-label="Order Status">
          <select
            class="order-status-select ${getStatusClass(order.OrderStatus)}"
            aria-label="Update order ${order.OrderID} status"
          >
            ${createStatusOptions(order.OrderStatus)}
          </select>
        </td>
        <td class="order-actions">
          <button
            type="button"
            class="view-details-button"
            data-action="view-order-details"
          >
            See details
          </button>
        </td>
      </tr>
    `;
  }

  // Render orders
  function renderOrders(orders) {
    if (!ordersTableBody) {
      return;
    }

    ordersTableBody.innerHTML = "";

    if (!Array.isArray(orders) || orders.length === 0) {
      showOrdersMessage("No orders found for this stall.");
      return;
    }

    ordersTableBody.innerHTML = orders.map(createOrderRow).join("");

    if (noOrdersMessage) {
      noOrdersMessage.hidden = true;
    }
    filterOrders();
  }

  // Load orders from backend
  async function loadOrders() {
    if (!selectedStallId) {
      showOrdersMessage("Select a stall to view its orders.");
      return;
    }

    try {
      const orders = await vendorFetch(`/vendor-orders/${selectedStallId}`);
      renderOrders(orders);
    } catch (error) {
      console.error("Error loading orders:", error);
      showOrdersMessage(error.message);
    }
  }

  // Filter orders
  function filterOrders() {
    const searchTerm = (searchInput?.value || "").trim().toLowerCase();
    const selectedStatus = statusFilter?.value || "all";
    const selectedType = typeFilter?.value || "all";
    const selectedDate = dateFilter?.value || "";
    const rows = ordersTableBody?.querySelectorAll(".order-row") || [];
    let visibleCount = 0;

    rows.forEach((row) => {
      const searchableText =
        `${row.dataset.orderId || ""} ${row.dataset.customerId || ""} ${row.dataset.customerName || ""}`.toLowerCase();
      const matchesSearch = searchableText.includes(searchTerm);
      const matchesStatus =
        selectedStatus === "all" || row.dataset.orderStatus === selectedStatus;
      const matchesType =
        selectedType === "all" || row.dataset.orderType === selectedType;
      const matchesDate = !selectedDate || row.dataset.date === selectedDate;
      const shouldShow =
        matchesSearch && matchesStatus && matchesType && matchesDate;
      row.hidden = !shouldShow;

      if (shouldShow) {
        visibleCount += 1;
      }
    });

    if (noOrdersMessage && rows.length > 0) {
      noOrdersMessage.textContent =
        "No orders match the selected search and filters.";
      noOrdersMessage.hidden = visibleCount !== 0;
    }
  }

  // Clear filters
  function clearFilters() {
    if (searchInput) {
      searchInput.value = "";
    }

    if (statusFilter) {
      statusFilter.value = "all";
    }

    if (typeFilter) {
      typeFilter.value = "all";
    }

    if (dateFilter) {
      dateFilter.value = "";
    }
    filterOrders();
  }

  // Open order details
  function openOrderDetails(row) {
    if (!orderDialog || !dialogOrderId || !dialogBody) {
      return;
    }

    let orderItems = [];

    try {
      orderItems = JSON.parse(
        decodeURIComponent(row.dataset.orderItems || "%5B%5D"),
      );
    } catch (error) {
      console.error("Error reading order items:", error);
    }

    const menuItemsHtml = orderItems.length
      ? orderItems
          .map((item) => {
            return `
            <div class="dialog-menu-item">
              <span>${escapeHtml(item.ItemName)}</span>
              <span>x${item.Quantity}</span>
              <span>${formatMoney(item.Subtotal)}</span>
            </div>
          `;
          })
          .join("")
      : "<p>No menu items found.</p>";

    dialogOrderId.textContent = `Order #${row.dataset.orderId}`;
    dialogBody.innerHTML = `
      <div class="dialog-detail">
        <span>Order ID</span>
        <span>#${row.dataset.orderId || "-"}</span>
      </div>
      <div class="dialog-detail">
        <span>Customer</span>
        <span>${escapeHtml(row.dataset.customerName || "-")} (#${row.dataset.customerId || "-"})</span>
      </div>
      <div class="dialog-detail">
        <span>Order Type</span>
        <span>${escapeHtml(row.dataset.orderType || "-")}</span>
      </div>
      <div class="dialog-detail">
        <span>Order Date & Time</span>
        <span>${formatDateTime(row.dataset.dateTime)}</span>
      </div>
      <div class="dialog-detail">
        <span>Order Status</span>
        <span>${escapeHtml(row.dataset.orderStatus || "-")}</span>
      </div>
      <div class="dialog-detail">
        <span>Subtotal</span>
        <span>${formatMoney(row.dataset.subtotal)}</span>
      </div>
      <div class="dialog-detail">
        <span>Delivery Fee</span>
        <span>${formatMoney(row.dataset.deliveryFee)}</span>
      </div>
      <div class="dialog-detail">
        <span>Total Amount</span>
        <span>${formatMoney(row.dataset.total)}</span>
      </div>
      <div class="dialog-detail">
        <span>Special Request</span>
        <span>${escapeHtml(row.dataset.specialRequest || "-")}</span>
      </div>
      <div class="dialog-menu">
        <h3>Menu Items</h3>
        ${menuItemsHtml}
      </div>
    `;

    orderDialog.hidden = false;
    document.body.style.overflow = "hidden";
  }

  // Update status appearance
  function updateStatusAppearance(dropdown, status) {
    dropdown.classList.remove(
      "status-pending",
      "status-preparing",
      "status-ready",
      "status-completed",
      "status-cancelled",
    );

    const statusClass = getStatusClass(status);

    if (statusClass) {
      dropdown.classList.add(statusClass);
    }
  }

  // Update order status
  async function updateOrderStatus(row, dropdown) {
    const orderId = row.dataset.orderId;
    const previousStatus = row.dataset.orderStatus;
    const newStatus = dropdown.value;

    try {
      await vendorFetch(`/vendor-orders/${selectedStallId}/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({
          OrderStatus: newStatus,
        }),
      });

      row.dataset.orderStatus = newStatus;
      updateStatusAppearance(dropdown, newStatus);
      filterOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      dropdown.value = previousStatus;
      updateStatusAppearance(dropdown, previousStatus);
      alert(error.message);
    }
  }

  // Stall dropdown button
  switchStallButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleStallDropdown();
  });

  // Select stall
  stallDropdown?.addEventListener("click", async (event) => {
    const option = event.target.closest(".stall-option");

    if (!option) {
      return;
    }

    selectedStallId = option.dataset.stallId;
    sessionStorage.setItem("selectedStallId", selectedStallId);
    displaySelectedStall();
    closeStallDropdown();
    await loadOrders();
  });

  // Close stall dropdown outside
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".stall-switcher")) {
      closeStallDropdown();
    }
  });

  // Filter controls
  searchInput?.addEventListener("input", filterOrders);
  statusFilter?.addEventListener("change", filterOrders);
  typeFilter?.addEventListener("change", filterOrders);
  dateFilter?.addEventListener("change", filterOrders);
  clearFilterButton?.addEventListener("click", clearFilters);

  // View order details
  ordersTableBody?.addEventListener("click", (event) => {
    const detailsButton = event.target.closest(".view-details-button");

    if (!detailsButton) {
      return;
    }

    const row = detailsButton.closest(".order-row");

    if (row) {
      openOrderDetails(row);
    }
  });

  // Change order status
  ordersTableBody?.addEventListener("change", async (event) => {
    const dropdown = event.target.closest(".order-status-select");

    if (!dropdown) {
      return;
    }

    const row = dropdown.closest(".order-row");

    if (row) {
      await updateOrderStatus(row, dropdown);
    }
  });

  // Close order dialog
  dialogSecondaryClose?.addEventListener("click", () => {
    if (!orderDialog) {
      return;
    }
    orderDialog.hidden = true;
    document.body.style.overflow = "";
  });

  // Initial page load
  async function initialiseOrdersPage() {
    const stallsLoaded = await loadVendorStalls();

    if (!stallsLoaded) {
      return;
    }
    await loadOrders();
  }
  initialiseOrdersPage();
});
