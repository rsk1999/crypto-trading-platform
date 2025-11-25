import json
import os
import time

TRADE_FILE = os.path.join("data", "paper_trading.json")
INITIAL_BALANCE = 10000.0

def load_account():
    """Load paper trading account data."""
    if not os.path.exists(TRADE_FILE):
        return reset_account()
    try:
        with open(TRADE_FILE, "r") as f:
            return json.load(f)
    except:
        return reset_account()

def save_account(data):
    """Save paper trading account data."""
    os.makedirs(os.path.dirname(TRADE_FILE), exist_ok=True)
    with open(TRADE_FILE, "w") as f:
        json.dump(data, f, indent=4)

def reset_account():
    """Reset account to initial state."""
    data = {
        "usd_balance": INITIAL_BALANCE,
        "holdings": {}, # coin_id: amount
        "history": []   # List of trades
    }
    save_account(data)
    return data

def get_wallet():
    """Get current wallet status."""
    return load_account()

def execute_trade(side, coin_id, amount, price):
    """
    Execute a paper trade.
    side: 'buy' or 'sell'
    coin_id: str
    amount: float
    price: float (current price per coin)
    
    Returns: (success: bool, message: str)
    """
    account = load_account()
    total_cost = amount * price
    
    if side.lower() == "buy":
        if account["usd_balance"] >= total_cost:
            account["usd_balance"] -= total_cost
            current_holding = account["holdings"].get(coin_id, 0.0)
            account["holdings"][coin_id] = current_holding + amount
            
            # Record trade
            account["history"].append({
                "timestamp": time.time(),
                "side": "BUY",
                "coin": coin_id,
                "amount": amount,
                "price": price,
                "total": total_cost
            })
            save_account(account)
            return True, f"Bought {amount} {coin_id} for ${total_cost:.2f}"
        else:
            return False, "Insufficient USD balance."
            
    elif side.lower() == "sell":
        current_holding = account["holdings"].get(coin_id, 0.0)
        if current_holding >= amount:
            account["holdings"][coin_id] = current_holding - amount
            account["usd_balance"] += total_cost
            
            # Record trade
            account["history"].append({
                "timestamp": time.time(),
                "side": "SELL",
                "coin": coin_id,
                "amount": amount,
                "price": price,
                "total": total_cost
            })
            save_account(account)
            return True, f"Sold {amount} {coin_id} for ${total_cost:.2f}"
        else:
            return False, f"Insufficient {coin_id} balance."
            
    return False, "Invalid trade side."
