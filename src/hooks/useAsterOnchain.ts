import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AsterOnchainData {
  totalTvlUsd: number;
  asBnbSupply: number;
  backing: {
    slisBnb: {
      amount: number;
      valueBnb: number;
      usd: number;
      percentage: number;
    };
    bnb: {
      amount: number;
      usd: number;
      percentage: number;
    };
  };
  prices: {
    bnb: number;
    slisBnbRate: number;
  };
  apy: number;
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
