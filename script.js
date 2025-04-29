let map = L.map('map').setView([20.5937, 78.9629], 5); // Centered on India for example

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

let disasterMarker = null;
let locationMarkers = [];
let locations = [];

function addLocation() {
    const locNameInput = document.getElementById('loc-name');
    const locName = locNameInput.value.trim();

    if (locName === '') {
        alert('Please enter a location name.');
        return;
    }

    // For now, simulate coordinates randomly near the center (you can replace this later with a geocoding API)
    const lat = 20.5 + Math.random(); // Random lat near center
    const lng = 78.5 + Math.random(); // Random lng near center

    const marker = L.marker([lat, lng]).addTo(map)
        .bindPopup(`<b>${locName}</b>`)
        .openPopup();

    locationMarkers.push(marker);
    locations.push({ name: locName, lat, lng });

    locNameInput.value = '';
}

function calculatePath() {
    const disasterNameInput = document.getElementById('disaster-name');
    const disasterName = disasterNameInput.value.trim();

    if (disasterName === '') {
        alert('Please enter the Disaster Area name.');
        return;
    }

    if (locations.length === 0) {
        alert('Please add at least one nearby location.');
        return;
    }

    // If disasterMarker doesn't exist, create one
    if (!disasterMarker) {
        // Simulate disaster location near center
        const lat = 20.5 + Math.random();
        const lng = 78.5 + Math.random();

        disasterMarker = L.marker([lat, lng], { color: 'red' }).addTo(map)
            .bindPopup(`<b>Disaster: ${disasterName}</b>`)
            .openPopup();
        
        disasterMarker.coords = { lat, lng };
    }

    // Find the nearest location using Haversine formula
    let minDistance = Infinity;
    let nearestLoc = null;
    locations.forEach(loc => {
        const dist = haversineDistance(disasterMarker.coords.lat, disasterMarker.coords.lng, loc.lat, loc.lng);
        if (dist < minDistance) {
            minDistance = dist;
            nearestLoc = loc;
        }
    });

    if (nearestLoc) {
        // Draw line between disaster and nearest location
        L.polyline([
            [disasterMarker.coords.lat, disasterMarker.coords.lng],
            [nearestLoc.lat, nearestLoc.lng]
        ], { color: 'red' }).addTo(map);

        // Display distance and nearest location info
        document.getElementById('path-info').innerHTML = `
            Shortest Path to: <b>${nearestLoc.name}</b> <br>
            Distance: <b>${minDistance.toFixed(2)} km</b>
        `;
    }
}

// Haversine formula to calculate great-circle distance
function haversineDistance(lat1, lon1, lat2, lon2) {
    function toRad(x) {
        return x * Math.PI / 180;
    }

    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c; // Distance in km
    return d;
}
