const homepageHawkerList = document.getElementById("homepage-hawker-list");
const accessToken = sessionStorage.getItem("accessToken");

const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

const userRole = sessionStorage.getItem("userRole");

function getHawkerRegion(hawkerCentre) {
  const latitude = Number(hawkerCentre.Latitude);
  const longitude = Number(hawkerCentre.Longitude);

  if (longitude < 103.79) {
    return "West";
  }

  if (longitude > 103.87) {
    return "East";
  }

  if (latitude >= 1.365) {
    return "North";
  }

  if (latitude <= 1.3) {
    return "South";
  }

  return "Central";
}

function createHomepageHawkerCard(hawker) {
  const card = document.createElement("article");
  card.classList.add("hawker-card");

  const imagePath = hawker.ImageURL || "images/picture-icon.jpg";

  const description =
    hawker.Description ||
    "Discover the stalls and food available at this hawker centre.";

  card.innerHTML = `
        <div class="hawker-card-image">
            <img
                src="${imagePath}"
                alt="${hawker.HCName}"
                onerror="
                    this.onerror = null;
                    this.src = 'images/picture-icon.jpg';
                "
            >

            <span class="hawker-region-label">
                ${getHawkerRegion(hawker)}
            </span>
        </div>

        <div class="hawker-card-content">
            <h2>
                ${hawker.HCName}
            </h2>

            <p class="hawker-card-address">
                ${hawker.HCAddress}
            </p>

            <p class="hawker-card-description">
                ${description}
            </p>

            <div class="hawker-card-footer">
                <button
                    type="button"
                    class="hawker-favourite-btn material-symbols-rounded"
                    data-hawker-id="${hawker.HawkerCentreID}"
                    aria-label="Add ${hawker.HCName} to favourites"
                >
                    favorite
                </button>

                <button
                    type="button"
                    class="view-stalls-btn"
                    data-hawker-id="${hawker.HawkerCentreID}"
                >
                    View Stalls
                </button>
            </div>
        </div>
    `;

  return card;
}

async function loadHomepageHawkers() {
  try {
    const response = await fetch("/hawker-centres/available");

    if (!response.ok) {
      throw new Error("Unable to retrieve hawker centres");
    }

    const hawkerCentres = await response.json();

    homepageHawkerList.innerHTML = "";

    const homepageHawkers = hawkerCentres.slice(0, 6);

    homepageHawkers.forEach((hawker) => {
      const card = createHomepageHawkerCard(hawker);
      homepageHawkerList.appendChild(card);
    });

    if (homepageHawkers.length === 0) {
      homepageHawkerList.innerHTML = `
                <p class="no-hawkers-message">
                    No hawker centres are currently available.
                </p>
            `;
    }
  } catch (error) {
    console.error("Error loading homepage hawkers:", error);

    homepageHawkerList.innerHTML = `
            <p class="no-hawkers-message">
                Unable to load hawker centres.
            </p>
        `;
  }
}

async function toggleFavourite(favouriteButton) {
  if (!isLoggedIn || userRole !== "Customer") {
    alert("Please log in to save favourite hawker centres.");
    window.location.href = "html/login.html";
    return;
  }

  const hawkerCentreID = favouriteButton.dataset.hawkerId;

  const isFavourite = favouriteButton.classList.contains("active");

  const response = await fetch(`/hawker-centres/${hawkerCentreID}/favourite`, {
    method: isFavourite ? "DELETE" : "POST",

    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data.error);
    return;
  }

  favouriteButton.classList.toggle("active");

  favouriteButton.textContent = favouriteButton.classList.contains("active")
    ? "favorite"
    : "favorite_border";
}

homepageHawkerList.addEventListener("click", (event) => {
  const viewStallsButton = event.target.closest(".view-stalls-btn");

  if (viewStallsButton) {
    const hawkerCentreID = viewStallsButton.dataset.hawkerId;

    window.location.href = `html/order-stall.html?hawkerCentreID=${hawkerCentreID}`;
  }

  const favouriteButton = event.target.closest(".hawker-favourite-btn");

  if (favouriteButton) {
    toggleFavourite(favouriteButton);
  }
});

loadHomepageHawkers();
