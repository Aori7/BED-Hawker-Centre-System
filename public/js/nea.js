document.addEventListener("DOMContentLoaded", () => {
    setupDashboard();
    loadDashboardStatistics();
    loadTodayInspectionCount();
    setupInspectionForm();
    setupInspectionHistory();
    setupStallSearch();
    setupHygieneGrades();
    setupHamburgerMenu();
});


/* dashboard functions */

function setupDashboard() {
    updateDashboardDate();
    animateDashboardStatistics();
    setupQuickStallSearch();
}

function updateDashboardDate() {
    const currentDateElement = document.getElementById(
        "current-dashboard-date"
    );

    const lastUpdatedElement = document.getElementById(
        "dashboard-last-updated"
    );

    if (!currentDateElement && !lastUpdatedElement) {
        return;
    }

    const currentDate = new Date();

    const dateText = currentDate.toLocaleDateString(
        "en-SG",
        {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

    const timeText = currentDate.toLocaleTimeString(
        "en-SG",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );

    if (currentDateElement) {
        currentDateElement.textContent = dateText;
    }

    if (lastUpdatedElement) {
        lastUpdatedElement.textContent =
            `Today, ${timeText}`;
    }
}

function animateDashboardStatistics() {
    const statisticElements = document.querySelectorAll(
        ".nea-stat-card h3[data-target]"
    );

    statisticElements.forEach((element) => {
        const target = Number(element.dataset.target);

        if (!Number.isFinite(target)) {
            return;
        }

        const duration = 700;
        const startTime = performance.now();

        function updateCount(currentTime) {
            const progress = Math.min(
                (currentTime - startTime) / duration,
                1
            );

            element.textContent = Math.round(
                target * progress
            );

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                element.textContent = target;
            }
        }

        requestAnimationFrame(updateCount);
    });
}

function setupQuickStallSearch() {
    const searchForm = document.getElementById(
        "quick-stall-search"
    );

    const searchInput = document.getElementById(
        "dashboard-stall-search"
    );

    if (!searchForm || !searchInput) {
        return;
    }

    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const searchText = searchInput.value.trim();

        if (!searchText) {
            searchInput.focus();
            return;
        }

        window.location.href =
            "nea-search-stall.html?search=" +
            encodeURIComponent(searchText);
    });
}

/* inspection form functions */

function setupInspectionForm() {
    const form = document.getElementById(
        "inspection-form"
    );

    if (!form) {
        return;
    }

    const inspectionDate = document.getElementById(
        "inspection-date"
    );

    const remarks = document.getElementById(
        "inspection-remarks"
    );

    const remarksCount = document.getElementById(
        "remarks-count"
    );

    const cancelButton = document.getElementById(
        "cancel-inspection-btn"
    );

    const today = new Date()
        .toISOString()
        .split("T")[0];

    if (inspectionDate) {
        inspectionDate.value = today;
        inspectionDate.max = today;
    }

    if (remarks && remarksCount) {
        remarks.addEventListener("input", () => {
            remarksCount.textContent =
                `${remarks.value.length} / 1000`;
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", () => {
            window.location.href =
                "nea-inspection-history.html";
        });
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        clearInspectionErrors();

        if (!validateInspectionForm()) {
            showInspectionMessage(
                "Please correct the highlighted fields before submitting.",
                "error"
            );

            return;
        }

        showInspectionMessage(
            "Inspection results recorded successfully.",
            "success"
        );

        form.reset();

        if (inspectionDate) {
            inspectionDate.value = today;
        }

        if (remarksCount) {
            remarksCount.textContent = "0 / 1000";
        }

        window.scrollTo({
            top: 250,
            behavior: "smooth"
        });
    });
}

