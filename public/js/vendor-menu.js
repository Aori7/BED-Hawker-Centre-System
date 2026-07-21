document.addEventListener("DOMContentLoaded", () => {
  const switchStallButton = document.querySelector(
    "#switch-stall-button",
  );

  const stallDropdown = document.querySelector("#stall-dropdown");
  const stallOptions = document.querySelectorAll(".stall-option");

  const selectedStallName = document.querySelector(
    "#selected-stall-name",
  );

  const selectedStallAddress = document.querySelector(
    "#selected-stall-address",
  );

  const searchInput = document.querySelector("#menu-search-input");

  const availabilityFilter = document.querySelector(
    "#availability-filter",
  );

  const menuItems = document.querySelectorAll(
    ".menu-item-placeholder",
  );

  const noResultsMessage = document.querySelector(
    "#no-menu-results",
  );

  const categoryLinks = document.querySelectorAll(".category-link");

  /* =========================
     Stall dropdown
     ========================= */

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

    const isOpen =
      switchStallButton.getAttribute("aria-expanded") === "true";

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

      selectedStallName.textContent = option.dataset.stallName;
      selectedStallAddress.textContent =
        option.dataset.stallAddress;

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

    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedStatus = availabilityFilter.value;

    let visibleItemCount = 0;

    menuItems.forEach((item) => {
      const itemName = (item.dataset.name || "").toLowerCase();
      const itemStatus = item.dataset.status || "";

      const matchesSearch = itemName.includes(searchTerm);

      const matchesStatus =
        selectedStatus === "all" ||
        itemStatus === selectedStatus;

      const shouldShow = matchesSearch && matchesStatus;

      item.hidden = !shouldShow;

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
});