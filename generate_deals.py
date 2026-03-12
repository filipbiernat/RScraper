"""
Generate deals.json from CSV price data.

Reads all CSV files in data/ and identifies attractive travel deals using 4 algorithms:
1. Combined Score (weighted composite)
2. Price Drops (newest vs previous scrape)
3. Lowest per Trip (bottom percentile within a trip)
4. All-Time Low (current price near historical minimum)

Output: data/deals.json
"""

import os
import sys
import json
import csv
import statistics
from datetime import datetime, date

# Add RScraper directory to path for config_manager
script_dir = os.path.dirname(os.path.abspath(__file__))
rscraper_dir = os.path.join(script_dir, "RScraper")
sys.path.insert(0, rscraper_dir)

from config_manager import transliterate_polish

DATA_DIR = os.path.join(script_dir, "data")
SOURCES_FILE = os.path.join(script_dir, "sources.json")
OUTPUT_FILE = os.path.join(DATA_DIR, "deals.json")

# --- Thresholds ---
COMBINED_SCORE_THRESHOLD = 60       # Score 0-100, show deals >= 60
PRICE_DROP_THRESHOLD_PCT = 5.0      # Minimum % drop to qualify
LOWEST_PERCENTILE = 10              # Bottom 10th percentile within trip
ALL_TIME_LOW_MARGIN_PCT = 2.0       # Within 2% of all-time minimum


def parse_csv_file(file_path):
    """Parse a CSV file and return structured price data."""
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    if len(lines) < 2:
        return None

    # Parse header (timestamps)
    header = lines[0].strip().split(',')
    timestamps = header[1:]  # Skip first empty column

    # Sort timestamps newest first
    def parse_ts(ts):
        try:
            return datetime.strptime(ts.strip(), "%d.%m.%Y %H:%M:%S")
        except ValueError:
            return datetime.min

    ts_with_idx = [(ts, i) for i, ts in enumerate(timestamps)]
    ts_with_idx.sort(key=lambda x: parse_ts(x[0]), reverse=True)

    sorted_timestamps = [t[0] for t in ts_with_idx]
    index_mapping = [t[1] for t in ts_with_idx]

    # Parse data rows
    terms = []
    for line in lines[1:]:
        parts = line.strip().split(',')
        if len(parts) < 2:
            continue

        date_range = parts[0]
        original_prices = parts[1:]

        # Reorder prices by newest-first timestamp order
        prices = []
        for orig_idx in index_mapping:
            if orig_idx < len(original_prices):
                val = original_prices[orig_idx].strip()
                prices.append(int(val) if val and val.isdigit() else None)
            else:
                prices.append(None)

        terms.append({
            'dateRange': date_range,
            'prices': prices,
        })

    return {
        'timestamps': sorted_timestamps,
        'terms': terms,
    }


def parse_date_from_term(date_range):
    """Parse start date from 'dd.mm.yyyy - dd.mm.yyyy' format."""
    start_str = date_range.split(' - ')[0].strip()
    try:
        return datetime.strptime(start_str, "%d.%m.%Y").date()
    except ValueError:
        return None


def is_future_term(date_range):
    """Check if the trip term is in the future."""
    start = parse_date_from_term(date_range)
    if start is None:
        return False
    return start > date.today()


def parse_csv_filename(filename):
    """Parse CSV filename into components.
    Format: {Country}__{Trip_Name}__{Airport}__{X}os.csv
    """
    base = filename.replace('.csv', '')
    parts = base.split('__')
    if len(parts) != 4:
        return None

    country, trip_name, airport, persons_str = parts
    import re
    m = re.match(r'^(\d+)os$', persons_str)
    if not m:
        return None

    return {
        'country': country,
        'tripName': trip_name,
        'airport': airport.replace('_', ' '),
        'persons': int(m.group(1)),
        'fileName': filename,
    }


def reverse_transliterate_name(transliterated_name, sources_config):
    """Try to find the original Polish name from sources.json matching a transliterated name."""
    trips = sources_config.get('trips', {})

    # Try trip names
    for original_name, details in trips.items():
        if transliterate_polish(original_name) == transliterated_name:
            return original_name, details.get('country', ''), details.get('base_url', '')

    return None


def load_sources():
    """Load sources.json configuration."""
    with open(SOURCES_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)


def build_offer_url(sources_config, trip_name_original, persons):
    """Build the r.pl offer URL for a trip."""
    trips = sources_config.get('trips', {})
    trip_config = trips.get(trip_name_original)
    if not trip_config:
        return None

    age_param = sources_config.get('global_config', {}).get('age_param', '1995-01-01')
    base_url = trip_config['base_url']
    age_params = '&'.join([f'wiek={age_param}' for _ in range(persons)])
    return f"{base_url}?czyCenaZaWszystkich=1&{age_params}&liczbaPokoi=1"


