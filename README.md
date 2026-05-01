# Ride Request App with Leaflet Maps & Firebase

A professional ride-hailing web application with payment integration, built using HTML, CSS, JavaScript, Leaflet.js for maps, and Firebase Realtime Database for data storage.

## ✨ Features

- 🗺️ **Interactive Map**: Click to select pickup and dropoff locations with visual markers
- 💳 **Payment Options**: Choose between Credit Card, Cash, or Digital Wallet
- 💰 **Fare Estimation**: Real-time fare calculation based on ride type
- 🚗 **Ride Types**: Select from Standard, Premium, or XL rides
- 📍 **Visual Markers**: Green marker for pickup, red for dropoff, colored markers for active rides
- 📱 **Real-time Updates**: All ride requests update instantly via Firebase
- 🎨 **Professional Dark Theme**: Modern UI with gradient accents and smooth animations
- 📊 **Detailed Ride Cards**: View complete ride info including payment method and total fare

## 📁 Files Structure

```
/workspace
├── index.html      # Main HTML structure with form and map
├── styles.css      # Professional dark theme styling
├── app.js          # Application logic (Firebase + Leaflet + Fare calculation)
└── README.md       # Documentation
```

## 🚀 Setup Instructions

### 1. Create a Firebase Project

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Once created, access Project Settings (gear icon ⚙️)

### 2. Enable Realtime Database

1. Navigate to **Build** → **Realtime Database**
2. Click **Create Database**
3. Select your preferred location
4. Set security rules to **Test Mode** for development

### 3. Get Your Firebase Configuration

1. In Project Settings, scroll to "Your apps"
2. Click the web icon (`</>`) to register a web app
3. Give your app a nickname
4. Copy the provided `firebaseConfig` object

### 4. Update Configuration in app.js

Open `app.js` and replace the placeholder configuration:

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

**Option 1: Using Python**
```bash
cd /workspace
python3 -m http.server 8000
```

**Option 2: Using Node.js**
```bash
npm install -g http-server
cd /workspace
http-server -p 8000
```

**Option 3: VS Code Live Server**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

Then open `http://localhost:8000` in your browser.

## 📖 How to Use

1. **Select Pickup**: Click on the map to set your pickup location
2. **Select Dropoff**: Click again to set your destination
3. **Enter Details**: Provide your name and phone number
4. **Choose Ride Type**: Pick Standard ($15-20), Premium ($25-35), or XL ($35-45)
5. **Select Payment**: Choose Credit Card, Cash, or Digital Wallet
6. **Review Fare**: See the estimated total fare (base fare + $2.50 service fee)
7. **Submit Request**: Click "Confirm & Request Ride"

Your ride request will be:
- ✅ Saved to Firebase with payment information
- 🗺️ Displayed as a marker on the map
- 📋 Listed in the "Active Ride Requests" section with full details

## 💳 Payment Methods

The app supports three payment options:

| Method | Icon | Payment Status |
|--------|------|----------------|
| Credit/Debit Card | 💳 | Authorized |
| Cash | 💵 | Pending (pay driver) |
| Digital Wallet | 👛 | Authorized |

## 🔒 Firebase Security Rules

For production deployment, configure proper security rules:

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

> ⚠️ **Note**: Implement Firebase Authentication and stricter rules for production apps.

## 🎨 Customization

### Change Default Map Location

In `app.js`, modify `initMap()`:

```javascript
map = L.map('map').setView([YOUR_LAT, YOUR_LNG], 13);
```

### Adjust Pricing

In `index.html`, update `data-price` attributes:

```html
<input type="radio" name="rideType" value="Standard" data-price="15" checked>
```

In `app.js`, adjust the service fee:

```javascript
const SERVICE_FEE = 2.50; // Change this value
```

### Add More Ride Types

1. Add option in `index.html`:
```html
<label class="ride-option">
    <input type="radio" name="rideType" value="Luxury" data-price="50">
    <div class="option-card">
        <i class="fas fa-gem"></i>
        <span class="option-name">Luxury</span>
        <span class="option-price">$50-70</span>
    </div>
</label>
```

2. Update color mapping in `app.js`:
```javascript
function getRideColor(rideType) {
    const colors = {
        standard: '#10b981',
        premium: '#3b82f6',
        xl: '#8b5cf6',
        luxury: '#fbbf24'
    };
    return colors[rideType] || '#3b82f6';
}
```

## 🛠 Technologies Used

- **Leaflet.js** - Interactive map library
- **Firebase Realtime Database** - Cloud NoSQL database
- **OpenStreetMap** - Free world map tiles
- **Font Awesome** - Icon library
- **HTML5/CSS3** - Modern web standards
- **Vanilla JavaScript** - No frameworks needed

## 🌐 Browser Support

Compatible with all modern browsers:
- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge

## 📝 Data Structure

Each ride request stored in Firebase:

```javascript
{
  pickup: { lat: 40.7128, lng: -74.0060, address: "40.7128, -74.0060" },
  dropoff: { lat: 40.7580, lng: -73.9855, address: "40.7580, -73.9855" },
  passenger: { name: "John Doe", phone: "+1 234 567 8900" },
  rideType: "Premium",
  payment: {
    method: "Credit Card",
    baseFare: 25,
    serviceFee: 2.50,
    totalFare: 27.50,
    status: "authorized"
  },
  status: "pending",
  timestamp: 1234567890,
  createdAt: "2024-01-15T10:30:00.000Z"
}
```

## 📄 License

MIT License - Free to use and modify for your projects!

---

**Need help?** Check the [Firebase Documentation](https://firebase.google.com/docs) or [Leaflet Documentation](https://leafletjs.com/reference.html).
