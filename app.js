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
let routeLine = null;
let selectedRideType = 'UberX';
let selectedRidePrice = 15.50;

// Initialize the map
function initMap() {
    // Create map centered on a default location (e.g., New York City)
    map = L.map('map', {
        zoomControl: false,
        attributionControl: false
    }).setView([40.7128, -74.0060], 13);

    // Add OpenStreetMap tiles with dark theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        maxZoom: 19
    }).addTo(map);

    // Add zoom control in bottom left
    L.control.zoom({
        position: 'bottomleft'
    }).addTo(map);

    // Add click event to map for selecting locations
    map.on('click', function(e) {
        handleMapClick(e.latlng);
    });
}

// Handle map clicks for setting pickup and dropoff locations
function handleMapClick(latlng) {
    const pickupInput = document.getElementById('pickupLocation');
    const dropoffInput = document.getElementById('dropoffInput') || document.getElementById('dropoffLocation');
    
    if (!pickupInput.value) {
        // Set pickup location
        if (pickupMarker) {
            map.removeLayer(pickupMarker);
        }
        
        pickupMarker = L.marker(latlng, {
            icon: createCustomMarker('#10b981')
        }).addTo(map);

        pickupMarker.bindPopup('<b style="color: #f1f5f9;">Pickup Location</b>').openPopup();

        pickupInput.value = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
        pickupInput.dataset.lat = latlng.lat;
        pickupInput.dataset.lng = latlng.lng;

        // Highlight the input
        pickupInput.parentElement.classList.add('focused');
        
        // Focus on dropoff input
        setTimeout(() => {
            dropoffInput.focus();
        }, 300);

    } else if (!dropoffInput.value) {
        // Set dropoff location
        if (dropoffMarker) {
            map.removeLayer(dropoffMarker);
        }

        dropoffMarker = L.marker(latlng, {
            icon: createCustomMarker('#ef4444')
        }).addTo(map);

        dropoffMarker.bindPopup('<b style="color: #f1f5f9;">Dropoff Location</b>').openPopup();

        dropoffInput.value = `${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}`;
        dropoffInput.dataset.lat = latlng.lat;
        dropoffInput.dataset.lng = latlng.lng;

        dropoffInput.parentElement.classList.add('focused');

        // Draw route line
        drawRouteLine();
        
        // Show ride selection
        showRideSelection();
        
        // Fit map to show both markers
        fitMapToMarkers();
    }
}

