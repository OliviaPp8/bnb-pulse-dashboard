import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Contract addresses on BSC
const ASBNB_TOKEN = '0x77734e70b6E88b4d82fE632a168EDf6e700912b6';

// ABI function selectors
const TOTAL_SUPPLY_SELECTOR = '0x18160ddd'; // totalSupply()

async function callRpc(method: string, params: unknown[], apiKey: string): Promise<string> {
  const response = await fetch(`https://bsc-mainnet.nodereal.io/v1/${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`RPC call failed: ${response.status}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`RPC error: ${data.error.message}`);
  }

  return data.result;
}

async function getBnbPrice(): Promise<number> {
  try {
    const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT');
    if (!response.ok) throw new Error('Failed to fetch BNB price');
    const data = await response.json();
    return parseFloat(data.price);
  } catch (error) {
    console.error('Error fetching BNB price:', error);
    return 600; // Fallback price
  }
}

interface DefiLlamaProtocol {
  currentChainTvls?: Record<string, number>;
  tokensInUsd?: Array<{ date: string; tokens: Record<string, number> }>;
  tokens?: Array<{ date: string; tokens: Record<string, number> }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('NODEREAL_API_KEY');
    if (!apiKey) {
      throw new Error('NODEREAL_API_KEY not configured');
    }

    console.log('Fetching Aster on-chain data...');

    // Fetch all data in parallel
    const [
      asBnbSupplyHex,
      bnbPrice,
      protocolResponse,
    ] = await Promise.all([
      // asBNB total supply from chain
      callRpc('eth_call', [{
        to: ASBNB_TOKEN,
        data: TOTAL_SUPPLY_SELECTOR,
      }, 'latest'], apiKey),
      // BNB price
      getBnbPrice(),
      // DefiLlama Protocol API for TVL breakdown
      fetch('https://api.llama.fi/protocol/aster'),
    ]);

    // Parse asBNB supply
    const asBnbSupply = Number(BigInt(asBnbSupplyHex)) / 1e18;
    console.log(`asBNB Supply (on-chain): ${asBnbSupply.toFixed(2)}`);
    console.log(`BNB Price: $${bnbPrice.toFixed(2)}`);

    // Get TVL and token breakdown from DefiLlama
    let totalTvlUsd = 0;
    let slisBnbAmount = 0;
    let bnbAmount = 0;
    
    if (protocolResponse.ok) {
      const protocolData: DefiLlamaProtocol = await protocolResponse.json();
      
      // Get BSC TVL
      const bscTvl = protocolData.currentChainTvls?.['BSC'] || 0;
      const bscStaking = protocolData.currentChainTvls?.['BSC-staking'] || 0;
      totalTvlUsd = bscTvl + bscStaking;
      console.log(`DefiLlama BSC TVL: $${totalTvlUsd.toLocaleString()}`);
      
      // Try to get token breakdown from the latest tokens data
      if (protocolData.tokens && protocolData.tokens.length > 0) {
        const latestTokens = protocolData.tokens[protocolData.tokens.length - 1].tokens;
        console.log('Token breakdown:', JSON.stringify(latestTokens));
        
        // Look for slisBNB, BNB, and WBNB in the breakdown
        for (const [token, amount] of Object.entries(latestTokens)) {
          const tokenUpper = token.toUpperCase();
          // slisBNB - Lista DAO liquid staked BNB
          if (tokenUpper === 'SLISBNB') {
            slisBnbAmount = Number(amount);
            console.log(`Found SLISBNB: ${slisBnbAmount}`);
          } 
          // Native BNB or WBNB (wrapped BNB) - count both as BNB backing
          else if (tokenUpper === 'BNB' || tokenUpper === 'WBNB') {
            bnbAmount += Number(amount);
            console.log(`Found ${tokenUpper}: ${Number(amount)}, total BNB: ${bnbAmount}`);
          }
        }
      }
      
      // If no token breakdown found, use asBNB supply as estimate
      if (slisBnbAmount === 0 && bnbAmount === 0) {
        slisBnbAmount = asBnbSupply;
        console.log('No token breakdown, using asBNB supply as slisBNB estimate');
      }
    }

    // Calculate USD values
    const slisBnbRate = 1.05; // slisBNB trades at slight premium
    const slisBnbValueBnb = slisBnbAmount * slisBnbRate;
    const slisBnbUsd = slisBnbValueBnb * bnbPrice;
    const bnbUsd = bnbAmount * bnbPrice;
    
    // If we have no breakdown but have TVL, use TVL directly
    if (totalTvlUsd > 0 && slisBnbUsd === 0 && bnbUsd === 0) {
      // All backing is essentially slisBNB-based
      const estimatedSlisBnb = totalTvlUsd / (slisBnbRate * bnbPrice);
      slisBnbAmount = estimatedSlisBnb;
    }

    // Recalculate with final values
    const finalSlisBnbUsd = slisBnbAmount * slisBnbRate * bnbPrice;
    const finalBnbUsd = bnbAmount * bnbPrice;
    const computedTvl = finalSlisBnbUsd + finalBnbUsd;
    
    // Use DefiLlama TVL if available, otherwise computed
    const finalTvl = totalTvlUsd > 0 ? totalTvlUsd : computedTvl;

    // Calculate percentages
    const totalBacking = finalSlisBnbUsd + finalBnbUsd;
    const slisBnbPercentage = totalBacking > 0 ? (finalSlisBnbUsd / totalBacking) * 100 : 100;
    const bnbPercentage = totalBacking > 0 ? (finalBnbUsd / totalBacking) * 100 : 0;

    // Fetch APY from yields API
    let apy = 0;
    try {
      const yieldsResponse = await fetch('https://yields.llama.fi/pools');
      if (yieldsResponse.ok) {
        const yieldsData = await yieldsResponse.json();
        const asterPools = yieldsData.data?.filter((p: { project: string; chain: string }) => 
          (p.project.toLowerCase().includes('aster') || p.project.toLowerCase().includes('astherus')) &&
          p.chain === 'BSC'
        );
        if (asterPools && asterPools.length > 0) {
          // Get highest APY from Aster pools
          apy = Math.max(...asterPools.map((p: { apy: number }) => p.apy || 0));
          console.log(`Aster APY from DefiLlama: ${apy.toFixed(2)}%`);
        }
      }
    } catch (error) {
      console.error('Error fetching APY:', error);
    }

    const result = {
      totalTvlUsd: Math.round(finalTvl),
      asBnbSupply: Math.round(asBnbSupply * 100) / 100,
      backing: {
        slisBnb: {
          amount: Math.round(slisBnbAmount * 100) / 100,
          valueBnb: Math.round(slisBnbAmount * slisBnbRate * 100) / 100,
          usd: Math.round(finalSlisBnbUsd),
          percentage: Math.round(slisBnbPercentage * 10) / 10,
        },
        bnb: {
          amount: Math.round(bnbAmount * 100) / 100,
          usd: Math.round(finalBnbUsd),
          percentage: Math.round(bnbPercentage * 10) / 10,
        },
      },
      prices: {
        bnb: bnbPrice,
        slisBnbRate,
      },
      apy,
      lastUpdated: new Date().toISOString(),
    };

    console.log('Aster on-chain result:', JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching Aster on-chain data:', error);
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