"""
Scraper for r.pl trip data using requests + BeautifulSoup + __NUXT_DATA__ JSON parsing.

Approach:
1. Fetch the HTML page for a trip (requests + BeautifulSoup)
2. Parse __NUXT_DATA__ embedded JSON to extract departure locations and their keys
3. For each departure, call the wyszukaj-kalkulator POST API to get dates and prices
"""
import json
import time
import requests
from bs4 import BeautifulSoup
from datetime import datetime

# --- Configuration ---

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

API_HEADERS = {
    "User-Agent": HEADERS["User-Agent"],
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Accept-Language": "pl-PL,pl;q=0.9",
    "Origin": "https://r.pl",
    "x-source": "r.pl",
}

KALKULATOR_API_URL = "https://r.pl/api/wyszukiwarka/v5.0/wyszukaj-kalkulator"
DELAY_BETWEEN_API_CALLS = 1.5  # seconds between API calls

# Reactive wrapper tags used in Nuxt 3 payload serialization
REACTIVE_TAGS = frozenset({
    "ShallowReactive", "Reactive", "Ref", "ShallowRef",
    "EmptyRef", "skipHydrate",
})


# --- HTML Fetching ---

def fetch_html(url):
    """Download HTML page content."""
    print(f"Fetching HTML: {url}")
    response = requests.get(url, headers=HEADERS, timeout=30)
    response.raise_for_status()
    return response.text


# --- Nuxt Data Parsing ---

def extract_nuxt_data(html):
    """Extract and parse __NUXT_DATA__ JSON from an HTML page."""
    soup = BeautifulSoup(html, "html.parser")
    script = soup.find("script", id="__NUXT_DATA__")
    if not script or not script.string:
        raise ValueError("__NUXT_DATA__ script tag not found in HTML")
    return json.loads(script.string)



def resolve(data, index, max_depth=10, _depth=0):
    """Fully resolve a value from the Nuxt flat array, following all index references."""
    if _depth > max_depth:
        return None
    if not isinstance(index, int) or index < 0 or index >= len(data):
        return None

    val = data[index]

    # Leaf values — return as-is
    if val is None or isinstance(val, (bool, int, float, str)):
        return val

    # Arrays
    if isinstance(val, list):
        # Tagged arrays (reactive wrappers and special types)
        if len(val) >= 2 and isinstance(val[0], str):
            tag = val[0]
            if tag in REACTIVE_TAGS:
                return resolve(data, val[1], max_depth, _depth + 1)
            if tag == "LocalDate":
                return resolve(data, val[1], max_depth, _depth + 1)
            if tag == "Set":
                return []
        # Regular array of index references
        return [resolve(data, i, max_depth, _depth + 1) for i in val]

    # Objects — each value is an index reference
    if isinstance(val, dict):
        return {k: resolve(data, v, max_depth, _depth + 1) for k, v in val.items()}

    return val


def extract_departures_from_nuxt(data):
    """Extract departure locations with their UnikalnyKluczOferty from __NUXT_DATA__.

    Scans the flat Nuxt payload array for an object with 'PrzystankiWyjazdowe' key.

    Returns list of dicts: [{"Nazwa": str, "Iata": str, "UnikalnyKluczOferty": str}, ...]
    """
    for val in data:
        if isinstance(val, dict) and "PrzystankiWyjazdowe" in val:
            przystanki = resolve(data, val["PrzystankiWyjazdowe"])
            if not przystanki:
                continue
            departures = []
            for p in przystanki:
                if isinstance(p, dict) and p.get("UnikalnyKluczOferty"):
                    departures.append({
                        "Nazwa": p.get("Nazwa", ""),
                        "Iata": p.get("Iata", ""),
                        "UnikalnyKluczOferty": p.get("UnikalnyKluczOferty", ""),
                    })
            if departures:
                print(f"Found {len(departures)} departure locations: {[d['Nazwa'] for d in departures]}")
                return departures

    raise ValueError("PrzystankiWyjazdowe not found in Nuxt data")


# --- API Calls ---

