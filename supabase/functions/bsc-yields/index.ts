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
  
  // Structured: Tranchess all products, Alpaca
  if (projectLower.includes('tranchess') || 
      projectLower.includes('alpaca') ||
      symbolLower.includes('bishop') ||
      symbolLower.includes('queen') ||
      symbolLower.includes('rook')) {
    return 'structured';
  }
  
  // Stable: Lending protocols with simple deposit
  if (projectLower.includes('venus') || 
      projectLower.includes('lista') || 
      projectLower.includes('kinza') ||
      projectLower.includes('radiant') ||
      projectLower.includes('aave')) {
    return 'stable';
  }
  
  // Degen: DEX LPs, Aster, high volatility
  if (projectLower.includes('pancakeswap') || 
      projectLower.includes('thena') ||
      projectLower.includes('aster') ||
      projectLower.includes('astherus') ||
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
    
    // Filter for BSC chain - ONLY BNB-related symbols (strict filtering)
    // Include BNB derivatives, LSDs, and Tranchess products (which are all BNB-backed)
    const bnbSymbols = ['bnb', 'wbnb', 'vbnb', 'slisbnb', 'asbnb', 'abnbc', 'bnbx', 'ankrbnb', 'stkbnb', 'queen', 'bishop', 'rook'];
    
    // Exclude stablecoins and non-BNB tokens explicitly
    const excludedSymbols = ['usdt', 'usdc', 'busd', 'dai', 'tusd', 'frax', 'lusd', 'usdp', 'usdd', 'fdusd', 'btc', 'eth', 'weth', 'btcb', 'cake', 'xvs', 'the', 'alpaca', 'bsw'];
    
    // Debug: Log all Aster and Tranchess pools on BSC
    const debugPools = pools.filter((p: YieldPool) => 
      p.chain === 'BSC' && 
      (p.project.toLowerCase().includes('aster') || 
       p.project.toLowerCase().includes('astherus') ||
       p.project.toLowerCase().includes('tranchess'))
    );
    console.log(`Aster/Tranchess pools found: ${debugPools.length}`);
    if (debugPools.length > 0) {
      console.log('Sample Aster/Tranchess pools:', debugPools.slice(0, 5).map(p => ({ project: p.project, symbol: p.symbol, tvl: p.tvlUsd, apy: p.apy })));
    }
    
    const bscPools = pools.filter((pool: YieldPool) => {
      if (pool.chain !== 'BSC') return false;
      if (pool.tvlUsd < 100000) return false; // Filter out small pools (>$100k)
      
      const symbolLower = pool.symbol.toLowerCase();
      
      // Exclude non-BNB tokens (stablecoins, BTC, ETH, governance tokens)
      if (excludedSymbols.some(s => symbolLower === s || symbolLower.startsWith(s + '-') || symbolLower.endsWith('-' + s))) {
        return false;
      }
      
      // Must contain BNB-related symbol
      const matchesBnb = bnbSymbols.some(s => symbolLower.includes(s));
      
      return matchesBnb;
    });
    
    console.log(`BSC filtered pools: ${bscPools.length}`);
    
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
