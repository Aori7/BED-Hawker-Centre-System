// Temporary frontend behaviour for NEA Officer pages.
// Replace static data and session checks with API calls during BED integration.

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("stall-search");
  const stallCards = document.querySelectorAll(".stall-card");

  if (searchInput && stallCards.length > 0) {
    searchInput.addEventListener("input", () => {
      const keyword = searchInput.value.trim().toLowerCase();

      stallCards.forEach((card) => {
        const name = card.dataset.name?.toLowerCase() || "";
        const centre = card.dataset.centre?.toLowerCase() || "";
        card.style.display = name.includes(keyword) || centre.includes(keyword)
          ? "block"
          : "none";
      });
    });
  }

  document.querySelectorAll("[data-view-stall]").forEach((button) => {
    button.addEventListener("click", () => {
      const stallId = button.dataset.viewStall;
      sessionStorage.setItem("selectedStallId", stallId);
      window.location.href = "nea-stall-details.html";
    });
  });

  const inspectionForm = document.getElementById("inspection-form");
  if (inspectionForm) {
    inspectionForm.addEventListener("submit", (event) => {
      event.preventDefault();
      alert("Inspection result saved temporarily. This will later be sent to the BED API.");
      window.location.href = "nea-inspection-history.html";
    });
  }

  const gradeForm = document.getElementById("grade-form");
  if (gradeForm) {
    gradeForm.addEventListener("submit", (event) => {
      event.preventDefault();
      alert("Hygiene grade updated temporarily. This will later be sent to the BED API.");
    });
  }
});
