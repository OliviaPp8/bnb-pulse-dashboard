import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { YieldData, mockYieldData } from '@/data/mockData';

interface BinanceProduct {
  asset: string;
  apr: number;
  tierRates?: Record<string, string>;
  minAmount: string;
  productType: 'flexible' | 'locked';
  duration?: number;
  status: string;
  canPurchase: boolean;
}

interface BinanceYieldsResponse {
  flexible: BinanceProduct[];
  locked: BinanceProduct[];
  lastUpdated: string;
  cached: boolean;
  error?: string;
}

function transformToYieldData(data: BinanceYieldsResponse): YieldData[] {
  const yields: YieldData[] = [];

  // Add flexible products
  if (data.flexible && data.flexible.length > 0) {
    const bnbFlexible = data.flexible.find(p => p.asset === 'BNB');
    if (bnbFlexible) {
      yields.push({
        channel: 'Simple Earn Flexible',
        channelKey: 'simpleEarnFlexible',
        productTypeKey: 'flexibleEarn',
        apr: bnbFlexible.apr,
        bonusKey: 'hodlerAirdrop',
      });
    }
  }

  // Add locked products (group by duration)
  if (data.locked && data.locked.length > 0) {
    const bnbLocked = data.locked.filter(p => p.asset === 'BNB' && p.apr > 0);
    
    // Sort by APR descending and get the best one
    const sortedLocked = bnbLocked.sort((a, b) => b.apr - a.apr);
    
    if (sortedLocked.length > 0) {
      const best = sortedLocked[0];
      yields.push({
        channel: 'Simple Earn Locked',
        channelKey: 'simpleEarnLocked',
        productTypeKey: `${best.duration || 120}dayLock`,
        apr: best.apr,
        bonusKey: 'lockedEarn',
      });
    }
  }

  // Add Launchpool as static entry (not available via Simple Earn API)
  yields.push({
    channel: 'Launchpool',
    channelKey: 'launchpool',
    productTypeKey: 'newCoinMining',
    apr: 8.0, // Estimated based on historical data
    bonusKey: 'estimatedPerBnb',
    isEstimated: true,
  });

  // Add BNB Vault as static entry
  yields.push({
    channel: 'BNB Vault',
    channelKey: 'bnbVault',
    productTypeKey: 'aggregatedPool',
    apr: 5.5, // Approximate
    bonusKey: 'autoParticipate',
    isEstimated: true,
  });

  return yields;
}

async function fetchBinanceYields(): Promise<{ yields: YieldData[]; lastUpdated: string | null; isLive: boolean }> {
  try {
    const { data, error } = await supabase.functions.invoke('binance-yields');

    if (error) {
      console.error('Error fetching Binance yields:', error);
      throw error;
    }

    const response = data as BinanceYieldsResponse;

    if (response.error) {
      console.warn('Binance API returned error:', response.error);
      throw new Error(response.error);
    }

    const transformedYields = transformToYieldData(response);
    
    return {
      yields: transformedYields.length > 0 ? transformedYields : mockYieldData,
      lastUpdated: response.lastUpdated,
      isLive: transformedYields.length > 0,
    };
  } catch (error) {
    console.error('Failed to fetch Binance yields, using mock data:', error);
    return {
      yields: mockYieldData,
      lastUpdated: null,
      isLive: false,
    };
  }
}

export function useBinanceYields() {
  return useQuery({
    queryKey: ['binance-yields'],
    queryFn: fetchBinanceYields,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes (formerly cacheTime)
    retry: 2,
    retryDelay: 1000,
  });
}
