import requests
import numpy as np
from sklearn.ensemble import RandomForestRegressor
import time
import os
import json

# === CONFIGURATION ===
# Default key (can be overridden)
DEFAULT_API_KEY = "CG-S948XtBvbjRux8WKePfdqDed" 
API_KEY_FILE = os.path.join("data", "api_key.txt")

def get_api_key():
    """Load API key from file or return default."""
    if os.path.exists(API_KEY_FILE):
        try:
            with open(API_KEY_FILE, "r") as f:
                key = f.read().strip()
                if key:
                    return key
        except:
            pass
    return DEFAULT_API_KEY

def set_api_key(key):
    """Save API key to file."""
    os.makedirs(os.path.dirname(API_KEY_FILE), exist_ok=True)
    with open(API_KEY_FILE, "w") as f:
        f.write(key.strip())

HEADERS = {"x-cg-pro-api-key": get_api_key()}

# Watchlist coins with their correct CoinGecko IDs
WATCHED_COINS = ["bitcoin", "ethereum", "pepe"]

# Cache file for coin list
COIN_LIST_CACHE_FILE = os.path.join("data", "coin_list_cache.json")
CACHE_EXPIRY_SECONDS = 86400  # 24 hours

def get_coin_list():
    """Fetch the full coin list from CoinGecko with local caching."""
    # Check cache first
    if os.path.exists(COIN_LIST_CACHE_FILE):
        try:
            with open(COIN_LIST_CACHE_FILE, "r") as f:
                data = json.load(f)
                if time.time() - data["timestamp"] < CACHE_EXPIRY_SECONDS:
                    return data["coins"]
        except (json.JSONDecodeError, IOError):
            pass # Ignore cache errors and fetch fresh

    url = "https://api.coingecko.com/api/v3/coins/list"
    try:
        resp = requests.get(url, timeout=10)
        
        if resp.status_code == 429:
            print("Rate limit hit for coin list. Using fallback/cache if available.")
            if os.path.exists(COIN_LIST_CACHE_FILE):
                 with open(COIN_LIST_CACHE_FILE, "r") as f:
                    return json.load(f).get("coins", [])
            return []

        resp.raise_for_status()
        coins = resp.json()
        
        # Save to cache
        os.makedirs(os.path.dirname(COIN_LIST_CACHE_FILE), exist_ok=True)
        with open(COIN_LIST_CACHE_FILE, "w") as f:
            json.dump({"timestamp": time.time(), "coins": coins}, f)
            
        return coins
    except Exception as e:
        print(f"Error fetching coin list: {e}")
        # Fallback to cache if error
        if os.path.exists(COIN_LIST_CACHE_FILE):
             with open(COIN_LIST_CACHE_FILE, "r") as f:
                return json.load(f).get("coins", [])
        return []


def validate_coin_id(coin_id):
    """Validate if a coin_id exists on CoinGecko."""
    coin_list = get_coin_list()
    if not coin_list:
        # If we can't fetch the list, assume the ID is valid to avoid blocking the app
        # This is a fallback for when the API is down/rate-limited and we have no cache
        return True 
        
    for coin in coin_list:
        if coin["id"].lower() == coin_id.lower():
            return True
    return False


def get_prices(coin_ids=WATCHED_COINS, vs_currency="usd"):
    """
    Fetch current prices for the given coins from CoinGecko Pro API.

    Returns a dict {coin_id: {"usd": price}, ...}
    """
    # Validate coin IDs before calling
    # Optimization: Skip validation if we are sure, or handle 404s gracefully
    # valid_ids = [cid for cid in coin_ids if validate_coin_id(cid)]
    valid_ids = coin_ids # Trust the input for now to save API calls
    
    if not valid_ids:
        print("No valid coins found to fetch prices.")
        return {}

    url = "https://api.coingecko.com/api/v3/simple/price"
    params = {
        "ids": ",".join(valid_ids),
        "vs_currencies": vs_currency
    }
    try:
        resp = requests.get(url, headers=HEADERS, params=params, timeout=10)
        if resp.status_code == 429:
            print("Rate limit hit fetching prices.")
            return {}
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching current prices: {e}")
        return {}


