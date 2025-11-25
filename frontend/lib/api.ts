import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
});

export const pricesAPI = {
    getCurrent: (coins: string) => api.get(`/prices/current?coins=${coins}`),
    getHistorical: (coin: string, interval = '1h') =>
        api.get(`/prices/historical/${coin}?interval=${interval}`),
};

export const marketAPI = {
    getFearGreed: () => api.get('/market/fear-greed'),
    getTopCoins: () => api.get('/market/top-coins'),
    getGainersLosers: () => api.get('/market/gainers-losers'),
};

export const portfolioAPI = {
    get: () => api.get('/portfolio'),
};

export const tradesAPI = {
    execute: (data: any) => api.post('/trades/execute', data),
};

export const newsAPI = {
    get: () => api.get('/news'),
};

export const alertsAPI = {
    get: () => api.get('/alerts'),
    add: (data: any) => api.post('/alerts/add', data),
    delete: (index: number) => api.delete(`/alerts/${index}`),
};

export const chatAPI = {
    sendMessage: (message: string) => api.post('/chat/chat', { message }),
};

export const backtestAPI = {
    run: (data: any) => api.post('/backtest/run', data),
};

export const whaleAPI = {
    getTransactions: (limit = 10) => api.get(`/whale/transactions?limit=${limit}`),
};

export default api;
