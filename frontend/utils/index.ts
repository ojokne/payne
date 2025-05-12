// In any component where you need exchange rates:
export function getExchangeRate(currencyCode: string): number | null {
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

export function convertToUSD(amount: number, currencyCode: string): number | null {
  const rate = getExchangeRate(currencyCode);
  if (rate === null) return null;
  
  return amount / rate;
}


export function convertFromUSD(amount: number, currencyCode: string): number | null {
  const rate = getExchangeRate(currencyCode);
  if (rate === null) return null;
  
  return amount * rate;
}

// Add this function to get the USDC rate
export function getUsdcRate(): number {
  try {
    const storedRate = sessionStorage.getItem("usdcRate");
    if (storedRate) {
      return parseFloat(storedRate);
    }
    return 1; // Default to 1:1 if rate not available
  } catch (error) {
    console.error("Error retrieving USDC rate:", error);
    return 1; // Safe default
  }
}

// Convert any currency to USDC
export function convertToUsdc(amount: number, currencyCode: string): number | null {
  // First convert to USD
  const usdAmount = convertToUSD(amount, currencyCode);
  if (usdAmount === null) return null;
  
  // Then apply the USDC rate (divide by USDC rate to get USDC amount)
  const usdcRate = getUsdcRate();
  return usdAmount / usdcRate;
}

// Convert from USDC to any currency
export function convertFromUsdc(amount: number, currencyCode: string): number | null {
  // First convert USDC to USD
  const usdcRate = getUsdcRate();
  const usdAmount = amount * usdcRate;
  
  // Then convert USD to the target currency
  return convertFromUSD(usdAmount, currencyCode);
}
