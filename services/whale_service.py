import requests
import time
from datetime import datetime

def get_whale_transactions(limit=10):
    """
    Fetch recent large crypto transactions from Binance (Real Data).
    Returns list of dicts with transaction details.
    """
    # We will check these major pairs for large trades
    pairs = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT']
    
    all_trades = []
    
    for symbol in pairs:
        try:
            # Get recent aggregate trades
            url = "https://api.binance.com/api/v3/aggTrades"
            params = {
                "symbol": symbol,
                "limit": 50  # Get last 50 trades to filter
            }
            
            resp = requests.get(url, params=params, timeout=5)
            if resp.status_code == 200:
                trades = resp.json()
                
                for trade in trades:
                    price = float(trade['p'])
                    quantity = float(trade['q'])
                    amount_usd = price * quantity
                    
                    # Filter for "Whale" transactions (> $50,000 for demo, usually $1M+)
                    # Lower threshold slightly to ensure we see some activity for the user
                    if amount_usd > 50000: 
                        all_trades.append({
                            "symbol": symbol.replace("USDT", ""),
                            "amount": quantity,
                            "amount_usd": amount_usd,
                            "from_owner": "Binance User", # Anonymous on Binance
                            "to_owner": "Binance User",
                            "timestamp": int(trade['T'] / 1000),
                            "is_buyer_maker": trade['m'] # True means sell, False means buy
                        })
                        
        except Exception as e:
            print(f"Error fetching trades for {symbol}: {e}")
            continue
            
    # Sort by time descending
    all_trades.sort(key=lambda x: x['timestamp'], reverse=True)
    
    return all_trades[:limit]

def format_whale_message(tx):
    """Format whale transaction for display."""
    from datetime import datetime
    
    # Calculate time ago
    now = datetime.now()
    tx_time = datetime.fromtimestamp(tx["timestamp"])
    diff = now - tx_time
    
    if diff.seconds < 60:
        time_ago = "just now"
    elif diff.seconds < 3600:
        time_ago = f"{diff.seconds // 60}m ago"
    else:
        time_ago = f"{diff.seconds // 3600}h ago"
    
    # Format amount
    amount_str = f"{tx['amount']:,.2f}"
    usd_str = f"${tx['amount_usd']/1000:.1f}K"
    if tx['amount_usd'] >= 1000000:
        usd_str = f"${tx['amount_usd']/1000000:.2f}M"
    
    action = "SOLD" if tx['is_buyer_maker'] else "BOUGHT"
    emoji = "🔴" if tx['is_buyer_maker'] else "🟢"
    
    return f"{emoji} {action} {amount_str} {tx['symbol']} ({usd_str}) • {time_ago}"
