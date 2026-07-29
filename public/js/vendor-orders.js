document.addEventListener("DOMContentLoaded", () => {
  /* DOM elements */
  const switchStallButton = document.querySelector("#switch-stall-button");
  const stallDropdown = document.querySelector("#stall-dropdown");
  const stallOptions = document.querySelectorAll(".stall-option");
  const selectedStallName = document.querySelector("#selected-stall-name");
  const selectedStallAddress = document.querySelector(
    "#selected-stall-address",
  );
  const searchInput = document.querySelector("#order-search-input");
  const statusFilter = document.querySelector("#status-filter");
  const paymentFilter = document.querySelector("#payment-filter");
  const typeFilter = document.querySelector("#type-filter");
  const dateFilter = document.querySelector("#date-filter");
  const clearFilterButton = document.querySelector("#clear-filter-button");
  const paymentStatusFilter = document.querySelector("#payment-status-filter");
  const ordersTableBody = document.querySelector("#orders-table-body");
  const noOrdersMessage = document.querySelector("#no-orders-message");
  const orderDialog = document.querySelector("#order-dialog");
  const dialogOrderId = document.querySelector("#dialog-order-id");
  const dialogBody = document.querySelector("#dialog-body");
  const dialogCloseButton = document.querySelector("#dialog-close-button");
  const dialogSecondaryClose = document.querySelector(
    "#dialog-secondary-close",
  );
  const statusDropdowns = document.querySelectorAll(".order-status-select");
  /* stall selector */
  function closeStallDropdown() {
    if (!switchStallButton || !stallDropdown) return;
    switchStallButton.setAttribute("aria-expanded", "false");
    stallDropdown.hidden = true;
  }
  function toggleStallDropdown() {
    if (!switchStallButton || !stallDropdown) return;
    const isOpen = switchStallButton.getAttribute("aria-expanded") === "true";
    switchStallButton.setAttribute("aria-expanded", String(!isOpen));
    stallDropdown.hidden = isOpen;
  }
  function selectStall(option) {
    if (!selectedStallName || !selectedStallAddress) return;
    selectedStallName.textContent = option.dataset.stallName || "";
    selectedStallAddress.textContent = option.dataset.stallAddress || "";
    stallOptions.forEach((stallOption) =>
      stallOption.classList.remove("active"),
    );
    option.classList.add("active");
    localStorage.setItem(
      "selectedVendorStall",
      JSON.stringify({
        id: option.dataset.stallId || "",
        name: option.dataset.stallName || "",
        address: option.dataset.stallAddress || "",
      }),
    );
    closeStallDropdown();
  }
  function restoreSelectedStall() {
    let savedStall = null;
    try {
      savedStall = JSON.parse(
        localStorage.getItem("selectedVendorStall") || "null",
      );
    } catch (error) {
      localStorage.removeItem("selectedVendorStall");
    }
    if (!savedStall) return;
    const matchingOption = Array.from(stallOptions).find((option) => {
      return option.dataset.stallId === savedStall.id;
    });
    if (matchingOption) selectStall(matchingOption);
  }
  /* order filters */
  function filterOrders() {
    const searchTerm = (searchInput?.value || "").trim().toLowerCase();
    const selectedStatus = statusFilter?.value || "all";
    const selectedPayment = paymentFilter?.value || "all";
    const selectedType = typeFilter?.value || "all";
    const selectedDate = dateFilter?.value || "";
    const selectedPaymentStatus = paymentStatusFilter?.value || "all";
    const rows = ordersTableBody?.querySelectorAll(".order-row") || [];
    let visibleCount = 0;
    rows.forEach((row) => {
      const searchableText =
        `${row.dataset.orderId || ""} ${row.dataset.customerId || ""} ${row.dataset.date || ""}`.toLowerCase();
      const matchesSearch = searchableText.includes(searchTerm);
      const matchesStatus =
        selectedStatus === "all" || row.dataset.orderStatus === selectedStatus;
      const matchesPayment =
        selectedPayment === "all" ||
        row.dataset.paymentMethod === selectedPayment;
      const matchesType =
        selectedType === "all" || row.dataset.orderType === selectedType;
      const matchesDate = !selectedDate || row.dataset.date === selectedDate;
      const matchesPaymentStatus =
        selectedPaymentStatus === "all" ||
        row.dataset.paymentStatus === selectedPaymentStatus;
      const shouldShow =
        matchesSearch &&
        matchesStatus &&
        matchesPayment &&
        matchesPaymentStatus &&
        matchesType &&
        matchesDate;
      row.hidden = !shouldShow;
      if (shouldShow) visibleCount += 1;
    });
    if (noOrdersMessage) noOrdersMessage.hidden = visibleCount !== 0;
  }
  function clearFilters() {
    if (searchInput) searchInput.value = "";
    if (statusFilter) statusFilter.value = "all";
    if (paymentFilter) paymentFilter.value = "all";
    if (typeFilter) typeFilter.value = "all";
    if (dateFilter) dateFilter.value = "";
    filterOrders();
  }
  function openOrderDetails(row) {
    if (!orderDialog || !dialogOrderId || !dialogBody) return;
    const cells = row.querySelectorAll("td");
    const statusText =
      row.querySelector(".order-status")?.textContent.trim() || "-";
    dialogOrderId.textContent = row.dataset.orderId || "Order";
    dialogBody.innerHTML = `
      <div class="dialog-detail"><span>Customer ID</span><span>${row.dataset.customerId || "-"}</span></div>
      <div class="dialog-detail"><span>Date and time</span><span>${cells[2]?.textContent.trim() || "-"}</span></div>
      <div class="dialog-detail"><span>Payment type</span><span>${row.dataset.paymentMethod || "-"}</span></div>
      <div class="dialog-detail"><span>Order type</span><span>${row.dataset.orderType || "-"}</span></div>
      <div class="dialog-detail"><span>Total amount</span><span>${row.dataset.total || "-"}</span></div>
      <div class="dialog-detail"><span>Status</span><span>${statusText}</span></div>
    `;
    orderDialog.showModal();
  }
  /* event listeners */
  if (switchStallButton) {
    switchStallButton.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleStallDropdown();
    });
  }
  stallOptions.forEach((option) => {
    option.addEventListener("click", () => {
      selectStall(option);
    });
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".stall-switcher")) closeStallDropdown();
  });
  [searchInput, statusFilter, paymentFilter, typeFilter, dateFilter].forEach(
    (control) => {
      const eventName =
        control?.tagName === "INPUT" && control.type === "search"
          ? "input"
          : "change";
      control?.addEventListener(eventName, filterOrders);
    },
  );
  clearFilterButton?.addEventListener("click", clearFilters);
  ordersTableBody?.addEventListener("click", (event) => {
    const detailsButton = event.target.closest(".view-details-button");
    if (!detailsButton) return;
    const row = detailsButton.closest(".order-row");
    if (row) openOrderDetails(row);
  });
  dialogCloseButton?.addEventListener("click", () => {
    orderDialog?.close();
  });
  dialogSecondaryClose?.addEventListener("click", () => {
    orderDialog?.close();
  });
  orderDialog?.addEventListener("click", (event) => {
    if (event.target === orderDialog) orderDialog.close();
  });
  statusDropdowns.forEach((dropdown) => {
    dropdown.addEventListener("change", () => {
      const row = dropdown.closest(".order-row");

      row.dataset.orderStatus = dropdown.value;

      dropdown.classList.remove(
        "status-pending",
        "status-preparing",
        "status-ready",
        "status-completed",
        "status-cancelled",
      );

      switch (dropdown.value) {
        case "Pending":
          dropdown.classList.add("status-pending");
          break;

        case "Preparing":
          dropdown.classList.add("status-preparing");
          break;

        case "Ready for Collection":
          dropdown.classList.add("status-ready");
          break;

        case "Completed":
          dropdown.classList.add("status-completed");
          break;

        case "Cancelled":
          dropdown.classList.add("status-cancelled");
          break;
      }

      console.log(`${row.dataset.orderId} → ${dropdown.value}`);
    });
  });
  /* initialisation */
  restoreSelectedStall();
  filterOrders();
});
