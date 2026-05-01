// Firebase Configuration - REPLACE WITH YOUR OWN CONFIG
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

// Map State
let map;
let pickupMarker = null;
let dropoffMarker = null;
let routeLine = null;
let pickupLocation = null;
let dropoffLocation = null;
let selectedRideType = 'standard';
let selectedPrice = '12.50';
let selectedPaymentMethod = 'card';

// Initialize Map
function initMap() {
    // Default to San Francisco
    const defaultLocation = [37.7749, -122.4194];
    
    map = L.map('map').setView(defaultLocation, 13);
    
    // Use CartoDB Dark Matter tiles for dark theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);
    
    // Map click handler
    map.on('click', handleMapClick);
}

// Handle Map Clicks
function handleMapClick(e) {
    if (!pickupLocation) {
        // Set pickup location
        pickupLocation = e.latlng;
        pickupMarker = L.marker(pickupLocation, {
            icon: createCustomIcon('#05944f', 'circle')
        }).addTo(map);
        
        document.getElementById('pickup-input').value = 'Pickup Location';
        document.getElementById('map-instruction').textContent = 'Now select your destination';
        
        checkLocationsReady();
    } else if (!dropoffLocation) {
        // Set dropoff location
        dropoffLocation = e.latlng;
        dropoffMarker = L.marker(dropoffLocation, {
            icon: createCustomIcon('#ffffff', 'square')
        }).addTo(map);
        
        document.getElementById('dropoff-input').value = 'Destination';
        document.getElementById('map-instruction').textContent = 'Choose your ride below';
        
        drawRoute();
        checkLocationsReady();
    }
}

// Create Custom Icon
function createCustomIcon(color, shape) {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background-color: ${color};
            width: ${shape === 'circle' ? '16px' : '14px'};
            height: ${shape === 'circle' ? '16px' : '14px'};
            border-radius: ${shape === 'circle' ? '50%' : '3px'};
            border: 3px solid #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        "></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
}

// Draw Route Line
function drawRoute() {
    if (routeLine) {
        map.removeLayer(routeLine);
    }
    
    routeLine = L.polyline([pickupLocation, dropoffLocation], {
        color: '#276ef1',
        weight: 4,
        opacity: 0.8,
        dashArray: '10, 10'
    }).addTo(map);
    
    // Fit bounds to show both markers
    map.fitBounds([pickupLocation, dropoffLocation], { padding: [50, 50] });
}

// Check if both locations are set
function checkLocationsReady() {
    const btn = document.getElementById('find-rides-btn');
    if (pickupLocation && dropoffLocation) {
        btn.disabled = false;
    }
}

// Go back to locations step
function goBackToLocations() {
    document.getElementById('ride-select-step').classList.add('hidden');
    document.getElementById('location-step').classList.remove('hidden');
}

// Initialize Event Listeners
function initEventListeners() {
    // Find Rides Button
    document.getElementById('find-rides-btn').addEventListener('click', () => {
        document.getElementById('location-step').classList.add('hidden');
        document.getElementById('ride-select-step').classList.remove('hidden');
        
        // Select first ride option by default
        const firstOption = document.querySelector('.ride-option');
        if (firstOption) {
            selectRideOption(firstOption);
        }
    });
    
    // Ride Option Selection
    document.querySelectorAll('.ride-option').forEach(option => {
        option.addEventListener('click', () => {
            selectRideOption(option);
        });
    });
    
    // Payment Method Selection
    document.querySelectorAll('.payment-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            selectedPaymentMethod = option.dataset.method;
        });
    });
    
    // Confirm Ride Button
    document.getElementById('confirm-ride-btn').addEventListener('click', submitRideRequest);
    
    // Toggle Active Rides Panel
    document.getElementById('toggle-panel-btn').addEventListener('click', () => {
        document.getElementById('active-rides-panel').classList.toggle('hidden');
    });
    
    document.getElementById('close-rides-btn').addEventListener('click', () => {
        document.getElementById('active-rides-panel').classList.add('hidden');
    });
}

