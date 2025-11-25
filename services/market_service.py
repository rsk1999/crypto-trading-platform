import requests

def get_fear_greed_index():
    """
    Fetch Fear & Greed Index from Alternative.me API.
    Returns: {'value': 50, 'classification': 'Neutral'}
    """
    url = "https://api.alternative.me/fng/"
    try:
        resp = requests.get(url, timeout=5)
        resp.raise_for_status()
        data = resp.json()
        
        if data.get("data") and len(data["data"]) > 0:
            latest = data["data"][0]
            return {
                "value": int(latest.get("value", 50)),
                "classification": latest.get("value_classification", "Neutral")
            }
    except Exception as e:
        print(f"Error fetching Fear & Greed Index: {e}")
    
    return {"value": 50, "classification": "Neutral"}

def get_top_coins(limit=10):
    """
    Fetch top coins by 24h volume from Binance.
    Returns list of dicts with symbol, price, change_24h
    """
    url = "https://api.binance.com/api/v3/ticker/24hr"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        # Filter USDT pairs only
        usdt_pairs = [item for item in data if item["symbol"].endswith("USDT")]
        
        # Sort by quote volume (trading volume in USDT)
        sorted_coins = sorted(usdt_pairs, key=lambda x: float(x.get("quoteVolume", 0)), reverse=True)
        
        top_coins = []
        for coin in sorted_coins[:limit]:
            symbol = coin["symbol"].replace("USDT", "")
            top_coins.append({
                "symbol": symbol,
                "price": float(coin["lastPrice"]),
                "change_24h": float(coin["priceChangePercent"]),
                "volume": float(coin["quoteVolume"])
            })
        
        return top_coins
    except Exception as e:
        print(f"Error fetching top coins: {e}")
        return []

def get_gainers_losers(limit=5):
    """
    Get top gainers and losers in last 24h.
    Returns: {'gainers': [...], 'losers': [...]}
    """
    url = "https://api.binance.com/api/v3/ticker/24hr"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        # Filter USDT pairs with reasonable volume
        usdt_pairs = [item for item in data if item["symbol"].endswith("USDT") and float(item.get("quoteVolume", 0)) > 1000000]
        
        # Sort by price change
        sorted_by_change = sorted(usdt_pairs, key=lambda x: float(x.get("priceChangePercent", 0)), reverse=True)
        
        gainers = []
        for coin in sorted_by_change[:limit]:
            symbol = coin["symbol"].replace("USDT", "")
            gainers.append({
                "symbol": symbol,
                "price": float(coin["lastPrice"]),
                "change_24h": float(coin["priceChangePercent"])
            })
        
        losers = []
        for coin in sorted_by_change[-limit:]:
            symbol = coin["symbol"].replace("USDT", "")
            losers.append({
                "symbol": symbol,
                "price": float(coin["lastPrice"]),
                "change_24h": float(coin["priceChangePercent"])
            })
        
        return {"gainers": gainers, "losers": list(reversed(losers))}
    except Exception as e:
        print(f"Error fetching gainers/losers: {e}")
        return {"gainers": [], "losers": []}
