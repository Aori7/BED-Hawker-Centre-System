document.addEventListener("DOMContentLoaded", () => {
    setupDashboard();
    loadDashboardStatistics();
    loadTodayInspectionCount();
    loadRecentInspections();
    setupInspectionForm();
    setupInspectionHistory();
    setupStallSearch();
    setupHygieneGrades();
    setupStallDetails();
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

async function setupInspectionForm() {
    const form = document.getElementById(
        "inspection-form"
    );

    if (!form) {
        return;
    }

    const hawkerCentreSelect =
        document.getElementById(
            "hawker-centre"
        );

    const foodStallSelect =
        document.getElementById(
            "food-stall"
        );

    const inspectionDate =
        document.getElementById(
            "inspection-date"
        );

    const inspectionScore =
        document.getElementById(
            "inspection-score"
        );

    const remarks =
        document.getElementById(
            "inspection-remarks"
        );

    const remarksCount =
        document.getElementById(
            "remarks-count"
        );

    const cancelButton =
        document.getElementById(
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
        remarks.addEventListener(
            "input",
            () => {
                remarksCount.textContent =
                    `${remarks.value.length} / 1000`;
            }
        );
    }

    if (cancelButton) {
        cancelButton.addEventListener(
            "click",
            () => {
                window.location.href =
                    "nea-inspection-history.html";
            }
        );
    }

    await loadInspectionHawkerCentres(
        hawkerCentreSelect,
        foodStallSelect
    );

    await prefillInspectionStall(
        hawkerCentreSelect,
        foodStallSelect
    );

    hawkerCentreSelect.addEventListener(
        "change",
        async () => {
            const hawkerCentreID =
                hawkerCentreSelect.value;

            foodStallSelect.innerHTML = `
                <option value="">
                    Select a food stall
                </option>
            `;

            foodStallSelect.disabled = true;

            if (!hawkerCentreID) {
                return;
            }

            await loadInspectionFoodStalls(
                hawkerCentreID,
                foodStallSelect
            );
        }
    );

    form.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            clearInspectionErrors();

            if (!validateInspectionForm()) {
                showInspectionMessage(
                    "Please correct the highlighted fields before submitting.",
                    "error"
                );

                return;
            }

            const selectedGrade =
                document.querySelector(
                    'input[name="hygieneGrade"]:checked'
                );

            const inspectionData = {
                officerID: 1,
                stallID: parseInt(
                    foodStallSelect.value
                ),
                inspectionDate:
                    inspectionDate.value,
                inspectionScore:
                    parseInt(
                        inspectionScore.value
                    ),
                hygieneGrade:
                    selectedGrade.value,
                remark:
                    remarks.value.trim()
            };

            try {
                const response = await fetch(
                    "/inspections",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body: JSON.stringify(
                            inspectionData
                        )
                    }
                );

                const result =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        result.error ||
                        "Unable to record inspection"
                    );
                }

                showInspectionMessage(
                    result.message,
                    "success"
                );

                form.reset();

                inspectionDate.value = today;

                remarksCount.textContent =
                    "0 / 1000";

                foodStallSelect.innerHTML = `
                    <option value="">
                        Select a food stall
                    </option>
                `;

                foodStallSelect.disabled = true;

                window.scrollTo({
                    top: 250,
                    behavior: "smooth"
                });

            } catch (error) {
                console.error(
                    "Submit inspection error:",
                    error
                );

                showInspectionMessage(
                    error.message,
                    "error"
                );
            }
        }
    );
}

async function loadInspectionHawkerCentres(
    hawkerCentreSelect,
    foodStallSelect
) {
    if (
        !hawkerCentreSelect ||
        !foodStallSelect
    ) {
        return;
    }

    try {
        const response = await fetch(
            "/hawker-centres"
        );

        const hawkerCentres =
            await response.json();

        if (!response.ok) {
            throw new Error(
                "Unable to load hawker centres"
            );
        }

        hawkerCentreSelect.innerHTML = `
            <option value="">
                Select a hawker centre
            </option>
        `;

        hawkerCentres.forEach(
            (hawkerCentre) => {
                hawkerCentreSelect.innerHTML += `
                    <option
                        value="${hawkerCentre.HawkerCentreID}"
                    >
                        ${hawkerCentre.HCName}
                    </option>
                `;
            }
        );

        foodStallSelect.disabled = true;

    } catch (error) {
        console.error(
            "Load hawker centres error:",
            error
        );

        showInspectionMessage(
            "Unable to load hawker centres.",
            "error"
        );
    }
}

