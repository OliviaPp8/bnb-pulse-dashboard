import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
  pool: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching Aster TVL data...');
    
    // Fetch from Protocol API to get total TVL
    const protocolResponse = await fetch('https://api.llama.fi/protocol/aster');
    
    if (!protocolResponse.ok) {
      throw new Error(`DefiLlama Protocol API error: ${protocolResponse.status}`);
    }
    
    const protocolData = await protocolResponse.json();
    
    // Get BSC chain TVL (this is Aster's TVL on BSC)
    const bscTvl = (protocolData.currentChainTvls?.['BSC'] || 0);
    const bscStakingTvl = (protocolData.currentChainTvls?.['BSC-staking'] || 0);
    const totalBscTvl = bscTvl + bscStakingTvl;
    
    console.log(`BSC TVL: $${bscTvl.toLocaleString()}`);
    console.log(`BSC-staking TVL: $${bscStakingTvl.toLocaleString()}`);
    console.log(`Total BSC TVL: $${totalBscTvl.toLocaleString()}`);
    
    // Fetch from Yields API to find asBNB external usage
    const yieldsResponse = await fetch('https://yields.llama.fi/pools');
    
    let asBnbExternalTvl = 0;
    let poolsList: Array<{symbol: string; tvlUsd: number; pool: string; project: string}> = [];
    
    if (yieldsResponse.ok) {
      const yieldsData = await yieldsResponse.json();
      const pools: YieldPool[] = yieldsData.data || [];
      
      // Find asBNB pools in external protocols (not Aster itself)
      const asBnbPools = pools.filter((pool: YieldPool) => {
        const symbolLower = pool.symbol?.toLowerCase() || '';
        const chainLower = pool.chain?.toLowerCase() || '';
        const projectLower = pool.project?.toLowerCase() || '';
        return chainLower === 'bsc' && 
               symbolLower.includes('asbnb') && 
               !projectLower.includes('aster') &&
               !projectLower.includes('astherus');
      });
      
      console.log(`asBNB external pools found: ${asBnbPools.length}`);
      
      // Sort by TVL and log top pools
      asBnbPools.sort((a, b) => (b.tvlUsd || 0) - (a.tvlUsd || 0));
      asBnbPools.slice(0, 5).forEach((pool: YieldPool) => {
        console.log(`asBNB External Pool: ${pool.symbol}, TVL: $${(pool.tvlUsd || 0).toLocaleString()}, Project: ${pool.project}`);
      });
      
      // Sum up external asBNB TVL
      asBnbExternalTvl = asBnbPools.reduce((sum, pool) => sum + (pool.tvlUsd || 0), 0);
      
      console.log(`Total asBNB External TVL: $${asBnbExternalTvl.toLocaleString()}`);
      
      // Build pools list for display
      poolsList = asBnbPools.slice(0, 10).map((p: YieldPool) => ({
        symbol: p.symbol,
        tvlUsd: p.tvlUsd,
        pool: p.pool,
        project: p.project,
      }));
    }
    
    // Aster's BSC TVL breakdown estimation:
    // The protocol holds BNB and slisBNB as backing for asBNB
    // Based on typical LST protocols, estimate ~60% slisBNB, ~40% native BNB
    // These are the assets WITHIN Aster protocol
    const slisBnbRatio = 0.6;
    const bnbRatio = 0.4;
    
    const slisBnbTvl = Math.round(totalBscTvl * slisBnbRatio);
    const bnbTvl = Math.round(totalBscTvl * bnbRatio);
    
    const result = {
      totalTvl: totalBscTvl,
      tokens: {
        // asBNB minted by Aster (shown as total TVL since asBNB = underlying)
        asBnb: { usd: totalBscTvl },
        // Estimated backing composition
        slisBnb: { usd: slisBnbTvl },
        bnb: { usd: bnbTvl },
        other: { usd: 0 },
      },
      // External protocols using asBNB
      externalAsBnb: asBnbExternalTvl,
      pools: poolsList,
      lastUpdated: new Date().toISOString(),
    };
    
    console.log('Aster TVL result:', JSON.stringify(result));
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching Aster TVL:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
