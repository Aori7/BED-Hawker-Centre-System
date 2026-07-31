document.addEventListener("DOMContentLoaded", () => {
  /* DOM elements */
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

  const promotionCards = () => document.querySelectorAll(".promotion-card");
  const promotionMenuButtons = document.querySelectorAll(
    ".promotion-menu-button",
  );

  const addPromotionButton = document.querySelector("#add-promotion-button");
  const addPromotionDialog = document.querySelector("#add-promotion-dialog");

  /* Promotion dialogs */
  const editPromotionDialog = document.querySelector("#edit-promotion-dialog");
  const removePromotionDialog = document.querySelector(
    "#remove-promotion-dialog",
  );
  const promotionStatusDialog = document.querySelector(
    "#promotion-status-dialog",
  );

  /* Dialog buttons */
  const confirmRemovePromotionButton = document.querySelector(
    "#confirm-remove-promotion",
  );
  const confirmPromotionStatusButton = document.querySelector(
    "#confirm-promotion-status",
  );

  /* Dialog text */
  const removePromotionMessage = document.querySelector(
    "#remove-promotion-message",
  );
  const promotionStatusMessage = document.querySelector(
    "#promotion-status-message",
  );

  /* Selected promotion */
  let selectedPromotionCard = null;
  let pendingPromotionStatus = null;

  const addPromotionForm = document.querySelector("#add-promotion-form");
  const closeDialogButtons = document.querySelectorAll(".close-dialog-button");

  /* -------------------- */
  /* Stall selector */
  /* -------------------- */

  /* Closes the stall dropdown */
  function closeStallDropdown() {
    if (!switchStallButton || !stallDropdown) {
      return;
    }

    switchStallButton.setAttribute("aria-expanded", "false");
    stallDropdown.hidden = true;
  }

  /* Opens or closes the stall dropdown */
  function toggleStallDropdown() {
    if (!switchStallButton || !stallDropdown) {
      return;
    }

    const isOpen = switchStallButton.getAttribute("aria-expanded") === "true";

    switchStallButton.setAttribute("aria-expanded", String(!isOpen));
    stallDropdown.hidden = isOpen;
  }

  /* Changes the selected stall */
  function selectStall(option) {
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
  }

  /* -------------------- */
  /* Promotion helpers */
  /* -------------------- */

  /* Returns all promotion cards */
  function getPromotionCards() {
    return document.querySelectorAll(".promotion-card");
  }

  /* Returns a promotion card's status */
  function getPromotionStatus(card) {
    return card.dataset.promotionStatus;
  }

  /* Returns a promotion name */
  function getPromotionName(card) {
    return card.dataset.promotionName || "Promotion";
  }

  /* -------------------- */
  /* Search */
  /* -------------------- */

  /* Filters promotion cards */
  function filterPromotions() {
    const searchTerm = searchInput
      ? searchInput.value.trim().toLowerCase()
      : "";

    const selectedCategory = categoryFilter ? categoryFilter.value : "all";

    let visiblePromotionCount = 0;

    getPromotionCards().forEach((card) => {
      const promotionName = (card.dataset.promotionName || "").toLowerCase();
      const promotionCategory = card.dataset.category || "";

      const matchesSearch = promotionName.includes(searchTerm);

      const matchesCategory =
        selectedCategory === "all" || promotionCategory === selectedCategory;

      const shouldShow = matchesSearch && matchesCategory;

      card.hidden = !shouldShow;

      if (shouldShow) {
        visiblePromotionCount++;
      }
    });

    if (noResultsMessage) {
      noResultsMessage.hidden = visiblePromotionCount !== 0;
    }
  }

  /* -------------------- */
  /* Sidebar */
  /* -------------------- */

  /* Updates the active sidebar link */
  function setActiveSidebarLink(link) {
    statusLinks.forEach((statusLink) => {
      statusLink.classList.remove("active");
    });

    link.classList.add("active");
  }

  /* Watches which promotion section is visible */
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

        setActiveSidebarLink(matchingLink);
      });
    },
    {
      root: null,
      rootMargin: "-25% 0px -60% 0px",
      threshold: 0,
    },
  );

  /* -------------------- */
  /* Promotion menu */
  /* -------------------- */

  /* Closes every promotion menu */
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

  /* Opens or closes a promotion menu */
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

  /* -------------------- */
  /* Dialog helpers */
  /* -------------------- */

  /* Opens a dialog */
  function openDialog(dialog) {
    if (!dialog) {
      return;
    }

    dialog.hidden = false;
    document.body.style.overflow = "hidden";
  }

  /* Closes a dialog */
  function closeDialog(dialog) {
    if (!dialog) {
      return;
    }

    dialog.hidden = true;
    document.body.style.overflow = "";
  }

  /* Closes every dialog */
  function closeAllDialogs() {
    document.querySelectorAll(".promotion-dialog").forEach((dialog) => {
      dialog.hidden = true;
    });

    document.body.style.overflow = "";
  }

  /* -------------------- */
  /* Promotion status */
  /* -------------------- */

  /* Updates a promotion's status */
  function updatePromotionStatus(card, newStatus) {
    const statusBadge = card.querySelector(".promotion-status");
    const changeStatusButton = card.querySelector(".change-status-action");

    const targetSection =
      newStatus === "active" ? "#active-promotions" : "#inactive-promotions";

    const targetGrid = document.querySelector(
      `${targetSection} .promotion-grid`,
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
  /* -------------------- */
  /* Promotion actions */
  /* -------------------- */

  /* Changes a promotion's status */
  function changePromotionStatus(card) {
    const currentStatus = getPromotionStatus(card);
    const newStatus = currentStatus === "active" ? "inactive" : "active";

    updatePromotionStatus(card, newStatus);
  }

  /* Opens the edit promotion dialog */
  function openEditPromotion(card) {
    closeAllPromotionMenus();

    selectedPromotionCard = card;

    document.querySelector("#edit-promotion-name").value =
      card.querySelector(".promotion-name")?.textContent || "";

    document.querySelector("#edit-promotion-description").value =
      card.querySelector(".promotion-description")?.textContent || "";

    openDialog(editPromotionDialog);
  }

  /* Opens the remove dialog */
  function deletePromotion(card) {
    closeAllPromotionMenus();

    selectedPromotionCard = card;

    removePromotionMessage.textContent = `Remove "${getPromotionName(card)}"?`;

    openDialog(removePromotionDialog);
  }

  /* -------------------- */
  /* Card initialisation */
  /* -------------------- */

  /* Initialises a promotion card */
  function initialisePromotionCard(card) {
    const changeStatusButton = card.querySelector(".change-status-action");
    const editButton = card.querySelector(".edit-action");
    const removeButton = card.querySelector(".remove-action");

    changeStatusButton?.addEventListener("click", () => {
      changePromotionStatus(card);
    });

    editButton?.addEventListener("click", () => {
      openEditPromotion(card);
    });

    removeButton?.addEventListener("click", () => {
      deletePromotion(card);
    });
  }

  /* Initialises every promotion card */
  function initialisePromotionCards() {
    getPromotionCards().forEach((card) => {
      initialisePromotionCard(card);
    });
  }

  /* -------------------- */
  /* Stall selector */
  /* -------------------- */

  function initialiseStallSelector() {
    if (switchStallButton && stallDropdown) {
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
  }

  /* -------------------- */
  /* Search */
  /* -------------------- */

  function initialiseSearch() {
    searchInput?.addEventListener("input", filterPromotions);

    categoryFilter?.addEventListener("change", filterPromotions);
  }

  /* -------------------- */
  /* Sidebar */
  /* -------------------- */

  function initialiseSidebar() {
    statusLinks.forEach((link) => {
      link.addEventListener("click", () => {
        setActiveSidebarLink(link);
      });
    });

    promotionSections.forEach((section) => {
      sectionObserver.observe(section);
    });
  }

  /* -------------------- */
  /* Promotion menus */
  /* -------------------- */

  function initialisePromotionMenus() {
    promotionMenuButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        togglePromotionMenu(button);
      });
    });
  }

  /* -------------------- */
  /* Dialogs */
  /* -------------------- */

  function initialiseDialogs() {
    addPromotionButton?.addEventListener("click", () => {
      openDialog(addPromotionDialog);
    });

    closeDialogButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const dialog = button.closest(".promotion-dialog");

        if (dialog) {
          closeDialog(dialog);
        }
      });
    });

    addPromotionDialog?.addEventListener("click", (event) => {
      if (event.target === addPromotionDialog) {
        closeDialog(addPromotionDialog);
      }
    });
  }

  /* -------------------- */
  /* Global events */
  /* -------------------- */

  function initialiseGlobalEvents() {
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".stall-switcher")) {
        closeStallDropdown();
      }

      if (!event.target.closest(".promotion-menu")) {
        closeAllPromotionMenus();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") {
        return;
      }

      closeStallDropdown();
      closeAllPromotionMenus();
      closeAllDialogs();
    });
  }

  /* -------------------- */
  /* Add promotion form */
  /* -------------------- */

  /* Handles the add promotion form */
  function handleAddPromotion(event) {
    event.preventDefault();

    /*
      TODO:
      Replace this frontend placeholder
      with a POST request.
    */

    console.log("Add promotion submitted.");

    closeDialog(addPromotionDialog);
    addPromotionForm.reset();
  }

  /* -------------------- */
  /* Discount type */
  /* -------------------- */

  function initialiseDiscountType() {
    const discountType = document.querySelector("#add-discount-type");
    const discountValueField = document.querySelector(
      "#add-discount-value-field",
    );
    const discountValueLabel = document.querySelector(
      "#add-discount-value-label",
    );
    const discountValue = document.querySelector("#add-discount-value");

    if (!discountType) {
      return;
    }

    discountType.addEventListener("change", () => {
      switch (discountType.value) {
        case "percentage":
          discountValueField.hidden = false;
          discountValueLabel.textContent = "Percentage (%)";
          discountValue.placeholder = "20";
          break;

        case "fixed":
          discountValueField.hidden = false;
          discountValueLabel.textContent = "Discount Amount ($)";
          discountValue.placeholder = "2.50";
          break;

        case "free-item":
          discountValueField.hidden = true;
          break;

        default:
          discountValueField.hidden = false;
          discountValueLabel.textContent = "Discount value";
          discountValue.placeholder = "";
      }
    });
  }

  /* -------------------- */
  /* Forms */
  /* -------------------- */

  function initialiseForms() {
    addPromotionForm?.addEventListener("submit", handleAddPromotion);
  }

  /* -------------------- */
  /* Initial page setup */
  /* -------------------- */

  initialiseStallSelector();
  initialiseSearch();
  initialiseSidebar();
  initialisePromotionMenus();
  initialiseDialogs();
  initialiseGlobalEvents();
  initialisePromotionCards();
  initialiseDiscountType();
  initialiseForms();

  filterPromotions();
});