function validateInspectionForm() {
    let isValid = true;

    const hawkerCentre = document.getElementById(
        "hawker-centre"
    );

    const foodStall = document.getElementById(
        "food-stall"
    );

    const inspectionDate = document.getElementById(
        "inspection-date"
    );

    const inspectionScore = document.getElementById(
        "inspection-score"
    );

    const remarks = document.getElementById(
        "inspection-remarks"
    );

    const selectedGrade = document.querySelector(
        'input[name="hygieneGrade"]:checked'
    );

    if (!hawkerCentre || !hawkerCentre.value) {
        setFieldError(
            "hawker-centre-error",
            "Please select a hawker centre."
        );

        isValid = false;
    }

    if (!foodStall || !foodStall.value) {
        setFieldError(
            "food-stall-error",
            "Please select a food stall."
        );

        isValid = false;
    }

    if (!inspectionDate || !inspectionDate.value) {
        setFieldError(
            "inspection-date-error",
            "Please select the inspection date."
        );

        isValid = false;
    }

    if (
        !inspectionScore ||
        inspectionScore.value === ""
    ) {
        setFieldError(
            "inspection-score-error",
            "Please enter the inspection score."
        );

        isValid = false;
    } else {
        const score = Number(inspectionScore.value);

        if (
            !Number.isInteger(score) ||
            score < 0 ||
            score > 100
        ) {
            setFieldError(
                "inspection-score-error",
                "The inspection score must be a whole number from 0 to 100."
            );

            isValid = false;
        }
    }

    if (!selectedGrade) {
        setFieldError(
            "hygiene-grade-error",
            "Please select a hygiene grade."
        );

        isValid = false;
    }

    if (!remarks || !remarks.value.trim()) {
        setFieldError(
            "inspection-remarks-error",
            "Please enter the inspection remarks."
        );

        isValid = false;
    }

    return isValid;
}

