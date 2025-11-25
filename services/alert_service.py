import json
import os

ALERTS_FILE = os.path.join("data", "alerts.json")

def load_alerts():
    """Load alerts from file."""
    if not os.path.exists(ALERTS_FILE):
        return []
    try:
        with open(ALERTS_FILE, "r") as f:
            return json.load(f)
    except:
        return []

def save_alerts(alerts):
    """Save alerts to file."""
    os.makedirs(os.path.dirname(ALERTS_FILE), exist_ok=True)
    with open(ALERTS_FILE, "w") as f:
        json.dump(alerts, f, indent=4)

def add_alert(coin, target_price, condition, alert_type="price", base_price=None):
    """
    Add a new alert.
    alert_type: 'price', 'percentage'
    condition: 'above' or 'below'
    base_price: For percentage alerts, the reference price
    """
    alerts = load_alerts()
    alerts.append({
        "coin": coin,
        "target_price": target_price,
        "condition": condition,
        "alert_type": alert_type,
        "base_price": base_price,
        "triggered": False
    })
    save_alerts(alerts)

def remove_alert(index):
    """Remove alert by index."""
    alerts = load_alerts()
    if 0 <= index < len(alerts):
        alerts.pop(index)
        save_alerts(alerts)

def check_alerts(current_prices):
    """
    Check if any alerts should be triggered.
    Returns list of triggered alert messages.
    """
    alerts = load_alerts()
    triggered = []
    
    for i, alert in enumerate(alerts):
        if alert.get("triggered"):
            continue
            
        coin = alert["coin"]
        target = alert["target_price"]
        condition = alert["condition"]
        alert_type = alert.get("alert_type", "price")
        
        if coin not in current_prices:
            continue
            
        current_price = current_prices[coin]["usd"]
        
        should_trigger = False
        message = ""
        
        if alert_type == "price":
            if condition == "above" and current_price >= target:
                should_trigger = True
                message = f"{coin.upper()} is now ${current_price:.2f} (Target: ${target:.2f})"
            elif condition == "below" and current_price <= target:
                should_trigger = True
                message = f"{coin.upper()} is now ${current_price:.2f} (Target: ${target:.2f})"
        
        elif alert_type == "percentage":
            base_price = alert.get("base_price", current_price)
            percent_change = ((current_price - base_price) / base_price) * 100
            
            if condition == "above" and percent_change >= target:
                should_trigger = True
                message = f"{coin.upper()} up {percent_change:.2f}% (Target: +{target}%)"
            elif condition == "below" and percent_change <= -target:
                should_trigger = True
                message = f"{coin.upper()} down {abs(percent_change):.2f}% (Target: -{target}%)"
        
        if should_trigger:
            triggered.append(message)
            alert["triggered"] = True
    
    if triggered:
        save_alerts(alerts)
    
    return triggered
