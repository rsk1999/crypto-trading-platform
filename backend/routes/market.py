from fastapi import APIRouter
import sys
sys.path.append('..')
from services.market_service import get_fear_greed_index, get_top_coins, get_gainers_losers
from services.whale_service import get_whale_transactions

router = APIRouter()

@router.get("/fear-greed")
def get_fear_greed():
    """Get Fear & Greed Index"""
    data = get_fear_greed_index()
    return {"success": True, "data": data}

@router.get("/top-coins")
def get_top(limit: int = 10):
    """Get top coins by volume"""
    coins = get_top_coins(limit)
    return {"success": True, "data": coins}

@router.get("/gainers-losers")
def get_movers(limit: int = 5):
    """Get top gainers and losers"""
    data = get_gainers_losers(limit)
    return {"success": True, "data": data}

@router.get("/whale-alerts")
def get_whales(limit: int = 5):
    """Get whale transaction alerts"""
    transactions = get_whale_transactions(limit)
    return {"success": True, "data": transactions}