function setFieldError(elementId, message) {
    const errorElement = document.getElementById(
        elementId
    );

    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearInspectionErrors() {
    document
        .querySelectorAll(".field-error")
        .forEach((element) => {
            element.textContent = "";
        });

    const messageElement = document.getElementById(
        "inspection-message"
    );

    if (messageElement) {
        messageElement.className = "nea-message";
        messageElement.textContent = "";
    }
}

function showInspectionMessage(message, type) {
    const messageElement = document.getElementById(
        "inspection-message"
    );

    if (!messageElement) {
        return;
    }

    messageElement.textContent = message;
    messageElement.className =
        `nea-message ${type} show`;
}

/* inspection history functions */

function setupInspectionHistory() {
    const tableBody = document.getElementById(
        "inspection-history-body"
    );

    if (!tableBody) {
        return;
    }

    const searchInput = document.getElementById(
        "history-search"
    );

    const gradeFilter = document.getElementById(
        "grade-filter"
    );

    const statusFilter = document.getElementById(
        "status-filter"
    );

    const sortFilter = document.getElementById(
        "sort-filter"
    );

    const clearButton = document.getElementById(
        "clear-history-filters"
    );

    const resultCount = document.getElementById(
        "history-result-count"
    );

    const filterSummary = document.getElementById(
        "history-filter-summary"
    );

    const tableWrapper = document.querySelector(
        ".history-table-wrapper"
    );

    const emptyState = document.getElementById(
        "history-empty-state"
    );

    const rows = Array.from(
        tableBody.querySelectorAll("tr")
    );

    function updateInspectionHistory() {
        const keyword =
            searchInput.value.trim().toLowerCase();

        const selectedGrade = gradeFilter.value;
        const selectedStatus = statusFilter.value;
        const selectedSort = sortFilter.value;

        const matchingRows = rows.filter((row) => {
            const stallName =
                row.dataset.stall.toLowerCase();

            const centreName =
                row.dataset.centre.toLowerCase();

            const matchesSearch =
                stallName.includes(keyword) ||
                centreName.includes(keyword);

            const matchesGrade =
                selectedGrade === "all" ||
                row.dataset.grade === selectedGrade;

            const matchesStatus =
                selectedStatus === "all" ||
                row.dataset.status === selectedStatus;

            return (
                matchesSearch &&
                matchesGrade &&
                matchesStatus
            );
        });

        matchingRows.sort((firstRow, secondRow) => {
            if (selectedSort === "oldest") {
                return (
                    new Date(firstRow.dataset.date) -
                    new Date(secondRow.dataset.date)
                );
            }

            if (selectedSort === "highest-score") {
                return (
                    Number(secondRow.dataset.score) -
                    Number(firstRow.dataset.score)
                );
            }

            if (selectedSort === "lowest-score") {
                return (
                    Number(firstRow.dataset.score) -
                    Number(secondRow.dataset.score)
                );
            }

            return (
                new Date(secondRow.dataset.date) -
                new Date(firstRow.dataset.date)
            );
        });

        rows.forEach((row) => {
            row.style.display = "none";
        });

        matchingRows.forEach((row) => {
            tableBody.appendChild(row);
            row.style.display = "";
        });

        resultCount.textContent =
            matchingRows.length;

        const summaryParts = [];

        if (keyword) {
            summaryParts.push(
                `Search: "${keyword}"`
            );
        }

        if (selectedGrade !== "all") {
            summaryParts.push(
                `Grade ${selectedGrade}`
            );
        }

        if (selectedStatus !== "all") {
            summaryParts.push(selectedStatus);
        }

        filterSummary.textContent =
            summaryParts.length === 0
                ? "All inspection records"
                : summaryParts.join(" · ");

        if (matchingRows.length === 0) {
            tableWrapper.style.display = "none";
            emptyState.classList.add("show");
        } else {
            tableWrapper.style.display = "";
            emptyState.classList.remove("show");
        }
    }

    searchInput.addEventListener(
        "input",
        updateInspectionHistory
    );

    gradeFilter.addEventListener(
        "change",
        updateInspectionHistory
    );

    statusFilter.addEventListener(
        "change",
        updateInspectionHistory
    );

    sortFilter.addEventListener(
        "change",
        updateInspectionHistory
    );

    clearButton.addEventListener("click", () => {
        searchInput.value = "";
        gradeFilter.value = "all";
        statusFilter.value = "all";
        sortFilter.value = "newest";

        updateInspectionHistory();
    });

    setupInspectionDetailsModal(rows);
    updateInspectionHistory();
}

function setupInspectionDetailsModal(rows) {
    const overlay = document.getElementById(
        "inspection-modal-overlay"
    );

    const modal = document.getElementById(
        "inspection-details-modal"
    );

    const closeTopButton = document.getElementById(
        "close-inspection-modal"
    );

    const closeBottomButton = document.getElementById(
        "close-inspection-modal-bottom"
    );

    const editButton = document.getElementById(
        "edit-inspection-btn"
    );

    if (!overlay || !modal) {
        return;
    }

    let selectedInspectionId = "";

    rows.forEach((row) => {
        const viewButton = row.querySelector(
            ".history-view-btn"
        );

        if (!viewButton) {
            return;
        }

        viewButton.addEventListener("click", () => {
            selectedInspectionId =
                row.dataset.inspectionId;

            displayInspectionDetails(row);

            overlay.classList.add("show");
            modal.classList.add("show");

            document.body.style.overflow = "hidden";
        });
    });

    function closeModal() {
        overlay.classList.remove("show");
        modal.classList.remove("show");

        document.body.style.overflow = "";
    }

    if (closeTopButton) {
        closeTopButton.addEventListener(
            "click",
            closeModal
        );
    }

    if (closeBottomButton) {
        closeBottomButton.addEventListener(
            "click",
            closeModal
        );
    }

    overlay.addEventListener("click", closeModal);

    if (editButton) {
        editButton.addEventListener("click", () => {
            window.location.href =
                "nea-record-inspection.html?inspectionId=" +
                encodeURIComponent(
                    selectedInspectionId
                );
        });
    }

    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            modal.classList.contains("show")
        ) {
            closeModal();
        }
    });
}

function displayInspectionDetails(row) {
    setTextContent(
        "modal-inspection-id",
        row.dataset.inspectionId
    );

    setTextContent(
        "modal-inspection-date",
        formatInspectionDate(row.dataset.date)
    );

    setTextContent(
        "modal-stall-name",
        row.dataset.stall
    );

    setTextContent(
        "modal-centre-name",
        row.dataset.centre
    );

    setTextContent(
        "modal-inspection-score",
        `${row.dataset.score} / 100`
    );

    setTextContent(
        "modal-officer-name",
        row.dataset.officer
    );

    setTextContent(
        "modal-inspection-remarks",
        row.dataset.remarks
    );

    const gradeContainer = document.getElementById(
        "modal-inspection-grade"
    );

    const statusContainer = document.getElementById(
        "modal-inspection-status"
    );

    if (gradeContainer) {
        gradeContainer.innerHTML = `
            <span class="nea-grade-badge nea-grade-${row.dataset.grade.toLowerCase()}">
                ${row.dataset.grade}
            </span>
        `;
    }

    if (statusContainer) {
        const statusClass =
            row.dataset.status
                .toLowerCase()
                .replaceAll(" ", "-");

        statusContainer.innerHTML = `
            <span class="nea-status-badge nea-status-${statusClass}">
                ${row.dataset.status}
            </span>
        `;
    }
}