def collect_all_data(data_dir, sources_config):
    """Read all CSV files and collect term-level data."""
    all_terms = []

    csv_files = [f for f in os.listdir(data_dir) if f.endswith('.csv')]

    for csv_file in csv_files:
        file_info = parse_csv_filename(csv_file)
        if not file_info:
            continue

        file_path = os.path.join(data_dir, csv_file)
        parsed = parse_csv_file(file_path)
        if not parsed or not parsed['terms']:
            continue

        # Reverse-lookup original names from sources.json
        result = reverse_transliterate_name(file_info['tripName'], sources_config)
        if result:
            trip_original, country_original, base_url = result
        else:
            trip_original = file_info['tripName'].replace('_', ' ')
            country_original = file_info['country'].replace('_', ' ')
            base_url = ''

        offer_url = build_offer_url(sources_config, trip_original, file_info['persons']) or ''

        for term in parsed['terms']:
            # Skip past terms
            if not is_future_term(term['dateRange']):
                continue

            # Current price = newest timestamp (index 0)
            current_price = term['prices'][0] if term['prices'] else None
            if current_price is None or current_price <= 0:
                continue  # Sold out or invalid

            # Previous price = second newest timestamp (index 1)
            previous_price = None
            if len(term['prices']) > 1:
                previous_price = term['prices'][1]
                if previous_price is not None and previous_price <= 0:
                    previous_price = None

            # All valid historical prices
            all_prices = [p for p in term['prices'] if p is not None and p > 0]
            all_time_min = min(all_prices) if all_prices else current_price
            all_time_max = max(all_prices) if all_prices else current_price

            all_terms.append({
                'country': country_original,
                'trip': trip_original,
                'airport': file_info['airport'],
                'persons': file_info['persons'],
                'dateRange': term['dateRange'],
                'currentPrice': current_price,
                'previousPrice': previous_price,
                'allTimeMin': all_time_min,
                'allTimeMax': all_time_max,
                'csvFileName': csv_file,
                'offerUrl': offer_url,
            })

    return all_terms


# --- Algorithm A: Price Drops ---
def find_price_drops(all_terms):
    """Find terms where price dropped significantly from previous scrape."""
    deals = []
    for term in all_terms:
        prev = term['previousPrice']
        curr = term['currentPrice']
        if prev is None or prev <= 0:
            continue

        drop_pct = ((prev - curr) / prev) * 100
        if drop_pct >= PRICE_DROP_THRESHOLD_PCT:
            deal = {**term, 'score': min(100, int(drop_pct * 3)), 'reason': 'priceDrop',
                    'dropPercent': round(drop_pct, 1), 'dropAbsolute': prev - curr}
            deals.append(deal)

    deals.sort(key=lambda d: d['dropPercent'], reverse=True)
    return deals


# --- Algorithm B: Lowest per Trip ---
def find_lowest_per_trip(all_terms):
    """Find terms that are in the bottom percentile of prices within their trip."""
    # Group by trip + persons
    groups = {}
    for term in all_terms:
        key = (term['trip'], term['persons'])
        groups.setdefault(key, []).append(term)

    deals = []
    for (trip, persons), terms in groups.items():
        prices = [t['currentPrice'] for t in terms]
        if len(prices) < 3:
            continue  # Need enough data to compute percentile

        prices_sorted = sorted(prices)
        threshold_idx = max(0, int(len(prices_sorted) * LOWEST_PERCENTILE / 100))
        threshold_price = prices_sorted[threshold_idx]

        median_price = statistics.median(prices)

        for term in terms:
            if term['currentPrice'] <= threshold_price:
                discount_from_median = ((median_price - term['currentPrice']) / median_price) * 100
                deal = {**term, 'score': min(100, int(discount_from_median * 2)),
                        'reason': 'lowestPerTrip', 'medianPrice': int(median_price)}
                deals.append(deal)

    deals.sort(key=lambda d: d['score'], reverse=True)
    return deals


# --- Algorithm C: All-Time Low ---
def find_all_time_lows(all_terms):
    """Find terms where current price is at or near historical minimum."""
    deals = []
    for term in all_terms:
        atm = term['allTimeMin']
        curr = term['currentPrice']
        atx = term['allTimeMax']

        if atm <= 0 or atx <= atm:
            continue  # No meaningful history

        margin_pct = ((curr - atm) / atm) * 100
        if margin_pct <= ALL_TIME_LOW_MARGIN_PCT:
            # Score based on how much range exists (bigger range = more meaningful)
            price_range_pct = ((atx - atm) / atm) * 100
            score = min(100, int(price_range_pct * 5))
            deal = {**term, 'score': max(score, 50), 'reason': 'allTimeLow',
                    'marginFromMin': round(margin_pct, 1)}
            deals.append(deal)

    deals.sort(key=lambda d: d['score'], reverse=True)
    return deals


