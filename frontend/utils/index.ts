// In any component where you need exchange rates:
function getExchangeRate(currencyCode: string): number | null {
  try {
    const storedRates = sessionStorage.getItem("exchangeRates");
    
    if (storedRates) {
      const rates = JSON.parse(storedRates);
      return rates[currencyCode] || null;
    }
    return null;
  } catch (error) {
    console.error("Error retrieving exchange rate:", error);
    return null;
  }
}

function convertToUSD(amount: number, currencyCode: string): number | null {
  const rate = getExchangeRate(currencyCode);
  if (rate === null) return null;
  
  return amount / rate;
}


function convertFromUSD(amount: number, currencyCode: string): number | null {
  const rate = getExchangeRate(currencyCode);
  if (rate === null) return null;
  
  return amount * rate;
}