function setTextContent(elementId, value) {
    const element = document.getElementById(
        elementId
    );

    if (element) {
        element.textContent = value;
    }
}

function formatInspectionDate(dateValue) {
    const date = new Date(
        `${dateValue}T00:00:00`
    );

    return date.toLocaleDateString(
        "en-SG",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}

/* stall search functions */

function setupStallSearch() {
    const resultsGrid = document.getElementById(
        "stall-results-grid"
    );

    if (!resultsGrid) {
        return;
    }

    const searchInput = document.getElementById(
        "stall-search-input"
    );

    const gradeFilter = document.getElementById(
        "stall-grade-filter"
    );

    const statusFilter = document.getElementById(
        "stall-status-filter"
    );

    const locationFilter = document.getElementById(
        "stall-location-filter"
    );

    const clearButton = document.getElementById(
        "clear-stall-filters"
    );

    const resultCount = document.getElementById(
        "stall-result-count"
    );

    const filterSummary = document.getElementById(
        "stall-filter-summary"
    );

    const emptyState = document.getElementById(
        "stall-empty-state"
    );

    const stallCards = Array.from(
        resultsGrid.querySelectorAll(
            ".stall-result-card"
        )
    );

    function updateStallResults() {
        const keyword =
            searchInput.value.trim().toLowerCase();

        const selectedGrade = gradeFilter.value;
        const selectedStatus = statusFilter.value;
        const selectedLocation =
            locationFilter.value;

        const matchingCards = stallCards.filter(
            (card) => {
                const stallName =
                    card.dataset.stall.toLowerCase();

                const centreName =
                    card.dataset.centre.toLowerCase();

                const matchesSearch =
                    stallName.includes(keyword) ||
                    centreName.includes(keyword);

                const matchesGrade =
                    selectedGrade === "all" ||
                    card.dataset.grade ===
                        selectedGrade;

                const matchesStatus =
                    selectedStatus === "all" ||
                    card.dataset.status ===
                        selectedStatus;

                const matchesLocation =
                    selectedLocation === "all" ||
                    card.dataset.location ===
                        selectedLocation;

                return (
                    matchesSearch &&
                    matchesGrade &&
                    matchesStatus &&
                    matchesLocation
                );
            }
        );

        stallCards.forEach((card) => {
            card.style.display = "none";
        });

        matchingCards.forEach((card) => {
            card.style.display = "";
        });

        resultCount.textContent =
            matchingCards.length;

        const filters = [];

        if (keyword) {
            filters.push(`Search: "${keyword}"`);
        }

        if (selectedGrade !== "all") {
            filters.push(`Grade ${selectedGrade}`);
        }

        if (selectedStatus !== "all") {
            filters.push(selectedStatus);
        }

        if (selectedLocation !== "all") {
            filters.push(selectedLocation);
        }

        filterSummary.textContent =
            filters.length === 0
                ? "All food stalls"
                : filters.join(" · ");

        if (matchingCards.length === 0) {
            resultsGrid.style.display = "none";
            emptyState.classList.add("show");
        } else {
            resultsGrid.style.display = "";
            emptyState.classList.remove("show");
        }
    }

    searchInput.addEventListener(
        "input",
        updateStallResults
    );

    gradeFilter.addEventListener(
        "change",
        updateStallResults
    );

    statusFilter.addEventListener(
        "change",
        updateStallResults
    );

    locationFilter.addEventListener(
        "change",
        updateStallResults
    );

    clearButton.addEventListener("click", () => {
        searchInput.value = "";
        gradeFilter.value = "all";
        statusFilter.value = "all";
        locationFilter.value = "all";

        updateStallResults();
    });

    applyStallQueryParameters(
        searchInput,
        statusFilter
    );

    updateStallResults();
}

function applyStallQueryParameters(
    searchInput,
    statusFilter
) {
    const queryParameters =
        new URLSearchParams(window.location.search);

    const searchValue =
        queryParameters.get("search");

    const statusValue =
        queryParameters.get("status");

    if (searchValue) {
        searchInput.value = searchValue;
    }

    if (statusValue === "non-compliant") {
        statusFilter.value = "Non-Compliant";
    }

    if (statusValue === "compliant") {
        statusFilter.value = "Compliant";
    }
}

/* hygiene grade functions */

function setupHygieneGrades() {
    const tableBody = document.getElementById(
        "hygiene-grade-body"
    );

    if (!tableBody) {
        return;
    }

    const searchInput = document.getElementById(
        "hygiene-search"
    );

    const centreFilter = document.getElementById(
        "hygiene-centre-filter"
    );

    const gradeFilter = document.getElementById(
        "hygiene-grade-filter"
    );

    const statusFilter = document.getElementById(
        "hygiene-status-filter"
    );

    const clearButton = document.getElementById(
        "clear-hygiene-filters"
    );

    const resultCount = document.getElementById(
        "hygiene-result-count"
    );

    const filterSummary = document.getElementById(
        "hygiene-filter-summary"
    );

    const tableWrapper = document.querySelector(
        ".hygiene-table-wrapper"
    );

    const emptyState = document.getElementById(
        "hygiene-empty-state"
    );

    const rows = Array.from(
        tableBody.querySelectorAll("tr")
    );

    const summaryCards = document.querySelectorAll(
        ".hygiene-summary-card"
    );

    function updateHygieneResults() {
        const keyword =
            searchInput.value.trim().toLowerCase();

        const selectedCentre =
            centreFilter.value;

        const selectedGrade =
            gradeFilter.value;

        const selectedStatus =
            statusFilter.value;

        const matchingRows = rows.filter((row) => {
            const stallName =
                row.dataset.stall.toLowerCase();

            const centreName =
                row.dataset.centre.toLowerCase();

            const matchesSearch =
                stallName.includes(keyword) ||
                centreName.includes(keyword);

            const matchesCentre =
                selectedCentre === "all" ||
                row.dataset.centre ===
                    selectedCentre;

            const matchesGrade =
                selectedGrade === "all" ||
                row.dataset.grade ===
                    selectedGrade;

            const matchesStatus =
                selectedStatus === "all" ||
                row.dataset.status ===
                    selectedStatus;

            return (
                matchesSearch &&
                matchesCentre &&
                matchesGrade &&
                matchesStatus
            );
        });

        rows.forEach((row) => {
            row.style.display = "none";
        });

        matchingRows.forEach((row) => {
            row.style.display = "";
        });

        resultCount.textContent =
            matchingRows.length;

        const filters = [];

        if (keyword) {
            filters.push(`Search: "${keyword}"`);
        }

        if (selectedCentre !== "all") {
            filters.push(selectedCentre);
        }

        if (selectedGrade !== "all") {
            filters.push(`Grade ${selectedGrade}`);
        }

        if (selectedStatus !== "all") {
            filters.push(selectedStatus);
        }

        filterSummary.textContent =
            filters.length === 0
                ? "All hygiene grades"
                : filters.join(" · ");

        summaryCards.forEach((card) => {
            card.classList.toggle(
                "active",
                card.dataset.gradeFilter ===
                    selectedGrade
            );
        });

        if (matchingRows.length === 0) {
            tableWrapper.style.display = "none";
            emptyState.classList.add("show");
        } else {
            tableWrapper.style.display = "";
            emptyState.classList.remove("show");
        }
    }

    searchInput.addEventListener(
        "input",
        updateHygieneResults
    );

    centreFilter.addEventListener(
        "change",
        updateHygieneResults
    );

    gradeFilter.addEventListener(
        "change",
        updateHygieneResults
    );

    statusFilter.addEventListener(
        "change",
        updateHygieneResults
    );

    clearButton.addEventListener("click", () => {
        searchInput.value = "";
        centreFilter.value = "all";
        gradeFilter.value = "all";
        statusFilter.value = "all";

        updateHygieneResults();
    });

    summaryCards.forEach((card) => {
        card.addEventListener("click", () => {
            const selectedGrade =
                card.dataset.gradeFilter;

            gradeFilter.value =
                gradeFilter.value === selectedGrade
                    ? "all"
                    : selectedGrade;

            updateHygieneResults();
        });
    });

    setupHygieneUpdateModal(
        rows,
        updateHygieneResults
    );

    updateHygieneResults();
}

function setupHygieneUpdateModal(
    rows,
    updateHygieneResults
) {
    const overlay = document.getElementById(
        "hygiene-modal-overlay"
    );

    const modal = document.getElementById(
        "hygiene-update-modal"
    );

    const form = document.getElementById(
        "hygiene-update-form"
    );

    const closeButton = document.getElementById(
        "close-hygiene-modal"
    );

    const cancelButton = document.getElementById(
        "cancel-hygiene-update"
    );

    const remarks = document.getElementById(
        "hygiene-update-remarks"
    );

    const remarksCount = document.getElementById(
        "hygiene-remarks-count"
    );

    if (!overlay || !modal || !form) {
        return;
    }

    let selectedRow = null;

    rows.forEach((row) => {
        const updateButton = row.querySelector(
            ".hygiene-update-btn"
        );

        if (!updateButton) {
            return;
        }

        updateButton.addEventListener("click", () => {
            selectedRow = row;

            openHygieneUpdateModal(row);

            overlay.classList.add("show");
            modal.classList.add("show");

            document.body.style.overflow = "hidden";
        });
    });

    if (remarks && remarksCount) {
        remarks.addEventListener("input", () => {
            remarksCount.textContent =
                `${remarks.value.length} / 500`;
        });
    }

    function closeModal() {
        overlay.classList.remove("show");
        modal.classList.remove("show");

        document.body.style.overflow = "";

        form.reset();

        clearHygieneFormErrors();

        if (remarksCount) {
            remarksCount.textContent = "0 / 500";
        }

        selectedRow = null;
    }

    overlay.addEventListener("click", closeModal);

    if (closeButton) {
        closeButton.addEventListener(
            "click",
            closeModal
        );
    }

    if (cancelButton) {
        cancelButton.addEventListener(
            "click",
            closeModal
        );
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        clearHygieneFormErrors();

        const selectedGrade =
            document.querySelector(
                'input[name="updatedHygieneGrade"]:checked'
            );

        const updateRemarks =
            remarks.value.trim();

        let isValid = true;

        if (!selectedGrade) {
            setFieldError(
                "updated-grade-error",
                "Please select a hygiene grade."
            );

            isValid = false;
        }

        if (!updateRemarks) {
            setFieldError(
                "updated-remarks-error",
                "Please enter the reason for the grade update."
            );

            isValid = false;
        }

        if (!isValid || !selectedRow) {
            return;
        }

        updateHygieneRow(
            selectedRow,
            selectedGrade.value,
            updateRemarks
        );

        updateHygieneSummaryCounts();

        showHygieneMessage(
            `${selectedRow.dataset.stall}'s hygiene grade was updated successfully.`,
            "success"
        );

        closeModal();
        updateHygieneResults();

        window.scrollTo({
            top: 300,
            behavior: "smooth"
        });
    });

    document.addEventListener("keydown", (event) => {
        if (
            event.key === "Escape" &&
            modal.classList.contains("show")
        ) {
            closeModal();
        }
    });
}

