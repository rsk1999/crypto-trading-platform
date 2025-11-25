from fastapi import APIRouter
from pydantic import BaseModel
import sys
sys.path.append('..')
from services.alert_service import load_alerts, add_alert, remove_alert, check_alerts

router = APIRouter()

class AlertRequest(BaseModel):
    coin: str
    target_price: float
    condition: str  # "above" or "below"
    alert_type: str = "price"
    base_price: float = None

@router.get("/")
def get_alerts():
    """Get all price alerts"""
    alerts = load_alerts()
    return {"success": True, "data": alerts}

@router.post("/add")
def create_alert(alert: AlertRequest):
    """Add a new price alert"""
    add_alert(
        alert.coin,
        alert.target_price,
        alert.condition,
        alert.alert_type,
        alert.base_price
    )
    return {"success": True, "message": "Alert added"}

@router.delete("/{index}")
def delete_alert(index: int):
    """Remove an alert"""
    remove_alert(index)
    return {"success": True, "message": "Alert removed"}

@router.get("/check")
def check_price_alerts(prices: dict):
    """Check if any alerts are triggered"""
    triggered = check_alerts(prices)
    return {"success": True, "data": triggered}
