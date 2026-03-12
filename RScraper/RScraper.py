import os
import subprocess
from scraper import get_all_departures_with_prices
from processor import process_data
from config_manager import load_and_generate_combinations, generate_file_name

# Get the directory where the script is located
script_dir = os.path.dirname(os.path.abspath(__file__))

# Get the parent directory (one level up)
parent_dir = os.path.dirname(script_dir)

if __name__ == "__main__":
    json_file_name = "sources.json"

    # The JSON file is located in the parent directory
    json_file_path = os.path.join(parent_dir, json_file_name)

    # Load configuration and generate all trip combinations
    url_data = load_and_generate_combinations(json_file_path)

    # Ensure the "data" directory exists in the parent directory
    data_dir = os.path.join(parent_dir, "data")
    os.makedirs(data_dir, exist_ok=True)

    for name, details in url_data.items():
        link = details["link"]
        country = details["country"]
        trip_name = details["trip_name"]
        person_count = details["person_count"]
        age_param = details["age_param"]

        print(f"\n{'='*70}")
        print(f"Reading data for {name}...")
        print(f"{'='*70}")

        try:
            all_departures = get_all_departures_with_prices(link, age_param, person_count)
        except Exception as e:
            print(f"Error reading data for {name}: {e}")
            continue

        for departure_name, results in all_departures.items():
            file_name = generate_file_name(country, trip_name, departure_name, person_count)

            print(f"\nFound {len(results)} departure dates for {file_name}:")
            for term, price in results:
                print(f"  {term}: {price} zł")

            file_path = os.path.join(data_dir, f"{file_name}.csv")
            print(f"Saving data to: {file_path}")

            process_data(results, file_path)

    # After scraping all data, generate deals
    print(f"\n{'='*70}")
    print("Running deal generation script...")

    generate_deals_script = os.path.join(parent_dir, "generate_deals.py")
    if os.path.exists(generate_deals_script):
        subprocess.run(["python", generate_deals_script], check=True)
    else:
        print(f"Warning: Deal generator script not found at {generate_deals_script}")