def parse_url_parts(base_url):
    """Extract ProduktUrl and HotelUrl from the trip base URL.

    e.g. "https://r.pl/hiszpanskie-el-clasico/zakwaterowanie-hlx"
    → ("hiszpanskie-el-clasico", "zakwaterowanie-hlx")
    """
    clean_url = base_url.split("?")[0].rstrip("/")
    parts = clean_url.split("/")
    if len(parts) >= 5:
        return parts[-2], parts[-1]
    raise ValueError(f"Cannot parse ProduktUrl/HotelUrl from: {base_url}")


def fetch_kalkulator(produkt_url, hotel_url, birth_dates, rooms_count, unikalny_klucz):
    """Call the wyszukaj-kalkulator POST API to get dates and prices for a departure."""
    payload = {
        "ProduktUrl": produkt_url,
        "HotelUrl": hotel_url,
        "CzyZmienionaKonfiguracjaOsobowa": False,
        "DatyUrodzenia": birth_dates,
        "LiczbaPokoi": rooms_count,
        "UnikalnyKluczOferty": unikalny_klucz,
    }

    print(f"    Calling kalkulator API...")
    response = requests.post(KALKULATOR_API_URL, json=payload, headers=API_HEADERS, timeout=30)
    response.raise_for_status()
    return response.json()


# --- Data Extraction ---

def format_date(iso_date):
    """Convert 'yyyy-mm-dd' to 'dd.mm.yyyy'."""
    dt = datetime.strptime(iso_date, "%Y-%m-%d")
    return dt.strftime("%d.%m.%Y")


def extract_dates_and_prices(kalkulator_data):
    """Extract dates and prices from kalkulator API response.

    Returns list of tuples: [("dd.mm.yyyy - dd.mm.yyyy", price_string), ...]
    """
    results = []

    if not kalkulator_data.get("CzyIstniejeWycieczka", False):
        print("    Trip does not exist for this departure")
        return results

    terminy_groups = kalkulator_data.get("Terminy", [])

    for group in terminy_groups:
        for termin in group.get("Terminy", []):
            daty = termin.get("DatyBlokow", [])
            cena = termin.get("CenaAvg")

            if len(daty) >= 2 and cena is not None:
                start_date = format_date(daty[0])
                end_date = format_date(daty[-1])
                date_range = f"{start_date} - {end_date}"
                results.append((date_range, str(cena)))

    return results


# --- Main Entry Point ---

def get_all_departures_with_prices(url, age_param, person_count):
    """Fetch a trip page and return dates+prices for all departure locations.

    Args:
        url: Full trip page URL (with query params for person count etc.)
        age_param: Birth date string, e.g. "1995-01-01"
        person_count: Number of persons

    Returns:
        dict: {departure_name: [(date_range, price_string), ...]}
    """
    # Step 1: Fetch HTML and extract __NUXT_DATA__
    html = fetch_html(url)
    nuxt_data = extract_nuxt_data(html)

    # Step 2: Extract departure locations with their keys
    departures = extract_departures_from_nuxt(nuxt_data)

    # Step 3: Parse URL parts for API calls
    produkt_url, hotel_url = parse_url_parts(url)

    # Step 4: Build birth dates array
    birth_dates = [age_param] * person_count

    # Step 5: For each departure, call the kalkulator API
    all_results = {}

    for i, dep in enumerate(departures):
        nazwa = dep["Nazwa"]
        klucz = dep["UnikalnyKluczOferty"]

        print(f"\n  [{i+1}/{len(departures)}] Departure: {nazwa}")

        try:
            kalk_data = fetch_kalkulator(produkt_url, hotel_url, birth_dates, 1, klucz)
            results = extract_dates_and_prices(kalk_data)
            all_results[nazwa] = results
            print(f"    Found {len(results)} departure dates")
        except Exception as e:
            print(f"    Error fetching data for {nazwa}: {e}")

        # Be polite to the server
        if i < len(departures) - 1:
            time.sleep(DELAY_BETWEEN_API_CALLS)

    return all_results