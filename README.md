# RScraper & Web Interface

A travel data scraping and visualization solution for monitoring trip pricing across multiple destinations and time periods.

## 📋 Project Overview

This repository contains two main components:
- **RScraper** - Python web scraper for collecting travel pricing data from r.pl
- **Web Interface** - React TypeScript web application for visualizing collected data

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

### How it works

1. For each trip, the HTML page is downloaded via `requests` and parsed by `BeautifulSoup`
2. The `__NUXT_DATA__` JSON embedded in the page is used to discover all available departure airports automatically
3. For each departure airport, the `wyszukaj-kalkulator` API is called to retrieve dates and per-person prices
4. Results are saved (and merged with historical data) as CSV files in `data/`

### Features
- No browser or browser driver required (pure HTTP requests)
- Automatic discovery of all departure airports — no manual configuration needed
- Historical price tracking with timestamps
- CSV export with merge capability for existing data

### Requirements
- Python 3.8+
- `requests`, `beautifulsoup4`

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/filipbiernat/RScraper.git
   cd RScraper
   ```

2. **Install Python dependencies**
   ```bash
   pip install requests beautifulsoup4
   ```

3. **Configure trips in sources.json**
   ```json
   {
     "trips": {
       "Trip Name": {
         "country": "Country",
         "base_url": "https://r.pl/trip-slug/zakwaterowanie-xyz"
       }
     }
   }
   ```
   Departure airports are discovered automatically — no need to list them.

### Usage

**Run the scraper:**
```bash
cd RScraper
python RScraper.py
```

**Expected output:**
- CSV files in `../data/` directory
- Filename format: `{Country}__{Trip}__{Airport}__{Persons}os.csv`
- One file per trip × person count × departure airport combination
- Automatic merging with existing historical data

### Configuration

Edit `sources.json` to:
- Add new trip destinations
- Change person count options
- Update base URLs

#### sources.json structure
```json
{
  "global_config": {
    "age_param": "1995-01-01"
  },
  "defaults": {
    "person_counts": [1, 2]
  },
  "trips": {
    "Trip Name": {
      "country": "Country",
      "base_url": "https://r.pl/...",
      "person_counts": [1, 2]   // optional, overrides defaults
    }
  }
}
```

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
08.01.2026 - 19.01.2026,7579,7579
29.01.2026 - 09.02.2026,7415,7415
19.02.2026 - 02.03.2026,7766,7766
```

- Rows: departure date ranges
- Columns: scrape timestamps
- Values: price per person in PLN

## 🔄 Workflow

### Data Collection Workflow
1. Configure trips in `sources.json`
2. Run RScraper to collect current pricing
3. Data automatically saved/merged in `data/` folder
4. Schedule regular runs via GitHub Actions (daily at 3:00 AM UTC)

### Visualization Workflow
1. Open RScraper web interface
2. Select desired filters (country, trip, etc.)
3. View real-time pricing data and trends

## 🛠️ Development

### Python Development (RScraper)
```bash
# Install required packages
pip install requests beautifulsoup4

# Run the scraper (from RScraper subfolder)
cd RScraper
python RScraper.py

# Test configuration parsing
python -c "from config_manager import *; print(load_config('../sources.json'))"
```

### React Development (Web Interface)
```bash
cd RDisplay
npm run dev       # Development server
npm run build     # Production build
npm run deploy    # Deploy to GitHub Pages
```

### Adding New Destinations

1. **Update sources.json:**
   ```json
   "New Trip Name": {
     "country": "New Country",
     "base_url": "https://r.pl/trip-slug/zakwaterowanie-xyz"
   }
   ```

2. **Run scraper** to generate initial data — departure airports are found automatically
3. **Web interface automatically** detects new options

## 🚀 Deployment

### RScraper Automation
- Runs automatically via GitHub Actions daily at 3:00 AM UTC
- Commits updated CSV files back to the repository

### Web Interface Hosting
- **GitHub Pages:** Automatic deployment from `gh-pages` branch
- **Live URL:** https://filipbiernat.github.io/RScraper

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Quick Start

**For data collection:**
```bash
git clone https://github.com/filipbiernat/RScraper.git
cd RScraper/RScraper
pip install requests beautifulsoup4
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

*Last updated: March 2026*