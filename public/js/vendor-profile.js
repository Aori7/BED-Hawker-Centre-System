document.addEventListener("DOMContentLoaded", () => {
  const accessToken = sessionStorage.getItem("accessToken");
  let currentProfile = null;
  let toastTimeout = null;

  // Element selectors
  const profilePageMessage = document.querySelector("#profile-page-message");
  const profileGrid = document.querySelector("#profile-grid");
  const profileSummary = document.querySelector("#profile-summary");
  const profileSummaryName = document.querySelector("#profile-summary-name");
  const profileSummaryEmail = document.querySelector("#profile-summary-email");
  const profileUserId = document.querySelector("#profile-user-id");
  const profileOwnerId = document.querySelector("#profile-owner-id");
  const profileEmail = document.querySelector("#profile-email");
  const profileNric = document.querySelector("#profile-nric");
  const profileForm = document.querySelector("#profile-form");
  const ownerNameInput = document.querySelector("#owner-name");
  const contactNumberInput = document.querySelector("#contact-number");
  const profileFormMessage = document.querySelector("#profile-form-message");
  const saveProfileButton = document.querySelector("#save-profile-button");
  const passwordForm = document.querySelector("#password-form");
  const currentPasswordInput = document.querySelector("#current-password");
  const newPasswordInput = document.querySelector("#new-password");
  const confirmPasswordInput = document.querySelector("#confirm-password");
  const passwordFormMessage = document.querySelector("#password-form-message");
  const updatePasswordButton = document.querySelector(
    "#update-password-button",
  );
  const passwordToggleButtons = document.querySelectorAll(
    ".password-toggle-button",
  );
  const successToast = document.querySelector("#success-toast");
  const successToastMessage = document.querySelector("#success-toast-message");

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

    let data = {};

    try {
      data = await response.json();
    } catch (error) {
      throw new Error("The server returned an invalid response.");
    }

    if (!response.ok) {
      throw new Error(data.error || "Request failed.");
    }
    return data;
  }

  // Show page message
  function showPageMessage(message, isError = false) {
    if (!profilePageMessage) {
      return;
    }
    profilePageMessage.textContent = message;
    profilePageMessage.classList.toggle("error-message", isError);
    profilePageMessage.hidden = false;
  }

  // Hide page message
  function hidePageMessage() {
    if (profilePageMessage) {
      profilePageMessage.hidden = true;
    }
  }

  // Show form message
  function showFormMessage(element, message, isError = true) {
    if (!element) {
      return;
    }
    element.textContent = message;
    element.classList.toggle("error-message", isError);
    element.classList.toggle("success-message", !isError);
    element.hidden = false;
  }

  // Hide form message
  function hideFormMessage(element) {
    if (element) {
      element.hidden = true;
      element.textContent = "";
    }
  }

  // Show success toast
  function showSuccessToast(message) {
    if (!successToast) {
      return;
    }

    if (successToastMessage) {
      successToastMessage.textContent = message;
    }

    successToast.hidden = false;
    window.clearTimeout(toastTimeout);

    toastTimeout = window.setTimeout(() => {
      successToast.hidden = true;
    }, 3000);
  }

  // Set button loading state
  function setButtonLoading(button, isLoading, loadingText, normalText) {
    if (!button) {
      return;
    }
    button.disabled = isLoading;
    button.textContent = isLoading ? loadingText : normalText;
  }

  // Display profile information
  function displayProfile(profile) {
    currentProfile = profile;

    if (profileSummaryName) {
      profileSummaryName.textContent = profile.OwnerName || "Stall Owner";
    }

    if (profileSummaryEmail) {
      profileSummaryEmail.textContent = profile.Email || "";
    }

    if (profileUserId) {
      profileUserId.value = profile.UserID ?? "";
    }

    if (profileOwnerId) {
      profileOwnerId.value = profile.OwnerID ?? "";
    }

    if (profileEmail) {
      profileEmail.value = profile.Email || "";
    }

    if (profileNric) {
      profileNric.value = profile.NRIC || "";
    }

    if (ownerNameInput) {
      ownerNameInput.value = profile.OwnerName || "";
    }

    if (contactNumberInput) {
      contactNumberInput.value = profile.ContactNo || "";
    }

    if (profileSummary) {
      profileSummary.hidden = false;
    }

    if (profileGrid) {
      profileGrid.hidden = false;
    }
    hidePageMessage();
  }

  // Load vendor profile
  async function loadVendorProfile() {
    showPageMessage("Loading profile...");

    try {
      const profile = await vendorFetch("/vendor-profile");
      displayProfile(profile);
    } catch (error) {
      console.error("Error loading vendor profile:", error);
      showPageMessage(error.message, true);
    }
  }

  // Validate profile form
  function validateProfileForm() {
    const ownerName = ownerNameInput?.value.trim() || "";
    const contactNumber = contactNumberInput?.value.trim() || "";

    if (!ownerName) {
      showFormMessage(profileFormMessage, "Owner name is required.");
      ownerNameInput?.focus();
      return false;
    }

    if (ownerName.length > 100) {
      showFormMessage(
        profileFormMessage,
        "Owner name cannot exceed 100 characters.",
      );
      ownerNameInput?.focus();
      return false;
    }

    if (!/^[89]\d{7}$/.test(contactNumber)) {
      showFormMessage(
        profileFormMessage,
        "Contact number must be a valid Singapore mobile number.",
      );
      contactNumberInput?.focus();
      return false;
    }
    return true;
  }

  // Update vendor profile
  async function updateVendorProfile(event) {
    event.preventDefault();
    hideFormMessage(profileFormMessage);

    if (!validateProfileForm()) {
      return;
    }

    const profileData = {
      OwnerName: ownerNameInput.value.trim(),
      ContactNo: contactNumberInput.value.trim(),
    };

    setButtonLoading(saveProfileButton, true, "Saving...", "Save Changes");

    try {
      const updatedProfile = await vendorFetch("/vendor-profile", {
        method: "PUT",
        body: JSON.stringify(profileData),
      });

      displayProfile(updatedProfile);
      showSuccessToast("Profile updated successfully.");
    } catch (error) {
      console.error("Error updating vendor profile:", error);
      showFormMessage(profileFormMessage, error.message);
    } finally {
      setButtonLoading(saveProfileButton, false, "Saving...", "Save Changes");
    }
  }

  // Validate password form
  function validatePasswordForm() {
    const currentPassword = currentPasswordInput?.value || "";
    const newPassword = newPasswordInput?.value || "";
    const confirmPassword = confirmPasswordInput?.value || "";

    if (!currentPassword) {
      showFormMessage(passwordFormMessage, "Current password is required.");
      currentPasswordInput?.focus();
      return false;
    }

    if (newPassword.length < 8) {
      showFormMessage(
        passwordFormMessage,
        "New password must be at least 8 characters.",
      );
      newPasswordInput?.focus();
      return false;
    }

    if (newPassword.length > 100) {
      showFormMessage(
        passwordFormMessage,
        "New password cannot exceed 100 characters.",
      );
      newPasswordInput?.focus();
      return false;
    }

    if (newPassword !== confirmPassword) {
      showFormMessage(passwordFormMessage, "Passwords do not match.");
      confirmPasswordInput?.focus();
      return false;
    }

    if (currentPassword === newPassword) {
      showFormMessage(
        passwordFormMessage,
        "New password must be different from your current password.",
      );
      newPasswordInput?.focus();
      return false;
    }
    return true;
  }

  // Change vendor password
  async function changeVendorPassword(event) {
    event.preventDefault();
    hideFormMessage(passwordFormMessage);

    if (!validatePasswordForm()) {
      return;
    }
    const passwordData = {
      CurrentPassword: currentPasswordInput.value,
      NewPassword: newPasswordInput.value,
      ConfirmPassword: confirmPasswordInput.value,
    };

    setButtonLoading(
      updatePasswordButton,
      true,
      "Updating...",
      "Update Password",
    );

    try {
      const result = await vendorFetch("/vendor-profile/password", {
        method: "PUT",
        body: JSON.stringify(passwordData),
      });

      passwordForm.reset();
      showSuccessToast(result.message || "Password updated successfully.");
    } catch (error) {
      console.error("Error updating password:", error);
      showFormMessage(passwordFormMessage, error.message);
    } finally {
      setButtonLoading(
        updatePasswordButton,
        false,
        "Updating...",
        "Update Password",
      );
    }
  }

  // Toggle password visibility
  function togglePasswordVisibility(button) {
    const targetId = button.dataset.passwordTarget;
    const input = document.querySelector(`#${targetId}`);
    const icon = button.querySelector(".material-symbols-rounded");

    if (!input) {
      return;
    }

    const shouldShow = input.type === "password";

    input.type = shouldShow ? "text" : "password";
    button.setAttribute(
      "aria-label",
      shouldShow ? "Hide password" : "Show password",
    );

    if (icon) {
      icon.textContent = shouldShow ? "visibility_off" : "visibility";
    }
  }

  // Clear profile message when editing
  ownerNameInput?.addEventListener("input", () => {
    hideFormMessage(profileFormMessage);
  });

  contactNumberInput?.addEventListener("input", () => {
    contactNumberInput.value = contactNumberInput.value.replace(/\D/g, "");
    hideFormMessage(profileFormMessage);
  });

  // Clear password message when editing
  currentPasswordInput?.addEventListener("input", () => {
    hideFormMessage(passwordFormMessage);
  });

  newPasswordInput?.addEventListener("input", () => {
    hideFormMessage(passwordFormMessage);
  });

  confirmPasswordInput?.addEventListener("input", () => {
    hideFormMessage(passwordFormMessage);
  });

  // Profile form
  profileForm?.addEventListener("submit", updateVendorProfile);

  // Password form
  passwordForm?.addEventListener("submit", changeVendorPassword);

  // Password visibility buttons
  passwordToggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      togglePasswordVisibility(button);
    });
  });

  // Initial page load
  loadVendorProfile();
});
