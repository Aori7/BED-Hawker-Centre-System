document.addEventListener("DOMContentLoaded", () => {
    setupDashboard();
    setupInspectionForm();
    setupHamburgerMenu();
});

/* dashboard setup */
function setupDashboard() {
    const dashboardDate = document.getElementById(
        "current-dashboard-date"
    );

    if (!dashboardDate) {
        return;
    }

    updateDashboardDate();
    animateDashboardStatistics();
    setupQuickStallSearch();
}

/* show the current date and update time */
function updateDashboardDate() {
    const currentDateElement = document.getElementById(
        "current-dashboard-date"
    );

    const lastUpdatedElement = document.getElementById(
        "dashboard-last-updated"
    );

    const now = new Date();

    const dateText = now.toLocaleDateString("en-SG", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    });

    const timeText = now.toLocaleTimeString("en-SG", {
        hour: "2-digit",
        minute: "2-digit"
    });

    currentDateElement.textContent = dateText;
    lastUpdatedElement.textContent = `Today, ${timeText}`;
}

/* animate dashboard statistic values */
function animateDashboardStatistics() {
    const statisticElements = document.querySelectorAll(
        ".nea-stat-card h3[data-target]"
    );

    statisticElements.forEach((element) => {
        const target = Number(element.dataset.target);

        if (!Number.isFinite(target)) {
            return;
        }

        element.classList.add("is-counting");

        const duration = 700;
        const startTime = performance.now();

        function updateCount(currentTime) {
            const progress = Math.min(
                (currentTime - startTime) / duration,
                1
            );

            const value = Math.round(target * progress);

            element.textContent = value;

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            } else {
                element.textContent = target;
                element.classList.remove("is-counting");
            }
        }

        requestAnimationFrame(updateCount);
    });
}

/* redirect the quick search to the stall search page */
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

        const encodedSearch = encodeURIComponent(searchText);

        window.location.href =
            `nea-search-stall.html?search=${encodedSearch}`;
    });
}

/* inspection form setup */
function setupInspectionForm() {
    const form = document.getElementById("inspection-form");

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

    const today = new Date().toISOString().split("T")[0];

    inspectionDate.value = today;
    inspectionDate.max = today;

    remarks.addEventListener("input", () => {
        remarksCount.textContent =
            `${remarks.value.length} / 1000`;
    });

    cancelButton.addEventListener("click", () => {
        window.location.href =
            "nea-inspection-history.html";
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        clearInspectionErrors();

        const isValid = validateInspectionForm();

        if (!isValid) {
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

        inspectionDate.value = today;
        remarksCount.textContent = "0 / 1000";

        window.scrollTo({
            top: 250,
            behavior: "smooth"
        });
    });
}

/* validate the inspection form */
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

    if (!hawkerCentre.value) {
        setFieldError(
            "hawker-centre-error",
            "Please select a hawker centre."
        );

        isValid = false;
    }

    if (!foodStall.value) {
        setFieldError(
            "food-stall-error",
            "Please select a food stall."
        );

        isValid = false;
    }

    if (!inspectionDate.value) {
        setFieldError(
            "inspection-date-error",
            "Please select the inspection date."
        );

        isValid = false;
    }

    const score = Number(inspectionScore.value);

    if (inspectionScore.value === "") {
        setFieldError(
            "inspection-score-error",
            "Please enter the inspection score."
        );

        isValid = false;
    } else if (
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

    if (!selectedGrade) {
        setFieldError(
            "hygiene-grade-error",
            "Please select a hygiene grade."
        );

        isValid = false;
    }

    if (!remarks.value.trim()) {
        setFieldError(
            "inspection-remarks-error",
            "Please enter the inspection remarks."
        );

        isValid = false;
    }

    return isValid;
}

/* display a field error */
function setFieldError(elementId, message) {
    const errorElement = document.getElementById(elementId);

    if (errorElement) {
        errorElement.textContent = message;
    }
}

/* remove inspection errors */
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

/* display the inspection form message */
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