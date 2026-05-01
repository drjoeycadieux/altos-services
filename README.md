# Ride Request App with Leaflet Maps & Firebase

A web application that allows users to request rides using an interactive map interface. Built with HTML, CSS, JavaScript, Leaflet.js for maps, and Firebase Realtime Database for data storage.

## Features

- 🗺️ **Interactive Map**: Click on the map to select pickup and dropoff locations
- 📍 **Visual Markers**: Green marker for pickup, red marker for dropoff
- 🚗 **Ride Types**: Choose between Standard, Premium, or XL rides
- 📱 **Real-time Updates**: See all active ride requests update in real-time
- 🎨 **Modern UI**: Clean, responsive design with gradient styling

## Files Structure

```
/workspace
├── index.html      # Main HTML structure
├── styles.css      # Styling and layout
├── app.js          # Application logic (Firebase + Leaflet)
└── README.md       # This file
```

## Setup Instructions

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Once created, go to Project Settings (gear icon)

### 2. Enable Realtime Database

1. In Firebase Console, navigate to **Build** → **Realtime Database**
2. Click **Create Database**
3. Choose your location
4. Set security rules to **Test Mode** for development (or configure proper rules for production)

### 3. Get Your Firebase Configuration

1. In Project Settings, scroll down to "Your apps"
2. Click the web icon (</>) to add a web app
3. Register your app with a nickname
4. Copy the `firebaseConfig` object provided

### 4. Update Configuration in app.js

Open `app.js` and replace the placeholder configuration with your actual Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### 5. Run the Application

You can run this application using any local web server:

**Option 1: Using Python**
```bash
cd /workspace
python3 -m http.server 8000
```

**Option 2: Using Node.js (http-server)**
```bash
npm install -g http-server
cd /workspace
http-server -p 8000
```

**Option 3: Using VS Code Live Server**
- Install the "Live Server" extension
- Right-click on `index.html` and select "Open with Live Server"

Then open your browser and navigate to `http://localhost:8000`

## How to Use

1. **Select Pickup Location**: Click on the map where you want to be picked up
2. **Select Dropoff Location**: Click again on the map for your destination
3. **Fill in Details**: Enter your name and phone number
4. **Choose Ride Type**: Select Standard, Premium, or XL
5. **Submit Request**: Click "Request Ride" button

Your ride request will be:
- Saved to Firebase Realtime Database
- Displayed as a marker on the map
- Listed in the "Active Ride Requests" section below

## Firebase Security Rules

For production, update your Firebase Realtime Database security rules:

```json
{
  "rules": {
    "rides": {
      ".read": true,
      ".write": true
    }
  }
}
```

**Note**: For production applications, implement proper authentication and more restrictive security rules.

## Customization

### Change Default Map Location

In `app.js`, modify the `initMap()` function:

```javascript
map = L.map('map').setView([YOUR_LATITUDE, YOUR_LONGITUDE], 13);
```

### Add More Ride Types

In `index.html`, add more options to the ride type select:

```html
<option value="luxury">Luxury</option>
```

Then update the color mapping in `app.js`:

```javascript
function getRideColor(rideType) {
    const colors = {
        standard: '#667eea',
        premium: '#764ba2',
        xl: '#f093fb',
        luxury: '#ffd700'  // Add new color
    };
    return colors[rideType] || '#667eea';
}
```

## Technologies Used

- **Leaflet.js**: Open-source JavaScript library for interactive maps
- **Firebase Realtime Database**: Cloud-hosted NoSQL database
- **OpenStreetMap**: Free, editable map of the world
- **HTML5/CSS3**: Modern web standards
- **Vanilla JavaScript**: No frameworks required

## Browser Support

Works on all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## License

MIT License - Feel free to use and modify for your projects!
