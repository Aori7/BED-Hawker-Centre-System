const hawkerList = document.getElementById("hawker-list");
const accessToken = sessionStorage.getItem("accessToken");
const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";
const userRole = sessionStorage.getItem("userRole");
let favouriteHawkerIDs = [];

async function loadFavouriteHawkerCentres() {
  if (!isLoggedIn || userRole !== "Customer" || !accessToken) {
    return;
  }

  try {
    const response = await fetch(
      "http://localhost:3000/hawker-centres/favourites",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (response.status === 401 || response.status === 403) {
      sessionStorage.clear();

      alert("Your session has expired. Please log in again.");

      window.location.href = "/html/login.html";
      return;
    }

    const favourites = await response.json();

    if (!response.ok) {
      throw new Error(favourites.error || "Unable to retrieve favourites");
    }

    favouriteHawkerIDs = favourites.map(
      (favourite) => favourite.HawkerCentreID,
    );
  } catch (error) {
    console.error("Load favourites error:", error);
  }
}

async function loadHawkerCentres() {
  try {
    await loadFavouriteHawkerCentres();

    const response = await fetch("http://localhost:3000/hawker-centres");
    const hawkerCentres = await response.json();

    if (!response.ok) {
      throw new Error("Unable to retrieve hawker centres");
    }

    hawkerList.innerHTML = "";

    hawkerCentres.forEach((hawker) => {
      const isFavourite = favouriteHawkerIDs.includes(hawker.HawkerCentreID);

      const card = document.createElement("div");
      card.classList.add("card", "swiper-slide");

      card.innerHTML = `
        <div class="card-image">
          <img
            src="${hawker.ImageURL || "../images/picture-icon.jpg"}"
            alt="${hawker.HCName}"
            onerror="this.src='../images/picture-icon.jpg'"
          >

          <p class="hawker-rating">
            ★★★★☆
          </p>
        </div>

        <div class="card-content">
          <h1 class="hawker-name">
            ${hawker.HCName}
          </h1>

          <p class="hawker-address">
            ${hawker.HCAddress}
          </p>

          <p class="hawker-desc">
            ${hawker.Description || ""}
          </p>

          <div class="card-footer">
            <button
              type="button"
              class="card-fav material-symbols-rounded ${
                isFavourite ? "active" : ""
              }"
              data-hawker-id="${hawker.HawkerCentreID}"
              aria-label="Save ${hawker.HCName} as favourite"
            >
              favorite
            </button>

            <button
              type="button"
              class="card-button order-hawker-btn"
              data-hawker-id="${hawker.HawkerCentreID}"
            >
              Order Here
            </button>
          </div>
        </div>
      `;

      hawkerList.appendChild(card);
    });
  } catch (error) {
    console.error("Load hawker centres error:", error);

    hawkerList.innerHTML = `
      <p>Unable to load hawker centres.</p>
    `;
  }
}

async function toggleFavourite(favouriteButton) {
  if (!isLoggedIn || userRole !== "Customer" || !accessToken) {
    alert("Please log in to save favourite hawker centres.");

    window.location.href = "/html/login.html";
    return;
  }

  const hawkerCentreID = favouriteButton.dataset.hawkerId;
  const isFavourite = favouriteButton.classList.contains("active");

  favouriteButton.disabled = true;

  try {
    const response = await fetch(
      `http://localhost:3000/hawker-centres/${hawkerCentreID}/favourite`,
      {
        method: isFavourite ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const data = await response.json();

    if (response.status === 401 || response.status === 403) {
      sessionStorage.clear();

      alert("Your session has expired. Please log in again.");

      window.location.href = "/html/login.html";
      return;
    }

    if (!response.ok) {
      throw new Error(data.error || "Unable to update favourite");
    }

    favouriteButton.classList.toggle("active");
  } catch (error) {
    console.error("Favourite error:", error);

    alert(error.message);
  } finally {
    favouriteButton.disabled = false;
  }
}

hawkerList.addEventListener("click", (event) => {
  const favouriteButton = event.target.closest(".card-fav");
  const orderButton = event.target.closest(".order-hawker-btn");

  if (favouriteButton) {
    toggleFavourite(favouriteButton);
    return;
  }

  if (orderButton) {
    const hawkerCentreID = orderButton.dataset.hawkerId;

    window.location.href = `order-stall.html?hawkerCentreID=${hawkerCentreID}`;
  }
});

loadHawkerCentres();