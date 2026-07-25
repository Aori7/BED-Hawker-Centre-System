document.addEventListener("DOMContentLoaded", () => {
  /* element selectors */
  const switchStallButton = document.querySelector("#switch-stall-button");
  const stallDropdown = document.querySelector("#stall-dropdown");
  const stallOptions = document.querySelectorAll(".stall-option");
  const selectedStallName = document.querySelector("#selected-stall-name");
  const selectedStallAddress = document.querySelector(
    "#selected-stall-address",
  );
  const statusLinks = document.querySelectorAll(".status-link");
  const promotionSections = document.querySelectorAll(
    ".promotion-status-section",
  );
  const searchInput = document.querySelector("#promotion-search-input");
  const categoryFilter = document.querySelector("#category-filter");
  const noResultsMessage = document.querySelector("#no-promotion-results");
  const promotionMenuButtons = document.querySelectorAll(
    ".promotion-menu-button",
  );
  /* stall selector dropdown */
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
  /* promotion helper */
  function getPromotionCards() {
    return document.querySelectorAll(".promotion-card");
  }
  /* search and category filter */
  function filterPromotions() {
    const searchTerm = searchInput
      ? searchInput.value.trim().toLowerCase()
      : "";
    const selectedCategory = categoryFilter ? categoryFilter.value : "all";
    const promotionCards = getPromotionCards();
    let visiblePromotionCount = 0;
    promotionCards.forEach((card) => {
      const promotionName = (card.dataset.promotionName || "").toLowerCase();
      const promotionCategory = card.dataset.category || "";
      const matchesSearch = promotionName.includes(searchTerm);
      const matchesCategory =
        selectedCategory === "all" || promotionCategory === selectedCategory;
      const shouldShow = matchesSearch && matchesCategory;
      card.hidden = !shouldShow;
      if (shouldShow) {
        visiblePromotionCount += 1;
      }
    });
    if (noResultsMessage) {
      noResultsMessage.hidden = visiblePromotionCount !== 0;
    }
  }
  if (searchInput) {
    searchInput.addEventListener("input", filterPromotions);
  }
  if (categoryFilter) {
    categoryFilter.addEventListener("change", filterPromotions);
  }
  /* sidebar navigation same behaviour as menu page */
  statusLinks.forEach((link) => {
    link.addEventListener("click", () => {
      statusLinks.forEach((statusLink) => {
        statusLink.classList.remove("active");
      });
      link.classList.add("active");
    });
  });
  /*
    Updates the active sidebar link while the
    user scrolls between promotion sections.
  */
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const matchingLink = document.querySelector(
          `.status-link[href="#${entry.target.id}"]`,
        );
        if (!matchingLink) {
          return;
        }
        statusLinks.forEach((link) => {
          link.classList.remove("active");
        });
        matchingLink.classList.add("active");
      });
    },
    {
      root: null,
      rootMargin: "-25% 0px -60% 0px",
      threshold: 0,
    },
  );
  promotionSections.forEach((section) => {
    sectionObserver.observe(section);
  });
  /* promotion dropdown menus */
  function closeAllPromotionMenus(excludedDropdown = null) {
    const openDropdowns = document.querySelectorAll(
      ".promotion-menu-dropdown.open",
    );
    openDropdowns.forEach((dropdown) => {
      if (dropdown === excludedDropdown) {
        return;
      }
      dropdown.classList.remove("open");
      const relatedButton = dropdown.previousElementSibling;
      if (
        relatedButton &&
        relatedButton.classList.contains("promotion-menu-button")
      ) {
        relatedButton.setAttribute("aria-expanded", "false");
      }
    });
  }
  promotionMenuButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const dropdown = button.nextElementSibling;
      if (
        !dropdown ||
        !dropdown.classList.contains("promotion-menu-dropdown")
      ) {
        return;
      }
      const wasOpen = dropdown.classList.contains("open");
      closeAllPromotionMenus(dropdown);
      dropdown.classList.toggle("open", !wasOpen);
      button.setAttribute("aria-expanded", String(!wasOpen));
    });
  });
  /* update promotion status */
  function updatePromotionStatus(card, newStatus) {
    const statusBadge = card.querySelector(".promotion-status");
    const changeStatusButton = card.querySelector(".change-status-action");
    const targetSectionId =
      newStatus === "active" ? "#active-promotions" : "#inactive-promotions";
    const targetGrid = document.querySelector(
      `${targetSectionId} .promotion-grid`,
    );
    card.dataset.promotionStatus = newStatus;
    if (newStatus === "active") {
      card.classList.remove("promotion-card-inactive");
      if (statusBadge) {
        statusBadge.classList.remove("inactive-status");
        statusBadge.classList.add("active-status");
        statusBadge.textContent = "Active";
      }
      if (changeStatusButton) {
        changeStatusButton.textContent = "Mark inactive";
      }
    } else {
      card.classList.add("promotion-card-inactive");
      if (statusBadge) {
        statusBadge.classList.remove("active-status");
        statusBadge.classList.add("inactive-status");
        statusBadge.textContent = "Inactive";
      }
      if (changeStatusButton) {
        changeStatusButton.textContent = "Mark active";
      }
    }
    if (targetGrid) {
      targetGrid.appendChild(card);
    }
    closeAllPromotionMenus();
    filterPromotions();
  }
  /* card actions */
  function initialisePromotionCard(card) {
    const changeStatusButton = card.querySelector(".change-status-action");
    const editButton = card.querySelector(".edit-action");
    const removeButton = card.querySelector(".remove-action");
    if (changeStatusButton) {
      changeStatusButton.addEventListener("click", () => {
        const currentStatus = card.dataset.promotionStatus;
        const newStatus = currentStatus === "active" ? "inactive" : "active";
        updatePromotionStatus(card, newStatus);
      });
    }
    /*
      Frontend placeholder for the future
      edit promotion popup.
    */
    if (editButton) {
      editButton.addEventListener("click", () => {
        closeAllPromotionMenus();
        const promotionName = card.dataset.promotionName || "Promotion";
        window.alert(`Edit form for "${promotionName}" will be added later.`);
      });
    }
    /*
      Frontend-only removal for now.
      Replace this with the backend DELETE
      request later.
    */
    if (removeButton) {
      removeButton.addEventListener("click", () => {
        const promotionName = card.dataset.promotionName || "this promotion";
        const shouldRemove = window.confirm(`Remove "${promotionName}"?`);
        if (!shouldRemove) {
          return;
        }
        card.remove();
        closeAllPromotionMenus();
        filterPromotions();
      });
    }
  }
  getPromotionCards().forEach((card) => {
    initialisePromotionCard(card);
  });
  /* close dropdowns when clicking elsewhere */
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".stall-switcher")) {
      closeStallDropdown();
    }
    if (!event.target.closest(".promotion-menu")) {
      closeAllPromotionMenus();
    }
  });
  /* escape key support */
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }
    closeStallDropdown();
    closeAllPromotionMenus();
  });
  /* initial page setup */
  filterPromotions();
});
