import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TokenInfo {
  amount: number;
  usd: number;
}

export interface AsterTvlData {
  totalTvl: number;
  tokens: {
    bnb: TokenInfo;
    asBnb: TokenInfo;
    slisBnb: TokenInfo;
    other: TokenInfo;
  };
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });
}
