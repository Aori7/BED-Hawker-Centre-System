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



// Order History Sidebar

const openHistoryBtn = document.getElementById("open-history-btn");
const closeHistoryBtn = document.getElementById("close-history");
const historySidebar = document.getElementById("order-history-sidebar");
const historyOverlay = document.getElementById("history-overlay");

function openHistory() {
    historySidebar.classList.add("active");
    historyOverlay.classList.add("active");
}

function closeHistory() {
    historySidebar.classList.remove("active");
    historyOverlay.classList.remove("active");
}

// Open sidebar
openHistoryBtn.addEventListener("click", openHistory);

// Close sidebar
closeHistoryBtn.addEventListener("click", closeHistory);

// Close when clicking outside
historyOverlay.addEventListener("click", closeHistory);

// Optional: Close with Escape key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeHistory();
    }
});