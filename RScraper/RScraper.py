import os
import sys
from scraper import get_dates_and_prices
from processor import process_data
from config_manager import load_and_generate_combinations, add_offer_links_to_existing_csvs

# Get the directory where the script is located
script_dir = os.path.dirname(os.path.abspath(__file__))

# Get the parent directory (one level up)
parent_dir = os.path.dirname(script_dir)

def add_links_only():
    """Add offer links to existing CSV files without scraping new data"""
    json_file_name = "sources.json"
    json_file_path = os.path.join(parent_dir, json_file_name)

    # Load configuration and generate all trip combinations
    url_data = load_and_generate_combinations(json_file_path)

    # Add offer links to existing CSV files
    data_dir = os.path.join(parent_dir, "data")
    add_offer_links_to_existing_csvs(url_data, data_dir)

    print("Finished adding offer links to existing CSV files!")

if __name__ == "__main__":
    # Check if user wants to add links only
    if len(sys.argv) > 1 and sys.argv[1] == "--add-links":
        add_links_only()
        exit(0)

    json_file_name = "sources.json"

    # The JSON file is located in the parent directory
    json_file_path = os.path.join(parent_dir, json_file_name)

    # Load configuration and generate all trip combinations
    url_data = load_and_generate_combinations(json_file_path)

    for name, details in url_data.items():
        link = details["link"]
        departure_from = details["departure_from"]

        print(f"\nReading data for {name}...")
        results = get_dates_and_prices(link, departure_from)

        print(f"\nFound departure dates for {name}:")
        for term, price in results:
            print(f"{term}: {price} zł")

        # Ensure the "data" directory exists in the parent directory
        data_dir = os.path.join(parent_dir, "data")
        if not os.path.exists(data_dir):
            print(f"\nCreating directory: {data_dir}")
            os.makedirs(data_dir)
        else:
            print(f"\nDirectory already exists: {data_dir}")

        file_path = os.path.join(data_dir, f"{name}.csv")
        print(f"Saving data to: {file_path}")

        # Pass the offer URL to processor
        offer_url = link
        process_data(results, file_path, offer_url)
