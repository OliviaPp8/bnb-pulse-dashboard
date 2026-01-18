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
  projectId: string;
  detail: {
    asset: string;
    rewardAsset: string;
    duration: number;
    apr: string;
    status: string;
    extraRewardAPR?: string;
  };
  quota: {
    totalPersonalQuota: string;
    minimum: string;
  };
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
    let errorDetails = { code: 0, msg: errorText };
    try {
      errorDetails = JSON.parse(errorText);
    } catch {
      // Keep raw text if not JSON
    }
    console.error(`Binance API error: ${response.status}`, {
      code: errorDetails.code,
      msg: errorDetails.msg,
      endpoint: endpoint,
      hasApiKey: !!apiKey,
      hasApiSecret: !!apiSecret,
      timestamp,
    });
    throw new Error(`Binance API error (${errorDetails.code}): ${errorDetails.msg}`);
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
    
    // Log raw data for debugging
    if (data.rows?.[0]) {
      console.log('Raw flexible product:', JSON.stringify(data.rows[0]));
    }
    
    return (data.rows || []).map((product: BinanceFlexibleProduct) => {
      // latestAnnualPercentageRate is in decimal format (e.g., 0.0015 = 0.15%)
      const rawRate = parseFloat(product.latestAnnualPercentageRate);
      const apr = rawRate * 100;  // Convert to percentage
      
      console.log(`BNB Flexible APR: raw=${rawRate}, apr=${apr}%`);
      
      return {
        asset: product.asset,
        apr: apr,
        tierRates: product.tierAnnualPercentageRate,
        minAmount: product.minPurchaseAmount,
        productType: 'flexible',
        status: product.status,
        canPurchase: product.canPurchase,
      };
    });
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
    
    // Log raw data for debugging
    if (data.rows?.[0]) {
      console.log('Raw locked product:', JSON.stringify(data.rows[0]));
    }
    
    return (data.rows || []).map((product: BinanceLockedProduct) => {
      // APR is inside detail object, in decimal format (e.g., 0.0032 = 0.32%)
      const rawRate = parseFloat(product.detail?.apr || '0');
      const apr = rawRate * 100;  // Convert to percentage
      
      console.log(`BNB Locked APR: duration=${product.detail?.duration}, raw=${rawRate}, apr=${apr}%`);
      
      return {
        asset: product.detail?.asset || 'BNB',
        rewardAsset: product.detail?.rewardAsset,
        apr: apr,
        duration: product.detail?.duration,
        minAmount: product.quota?.minimum,
        productType: 'locked',
        status: product.detail?.status,
      };
    });
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
