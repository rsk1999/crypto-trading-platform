import requests
from datetime import datetime, timedelta

def calculate_what_if(coin, amount_usd, days_ago):
    """
    Calculate what an investment would be worth today.
    
    Args:
        coin: Coin ID (e.g., 'bitcoin')
        amount_usd: Investment amount in USD
        days_ago: How many days ago the investment was made
    
    Returns:
        dict with current_value, profit, percent_return
    """
    from services.binance_service import COIN_MAPPING, get_binance_prices
    
    symbol = COIN_MAPPING.get(coin)
    if not symbol:
        return None
    
    # Get current price
    current_prices = get_binance_prices([coin])
    if not current_prices or coin not in current_prices:
        return None
    
    current_price = current_prices[coin]["usd"]
    
    # Get historical price from Binance
    url = "https://api.binance.com/api/v3/klines"
    
    # Calculate timestamp for X days ago
    end_time = int((datetime.now() - timedelta(days=days_ago)).timestamp() * 1000)
    
    params = {
        "symbol": symbol,
        "interval": "1d",
        "startTime": end_time,
        "limit": 1
    }
    
    try:
        resp = requests.get(url, params=params, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        if not data:
            return None
        
        # Get opening price from that day
        historical_price = float(data[0][1])  # Open price
        
        # Calculate returns
        coins_bought = amount_usd / historical_price
        current_value = coins_bought * current_price
        profit = current_value - amount_usd
        percent_return = (profit / amount_usd) * 100
        
        return {
            "coin": coin,
            "investment": amount_usd,
            "days_ago": days_ago,
            "historical_price": historical_price,
            "current_price": current_price,
            "coins_bought": coins_bought,
            "current_value": current_value,
            "profit": profit,
            "percent_return": percent_return
        }
    except Exception as e:
        print(f"Error calculating what-if: {e}")
        return None