function openHygieneUpdateModal(row) {
    setTextContent(
        "hygiene-stall-id",
        row.dataset.stallId
    );

    setTextContent(
        "hygiene-modal-stall",
        row.dataset.stall
    );

    setTextContent(
        "hygiene-modal-centre",
        row.dataset.centre
    );

    setTextContent(
        "hygiene-modal-score",
        `${row.dataset.score} / 100`
    );

    const currentGradeContainer =
        document.getElementById(
            "hygiene-modal-current-grade"
        );

    if (currentGradeContainer) {
        currentGradeContainer.innerHTML = `
            <span class="nea-grade-badge nea-grade-${row.dataset.grade.toLowerCase()}">
                Grade ${row.dataset.grade}
            </span>
        `;
    }

    const currentGradeRadio =
        document.querySelector(
            `input[name="updatedHygieneGrade"][value="${row.dataset.grade}"]`
        );

    if (currentGradeRadio) {
        currentGradeRadio.checked = true;
    }

    const remarks = document.getElementById(
        "hygiene-update-remarks"
    );

    const remarksCount = document.getElementById(
        "hygiene-remarks-count"
    );

    if (remarks) {
        remarks.value = row.dataset.remarks || "";
    }

    if (remarks && remarksCount) {
        remarksCount.textContent =
            `${remarks.value.length} / 500`;
    }
}

