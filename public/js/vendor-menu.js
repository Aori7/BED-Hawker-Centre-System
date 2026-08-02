// Implementing BE to FE
document.addEventListener("DOMContentLoaded", () => {
  const accessToken = sessionStorage.getItem("accessToken");
  let selectedStallId = sessionStorage.getItem("selectedStallId") || "1";

  // element selectors
  const switchStallButton = document.querySelector("#switch-stall-button");
  const stallDropdown = document.querySelector("#stall-dropdown");
  const stallOptions = document.querySelectorAll(".stall-option");
  const selectedStallName = document.querySelector("#selected-stall-name");
  const selectedStallAddress = document.querySelector(
    "#selected-stall-address",
  );
  const searchInput = document.querySelector("#menu-search-input");
  const availabilityFilter = document.querySelector("#availability-filter");
  const noResultsMessage = document.querySelector("#no-menu-results");
  const categoryNavigation = document.querySelector(".category-navigation");
  const menuContent = document.querySelector(".menu-content");

  // dialogs
  const addMenuDialog = document.querySelector("#add-menu-dialog");
  const editMenuDialog = document.querySelector("#edit-menu-dialog");
  const addCategoryDialog = document.querySelector("#add-category-dialog");

  const addMenuButton = document.querySelector(".floating-add-menu-button");
  const addCategoryButton = document.querySelector(".add-category-button");
  const closeDialogButtons = document.querySelectorAll(".close-dialog-button");

  // forms
  const addMenuForm = document.querySelector("#add-menu-form");
  const editMenuForm = document.querySelector("#edit-menu-form");
  const addCategoryForm = document.querySelector("#add-category-form");

  // redirect if not logged in
  if (!accessToken) {
    alert("Please log in first.");
    window.location.href = "login.html";
    return;
  }

  // send request to backend
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

  // create safe HTML text
  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // create category ID */
  function createCategoryId(category) {
    return String(category).trim().toLowerCase().replaceAll(" ", "-");
  }

  // get current menu cards
  function getMenuCards() {
    return document.querySelectorAll(".menu-card");
  }

  // get current category links
  function getCategoryLinks() {
    return document.querySelectorAll(".category-link");
  }

  // open dialog
  function openDialog(dialog) {
    if (!dialog) {
      return;
    }

    dialog.hidden = false;
    document.body.style.overflow = "hidden";
  }

  // close dialog
  function closeDialog(dialog) {
    if (!dialog) {
      return;
    }
    dialog.hidden = true;
    document.body.style.overflow = "";
  }

  // close all dialogs
  function closeAllDialogs() {
    closeDialog(addMenuDialog);
    closeDialog(editMenuDialog);
    closeDialog(addCategoryDialog);
  }

  // close stall dropdown
  function closeStallDropdown() {
    if (!switchStallButton || !stallDropdown) {
      return;
    }

    switchStallButton.setAttribute("aria-expanded", "false");
    stallDropdown.hidden = true;
  }

  // toggle stall dropdown
  function toggleStallDropdown() {
    if (!switchStallButton || !stallDropdown) {
      return;
    }

    const isOpen = switchStallButton.getAttribute("aria-expanded") === "true";

    switchStallButton.setAttribute("aria-expanded", String(!isOpen));
    stallDropdown.hidden = isOpen;
  }

  // display selected stall
  function displaySelectedStall() {
    const selectedOption = document.querySelector(
      `.stall-option[data-stall-id="${selectedStallId}"]`,
    );

    if (!selectedOption) {
      return;
    }

    stallOptions.forEach((option) => {
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

    const addStallId = document.querySelector("#add-stall-id");

    if (addStallId) {
      addStallId.value = selectedStallId;
    }
  }

  // create one menu card
  function createMenuCard(menuItem) {
    const availability = menuItem.IsAvailable ? "available" : "unavailable";
    const unavailableClass = menuItem.IsAvailable
      ? ""
      : " menu-card-unavailable";
    const statusClass = menuItem.IsAvailable
      ? "status-available"
      : "status-unavailable";
    const statusText = menuItem.IsAvailable ? "Available" : "Unavailable";
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
          <span class="current-price">
            $${Number(menuItem.ItemPrice).toFixed(2)}
          </span>
        </div>

        <p class="menu-description">
          ${escapeHtml(menuItem.ItemDescription || "No description provided.")}
        </p>

        <div class="menu-card-footer">
          <button
            type="button"
            class="status-toggle ${statusClass}"
            aria-pressed="${menuItem.IsAvailable}"
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

  // display menu items by category
  function renderMenuItems(menuItems) {
    document.querySelectorAll(".menu-category-section").forEach((section) => {
      section.remove();
    });

    document.querySelectorAll(".category-link").forEach((link) => {
      link.remove();
    });

    if (!menuItems.length) {
      if (noResultsMessage) {
        noResultsMessage.textContent = "No menu items found for this stall.";
        noResultsMessage.hidden = false;
      }
      return;
    }

    const groupedItems = {};

    menuItems.forEach((menuItem) => {
      const category = menuItem.ItemCategory || "Others";

      if (!groupedItems[category]) {
        groupedItems[category] = [];
      }
      groupedItems[category].push(menuItem);
    });

    Object.entries(groupedItems).forEach(([category, items], categoryIndex) => {
      const categoryId = createCategoryId(category);

      const link = document.createElement("a");
      link.href = `#${categoryId}`;
      link.className =
        categoryIndex === 0 ? "category-link active" : "category-link";
      link.textContent = category;

      categoryNavigation.insertBefore(link, addCategoryButton);

      const section = document.createElement("section");
      section.className = "menu-category-section";
      section.id = categoryId;

      section.innerHTML = `
          <div class="category-heading">
            <div>
              <h3>${escapeHtml(category)}</h3>
              <p>
                ${items.length} ${items.length === 1 ? "item" : "items"}
              </p>
            </div>
          </div>

          <div class="menu-grid">
            ${items.map(createMenuCard).join("")}
          </div>
        `;

      menuContent.insertBefore(section, noResultsMessage);
    });

    if (noResultsMessage) {
      noResultsMessage.hidden = true;
    }
    filterMenuItems();
  }

  // retrieve menu items
  async function loadMenuItems() {
    try {
      const menuItems = await vendorFetch(`/vendor-menu/${selectedStallId}`);

      renderMenuItems(menuItems);
    } catch (error) {
      console.error("Error loading menu items:", error);
      alert(error.message);
    }
  }

  // get card data for PUT request
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

  // filter menu cards
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

    if (noResultsMessage) {
      noResultsMessage.hidden = visibleItemCount !== 0;
    }
  }

  // update availability in database
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

  // create menu item
  addMenuForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const menuItemData = {
      ItemName: document.querySelector("#add-item-name").value.trim(),
      ItemDescription:
        document.querySelector("#add-item-description").value.trim() || null,
      ItemPrice: Number(document.querySelector("#add-item-price").value),
      ItemCategory: document.querySelector("#add-item-category").value,
      ImageURL: null,
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

  // open edit dialog
  function openEditMenuDialog(card) {
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

    const recommendedCheckbox = document.querySelector(
      "#edit-item-recommended",
    );

    if (recommendedCheckbox) {
      recommendedCheckbox.checked = false;
    }

    openDialog(editMenuDialog);
  }

  // update menu item
  editMenuForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const menuItemId = document.querySelector("#edit-menu-item-id").value;
    const currentCard = document.querySelector(
      `.menu-card[data-menu-item-id="${menuItemId}"]`,
    );

    const menuItemData = {
      ItemName: document.querySelector("#edit-item-name").value.trim(),
      ItemDescription:
        document.querySelector("#edit-item-description").value.trim() || null,
      ItemPrice: Number(document.querySelector("#edit-item-price").value),
      ItemCategory: document.querySelector("#edit-item-category").value,
      ImageURL: currentCard?.dataset.image || null,
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

  // delete menu item
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

  // stall dropdown button
  switchStallButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleStallDropdown();
  });

  // select stall 
  stallOptions.forEach((option) => {
    option.addEventListener("click", async () => {
      selectedStallId = option.dataset.stallId;

      sessionStorage.setItem("selectedStallId", selectedStallId);

      displaySelectedStall();
      closeStallDropdown();
      await loadMenuItems();
    });
  });

  // close stall dropdown
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".stall-switcher")) {
      closeStallDropdown();
    }
  });
  // open add menu dialog
  addMenuButton?.addEventListener("click", () => {
    openDialog(addMenuDialog);
  });
  // open add category dialog
  addCategoryButton?.addEventListener("click", () => {
    openDialog(addCategoryDialog);
  });
  // close dialog buttons
  closeDialogButtons.forEach((button) => {
    button.addEventListener("click", () => {
      closeAllDialogs();
    });
  });

  // close dialog when background is clicked
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("menu-dialog")) {
      closeAllDialogs();
    }
  });
  // card actions 
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

  // close other three-dot menus
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

  // close three-dot menus outside
  document.addEventListener("click", (event) => {
    document.querySelectorAll(".more-menu").forEach((menu) => {
      if (!menu.contains(event.target)) {
        menu.removeAttribute("open");
      }
    });
  });

  // search filter
  searchInput?.addEventListener("input", filterMenuItems);
  // availability filter
  availabilityFilter?.addEventListener("change", filterMenuItems);
  // category navigation
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

  // add category to frontend
  addCategoryForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    const input = document.querySelector("#category-name");
    const categoryName = input.value.trim();

    if (!categoryName) {
      return;
    }

    const categoryId = createCategoryId(categoryName);

    if (document.querySelector(`#${categoryId}`)) {
      alert("This category already exists.");
      return;
    }

    const link = document.createElement("a");
    link.href = `#${categoryId}`;
    link.className = "category-link";
    link.textContent = categoryName;

    categoryNavigation.insertBefore(link, addCategoryButton);

    const section = document.createElement("section");
    section.className = "menu-category-section";
    section.id = categoryId;

    section.innerHTML = `
      <div class="category-heading">
        <div>
          <h3>${escapeHtml(categoryName)}</h3>
          <p>0 items</p>
        </div>
      </div>

      <div class="menu-grid"></div>
    `;

    menuContent.insertBefore(section, noResultsMessage);

    const addCategorySelect = document.querySelector("#add-item-category");
    const editCategorySelect = document.querySelector("#edit-item-category");

    addCategorySelect?.add(new Option(categoryName, categoryName));
    editCategorySelect?.add(new Option(categoryName, categoryName));

    input.value = "";
    closeDialog(addCategoryDialog);
  });

  // initial page load
  displaySelectedStall();
  loadMenuItems();
});
