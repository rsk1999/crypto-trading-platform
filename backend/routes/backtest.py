from fastapi import APIRouter
from pydantic import BaseModel
from services.backtesting_service import run_backtest

router = APIRouter()

class BacktestRequest(BaseModel):
    coin: str
    strategy: str  # 'sma_crossover' or 'rsi'
    params: dict
    days: int = 30

@router.post("/run")
def backtest(request: BacktestRequest):
    """Run strategy backtest"""
    result = run_backtest(
        coin=request.coin,
        strategy=request.strategy,
        params=request.params,
        days=request.days
    )
    
    return {
        "success": result.get('success', False),
        "data": result
    }
