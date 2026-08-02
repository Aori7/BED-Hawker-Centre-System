const accessToken = sessionStorage.getItem("accessToken");

const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

const userRole = sessionStorage.getItem("userRole");

let favouriteHawkerIDs = [];
function getHawkerRegion(hawkerCentre) {
  const latitude = Number(hawkerCentre.Latitude);
  const longitude = Number(hawkerCentre.Longitude);

  // Western Singapore
  if (longitude < 103.79) {
    return "West";
  }

  // Eastern Singapore
  if (longitude > 103.87) {
    return "East";
  }

  // Northern Singapore
  if (latitude >= 1.365) {
    return "North";
  }

  // Southern Singapore
  if (latitude <= 1.3) {
    return "South";
  }

  // Remaining locations are treated as Central
  return "Central";
}

/*
    Prevent API text from being inserted directly
    into the page as unsafe HTML.
*/
function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
async function loadFavouriteHawkerCentres() {
  if (!isLoggedIn || userRole !== "Customer") {
    return;
  }

  try {
    const response = await fetch("/hawker-centres/favourites", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return;
    }

    const favourites = await response.json();

    favouriteHawkerIDs = favourites.map(function (favourite) {
      return favourite.HawkerCentreID;
    });
  } catch (error) {
    console.error(error);
  }
}

/*
    Create one hawker centre card.
*/
function createHawkerCard(hawkerCentre) {
  const region = getHawkerRegion(hawkerCentre);

  const imageURL = hawkerCentre.ImageURL || "../images/picture-icon.jpg";

  const description =
    hawkerCentre.Description ||
    "Discover stalls and local food available at this hawker centre.";

  const stallCount = hawkerCentre.StallCount || 1;

  const stallText =
    Number(stallCount) === 1
      ? "1 stall available"
      : `${stallCount} stalls available`;

  return `
        <article class="hawker-card">
            <div class="hawker-card-image">
                <img
                    src="${escapeHTML(imageURL)}"
                    alt="${escapeHTML(hawkerCentre.HCName)}"
                    onerror="
                        this.onerror = null;
                        this.src = '../images/picture-icon.jpg';
                    "
                >

                <span class="hawker-region-label">
                    ${region}
                </span>
            </div>

            <div class="hawker-card-content">
                <h2>
                    ${escapeHTML(hawkerCentre.HCName)}
                </h2>

                <p class="hawker-card-address">
                    ${escapeHTML(hawkerCentre.HCAddress)}
                </p>

                <p class="hawker-card-description">
                    ${escapeHTML(description)}
                </p>

                <div class="hawker-card-footer">
                <button
                    type="button"
                    class="hawker-favourite-btn material-symbols-rounded ${
                      favouriteHawkerIDs.includes(hawkerCentre.HawkerCentreID)
                        ? "active"
                        : ""
                    }"
                    data-hawker-id="${hawkerCentre.HawkerCentreID}"
                    aria-label="Save ${escapeHTML(hawkerCentre.HCName)} as favourite"
                >
                    ${
                      favouriteHawkerIDs.includes(hawkerCentre.HawkerCentreID)
                        ? "favorite"
                        : "favorite_border"
                    }
                </button>

                <button
                    type="button"
                    class="view-stalls-btn"
                    data-hawker-id="${hawkerCentre.HawkerCentreID}"
                >
                    View Stalls
                </button>
                </div>
            </div>
        </article>
    `;
}

/*
    Display hawker cards inside a selected container.
*/
function renderHawkerCentres(hawkerCentres, containerID) {
  const container = document.getElementById(containerID);

  if (!container) {
    return;
  }

  if (hawkerCentres.length === 0) {
    container.innerHTML = `
            <div class="no-hawkers-message">
                <h2>No hawker centres found</h2>
                <p>
                    There are currently no available hawker centres
                    for this location.
                </p>
            </div>
        `;

    return;
  }

  container.innerHTML = hawkerCentres.map(createHawkerCard).join("");
}
async function toggleFavourite(button) {

    if (!isLoggedIn || userRole !== "Customer") {

        alert(
            "Please log in to save favourite hawker centres."
        );

        window.location.href =
            "/html/login.html";

        return;
    }

    const hawkerCentreID =
        button.dataset.hawkerId;

    const isFavourite =
        button.classList.contains("active");

    const response = await fetch(

        `/hawker-centres/${hawkerCentreID}/favourite`,

        {
            method:
                isFavourite
                    ? "DELETE"
                    : "POST",

            headers: {
                Authorization:
                    `Bearer ${accessToken}`
            }
        }
    );

    if (!response.ok) {
        return;
    }

    button.classList.toggle("active");

    button.textContent =
        button.classList.contains("active")
            ? "favorite"
            : "favorite_border";
}
/*
    Add click events to the View Stalls buttons.
*/
document.addEventListener("click", function (event) {

    const favouriteButton =
        event.target.closest(
            ".hawker-favourite-btn"
        );

    if (favouriteButton) {

        toggleFavourite(favouriteButton);

        return;
    }

    const button =
        event.target.closest(".view-stalls-btn");

    if (!button) {
        return;
    }

    const hawkerCentreID =
        button.dataset.hawkerId;

    window.location.href =
        `order-stall.html?hawkerCentreID=${hawkerCentreID}`;
});

/*
    Load both hawker centres and food stalls.

    Hawker centres without stalls are removed from
    the ordering sections.
*/
async function loadAvailableHawkerCentres() {
  const availableList = document.getElementById("available-hawker-list");
    await loadFavouriteHawkerCentres();
  try {
    const response = await fetch("/hawker-centres/available");

    if (!response.ok) {
      throw new Error("Unable to retrieve hawker centres");
    }

    const data = await response.json();

    const hawkerCentres = Array.isArray(data) ? data : data.data || [];

    availableHawkerCentres = hawkerCentres.map(function (hawkerCentre) {
      return {
        ...hawkerCentre,
        Region: getHawkerRegion(hawkerCentre),
      };
    });

    renderHawkerCentres(availableHawkerCentres, "available-hawker-list");

    renderLocationHawkers("All");
  } catch (error) {
    console.error("Error loading available hawker centres:", error);

    if (availableList) {
      availableList.innerHTML = `
                <div class="no-hawkers-message">
                    <h2>Unable to load hawker centres</h2>
                    <p>
                        ${error.message}
                    </p>
                </div>
            `;
    }
  }
}

/*
    Display hawker centres for the selected region.
*/
function renderLocationHawkers(region) {
  const filteredHawkerCentres =
    region === "All"
      ? availableHawkerCentres
      : availableHawkerCentres.filter(function (hawkerCentre) {
          return hawkerCentre.Region === region;
        });

  renderHawkerCentres(filteredHawkerCentres, "location-hawker-list");

  const resultCount = document.getElementById("location-result-count");

  if (resultCount) {
    resultCount.textContent = `${filteredHawkerCentres.length} hawker centre${
      filteredHawkerCentres.length === 1 ? "" : "s"
    } found`;
  }
}

/*
    Location filter button events.
*/
document.querySelectorAll(".location-filter").forEach(function (button) {
  button.addEventListener("click", function () {
    document
      .querySelectorAll(".location-filter")
      .forEach(function (filterButton) {
        filterButton.classList.remove("active");
      });

    button.classList.add("active");

    renderLocationHawkers(button.dataset.region);
  });
});

loadAvailableHawkerCentres();