def get_historical_prices(coin_id="pepe", vs_currency="usd", days=30):
    """
    Fetch historical prices for coin_id over the past `days` days.

    Returns list of [timestamp_in_ms, price].
    """
    # Check cache
    cache_file = os.path.join("data", f"history_{coin_id}_{days}.json")
    if os.path.exists(cache_file):
        try:
            with open(cache_file, "r") as f:
                data = json.load(f)
                # Cache valid for 1 hour (3600 seconds)
                if time.time() - data["timestamp"] < 3600:
                    return data["prices"]
        except:
            pass

    # Validate coin_id before calling (skip if cached list check failed to save time, but good to keep if needed)
    # if not validate_coin_id(coin_id): ... (Skipping validation to save API calls)

    url = f"https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart"
    params = {
        "vs_currency": vs_currency,
        "days": days
    }
    try:
        resp = requests.get(url, headers=HEADERS, params=params, timeout=10)
        if resp.status_code == 429:
             print(f"Rate limit hit for {coin_id} history. Using old cache if available.")
             if os.path.exists(cache_file):
                 with open(cache_file, "r") as f:
                    return json.load(f).get("prices", [])
             return []
             
        resp.raise_for_status()
        data = resp.json()
        prices = data.get("prices", [])
        
        # Save to cache
        os.makedirs(os.path.dirname(cache_file), exist_ok=True)
        with open(cache_file, "w") as f:
            json.dump({"timestamp": time.time(), "prices": prices}, f)
            
        return prices
    except requests.exceptions.RequestException as e:
        print(f"Error fetching historical prices for {coin_id}: {e}")
        # Fallback
        if os.path.exists(cache_file):
             with open(cache_file, "r") as f:
                return json.load(f).get("prices", [])
        return []


def prepare_pepe_dataset(price_series, window=24):
    """
    Prepare features and labels for ML training from price series.

    price_series: list of [timestamp, price]
    window: number of past points to use as features.

    Returns:
        X: np.array shape (samples, window)
        y: np.array shape (samples,)
    """
    X, y = [], []
    prices_only = [price for _, price in price_series]
    for i in range(len(prices_only) - window - 1):
        X.append(prices_only[i:i + window])
        y.append(prices_only[i + window])
    return np.array(X), np.array(y)


def train_pepe_model(price_history, window=24):
    """
    Train RandomForestRegressor model on PEPE price history.

    Returns model or None if insufficient data.
    """
    X, y = prepare_pepe_dataset(price_history, window)
    if len(X) < 10:
        print("Not enough data to train the PEPE model.")
        return None
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X, y)
    return model


def predict_next_price(model, recent_prices, window=24):
    """
    Predict next price using the model based on recent_prices.

    recent_prices: list/array of last `window` prices.
    Returns predicted price or None.
    """
    if model is None or len(recent_prices) < window:
        return None
    x_input = np.array(recent_prices[-window:]).reshape(1, -1)
    return model.predict(x_input)[0]


def generate_signal(current_price, predicted_price, buy_threshold=0.02, sell_threshold=0.02):
    """
    Generate BUY, SELL or HOLD signal comparing predicted and current price.

    buy_threshold and sell_threshold are relative price change thresholds.
    """
    if predicted_price is None:
        return "HOLD (no prediction)"
    change = (predicted_price - current_price) / current_price
    if change >= buy_threshold:
        return "BUY"
    elif change <= -sell_threshold:
        return "SELL"
    else:
        return "HOLD"


def get_pepe_signal():
    """
    Fetch PEPE historical data, train model, predict next price,
    and generate buy/sell/hold signal.

    Returns (current_price, predicted_price, signal_str)
    """
    coin_id = "pepe"  # Use the exact CoinGecko ID for PEPE
    price_history = get_historical_prices(coin_id, "usd", 30)
    if not price_history or len(price_history) < 30:
        print("Insufficient price history data for PEPE.")
        return None, None, "No data"

    model = train_pepe_model(price_history, window=24)
    current_price = price_history[-1][1]
    recent_prices = [p for _, p in price_history[-24:]]
    predicted_price = predict_next_price(model, recent_prices, window=24)
    signal = generate_signal(current_price, predicted_price)
    return current_price, predicted_price, signal


if __name__ == "__main__":
    # Example standalone run
    prices = get_prices()
    print("Current prices:", prices)

    current, predicted, signal = get_pepe_signal()
    print(f"PEPE Current Price: {current}")
    print(f"PEPE Predicted Next Price: {predicted}")
    print(f"Trade Signal: {signal}")
