// Created by Ada
// leaflet.js created for leaflet map functionality
// leaflet map initialization
// resource/ref: https://leafletjs.com/examples/quick-start/
// Initialise the map and centre it on Singapore
const map = L.map("map").setView(
    [1.3521, 103.8198],
    12
);

// Add the OpenStreetMap layer
L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }
).addTo(map);

// Load hawker centres from Express API
async function loadHawkerCentreMarkers() {
    try {
        const response = await fetch(
            "/hawker-centres"
        );

        if (!response.ok) {
            throw new Error(
                "Failed to retrieve hawker centres"
            );
        }

        const hawkerCentres =
            await response.json();

        hawkerCentres.forEach(
            (hawkerCentre) => {

                const latitude =
                    Number(hawkerCentre.Latitude);

                const longitude =
                    Number(hawkerCentre.Longitude);

                // Skip records with missing or invalid coordinates
                if (
                    !Number.isFinite(latitude) ||
                    !Number.isFinite(longitude)
                ) {
                    return;
                }

                // Only display active hawker centres
                if (!hawkerCentre.IsActive) {
                    return;
                }

                const imageHTML =
                    hawkerCentre.ImageURL
                        ? `
                            <img
                                src="${hawkerCentre.ImageURL}"
                                alt="${hawkerCentre.HCName}"
                                style="
                                    width: 100%;
                                    height: 120px;
                                    object-fit: cover;
                                    border-radius: 8px;
                                    margin-bottom: 10px;
                                "
                                onerror="this.style.display='none'"
                            >
                        `
                        : "";

                const openingHours =
                    hawkerCentre.OpeningHours ||
                    "Opening hours unavailable";

                const marker = L.marker([
                    latitude,
                    longitude
                ]).addTo(map);

                marker.bindPopup(`
                    <div style="
                        width: 230px;
                        font-family: inherit;
                    ">
                        ${imageHTML}

                        <h3 style="
                            margin: 0 0 8px;
                            font-size: 17px;
                        ">
                            ${hawkerCentre.HCName}
                        </h3>

                        <p style="
                            margin: 0 0 8px;
                            line-height: 1.4;
                        ">
                            ${hawkerCentre.HCAddress}
                        </p>

                        <p style="
                            margin: 0 0 12px;
                            color: #666;
                        ">
                            ${openingHours}
                        </p>

                        <a
                            href="/html/order-stall.html?hawkerCentreID=${hawkerCentre.HawkerCentreID}"
                            style="
                                display: block;
                                padding: 9px 12px;
                                border-radius: 18px;
                                background-color: #ff7a00;
                                color: white;
                                font-weight: 700;
                                text-align: center;
                                text-decoration: none;
                            "
                        >
                            View Stalls
                        </a>
                    </div>
                `);
            }
        );
    } catch (error) {
        console.error(
            "Error loading hawker centre markers:",
            error
        );
    }
}

loadHawkerCentreMarkers();