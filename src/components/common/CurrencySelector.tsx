import React, { useEffect, useState } from 'react';
import { getExchangeRates } from '../../services/publicService';
import { Globe } from 'lucide-react';

// This component is mainly visual/stored state for now.
// In a full implementation, this state would be in a Context (e.g., ThemeContext or a new CurrencyContext)
// and used by a `PriceDisplay` component to convert values on the fly.

const CurrencySelector: React.FC = () => {
  const [rates, setRates] = useState<any>({});
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'LKR');

  useEffect(() => {
    getExchangeRates().then(res => setRates(res.data)).catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newCurrency = e.target.value;
      setCurrency(newCurrency);
      localStorage.setItem('currency', newCurrency);
      // In a real app, dispatch to context here to trigger re-render of prices
      window.location.reload(); // Temporary hack to refresh prices if logic was implemented globally
  };

  return (
    <div className="flex items-center text-sm">
       <Globe size={16} className="text-gray-500 mr-1"/>
       <select 
         value={currency} 
         onChange={handleChange}
         className="bg-transparent border-none focus:ring-0 text-gray-600 font-medium cursor-pointer text-xs"
       >
         <option value="LKR">LKR (Rs)</option>
         <option value="USD">USD ($)</option>
         <option value="EUR">EUR (€)</option>
         <option value="GBP">GBP (£)</option>
       </select>
    </div>
  );
};

export default CurrencySelector;