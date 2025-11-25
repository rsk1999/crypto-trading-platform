from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import prices, market, portfolio, trades, news, alerts, chat, backtest, whale
from dotenv import load_dotenv
import uvicorn
import os

load_dotenv()
app = FastAPI(title="Crypto Trading API", version="1.0.0")

# Get allowed origins from environment or use defaults
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,  # Configurable origins
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],  # Specific methods only
    allow_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Include routers
app.include_router(prices.router, prefix="/api/prices", tags=["prices"])
app.include_router(market.router, prefix="/api/market", tags=["market"])
app.include_router(portfolio.router, prefix="/api/portfolio", tags=["portfolio"])
app.include_router(trades.router, prefix="/api/trades", tags=["trades"])
app.include_router(news.router, prefix="/api/news", tags=["news"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(backtest.router, prefix="/api/backtest", tags=["backtest"])
app.include_router(whale.router, prefix="/api/whale", tags=["whale"])

@app.get("/")
def root():
    return {"message": "Crypto Trading API", "status": "running"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
