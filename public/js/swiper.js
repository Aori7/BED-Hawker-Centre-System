// swiper.js carousel initialisation, runs after DOM fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // check if the swiper library is loaded, if not return warning
  if (typeof Swiper === "undefined") {
    console.warn("Swiper not loaded");
    return;
  }
  // only initilase swiper if the swiper container exists: class swiper
  // swiper initialisation is included with the javascript library, hence, this section was referenced from the swiper js library website.
  if (document.querySelector(".swiper")) {
    new Swiper(".swiper .wrapper", {
      loop: true,
      slidesPerView: 3,
      spaceBetween: 24,

      pagination: {
        el: ".swiper-pagination",
        clickable: true,
        dynamicBullets: true,
      },

      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },

      breakpoints: {
        0: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      },
    });
  }
});