function updateHygieneRow(
    row,
    newGrade,
    updateRemarks
) {
    row.dataset.grade = newGrade;
    row.dataset.remarks = updateRemarks;

    const gradeCell = row.children[4];

    gradeCell.innerHTML = `
        <span class="nea-grade-badge nea-grade-${newGrade.toLowerCase()}">
            Grade ${newGrade}
        </span>
    `;

    const newStatus =
        newGrade === "A" || newGrade === "B"
            ? "Compliant"
            : "Non-Compliant";

    row.dataset.status = newStatus;

    const statusClass =
        newStatus
            .toLowerCase()
            .replaceAll(" ", "-");

    const statusCell = row.children[5];

    statusCell.innerHTML = `
        <span class="nea-status-badge nea-status-${statusClass}">
            ${newStatus}
        </span>
    `;
}

function updateHygieneSummaryCounts() {
    const rows = document.querySelectorAll(
        "#hygiene-grade-body tr"
    );

    const counts = {
        A: 0,
        B: 0,
        C: 0,
        D: 0
    };

    rows.forEach((row) => {
        const grade = row.dataset.grade;

        if (counts[grade] !== undefined) {
            counts[grade]++;
        }
    });

    setTextContent(
        "grade-a-count",
        counts.A
    );

    setTextContent(
        "grade-b-count",
        counts.B
    );

    setTextContent(
        "grade-c-count",
        counts.C
    );

    setTextContent(
        "grade-d-count",
        counts.D
    );
}

