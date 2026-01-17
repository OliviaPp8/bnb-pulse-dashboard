import { createHmac } from "node:crypto";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BinanceFlexibleProduct {
  asset: string;
  latestAnnualPercentageRate: string;
  tierAnnualPercentageRate: Record<string, string>;
  minPurchaseAmount: string;
  status: string;
  canPurchase: boolean;
}

interface BinanceLockedProduct {
  asset: string;
  rewardAsset: string;
  duration: number;
  apr: string;
  minPurchaseAmount: string;
  status: string;
  canPurchase: boolean;
}

interface CachedData {
  flexible: any[];
  locked: any[];
  timestamp: number;
}

// In-memory cache (15 minutes TTL)
let cache: CachedData | null = null;
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

function generateSignature(queryString: string, secret: string): string {
  const hmac = createHmac('sha256', secret);
  hmac.update(queryString);
  return hmac.digest('hex');
}

async function fetchBinanceAPI(endpoint: string, params: Record<string, string> = {}): Promise<any> {
  const apiKey = Deno.env.get('BINANCE_API_KEY');
  const apiSecret = Deno.env.get('BINANCE_API_SECRET');

  if (!apiKey || !apiSecret) {
    throw new Error('Binance API credentials not configured');
  }

  const timestamp = Date.now().toString();
  const queryParams = new URLSearchParams({
    ...params,
    timestamp,
  });

  const signature = generateSignature(queryParams.toString(), apiSecret);
  queryParams.append('signature', signature);

  const url = `https://api.binance.com${endpoint}?${queryParams.toString()}`;
  
  console.log(`Fetching Binance API: ${endpoint}`);
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'X-MBX-APIKEY': apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Binance API error: ${response.status} - ${errorText}`);
    throw new Error(`Binance API error: ${response.status}`);
  }

  return response.json();
}

async function getFlexibleProducts(): Promise<any[]> {
  try {
    // Using Simple Earn Flexible list endpoint
    const data = await fetchBinanceAPI('/sapi/v1/simple-earn/flexible/list', {
      asset: 'BNB',
      size: '100',
    });
    
    console.log(`Fetched ${data.rows?.length || 0} flexible products`);
    
    return (data.rows || []).map((product: BinanceFlexibleProduct) => ({
      asset: product.asset,
      apr: parseFloat(product.latestAnnualPercentageRate) * 100,
      tierRates: product.tierAnnualPercentageRate,
      minAmount: product.minPurchaseAmount,
      productType: 'flexible',
      status: product.status,
      canPurchase: product.canPurchase,
    }));
  } catch (error) {
    console.error('Error fetching flexible products:', error);
    return [];
  }
}

async function getLockedProducts(): Promise<any[]> {
  try {
    // Using Simple Earn Locked list endpoint
    const data = await fetchBinanceAPI('/sapi/v1/simple-earn/locked/list', {
      asset: 'BNB',
      size: '100',
    });
    
    console.log(`Fetched ${data.rows?.length || 0} locked products`);
    
    return (data.rows || []).map((product: BinanceLockedProduct) => ({
      asset: product.asset,
      rewardAsset: product.rewardAsset,
      apr: parseFloat(product.apr) * 100,
      duration: product.duration,
      minAmount: product.minPurchaseAmount,
      productType: 'locked',
      status: product.status,
      canPurchase: product.canPurchase,
    }));
  } catch (error) {
    console.error('Error fetching locked products:', error);
    return [];
  }
}

async function fetchYieldData(): Promise<CachedData> {
  // Check cache
  if (cache && (Date.now() - cache.timestamp) < CACHE_TTL) {
    console.log('Returning cached data');
    return cache;
  }

  console.log('Fetching fresh data from Binance');
  
  const [flexible, locked] = await Promise.all([
    getFlexibleProducts(),
    getLockedProducts(),
  ]);

  cache = {
    flexible,
    locked,
    timestamp: Date.now(),
  };

  return cache;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('binance-yields function called');
    
    const data = await fetchYieldData();
    
    // Format response for frontend consumption
    const response = {
      flexible: data.flexible,
      locked: data.locked,
      lastUpdated: new Date(data.timestamp).toISOString(),
      cached: (Date.now() - data.timestamp) > 1000, // Was this from cache?
    };

    console.log('Returning yield data:', {
      flexibleCount: data.flexible.length,
      lockedCount: data.locked.length,
      cached: response.cached,
    });

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Error in binance-yields function:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch yield data';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        flexible: [],
        locked: [],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
