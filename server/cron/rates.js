// Mock exchange rate sync
// In a real app, use axios to fetch from OpenExchangeRates or Fixer.io

export const syncExchangeRates = async () => {
    console.log('Syncing exchange rates...');
    
    // Mock data
    const rates = {
        USD: 1,
        LKR: 305.50,
        EUR: 0.92,
        GBP: 0.79
    };

    // Store in memory or Redis
    global.exchangeRates = rates;
    
    console.log('Exchange rates updated (Mock). LKR:', rates.LKR);
};