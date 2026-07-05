// js for testing purposes
// temporary

//order-stall 
if (window.location.pathname.endsWith("order-hawker.html")) {

    const orderButtons = document.querySelectorAll(".card-button");

    orderButtons.forEach(button => {
        button.addEventListener("click", () => {
            window.location.href = "order-stall.html";
        });
    });

}

if (window.location.pathname.endsWith("order-stall.html")) {

    const orderButtons = document.querySelectorAll(".card-button");

    orderButtons.forEach(button => {
        button.addEventListener("click", () => {
            window.location.href = "order-menuitems.html";
        });
    });

}