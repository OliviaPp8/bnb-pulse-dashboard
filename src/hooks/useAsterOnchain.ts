import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AsterOnchainData {
  // Base data (stored)
  supply: number;        // asBNB total supply
  exchangeRate: number;  // 1 asBNB = X BNB
  bnbPrice: number;      // BNB/USD price
  // Calculated TVL (for display)
  tvlBnb: number;        // TVL in BNB
  tvlUsd: number;        // TVL in USD
  // Metadata
  lastUpdated: string;
}

export function useAsterOnchain() {
  return useQuery({
    queryKey: ['aster-onchain'],
    queryFn: async (): Promise<AsterOnchainData> => {
      const { data, error } = await supabase.functions.invoke('aster-onchain');
      
      if (error) {
        console.error('Error fetching Aster on-chain data:', error);
        throw error;
      }
      
      return data as AsterOnchainData;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
