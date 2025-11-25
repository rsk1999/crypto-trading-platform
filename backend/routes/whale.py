from fastapi import APIRouter
import sys
sys.path.append('..')
from services.whale_service import get_whale_transactions, format_whale_message

router = APIRouter()

@router.get("/transactions")
def get_transactions(limit: int = 10):
    """Get recent large crypto transactions"""
    transactions = get_whale_transactions(limit)
    
    # Add formatted message to each transaction
    for tx in transactions:
        tx['message'] = format_whale_message(tx)
        
    return {"success": True, "data": transactions}
