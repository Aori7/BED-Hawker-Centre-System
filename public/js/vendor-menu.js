// Implementing BE to FE
document.addEventListener("DOMContentLoaded", () => {
  const accessToken = sessionStorage.getItem("accessToken");
  let selectedStallId = sessionStorage.getItem("selectedStallId");

  // Element selectors
  const switchStallButton = document.querySelector("#switch-stall-button");
  const stallDropdown = document.querySelector("#stall-dropdown");
  function getStallOptions() {
    return document.querySelectorAll(".stall-option");
  }
  const selectedStallName = document.querySelector("#selected-stall-name");
  const selectedStallAddress = document.querySelector(
    "#selected-stall-address",
  );
  const searchInput = document.querySelector("#menu-search-input");
  const availabilityFilter = document.querySelector("#availability-filter");
  const noResultsMessage = document.querySelector("#no-menu-results");
  const categoryNavigation = document.querySelector(".category-navigation");
  const menuContent = document.querySelector(".menu-content");
  const menuCategoryContainer = document.querySelector(
    "#menu-category-container",
  );
  const addMenuDialog = document.querySelector("#add-menu-dialog");
  const editMenuDialog = document.querySelector("#edit-menu-dialog");
  const addCategoryDialog = document.querySelector("#add-category-dialog");
  const addMenuButton = document.querySelector(".floating-add-menu-button");
  const addCategoryButton = document.querySelector(".add-category-button");
  const closeDialogButtons = document.querySelectorAll(".close-dialog-button");
  const addMenuForm = document.querySelector("#add-menu-form");
  const editMenuForm = document.querySelector("#edit-menu-form");
  const addCategoryForm = document.querySelector("#add-category-form");
  const addCategorySelect = document.querySelector("#add-item-category");
  const editCategorySelect = document.querySelector("#edit-item-category");

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
      <span class="stall-option-name">
        ${escapeHtml(stall.StallName)}
      </span>
      <span class="stall-option-location">
        ${escapeHtml(address)}
      </span>
    </button>
  `;
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
        showMenuMessage("No stalls are linked to this vendor.");
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

      showMenuMessage(error.message);
      return false;
    }
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

  // Create category ID
  function createCategoryId(category) {
    return String(category).trim().toLowerCase().replaceAll(" ", "-");
  }

  // Get current menu cards
  function getMenuCards() {
    return document.querySelectorAll(".menu-card");
  }

  // Get current category links
  function getCategoryLinks() {
    return document.querySelectorAll(".category-link");
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
    closeDialog(addMenuDialog);
    closeDialog(editMenuDialog);
    closeDialog(addCategoryDialog);
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

  // Display page message
  function showMenuMessage(message) {
    if (!noResultsMessage) {
      return;
    }

    noResultsMessage.textContent = message;
    noResultsMessage.hidden = false;
  }

  // Reset category selects
  function resetCategorySelects() {
    if (addCategorySelect) {
      addCategorySelect.innerHTML = '<option value="">Select category</option>';
    }

    if (editCategorySelect) {
      editCategorySelect.innerHTML =
        '<option value="">Select category</option>';
    }
  }

  // Add category to selects
  function addCategoryOption(category) {
    if (!category) {
      return;
    }

    const addOptionExists = Array.from(addCategorySelect?.options || []).some(
      (option) => option.value === category,
    );

    const editOptionExists = Array.from(editCategorySelect?.options || []).some(
      (option) => option.value === category,
    );

    if (addCategorySelect && !addOptionExists) {
      addCategorySelect.add(new Option(category, category));
    }

    if (editCategorySelect && !editOptionExists) {
      editCategorySelect.add(new Option(category, category));
    }
  }

  // Create one menu card
  function createMenuCard(menuItem) {
    const isAvailable = Boolean(menuItem.IsAvailable);
    const availability = isAvailable ? "available" : "unavailable";
    const unavailableClass = isAvailable ? "" : " menu-card-unavailable";
    const statusClass = isAvailable ? "status-available" : "status-unavailable";
    const statusText = isAvailable ? "Available" : "Unavailable";
    const imageStyle = menuItem.ImageURL
      ? `style="background-image:url('${escapeHtml(menuItem.ImageURL)}')"`
      : "";

    return `
      <article
        class="menu-card${unavailableClass}"
        data-menu-item-id="${menuItem.MenuItemID}"
        data-category="${escapeHtml(menuItem.ItemCategory)}"
        data-menu-item-name="${escapeHtml(menuItem.ItemName)}"
        data-current-price="${menuItem.ItemPrice}"
        data-description="${escapeHtml(menuItem.ItemDescription || "")}"
        data-image="${escapeHtml(menuItem.ImageURL || "")}"
        data-availability="${availability}"
        data-resource="menu-item"
      >
        <div class="menu-image" ${imageStyle}></div>
        <div class="menu-price-box single-price">
          <h4 class="menu-name">${escapeHtml(menuItem.ItemName)}</h4>
          <span class="current-price">$${Number(menuItem.ItemPrice).toFixed(2)}</span>
        </div>
        <p class="menu-description">
          ${escapeHtml(menuItem.ItemDescription || "No description provided.")}
        </p>
        <div class="menu-card-footer">
          <button
            type="button"
            class="status-toggle ${statusClass}"
            aria-pressed="${isAvailable}"
            aria-label="Change ${escapeHtml(menuItem.ItemName)} availability"
            data-action="toggle-availability"
          >
            <span class="status-dot"></span>
            <span class="status-text">${statusText}</span>
          </button>
          <details class="more-menu">
            <summary aria-label="Open ${escapeHtml(menuItem.ItemName)} actions">
              <span class="material-symbols-rounded">more_horiz</span>
            </summary>
            <div class="action-menu">
              <button
                type="button"
                class="change-status-action"
                data-action="change-availability"
              >
                Change status
              </button>
              <button
                type="button"
                class="edit-action"
                data-action="edit-menu-item"
              >
                Edit item
              </button>
              <button
                type="button"
                class="delete-action"
                data-action="delete-menu-item"
              >
                Delete item
              </button>
            </div>
          </details>
        </div>
      </article>
    `;
  }

  // Render menu items
  function renderMenuItems(menuItems) {
    document.querySelectorAll(".category-link").forEach((link) => {
      link.remove();
    });

    resetCategorySelects();

    if (menuCategoryContainer) {
      menuCategoryContainer.innerHTML = "";
    }

    if (!Array.isArray(menuItems) || menuItems.length === 0) {
      showMenuMessage("No menu items found for this stall.");
      return;
    }

    const groupedItems = {};

    menuItems.forEach((menuItem) => {
      const category = menuItem.ItemCategory || "Others";

      if (!groupedItems[category]) {
        groupedItems[category] = [];
      }

      groupedItems[category].push(menuItem);
      addCategoryOption(category);
    });

    Object.entries(groupedItems).forEach(([category, items], categoryIndex) => {
      const categoryId = createCategoryId(category);
      const link = document.createElement("a");

      link.href = `#${categoryId}`;
      link.className =
        categoryIndex === 0 ? "category-link active" : "category-link";
      link.textContent = category;

      categoryNavigation?.insertBefore(link, addCategoryButton);

      const section = document.createElement("section");

      section.className = "menu-category-section";
      section.id = categoryId;
      section.innerHTML = `
        <div class="category-heading">
          <div>
            <h3>${escapeHtml(category)}</h3>
            <p>${items.length} ${items.length === 1 ? "item" : "items"}</p>
          </div>
        </div>
        <div class="menu-grid">
          ${items.map(createMenuCard).join("")}
        </div>
      `;

      menuCategoryContainer?.appendChild(section);
    });

    if (noResultsMessage) {
      noResultsMessage.hidden = true;
    }

    filterMenuItems();
  }

  // Retrieve menu items
  async function loadMenuItems() {
    if (!selectedStallId) {
      showMenuMessage("Select a stall to view its menu.");
      return;
    }

    try {
      const menuItems = await vendorFetch(`/vendor-menu/${selectedStallId}`);

      renderMenuItems(menuItems);
    } catch (error) {
      console.error("Error loading menu items:", error);
      showMenuMessage(error.message);
    }
  }

  // Create PUT request data
  function getMenuItemDataFromCard(card, isAvailable) {
    return {
      ItemName: card.dataset.menuItemName,
      ItemDescription: card.dataset.description || null,
      ItemPrice: Number(card.dataset.currentPrice),
      ItemCategory: card.dataset.category,
      ImageURL: card.dataset.image || null,
      IsAvailable: isAvailable,
    };
  }

  // Filter menu items
  function filterMenuItems() {
    if (!searchInput || !availabilityFilter) {
      return;
    }

    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedStatus = availabilityFilter.value;
    let visibleItemCount = 0;

    getMenuCards().forEach((card) => {
      const itemName = (card.dataset.menuItemName || "").toLowerCase();
      const itemStatus = card.dataset.availability || "";
      const matchesSearch = itemName.includes(searchTerm);
      const matchesStatus =
        selectedStatus === "all" || itemStatus === selectedStatus;
      const shouldShow = matchesSearch && matchesStatus;

      card.hidden = !shouldShow;

      if (shouldShow) {
        visibleItemCount += 1;
      }
    });

    if (noResultsMessage && getMenuCards().length > 0) {
      noResultsMessage.textContent =
        "No menu items match your search or filter.";
      noResultsMessage.hidden = visibleItemCount !== 0;
    }
  }

  // Update availability
  async function toggleAvailability(card) {
    const menuItemId = card.dataset.menuItemId;
    const isCurrentlyAvailable = card.dataset.availability === "available";

    const updatedData = getMenuItemDataFromCard(card, !isCurrentlyAvailable);

    try {
      await vendorFetch(`/vendor-menu/${selectedStallId}/${menuItemId}`, {
        method: "PUT",
        body: JSON.stringify(updatedData),
      });

      await loadMenuItems();
    } catch (error) {
      console.error("Error updating availability:", error);
      alert(error.message);
    }
  }

  // Create menu item
  addMenuForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!selectedStallId) {
      alert("Please select a stall first.");
      return;
    }

    const menuItemData = {
      ItemName: document.querySelector("#add-item-name").value.trim(),
      ItemDescription:
        document.querySelector("#add-item-description").value.trim() || null,
      ItemPrice: Number(document.querySelector("#add-item-price").value),
      ItemCategory: document.querySelector("#add-item-category").value,
      ImageURL:
        document.querySelector("#add-item-image-url").value.trim() || null,
      IsAvailable:
        document.querySelector("#add-item-status").value === "available",
    };

    try {
      await vendorFetch(`/vendor-menu/${selectedStallId}`, {
        method: "POST",
        body: JSON.stringify(menuItemData),
      });

      addMenuForm.reset();
      closeDialog(addMenuDialog);
      await loadMenuItems();
      alert("Menu item created successfully.");
    } catch (error) {
      console.error("Error creating menu item:", error);
      alert(error.message);
    }
  });

  // Open edit dialog
  function openEditMenuDialog(card) {
    addCategoryOption(card.dataset.category);

    document.querySelector("#edit-menu-item-id").value =
      card.dataset.menuItemId;
    document.querySelector("#edit-item-name").value = card.dataset.menuItemName;
    document.querySelector("#edit-item-category").value = card.dataset.category;
    document.querySelector("#edit-item-status").value =
      card.dataset.availability;
    document.querySelector("#edit-item-description").value =
      card.dataset.description;
    document.querySelector("#edit-item-price").value =
      card.dataset.currentPrice;
    document.querySelector("#edit-item-image-url").value =
      card.dataset.image || "";

    openDialog(editMenuDialog);
  }

  // Update menu item
  editMenuForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const menuItemId = document.querySelector("#edit-menu-item-id").value;
    const menuItemData = {
      ItemName: document.querySelector("#edit-item-name").value.trim(),
      ItemDescription:
        document.querySelector("#edit-item-description").value.trim() || null,
      ItemPrice: Number(document.querySelector("#edit-item-price").value),
      ItemCategory: document.querySelector("#edit-item-category").value,
      ImageURL:
        document.querySelector("#edit-item-image-url").value.trim() || null,
      IsAvailable:
        document.querySelector("#edit-item-status").value === "available",
    };

    try {
      await vendorFetch(`/vendor-menu/${selectedStallId}/${menuItemId}`, {
        method: "PUT",
        body: JSON.stringify(menuItemData),
      });

      closeDialog(editMenuDialog);
      await loadMenuItems();
      alert("Menu item updated successfully.");
    } catch (error) {
      console.error("Error updating menu item:", error);
      alert(error.message);
    }
  });

  // Delete menu item
  async function deleteMenuItem(card) {
    const menuItemId = card.dataset.menuItemId;
    const itemName = card.dataset.menuItemName;

    const confirmed = confirm(`Are you sure you want to delete ${itemName}?`);

    if (!confirmed) {
      return;
    }

    try {
      await vendorFetch(`/vendor-menu/${selectedStallId}/${menuItemId}`, {
        method: "DELETE",
      });

      await loadMenuItems();
      alert("Menu item deleted successfully.");
    } catch (error) {
      console.error("Error deleting menu item:", error);
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
    await loadMenuItems();
  });

  // Close stall dropdown
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".stall-switcher")) {
      closeStallDropdown();
    }
  });

  // Open add menu dialog
  addMenuButton?.addEventListener("click", () => {
    if (!selectedStallId) {
      alert("Please select a stall first.");
      return;
    }

    openDialog(addMenuDialog);
  });

  // Open add category dialog
  addCategoryButton?.addEventListener("click", () => {
    openDialog(addCategoryDialog);
  });

  // Close dialog buttons
  closeDialogButtons.forEach((button) => {
    button.addEventListener("click", () => {
      closeAllDialogs();
    });
  });

  // Close dialog background
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("menu-dialog")) {
      closeAllDialogs();
    }
  });

  // Menu card actions
  document.addEventListener("click", async (event) => {
    const card = event.target.closest(".menu-card");

    if (!card) {
      return;
    }

    if (
      event.target.closest(".status-toggle") ||
      event.target.closest(".change-status-action")
    ) {
      await toggleAvailability(card);
      return;
    }

    if (event.target.closest(".edit-action")) {
      openEditMenuDialog(card);
      return;
    }

    if (event.target.closest(".delete-action")) {
      await deleteMenuItem(card);
    }
  });

  // Close other three-dot menus
  document.addEventListener(
    "toggle",
    (event) => {
      const openedMenu = event.target.closest(".more-menu");

      if (!openedMenu || !openedMenu.open) {
        return;
      }

      document.querySelectorAll(".more-menu").forEach((menu) => {
        if (menu !== openedMenu) {
          menu.removeAttribute("open");
        }
      });
    },
    true,
  );

  // Close three-dot menus outside
  document.addEventListener("click", (event) => {
    document.querySelectorAll(".more-menu").forEach((menu) => {
      if (!menu.contains(event.target)) {
        menu.removeAttribute("open");
      }
    });
  });

  // Search filter
  searchInput?.addEventListener("input", filterMenuItems);

  // Availability filter
  availabilityFilter?.addEventListener("change", filterMenuItems);

  // Category navigation
  categoryNavigation?.addEventListener("click", (event) => {
    const link = event.target.closest(".category-link");

    if (!link) {
      return;
    }

    getCategoryLinks().forEach((categoryLink) => {
      categoryLink.classList.remove("active");
    });

    link.classList.add("active");
  });

  // Add category to frontend
  addCategoryForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const input = document.querySelector("#category-name");
    const categoryName = input.value.trim();

    if (!categoryName) {
      return;
    }

    addCategoryOption(categoryName);
    input.value = "";
    closeDialog(addCategoryDialog);
  });

  // Initial page load
  async function initialiseMenuPage() {
    const stallsLoaded = await loadVendorStalls();
    if (!stallsLoaded) {
      return;
    }
    await loadMenuItems();
  }
  initialiseMenuPage();
});
