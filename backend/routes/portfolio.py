from fastapi import APIRouter
import sys
sys.path.append('..')
from services.trade_service import get_wallet
from services.portfolio_service import (
    calculate_sharpe_ratio, calculate_max_drawdown, 
    calculate_win_rate, get_rebalancing_suggestions
)
from services.binance_service import get_binance_prices

router = APIRouter()

@router.get("/")
def get_portfolio():
    """Get complete portfolio data"""
    wallet = get_wallet()
    holdings = wallet.get("holdings", {})
    history = wallet.get("history", [])
    
    # Get current prices
    coins = [c for c in holdings.keys() if holdings[c] > 0]
    prices = get_binance_prices(coins) if coins else {}
    
    # Calculate portfolio value
    portfolio_data = {}
    for coin, amount in holdings.items():
        if amount > 0:
            current_price = prices.get(coin, {}).get("usd", 0)
            portfolio_data[coin] = {
                "amount": amount,
                "current_price": current_price,
                "current_value": amount * current_price
            }
    
    # Calculate metrics
    metrics = {
        "sharpe_ratio": calculate_sharpe_ratio() if history else 0,
        "max_drawdown": calculate_max_drawdown() if history else 0,
        "win_rate": calculate_win_rate() if history else 0
    }
    
    # Get suggestions
    suggestions = get_rebalancing_suggestions(
        {k: {"current_value": v["current_value"]} for k, v in portfolio_data.items()}
    )
    
    return {
        "success": True,
        "data": {
            "balance": wallet.get("usd_balance", 0),
            "holdings": portfolio_data,
            "metrics": metrics,
            "suggestions": suggestions,
            "history": history
        }
    }
