import re
import platform
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

IS_IN_BACKGROUND = True
IS_WINDOWS = platform.system() == "Windows"

def configure_driver():
    print("Configuring WebDriver...")
    options = Options()
    if IS_IN_BACKGROUND:
        options.add_argument("--headless")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")

    if not IS_WINDOWS:
        options.binary_location = "/usr/bin/chromium-browser"

    return webdriver.Chrome(options=options)

def click_button(driver, description, xpath, timeout=20):
    print(f"Attempting to click button: {description}")
    try:
        # Ensure the button is clickable
        xpath_element = (By.XPATH, xpath)
        button = WebDriverWait(driver, timeout).until(
            EC.element_to_be_clickable(xpath_element)
        )

        # Click
        button.click()
        print(f"Button '{description}' clicked successfully.")
    except Exception as e:
        driver.quit()
        print(f"Error clicking button '{description}': {e}")
        raise Exception(f"Button '{description}' not found: {e}.")

def click_div(driver, description, xpath, timeout=20):
    print(f"Attempting to click on DIV block: {description}")
    try:
        # Ensure the DIV block is visible
        xpath_element = (By.XPATH, xpath)
        located_div_block = WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located(xpath_element)
        )
        driver.execute_script("arguments[0].scrollIntoView();", located_div_block)

        # Ensure the DIV block is clickable
        clickable_div_block = WebDriverWait(driver, timeout).until(
            EC.element_to_be_clickable(located_div_block)
        )

        # Click
        driver.execute_script("arguments[0].click();", clickable_div_block)
        print(f"DIV block '{description}' clicked successfully.")
    except Exception as e:
        driver.quit()
        print(f"Error clicking on DIV block '{description}': {e}")
        raise Exception(f"DIV block '{description}' not found: {e}.")

def click_first_button_in_div(driver, description, xpath, timeout=20):
    print(f"Attempting to click first button in DIV block: {description}")
    try:
        # Ensure the DIV block is visible
        xpath_element = (By.XPATH, xpath)
        located_div_block = WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located(xpath_element)
        )
        driver.execute_script("arguments[0].scrollIntoView();", located_div_block)

        # Find the first button inside the DIV block
        first_button = located_div_block.find_element(By.TAG_NAME, "button")

        # Ensure the button is clickable
        clickable_button = WebDriverWait(driver, timeout).until(
            EC.element_to_be_clickable(first_button)
        )

        # Click
        driver.execute_script("arguments[0].click();", clickable_button)
        print(f"First button in DIV block '{description}' clicked successfully.")
    except Exception as e:
        driver.quit()
        print(f"Error clicking first button in DIV block '{description}': {e}")
        raise Exception(f"First button in DIV block '{description}' not found: {e}.")

def wait_for_loader_to_disappear(driver, timeout=20):
    print("Waiting for the loader to disappear")
    try:
        loader_xpath = "//div[contains(@class, 'r-loader')]"
        WebDriverWait(driver, timeout).until(
            EC.invisibility_of_element_located((By.XPATH, loader_xpath))
        )
        print("Loader disappeared, proceeding with click.")
    except Exception as e:
        print(f"Error while waiting for loader: {e}")
        raise


def extract_text(driver, xpath, description, timeout=10):
    print(f"Attempting to extract text from: {description}")
    try:
        element = WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.XPATH, xpath))
        )
        text = element.text.strip()
        print(f"Text extracted from '{description}': {text[:100]}...")
        return text
    except Exception as e:
        print(f"Error extracting text from '{description}': {e}")
        return None

