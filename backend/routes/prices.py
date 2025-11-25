from fastapi import APIRouter
import sys
sys.path.append('..')
from services.binance_service import get_binance_prices, get_binance_klines

router = APIRouter()

@router.get("/current")
def get_current_prices(coins: str = "bitcoin,ethereum,solana,pepe"):
    """Get current prices for specified coins"""
    coin_list = coins.split(",")
    prices = get_binance_prices(coin_list)
    return {"success": True, "data": prices}

@router.get("/historical/{coin}")
def get_historical_prices(coin: str, interval: str = "1h", limit: int = 100):
    """Get historical candlestick data"""
    klines = get_binance_klines(coin, interval, limit)
    return {"success": True, "data": klines}
