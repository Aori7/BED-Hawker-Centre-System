document.addEventListener("DOMContentLoaded", () => {
  const hawkerList = document.getElementById("order-hawker-list");
  const pagination = document.getElementById("hawker-pagination");
  const searchInput = document.getElementById("hawkersearch");
  const searchButton = document.getElementById("searchbtn");
  const accessToken = sessionStorage.getItem("accessToken");

  const isLoggedIn = sessionStorage.getItem("isLoggedIn") === "true";

  const userRole = sessionStorage.getItem("userRole");
  let hawkerCentres = [];
  let filteredHawkerCentres = [];

  let currentPage = 1;
  const recordsPerPage = 15;

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
  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function displayCurrentPage() {
    hawkerList.innerHTML = "";

    const startIndex = (currentPage - 1) * recordsPerPage;

    const endIndex = startIndex + recordsPerPage;

    const currentRecords = filteredHawkerCentres.slice(startIndex, endIndex);

    if (currentRecords.length === 0) {
      hawkerList.innerHTML = `
        <p class="empty-message">
          No hawker centres found.
        </p>
      `;

      pagination.innerHTML = "";
      return;
    }

    currentRecords.forEach((hawker) => {
      const region = getHawkerRegion(hawker);

      const imagePath = hawker.ImageURL || "../images/picture-icon.jpg";

      const description =
        hawker.Description ||
        "Discover stalls and local food available at this hawker centre.";

      const card = document.createElement("article");
      card.classList.add("hawker-card");

      card.innerHTML = `
      <div class="hawker-card-image">
        <img
          src="${escapeHTML(imagePath)}"
          alt="${escapeHTML(hawker.HCName)}"
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
          ${escapeHTML(hawker.HCName)}
        </h2>

        <p class="hawker-card-address">
          ${escapeHTML(hawker.HCAddress)}
        </p>

        <p class="hawker-card-description">
          ${escapeHTML(description)}
        </p>

        <div class="hawker-card-footer">
          <button
          type="button"
          class="hawker-favourite-btn material-symbols-rounded"
          data-hawker-id="${hawker.HawkerCentreID}"
          aria-label="Add ${escapeHTML(hawker.HCName)} to favourites"
        >
          favorite_border
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

      hawkerList.appendChild(card);
    });

    displayPagination();
  }

  function displayPagination() {
    pagination.innerHTML = "";

    const totalPages = Math.ceil(filteredHawkerCentres.length / recordsPerPage);

    if (totalPages <= 1) {
      return;
    }

    const previousButton = document.createElement("button");
    previousButton.textContent = "‹";
    previousButton.classList.add("pagination-btn");

    previousButton.disabled = currentPage === 1;

    previousButton.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--;
        displayCurrentPage();

        window.scrollTo({
          top: document.querySelector(".all-hawker").offsetTop - 80,
          behavior: "smooth",
        });
      }
    });

    pagination.appendChild(previousButton);

    for (let page = 1; page <= totalPages; page++) {
      const pageButton = document.createElement("button");

      pageButton.textContent = page;
      pageButton.classList.add("pagination-btn");

      if (page === currentPage) {
        pageButton.classList.add("active");
      }

      pageButton.addEventListener("click", () => {
        currentPage = page;
        displayCurrentPage();

        window.scrollTo({
          top: document.querySelector(".all-hawker").offsetTop - 80,
          behavior: "smooth",
        });
      });

      pagination.appendChild(pageButton);
    }

    const nextButton = document.createElement("button");
    nextButton.textContent = "›";
    nextButton.classList.add("pagination-btn");

    nextButton.disabled = currentPage === totalPages;

    nextButton.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++;
        displayCurrentPage();

        window.scrollTo({
          top: document.querySelector(".all-hawker").offsetTop - 80,
          behavior: "smooth",
        });
      }
    });

    pagination.appendChild(nextButton);
  }

  async function loadHawkerCentres() {
    try {
      const response = await fetch("/hawker-centres/available");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to retrieve hawker centres");
      }

      hawkerCentres = data;
      filteredHawkerCentres = data;

      currentPage = 1;
      displayCurrentPage();
    } catch (error) {
      console.error("Load hawker centres error:", error);

      hawkerList.innerHTML = `
        <p class="empty-message">
          Unable to load hawker centres.
        </p>
      `;
    }
  }

  function searchHawkerCentres() {
    const searchText = searchInput.value.trim().toLowerCase();

    filteredHawkerCentres = hawkerCentres.filter((hawker) => {
      const name = hawker.HCName?.toLowerCase() || "";

      const address = hawker.HCAddress?.toLowerCase() || "";

      return name.includes(searchText) || address.includes(searchText);
    });

    currentPage = 1;
    displayCurrentPage();
  }

  searchButton.addEventListener("click", searchHawkerCentres);

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      searchHawkerCentres();
    }
  });
  async function toggleFavourite(favouriteButton) {
    if (!isLoggedIn || userRole !== "Customer") {
      alert("Please log in to save favourite hawker centres.");
      window.location.href = "/html/login.html";
      return;
    }

    const hawkerCentreID = favouriteButton.dataset.hawkerId;

    const isFavourite = favouriteButton.classList.contains("active");

    const response = await fetch(
      `/hawker-centres/${hawkerCentreID}/favourite`,
      {
        method: isFavourite ? "DELETE" : "POST",

        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

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
  hawkerList.addEventListener("click", (event) => {
    const favouriteButton = event.target.closest(".hawker-favourite-btn");

    if (favouriteButton) {
      toggleFavourite(favouriteButton);
      return;
    }

    const viewStallsButton = event.target.closest(".view-stalls-btn");

    if (!viewStallsButton) {
      return;
    }

    const hawkerCentreID = viewStallsButton.dataset.hawkerId;

    window.location.href = `/html/order-stall.html?hawkerCentreID=${hawkerCentreID}`;
  });

  loadHawkerCentres();
});
