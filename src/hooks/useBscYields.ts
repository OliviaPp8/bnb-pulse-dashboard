import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface YieldPool {
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

export interface BscYieldsData {
  pools: {
    stable: YieldPool[];
    structured: YieldPool[];
    degen: YieldPool[];
  };
  summary: {
    totalPools: number;
    topYield: { project: string; symbol: string; apy: number } | null;
    avgStableApy: number;
  };
  lastUpdated: string;
}

async function fetchBscYields(): Promise<BscYieldsData> {
  const { data, error } = await supabase.functions.invoke('bsc-yields');
  
  if (error) {
    console.error('Error fetching BSC yields:', error);
    throw error;
  }
  
  return data as BscYieldsData;
}

export function useBscYields() {
  return useQuery({
    queryKey: ['bsc-yields'],
    queryFn: fetchBscYields,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });
}
