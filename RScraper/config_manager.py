"""
Configuration manager for RScraper - handles sources.json processing and trip combinations generation
"""
import os
import json


def transliterate_polish(text):
    """Convert Polish characters to ASCII equivalents and replace spaces with underscores"""
    polish_chars = {
        'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n',
        'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
        'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N',
        'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z'
    }

    result = text
    for polish, ascii_char in polish_chars.items():
        result = result.replace(polish, ascii_char)

    # Replace spaces with underscores
    result = result.replace(' ', '_')

    return result


def generate_age_params(person_count, age_param):
    """Generate age parameters for URL based on person count"""
    return '&'.join([f'wiek={age_param}' for _ in range(person_count)])


def build_url(base_url, person_count, age_param):
    """Build complete URL with all parameters"""
    age_params = generate_age_params(person_count, age_param)
    return f"{base_url}?czyCenaZaWszystkich=1&{age_params}&liczbaPokoi=1"


def generate_file_name(country, trip_name, departure, person_count):
    """Generate file name following the convention: Country__Trip_Name__Departure__XPersons"""
    country_clean = transliterate_polish(country)
    trip_name_clean = transliterate_polish(trip_name)
    departure_clean = transliterate_polish(departure)

    return f"{country_clean}__{trip_name_clean}__{departure_clean}__{person_count}os"


def load_config(json_file_path):
    """Load configuration from JSON file"""
    print(f"Reading configuration from JSON file: {json_file_path}")
    with open(json_file_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def generate_trip_combinations(config_data):
    """Generate all combinations of trips based on configuration"""
    global_config = config_data.get('global_config', {})
    defaults = config_data.get('defaults', {})
    trips = config_data.get('trips', {})

    age_param = global_config.get('age_param', '1995-01-01')
    default_departure_locations = defaults.get('departure_locations', ['Katowice'])
    default_person_counts = defaults.get('person_counts', [1, 2])

    combinations = {}

    for trip_name, trip_details in trips.items():
        country = trip_details['country']
        base_url = trip_details['base_url']

        # Use trip-specific values or fall back to defaults
        departure_locations = trip_details.get('departure_locations', default_departure_locations)
        person_counts = trip_details.get('person_counts', default_person_counts)

        # Generate all combinations for this trip
        for departure in departure_locations:
            for person_count in person_counts:
                # Generate the key name
                key_name = generate_file_name(country, trip_name, departure, person_count)

                # Build the URL
                url = build_url(base_url, person_count, age_param)

                # Add to combinations
                combinations[key_name] = {
                    "link": url,
                    "departure_from": departure
                }

    return combinations


def generate_offer_link(base_url, person_count, age_param):
    """Generate offer link using the same logic as build_url"""
    return build_url(base_url, person_count, age_param)


def append_offer_link_to_csv(csv_file_path, offer_url):
    """Append or update OFFER_LINK row in CSV file"""
    if not os.path.exists(csv_file_path):
        print(f"CSV file {csv_file_path} does not exist, skipping offer link addition")
        return

    # Read existing content
    with open(csv_file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Remove existing OFFER_LINK if present
    lines = [line for line in lines if not line.startswith('OFFER_LINK,')]

    # Add new OFFER_LINK at the end
    offer_line = f"OFFER_LINK,{offer_url}" + "," * (len(lines[0].split(',')) - 2) + "\n"
    lines.append(offer_line)

    # Write back to file
    with open(csv_file_path, 'w', encoding='utf-8') as f:
        f.writelines(lines)

    print(f"Added offer link to {csv_file_path}: {offer_url}")


def add_offer_links_to_existing_csvs(combinations, data_dir="../data"):
    """Add offer links to all existing CSV files based on combinations"""
    print("Adding offer links to existing CSV files...")

    for combination_name, combination_data in combinations.items():
        csv_filename = f"{combination_name}.csv"
        csv_file_path = os.path.join(data_dir, csv_filename)

        if os.path.exists(csv_file_path):
            offer_url = combination_data['link']
            append_offer_link_to_csv(csv_file_path, offer_url)
        else:
            print(f"CSV file {csv_file_path} not found, skipping")

    print("Finished adding offer links to CSV files")


def load_and_generate_combinations(json_file_path):
    """Load configuration from JSON file and generate all trip combinations"""
    config_data = load_config(json_file_path)
    combinations = generate_trip_combinations(config_data)

    print(f"Generated {len(combinations)} trip combinations from configuration")
    print("Trip combinations:")
    for name in combinations.keys():
        print(f"  - {name}")
    print()

    return combinations