async function loadInspectionFoodStalls(
    hawkerCentreID,
    foodStallSelect
) {
    try {
        const response = await fetch(
            `/food-stalls/hawker-centre/${hawkerCentreID}`
        );

        const foodStalls =
            await response.json();

        if (!response.ok) {
            throw new Error(
                "Unable to load food stalls"
            );
        }

        foodStallSelect.innerHTML = `
            <option value="">
                Select a food stall
            </option>
        `;

        foodStalls.forEach(
            (foodStall) => {
                foodStallSelect.innerHTML += `
                    <option
                        value="${foodStall.StallID}"
                    >
                        ${foodStall.StallName}
                        (${foodStall.StallUnitNo})
                    </option>
                `;
            }
        );

        foodStallSelect.disabled = false;

    } catch (error) {
        console.error(
            "Load food stalls error:",
            error
        );

        foodStallSelect.innerHTML = `
            <option value="">
                Unable to load food stalls
            </option>
        `;

        foodStallSelect.disabled = true;

        showInspectionMessage(
            "Unable to load food stalls.",
            "error"
        );
    }
}

async function prefillInspectionStall(
    hawkerCentreSelect,
    foodStallSelect
) {
    const queryParameters =
        new URLSearchParams(
            window.location.search
        );

    const stallID =
        parseInt(
            queryParameters.get("stallId")
        );

    if (
        isNaN(stallID) ||
        stallID <= 0
    ) {
        return;
    }

    try {
        const response = await fetch(
            `/food-stalls/${stallID}`
        );

        const foodStall =
            await response.json();

        if (!response.ok) {
            throw new Error(
                foodStall.error ||
                "Unable to retrieve food stall"
            );
        }

        hawkerCentreSelect.value =
            String(
                foodStall.HawkerCentreID
            );

        await loadInspectionFoodStalls(
            foodStall.HawkerCentreID,
            foodStallSelect
        );

        foodStallSelect.value =
            String(foodStall.StallID);

    } catch (error) {
        console.error(
            "Prefill inspection stall error:",
            error
        );

        showInspectionMessage(
            "Unable to automatically select the food stall.",
            "error"
        );
    }
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

async function setupInspectionHistory() {
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

    let inspections = [];

    try {
        const response = await fetch(
            "/inspections"
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(
                result.error ||
                "Unable to retrieve inspection history"
            );
        }

        inspections = result;

        renderInspectionHistory(
            inspections,
            tableBody
        );

    } catch (error) {
        console.error(
            "Load inspection history error:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="8">
                    Unable to load inspection history.
                </td>
            </tr>
        `;

        return;
    }

    function updateInspectionHistory() {
        const keyword =
            searchInput.value
                .trim()
                .toLowerCase();

        const selectedGrade =
            gradeFilter.value;

        const selectedStatus =
            statusFilter.value;

        const selectedSort =
            sortFilter.value;

        const matchingInspections =
            inspections.filter(
                (inspection) => {
                    const stallName =
                        inspection.StallName
                            .toLowerCase();

                    const centreName =
                        inspection.HCName
                            .toLowerCase();

                    const matchesSearch =
                        stallName.includes(
                            keyword
                        ) ||
                        centreName.includes(
                            keyword
                        );

                    const matchesGrade =
                        selectedGrade === "all" ||
                        inspection.HygieneGrade ===
                            selectedGrade;

                    const matchesStatus =
                        selectedStatus === "all" ||
                        inspection.InspectionStatus ===
                            selectedStatus;

                    return (
                        matchesSearch &&
                        matchesGrade &&
                        matchesStatus
                    );
                }
            );

        matchingInspections.sort(
            (
                firstInspection,
                secondInspection
            ) => {
                if (
                    selectedSort === "oldest"
                ) {
                    return (
                        new Date(
                            firstInspection
                                .InspectionDate
                        ) -
                        new Date(
                            secondInspection
                                .InspectionDate
                        )
                    );
                }

                if (
                    selectedSort ===
                    "highest-score"
                ) {
                    return (
                        secondInspection
                            .InspectionScore -
                        firstInspection
                            .InspectionScore
                    );
                }

                if (
                    selectedSort ===
                    "lowest-score"
                ) {
                    return (
                        firstInspection
                            .InspectionScore -
                        secondInspection
                            .InspectionScore
                    );
                }

                return (
                    new Date(
                        secondInspection
                            .InspectionDate
                    ) -
                    new Date(
                        firstInspection
                            .InspectionDate
                    )
                );
            }
        );

        renderInspectionHistory(
            matchingInspections,
            tableBody
        );

        if (resultCount) {
            resultCount.textContent =
                matchingInspections.length;
        }

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
            summaryParts.push(
                selectedStatus
            );
        }

        if (filterSummary) {
            filterSummary.textContent =
                summaryParts.length === 0
                    ? "All inspection records"
                    : summaryParts.join(" · ");
        }

        if (
            matchingInspections.length === 0
        ) {
            if (tableWrapper) {
                tableWrapper.style.display =
                    "none";
            }

            if (emptyState) {
                emptyState.classList.add(
                    "show"
                );
            }
        } else {
            if (tableWrapper) {
                tableWrapper.style.display =
                    "";
            }

            if (emptyState) {
                emptyState.classList.remove(
                    "show"
                );
            }
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

    clearButton.addEventListener(
        "click",
        () => {
            searchInput.value = "";
            gradeFilter.value = "all";
            statusFilter.value = "all";
            sortFilter.value = "newest";

            updateInspectionHistory();
        }
    );

    updateInspectionHistory();
}

function renderInspectionHistory(
    inspections,
    tableBody
) {
    tableBody.innerHTML = "";

    inspections.forEach(
        (inspection) => {
            const inspectionDate =
                new Date(
                    inspection.InspectionDate
                ).toLocaleDateString(
                    "en-SG"
                );

            const statusClass =
                inspection.InspectionStatus
                    .toLowerCase()
                    .replaceAll(" ", "-");

            const safeRemark =
                inspection.Remark ||
                "No remarks recorded.";

            const row =
                document.createElement("tr");

            row.dataset.inspectionId =
                inspection.InspectionID;

            row.dataset.date =
                inspection.InspectionDate;

            row.dataset.stall =
                inspection.StallName;

            row.dataset.centre =
                inspection.HCName;

            row.dataset.score =
                inspection.InspectionScore;

            row.dataset.grade =
                inspection.HygieneGrade;

            row.dataset.status =
                inspection.InspectionStatus;

            row.dataset.officer =
                `Officer ${inspection.OfficerID}`;

            row.dataset.remarks =
                safeRemark;

            row.innerHTML = `
                <td>
                    ${inspection.InspectionID}
                </td>

                <td>
                    ${inspectionDate}
                </td>

                <td>
                    <strong>
                        ${inspection.StallName}
                    </strong>

                    <small>
                        Unit ${inspection.StallUnitNo}
                    </small>
                </td>

                <td>
                    ${inspection.HCName}
                </td>

                <td>
                    ${inspection.InspectionScore}
                    / 100
                </td>

                <td>
                    <span
                        class="nea-grade-badge nea-grade-${inspection.HygieneGrade.toLowerCase()}"
                    >
                        ${inspection.HygieneGrade}
                    </span>
                </td>

                <td>
                    <span
                        class="nea-status-badge nea-status-${statusClass}"
                    >
                        ${inspection.InspectionStatus}
                    </span>
                </td>

                <td>
                    <button
                        type="button"
                        class="history-view-btn"
                    >
                        View
                    </button>
                </td>
            `;

            tableBody.appendChild(row);
        }
    );

    setupInspectionDetailsModal(
        Array.from(
            tableBody.querySelectorAll("tr")
        )
    );
}

function setupInspectionDetailsModal(rows) {
    const overlay = document.getElementById(
        "inspection-modal-overlay"
    );

    const modal = document.getElementById(
        "inspection-details-modal"
    );

    const closeTopButton =
        document.getElementById(
            "close-inspection-modal"
        );

    const closeBottomButton =
        document.getElementById(
            "close-inspection-modal-bottom"
        );

    const editButton =
        document.getElementById(
            "edit-inspection-btn"
        );

    if (!overlay || !modal) {
        return;
    }

    let selectedInspectionID = "";

    rows.forEach((row) => {
        const viewButton =
            row.querySelector(
                ".history-view-btn"
            );

        if (!viewButton) {
            return;
        }

        viewButton.addEventListener(
            "click",
            () => {
                selectedInspectionID =
                    row.dataset.inspectionId;

                displayInspectionDetails(
                    row
                );

                overlay.classList.add(
                    "show"
                );

                modal.classList.add(
                    "show"
                );

                document.body.style.overflow =
                    "hidden";
            }
        );
    });

    function closeModal() {
        overlay.classList.remove("show");
        modal.classList.remove("show");

        document.body.style.overflow = "";
    }

    if (closeTopButton) {
        closeTopButton.onclick =
            closeModal;
    }

    if (closeBottomButton) {
        closeBottomButton.onclick =
            closeModal;
    }

    overlay.onclick = closeModal;

    modal.onclick = (event) => {
        event.stopPropagation();
    };

    if (editButton) {
        editButton.onclick = () => {
            window.location.href =
                "nea-record-inspection.html" +
                "?inspectionId=" +
                encodeURIComponent(
                    selectedInspectionID
                );
        };
    }

    document.addEventListener(
        "keydown",
        (event) => {
            if (
                event.key === "Escape" &&
                modal.classList.contains(
                    "show"
                )
            ) {
                closeModal();
            }
        }
    );
}

function displayInspectionDetails(row) {
    setTextContent(
        "modal-inspection-id",
        row.dataset.inspectionId
    );

    setTextContent(
        "modal-inspection-date",
        formatInspectionDate(
            row.dataset.date
        )
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

    const gradeContainer =
        document.getElementById(
            "modal-inspection-grade"
        );

    const statusContainer =
        document.getElementById(
            "modal-inspection-status"
        );

    if (gradeContainer) {
        gradeContainer.innerHTML = `
            <span
                class="nea-grade-badge nea-grade-${row.dataset.grade.toLowerCase()}"
            >
                Grade ${row.dataset.grade}
            </span>
        `;
    }

    if (statusContainer) {
        const statusClass =
            row.dataset.status
                .toLowerCase()
                .replaceAll(" ", "-");

        statusContainer.innerHTML = `
            <span
                class="nea-status-badge nea-status-${statusClass}"
            >
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

    let stallCards = [];

    async function loadFoodStalls() {

        try {

            const response = await fetch(
                "/food-stalls/search/nea"
            );

            if (!response.ok) {
                throw new Error(
                    "Unable to retrieve food stalls."
                );
            }

            const stalls =
                await response.json();

            resultsGrid.innerHTML = "";

            stalls.forEach((stall) => {

                const inspectionDate =
                    stall.InspectionDate
                        ? new Date(
                            stall.InspectionDate
                        ).toLocaleDateString(
                            "en-SG"
                        )
                        : "Not inspected";

                const grade =
                    stall.HygieneGrade ??
                    "-";

                const status =
                    stall.InspectionStatus ??
                    "Not Inspected";
                
                const imageSource =
                    stall.ImageURL?.startsWith("http")
                        ? stall.ImageURL
                        : stall.ImageURL
                            ? `../${stall.ImageURL}`
                            : "../images/picture-icon.jpg";

                const statusClass =
                        status === "Completed"
                            ? "nea-status-compliant"
                        : status === "Cancelled"
                            ? "nea-status-non-compliant"
                            : "nea-status-pending";

                const gradeClass =
                    stall.HygieneGrade
                        ? `nea-grade-${stall.HygieneGrade.toLowerCase()}`
                        : "nea-grade-none";

                resultsGrid.innerHTML += `
                    <article
                        class="stall-result-card"
                        data-stall-id="${stall.StallID}"
                        data-stall="${stall.StallName}"
                        data-centre="${stall.HCName}"
                        data-grade="${grade}"
                        data-status="${status}"
                    >

                        <div class="stall-image-container">

                            <img
                                src="${imageSource}"
                                alt="${stall.StallName}"
                                onerror="this.src='../images/picture-icon.jpg'"
                            >

                            ${
                                stall.HygieneGrade
                                    ? `
                                        <span class="nea-grade-badge ${gradeClass}">
                                            Grade ${stall.HygieneGrade}
                                        </span>
                                    `
                                    : ""
                            }

                        </div>

                        <div class="stall-result-content">

                            <div class="stall-result-title">

                                <div>
                                    <h3>${stall.StallName}</h3>
                                    <p>${stall.HCName}</p>
                                </div>

                                <span class="nea-status-badge ${statusClass}">
                                    ${status}
                                </span>

                            </div>

                            <div class="stall-result-info">

                                <div>
                                    <span class="material-symbols-rounded">
                                        location_on
                                    </span>

                                    <p>Unit ${stall.StallUnitNo}</p>
                                </div>

                                <div>
                                    <span class="material-symbols-rounded">
                                        fact_check
                                    </span>

                                    <p>
                                        Score:
                                        ${
                                            stall.InspectionScore !== null
                                                ? `${stall.InspectionScore} / 100`
                                                : "Not available"
                                        }
                                    </p>
                                </div>

                                <div>
                                    <span class="material-symbols-rounded">
                                        event
                                    </span>

                                    <p>Last inspected: ${inspectionDate}</p>
                                </div>

                            </div>

                            <div class="stall-result-actions">

                                <a href="nea-stall-details.html?stallId=${stall.StallID}">
                                    <button
                                        type="button"
                                        class="stall-view-btn"
                                    >
                                        View Details
                                    </button>
                                </a>

                                <a href="nea-record-inspection.html?stallId=${stall.StallID}">
                                    <button
                                        type="button"
                                        class="stall-inspect-btn"
                                    >
                                        Inspect
                                    </button>
                                </a>

                            </div>

                        </div>

                    </article>
                `;

            });

            stallCards = Array.from(
                resultsGrid.querySelectorAll(
                    ".stall-result-card"
                )
            );

            updateStallResults();

        }
        catch (error) {

            console.error(
                "Unable to load food stalls.",
                error
            );

        }

    }

    function updateStallResults() {
        const keyword =
            searchInput.value.trim().toLowerCase();

        const selectedGrade = gradeFilter.value;
        const selectedStatus = statusFilter.value;

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

                return (
                    matchesSearch &&
                    matchesGrade &&
                    matchesStatus
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

    clearButton.addEventListener("click", () => {
        searchInput.value = "";
        gradeFilter.value = "all";
        statusFilter.value = "all";

        updateStallResults();
    });

    applyStallQueryParameters(
        searchInput,
        statusFilter
    );

    loadFoodStalls();
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

async function setupHygieneGrades() {
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

    const summaryCards =
        document.querySelectorAll(
            ".hygiene-summary-card"
        );

    let hygieneRecords = [];

    async function loadHygieneGrades() {
        try {
            const response = await fetch(
                "/hygiene-grades"
            );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error ||
                    "Unable to retrieve hygiene grades"
                );
            }

            hygieneRecords = result;

            populateHygieneCentreFilter(
                hygieneRecords,
                centreFilter
            );

            updateHygieneResults();

        } catch (error) {
            console.error(
                "Load hygiene grades error:",
                error
            );

            tableBody.innerHTML = `
                <tr>
                    <td colspan="8">
                        Unable to load hygiene grades.
                    </td>
                </tr>
            `;
        }
    }

    function updateHygieneResults() {
        const keyword =
            searchInput.value
                .trim()
                .toLowerCase();

        const selectedCentre =
            centreFilter.value;

        const selectedGrade =
            gradeFilter.value;

        const selectedStatus =
            statusFilter.value;

        const matchingRecords =
            hygieneRecords.filter(
                (record) => {
                    const stallName =
                        record.StallName
                            .toLowerCase();

                    const centreName =
                        record.HCName
                            .toLowerCase();

                    const matchesSearch =
                        stallName.includes(
                            keyword
                        ) ||
                        centreName.includes(
                            keyword
                        );

                    const matchesCentre =
                        selectedCentre === "all" ||
                        String(
                            record.HawkerCentreID
                        ) === selectedCentre;

                    const matchesGrade =
                        selectedGrade === "all" ||
                        record.HygieneGrade ===
                            selectedGrade;

                    const matchesStatus =
                        selectedStatus === "all" ||
                        record.ComplianceStatus ===
                            selectedStatus;

                    return (
                        matchesSearch &&
                        matchesCentre &&
                        matchesGrade &&
                        matchesStatus
                    );
                }
            );

        renderHygieneGrades(
            matchingRecords,
            tableBody,
            loadHygieneGrades
        );

        if (resultCount) {
            resultCount.textContent =
                matchingRecords.length;
        }

        const filters = [];

        if (keyword) {
            filters.push(
                `Search: "${keyword}"`
            );
        }

        if (selectedCentre !== "all") {
            const selectedOption =
                centreFilter.options[
                    centreFilter.selectedIndex
                ];

            filters.push(
                selectedOption.textContent
            );
        }

        if (selectedGrade !== "all") {
            filters.push(
                `Grade ${selectedGrade}`
            );
        }

        if (selectedStatus !== "all") {
            filters.push(
                selectedStatus
            );
        }

        if (filterSummary) {
            filterSummary.textContent =
                filters.length === 0
                    ? "All hygiene grades"
                    : filters.join(" · ");
        }

        summaryCards.forEach((card) => {
            card.classList.toggle(
                "active",
                card.dataset.gradeFilter ===
                    selectedGrade
            );
        });

        if (
            matchingRecords.length === 0
        ) {
            if (tableWrapper) {
                tableWrapper.style.display =
                    "none";
            }

            if (emptyState) {
                emptyState.classList.add(
                    "show"
                );
            }
        } else {
            if (tableWrapper) {
                tableWrapper.style.display =
                    "";
            }

            if (emptyState) {
                emptyState.classList.remove(
                    "show"
                );
            }
        }

        updateHygieneSummaryCounts(
            hygieneRecords
        );
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

    clearButton.addEventListener(
        "click",
        () => {
            searchInput.value = "";
            centreFilter.value = "all";
            gradeFilter.value = "all";
            statusFilter.value = "all";

            updateHygieneResults();
        }
    );

    summaryCards.forEach((card) => {
        card.addEventListener(
            "click",
            () => {
                const selectedGrade =
                    card.dataset.gradeFilter;

                gradeFilter.value =
                    gradeFilter.value ===
                    selectedGrade
                        ? "all"
                        : selectedGrade;

                updateHygieneResults();
            }
        );
    });

    await loadHygieneGrades();
}

function populateHygieneCentreFilter(
    hygieneRecords,
    centreFilter
) {
    if (!centreFilter) {
        return;
    }

    const centres = new Map();

    hygieneRecords.forEach((record) => {
        centres.set(
            String(record.HawkerCentreID),
            record.HCName
        );
    });

    centreFilter.innerHTML = `
        <option value="all">
            All hawker centres
        </option>
    `;

    Array.from(centres.entries())
        .sort(
            (
                firstCentre,
                secondCentre
            ) =>
                firstCentre[1].localeCompare(
                    secondCentre[1]
                )
        )
        .forEach(
            (
                [
                    hawkerCentreID,
                    hawkerCentreName
                ]
            ) => {
                centreFilter.innerHTML += `
                    <option
                        value="${hawkerCentreID}"
                    >
                        ${hawkerCentreName}
                    </option>
                `;
            }
        );
}

function renderHygieneGrades(
    hygieneRecords,
    tableBody,
    reloadHygieneGrades
) {
    tableBody.innerHTML = "";

    hygieneRecords.forEach((record) => {
        const inspectionDate =
            formatHygieneDate(
                record.InspectionDate
            );

        const gradeExpiry =
            record.GradeExpiry
                ? formatHygieneDate(
                    record.GradeExpiry
                )
                : "Not available";

        const statusClass =
            record.ComplianceStatus
                .toLowerCase()
                .replaceAll(" ", "-");

        const row =
            document.createElement("tr");

        row.dataset.inspectionId =
            record.InspectionID;

        row.dataset.stallId =
            record.StallID;

        row.dataset.stall =
            record.StallName;

        row.dataset.centre =
            record.HCName;

        row.dataset.centreId =
            record.HawkerCentreID;

        row.dataset.score =
            record.InspectionScore;

        row.dataset.grade =
            record.HygieneGrade;

        row.dataset.status =
            record.ComplianceStatus;

        row.dataset.remarks =
            record.Remark || "";

        row.innerHTML = `
            <td>
                ${record.StallID}
            </td>

            <td>
                <strong>
                    ${record.StallName}
                </strong>

                <small>
                    Unit ${record.StallUnitNo}
                </small>
            </td>

            <td>
                ${record.HCName}
            </td>

            <td>
                ${inspectionDate}
            </td>

            <td>
                ${record.InspectionScore}
                / 100
            </td>

            <td>
                <span
                    class="nea-grade-badge nea-grade-${record.HygieneGrade.toLowerCase()}"
                >
                    Grade ${record.HygieneGrade}
                </span>
            </td>

            <td>
                <span
                    class="nea-status-badge nea-status-${statusClass}"
                >
                    ${record.ComplianceStatus}
                </span>

                <small>
                    Expires ${gradeExpiry}
                </small>
            </td>

            <td>
                <button
                    type="button"
                    class="hygiene-update-btn"
                >
                    Update
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });

    setupHygieneUpdateModal(
        Array.from(
            tableBody.querySelectorAll("tr")
        ),
        reloadHygieneGrades
    );
}

function setupHygieneUpdateModal(
    rows,
    reloadHygieneGrades
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

    const remarksCount =
        document.getElementById(
            "hygiene-remarks-count"
        );

    if (!overlay || !modal || !form) {
        return;
    }

    let selectedRow = null;

    rows.forEach((row) => {
        const updateButton =
            row.querySelector(
                ".hygiene-update-btn"
            );

        if (!updateButton) {
            return;
        }

        updateButton.addEventListener(
            "click",
            () => {
                selectedRow = row;

                openHygieneUpdateModal(
                    row
                );

                overlay.classList.add(
                    "show"
                );

                modal.classList.add(
                    "show"
                );

                document.body.style.overflow =
                    "hidden";
            }
        );
    });

    if (remarks && remarksCount) {
        remarks.oninput = () => {
            remarksCount.textContent =
                `${remarks.value.length} / 1000`;
        };
    }

    function closeModal() {
        overlay.classList.remove("show");
        modal.classList.remove("show");

        document.body.style.overflow = "";

        form.reset();

        clearHygieneFormErrors();

        if (remarksCount) {
            remarksCount.textContent =
                "0 / 1000";
        }

        selectedRow = null;
    }

    overlay.onclick = closeModal;

    modal.onclick = (event) => {
        event.stopPropagation();
    };

    if (closeButton) {
        closeButton.onclick = closeModal;
    }

    if (cancelButton) {
        cancelButton.onclick = closeModal;
    }

    form.onsubmit = async (event) => {
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

        if (
            updateRemarks.length > 1000
        ) {
            setFieldError(
                "updated-remarks-error",
                "The remarks cannot exceed 1000 characters."
            );

            isValid = false;
        }

        if (!isValid || !selectedRow) {
            return;
        }

        const submitButton =
            form.querySelector(
                'button[type="submit"]'
            );

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent =
                "Updating...";
        }

        try {
            const inspectionID =
                selectedRow.dataset
                    .inspectionId;

            const response = await fetch(
                `/hygiene-grades/${inspectionID}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify({
                        hygieneGrade:
                            selectedGrade.value,
                        remark:
                            updateRemarks
                    })
                }
            );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error ||
                    "Unable to update hygiene grade"
                );
            }

            const stallName =
                selectedRow.dataset.stall;

            closeModal();

            showHygieneMessage(
                `${stallName}'s hygiene grade was updated successfully.`,
                "success"
            );

            await reloadHygieneGrades();

        } catch (error) {
            console.error(
                "Update hygiene grade error:",
                error
            );

            setFieldError(
                "updated-remarks-error",
                error.message
            );

        } finally {
            if (submitButton) {
                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Update Grade";
            }
        }
    };

    document.onkeydown = (event) => {
        if (
            event.key === "Escape" &&
            modal.classList.contains(
                "show"
            )
        ) {
            closeModal();
        }
    };
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
            <span
                class="nea-grade-badge nea-grade-${row.dataset.grade.toLowerCase()}"
            >
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

    const remarksCount =
        document.getElementById(
            "hygiene-remarks-count"
        );

    if (remarks) {
        remarks.value =
            row.dataset.remarks || "";
    }

    if (remarks && remarksCount) {
        remarksCount.textContent =
            `${remarks.value.length} / 1000`;
    }
}

function updateHygieneSummaryCounts(
    hygieneRecords
) {
    const counts = {
        A: 0,
        B: 0,
        C: 0,
        D: 0
    };

    hygieneRecords.forEach((record) => {
        const grade =
            record.HygieneGrade;

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
    const gradeError =
        document.getElementById(
            "updated-grade-error"
        );

    const remarksError =
        document.getElementById(
            "updated-remarks-error"
        );

    if (gradeError) {
        gradeError.textContent = "";
    }

    if (remarksError) {
        remarksError.textContent = "";
    }
}

function showHygieneMessage(
    message,
    type
) {
    const messageElement =
        document.getElementById(
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

function formatHygieneDate(dateValue) {
    if (!dateValue) {
        return "Not available";
    }

    const date = new Date(dateValue);

    return date.toLocaleDateString(
        "en-SG",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}

/* stall details functions */

async function setupStallDetails() {
    const pageContainer =
        document.getElementById(
            "stall-details-page"
        );

    if (!pageContainer) {
        return;
    }

    const queryParameters =
        new URLSearchParams(
            window.location.search
        );

    const stallID =
        Number(
            queryParameters.get("stallId")
        );

    console.log(
        "stall details page loaded:",
        stallID
    );

    if (
        !Number.isInteger(stallID) ||
        stallID <= 0
    ) {
        showStallDetailsError(
            "Invalid food stall selected."
        );

        return;
    }

    const inspectButton =
        document.getElementById(
            "stall-details-inspect-btn"
        );

    const backButton =
        document.getElementById(
            "stall-details-back-btn"
        );

    if (inspectButton) {
        inspectButton.addEventListener(
            "click",
            () => {
                window.location.href =
                    "nea-record-inspection.html" +
                    `?stallId=${stallID}`;
            }
        );
    }

    if (backButton) {
        backButton.addEventListener(
            "click",
            () => {
                window.location.href =
                    "nea-search-stall.html";
            }
        );
    }

    await loadStallDetails(stallID);

    await loadStallDetailsHistory(
        stallID
    );
}

async function loadStallDetails(stallID) {
    try {
        const response = await fetch(
            `/stall-details/${stallID}`
        );

        const stall =
            await response.json();

        console.log(
            "stall details response:",
            stall
        );

        if (!response.ok) {
            throw new Error(
                stall.error ||
                "Unable to retrieve food stall details"
            );
        }

        displayStallDetails(stall);

    } catch (error) {
        console.error(
            "Load stall details error:",
            error
        );

        showStallDetailsError(
            error.message
        );
    }
}

function displayStallDetails(stall) {
    setTextContent(
        "stall-details-name",
        stall.StallName
    );

    setTextContent(
        "stall-details-centre",
        stall.HCName
    );

    setTextContent(
        "stall-details-unit",
        `Unit ${stall.StallUnitNo}`
    );

    setTextContent(
        "stall-details-id",
        stall.StallID
    );

    setTextContent(
        "stall-details-owner-id",
        stall.OwnerID
    );

    setTextContent(
        "stall-details-score",
        stall.InspectionScore !== null &&
        stall.InspectionScore !== undefined
            ? `${stall.InspectionScore} / 100`
            : "Not inspected"
    );

    setTextContent(
        "stall-details-date",
        stall.InspectionDate
            ? formatStallDetailsDate(
                stall.InspectionDate
            )
            : "Not inspected"
    );

    setTextContent(
        "stall-details-expiry",
        stall.GradeExpiry
            ? formatStallDetailsDate(
                stall.GradeExpiry
            )
            : "Not available"
    );

    setTextContent(
        "stall-details-remarks",
        stall.Remark
            ? stall.Remark
            : "No inspection remarks available."
    );

    const stallImage =
        document.getElementById(
            "stall-details-image"
        );

    if (stallImage) {
        stallImage.src =
            stall.ImageURL ||
            "../images/picture-icon.jpg";

        stallImage.alt =
            stall.StallName;

        stallImage.onerror = () => {
            stallImage.src =
                "../images/picture-icon.jpg";
        };
    }

    const gradeContainer =
        document.getElementById(
            "stall-details-grade"
        );

    if (gradeContainer) {
        if (stall.HygieneGrade) {
            gradeContainer.innerHTML = `
                <span
                    class="nea-grade-badge nea-grade-${stall.HygieneGrade.toLowerCase()}"
                >
                    Grade ${stall.HygieneGrade}
                </span>
            `;
        } else {
            gradeContainer.textContent =
                "Not inspected";
        }
    }

    const statusContainer =
        document.getElementById(
            "stall-details-status"
        );

    if (statusContainer) {
        const complianceStatus =
            stall.ComplianceStatus ||
            "Not Inspected";

        const statusClass =
            complianceStatus
                .toLowerCase()
                .replaceAll(" ", "-");

        statusContainer.innerHTML = `
            <span
                class="nea-status-badge nea-status-${statusClass}"
            >
                ${complianceStatus}
            </span>
        `;
    }
}

async function loadStallDetailsHistory(
    stallID
) {
    const tableBody =
        document.getElementById(
            "stall-details-history-body"
        );

    if (!tableBody) {
        return;
    }

    try {
        const response = await fetch(
            `/stall-details/${stallID}/inspections`
        );

        const inspections =
            await response.json();

        if (!response.ok) {
            throw new Error(
                inspections.error ||
                "Unable to retrieve inspection history"
            );
        }

        renderStallDetailsHistory(
            inspections,
            tableBody
        );

    } catch (error) {
        console.error(
            "Load stall inspection history error:",
            error
        );

        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    Unable to load inspection history.
                </td>
            </tr>
        `;
    }
}

function renderStallDetailsHistory(
    inspections,
    tableBody
) {
    tableBody.innerHTML = "";

    if (inspections.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    No inspection records found for this food stall.
                </td>
            </tr>
        `;

        return;
    }

    inspections.forEach(
        (inspection) => {
            const inspectionDate =
                formatStallDetailsDate(
                    inspection.InspectionDate
                );

            const inspectionStatus =
                inspection.InspectionStatus ||
                "Unknown";

            const statusClass =
                inspectionStatus
                    .toLowerCase()
                    .replaceAll(" ", "-");

            tableBody.innerHTML += `
                <tr>

                    <td>
                        ${inspection.InspectionID}
                    </td>

                    <td>
                        ${inspectionDate}
                    </td>

                    <td>
                        ${
                            inspection.InspectionScore !== null &&
                            inspection.InspectionScore !== undefined
                                ? `${inspection.InspectionScore} / 100`
                                : "Not available"
                        }
                    </td>

                    <td>
                        ${
                            inspection.HygieneGrade
                                ? `
                                    <span
                                        class="nea-grade-badge nea-grade-${inspection.HygieneGrade.toLowerCase()}"
                                    >
                                        Grade ${inspection.HygieneGrade}
                                    </span>
                                `
                                : "Not available"
                        }
                    </td>

                    <td>
                        <span
                            class="nea-status-badge nea-status-${statusClass}"
                        >
                            ${inspectionStatus}
                        </span>
                    </td>

                    <td>
                        ${
                            inspection.Remark ||
                            "No remarks recorded"
                        }
                    </td>

                </tr>
            `;
        }
    );
}

function formatStallDetailsDate(
    dateValue
) {
    if (!dateValue) {
        return "Not available";
    }

    const date =
        new Date(dateValue);

    if (isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleDateString(
        "en-SG",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}

function showStallDetailsError(
    message
) {
    const errorContainer =
        document.getElementById(
            "stall-details-error"
        );

    const contentContainer =
        document.getElementById(
            "stall-details-content"
        );

    if (errorContainer) {
        errorContainer.textContent =
            message;

        errorContainer.className =
            "hygiene-message error show";
    }

    if (contentContainer) {
        contentContainer.style.display =
            "none";
    }
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
        const totalInspectionsElement =
            document.getElementById("total-inspections");

        if (!totalInspectionsElement) {
            return;
        }

        const response = await fetch("/dashboard/statistics");

        const statistics = await response.json();

        totalInspectionsElement.textContent =
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
    const todayInspectionElement =
        document.getElementById(
            "today-inspections"
        );

    if (!todayInspectionElement) {
        return;
    }

    try {
        const response = await fetch(
            "/dashboard/today"
        );

        if (!response.ok) {
            throw new Error(
                "Unable to retrieve today's inspections"
            );
        }

        const result = await response.json();

        todayInspectionElement.textContent =
            `${result.todayInspections} Completed`;

    } catch (error) {
        console.error(
            "Unable to load today's inspections.",
            error
        );
    }
}

/* load recent inspections */
async function loadRecentInspections() {

    const tableBody = document.getElementById(
        "recent-inspection-list"
    );

    if (!tableBody) {
        return;
    }

    try {

        const response = await fetch(
            "/dashboard/recent"
        );

        if (!response.ok) {
            throw new Error(
                "Unable to retrieve recent inspections."
            );
        }

        const inspections =
            await response.json();

        tableBody.innerHTML = "";

        if (inspections.length === 0) {

            tableBody.innerHTML = `
                <tr class="nea-empty-state-row">

                    <td colspan="6">

                        <div class="nea-empty-state">

                            <span class="material-symbols-rounded">
                                fact_check
                            </span>

                            <p>
                                No recent inspections found.
                            </p>

                        </div>

                    </td>

                </tr>
            `;

            return;
        }

        inspections.forEach((inspection) => {

            const inspectionDate =
                new Date(
                    inspection.InspectionDate
                ).toLocaleDateString(
                    "en-SG"
                );

            tableBody.innerHTML += `
                <tr>

                    <td>
                        ${inspection.StallName}
                    </td>

                    <td>
                        ${inspection.HCName}
                    </td>

                    <td>
                        ${inspectionDate}
                    </td>

                    <td>
                        ${inspection.InspectionScore}
                    </td>

                    <td>

                        <span
                            class="nea-grade-badge nea-grade-${inspection.HygieneGrade.toLowerCase()}"
                        >
                            ${inspection.HygieneGrade}
                        </span>

                    </td>

                    <td>
                        ${inspection.InspectionStatus}
                    </td>

                </tr>
            `;

        });

    }
    catch (error) {

        console.error(
            "Unable to load recent inspections.",
            error
        );

        tableBody.innerHTML = `
            <tr class="nea-empty-state-row">

                <td colspan="6">

                    <div class="nea-empty-state">

                        <span class="material-symbols-rounded">
                            error
                        </span>

                        <p>
                            Failed to load recent inspections.
                        </p>

                    </div>

                </td>

            </tr>
        `;

    }

}