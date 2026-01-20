import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching Aster TVL data from DefiLlama...');
    
    const response = await fetch('https://api.llama.fi/protocol/aster');
    
    if (!response.ok) {
      throw new Error(`DefiLlama API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Get BSC chain TVL (combine BSC and BSC-staking)
    const bscTvl = (data.currentChainTvls?.['BSC'] || 0) + (data.currentChainTvls?.['BSC-staking'] || 0);
    
    console.log('Available chains:', Object.keys(data.currentChainTvls || {}));
    console.log('BSC TVL:', data.currentChainTvls?.['BSC']);
    console.log('BSC-staking TVL:', data.currentChainTvls?.['BSC-staking']);
    
    // Check BSC-staking for tokens
    const bscStakingData = data.chainTvls?.['BSC-staking'];
    console.log('BSC-staking data keys:', bscStakingData ? Object.keys(bscStakingData) : 'N/A');
    
    // Get tokens from BSC-staking
    const stakingTokensUsd = bscStakingData?.tokensInUsd || [];
    const stakingTokens = bscStakingData?.tokens || [];
    
    console.log('BSC-staking tokensInUsd length:', stakingTokensUsd.length);
    console.log('BSC-staking tokens length:', stakingTokens.length);
    
    // Get the latest token data from staking
    const latestTokenDataUsd = stakingTokensUsd.length > 0 ? stakingTokensUsd[stakingTokensUsd.length - 1] : null;
    const latestTokenData = stakingTokens.length > 0 ? stakingTokens[stakingTokens.length - 1] : null;
    
    if (latestTokenDataUsd) {
      console.log('Latest staking tokensInUsd:', JSON.stringify(latestTokenDataUsd).substring(0, 1000));
    }
    if (latestTokenData) {
      console.log('Latest staking tokens:', JSON.stringify(latestTokenData).substring(0, 1000));
    }
    
    // Extract BNB-related tokens
    let bnbAmount = 0;
    let asBnbAmount = 0;
    let slisBnbAmount = 0;
    let otherAmount = 0;
    let bnbUsd = 0;
    let asBnbUsd = 0;
    let slisBnbUsd = 0;
    let otherUsd = 0;
    
    // Process token amounts
    if (latestTokenData?.tokens) {
      const tokens = latestTokenData.tokens;
      console.log('Staking token names:', Object.keys(tokens));
      
      for (const [tokenName, amount] of Object.entries(tokens)) {
        const lowerName = tokenName.toLowerCase();
        const numAmount = Number(amount) || 0;
        
        if (lowerName === 'bnb' || lowerName === 'wbnb' || lowerName === 'binancecoin') {
          bnbAmount += numAmount;
        } else if (lowerName.includes('asbnb') || lowerName.includes('as-bnb') || lowerName === 'asbnb') {
          asBnbAmount += numAmount;
        } else if (lowerName.includes('slisbnb') || lowerName.includes('slis') || lowerName.includes('lista')) {
          slisBnbAmount += numAmount;
        } else {
          otherAmount += numAmount;
        }
      }
    }
    
    // Process token USD values
    if (latestTokenDataUsd?.tokens) {
      const tokens = latestTokenDataUsd.tokens;
      
      for (const [tokenName, amount] of Object.entries(tokens)) {
        const lowerName = tokenName.toLowerCase();
        const numAmount = Number(amount) || 0;
        
        if (lowerName === 'bnb' || lowerName === 'wbnb' || lowerName === 'binancecoin') {
          bnbUsd += numAmount;
        } else if (lowerName.includes('asbnb') || lowerName.includes('as-bnb') || lowerName === 'asbnb') {
          asBnbUsd += numAmount;
        } else if (lowerName.includes('slisbnb') || lowerName.includes('slis') || lowerName.includes('lista')) {
          slisBnbUsd += numAmount;
        } else {
          otherUsd += numAmount;
        }
      }
    }
    
    const result = {
      totalTvl: bscTvl,
      tokens: {
        bnb: { amount: bnbAmount, usd: bnbUsd },
        asBnb: { amount: asBnbAmount, usd: asBnbUsd },
        slisBnb: { amount: slisBnbAmount, usd: slisBnbUsd },
        other: { amount: otherAmount, usd: otherUsd },
      },
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
