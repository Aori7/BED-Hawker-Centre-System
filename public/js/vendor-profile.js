document.addEventListener("DOMContentLoaded", () => {
  /* element selectors */
  const switchStallButton = document.querySelector("#switch-stall-button");
  const stallDropdown = document.querySelector("#stall-dropdown");
  const stallOptions = document.querySelectorAll(".stall-option");
  const selectedStallName = document.querySelector("#selected-stall-name");
  const selectedStallAddress = document.querySelector(
    "#selected-stall-address",
  );

  const stallInformationForm = document.querySelector(
    "#stall-information-form",
  );
  const contactInformationForm = document.querySelector(
    "#contact-information-form",
  );
  const businessInformationForm = document.querySelector(
    "#business-information-form",
  );
  const passwordForm = document.querySelector("#password-form");

  const changeLogoButton = document.querySelector("#change-logo-button");

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

  /* save helpers */
  function saveStallInformation() {
    /* backend request goes here */

    alert("Stall information updated.");
  }

  function saveContactInformation() {
    /* backend request goes here */

    alert("Contact information updated.");
  }

  function saveBusinessInformation() {
    /* backend request goes here */

    alert("Business information updated.");
  }

  function updatePassword() {
    /* backend request goes here */

    alert("Password updated.");
  }

  /* validate password */
  function validatePassword() {
    const currentPassword = document.querySelector("#current-password");
    const newPassword = document.querySelector("#new-password");
    const confirmPassword = document.querySelector("#confirm-password");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return false;
    }

    if (newPassword.value.trim().length < 8) {
      alert("Password must be at least 8 characters.");
      newPassword.focus();
      return false;
    }

    if (newPassword.value !== confirmPassword.value) {
      alert("Passwords do not match.");
      confirmPassword.focus();
      return false;
    }

    return true;
  }

  /* stall switcher */
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

      stallOptions.forEach((stall) => {
        stall.classList.remove("active");
      });

      option.classList.add("active");

      closeStallDropdown();

      /* backend request goes here */
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".stall-switcher")) {
      closeStallDropdown();
    }
  });

  /* logo upload */
  changeLogoButton?.addEventListener("click", () => {
    /* image upload will be connected later */

    alert("Logo upload will be connected to the backend.");
  });

  /* stall information */
  stallInformationForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    saveStallInformation();
  });

  /* contact information */
  contactInformationForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    saveContactInformation();
  });

  /* business information */
  businessInformationForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    saveBusinessInformation();
  });

  /* password */
  passwordForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validatePassword()) {
      return;
    }

    updatePassword();

    passwordForm.reset();
  });

  /* detect unsaved changes */
  document.querySelectorAll("input,textarea,select").forEach((field) => {
    field.dataset.originalValue = field.value;

    field.addEventListener("change", () => {
      if (field.value !== field.dataset.originalValue) {
        field.dataset.modified = "true";
      } else {
        field.dataset.modified = "false";
      }
    });
  });

  /* backend profile loader */
  function loadVendorProfile() {
    /*
      Example:

      fetch("/api/vendor/profile")
      .then(...)
      .then(...)
    */
  }

  /* backend stall loader */
  function loadVendorStalls() {
    /*
      Example:

      fetch("/api/vendor/stalls")
      .then(...)
      .then(...)
    */
  }

  /* initialise page */
  loadVendorProfile();
  loadVendorStalls();
});
