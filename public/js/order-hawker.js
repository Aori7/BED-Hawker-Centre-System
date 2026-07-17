document.addEventListener("DOMContentLoaded", () => {
  const hawkerList = document.getElementById("order-hawker-list");
  const pagination = document.getElementById("hawker-pagination");
  const searchInput = document.getElementById("hawkersearch");
  const searchButton = document.getElementById("searchbtn");

  let hawkerCentres = [];
  let filteredHawkerCentres = [];

  let currentPage = 1;
  const recordsPerPage = 15;

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

    const startIndex =
      (currentPage - 1) * recordsPerPage;

    const endIndex =
      startIndex + recordsPerPage;

    const currentRecords =
      filteredHawkerCentres.slice(startIndex, endIndex);

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
      const card = document.createElement("div");
      card.classList.add("card");

      const imagePath =
        hawker.ImageURL || "../images/picture-icon.jpg";

      card.innerHTML = `
        <div class="card-image">
          <img
            src="${escapeHTML(imagePath)}"
            alt="${escapeHTML(hawker.HCName)}"
            onerror="this.src='../images/picture-icon.jpg'"
          >
        </div>

        <div class="card-content">
          <h1 class="hawker-name">
            ${escapeHTML(hawker.HCName)}
          </h1>

          <p class="hawker-address">
            ${escapeHTML(hawker.HCAddress)}
          </p>

          <p class="hawker-desc">
            ${escapeHTML(
              hawker.Description || "No description available."
            )}
          </p>

          <p class="hawker-hours">
            <strong>Opening hours:</strong>
            ${escapeHTML(
              hawker.OpeningHours || "Not available"
            )}
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

    displayPagination();
  }

  function displayPagination() {
    pagination.innerHTML = "";

    const totalPages = Math.ceil(
      filteredHawkerCentres.length / recordsPerPage
    );

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
          behavior: "smooth"
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
          behavior: "smooth"
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
          behavior: "smooth"
        });
      }
    });

    pagination.appendChild(nextButton);
  }

  async function loadHawkerCentres() {
    try {
      const response = await fetch("/hawker-centres");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to retrieve hawker centres"
        );
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
    const searchText =
      searchInput.value.trim().toLowerCase();

    filteredHawkerCentres = hawkerCentres.filter((hawker) => {
      const name =
        hawker.HCName?.toLowerCase() || "";

      const address =
        hawker.HCAddress?.toLowerCase() || "";

      return (
        name.includes(searchText) ||
        address.includes(searchText)
      );
    });

    currentPage = 1;
    displayCurrentPage();
  }

  searchButton.addEventListener(
    "click",
    searchHawkerCentres
  );

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      searchHawkerCentres();
    }
  });

  hawkerList.addEventListener("click", (event) => {
    const orderButton =
      event.target.closest(".order-hawker-btn");

    if (!orderButton) {
      return;
    }

    const hawkerCentreID =
      orderButton.dataset.hawkerId;

    window.location.href =
      `/html/order-stall.html?hawkerCentreID=${hawkerCentreID}`;
  });

  loadHawkerCentres();
});