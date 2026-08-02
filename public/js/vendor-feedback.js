document.addEventListener("DOMContentLoaded", () => {
  const accessToken = sessionStorage.getItem("accessToken");
  let selectedStallId = sessionStorage.getItem("selectedStallId");
  let selectedSubmissionId = null;
  let selectedReplyId = null;
  let toastTimeout = null;
  let complaintsExpanded = false;
  let feedbackExpanded = false;
  const visibleCardLimit = 5;

  // Element selectors
  const switchStallButton = document.querySelector("#switch-stall-button");
  const stallDropdown = document.querySelector("#stall-dropdown");
  const selectedStallName = document.querySelector("#selected-stall-name");
  const selectedStallAddress = document.querySelector(
    "#selected-stall-address",
  );
  const feedbackTypeFilter = document.querySelector("#feedback-type-filter");
  const feedbackStatusFilter = document.querySelector(
    "#feedback-status-filter",
  );
  const sortFilter = document.querySelector("#sort-filter");
  const clearFeedbackFilters = document.querySelector(
    "#clear-feedback-filters",
  );
  const complaintsSection = document.querySelector("#complaints-section");
  const generalFeedbackSection = document.querySelector(
    "#general-feedback-section",
  );
  const complaintsGrid = document.querySelector("#complaints-grid");
  const feedbackGrid = document.querySelector("#feedback-grid");
  const complaintCount = document.querySelector("#complaint-count");
  const feedbackCount = document.querySelector("#feedback-count");
  const complaintsSeeMoreButton = document.querySelector(
    "#complaints-see-more-button",
  );
  const feedbackSeeMoreButton = document.querySelector(
    "#feedback-see-more-button",
  );
  const noComplaintsMessage = document.querySelector("#no-complaints-message");
  const noFeedbackMessage = document.querySelector("#no-feedback-message");
  const emptyPageMessage = document.querySelector("#empty-page-message");
  const replyDialog = document.querySelector("#reply-dialog");
  const replyForm = document.querySelector("#reply-form");
  const replySubmissionId = document.querySelector("#reply-submission-id");
  const replyDialogCustomerName = document.querySelector(
    "#reply-dialog-customer-name",
  );
  const replyDialogMessage = document.querySelector("#reply-dialog-message");
  const replyMessageInput = document.querySelector("#reply-message-input");
  const replyCharacterCount = document.querySelector("#reply-character-count");
  const replyErrorMessage = document.querySelector("#reply-error-message");
  const replyDialogClose = document.querySelector("#reply-dialog-close");
  const replyDialogCancel = document.querySelector("#reply-dialog-cancel");
  const deleteReplyDialog = document.querySelector("#delete-reply-dialog");
  const deleteReplyCancel = document.querySelector("#delete-reply-cancel");
  const deleteReplyConfirm = document.querySelector("#delete-reply-confirm");
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

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed.");
    }
    return data;
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

  // Get stall options
  function getStallOptions() {
    return document.querySelectorAll(".stall-option");
  }

  // Create customer initials
  function getInitials(name) {
    return String(name || "Customer")
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");
  }

  // Format date and time
  function formatDateTime(dateValue) {
    if (!dateValue) {
      return "-";
    }

    return new Date(dateValue).toLocaleString("en-SG", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  // Normalise feedback type
  function getFeedbackType(submissionType) {
    return String(submissionType || "").toLowerCase() === "complaint"
      ? "complaint"
      : "feedback";
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
        <span class="stall-option-name">${escapeHtml(stall.StallName)}</span>
        <span class="stall-option-location">${escapeHtml(address)}</span>
      </button>
    `;
  }

  // Show page message
  function showEmptyPageMessage(message) {
    if (!emptyPageMessage) {
      return;
    }

    const paragraph = emptyPageMessage.querySelector("p");

    if (paragraph) {
      paragraph.textContent = message;
    }
    emptyPageMessage.hidden = false;
  }

  // Load vendor stalls
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

        showEmptyPageMessage("No stalls are linked to this vendor.");
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
      showEmptyPageMessage(error.message);
      return false;
    }
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

  // Create one reply
  function createReply(reply, submissionId) {
    const isVendor = String(reply.SenderType).toLowerCase() === "vendor";
    const senderName = isVendor
      ? selectedStallName?.textContent.trim() || "Vendor"
      : "Customer";
    const initials = getInitials(senderName);
    const deleteButton = isVendor
      ? `
        <button
          type="button"
          class="delete-reply-button"
          data-action="delete-reply"
          data-submission-id="${submissionId}"
          data-reply-id="${reply.ReplyID}"
          aria-label="Delete reply"
        >
          <span class="material-symbols-rounded">delete</span>
        </button>
      `
      : "";

    return `
      <article class="reply-preview">
        <div class="reply-avatar">${escapeHtml(initials)}</div>
        <div class="reply-content">
          <div class="reply-heading">
            <strong>${escapeHtml(senderName)}</strong>
            <time datetime="${escapeHtml(reply.CreatedAt)}">
              ${formatDateTime(reply.CreatedAt)}
            </time>
            ${deleteButton}
          </div>
          <p>${escapeHtml(reply.ReplyMessage)}</p>
        </div>
      </article>
    `;
  }

  // Create one feedback card
  function createFeedbackCard(submission) {
    const feedbackType = getFeedbackType(submission.SubmissionType);
    const isComplaint = feedbackType === "complaint";
    const customerName = submission.CustomerName || "Customer";
    const replies = Array.isArray(submission.Replies) ? submission.Replies : [];
    const replyCount = replies.length;
    const status = submission.Status || "Pending";
    const isClosed = status === "Closed";

    return `
      <article
        class="feedback-card${isComplaint ? " complaint-card" : ""}"
        data-feedback-id="${submission.SubmissionID}"
        data-feedback-type="${feedbackType}"
        data-feedback-status="${escapeHtml(status)}"
        data-date="${escapeHtml(submission.CreatedAt)}"
        data-matches-filters="true"
        data-resource="feedback"
      >
        <header class="feedback-card-header">
          <div class="customer-avatar">${escapeHtml(getInitials(customerName))}</div>
          <div class="customer-details">
            <strong>${escapeHtml(customerName)}</strong>
            <time datetime="${escapeHtml(submission.CreatedAt)}">
              ${formatDateTime(submission.CreatedAt)}
            </time>
          </div>
          <span class="feedback-type-badge ${isComplaint ? "complaint-badge" : "feedback-badge"}">
            ${isComplaint ? "Complaint" : "Feedback"}
          </span>
        </header>

        <div class="feedback-subject">
          <strong>${escapeHtml(submission.Subject || "No subject")}</strong>
          <span class="feedback-status">${escapeHtml(status)}</span>
        </div>

        <div class="feedback-message-container">
          <p class="feedback-message">
            ${escapeHtml(submission.Message || "No message provided.")}
          </p>
          <button
            type="button"
            class="see-more-button"
            aria-expanded="false"
            data-action="toggle-message"
          >
            See more
          </button>
        </div>

        <div class="reply-preview-list" hidden>
          ${replies.map((reply) => createReply(reply, submission.SubmissionID)).join("")}
        </div>

        <footer class="feedback-card-footer">
          <button
            type="button"
            class="reply-count-button"
            aria-label="Show replies"
            aria-expanded="false"
            data-action="toggle-replies"
          >
            <span class="material-symbols-rounded">forum</span>
            <span class="reply-count">
              ${replyCount === 1 ? "1 reply" : `${replyCount} replies`}
            </span>
          </button>

          <button
            type="button"
            class="reply-button"
            data-action="open-reply-dialog"
            ${isClosed ? "disabled" : ""}
          >
            <span class="material-symbols-rounded">reply</span>
            ${isClosed ? "Closed" : "Reply"}
          </button>
        </footer>
      </article>
    `;
  }

  // Render feedback
  function renderFeedback(submissions) {
    if (complaintsGrid) {
      complaintsGrid.innerHTML = "";
    }

    if (feedbackGrid) {
      feedbackGrid.innerHTML = "";
    }

    if (!Array.isArray(submissions) || submissions.length === 0) {
      showEmptyPageMessage("No feedback has been received for this stall.");
      updateFeedbackSections();
      return;
    }

    submissions.forEach((submission) => {
      const feedbackType = getFeedbackType(submission.SubmissionType);
      const card = createFeedbackCard(submission);

      if (feedbackType === "complaint") {
        complaintsGrid?.insertAdjacentHTML("beforeend", card);
      } else {
        feedbackGrid?.insertAdjacentHTML("beforeend", card);
      }
    });

    if (emptyPageMessage) {
      emptyPageMessage.hidden = true;
    }
    complaintsExpanded = false;
    feedbackExpanded = false;
    filterFeedback();
  }

  // Load feedback
  async function loadFeedback() {
    if (!selectedStallId) {
      showEmptyPageMessage("Select a stall to view its feedback.");
      return;
    }
    try {
      const submissions = await vendorFetch(
        `/vendor-feedback/${selectedStallId}`,
      );

      renderFeedback(submissions);
    } catch (error) {
      console.error("Error loading feedback:", error);
      showEmptyPageMessage(error.message);
    }
  }

  // Get feedback cards
  function getCardsFromGrid(grid) {
    if (!grid) {
      return [];
    }
    return Array.from(grid.querySelectorAll(".feedback-card"));
  }

  // Get matching cards
  function getMatchingCardsFromGrid(grid) {
    return getCardsFromGrid(grid).filter((card) => {
      return card.dataset.matchesFilters === "true";
    });
  }

  // Update section count
  function updateSectionCount(element, count, singular, plural) {
    if (!element) {
      return;
    }
    element.textContent = `${count} ${count === 1 ? singular : plural}`;
  }

  // Sort cards
  function sortCardsInsideGrid(grid) {
    if (!grid) {
      return;
    }

    const selectedSort = sortFilter?.value || "newest";
    const cards = getCardsFromGrid(grid);

    cards.sort((firstCard, secondCard) => {
      const firstDate = new Date(firstCard.dataset.date).getTime();
      const secondDate = new Date(secondCard.dataset.date).getTime();

      if (selectedSort === "oldest") {
        return firstDate - secondDate;
      }

      return secondDate - firstDate;
    });

    cards.forEach((card) => {
      grid.appendChild(card);
    });
  }

  // Apply card limit
  function applyCardLimit(grid, isExpanded, button, itemName) {
    if (!grid || !button) {
      return;
    }

    const allCards = getCardsFromGrid(grid);
    const matchingCards = getMatchingCardsFromGrid(grid);

    allCards.forEach((card) => {
      card.hidden = true;
    });

    matchingCards.forEach((card, index) => {
      card.hidden = !(isExpanded || index < visibleCardLimit);
    });

    const hasAdditionalCards = matchingCards.length > visibleCardLimit;
    button.hidden = !hasAdditionalCards;
    button.setAttribute("aria-expanded", String(isExpanded));

    const text = button.querySelector(".section-see-more-text");

    if (text) {
      text.textContent = isExpanded
        ? `Show fewer ${itemName}`
        : `See more ${itemName}`;
    }
  }

  // Apply all card limits
  function applyAllCardLimits() {
    applyCardLimit(
      complaintsGrid,
      complaintsExpanded,
      complaintsSeeMoreButton,
      "complaints",
    );
    applyCardLimit(
      feedbackGrid,
      feedbackExpanded,
      feedbackSeeMoreButton,
      "feedback",
    );
  }

  // Update sections
  function updateFeedbackSections() {
    const matchingComplaints = getMatchingCardsFromGrid(complaintsGrid);
    const matchingFeedback = getMatchingCardsFromGrid(feedbackGrid);
    const selectedType = feedbackTypeFilter?.value || "all";

    if (complaintsSection) {
      complaintsSection.hidden = selectedType === "feedback";
    }

    if (generalFeedbackSection) {
      generalFeedbackSection.hidden = selectedType === "complaint";
    }

    if (noComplaintsMessage) {
      noComplaintsMessage.hidden = matchingComplaints.length !== 0;
    }

    if (noFeedbackMessage) {
      noFeedbackMessage.hidden = matchingFeedback.length !== 0;
    }

    updateSectionCount(
      complaintCount,
      matchingComplaints.length,
      "complaint",
      "complaints",
    );

    updateSectionCount(
      feedbackCount,
      matchingFeedback.length,
      "feedback",
      "feedback",
    );

    const totalMatching = matchingComplaints.length + matchingFeedback.length;

    if (emptyPageMessage) {
      emptyPageMessage.hidden = totalMatching !== 0;
    }
  }

  // Filter feedback
  function filterFeedback() {
    const selectedType = feedbackTypeFilter?.value || "all";
    const selectedStatus = feedbackStatusFilter?.value || "all";
    const cards = document.querySelectorAll(".feedback-card");

    cards.forEach((card) => {
      const matchesType =
        selectedType === "all" || card.dataset.feedbackType === selectedType;
      const matchesStatus =
        selectedStatus === "all" ||
        card.dataset.feedbackStatus === selectedStatus;

      card.dataset.matchesFilters = String(matchesType && matchesStatus);
    });

    complaintsExpanded = false;
    feedbackExpanded = false;
    sortCardsInsideGrid(complaintsGrid);
    sortCardsInsideGrid(feedbackGrid);
    updateFeedbackSections();
    applyAllCardLimits();
  }

  // Reset filters
  function resetFeedbackFilters() {
    if (feedbackTypeFilter) {
      feedbackTypeFilter.value = "all";
    }

    if (feedbackStatusFilter) {
      feedbackStatusFilter.value = "all";
    }

    if (sortFilter) {
      sortFilter.value = "newest";
    }
    filterFeedback();
  }

  // Toggle long message
  function toggleFeedbackMessage(button) {
    const container = button.closest(".feedback-message-container");
    const message = container?.querySelector(".feedback-message");

    if (!message) {
      return;
    }

    const isExpanded = button.getAttribute("aria-expanded") === "true";

    button.setAttribute("aria-expanded", String(!isExpanded));
    message.classList.toggle("expanded", !isExpanded);
    button.textContent = isExpanded ? "See more" : "See less";
  }

  // Toggle replies
  function toggleCardReplies(card, button) {
    const container = card.querySelector(".reply-preview-list");
    const count = container?.children.length || 0;

    if (!container || count === 0) {
      return;
    }

    const isExpanded = button.getAttribute("aria-expanded") === "true";

    container.hidden = isExpanded;
    button.setAttribute("aria-expanded", String(!isExpanded));
    button.setAttribute(
      "aria-label",
      isExpanded ? "Show replies" : "Hide replies",
    );
    card.classList.toggle("replies-expanded", !isExpanded);
  }

  // Open reply dialog
  function openReplyDialog(card) {
    if (
      !replyDialog ||
      !replyDialogCustomerName ||
      !replyDialogMessage ||
      !replyMessageInput ||
      !replySubmissionId
    ) {
      return;
    }

    selectedSubmissionId = card.dataset.feedbackId;
    const customerName =
      card.querySelector(".customer-details strong")?.textContent.trim() ||
      "Customer";
    const customerMessage =
      card.querySelector(".feedback-message")?.textContent.trim() || "";

    replySubmissionId.value = selectedSubmissionId;
    replyDialogCustomerName.textContent = `Reply to ${customerName}`;
    replyDialogMessage.textContent = customerMessage;
    replyMessageInput.value = "";

    if (replyCharacterCount) {
      replyCharacterCount.textContent = "0";
    }

    if (replyErrorMessage) {
      replyErrorMessage.hidden = true;
    }

    replyDialog.showModal();
    replyMessageInput.focus();
  }

  // Close reply dialog
  function closeReplyDialog() {
    if (!replyDialog) {
      return;
    }

    replyDialog.close();
    selectedSubmissionId = null;
  }

  // Show toast
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

  // Submit vendor reply
  async function submitReply(event) {
    event.preventDefault();

    if (!selectedSubmissionId || !replyMessageInput) {
      return;
    }

    const replyMessage = replyMessageInput.value.trim();

    if (!replyMessage) {
      if (replyErrorMessage) {
        replyErrorMessage.hidden = false;
      }
      replyMessageInput.focus();
      return;
    }

    try {
      await vendorFetch(
        `/vendor-feedback/${selectedStallId}/${selectedSubmissionId}/reply`,
        {
          method: "POST",
          body: JSON.stringify({
            ReplyMessage: replyMessage,
          }),
        },
      );

      closeReplyDialog();
      await loadFeedback();
      showSuccessToast("Your reply has been posted.");
    } catch (error) {
      console.error("Error creating reply:", error);
      alert(error.message);
    }
  }

  // Open delete reply dialog
  function openDeleteReplyDialog(button) {
    selectedSubmissionId = button.dataset.submissionId;
    selectedReplyId = button.dataset.replyId;
    deleteReplyDialog?.showModal();
  }

  // Close delete reply dialog
  function closeDeleteReplyDialog() {
    deleteReplyDialog?.close();
    selectedSubmissionId = null;
    selectedReplyId = null;
  }

  // Delete vendor reply
  async function deleteReply() {
    if (!selectedSubmissionId || !selectedReplyId) {
      return;
    }

    try {
      await vendorFetch(
        `/vendor-feedback/${selectedStallId}/${selectedSubmissionId}/reply/${selectedReplyId}`,
        {
          method: "DELETE",
        },
      );
      closeDeleteReplyDialog();
      await loadFeedback();
      showSuccessToast("Reply deleted successfully.");
    } catch (error) {
      console.error("Error deleting reply:", error);
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
    resetFeedbackFilters();
    await loadFeedback();
  });

  // Close stall dropdown outside
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".stall-switcher")) {
      closeStallDropdown();
    }
  });

  // Feedback controls
  feedbackTypeFilter?.addEventListener("change", filterFeedback);
  feedbackStatusFilter?.addEventListener("change", filterFeedback);
  sortFilter?.addEventListener("change", filterFeedback);
  clearFeedbackFilters?.addEventListener("click", resetFeedbackFilters);

  // Section buttons
  complaintsSeeMoreButton?.addEventListener("click", () => {
    complaintsExpanded = !complaintsExpanded;
    applyAllCardLimits();
  });

  feedbackSeeMoreButton?.addEventListener("click", () => {
    feedbackExpanded = !feedbackExpanded;
    applyAllCardLimits();
  });

  // Feedback card actions
  document.addEventListener("click", (event) => {
    const seeMoreButton = event.target.closest(".see-more-button");

    if (seeMoreButton) {
      toggleFeedbackMessage(seeMoreButton);
      return;
    }

    const replyCountButton = event.target.closest(".reply-count-button");

    if (replyCountButton) {
      const card = replyCountButton.closest(".feedback-card");

      if (card) {
        toggleCardReplies(card, replyCountButton);
      }
      return;
    }

    const replyButton = event.target.closest(".reply-button");

    if (replyButton && !replyButton.disabled) {
      const card = replyButton.closest(".feedback-card");

      if (card) {
        openReplyDialog(card);
      }
      return;
    }
    const deleteButton = event.target.closest(".delete-reply-button");

    if (deleteButton) {
      openDeleteReplyDialog(deleteButton);
    }
  });

  // Reply dialog controls
  replyMessageInput?.addEventListener("input", () => {
    if (replyCharacterCount) {
      replyCharacterCount.textContent = String(replyMessageInput.value.length);
    }

    if (replyErrorMessage && replyMessageInput.value.trim()) {
      replyErrorMessage.hidden = true;
    }
  });

  replyForm?.addEventListener("submit", submitReply);
  replyDialogClose?.addEventListener("click", closeReplyDialog);
  replyDialogCancel?.addEventListener("click", closeReplyDialog);

  replyDialog?.addEventListener("click", (event) => {
    if (event.target === replyDialog) {
      closeReplyDialog();
    }
  });

  // Delete dialog controls
  deleteReplyCancel?.addEventListener("click", closeDeleteReplyDialog);
  deleteReplyConfirm?.addEventListener("click", deleteReply);

  deleteReplyDialog?.addEventListener("click", (event) => {
    if (event.target === deleteReplyDialog) {
      closeDeleteReplyDialog();
    }
  });

  // Initial page load
  async function initialiseFeedbackPage() {
    const stallsLoaded = await loadVendorStalls();

    if (!stallsLoaded) {
      return;
    }
    await loadFeedback();
  }
  initialiseFeedbackPage();
});
