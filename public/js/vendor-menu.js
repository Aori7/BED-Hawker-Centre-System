document.addEventListener("DOMContentLoaded", () => {
  /* =========================
     Element selectors
     ========================= */

  const switchStallButton = document.querySelector(
    "#switch-stall-button",
  );

  const stallDropdown = document.querySelector(
    "#stall-dropdown",
  );

  const stallOptions = document.querySelectorAll(
    ".stall-option",
  );

  const selectedStallName = document.querySelector(
    "#selected-stall-name",
  );

  const selectedStallAddress = document.querySelector(
    "#selected-stall-address",
  );

  const searchInput = document.querySelector(
    "#menu-search-input",
  );

  const availabilityFilter = document.querySelector(
    "#availability-filter",
  );

  /*
    The menu items now use .menu-card,
    not .menu-item-placeholder.
  */
  const menuCards = document.querySelectorAll(".menu-card");

  const noResultsMessage = document.querySelector(
    "#no-menu-results",
  );

  const categoryLinks = document.querySelectorAll(
    ".category-link",
  );

  const moreMenus = document.querySelectorAll(".more-menu");

  /* =========================
     Stall dropdown
     ========================= */

  function closeStallDropdown() {
    if (!switchStallButton || !stallDropdown) {
      return;
    }

    switchStallButton.setAttribute(
      "aria-expanded",
      "false",
    );

    stallDropdown.hidden = true;
  }

  function toggleStallDropdown() {
    if (!switchStallButton || !stallDropdown) {
      return;
    }

    const isOpen =
      switchStallButton.getAttribute("aria-expanded") ===
      "true";

    switchStallButton.setAttribute(
      "aria-expanded",
      String(!isOpen),
    );

    stallDropdown.hidden = isOpen;
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

      selectedStallName.textContent =
        option.dataset.stallName || "";

      selectedStallAddress.textContent =
        option.dataset.stallAddress || "";

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

  /* =========================
     Search and status filter
     ========================= */

  function filterMenuItems() {
    if (!searchInput || !availabilityFilter) {
      return;
    }

    const searchTerm = searchInput.value
      .trim()
      .toLowerCase();

    const selectedStatus = availabilityFilter.value;

    let visibleItemCount = 0;

    menuCards.forEach((card) => {
      const itemName = (
        card.dataset.name || ""
      ).toLowerCase();

      const itemStatus = card.dataset.status || "";

      const matchesSearch =
        itemName.includes(searchTerm);

      const matchesStatus =
        selectedStatus === "all" ||
        itemStatus === selectedStatus;

      const shouldShow =
        matchesSearch && matchesStatus;

      card.hidden = !shouldShow;

      if (shouldShow) {
        visibleItemCount += 1;
      }
    });

    if (noResultsMessage) {
      noResultsMessage.hidden =
        visibleItemCount !== 0;
    }
  }

  if (searchInput) {
    searchInput.addEventListener(
      "input",
      filterMenuItems,
    );
  }

  if (availabilityFilter) {
    availabilityFilter.addEventListener(
      "change",
      filterMenuItems,
    );
  }

  /* =========================
     Category sidebar
     ========================= */

  categoryLinks.forEach((link) => {
    link.addEventListener("click", () => {
      categoryLinks.forEach((categoryLink) => {
        categoryLink.classList.remove("active");
      });

      link.classList.add("active");
    });
  });

  /* =========================
     Availability controls
     ========================= */

  function updateAvailability(card, isAvailable) {
    const statusButton = card.querySelector(
      ".status-toggle",
    );

    const statusText = card.querySelector(
      ".status-text",
    );

    const moreMenu = card.querySelector(".more-menu");

    if (!statusButton || !statusText) {
      return;
    }

    if (isAvailable) {
      statusButton.classList.remove(
        "status-unavailable",
      );

      statusButton.classList.add(
        "status-available",
      );

      statusText.textContent = "Available";

      statusButton.setAttribute(
        "aria-pressed",
        "true",
      );

      card.classList.remove(
        "menu-card-unavailable",
      );

      card.dataset.status = "available";
    } else {
      statusButton.classList.remove(
        "status-available",
      );

      statusButton.classList.add(
        "status-unavailable",
      );

      statusText.textContent = "Unavailable";

      statusButton.setAttribute(
        "aria-pressed",
        "false",
      );

      card.classList.add(
        "menu-card-unavailable",
      );

      card.dataset.status = "unavailable";
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
    const statusButton = card.querySelector(
      ".status-toggle",
    );

    if (!statusButton) {
      return;
    }

    const isCurrentlyAvailable =
      statusButton.classList.contains(
        "status-available",
      );

    updateAvailability(
      card,
      !isCurrentlyAvailable,
    );
  }

  menuCards.forEach((card) => {
    const statusButton = card.querySelector(
      ".status-toggle",
    );

    const changeStatusButton = card.querySelector(
      ".change-status-action",
    );

    if (statusButton) {
      statusButton.addEventListener("click", () => {
        toggleAvailability(card);
      });
    }

    if (changeStatusButton) {
      changeStatusButton.addEventListener(
        "click",
        () => {
          toggleAvailability(card);
        },
      );
    }
  });

  /* =========================
     Three-dot action menus
     ========================= */

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

  /* =========================
     Initial filter
     ========================= */

  filterMenuItems();
});