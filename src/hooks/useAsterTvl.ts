import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TokenTvl {
  usd: number;
}

interface PoolInfo {
  symbol: string;
  tvlUsd: number;
  pool: string;
  project: string;
}

export interface AsterTvlData {
  totalTvl: number;
  tokens: {
    bnb: TokenTvl;
    asBnb: TokenTvl;
    slisBnb: TokenTvl;
    other: TokenTvl;
  };
  externalAsBnb: number;
  pools: PoolInfo[];
  lastUpdated: string;
}

export function useAsterTvl() {
  return useQuery({
    queryKey: ['aster-tvl'],
    queryFn: async (): Promise<AsterTvlData> => {
      const { data, error } = await supabase.functions.invoke('aster-tvl');
      
      if (error) {
        console.error('Error fetching Aster TVL:', error);
        throw error;
      }
      
      return data as AsterTvlData;
    },
    staleTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