def parse_dates_and_prices(text):
    print("Parsing dates and prices from extracted text...")

    # Map month names to numbers
    months_map = {
        'sty': '01', 'lut': '02', 'mar': '03', 'kwi': '04',
        'maj': '05', 'cze': '06', 'lip': '07', 'sie': '08',
        'wrz': '09', 'paź': '10', 'lis': '11', 'gru': '12'
    }

    # Extract year information from month headers
    year_headers = {}
    header_pattern = r"(Październik|Listopad|Grudzień|Styczeń|Luty|Marzec|Kwiecień|Maj|Czerwiec|Lipiec|Sierpień|Wrzesień)\s+(\d{4})"
    header_matches = re.finditer(header_pattern, text, re.IGNORECASE)

    for match in header_matches:
        month_name = match.group(1).lower()
        year = match.group(2)

        # Map Polish month names to abbreviated forms
        month_mapping = {
            'październik': 'paź', 'listopad': 'lis', 'grudzień': 'gru',
            'styczeń': 'sty', 'luty': 'lut', 'marzec': 'mar',
            'kwiecień': 'kwi', 'maj': 'maj', 'czerwiec': 'cze',
            'lipiec': 'lip', 'sierpień': 'sie', 'wrzesień': 'wrz'
        }

        if month_name in month_mapping:
            abbrev_month = month_mapping[month_name]
            year_headers[abbrev_month] = year
            print(f"Found year mapping: {abbrev_month} -> {year}")

    parsed_data = []

    def get_year_for_month(month_abbrev, fallback_year="2025"):
        """Get year for a month, with fallback logic"""
        if month_abbrev in year_headers:
            return year_headers[month_abbrev]

        # Fallback logic: if we have any year info, try to infer
        if year_headers:
            available_years = list(set(year_headers.values()))
            # If we have both 2025 and 2026, assume earlier months are 2025, later are 2026
            if len(available_years) > 1:
                month_order = ['sty', 'lut', 'mar', 'kwi', 'maj', 'cze',
                              'lip', 'sie', 'wrz', 'paź', 'lis', 'gru']
                if month_abbrev in month_order:
                    month_index = month_order.index(month_abbrev)
                    # Assume Oct-Dec are current year, Jan-Sep are next year if we have multiple years
                    if month_index <= 8:  # Jan-Sep
                        return max(available_years)
                    else:  # Oct-Dec
                        return min(available_years)

        return fallback_year

    # Pattern 1: "22 paź - 03 lis" (full format with two months)
    regex1 = r"(\d{1,2})\s+(\w{3})\s+-\s+(\d{1,2})\s+(\w{3}).*?(\d{1,3}(?:\s?\d{3})*)\s*zł"
    matches1 = re.finditer(regex1, text, re.DOTALL | re.IGNORECASE)

    for match in matches1:
        start_day = match.group(1).zfill(2)
        start_month_name = match.group(2).lower()
        end_day = match.group(3).zfill(2)
        end_month_name = match.group(4).lower()
        price = match.group(5).replace(" ", "")

        start_month = months_map.get(start_month_name, "??")
        end_month = months_map.get(end_month_name, "??")

        if start_month != "??" and end_month != "??":
            start_year = get_year_for_month(start_month_name)
            end_year = get_year_for_month(end_month_name)

            date_range = f"{start_day}.{start_month}.{start_year} - {end_day}.{end_month}.{end_year}"
            parsed_data.append((date_range, price))
        else:
            print(f"Unknown month: {start_month_name} or {end_month_name}")

    # Pattern 2: "03 - 15 gru" (format with one month at the end)
    regex2 = r"(\d{1,2})\s+-\s+(\d{1,2})\s+(\w{3}).*?(\d{1,3}(?:\s?\d{3})*)\s*zł"
    matches2 = re.finditer(regex2, text, re.DOTALL | re.IGNORECASE)

    for match in matches2:
        start_day = match.group(1).zfill(2)
        end_day = match.group(2).zfill(2)
        month_name = match.group(3).lower()
        price = match.group(4).replace(" ", "")

        month = months_map.get(month_name, "??")

        if month != "??":
            year = get_year_for_month(month_name)
            date_range = f"{start_day}.{month}.{year} - {end_day}.{month}.{year}"
            parsed_data.append((date_range, price))
        else:
            print(f"Unknown month: {month_name}")

    # Pattern 3: "25 gru 2025 - 01 sty" (format with explicit year)
    regex3 = r"(\d{1,2})\s+(\w{3})\s+(\d{4})\s+-\s+(\d{1,2})\s+(\w{3}).*?(\d{1,3}(?:\s?\d{3})*)\s*zł"
    matches3 = re.finditer(regex3, text, re.DOTALL | re.IGNORECASE)

    for match in matches3:
        start_day = match.group(1).zfill(2)
        start_month_name = match.group(2).lower()
        start_year = match.group(3)
        end_day = match.group(4).zfill(2)
        end_month_name = match.group(5).lower()
        price = match.group(6).replace(" ", "")

        start_month = months_map.get(start_month_name, "??")
        end_month = months_map.get(end_month_name, "??")

        if start_month != "??" and end_month != "??":
            # For end year, if it's January and start is December, it's next year
            if end_month_name == 'sty' and start_month_name == 'gru':
                end_year = str(int(start_year) + 1)
            else:
                end_year = get_year_for_month(end_month_name, start_year)

            date_range = f"{start_day}.{start_month}.{start_year} - {end_day}.{end_month}.{end_year}"
            parsed_data.append((date_range, price))
        else:
            print(f"Unknown month: {start_month_name} or {end_month_name}")

    # Remove duplicates (preserve order)
    seen = set()
    unique_data = []
    for item in parsed_data:
        if item not in seen:
            seen.add(item)
            unique_data.append(item)

    print(f"Parsed data: {unique_data}")
    return unique_data

def get_dates_and_prices(url, departure_from):
    print(f"Opening URL: {url}")
    driver = configure_driver()
    driver.get(url)

    WebDriverWait(driver, 20).until(EC.presence_of_element_located((By.TAG_NAME, 'body')))

    print("Waiting for page to load...")
    click_button(driver, "Akceptuj wszystkie", "//button[contains(., 'Akceptuj wszystkie')]")


    click_button(driver, "Miejsce wylotu", "//button[@data-test-id='r-select-button:kartaHotelu-konfigurator:polaczenie']")
    click_first_button_in_div(driver, f"Miejsce wylotu: {departure_from}", f"//div[contains(., '{departure_from}') and contains(@data-test-id, 'r-component:pojedyncze-polaczenie:container')]")
    wait_for_loader_to_disappear(driver)

    click_button(driver, "Termin", "//button[contains(@class, 'r-select-button-termin')]")
    click_div(driver, "Lista", "//div[contains(@class, 'kh-tooltip-termin__list-types')]")

    print("Extracting text...")
    date_list_xpath = "//div[contains(@class, 'kh-terminy-list')]"
    date_list_text = extract_text(driver, date_list_xpath, "Departure dates list")

    driver.quit()

    if date_list_text:
        return parse_dates_and_prices(date_list_text)
    return []