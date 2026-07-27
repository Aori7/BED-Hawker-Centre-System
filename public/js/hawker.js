const hawkerList = document.getElementById("hawker-list");

async function loadHawkerCentres() {
  try {
    const response = await fetch("http://localhost:3000/hawker-centres");
    const hawkerCentres = await response.json();

    if (!response.ok) {
      throw new Error("Unable to retrieve hawker centres");
    }

    hawkerList.innerHTML = "";

    hawkerCentres.forEach((hawker) => {
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

  } catch (error) {
    console.error("Load hawker centres error:", error);

    hawkerList.innerHTML = `
      <p>Unable to load hawker centres.</p>
    `;
  }
}

hawkerList.addEventListener("click", (event) => {
  const orderButton = event.target.closest(".order-hawker-btn");

  if (!orderButton) {
    return;
  }

  const hawkerCentreID = orderButton.dataset.hawkerId;

  window.location.href =
    `order-stall.html?hawkerCentreID=${hawkerCentreID}`;
});

loadHawkerCentres();