function clearHygieneFormErrors() {
    const gradeError = document.getElementById(
        "updated-grade-error"
    );

    const remarksError = document.getElementById(
        "updated-remarks-error"
    );

    if (gradeError) {
        gradeError.textContent = "";
    }

    if (remarksError) {
        remarksError.textContent = "";
    }
}

function showHygieneMessage(message, type) {
    const messageElement = document.getElementById(
        "hygiene-message"
    );

    if (!messageElement) {
        return;
    }

    messageElement.textContent = message;
    messageElement.className =
        `hygiene-message ${type} show`;

    setTimeout(() => {
        messageElement.className =
            "hygiene-message";
    }, 5000);
}

/* mobile navigation menu */

function setupHamburgerMenu() {
    const hamburgerButton = document.getElementById(
        "hamburger-btn"
    );

    const navigationItems = document.querySelector(
        ".navitems"
    );

    if (!hamburgerButton || !navigationItems) {
        return;
    }

    hamburgerButton.addEventListener("click", () => {
        navigationItems.classList.toggle("show");
    });
}

    /* load dashboard statistics */
async function loadDashboardStatistics() {

    try {

        const response = await fetch("/dashboard/statistics");

        const statistics = await response.json();

        document.getElementById("total-inspections").textContent =
            statistics.totalInspections;

        document.getElementById("compliant-stalls").textContent =
            statistics.compliantStalls;

        document.getElementById("non-compliant-stalls").textContent =
            statistics.nonCompliantStalls;

        document.getElementById("grade-a-stalls").textContent =
            statistics.gradeAStalls;

    }
    catch (error) {

        console.error(
            "Unable to load dashboard statistics.",
            error
        );

    }
}

/* load today's inspections */
async function loadTodayInspectionCount() {

    try {

        const response = await fetch(
            "/dashboard/today"
        );

        const result = await response.json();

        document.getElementById(
            "today-inspections"
        ).textContent =
            `${result.todayInspections} Completed`;

    }
    catch (error) {

        console.error(
            "Unable to load today's inspections.",
            error
        );

    }

}
