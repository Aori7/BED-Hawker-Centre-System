document.addEventListener("DOMContentLoaded", () => {
  const menuCards = document.querySelectorAll(".menu-card");
  const moreMenus = document.querySelectorAll(".more-menu");

  /**
   * Updates a card's appearance based on whether
   * the menu item is available.
   */
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
    } else {
      statusButton.classList.remove("status-available");
      statusButton.classList.add("status-unavailable");

      statusText.textContent = "Unavailable";
      statusButton.setAttribute("aria-pressed", "false");

      card.classList.add("menu-card-unavailable");
    }

    if (moreMenu) {
      moreMenu.removeAttribute("open");
    }
  }

  /**
   * Switches the item between available and unavailable.
   *
   * This only changes the frontend display for now.
   * Refreshing the page will reset the status.
   */
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
    const changeStatusButton = card.querySelector(
      ".change-status-action",
    );

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

  /**
   * Keeps only one three-dot action menu open at a time.
   */
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

  /**
   * Closes action menus when the user clicks elsewhere.
   */
  document.addEventListener("click", (event) => {
    moreMenus.forEach((menu) => {
      if (!menu.contains(event.target)) {
        menu.removeAttribute("open");
      }
    });
  });
});