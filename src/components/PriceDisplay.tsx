import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface PriceData {
  price: number;
  priceChange24h: number;
  priceChangePercent24h: number;
  high24h: number;
  low24h: number;
}

// BNB ATH was $1375
const BNB_ATH = 1375;

export function PriceDisplay() {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPrice = async () => {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BNBUSDT');
      const data = await response.json();
      
      setPriceData({
        price: parseFloat(data.lastPrice),
        priceChange24h: parseFloat(data.priceChange),
        priceChangePercent24h: parseFloat(data.priceChangePercent),
        high24h: parseFloat(data.highPrice),
        low24h: parseFloat(data.lowPrice),
      });
    } catch (error) {
      console.error('Failed to fetch BNB price:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading || !priceData) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <div className="h-4 w-20 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  const isPositive = priceData.priceChangePercent24h >= 0;
  const athDiff = ((priceData.price - BNB_ATH) / BNB_ATH) * 100;

  return (
    <div className="flex items-center gap-4 text-sm">
      {/* Current Price */}
      <div className="flex items-center gap-1.5">
        <span className="font-bold text-primary text-lg">
          ${priceData.price.toFixed(2)}
        </span>
      </div>

      {/* 24h Change */}
      <div className={`flex items-center gap-1 ${isPositive ? 'text-success' : 'text-destructive'}`}>
        {isPositive ? (
          <TrendingUp className="h-3.5 w-3.5" />
        ) : (
          <TrendingDown className="h-3.5 w-3.5" />
        )}
        <span className="font-medium">
          {isPositive ? '+' : ''}{priceData.priceChangePercent24h.toFixed(2)}%
        </span>
      </div>

      {/* ATH */}
      <div className="hidden items-center gap-1.5 text-muted-foreground md:flex">
        <span className="text-xs">ATH</span>
        <span className="font-medium">${BNB_ATH}</span>
        <span className={`text-xs ${athDiff >= 0 ? 'text-success' : 'text-destructive'}`}>
          ({athDiff >= 0 ? '+' : ''}{athDiff.toFixed(1)}%)
        </span>
      </div>
    </div>
  );
}
