# 🌦️ Weather App

A simple and beautiful weather application built using **React Native** and **Expo**. It fetches live weather data using the **OpenWeatherMap API**.

---

## 🚀 Setup Instructions

### 📦 Prerequisites

- Node.js (v14 or later)
- npm (v6 or later) or Yarn (v1.22 or later)
- Expo CLI (`npm install -g expo-cli`)
- A code editor (e.g., VS Code)
- Expo Go app (on your mobile device) or an emulator (Android/iOS)

---

## 🔑 Get Your OpenWeatherMap API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/)
2. Sign in or create an account
3. Navigate to the "API Keys" section
4. Copy your API key for later use

---

## 🛠 Installation

git clone https://github.com/santhosh46v/Weather-App.git
cd Weather-App

npm install
 or
yarn install

## ⚙️ API Key Configuration

Open the file:
services/weatherService.js

Replace this line:
const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY';
with your actual API key from OpenWeatherMap.

## ▶️ Running the App

Start the Expo development server:
npx expo start

Then:
• Scan the QR code using Expo Go on your mobile device
• Press a to open in Android emulator
• Press i to open in iOS simulator (Mac only)

## 🧪 App Features

• Search weather by city name
• Use your current location to fetch weather
• Dynamic Lottie animations based on weather
• Error messages for invalid input or no internet
• Local data saving using AsyncStorage

## 📷 Screenshots

To view the app UI, navigate to the `assets/screenshots` folder where all screenshots of the app are available.

## 🎥 Demo Video
Watch the app in action:

👉 https://www.loom.com/share/cd77956c61ec422190465a066ec09223?sid=55a1fc2a-75e0-43e8-b96a-3e5aee21c1c6

## ✨ License
This project is open source and free to use.