// Create custom marker icon
function createCustomMarker(color) {
    return L.divIcon({
        className: 'custom-marker',
        html: `<div style="background: ${color}; border: 3px solid white; border-radius: 50%; width: 16px; height: 16px; box-shadow: 0 0 20px ${color};"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
}

// Draw route line between pickup and dropoff
function drawRouteLine() {
    if (routeLine) {
        map.removeLayer(routeLine);
    }

    const pickupLat = parseFloat(document.getElementById('pickupLocation').dataset.lat);
    const pickupLng = parseFloat(document.getElementById('pickupLocation').dataset.lng);
    const dropoffLat = parseFloat(document.getElementById('dropoffLocation').dataset.lat);
    const dropoffLng = parseFloat(document.getElementById('dropoffLocation').dataset.lng);

    if (pickupLat && pickupLng && dropoffLat && dropoffLng) {
        routeLine = L.polyline([
            [pickupLat, pickupLng],
            [dropoffLat, dropoffLng]
        ], {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.8,
            dashArray: '10, 10'
        }).addTo(map);
    }
}

// Fit map to show both markers
function fitMapToMarkers() {
    const pickupLat = parseFloat(document.getElementById('pickupLocation').dataset.lat);
    const pickupLng = parseFloat(document.getElementById('pickupLocation').dataset.lng);
    const dropoffLat = parseFloat(document.getElementById('dropoffLocation').dataset.lat);
    const dropoffLng = parseFloat(document.getElementById('dropoffLocation').dataset.lng);

    if (pickupLat && pickupLng && dropoffLat && dropoffLng) {
        const bounds = [[pickupLat, pickupLng], [dropoffLat, dropoffLng]];
        map.fitBounds(bounds, { padding: [80, 80] });
    }
}

// Clear location
function clearLocation(type) {
    if (type === 'pickup') {
        if (pickupMarker) {
            map.removeLayer(pickupMarker);
            pickupMarker = null;
        }
        const pickupInput = document.getElementById('pickupLocation');
        pickupInput.value = '';
        delete pickupInput.dataset.lat;
        delete pickupInput.dataset.lng;
        
        // Reset click flow
        if (dropoffMarker) {
            map.removeLayer(dropoffMarker);
            dropoffMarker = null;
        }
        const dropoffInput = document.getElementById('dropoffLocation');
        dropoffInput.value = '';
        delete dropoffInput.dataset.lat;
        delete dropoffInput.dataset.lng;
        
        if (routeLine) {
            map.removeLayer(routeLine);
            routeLine = null;
        }
        
        hideRideSelection();
    } else if (type === 'dropoff') {
        if (dropoffMarker) {
            map.removeLayer(dropoffMarker);
            dropoffMarker = null;
        }
        const dropoffInput = document.getElementById('dropoffLocation');
        dropoffInput.value = '';
        delete dropoffInput.dataset.lat;
        delete dropoffInput.dataset.lng;
        
        if (routeLine) {
            map.removeLayer(routeLine);
            routeLine = null;
        }
        
        hideRideSelection();
    }
}

// Show ride selection panel
function showRideSelection() {
    const rideSelection = document.getElementById('ride-selection');
    rideSelection.classList.remove('hidden');
    
    // Update confirm button with selected ride
    updateConfirmButton();
}

// Hide ride selection panel
function hideRideSelection() {
    const rideSelection = document.getElementById('ride-selection');
    rideSelection.classList.add('hidden');
}

// ============================================
// RIDE SELECTION
// ============================================
// Add click handlers to ride options
document.querySelectorAll('.ride-option').forEach(option => {
    option.addEventListener('click', function() {
        // Remove selected class from all options
        document.querySelectorAll('.ride-option').forEach(opt => opt.classList.remove('selected'));
        
        // Add selected class to clicked option
        this.classList.add('selected');
        
        // Update selected ride type and price
        selectedRideType = this.dataset.type;
        selectedRidePrice = parseFloat(this.dataset.price);
        
        // Update confirm button
        updateConfirmButton();
    });
});

// Update confirm button text
function updateConfirmButton() {
    const confirmBtn = document.getElementById('confirm-ride');
    confirmBtn.textContent = `Confirm ${selectedRideType}`;
}

// ============================================
// FORM SUBMISSION
// ============================================
document.getElementById('confirm-ride').addEventListener('click', async function() {
    const pickupInput = document.getElementById('pickupLocation');
    const dropoffInput = document.getElementById('dropoffLocation');
    const paymentMethod = document.getElementById('payment-method').value;
    
    // Validate locations
    if (!pickupInput.value || !dropoffInput.value) {
        alert('Please select both pickup and dropoff locations');
        return;
    }
    
    // Show loading state
    const loadingState = document.getElementById('loading-state');
    const rideSelection = document.getElementById('ride-selection');
    
    rideSelection.classList.add('hidden');
    loadingState.classList.remove('hidden');
    
    try {
        // Create ride request object
        const rideRequest = {
            pickup: {
                lat: parseFloat(pickupInput.dataset.lat),
                lng: parseFloat(pickupInput.dataset.lng),
                address: pickupInput.value
            },
            dropoff: {
                lat: parseFloat(dropoffInput.dataset.lat),
                lng: parseFloat(dropoffInput.dataset.lng),
                address: dropoffInput.value
            },
            rideType: selectedRideType,
            payment: {
                method: paymentMethod,
                totalFare: selectedRidePrice,
                status: paymentMethod === 'cash' ? 'pending' : 'authorized'
            },
            status: 'pending',
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            createdAt: new Date().toISOString()
        };
        
        // Push to Firebase
        const newRideRef = database.ref('rides').push();
        await newRideRef.set(rideRequest);
        
        // Success - reset UI
        loadingState.classList.add('hidden');
        alert(`Ride requested successfully! Your ${selectedRideType} will arrive soon.`);
        
        // Clear locations
        clearLocation('pickup');
        
        // Reset map view
        map.setView([40.7128, -74.0060], 13);
        
    } catch (error) {
        console.error('Error submitting ride:', error);
        loadingState.classList.add('hidden');
        rideSelection.classList.remove('hidden');
        alert('Failed to submit ride request. Please try again.');
    }
});

// ============================================
// ACTIVE RIDES PANEL
// ============================================
function toggleActiveRides() {
    const panel = document.getElementById('active-rides-panel');
    panel.classList.toggle('hidden');
}

// Listen for rides from Firebase
function listenForRides() {
    const ridesRef = database.ref('rides');
    
    ridesRef.on('value', function(snapshot) {
        const ridesList = document.getElementById('active-rides-list');
        ridesList.innerHTML = '';
        
        const rides = snapshot.val();
        
        if (!rides) {
            ridesList.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px;">No active rides</p>';
            return;
        }
        
        // Convert to array and sort by timestamp
        const ridesArray = Object.entries(rides)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        // Show recent rides (last 24 hours)
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        const recentRides = ridesArray.filter(ride => (ride.timestamp || 0) > oneDayAgo);
        
        if (recentRides.length === 0) {
            ridesList.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px;">No recent rides</p>';
            return;
        }
        
        // Create ride cards
        recentRides.forEach(ride => {
            const rideCard = createRideCard(ride);
            ridesList.appendChild(rideCard);
        });
        
        // Update map markers
        updateRideMarkers(recentRides);
    });
}

// Create ride card
function createRideCard(ride) {
    const card = document.createElement('div');
    card.className = 'ride-card';
    
    const paymentIcons = {
        'personal': 'fa-credit-card',
        'business': 'fa-briefcase',
        'cash': 'fa-money-bill-wave',
        'wallet': 'fa-wallet'
    };
    
    card.innerHTML = `
        <div class="ride-card-header">
            <span class="ride-type-badge">${ride.rideType}</span>
            <span class="ride-status"><i class="fas fa-circle"></i> ${ride.status}</span>
        </div>
        <div class="ride-info">
            <div class="ride-info-row">
                <i class="fas fa-circle pickup-text"></i>
                <span>${ride.pickup.address}</span>
            </div>
            <div class="ride-info-row">
                <i class="fas fa-circle dropoff-text"></i>
                <span>${ride.dropoff.address}</span>
            </div>
        </div>
        <div class="ride-meta">
            <span>${new Date(ride.createdAt).toLocaleTimeString()}</span>
            <span class="ride-payment"><i class="fas ${paymentIcons[ride.payment.method] || 'fa-credit-card'}"></i> $${ride.payment.totalFare.toFixed(2)}</span>
        </div>
    `;
    
    return card;
}

// Update ride markers on map
function updateRideMarkers(rides) {
    // Remove existing markers
    rideMarkers.forEach(marker => map.removeLayer(marker));
    rideMarkers = [];
    
    // Add markers for each ride
    rides.forEach(ride => {
        if (ride.pickup && ride.pickup.lat) {
            const marker = L.marker([ride.pickup.lat, ride.pickup.lng], {
                icon: createCustomMarker('#3b82f6')
            }).addTo(map);
            
            marker.bindPopup(`
                <div style="color: #f1f5f9;">
                    <b>${ride.rideType}</b><br>
                    Status: ${ride.status}<br>
                    Pickup: ${ride.pickup.address}
                </div>
            `);
            
            rideMarkers.push(marker);
        }
    });
}

// ============================================
// INITIALIZE APP
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    initMap();
    listenForRides();
    console.log('Ride Request App initialized');
});tialized!');
    console.log('Note: Make sure to configure your Firebase credentials in app.js');
});
