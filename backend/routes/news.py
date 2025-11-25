from fastapi import APIRouter
import sys
sys.path.append('..')
from services.news_service import get_crypto_news

router = APIRouter()

@router.get("/")
def get_news():
    """Get crypto news with sentiment"""
    news = get_crypto_news()
    return {"success": True, "data": news}
