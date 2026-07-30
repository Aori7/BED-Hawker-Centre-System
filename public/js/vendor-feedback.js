document.addEventListener("DOMContentLoaded", () => {
  /* dom elements: stall selector */
  const switchStallButton = document.querySelector("#switch-stall-button");
  const stallDropdown = document.querySelector("#stall-dropdown");
  const stallOptions = document.querySelectorAll(".stall-option");
  const selectedStallName = document.querySelector("#selected-stall-name");
  const selectedStallAddress = document.querySelector(
    "#selected-stall-address",
  );
  /* dom elements: feedback filters */
  const feedbackTypeFilter = document.querySelector("#feedback-type-filter");
  const ratingFilter = document.querySelector("#rating-filter");
  const sortFilter = document.querySelector("#sort-filter");
  const clearFeedbackFilters = document.querySelector(
    "#clear-feedback-filters",
  );
  /* dom elements: feedback sections */
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
  /* dom elements: reply dialog */
  const replyDialog = document.querySelector("#reply-dialog");
  const replyForm = document.querySelector("#reply-form");
  /* selected submission id */
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
  const successToast = document.querySelector("#success-toast");
  /* page state */
  const visibleCardLimit = 5;
  let selectedFeedbackCard = null;
  let toastTimeout = null;
  let complaintsExpanded = false;
  let feedbackExpanded = false;
  /* stall selector functions */
  function closeStallDropdown() {
    if (!switchStallButton || !stallDropdown) return;
    switchStallButton.setAttribute("aria-expanded", "false");
    stallDropdown.hidden = true;
  }
  function toggleStallDropdown() {
    if (!switchStallButton || !stallDropdown) return;
    const isOpen = switchStallButton.getAttribute("aria-expanded") === "true";
    switchStallButton.setAttribute("aria-expanded", String(!isOpen));
    stallDropdown.hidden = isOpen;
  }
  function selectStall(option) {
    if (!selectedStallName || !selectedStallAddress) return;
    selectedStallName.textContent = option.dataset.stallName || "";
    selectedStallAddress.textContent = option.dataset.stallAddress || "";
    stallOptions.forEach((stallOption) => {
      stallOption.classList.remove("active");
    });
    option.classList.add("active");
    localStorage.setItem(
      "selectedVendorStall",
      JSON.stringify({
        id: option.dataset.stallId || "",
        name: option.dataset.stallName || "",
        address: option.dataset.stallAddress || "",
      }),
    );
    closeStallDropdown();
  }
  function restoreSelectedStall() {
    let savedStall = null;
    try {
      savedStall = JSON.parse(
        localStorage.getItem("selectedVendorStall") || "null",
      );
    } catch (error) {
      localStorage.removeItem("selectedVendorStall");
    }
    if (!savedStall) return;
    const matchingOption = Array.from(stallOptions).find((option) => {
      return option.dataset.stallId === savedStall.id;
    });
    if (matchingOption) {
      selectStall(matchingOption);
    }
  }
  /* feedback card helper functions */
  function getAllFeedbackCards() {
    return Array.from(document.querySelectorAll(".feedback-card"));
  }
  function getCardsFromGrid(grid) {
    if (!grid) return [];
    return Array.from(grid.querySelectorAll(".feedback-card"));
  }
  function getMatchingCardsFromGrid(grid) {
    return getCardsFromGrid(grid).filter((card) => {
      return card.dataset.matchesFilters === "true";
    });
  }
  function updateSectionCount(
    countElement,
    totalCount,
    singularLabel,
    pluralLabel,
  ) {
    if (!countElement) return;
    const label = totalCount === 1 ? singularLabel : pluralLabel;
    countElement.textContent = `${totalCount} ${label}`;
  }
  /* feedback sorting */
  function sortCardsInsideGrid(grid) {
    if (!grid) return;
    const selectedSort = sortFilter?.value || "newest";
    const cards = getCardsFromGrid(grid);
    cards.sort((firstCard, secondCard) => {
      const firstDate = new Date(firstCard.dataset.date).getTime();
      const secondDate = new Date(secondCard.dataset.date).getTime();
      const firstPopularity = Number(firstCard.dataset.popularity || 0);
      const secondPopularity = Number(secondCard.dataset.popularity || 0);
      const firstRating = Number(firstCard.dataset.rating || 0);
      const secondRating = Number(secondCard.dataset.rating || 0);
      if (selectedSort === "popular") {
        return secondPopularity - firstPopularity;
      }
      if (selectedSort === "highest") {
        return secondRating - firstRating || secondDate - firstDate;
      }
      if (selectedSort === "lowest") {
        return firstRating - secondRating || secondDate - firstDate;
      }
      return secondDate - firstDate;
    });
    cards.forEach((card) => {
      grid.appendChild(card);
    });
  }
  function sortFeedback() {
    sortCardsInsideGrid(complaintsGrid);
    sortCardsInsideGrid(feedbackGrid);
  }
  /* feedback filtering */
  function filterFeedback() {
    const selectedType = feedbackTypeFilter?.value || "all";
    const selectedRating = ratingFilter?.value || "all";
    getAllFeedbackCards().forEach((card) => {
      const matchesType =
        selectedType === "all" || card.dataset.feedbackType === selectedType;
      const matchesRating =
        selectedRating === "all" || card.dataset.rating === selectedRating;
      card.dataset.matchesFilters = String(matchesType && matchesRating);
    });
    complaintsExpanded = false;
    feedbackExpanded = false;
    sortFeedback();
    updateFeedbackSections();
    applyAllCardLimits();
  }
  /* section card limits */
  function applyCardLimit(grid, isExpanded, seeMoreButton, itemName) {
    if (!grid || !seeMoreButton) return;
    const allCards = getCardsFromGrid(grid);
    const matchingCards = getMatchingCardsFromGrid(grid);
    allCards.forEach((card) => {
      card.hidden = true;
    });
    matchingCards.forEach((card, index) => {
      const shouldShow = isExpanded || index < visibleCardLimit;
      card.hidden = !shouldShow;
    });
    const hasAdditionalCards = matchingCards.length > visibleCardLimit;
    seeMoreButton.hidden = !hasAdditionalCards;
    seeMoreButton.setAttribute("aria-expanded", String(isExpanded));
    const buttonText = seeMoreButton.querySelector(".section-see-more-text");
    if (buttonText) {
      buttonText.textContent = isExpanded
        ? `Show fewer ${itemName}`
        : `See more ${itemName}`;
    }
  }
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
  function toggleComplaintsSection() {
    complaintsExpanded = !complaintsExpanded;
    applyAllCardLimits();
  }
  function toggleFeedbackSection() {
    feedbackExpanded = !feedbackExpanded;
    applyAllCardLimits();
  }
  /* update feedback sections */
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
  /* clear feedback filters */
  function resetFeedbackFilters() {
    if (feedbackTypeFilter) {
      feedbackTypeFilter.value = "all";
    }
    if (ratingFilter) {
      ratingFilter.value = "all";
    }
    if (sortFilter) {
      sortFilter.value = "newest";
    }
    complaintsExpanded = false;
    feedbackExpanded = false;
    filterFeedback();
  }
  /* expand and collapse feedback messages */
  function toggleFeedbackMessage(button) {
    const messageContainer = button.closest(".feedback-message-container");
    const message = messageContainer?.querySelector(".feedback-message");
    if (!message) return;
    const isExpanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isExpanded));
    message.classList.toggle("expanded", !isExpanded);
    button.textContent = isExpanded ? "See more" : "See less";
  }
  /* hide replies on page load */
  function hideAllReplies() {
    getAllFeedbackCards().forEach((card) => {
      const replyContainers = card.querySelectorAll(
        ".existing-replies, .reply-preview-list",
      );
      replyContainers.forEach((container) => {
        container.hidden = true;
      });
      const replyCountButton = card.querySelector(".reply-count-button");
      replyCountButton?.setAttribute("aria-expanded", "false");
      card.classList.remove("replies-expanded");
    });
  }
  /* show and hide replies */
  function toggleCardReplies(card, button) {
    const replyCount = getReplyCount(card);
    if (replyCount === 0) return;
    const replyContainers = card.querySelectorAll(
      ".existing-replies, .reply-preview-list",
    );
    const isExpanded = button.getAttribute("aria-expanded") === "true";
    replyContainers.forEach((container) => {
      const containsReply = container.children.length > 0;
      container.hidden = isExpanded || !containsReply;
    });
    button.setAttribute("aria-expanded", String(!isExpanded));
    button.setAttribute(
      "aria-label",
      isExpanded ? "Show replies" : "Hide replies",
    );
    card.classList.toggle("replies-expanded", !isExpanded);
  }
  function showRepliesAfterPosting(card) {
    const replyContainers = card.querySelectorAll(
      ".existing-replies, .reply-preview-list",
    );
    replyContainers.forEach((container) => {
      container.hidden = container.children.length === 0;
    });
    const replyCountButton = card.querySelector(".reply-count-button");
    replyCountButton?.setAttribute("aria-expanded", "true");
    replyCountButton?.setAttribute("aria-label", "Hide replies");
    card.classList.add("replies-expanded");
  }
  /* open and close reply dialog */
  function openReplyDialog(card) {
    if (
      !replyDialog ||
      !replyDialogCustomerName ||
      !replyDialogMessage ||
      !replyMessageInput
    ) {
      return;
    }
    selectedFeedbackCard = card;
    const customerName =
      card.querySelector(".customer-details strong")?.textContent.trim() ||
      "Customer";
    const customerMessage =
      card.querySelector(".feedback-message")?.textContent.trim() || "";
    replyDialogCustomerName.textContent = `Reply to ${customerName}`;
    replyDialogMessage.textContent = customerMessage;
    replyMessageInput.value = "";
    if (replyCharacterCount) {
      replyCharacterCount.textContent = "0";
    }
    if (replyErrorMessage) {
      replyErrorMessage.hidden = true;
    }
    if (replySubmissionId) {
      replySubmissionId.value = card.dataset.feedbackId || "";
    }
    replyDialog.showModal();
    replyMessageInput.focus();
  }
  function closeReplyDialog() {
    if (!replyDialog) return;
    replyDialog.close();
    selectedFeedbackCard = null;
  }

  /* reply character counter */
  function updateReplyCharacterCount() {
    if (!replyMessageInput || !replyCharacterCount) {
      return;
    }

    replyCharacterCount.textContent = String(replyMessageInput.value.length);
  }

  /* reply count */
  function getReplyCount(card) {
    const countText =
      card.querySelector(".reply-count")?.textContent || "0 replies";
    return Number.parseInt(countText, 10) || 0;
  }
  function setReplyCount(card, count) {
    const replyCountElement = card.querySelector(".reply-count");
    if (!replyCountElement) return;
    replyCountElement.textContent =
      count === 1 ? "1 reply" : `${count} replies`;
  }
  /* add new reply preview */
  function addReplyToCard(card, replyData) {
    const replyPreviewList = card.querySelector(".reply-preview-list");
    if (!replyPreviewList) return;
    const currentDate = new Intl.DateTimeFormat("en-SG", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date());
    const stallName = selectedStallName?.textContent.trim() || "Selected stall";
    const initials = stallName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join("");
    const replyPreview = document.createElement("article");
    replyPreview.className = "reply-preview";
    replyPreview.innerHTML = `
      <div class="reply-avatar"></div>
      <div class="reply-content">
        <div class="reply-heading">
          <strong></strong>
          <time></time>
        </div>
        <p></p>
      </div>
    `;
    const avatarElement = replyPreview.querySelector(".reply-avatar");
    const stallNameElement = replyPreview.querySelector(
      ".reply-heading strong",
    );
    const dateElement = replyPreview.querySelector("time");
    const replyParagraph = replyPreview.querySelector("p");
    if (avatarElement) {
      avatarElement.textContent = initials || "VS";
    }
    if (stallNameElement) {
      stallNameElement.textContent = replyData.senderName || stallName;
    }
    if (dateElement) {
      dateElement.textContent = replyData.createdAt || currentDate;
    }
    if (replyParagraph) {
      replyParagraph.textContent = replyData.message;
    }
    replyPreviewList.appendChild(replyPreview);
    const updatedCount = getReplyCount(card) + 1;
    setReplyCount(card, updatedCount);
    showRepliesAfterPosting(card);
  }
  /* submit reply */
  function submitReply(event) {
    event.preventDefault();
    if (!replySubmissionId || !replyMessageInput) {
      return;
    }

    const submissionId = replySubmissionId.value;
    const selectedFeedbackCard = document.querySelector(
      `[data-feedback-id="${submissionId}"]`,
    );

    if (!selectedFeedbackCard) {
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
    /* TODO
      await fetch(
      `/api/contact-submissions/${submissionId}/replies`,
      {
      method:"POST",
      body:JSON.stringify({
      replyMessage
      })
      }
      );
      */
    addReplyToCard(selectedFeedbackCard, replyMessage);
    closeReplyDialog();
    showSuccessToast();
  }
  /* success toast */
  function showSuccessToast() {
    if (!successToast) return;
    successToast.hidden = false;
    window.clearTimeout(toastTimeout);
    toastTimeout = window.setTimeout(() => {
      successToast.hidden = true;
    }, 3000);
  }
  /* stall selector event listeners */
  switchStallButton?.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleStallDropdown();
  });
  stallOptions.forEach((option) => {
    option.addEventListener("click", () => {
      selectStall(option);
    });
  });
  document.addEventListener("click", (event) => {
    if (!event.target.closest(".stall-switcher")) {
      closeStallDropdown();
    }
  });
  /* filter event listeners */
  feedbackTypeFilter?.addEventListener("change", filterFeedback);
  ratingFilter?.addEventListener("change", filterFeedback);
  sortFilter?.addEventListener("change", filterFeedback);
  clearFeedbackFilters?.addEventListener("click", resetFeedbackFilters);
  /* section see more event listeners */
  complaintsSeeMoreButton?.addEventListener("click", toggleComplaintsSection);
  feedbackSeeMoreButton?.addEventListener("click", toggleFeedbackSection);
  /* feedback card event listeners */
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
    if (replyButton) {
      const card = replyButton.closest(".feedback-card");
      if (card) {
        openReplyDialog(card);
      }
    }
  });
  /* reply dialog event listeners */
  replyMessageInput?.addEventListener("input", () => {
    updateReplyCharacterCount();
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
  /* initialise page */
  restoreSelectedStall();
  hideAllReplies();
  filterFeedback();
});
