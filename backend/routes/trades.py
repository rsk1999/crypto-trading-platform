from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, validator
import sys
sys.path.append('..')
from services.trade_service import execute_trade

router = APIRouter()

class TradeRequest(BaseModel):
    coin: str
    side: str  # "buy" or "sell"
    amount: float
    price: float
    
    @validator('side')
    def validate_side(cls, v):
        if v.lower() not in ['buy', 'sell']:
            raise ValueError('side must be "buy" or "sell"')
        return v.lower()
    
    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('amount must be greater than 0')
        if v > 1000000:  # Reasonable limit
            raise ValueError('amount too large')
        return v
    
    @validator('price')
    def validate_price(cls, v):
        if v <= 0:
            raise ValueError('price must be greater than 0')
        return v

@router.post("/execute")
def execute_order(trade: TradeRequest):
    """Execute a paper trade"""
    try:
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
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
