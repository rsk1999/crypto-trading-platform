import json
import os
from collections import defaultdict

PORTFOLIO_FILE = os.path.join("data", "portfolio.json")

def load_portfolio():
    """Load portfolio transactions from JSON file."""
    if not os.path.exists(PORTFOLIO_FILE):
        return []
    try:
        with open(PORTFOLIO_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return []

def save_portfolio(transactions):
    """Save portfolio transactions to JSON file."""
    os.makedirs(os.path.dirname(PORTFOLIO_FILE), exist_ok=True)
    with open(PORTFOLIO_FILE, "w") as f:
        json.dump(transactions, f, indent=4)

def add_transaction(coin_id, amount, price_per_coin):
    """
    Add a new transaction.
    coin_id: str (e.g., 'bitcoin')
    amount: float (positive for buy, negative for sell)
    price_per_coin: float (price in USD at time of trade)
    """
    transactions = load_portfolio()
    transaction = {
        "coin_id": coin_id,
        "amount": float(amount),
        "price": float(price_per_coin),
    }
    transactions.append(transaction)
    save_portfolio(transactions)

def get_portfolio_summary(current_prices):
    """
    Calculate summary for each coin based on transactions and current prices.
    """
    transactions = load_portfolio()
    summary = defaultdict(lambda: {"amount": 0.0, "total_cost": 0.0})
    
    # Aggregate transactions
    for t in transactions:
        cid = t["coin_id"]
        amt = t["amount"]
        price = t["price"]
        
        summary[cid]["amount"] += amt
        if amt > 0:
            summary[cid]["total_cost"] += amt * price
            
    # Calculate PnL
    results = {}
    for cid, data in summary.items():
        if data["amount"] <= 0:
            continue
            
        avg_price = data["total_cost"] / data["amount"]
        current_price = current_prices.get(cid, {}).get("usd", 0)
        current_value = data["amount"] * current_price
        pnl = current_value - data["total_cost"]
        pnl_percent = (pnl / data["total_cost"] * 100) if data["total_cost"] > 0 else 0
        
        results[cid] = {
            "amount": data["amount"],
            "avg_price": avg_price,
            "current_value": current_value,
            "pnl": pnl,
            "pnl_percent": pnl_percent
        }
    
    return results

def calculate_sharpe_ratio():
    """Calculate Sharpe Ratio from trade history."""
    from services.trade_service import get_wallet
    wallet = get_wallet()
    trades = wallet.get("history", [])
    
    if len(trades) < 2:
        return 0.0
    
    returns = []
    for trade in trades:
        if trade["side"] == "SELL":
            pnl_percent = (trade["price"] - trade.get("buy_price", trade["price"])) / trade.get("buy_price", trade["price"]) * 100
            returns.append(pnl_percent)
    
    if not returns:
        return 0.0
    
    import statistics
    avg_return = statistics.mean(returns)
    std_dev = statistics.stdev(returns) if len(returns) > 1 else 1
    
    sharpe = avg_return / std_dev if std_dev > 0 else 0
    return round(sharpe, 2)

def calculate_max_drawdown():
    """Calculate maximum drawdown from portfolio history."""
    from services.trade_service import get_wallet
    wallet = get_wallet()
    
    balance = 10000
    peak = balance
    max_dd = 0
    
    for trade in wallet.get("history", []):
        if trade["side"] == "BUY":
            balance -= trade["total"]
        else:
            balance += trade["total"]
        
        if balance > peak:
            peak = balance
        
        drawdown = (peak - balance) / peak * 100 if peak > 0 else 0
        max_dd = max(max_dd, drawdown)
    
    return round(max_dd, 2)

def calculate_win_rate():
    """Calculate win rate from trade history."""
    from services.trade_service import get_wallet
    wallet = get_wallet()
    trades = wallet.get("history", [])
    
    if not trades:
        return 0.0
    
    wins = 0
    total_sells = 0
    
    for trade in trades:
        if trade["side"] == "SELL":
            total_sells += 1
            if trade.get("profit", 0) > 0:
                wins += 1
    
    if total_sells == 0:
        return 0.0
    
    return round((wins / total_sells) * 100, 2)

def get_rebalancing_suggestions(summary):
    """Analyze portfolio and suggest rebalancing."""
    if not summary:
        return "No holdings to analyze."
    
    total_value = sum(data["current_value"] for data in summary.values())
    
    if total_value == 0:
        return "No holdings to analyze."
    
    suggestions = []
    
    for coin, data in summary.items():
        percentage = (data["current_value"] / total_value) * 100
        if percentage > 70:
            suggestions.append(f"⚠️ High concentration: {percentage:.1f}% in {coin.upper()}. Consider diversifying.")
        elif percentage > 50:
            suggestions.append(f"💡 Moderate concentration: {percentage:.1f}% in {coin.upper()}.")
    
    if not suggestions:
        suggestions.append("✅ Portfolio is well-diversified!")
    
    return " | ".join(suggestions)
