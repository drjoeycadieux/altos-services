// ============================================
// FIREBASE CONFIGURATION
// ============================================
// TODO: Replace with your Firebase project configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// ============================================
// LEAFLET MAP INITIALIZATION
// ============================================
let map;
let pickupMarker = null;
let dropoffMarker = null;
let rideMarkers = [];
let clickCount = 0;

// Initialize the map
function initMap() {
    // Create map centered on a default location (e.g., New York City)
    map = L.map('map').setView([40.7128, -74.0060], 13);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Add click event to map for selecting locations
    map.on('click', function(e) {
        handleMapClick(e.latlng);
    });
}

// Handle map clicks for setting pickup and dropoff locations
function handleMapClick(latlng) {
    clickCount++;

    if (clickCount === 1) {
        // Set pickup location
        if (pickupMarker) {
            map.removeLayer(pickupMarker);
        }
        
        pickupMarker = L.marker(latlng, {
            icon: L.divIcon({
                className: 'custom-marker',
                html: '<div style="background: #28a745; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }).addTo(map);

        pickupMarker.bindPopup('<b>Pickup Location</b>').openPopup();

        document.getElementById('pickupLat').value = latlng.lat;
        document.getElementById('pickupLng').value = latlng.lng;
        document.getElementById('pickupLocation').value = `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;

        showStatus('Pickup location set! Now select dropoff location.', 'info');

    } else if (clickCount === 2) {
        // Set dropoff location
        if (dropoffMarker) {
            map.removeLayer(dropoffMarker);
        }

        dropoffMarker = L.marker(latlng, {
            icon: L.divIcon({
                className: 'custom-marker',
                html: '<div style="background: #dc3545; border: 3px solid white; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }).addTo(map);

        dropoffMarker.bindPopup('<b>Dropoff Location</b>').openPopup();

        document.getElementById('dropoffLat').value = latlng.lat;
        document.getElementById('dropoffLng').value = latlng.lng;
        document.getElementById('dropoffLocation').value = `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}`;

        showStatus('Both locations set! Fill in your details and submit.', 'success');

        // Draw route line between pickup and dropoff
        drawRouteLine();
        
        // Reset click count
        clickCount = 0;
    }
}

// Draw a line between pickup and dropoff
function drawRouteLine() {
    const pickupLat = parseFloat(document.getElementById('pickupLat').value);
    const pickupLng = parseFloat(document.getElementById('pickupLng').value);
    const dropoffLat = parseFloat(document.getElementById('dropoffLat').value);
    const dropoffLng = parseFloat(document.getElementById('dropoffLng').value);

    if (pickupLat && pickupLng && dropoffLat && dropoffLng) {
        const polyline = L.polyline([
            [pickupLat, pickupLng],
            [dropoffLat, dropoffLng]
        ], {
            color: '#667eea',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10'
        }).addTo(map);

        // Fit map to show both markers
        map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
    }
}

// Clear map markers
function clearMarkers() {
    if (pickupMarker) {
        map.removeLayer(pickupMarker);
        pickupMarker = null;
    }
    if (dropoffMarker) {
        map.removeLayer(dropoffMarker);
        dropoffMarker = null;
    }
    clickCount = 0;
}

// ============================================
// FORM HANDLING
// ============================================
const rideForm = document.getElementById('rideForm');

rideForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Get form values
    const pickupLat = document.getElementById('pickupLat').value;
    const pickupLng = document.getElementById('pickupLng').value;
    const dropoffLat = document.getElementById('dropoffLat').value;
    const dropoffLng = document.getElementById('dropoffLng').value;
    const passengerName = document.getElementById('passengerName').value;
    const passengerPhone = document.getElementById('passengerPhone').value;
    const rideType = document.getElementById('rideType').value;

    // Validate locations
    if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
        showStatus('Please select both pickup and dropoff locations on the map.', 'error');
        return;
    }

    // Disable submit button
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
        // Create ride request object
        const rideRequest = {
            pickup: {
                lat: parseFloat(pickupLat),
                lng: parseFloat(pickupLng),
                address: document.getElementById('pickupLocation').value
            },
            dropoff: {
                lat: parseFloat(dropoffLat),
                lng: parseFloat(dropoffLng),
                address: document.getElementById('dropoffLocation').value
            },
            passenger: {
                name: passengerName,
                phone: passengerPhone
            },
            rideType: rideType,
            status: 'pending',
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            createdAt: new Date().toISOString()
        };

        // Push to Firebase
        const newRideRef = database.ref('rides').push();
        await newRideRef.set(rideRequest);

        showStatus('Ride request submitted successfully!', 'success');
        
        // Clear form
        rideForm.reset();
        clearMarkers();

        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request Ride';

    } catch (error) {
        console.error('Error submitting ride:', error);
        showStatus('Failed to submit ride request. Please try again.', 'error');
        
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request Ride';
    }
});

// ============================================
// DISPLAY STATUS MESSAGES
// ============================================
function showStatus(message, type) {
    const statusElement = document.getElementById('statusMessage');
    statusElement.textContent = message;
    statusElement.className = `status-message ${type}`;

    // Auto-hide after 5 seconds
    setTimeout(() => {
        statusElement.className = 'status-message';
    }, 5000);
}

// ============================================
// LISTEN FOR RIDE UPDATES FROM FIREBASE
// ============================================
function listenForRides() {
    const ridesRef = database.ref('rides');
    
    // Listen for new rides and updates
    ridesRef.on('value', function(snapshot) {
        const ridesList = document.getElementById('ridesList');
        ridesList.innerHTML = '';

        const rides = snapshot.val();

        if (!rides) {
            ridesList.innerHTML = '<div class="no-rides">No active ride requests</div>';
            return;
        }

        // Convert to array and sort by timestamp (newest first)
        const ridesArray = Object.entries(rides)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        // Display only recent rides (last 24 hours)
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        const recentRides = ridesArray.filter(ride => (ride.timestamp || 0) > oneDayAgo);

        if (recentRides.length === 0) {
            ridesList.innerHTML = '<div class="no-rides">No recent ride requests</div>';
            return;
        }

        // Create ride cards
        recentRides.forEach(ride => {
            const rideCard = createRideCard(ride);
            ridesList.appendChild(rideCard);
        });

        // Update map markers for rides
        updateRideMarkersOnMap(recentRides);
    });
}

// Create a ride card element
function createRideCard(ride) {
    const card = document.createElement('div');
    card.className = `ride-card ${ride.rideType}`;
    card.dataset.rideId = ride.id;

    const statusClass = ride.status || 'pending';
    const rideTypeLabel = ride.rideType.charAt(0).toUpperCase() + ride.rideType.slice(1);

    card.innerHTML = `
        <div class="ride-header">
            <span class="ride-type-badge ${ride.rideType}">${rideTypeLabel}</span>
            <span class="ride-status ${statusClass}">${statusClass.toUpperCase()}</span>
        </div>
        <div class="ride-info">
            <div class="ride-info-label">📍 Pickup</div>
            <div class="ride-info-value">${ride.pickup.address}</div>
        </div>
        <div class="ride-info">
            <div class="ride-info-label">🏁 Dropoff</div>
            <div class="ride-info-value">${ride.dropoff.address}</div>
        </div>
        <div class="ride-passenger">
            <div class="ride-info-label">👤 Passenger</div>
            <div class="ride-info-value">${ride.passenger.name}</div>
            <div class="ride-info-label">📞 Phone</div>
            <div class="ride-info-value">${ride.passenger.phone}</div>
        </div>
    `;

    return card;
}

// Update ride markers on the map
function updateRideMarkersOnMap(rides) {
    // Remove existing ride markers
    rideMarkers.forEach(marker => map.removeLayer(marker));
    rideMarkers = [];

    // Add markers for each ride
    rides.forEach(ride => {
        if (ride.pickup && ride.pickup.lat && ride.pickup.lng) {
            const marker = L.marker([ride.pickup.lat, ride.pickup.lng], {
                icon: L.divIcon({
                    className: 'ride-marker',
                    html: `<div style="background: ${getRideColor(ride.rideType)}; border: 3px solid white; border-radius: 50%; width: 25px; height: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold; color: white;">${ride.rideType.charAt(0).toUpperCase()}</div>`,
                    iconSize: [25, 25],
                    iconAnchor: [12, 12]
                })
            }).addTo(map);

            marker.bindPopup(`
                <b>${ride.rideType.toUpperCase()} Ride</b><br>
                <b>Status:</b> ${ride.status}<br>
                <b>Passenger:</b> ${ride.passenger.name}<br>
                <b>Pickup:</b> ${ride.pickup.address}<br>
                <b>Dropoff:</b> ${ride.dropoff.address}
            `);

            rideMarkers.push(marker);
        }
    });
}

// Get color based on ride type
function getRideColor(rideType) {
    const colors = {
        standard: '#667eea',
        premium: '#764ba2',
        xl: '#f093fb'
    };
    return colors[rideType] || '#667eea';
}

// ============================================
// INITIALIZE APP
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize map
    initMap();

    // Start listening for ride updates
    listenForRides();

    console.log('Ride Request App initialized!');
    console.log('Note: Make sure to configure your Firebase credentials in app.js');
});
