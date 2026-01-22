import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface YieldPool {
  chain: string;
  project: string;
  symbol: string;
  tvlUsd: number;
  apy: number;
  apyBase: number | null;
  apyReward: number | null;
  pool: string;
  rewardTokens: string[] | null;
  underlyingTokens: string[] | null;
  poolMeta: string | null;
}

interface ProcessedYield {
  project: string;
  symbol: string;
  pool: string;
  apy: number;
  apyBase: number | null;
  apyReward: number | null;
  tvlUsd: number;
  category: 'stable' | 'structured' | 'degen';
  poolMeta: string | null;
}

function categorizePool(project: string, symbol: string): 'stable' | 'structured' | 'degen' {
  const projectLower = project.toLowerCase();
  const symbolLower = symbol.toLowerCase();
  
  // Stable: Lending protocols with simple deposit
  if (projectLower.includes('venus') || 
      projectLower.includes('lista') || 
      projectLower.includes('kinza') ||
      projectLower.includes('radiant') ||
      projectLower.includes('aave')) {
    return 'stable';
  }
  
  // Structured: Tranchess, structured products
  if (projectLower.includes('tranchess') || 
      projectLower.includes('alpaca') ||
      symbolLower.includes('bishop') ||
      symbolLower.includes('queen')) {
    return 'structured';
  }
  
  // Degen: DEX LPs, high volatility
  if (projectLower.includes('pancakeswap') || 
      projectLower.includes('thena') ||
      projectLower.includes('aster') ||
      projectLower.includes('biswap') ||
      symbolLower.includes('lp') ||
      symbolLower.includes('-')) {
    return 'degen';
  }
  
  return 'stable';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching BSC yields from DefiLlama...');
    
    const response = await fetch('https://yields.llama.fi/pools');
    
    if (!response.ok) {
      throw new Error(`DefiLlama API error: ${response.status}`);
    }
    
    const json = await response.json();
    const pools: YieldPool[] = json.data;
    
    console.log(`Total pools fetched: ${pools.length}`);
    
    // Filter for BSC chain and BNB-related symbols
    const bnbSymbols = ['bnb', 'wbnb', 'vbnb', 'slisbnb', 'asbnb', 'abnbc', 'bnbx', 'ankrbnb', 'stkbnb'];
    
    const bscPools = pools.filter(pool => {
      if (pool.chain !== 'BSC') return false;
      if (pool.tvlUsd < 100000) return false; // Filter out small pools (>$100k)
      
      const symbolLower = pool.symbol.toLowerCase();
      return bnbSymbols.some(s => symbolLower.includes(s));
    });
    
    console.log(`BSC BNB-related pools: ${bscPools.length}`);
    
    // Process and categorize pools
    const processedPools: ProcessedYield[] = bscPools.map(pool => ({
      project: pool.project,
      symbol: pool.symbol,
      pool: pool.pool,
      apy: pool.apy || 0,
      apyBase: pool.apyBase,
      apyReward: pool.apyReward,
      tvlUsd: pool.tvlUsd,
      category: categorizePool(pool.project, pool.symbol),
      poolMeta: pool.poolMeta,
    }));
    
    // Sort by APY descending
    processedPools.sort((a, b) => b.apy - a.apy);
    
    // Group by category
    const stable = processedPools.filter(p => p.category === 'stable').slice(0, 8);
    const structured = processedPools.filter(p => p.category === 'structured').slice(0, 8);
    const degen = processedPools.filter(p => p.category === 'degen').slice(0, 8);
    
    // Get top yields for summary
    const topYield = processedPools.length > 0 ? processedPools[0] : null;
    const avgStableApy = stable.length > 0 
      ? stable.reduce((sum, p) => sum + p.apy, 0) / stable.length 
      : 0;
    
    return new Response(JSON.stringify({
      pools: {
        stable,
        structured,
        degen,
      },
      summary: {
        totalPools: processedPools.length,
        topYield: topYield ? { project: topYield.project, symbol: topYield.symbol, apy: topYield.apy } : null,
        avgStableApy,
      },
      lastUpdated: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error fetching BSC yields:', errorMessage);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      pools: { stable: [], structured: [], degen: [] },
      summary: { totalPools: 0, topYield: null, avgStableApy: 0 },
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
