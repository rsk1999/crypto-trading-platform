import requests
from textblob import TextBlob

def get_crypto_news(limit=20):
    """
    Fetch latest crypto news from CryptoCompare.
    Returns a list of dicts: {'title', 'url', 'source', 'body', 'sentiment'}
    """
    url = f"https://min-api.cryptocompare.com/data/v2/news/?lang=EN"
    try:
        resp = requests.get(url, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        
        news_items = []
        raw_data = data.get("Data", [])
        
        # Handle both list and dict responses
        if isinstance(raw_data, dict):
            raw_data = []
        
        for item in raw_data[:limit]:
            try:
                title = item.get("title", "")
                body = item.get("body", "")
                
                # Analyze sentiment
                sentiment_score, sentiment_label = analyze_sentiment(title + " " + body)
                
                news_items.append({
                    "title": title,
                    "url": item.get("url", ""),
                    "source": item.get("source_info", {}).get("name", "Unknown") if isinstance(item.get("source_info"), dict) else "Unknown",
                    "body": body,
                    "sentiment_score": sentiment_score,
                    "sentiment_label": sentiment_label
                })
            except Exception as e:
                print(f"Error processing news item: {e}")
                continue
                
        return news_items
    except Exception as e:
        print(f"Error fetching news: {e}")
        return []

def analyze_sentiment(text):
    """
    Analyze text sentiment using TextBlob.
    Returns (polarity, label)
    """
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    
    if polarity > 0.1:
        return polarity, "Bullish"
    elif polarity < -0.1:
        return polarity, "Bearish"
    else:
        return polarity, "Neutral"
