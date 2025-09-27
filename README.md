# RScraper & Web Interface

A comprehensive travel data scraping and visualization solution for monitoring trip pricing across multiple destinations and time periods.

## 📋 Project Overview

This repository contains two main components:
- **RScraper** - Python web scraper for collecting travel pricing data from booking websites
- **Web Interface** - Modern React TypeScript web application for visualizing and analyzing collected data

## 🏗️ Repository Structure

```
RScraper/
├── RScraper/           # Python scraper application
│   ├── RScraper.py     # Main scraper script
│   ├── scraper.py      # Web scraping logic
│   ├── processor.py    # Data processing utilities
│   └── config_manager.py # Configuration management
├── data/               # Generated CSV files with pricing data
├── sources.json        # Trip configuration and URLs
├── RDisplay/           # React TypeScript web interface
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
└── README.md           # This file
```

## 🐍 RScraper - Data Collection Tool

### Features
- Automated web scraping of travel booking websites
- Configurable trip destinations and parameters
- Historical price tracking with timestamps
- Smart date parsing and year assignment
- CSV export with merge capability for existing data

### Requirements
- Python 3.8+
- Chrome/Chromium browser
- ChromeDriver (managed automatically by Selenium)
- Required Python packages (see installation)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/filipbiernat/RScraper.git
   cd RScraper
   ```

2. **Install Python dependencies**
   ```bash
   pip install selenium
   ```

3. **Configure trips in sources.json**
   ```json
   {
     "trips": {
       "Trip Name": {
         "country": "Country",
         "base_url": "https://...",
         "departure_locations": ["Airport1", "Airport2"]
       }
     }
   }
   ```

### Usage

**Run the scraper:**
```bash
cd RScraper
python RScraper.py
```

**Expected output:**
- CSV files in `../data/` directory
- Filename format: `{Country}__{Trip}__{Airport}__{Persons}os.csv`
- Automatic merging with existing historical data

### Configuration

Edit `sources.json` to:
- Add new trip destinations
- Modify departure airports
- Change person count options
- Update base URLs for booking sites

## ⚛️ Web Interface - Data Visualization Dashboard

### Features
- Modern React TypeScript interface
- Material-UI dark theme design
- Smart cascading filter system
- Responsive mobile-friendly layout
- Real-time CSV data loading
- Automatic past trip filtering
- Price history visualization

### Tech Stack
- React 18 + TypeScript
- Vite (build tool)
- Material-UI (MUI) v5
- GitHub Pages deployment

### Installation & Setup

1. **Install Node.js**
   - Download from: https://nodejs.org/
   - Choose LTS version (recommended)
   - Restart terminal after installation

2. **Install dependencies**
   ```bash
   cd RDisplay
   npm install
   ```

3. **Development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

### Deployment to GitHub Pages

**Manual deployment:**
```bash
cd RDisplay
npm install
npm run build
npm run deploy
```

**Live URL:** https://filipbiernat.github.io/RScraper

### Usage

1. **Select filters:**
   - Country (e.g., "Indie", "Chiny", "Hiszpania")
   - Trip name (filtered by country)
   - Departure airport (filtered by trip)
   - Number of persons (filtered by available data)

2. **View data:**
   - Date ranges for upcoming trips
   - Price history across multiple timestamps
   - Automatic sorting by departure date
   - Hidden past trips and empty columns

### Filter Logic

The application uses smart cascading filters:
- **Country selection** → filters available trips
- **Trip selection** → filters available airports
- **Airport selection** → filters available person counts
- **Invalid combinations** → automatically disabled (grayed out)
- **Auto-selection** → when only one option remains

## 📊 Data Format

### CSV Structure
```csv
,27.09.2025 21:06:59,27.09.2025 21:37:41
08.01 - 19.01,7579,7579
29.01 - 09.02,7415,7415
19.02 - 02.03,7766,7766
```

### Date Handling
- **Format:** `dd.mm - dd.mm` (without year)
- **Year logic:** Automatically assigned based on current date
- **Sorting:** Chronological from nearest future date
- **Filtering:** Past trips automatically hidden

## 🔄 Workflow

### Data Collection Workflow
1. Configure trips in `sources.json`
2. Run RScraper to collect current pricing
3. Data automatically saved/merged in `data/` folder
4. Schedule regular runs for price tracking

### Visualization Workflow
1. Open RScraper web interface
2. Select desired filters (country, trip, etc.)
3. View real-time pricing data and trends
4. Data automatically loaded from repository

## 🛠️ Development

### Python Development (RScraper)
```bash
# Install required package
pip install selenium

# Run the scraper (from RScraper subfolder)
cd RScraper
python RScraper.py

# Test configuration parsing (must be run from RScraper/ subfolder)
python -c "from config_manager import *; print(load_config('../sources.json'))"
```

### React Development (Web Interface)
```bash
# Start development server
cd RDisplay
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Build and preview
npm run build
npm run preview
```

### Adding New Destinations

1. **Update sources.json:**
   ```json
   "New Trip Name": {
     "country": "New Country",
     "base_url": "https://booking-site-url",
     "departure_locations": ["Airport1", "Airport2"]
   }
   ```

2. **Run scraper** to generate initial data
3. **Web interface automatically** detects new options

## 🚀 Deployment

### RScraper Automation
- Set up scheduled runs (cron job, Task Scheduler)
- Consider GitHub Actions for automated data collection
- Ensure Chrome/ChromeDriver compatibility

### Web Interface Hosting
- **GitHub Pages:** Automatic deployment from `gh-pages` branch
- **Alternative:** Netlify, Vercel, or any static hosting
- **CDN:** Automatic via GitHub Pages

## 📱 Browser Support

### Web Interface Compatibility
- **Modern browsers:** Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Mobile:** iOS Safari 14+, Chrome Mobile 88+
- **Features:** ES2020, CSS Grid, Flexbox required

### RScraper Compatibility
- **Chrome/Chromium** required for web scraping
- **Headless mode** supported for server deployment
- **Cross-platform:** Windows, macOS, Linux

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Quick Start

**For data collection:**
```bash
git clone https://github.com/filipbiernat/RScraper.git
cd RScraper/RScraper
pip install selenium
python RScraper.py
```

**For data visualization:**
```bash
cd ../RDisplay
npm install
npm run dev
# Open http://localhost:5173
```

**For production deployment:**
```bash
cd RDisplay
npm run build
npm run deploy
# Visit https://filipbiernat.github.io/RScraper
```

---

*Last updated: September 28, 2025*