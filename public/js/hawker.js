const hawkerList = document.getElementById("hawker-list");

async function loadHawkerCentres() {
  try {
    const response = await fetch("http://localhost:3000/hawker-centres");

    const hawkerCentres = await response.json();

    hawkerList.innerHTML = "";

    hawkerCentres.forEach(hawker => {

      const card = `
        <div class="card swiper-slide">

          <div class="card-image">
            <img src="${hawker.ImageURL || "../images/picture-icon.jpg"}" alt="${hawker.HCName}">

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
              ${hawker.Description ?? ""}
            </p>

            <div class="card-footer">

              <button class="card-fav material-symbols-rounded">
                favorite
              </button>

              <button class="card-button">
                Order Here
              </button>

            </div>

          </div>

        </div>
      `;

      hawkerList.innerHTML += card;
    });

  } catch (error) {
    console.error(error);
  }
}

loadHawkerCentres();