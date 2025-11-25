from fastapi import APIRouter
from pydantic import BaseModel
import sys
sys.path.append('..')
from services.trade_service import execute_trade

router = APIRouter()

class TradeRequest(BaseModel):
    coin: str
    side: str  # "buy" or "sell"
    amount: float
    price: float

@router.post("/execute")
def execute_order(trade: TradeRequest):
    """Execute a paper trade"""
    success, message = execute_trade(
        trade.side, 
        trade.coin, 
        trade.amount, 
        trade.price
    )
    return {
        "success": success,
        "message": message
    }
