import requests

BASE_URL = "https://api.binance.com/api/v3"

COIN_MAPPING = {
    "bitcoin": "BTCUSDT",
    "ethereum": "ETHUSDT",
    "pepe": "PEPEUSDT",
    "solana": "SOLUSDT",
    "ripple": "XRPUSDT",
    "dogecoin": "DOGEUSDT",
    "cardano": "ADAUSDT",
    "polkadot": "DOTUSDT"
}

def get_binance_klines(coin_id, interval="1h", limit=100):
    """
    Fetch Kline (Candlestick) data from Binance.
    Returns list of [time, open, high, low, close, volume]
    """
    # Try to get symbol from mapping, otherwise assume it's already a symbol
    symbol = COIN_MAPPING.get(coin_id)
    if not symbol:
        # Check if it looks like a symbol (uppercase)
        if coin_id.isupper():
            symbol = coin_id
        else:
            print(f"No Binance symbol for {coin_id}")
            return []
        
    url = f"{BASE_URL}/klines"
    params = {
        "symbol": symbol,
        "interval": interval,
        "limit": limit
    }
    
    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        # Return raw data: [Open Time, Open, High, Low, Close, Volume, ...]
        # This is standard format expected by most consumers
        return data
        
    except requests.exceptions.RequestException as e:
        print(f"Error fetching Binance klines for {symbol}: {e}")
        return []

def get_binance_prices(coins=None):
    """
    Fetch current prices for specified coins from Binance.
    Returns dict: {'bitcoin': {'usd': 95000}, ...}
    """
    if coins is None:
        coins = ["bitcoin", "ethereum", "pepe", "solana", "ripple", "dogecoin", "cardano", "polkadot"]
        
    results = {}
    for coin in coins:
        symbol = COIN_MAPPING.get(coin)
        if not symbol:
            continue
            
        url = f"{BASE_URL}/ticker/price"
        params = {"symbol": symbol}
        
        try:
            resp = requests.get(url, params=params, timeout=5)
            resp.raise_for_status()
            data = resp.json()
            price = float(data["price"])
            results[coin] = {"usd": price}
        except Exception as e:
            print(f"Error fetching Binance price for {coin}: {e}")
            
    return results
