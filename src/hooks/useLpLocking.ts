import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LpLockData {
  platform: string;
  platformKey: string;
  lockedValue: number;
  lpPairs: number;
  lastUpdated?: string;
}

interface LpLockingResponse {
  success: boolean;
  data: LpLockData[];
  source: string;
  timestamp: string;
  error?: string;
}

const fetchLpLockingData = async (): Promise<LpLockData[]> => {
  const { data, error } = await supabase.functions.invoke<LpLockingResponse>('lp-locking');
  
  if (error) {
    console.error('LP locking fetch error:', error);
    throw new Error(error.message);
  }
  
  if (!data?.success || !data?.data) {
    throw new Error('Invalid response from LP locking API');
  }
  
  console.log('LP locking data source:', data.source);
  return data.data;
};

// Fallback data if API fails
const fallbackData: LpLockData[] = [
  {
    platform: 'PinkSale',
    platformKey: 'pinkSale',
    lockedValue: 224_750_000,
    lpPairs: 15000,
  },
  {
    platform: 'UNCX Network',
    platformKey: 'uncxNetwork',
    lockedValue: 58_540_000,
    lpPairs: 4200,
  },
  {
    platform: 'Team Finance',
    platformKey: 'teamFinance',
    lockedValue: 42_300_000,
    lpPairs: 3100,
  },
];

export function useLpLocking() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['lp-locking-data'],
    queryFn: fetchLpLockingData,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    retry: 2,
  });

  return {
    data: data ?? fallbackData,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}
