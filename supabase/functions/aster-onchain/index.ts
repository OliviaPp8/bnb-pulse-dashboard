import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Contract addresses on BSC
const ASBNB_TOKEN = '0x77734e70b6E88b4d82fE632a168EDf6e700912b6';
const ASBNB_MINTING = '0x2F31ab8950c50080E77999fa456372f276952fD8';

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
      // DefiLlama Protocol API for TVL (used to derive exchange rate)
      fetch('https://api.llama.fi/protocol/aster'),
    ]);

    // Parse asBNB supply (on-chain data)
    const asBnbSupply = Number(BigInt(asBnbSupplyHex)) / 1e18;
    console.log(`asBNB Supply (on-chain): ${asBnbSupply.toFixed(2)}`);
    console.log(`BNB Price: $${bnbPrice.toFixed(2)}`);

    // Get TVL from DefiLlama to derive exchange rate
    let defiLlamaTvlUsd = 0;
    
    if (protocolResponse.ok) {
      const protocolData = await protocolResponse.json();
      
      // Get BSC TVL from DefiLlama
      const bscTvl = protocolData.currentChainTvls?.['BSC'] || 0;
      const bscStaking = protocolData.currentChainTvls?.['BSC-staking'] || 0;
      defiLlamaTvlUsd = bscTvl + bscStaking;
      console.log(`DefiLlama BSC TVL: $${defiLlamaTvlUsd.toLocaleString()}`);
    }

    // Calculate exchange rate: TVL (USD) / (supply * BNB price)
    // This gives us: 1 asBNB = X BNB
    let exchangeRate = 1.0;
    if (asBnbSupply > 0 && bnbPrice > 0 && defiLlamaTvlUsd > 0) {
      // TVL in BNB = TVL USD / BNB price
      const tvlInBnb = defiLlamaTvlUsd / bnbPrice;
      // Exchange rate = TVL in BNB / asBNB supply
      exchangeRate = tvlInBnb / asBnbSupply;
      console.log(`Calculated exchange rate: 1 asBNB = ${exchangeRate.toFixed(6)} BNB`);
    }

    // Correct TVL calculation: supply × rate × price
    const tvlInBnb = asBnbSupply * exchangeRate;
    const tvlUsd = tvlInBnb * bnbPrice;
    console.log(`Calculated TVL: ${tvlInBnb.toFixed(2)} BNB = $${tvlUsd.toLocaleString()}`);

    // Result: store supply (base data), frontend calculates TVL (display data)
    const result = {
      // Base data (stored)
      supply: Math.round(asBnbSupply * 100) / 100,
      exchangeRate: Math.round(exchangeRate * 1000000) / 1000000, // 6 decimals
      bnbPrice: Math.round(bnbPrice * 100) / 100,
      // Calculated TVL (for display)
      tvlBnb: Math.round(tvlInBnb * 100) / 100,
      tvlUsd: Math.round(tvlUsd),
      // Metadata
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
