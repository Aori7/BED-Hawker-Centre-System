// Created by Ada
// leaflet.js created for leaflet map functionality
// leaflet map initialization
// resource/ref: https://leafletjs.com/examples/quick-start/
var map = L.map('map').setView([1.3521, 103.8198], 12);
//singapore coordinates
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// adding marker objects into the map, to pin point all the hawker centres available in singapore.
// loading the hawker centre json thru firebase api call
//note: i put the geojson sample file in the file js/hawker-centre.json.
fetch("https://hawker-centre-a7461-default-rtdb.asia-southeast1.firebasedatabase.app/.json")
    .then(res => res.json()) // converting the response into json object first for easy process
    // once json ready, process the data
    .then(data => {
        //the data was stored in geojson format and the hawker centres were stored inside an array called "features"
        //for each data inside features array, loop:
        data.features.forEach(feature => {
        //first, get the value of each coordinates thru the index
        const lng = feature.geometry.coordinates[0];
        const lat = feature.geometry.coordinates[1];
        
        //get info on each hawker centre: name, addr, the status and also the url of the image of hawker centre which is included in the json
        const name = feature.properties.NAME;
        const address = feature.properties.ADDRESS_MYENV || "Address not available"; //if image not existing, reuturn string instead
        const status = feature.properties.STATUS;
        const photo = feature.properties.PHOTOURL;
        
        //design the image for the pop up
        const imageHTML = photo
            ? `<img src="${photo}" style="width:100%; border-radius:12px; margin-bottom:8px;" />`
            : `<div style="font-size:14px; color:#777; margin-bottom:8px;">No image available</div>`;
        
        //for every hawkercentre, create a marker using the var created earlier of the coords
        //L.marker is a leaflet.js function that creates marker objects
        L.marker([lat, lng])
            .addTo(map) //put the marker into the map
            .bindPopup(`
            <div style="max-width:220px">
                ${imageHTML}
                <strong>${name}</strong><br>
                ${address}<br>
                <em>Status: ${status}</em>
            </div>
            `);
        });
    })
    .catch(err => console.error(err));
