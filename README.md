# Food Diary App

A full-featured nutrition tracking app powered by Open Food Facts.

## Features

### Core Features
- 📷 **Barcode Scanner** - Scan product barcodes to instantly get nutritional info
- 🔍 **Food Search** - Search Open Food Facts database by name
- 📝 **Food Diary** - Log meals (breakfast, lunch, dinner, snacks)
- 🍽️ **Portion Tracking** - Adjustable serving sizes
- 🎯 **Calorie Goals** - Set and track daily calorie targets
- 📊 **Macro Tracking** - Protein, carbs, and fat goals
- 💧 **Water Tracking** - Log daily water intake
- ⚖️ **Weight Tracking** - Log and track weight over time
- 📈 **Progress Charts** - Visual progress over the last 7 days

### Tech Stack
- **Mobile**: React Native + Expo
- **Web Dashboard**: Pure HTML/CSS/JavaScript
- **Data Source**: Open Food Facts API (free)
- **Storage**: LocalStorage (no backend required)

## Project Structure

```
FoodDiary/
├── App.js                    # Main app entry
├── package.json              # Dependencies
├── fooddiary.html           # Web dashboard
├── app-tabs/
│   ├── HomeScreen.js         # Dashboard overview
│   ├── ScanScreen.js        # Barcode scanner
│   ├── DiaryScreen.js       # Food diary view
│   ├── ProgressScreen.js    # Charts & progress
│   └── SettingsScreen.js    # User preferences
├── app-lib/
│   ├── api.ts               # Open Food Facts API
│   └── storage.ts           # LocalStorage utilities
└── app-types/
    └── index.ts             # TypeScript interfaces
```

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g expo-cli`)

### Install Dependencies
```bash
cd FoodDiary
npm install
```

### Run on Mobile
```bash
npx expo start
# Then scan QR code with Expo Go app
```

### Run Web Dashboard
```bash
# Open fooddiary.html directly in browser
# OR serve with any static server:
npx serve .
```

## API

Open Food Facts API (free, no key required):
```
https://world.openfoodfacts.org/api/v0/product/{barcode}.json
```

## Screens

1. **Home** - Daily calorie budget, quick actions, meals summary
2. **Scan** - Camera barcode scanner or manual entry
3. **Diary** - View and manage today's food entries
4. **Progress** - Charts, weight tracking, streaks
5. **Settings** - Goals, preferences, data management

## Data Storage

All data stored locally on device using AsyncStorage (mobile) or localStorage (web). No account or cloud sync required.

## License

Personal use only.