// Select Ride Option
function selectRideOption(option) {
    document.querySelectorAll('.ride-option').forEach(o => o.classList.remove('selected'));
    option.classList.add('selected');
    
    selectedRideType = option.dataset.type;
    selectedPrice = option.dataset.price;
    
    // Update radio icon
    const radioCheck = option.querySelector('.radio-check i');
    radioCheck.className = 'fa-solid fa-circle';
    
    document.querySelectorAll('.ride-option:not(.selected) .radio-check i').forEach(i => {
        i.className = 'fa-regular fa-circle';
    });
}

// Submit Ride Request
function submitRideRequest() {
    // Show loading state
    document.getElementById('ride-select-step').classList.add('hidden');
    document.getElementById('loading-step').classList.remove('hidden');
    
    const rideData = {
        pickup: {
            lat: pickupLocation.lat,
            lng: pickupLocation.lng,
            address: document.getElementById('pickup-input').value
        },
        dropoff: {
            lat: dropoffLocation.lat,
            lng: dropoffLocation.lng,
            address: document.getElementById('dropoff-input').value
        },
        rideType: selectedRideType,
        price: selectedPrice,
        paymentMethod: selectedPaymentMethod,
        status: 'pending',
        timestamp: Date.now(),
        passenger: {
            name: 'Guest User',
            id: 'user_' + Math.random().toString(36).substr(2, 9)
        }
    };
    
    // Save to Firebase
    database.ref('rides').push(rideData)
        .then(() => {
            // Success - reset after delay
            setTimeout(() => {
                alert('Ride requested successfully! Driver will arrive in ~4 mins.');
                resetForm();
            }, 2000);
        })
        .catch((error) => {
            console.error('Error submitting ride:', error);
            alert('Error submitting ride. Please try again.');
            document.getElementById('loading-step').classList.add('hidden');
            document.getElementById('ride-select-step').classList.remove('hidden');
        });
}

// Reset Form
function resetForm() {
    // Clear markers
    if (pickupMarker) map.removeLayer(pickupMarker);
    if (dropoffMarker) map.removeLayer(dropoffMarker);
    if (routeLine) map.removeLayer(routeLine);
    
    pickupLocation = null;
    dropoffLocation = null;
    pickupMarker = null;
    dropoffMarker = null;
    routeLine = null;
    
    // Reset inputs
    document.getElementById('pickup-input').value = '';
    document.getElementById('dropoff-input').value = '';
    document.getElementById('map-instruction').textContent = 'Tap on the map to set pickup and dropoff points';
    document.getElementById('find-rides-btn').disabled = true;
    
    // Reset panels
    document.getElementById('loading-step').classList.add('hidden');
    document.getElementById('location-step').classList.remove('hidden');
    
    // Center map
    map.setView([37.7749, -122.4194], 13);
}

// Load Active Rides
function loadActiveRides() {
    const ridesList = document.getElementById('rides-list');
    
    database.ref('rides').orderByChild('timestamp').limitToLast(10).on('value', (snapshot) => {
        ridesList.innerHTML = '';
        
        const rides = [];
        snapshot.forEach((childSnapshot) => {
            rides.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        
        if (rides.length === 0) {
            ridesList.innerHTML = '<div class="empty-state">No active rides nearby</div>';
            return;
        }
        
        rides.reverse().forEach(ride => {
            const rideItem = document.createElement('div');
            rideItem.className = `ride-item ${ride.rideType}`;
            rideItem.innerHTML = `
                <div class="ride-item-header">
                    <span class="ride-type-badge">${ride.rideType}</span>
                    <span class="ride-status">${ride.status}</span>
                </div>
                <div class="ride-route">
                    <strong>From:</strong> ${ride.pickup.address}<br>
                    <strong>To:</strong> ${ride.dropoff.address}
                </div>
                <div class="ride-payment">
                    <i class="fa-solid fa-${getPaymentIcon(ride.paymentMethod)}"></i>
                    $${ride.price} • ${capitalizeFirst(ride.paymentMethod)}
                </div>
            `;
            ridesList.appendChild(rideItem);
        });
    });
}

// Helper Functions
function getPaymentIcon(method) {
    const icons = {
        card: 'credit-card',
        cash: 'money-bill-wave',
        wallet: 'wallet'
    };
    return icons[method] || 'credit-card';
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initMap();
    initEventListeners();
    loadActiveRides();
});