# --- Algorithm D: Combined Score ---
def find_combined_deals(all_terms):
    """Combined scoring using weighted signals from all algorithms."""
    deals = []

    # Pre-compute per-trip stats
    trip_groups = {}
    for term in all_terms:
        key = (term['trip'], term['persons'])
        trip_groups.setdefault(key, []).append(term)

    trip_medians = {}
    trip_percentiles = {}
    for key, terms in trip_groups.items():
        prices = sorted([t['currentPrice'] for t in terms])
        trip_medians[key] = statistics.median(prices)
        trip_percentiles[key] = prices

    for term in all_terms:
        score = 0
        reasons = []
        key = (term['trip'], term['persons'])

        curr = term['currentPrice']
        prev = term['previousPrice']
        atm = term['allTimeMin']
        atx = term['allTimeMax']

        # Signal 1: Price drop (weight 35)
        if prev is not None and prev > 0:
            drop_pct = ((prev - curr) / prev) * 100
            if drop_pct > 0:
                score += min(35, drop_pct * 7)
                reasons.append('priceDrop')

        # Signal 2: Near all-time low (weight 35)
        if atm > 0 and atx > atm:
            position = (curr - atm) / (atx - atm)  # 0 = at min, 1 = at max
            atl_score = max(0, (1 - position)) * 35
            score += atl_score
            if position <= 0.05:
                reasons.append('allTimeLow')

        # Signal 3: Below trip median (weight 30)
        median = trip_medians.get(key, curr)
        if median > 0:
            percentile_prices = trip_percentiles.get(key, [curr])
            rank = sum(1 for p in percentile_prices if p <= curr)
            percentile = (rank / len(percentile_prices)) * 100
            if percentile <= 30:
                score += (1 - percentile / 100) * 30
                reasons.append('lowestPerTrip')

        score = min(100, int(score))
        if score >= COMBINED_SCORE_THRESHOLD:
            primary_reason = reasons[0] if reasons else 'combined'
            deal = {**term, 'score': score, 'reason': primary_reason}
            deals.append(deal)

    deals.sort(key=lambda d: d['score'], reverse=True)
    return deals


def clean_deal_for_json(deal):
    """Remove internal fields and prepare deal for JSON output."""
    return {
        'country': deal['country'],
        'trip': deal['trip'],
        'airport': deal['airport'],
        'persons': deal['persons'],
        'dateRange': deal['dateRange'],
        'currentPrice': deal['currentPrice'],
        'previousPrice': deal.get('previousPrice'),
        'allTimeMin': deal['allTimeMin'],
        'allTimeMax': deal['allTimeMax'],
        'score': deal['score'],
        'reason': deal['reason'],
        'csvFileName': deal['csvFileName'],
        'offerUrl': deal.get('offerUrl', ''),
    }


def limit_deals(deals, limit_per_person=30):
    """Limit deals to a maximum number per person category to keep JSON small."""
    deals1 = [d for d in deals if d['persons'] == 1][:limit_per_person]
    deals2 = [d for d in deals if d['persons'] == 2][:limit_per_person]
    limited = deals1 + deals2
    limited.sort(key=lambda d: d['score'], reverse=True)
    return limited


def main():
    print("=" * 70)
    print("GENERATE DEALS — analyzing CSV data for travel deals")
    print("=" * 70)

    sources_config = load_sources()
    print(f"Loaded sources.json with {len(sources_config.get('trips', {}))} trips")

    all_terms = collect_all_data(DATA_DIR, sources_config)
    print(f"Collected {len(all_terms)} future terms from CSV files")

    if not all_terms:
        print("No future terms found. Creating empty deals.json.")
        result = {
            "generatedAt": datetime.now().isoformat(timespec='seconds'),
            "sections": {}
        }
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        return

    # Run all 4 algorithms
    combined = find_combined_deals(all_terms)
    price_drops = find_price_drops(all_terms)
    lowest = find_lowest_per_trip(all_terms)
    all_time_low = find_all_time_lows(all_terms)

    print(f"\nRaw Results:")
    print(f"  Combined Score (D):  {len(combined)} deals")
    print(f"  Price Drops (A):     {len(price_drops)} deals")
    print(f"  Lowest per Trip (B): {len(lowest)} deals")
    print(f"  All-Time Low (C):    {len(all_time_low)} deals")

    # Limit deals to avoid massive JSON file
    combined = limit_deals(combined)
    price_drops = limit_deals(price_drops)
    lowest = limit_deals(lowest)
    all_time_low = limit_deals(all_time_low)
    
    print(f"\nLimited Results (Max 60 per section):")
    print(f"  Combined Score (D):  {len(combined)} deals")
    print(f"  Price Drops (A):     {len(price_drops)} deals")
    print(f"  Lowest per Trip (B): {len(lowest)} deals")
    print(f"  All-Time Low (C):    {len(all_time_low)} deals")

    result = {
        "generatedAt": datetime.now().isoformat(timespec='seconds'),
        "sections": {
            "combined": {
                "label": "Top Deals",
                "deals": [clean_deal_for_json(d) for d in combined],
            },
            "priceDrops": {
                "label": "Price Drops",
                "deals": [clean_deal_for_json(d) for d in price_drops],
            },
            "lowestPerTrip": {
                "label": "Lowest Prices",
                "deals": [clean_deal_for_json(d) for d in lowest],
            },
            "allTimeLow": {
                "label": "All-Time Lows",
                "deals": [clean_deal_for_json(d) for d in all_time_low],
            },
        }
    }

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"\n✓ Deals saved to: {OUTPUT_FILE}")
    total = len(combined) + len(price_drops) + len(lowest) + len(all_time_low)
    print(f"  Total deal entries: {total}")


if __name__ == "__main__":
    main()
