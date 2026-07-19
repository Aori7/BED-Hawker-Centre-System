document.addEventListener("DOMContentLoaded", () => {
    const stallList =
        document.getElementById("stall-list");

    const hawkerNameDisplay =
        document.querySelector(".hawker-selected-name");

    const searchInput =
        document.getElementById("hawkersearch");

    const searchButton =
        document.getElementById("searchbtn");

    const urlParams =
        new URLSearchParams(window.location.search);

    const hawkerCentreID =
        urlParams.get("hawkerCentreID");

    let foodStalls = [];

    function escapeHTML(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function formatTime(timeValue) {
        if (!timeValue) {
            return "Not available";
        }

        // handles normal SQL time text such as 08:00:00
        const timeText = String(timeValue);

        const match =
            timeText.match(/(\d{2}):(\d{2})/);

        if (!match) {
            return timeText;
        }

        let hour = parseInt(match[1]);
        const minute = match[2];

        const period = hour >= 12 ? "PM" : "AM";

        hour = hour % 12 || 12;

        return `${hour}:${minute} ${period}`;
    }

    function displayStalls(stalls) {
        stallList.innerHTML = "";

        if (stalls.length === 0) {
            stallList.innerHTML = `
                <p class="empty-message">
                    No active food stalls were found for this hawker centre.
                </p>
            `;
            return;
        }

        stalls.forEach((stall) => {
            const card =
                document.createElement("div");

            card.classList.add("card");

            const imagePath = stall.ImageURL?.startsWith("http")
                ? stall.ImageURL
                : `/${stall.ImageURL || "images/picture-icon.jpg"}`;

            const stallStatus =
                stall.IsOpen
                    ? "Open"
                    : "Closed";

            card.innerHTML = `
                <div class="card-image">
                    <img
                        src="${escapeHTML(imagePath)}"
                        alt="${escapeHTML(stall.StallName)}"
                        onerror="this.src='/images/picture-icon.jpg'"
                    >
                </div>

                <div class="card-content">
                    <h1 class="stall-name">
                        ${escapeHTML(stall.StallName)}
                    </h1>

                    <p class="stall-address">
                        Stall ${escapeHTML(stall.StallUnitNo)}
                    </p>

                    <p class="stall-desc">
                        ${escapeHTML(
                            stall.StallDescription ||
                            "No description available."
                        )}
                    </p>

                    <p class="stall-opening-hours">
                        <strong>Hours:</strong>
                        ${escapeHTML(
                            formatTime(stall.OpeningTime)
                        )}
                        -
                        ${escapeHTML(
                            formatTime(stall.ClosingTime)
                        )}
                    </p>

                    <p class="stall-status ${
                        stall.IsOpen ? "open" : "closed"
                    }">
                        ${stallStatus}
                    </p>

                    <div class="card-footer">
                        <button
                            type="button"
                            class="card-fav material-symbols-rounded"
                        >
                            favorite
                        </button>

                        <button
                            type="button"
                            class="card-button order-stall-btn"
                            data-stall-id="${stall.StallID}"
                            ${stall.IsOpen ? "" : "disabled"}
                        >
                            ${
                                stall.IsOpen
                                    ? "View Menu"
                                    : "Currently Closed"
                            }
                        </button>
                    </div>
                </div>
            `;

            stallList.appendChild(card);
        });
    }

    async function loadHawkerCentreDetails() {
        try {
            const response =
                await fetch(`/hawker-centres/${hawkerCentreID}`);

            const data =
                await response.json();

            if (!response.ok) {
                hawkerNameDisplay.textContent =
                    "Selected Hawker Centre";

                return;
            }

            hawkerNameDisplay.textContent =
                data.HCName;

        } catch (error) {
            console.error(
                "Load hawker centre details error:",
                error
            );

            hawkerNameDisplay.textContent =
                "Selected Hawker Centre";
        }
    }

    async function loadFoodStalls() {
        if (!hawkerCentreID) {
            stallList.innerHTML = `
                <p class="empty-message">
                    No hawker centre was selected.
                </p>
            `;

            return;
        }

        try {
            const response = await fetch(
                `/food-stalls/hawker-centre/${hawkerCentreID}`
            );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to retrieve food stalls"
                );
            }

            foodStalls = data;
            displayStalls(foodStalls);

        } catch (error) {
            console.error(
                "Load food stalls error:",
                error
            );

            stallList.innerHTML = `
                <p class="empty-message">
                    Unable to load food stalls.
                </p>
            `;
        }
    }

    function searchFoodStalls() {
        const searchText =
            searchInput.value
                .trim()
                .toLowerCase();

        const filteredStalls =
            foodStalls.filter((stall) => {
                const stallName =
                    stall.StallName
                        ?.toLowerCase() || "";

                const description =
                    stall.StallDescription
                        ?.toLowerCase() || "";

                const unitNo =
                    stall.StallUnitNo
                        ?.toLowerCase() || "";

                return (
                    stallName.includes(searchText) ||
                    description.includes(searchText) ||
                    unitNo.includes(searchText)
                );
            });

        displayStalls(filteredStalls);
    }

    searchButton.addEventListener(
        "click",
        searchFoodStalls
    );

    searchInput.addEventListener(
        "keydown",
        (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                searchFoodStalls();
            }
        }
    );

    stallList.addEventListener("click", (event) => {
        const orderButton =
            event.target.closest(".order-stall-btn");

        if (!orderButton || orderButton.disabled) {
            return;
        }

        const stallID =
            orderButton.dataset.stallId;

        window.location.href =
            `/html/order-menuitems.html?stallID=${stallID}`;
    });

    loadHawkerCentreDetails();
    loadFoodStalls();
});