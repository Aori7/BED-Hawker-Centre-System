document.addEventListener("DOMContentLoaded", () => {
  const accessToken = sessionStorage.getItem("accessToken");
  let selectedStallId = sessionStorage.getItem("selectedStallId");
  let selectedPromotion = null;
  let pendingPromotionStatus = null;
  let menuItems = [];

  // Element selectors
  const switchStallButton = document.querySelector("#switch-stall-button");
  const stallDropdown = document.querySelector("#stall-dropdown");
  const selectedStallName = document.querySelector("#selected-stall-name");
  const selectedStallAddress = document.querySelector(
    "#selected-stall-address",
  );
  const searchInput = document.querySelector("#promotion-search-input");
  const noResultsMessage = document.querySelector("#no-promotion-results");
  const activeGrid = document.querySelector(
    "#active-promotions .promotion-grid",
  );
  const inactiveGrid = document.querySelector(
    "#inactive-promotions .promotion-grid",
  );
  const addPromotionButton = document.querySelector("#add-promotion-button");
  const addPromotionDialog = document.querySelector("#add-promotion-dialog");
  const editPromotionDialog = document.querySelector("#edit-promotion-dialog");
  const removePromotionDialog = document.querySelector(
    "#remove-promotion-dialog",
  );
  const promotionStatusDialog = document.querySelector(
    "#promotion-status-dialog",
  );
  const addPromotionForm = document.querySelector("#add-promotion-form");
  const editPromotionForm = document.querySelector("#edit-promotion-form");
  const closeDialogButtons = document.querySelectorAll(".close-dialog-button");
  const confirmRemovePromotionButton = document.querySelector(
    "#confirm-remove-promotion",
  );
  const confirmPromotionStatusButton = document.querySelector(
    "#confirm-promotion-status",
  );
  const removePromotionMessage = document.querySelector(
    "#remove-promotion-message",
  );
  const promotionStatusMessage = document.querySelector(
    "#promotion-status-message",
  );
  const addMenuItemsContainer = document.querySelector(
    "#add-promotion-dialog .promotion-menu-items",
  );
  const editMenuItemsContainer = document.querySelector(
    "#edit-promotion-dialog .promotion-menu-items",
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

  // Show page message
  function showPromotionMessage(message) {
    if (!noResultsMessage) {
      return;
    }
    noResultsMessage.textContent = message;
    noResultsMessage.hidden = false;
  }

  // Load vendor stalls
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

        showPromotionMessage("No stalls are linked to this vendor.");
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
      showPromotionMessage(error.message);
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

    const addStallId = document.querySelector("#add-promotion-stall-id");

    if (addStallId) {
      addStallId.value = selectedStallId;
    }
  }

  // Format date
  function formatDate(dateValue) {
    if (!dateValue) {
      return "-";
    }

    return new Date(dateValue).toLocaleDateString("en-SG", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  // Format date for input
  function formatDateInput(dateValue) {
    if (!dateValue) {
      return "";
    }
    return new Date(dateValue).toISOString().split("T")[0];
  }

  // Format discount
  function formatDiscount(promotion) {
    if (promotion.DiscountType === "Percentage") {
      return `${Number(promotion.DiscountValue)}% off`;
    }

    if (promotion.DiscountType === "Fixed Amount") {
      return `$${Number(promotion.DiscountValue).toFixed(2)} off`;
    }

    return "Free item";
  }

  // Create affected items
  function createAffectedItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
      return `
        <details class="affected-items-dropdown">
          <summary class="affected-items-summary">
            <span>Affected items</span>
            <span class="affected-items-count">0 items</span>
          </summary>
          <p>No menu items selected.</p>
        </details>
      `;
    }

    return `
      <details class="affected-items-dropdown">
        <summary class="affected-items-summary">
          <span>Affected items</span>
          <span class="affected-items-count">
            ${items.length} ${items.length === 1 ? "item" : "items"}
          </span>
        </summary>
        <ul class="affected-items-list">
          ${items
            .map((item) => `<li>${escapeHtml(item.ItemName)}</li>`)
            .join("")}
        </ul>
      </details>
    `;
  }

  // Create one promotion card
  function createPromotionCard(promotion) {
    const isActive = Boolean(promotion.IsActive);
    const status = isActive ? "active" : "inactive";
    const statusText = isActive ? "Active" : "Inactive";
    const cardClass = isActive ? "" : " promotion-card-inactive";
    const statusClass = isActive ? "active-status" : "inactive-status";
    const changeStatusText = isActive ? "Mark inactive" : "Mark active";
    const menuItemIds = (promotion.AffectedMenuItems || [])
      .map((item) => item.MenuItemID)
      .join(",");

    return `
      <article
        class="promotion-card${cardClass}"
        data-promotion-id="${promotion.PromotionID}"
        data-promotion-name="${escapeHtml(promotion.PromotionName)}"
        data-promotion-description="${escapeHtml(
          promotion.PromotionDescription || "",
        )}"
        data-discount-type="${escapeHtml(promotion.DiscountType)}"
        data-discount-value="${promotion.DiscountValue}"
        data-start-date="${formatDateInput(promotion.StartDate)}"
        data-end-date="${formatDateInput(promotion.EndDate)}"
        data-promotion-status="${status}"
        data-menu-item-ids="${menuItemIds}"
        data-resource="promotion"
      >
        <header class="promotion-card-header">
          <div class="promotion-heading">
            <div class="promotion-title-row">
              <h3 class="promotion-name">
                ${escapeHtml(promotion.PromotionName)}
              </h3>
              <span class="promotion-status ${statusClass}">
                ${statusText}
              </span>
            </div>
            <p class="promotion-description">
              ${escapeHtml(
                promotion.PromotionDescription || "No description provided.",
              )}
            </p>
          </div>
          <div class="promotion-menu">
            <button
              class="promotion-menu-button"
              type="button"
              aria-label="Open ${escapeHtml(promotion.PromotionName)} actions"
              aria-expanded="false"
              data-action="toggle-promotion-menu"
            >
              &#8942;
            </button>
            <div class="promotion-menu-dropdown">
              <button
                class="change-status-action"
                type="button"
                data-action="change-promotion-status"
              >
                ${changeStatusText}
              </button>
              <button
                class="edit-action"
                type="button"
                data-action="edit-promotion"
              >
                Edit
              </button>
              <button
                class="remove-action"
                type="button"
                data-action="remove-promotion"
              >
                Remove
              </button>
            </div>
          </div>
        </header>
        <div class="promotion-card-body">
          <dl class="promotion-information">
            <div class="promotion-detail">
              <dt>Discount</dt>
              <dd>${formatDiscount(promotion)}</dd>
            </div>
            <div class="promotion-detail">
              <dt>Start date</dt>
              <dd>${formatDate(promotion.StartDate)}</dd>
            </div>
            <div class="promotion-detail">
              <dt>End date</dt>
              <dd>${formatDate(promotion.EndDate)}</dd>
            </div>
          </dl>
          ${createAffectedItems(promotion.AffectedMenuItems)}
        </div>
      </article>
    `;
  }

  // Render promotions
  function renderPromotions(promotions) {
    if (activeGrid) {
      activeGrid.innerHTML = "";
    }

    if (inactiveGrid) {
      inactiveGrid.innerHTML = "";
    }

    if (!Array.isArray(promotions) || promotions.length === 0) {
      showPromotionMessage("No promotions found for this stall.");
      return;
    }

    const activePromotions = promotions.filter((promotion) =>
      Boolean(promotion.IsActive),
    );
    const inactivePromotions = promotions.filter(
      (promotion) => !Boolean(promotion.IsActive),
    );

    if (activeGrid) {
      activeGrid.innerHTML = activePromotions.map(createPromotionCard).join("");
    }

    if (inactiveGrid) {
      inactiveGrid.innerHTML = inactivePromotions
        .map(createPromotionCard)
        .join("");
    }

    if (noResultsMessage) {
      noResultsMessage.hidden = true;
    }

    filterPromotions();
  }

  // Load promotions
  async function loadPromotions() {
    if (!selectedStallId) {
      showPromotionMessage("Select a stall to view promotions.");
      return;
    }

    try {
      const promotions = await vendorFetch(
        `/vendor-promotions/${selectedStallId}`,
      );

      renderPromotions(promotions);
    } catch (error) {
      console.error("Error loading promotions:", error);
      showPromotionMessage(error.message);
    }
  }

  // Load menu items
  async function loadMenuItems() {
    if (!selectedStallId) {
      menuItems = [];
      return;
    }

    try {
      menuItems = await vendorFetch(`/vendor-menu/${selectedStallId}`);
    } catch (error) {
      console.error("Error loading menu items:", error);
      menuItems = [];
    }
  }

  // Create menu-item checkboxes
  function createMenuItemCheckboxes(
    container,
    currentPromotionId = null,
    selectedIds = [],
  ) {
    if (!container) {
      return;
    }

    const availableItems = menuItems.filter((item) => {
      return (
        !item.PromotionID ||
        String(item.PromotionID) === String(currentPromotionId)
      );
    });

    if (availableItems.length === 0) {
      container.innerHTML = "<p>No available menu items.</p>";
      return;
    }

    container.innerHTML = availableItems
      .map((item) => {
        const checked = selectedIds.includes(Number(item.MenuItemID))
          ? " checked"
          : "";

        return `
          <label class="dialog-checkbox">
            <input
              type="checkbox"
              name="menuItems"
              value="${item.MenuItemID}"
              ${checked}
            />
            <span>${escapeHtml(item.ItemName)}</span>
          </label>
        `;
      })
      .join("");
  }

  // Get selected menu-item IDs
  function getSelectedMenuItemIds(container) {
    if (!container) {
      return [];
    }

    return Array.from(
      container.querySelectorAll('input[type="checkbox"]:checked'),
    ).map((checkbox) => Number(checkbox.value));
  }

  // Convert discount type for backend
  function getBackendDiscountType(value) {
    if (value === "percentage") {
      return "Percentage";
    }
    if (value === "fixed") {
      return "Fixed Amount";
    }
    return "Free Item";
  }

  // Convert discount type for form
  function getFormDiscountType(value) {
    if (value === "Percentage") {
      return "percentage";
    }
    if (value === "Fixed Amount") {
      return "fixed";
    }
    return "free-item";
  }

  // Get promotion form data
  function getPromotionFormData(prefix, menuItemsContainer) {
    const discountType = document.querySelector(
      `#${prefix}-discount-type`,
    ).value;

    let discountValue = Number(
      document.querySelector(`#${prefix}-discount-value`).value,
    );

    if (discountType === "free-item") {
      discountValue = 1;
    }

    return {
      PromotionName: document
        .querySelector(`#${prefix}-promotion-name`)
        .value.trim(),
      PromotionDescription:
        document
          .querySelector(`#${prefix}-promotion-description`)
          .value.trim() || null,
      DiscountType: getBackendDiscountType(discountType),
      DiscountValue: discountValue,
      StartDate: document.querySelector(`#${prefix}-start-date`).value,
      EndDate: document.querySelector(`#${prefix}-end-date`).value,
      IsActive:
        document.querySelector(`#${prefix}-promotion-status`).value ===
        "active",
      MenuItemIDs: getSelectedMenuItemIds(menuItemsContainer),
    };
  }

  // Filter promotions
  function filterPromotions() {
    const searchTerm = (searchInput?.value || "").trim().toLowerCase();
    const cards = document.querySelectorAll(".promotion-card");
    let visibleCount = 0;

    cards.forEach((card) => {
      const promotionName = (card.dataset.promotionName || "").toLowerCase();

      const promotionDescription = (
        card.dataset.promotionDescription || ""
      ).toLowerCase();

      const shouldShow =
        promotionName.includes(searchTerm) ||
        promotionDescription.includes(searchTerm);

      card.hidden = !shouldShow;

      if (shouldShow) {
        visibleCount += 1;
      }
    });

    if (noResultsMessage && cards.length > 0) {
      noResultsMessage.textContent = "No promotions match your search.";
      noResultsMessage.hidden = visibleCount !== 0;
    }
  }

  // Open dialog
  function openDialog(dialog) {
    if (!dialog) {
      return;
    }
    dialog.hidden = false;
    document.body.style.overflow = "hidden";
  }

  // Close dialog
  function closeDialog(dialog) {
    if (!dialog) {
      return;
    }
    dialog.hidden = true;
    document.body.style.overflow = "";
  }

  // Close all dialogs
  function closeAllDialogs() {
    document.querySelectorAll(".promotion-dialog").forEach((dialog) => {
      dialog.hidden = true;
    });
    document.body.style.overflow = "";
    selectedPromotion = null;
    pendingPromotionStatus = null;
  }

  // Close promotion menus
  function closeAllPromotionMenus(excludedDropdown = null) {
    document
      .querySelectorAll(".promotion-menu-dropdown.open")
      .forEach((dropdown) => {
        if (dropdown === excludedDropdown) {
          return;
        }

        dropdown.classList.remove("open");
        const button = dropdown.previousElementSibling;

        if (button) {
          button.setAttribute("aria-expanded", "false");
        }
      });
  }

  // Toggle promotion menu
  function togglePromotionMenu(button) {
    const dropdown = button.nextElementSibling;

    if (!dropdown) {
      return;
    }
    const isOpen = dropdown.classList.contains("open");
    closeAllPromotionMenus(dropdown);
    dropdown.classList.toggle("open", !isOpen);
    button.setAttribute("aria-expanded", String(!isOpen));
  }

  // Update discount field
  function updateDiscountField(prefix) {
    const type = document.querySelector(`#${prefix}-discount-type`);
    const field = document.querySelector(`#${prefix}-discount-value-field`);
    const label = document.querySelector(`#${prefix}-discount-value-label`);
    const input = document.querySelector(`#${prefix}-discount-value`);

    if (!type || !field || !label || !input) {
      return;
    }

    if (type.value === "percentage") {
      field.hidden = false;
      label.textContent = "Percentage (%)";
      input.placeholder = "20";
      input.required = true;
      return;
    }

    if (type.value === "fixed") {
      field.hidden = false;
      label.textContent = "Discount amount ($)";
      input.placeholder = "2.50";
      input.required = true;
      return;
    }

    if (type.value === "free-item") {
      field.hidden = true;
      input.required = false;
      input.value = "1";
      return;
    }
    field.hidden = false;
    label.textContent = "Discount value";
    input.placeholder = "";
    input.required = true;
  }

  // Open add dialog
  function openAddPromotionDialog() {
    if (!selectedStallId) {
      alert("Please select a stall first.");
      return;
    }

    addPromotionForm?.reset();
    createMenuItemCheckboxes(addMenuItemsContainer);
    updateDiscountField("add");
    openDialog(addPromotionDialog);
  }

  // Open edit dialog
  function openEditPromotionDialog(card) {
    selectedPromotion = card;

    const selectedIds = (card.dataset.menuItemIds || "")
      .split(",")
      .filter(Boolean)
      .map(Number);

    document.querySelector("#edit-promotion-id").value =
      card.dataset.promotionId;
    document.querySelector("#edit-promotion-name").value =
      card.dataset.promotionName || "";
    document.querySelector("#edit-promotion-description").value =
      card.dataset.promotionDescription || "";
    document.querySelector("#edit-discount-type").value = getFormDiscountType(
      card.dataset.discountType,
    );
    document.querySelector("#edit-discount-value").value =
      card.dataset.discountValue || "";
    document.querySelector("#edit-start-date").value =
      card.dataset.startDate || "";
    document.querySelector("#edit-end-date").value = card.dataset.endDate || "";
    document.querySelector("#edit-promotion-status").value =
      card.dataset.promotionStatus;

    createMenuItemCheckboxes(
      editMenuItemsContainer,
      card.dataset.promotionId,
      selectedIds,
    );
    updateDiscountField("edit");
    closeAllPromotionMenus();
    openDialog(editPromotionDialog);
  }

  // Open remove dialog
  function openRemovePromotionDialog(card) {
    selectedPromotion = card;

    if (removePromotionMessage) {
      removePromotionMessage.textContent = `Remove "${card.dataset.promotionName}"?`;
    }
    closeAllPromotionMenus();
    openDialog(removePromotionDialog);
  }

  // Open status dialog
  function openStatusDialog(card) {
    selectedPromotion = card;
    pendingPromotionStatus =
      card.dataset.promotionStatus === "active" ? "inactive" : "active";

    if (promotionStatusMessage) {
      promotionStatusMessage.textContent = `Mark "${card.dataset.promotionName}" as ${pendingPromotionStatus}?`;
    }

    closeAllPromotionMenus();
    openDialog(promotionStatusDialog);
  }

  // Create promotion
  addPromotionForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const promotionData = getPromotionFormData("add", addMenuItemsContainer);

    try {
      await vendorFetch(`/vendor-promotions/${selectedStallId}`, {
        method: "POST",
        body: JSON.stringify(promotionData),
      });
      closeDialog(addPromotionDialog);
      addPromotionForm.reset();
      await loadMenuItems();
      await loadPromotions();
      alert("Promotion created successfully.");
    } catch (error) {
      console.error("Error creating promotion:", error);
      alert(error.message);
    }
  });

  // Update promotion
  editPromotionForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const promotionId = document.querySelector("#edit-promotion-id").value;
    const promotionData = getPromotionFormData("edit", editMenuItemsContainer);

    try {
      await vendorFetch(
        `/vendor-promotions/${selectedStallId}/${promotionId}`,
        {
          method: "PUT",
          body: JSON.stringify(promotionData),
        },
      );

      closeDialog(editPromotionDialog);
      await loadMenuItems();
      await loadPromotions();
      alert("Promotion updated successfully.");
    } catch (error) {
      console.error("Error updating promotion:", error);
      alert(error.message);
    }
  });

  // Delete promotion
  confirmRemovePromotionButton?.addEventListener("click", async () => {
    if (!selectedPromotion) {
      return;
    }

    const promotionId = selectedPromotion.dataset.promotionId;

    try {
      await vendorFetch(
        `/vendor-promotions/${selectedStallId}/${promotionId}`,
        {
          method: "DELETE",
        },
      );

      closeDialog(removePromotionDialog);
      await loadMenuItems();
      await loadPromotions();
      alert("Promotion removed successfully.");
    } catch (error) {
      console.error("Error deleting promotion:", error);
      alert(error.message);
    }
  });

  // Change promotion status
  confirmPromotionStatusButton?.addEventListener("click", async () => {
    if (!selectedPromotion || !pendingPromotionStatus) {
      return;
    }

    const promotionId = selectedPromotion.dataset.promotionId;
    const selectedIds = (selectedPromotion.dataset.menuItemIds || "")
      .split(",")
      .filter(Boolean)
      .map(Number);

    const promotionData = {
      PromotionName: selectedPromotion.dataset.promotionName,
      PromotionDescription:
        selectedPromotion.dataset.promotionDescription || null,
      DiscountType: selectedPromotion.dataset.discountType,
      DiscountValue: Number(selectedPromotion.dataset.discountValue),
      StartDate: selectedPromotion.dataset.startDate,
      EndDate: selectedPromotion.dataset.endDate,
      IsActive: pendingPromotionStatus === "active",
      MenuItemIDs: selectedIds,
    };

    try {
      await vendorFetch(
        `/vendor-promotions/${selectedStallId}/${promotionId}`,
        {
          method: "PUT",
          body: JSON.stringify(promotionData),
        },
      );

      closeDialog(promotionStatusDialog);
      await loadPromotions();
    } catch (error) {
      console.error("Error updating promotion status:", error);
      alert(error.message);
    }
  });

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
    await loadMenuItems();
    await loadPromotions();
  });

  // Promotion actions
  document.addEventListener("click", (event) => {
    const menuButton = event.target.closest(".promotion-menu-button");

    if (menuButton) {
      event.stopPropagation();
      togglePromotionMenu(menuButton);
      return;
    }

    const card = event.target.closest(".promotion-card");

    if (!card) {
      return;
    }
    if (event.target.closest(".change-status-action")) {
      openStatusDialog(card);
      return;
    }
    if (event.target.closest(".edit-action")) {
      openEditPromotionDialog(card);
      return;
    }
    if (event.target.closest(".remove-action")) {
      openRemovePromotionDialog(card);
    }
  });

  // Open add dialog
  addPromotionButton?.addEventListener("click", () => {
    openAddPromotionDialog();
  });

  // Close dialog buttons
  closeDialogButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const dialog = button.closest(".promotion-dialog");
      closeDialog(dialog);
    });
  });

  // Close dialog background
  document.querySelectorAll(".promotion-dialog").forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        closeDialog(dialog);
      }
    });
  });

  // Search promotions
  searchInput?.addEventListener("input", filterPromotions);

  // Discount type changes
  document
    .querySelector("#add-discount-type")
    ?.addEventListener("change", () => {
      updateDiscountField("add");
    });

  document
    .querySelector("#edit-discount-type")
    ?.addEventListener("change", () => {
      updateDiscountField("edit");
    });

  // Close dropdowns outside
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".stall-switcher")) {
      closeStallDropdown();
    }

    if (!event.target.closest(".promotion-menu")) {
      closeAllPromotionMenus();
    }
  });

  // Close with Escape
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }
    closeStallDropdown();
    closeAllPromotionMenus();
    closeAllDialogs();
  });

  // Initial page load
  async function initialisePromotionsPage() {
    const stallsLoaded = await loadVendorStalls();

    if (!stallsLoaded) {
      return;
    }

    await loadMenuItems();
    await loadPromotions();
  }

  initialisePromotionsPage();
});
