document.addEventListener("DOMContentLoaded", () => {
  /* element selectors */
  const switchStallButton = document.querySelector("#switch-stall-button");
  const stallDropdown = document.querySelector("#stall-dropdown");
  const stallOptions = document.querySelectorAll(".stall-option");
  const selectedStallName = document.querySelector("#selected-stall-name");
  const selectedStallAddress = document.querySelector(
    "#selected-stall-address",
  );
  const searchInput = document.querySelector("#menu-search-input");
  const availabilityFilter = document.querySelector("#availability-filter");
  /*
    The menu items now use .menu-card,
    not .menu-item-placeholder.
  */
  const menuCards = document.querySelectorAll(".menu-card");
  const noResultsMessage = document.querySelector("#no-menu-results");
  const categoryLinks = document.querySelectorAll(".category-link");
  const moreMenus = document.querySelectorAll(".more-menu");
  /* dialogs */
  const addMenuDialog = document.querySelector("#add-menu-dialog");
  const editMenuDialog = document.querySelector("#edit-menu-dialog");
  const addCategoryDialog = document.querySelector("#add-category-dialog");

  const addMenuButton = document.querySelector(".floating-add-menu-button");
  const addCategoryButton = document.querySelector(".add-category-button");

  // const editButtons = document.querySelectorAll(".edit-action");
  const closeDialogButtons = document.querySelectorAll(".close-dialog-button");

  const addCategoryForm = document.querySelector("#add-category-form");
  const categoryNavigation = document.querySelector(".category-navigation");
  /* stall dropdown */
  function closeStallDropdown() {
    if (!switchStallButton || !stallDropdown) {
      return;
    }
    switchStallButton.setAttribute("aria-expanded", "false");
    stallDropdown.hidden = true;
  }
  function toggleStallDropdown() {
    if (!switchStallButton || !stallDropdown) {
      return;
    }
    const isOpen = switchStallButton.getAttribute("aria-expanded") === "true";
    switchStallButton.setAttribute("aria-expanded", String(!isOpen));
    stallDropdown.hidden = isOpen;
  }

  /* open dialog */
  function openDialog(dialog) {
    if (!dialog) {
      return;
    }

    dialog.hidden = false;
    document.body.style.overflow = "hidden";
  }

  /* close dialog */
  function closeDialog(dialog) {
    if (!dialog) {
      return;
    }

    dialog.hidden = true;
    document.body.style.overflow = "";
  }

  /* close all dialogs */
  function closeAllDialogs() {
    closeDialog(addMenuDialog);
    closeDialog(editMenuDialog);
    closeDialog(addCategoryDialog);
  }
  if (switchStallButton && stallDropdown) {
    switchStallButton.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleStallDropdown();
    });
  }
  stallOptions.forEach((option) => {
    option.addEventListener("click", () => {
      if (!selectedStallName || !selectedStallAddress) {
        return;
      }
      selectedStallName.textContent = option.dataset.stallName || "";
      selectedStallAddress.textContent = option.dataset.stallAddress || "";
      stallOptions.forEach((stallOption) => {
        stallOption.classList.remove("active");
      });
      option.classList.add("active");
      closeStallDropdown();
    });
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".stall-switcher")) {
      closeStallDropdown();
    }
  });

  /* add menu button */
  addMenuButton?.addEventListener("click", () => {
    openDialog(addMenuDialog);
  });

  /* add category button */
  addCategoryButton?.addEventListener("click", () => {
    openDialog(addCategoryDialog);
  });

  /* close buttons */
  closeDialogButtons.forEach((button) => {
    button.addEventListener("click", () => {
      closeAllDialogs();
    });
  });

  /* click outside dialog */
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("menu-dialog")) {
      closeAllDialogs();
    }
  });

  /* edit menu item */
  document.addEventListener("click", (event) => {
    const button = event.target.closest(".edit-action");

    if (!button) {
      return;
    }

    const card = button.closest(".menu-card");

    if (!card) {
      return;
    }

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
    document.querySelector("#edit-item-recommended").checked =
      card.dataset.recommended === "true";

    openDialog(editMenuDialog);
  });

  /* category */
  /* add category */
  addCategoryForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = document.querySelector("#category-name");
    const value = input.value.trim();

    if (!value) {
      return;
    }

    const id = value.toLowerCase().replaceAll(" ", "-");
    const link = document.createElement("a");
    link.href = "#" + id;
    link.className = "category-link";
    link.textContent = value;
    categoryNavigation.insertBefore(link, addCategoryButton);
    input.value = "";

    closeDialog(addCategoryDialog);
  });
  /* search and status filter */
  function filterMenuItems() {
    if (!searchInput || !availabilityFilter) {
      return;
    }
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedStatus = availabilityFilter.value;
    let visibleItemCount = 0;
    menuCards.forEach((card) => {
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
  if (searchInput) {
    searchInput.addEventListener("input", filterMenuItems);
  }
  if (availabilityFilter) {
    availabilityFilter.addEventListener("change", filterMenuItems);
  }
  /* category sidebar */
  categoryLinks.forEach((link) => {
    link.addEventListener("click", () => {
      categoryLinks.forEach((categoryLink) => {
        categoryLink.classList.remove("active");
      });
      link.classList.add("active");
    });
  });
  /* availability controls */
  function updateAvailability(card, isAvailable) {
    const statusButton = card.querySelector(".status-toggle");
    const statusText = card.querySelector(".status-text");
    const moreMenu = card.querySelector(".more-menu");
    if (!statusButton || !statusText) {
      return;
    }
    if (isAvailable) {
      statusButton.classList.remove("status-unavailable");
      statusButton.classList.add("status-available");
      statusText.textContent = "Available";
      statusButton.setAttribute("aria-pressed", "true");
      card.classList.remove("menu-card-unavailable");
      card.dataset.availability = "available";
    } else {
      statusButton.classList.remove("status-available");
      statusButton.classList.add("status-unavailable");
      statusText.textContent = "Unavailable";
      statusButton.setAttribute("aria-pressed", "false");
      card.classList.add("menu-card-unavailable");
      card.dataset.availability = "unavailable";
    }
    if (moreMenu) {
      moreMenu.removeAttribute("open");
    }
    /*
      Reapply the selected filter after
      changing the card's availability.
    */
    filterMenuItems();
  }
  function toggleAvailability(card) {
    const statusButton = card.querySelector(".status-toggle");
    if (!statusButton) {
      return;
    }
    const isCurrentlyAvailable =
      statusButton.classList.contains("status-available");
    updateAvailability(card, !isCurrentlyAvailable);
  }
  menuCards.forEach((card) => {
    const statusButton = card.querySelector(".status-toggle");
    const changeStatusButton = card.querySelector(".change-status-action");
    if (statusButton) {
      statusButton.addEventListener("click", () => {
        toggleAvailability(card);
      });
    }
    if (changeStatusButton) {
      changeStatusButton.addEventListener("click", () => {
        toggleAvailability(card);
      });
    }
  });
  /* three-dot action menus */
  moreMenus.forEach((menu) => {
    menu.addEventListener("toggle", () => {
      if (!menu.open) {
        return;
      }
      moreMenus.forEach((otherMenu) => {
        if (otherMenu !== menu) {
          otherMenu.removeAttribute("open");
        }
      });
    });
  });
  document.addEventListener("click", (event) => {
    moreMenus.forEach((menu) => {
      if (!menu.contains(event.target)) {
        menu.removeAttribute("open");
      }
    });
  });
  /* initial filter */
  filterMenuItems();
});
