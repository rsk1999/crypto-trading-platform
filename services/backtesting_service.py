"""
Strategy Backtesting Service
Tests trading strategies on historical data
"""
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from services.binance_service import get_binance_klines

def calculate_sma(prices, period):
    """Calculate Simple Moving Average"""
    return pd.Series(prices).rolling(window=period).mean().tolist()

def calculate_rsi(prices, period=14):
    """Calculate Relative Strength Index"""
    prices_series = pd.Series(prices)
    delta = prices_series.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    rs = gain / loss
    rsi = 100 - (100 / (1 + rs))
    return rsi.tolist()

def sma_crossover_strategy(data, short_period=10, long_period=30):
    """
    SMA Crossover Strategy
    Buy when short MA crosses above long MA
    Sell when short MA crosses below long MA
    """
    closes = [float(k[4]) for k in data]  # Close prices
    short_sma = calculate_sma(closes, short_period)
    long_sma = calculate_sma(closes, long_period)
    
    trades = []
    position = None
    
    for i in range(long_period, len(data)):
        timestamp = data[i][0]
        price = closes[i]
        
        # Buy signal: short MA crosses above long MA
        if short_sma[i] > long_sma[i] and short_sma[i-1] <= long_sma[i-1]:
            if position is None:
                position = {
                    'type': 'buy',
                    'price': price,
                    'timestamp': timestamp
                }
                trades.append({
                    'action': 'BUY',
                    'price': price,
                    'timestamp': timestamp,
                    'reason': f'SMA({short_period}) crossed above SMA({long_period})'
                })
        
        # Sell signal: short MA crosses below long MA
        elif short_sma[i] < long_sma[i] and short_sma[i-1] >= long_sma[i-1]:
            if position is not None:
                profit = price - position['price']
                profit_pct = (profit / position['price']) * 100
                trades.append({
                    'action': 'SELL',
                    'price': price,
                    'timestamp': timestamp,
                    'profit': profit,
                    'profit_pct': profit_pct,
                    'reason': f'SMA({short_period}) crossed below SMA({long_period})'
                })
                position = None
    
    return trades, short_sma, long_sma

def rsi_strategy(data, rsi_period=14, oversold=30, overbought=70):
    """
    RSI Strategy
    Buy when RSI < oversold (default 30)
    Sell when RSI > overbought (default 70)
    """
    closes = [float(k[4]) for k in data]
    rsi = calculate_rsi(closes, rsi_period)
    
    trades = []
    position = None
    
    for i in range(rsi_period + 1, len(data)):
        timestamp = data[i][0]
        price = closes[i]
        rsi_value = rsi[i]
        
        # Buy signal: RSI crosses below oversold
        if rsi_value < oversold and position is None:
            position = {
                'type': 'buy',
                'price': price,
                'timestamp': timestamp
            }
            trades.append({
                'action': 'BUY',
                'price': price,
                'timestamp': timestamp,
                'rsi': rsi_value,
                'reason': f'RSI({rsi_value:.1f}) below {oversold} (oversold)'
            })
        
        # Sell signal: RSI crosses above overbought
        elif rsi_value > overbought and position is not None:
            profit = price - position['price']
            profit_pct = (profit / position['price']) * 100
            trades.append({
                'action': 'SELL',
                'price': price,
                'timestamp': timestamp,
                'rsi': rsi_value,
                'profit': profit,
                'profit_pct': profit_pct,
                'reason': f'RSI({rsi_value:.1f}) above {overbought} (overbought)'
            })
            position = None
    
    return trades, rsi

def calculate_metrics(trades, initial_capital=10000):
    """Calculate performance metrics from trades"""
    if not trades:
        return {
            'total_trades': 0,
            'profitable_trades': 0,
            'losing_trades': 0,
            'win_rate': 0,
            'total_profit': 0,
            'total_profit_pct': 0,
            'avg_profit': 0,
            'max_profit': 0,
            'max_loss': 0
        }
    
    sell_trades = [t for t in trades if t['action'] == 'SELL']
    
    total_trades = len(sell_trades)
    profitable = [t for t in sell_trades if t.get('profit', 0) > 0]
    losing = [t for t in sell_trades if t.get('profit', 0) <= 0]
    
    total_profit = sum(t.get('profit', 0) for t in sell_trades)
    total_profit_pct = sum(t.get('profit_pct', 0) for t in sell_trades)
    
    return {
        'total_trades': total_trades,
        'profitable_trades': len(profitable),
        'losing_trades': len(losing),
        'win_rate': (len(profitable) / total_trades * 100) if total_trades > 0 else 0,
        'total_profit': total_profit,
        'total_profit_pct': total_profit_pct,
        'avg_profit': total_profit / total_trades if total_trades > 0 else 0,
        'max_profit': max((t.get('profit', 0) for t in sell_trades), default=0),
        'max_loss': min((t.get('profit', 0) for t in sell_trades), default=0),
        'final_capital': initial_capital + total_profit
    }

def run_backtest(coin, strategy, params, days=30):
    """
    Run backtest on historical data
    
    Args:
        coin: Cryptocurrency symbol (bitcoin, ethereum, etc.)
        strategy: Strategy name ('sma_crossover' or 'rsi')
        params: Strategy parameters
        days: Number of days of historical data
    """
    # Map coin names to Binance symbols
    symbol_map = {
        'bitcoin': 'BTCUSDT',
        'ethereum': 'ETHUSDT',
        'solana': 'SOLUSDT',
        'pepe': 'PEPEUSDT'
    }
    
    symbol = symbol_map.get(coin, 'BTCUSDT')
    
    # Fetch historical data
    data = get_binance_klines(symbol, interval='1h', limit=days * 24)
    
    if not data:
        return {'error': 'Failed to fetch historical data'}
    
    # Run strategy
    if strategy == 'sma_crossover':
        short_period = params.get('short_period', 10)
        long_period = params.get('long_period', 30)
        trades, short_sma, long_sma = sma_crossover_strategy(data, short_period, long_period)
        indicators = {'short_sma': short_sma, 'long_sma': long_sma}
    elif strategy == 'rsi':
        rsi_period = params.get('rsi_period', 14)
        oversold = params.get('oversold', 30)
        overbought = params.get('overbought', 70)
        trades, rsi = rsi_strategy(data, rsi_period, oversold, overbought)
        indicators = {'rsi': rsi}
    else:
        return {'error': 'Unknown strategy'}
    
    # Calculate metrics
    metrics = calculate_metrics(trades)
    
    # Prepare chart data
    chart_data = []
    for i, k in enumerate(data):
        point = {
            'timestamp': k[0],
            'price': float(k[4]),
            'volume': float(k[5])
        }
        
        # Helper to handle NaN and Infinity
        def safe_float(val):
            if pd.isna(val) or np.isnan(val) or np.isinf(val):
                return None
            return float(val)

        if strategy == 'sma_crossover' and i < len(short_sma):
            point['short_sma'] = safe_float(short_sma[i])
            point['long_sma'] = safe_float(long_sma[i])
        elif strategy == 'rsi' and i < len(rsi):
            point['rsi'] = safe_float(rsi[i])
            
        chart_data.append(point)
    
    # Sanitize indicators for JSON response
    sanitized_indicators = {}
    for k, v in indicators.items():
        sanitized_indicators[k] = [None if (pd.isna(x) or np.isnan(x) or np.isinf(x)) else float(x) for x in v]

    return {
        'success': True,
        'strategy': strategy,
        'params': params,
        'trades': trades,
        'metrics': metrics,
        'chart_data': chart_data[-100:],  # Last 100 points for chart
        'indicators': sanitized_indicators
    }
