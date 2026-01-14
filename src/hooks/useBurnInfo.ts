import { useQuery } from '@tanstack/react-query';

interface BurnInfoResponse {
  nextBurnEstimatedAmount: string; // in wei (hex)
  currentBurnProgress: string; // percentage as hex (e.g., "0x32" = 50%)
  nextBurnDate?: string; // timestamp if available
}

interface BurnInfo {
  nextBurnEstimatedAmount: number; // in BNB
  currentBurnProgress: number; // 0-100 percentage
  nextBurnDate: Date;
  isLoading: boolean;
  error: Error | null;
}

const fetchBurnInfo = async (apiKey: string): Promise<{ nextBurnEstimatedAmount: number; currentBurnProgress: number }> => {
  const response = await fetch(`https://bsc-mainnet.nodereal.io/v1/${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'nr_getBurnInfo',
      params: [],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch burn info: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message || 'Failed to fetch burn info');
  }

  const result: BurnInfoResponse = data.result;
  
  // Parse nextBurnEstimatedAmount (convert from wei to BNB)
  let nextBurnEstimatedAmount = 0;
  if (result.nextBurnEstimatedAmount) {
    const amountWei = BigInt(result.nextBurnEstimatedAmount);
    nextBurnEstimatedAmount = Number(amountWei) / 1e18;
  }
  
  // Parse currentBurnProgress (convert from hex percentage)
  let currentBurnProgress = 0;
  if (result.currentBurnProgress) {
    // Check if it's a hex string or a decimal string
    if (result.currentBurnProgress.startsWith('0x')) {
      currentBurnProgress = parseInt(result.currentBurnProgress, 16);
    } else {
      currentBurnProgress = parseFloat(result.currentBurnProgress);
    }
  }

  return { nextBurnEstimatedAmount, currentBurnProgress };
};

// Calculate next quarterly burn date
const getNextQuarterlyBurnDate = (): Date => {
  const now = new Date();
  const year = now.getFullYear();
  
  // Quarterly burns typically happen in January, April, July, October
  const burnMonths = [0, 3, 6, 9]; // 0-indexed months
  const burnDay = 15; // Approximate day
  
  for (const month of burnMonths) {
    const burnDate = new Date(year, month, burnDay);
    if (burnDate > now) {
      return burnDate;
    }
  }
  
  // If all quarters passed, return next year's Q1
  return new Date(year + 1, 0, burnDay);
};

export function useBurnInfo(): BurnInfo {
  const apiKey = import.meta.env.VITE_NODEREAL_API_KEY || '';

  const { data, isLoading, error } = useQuery({
    queryKey: ['burn-info'],
    queryFn: () => fetchBurnInfo(apiKey),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 3,
    enabled: !!apiKey,
  });

  return {
    nextBurnEstimatedAmount: data?.nextBurnEstimatedAmount ?? 1_800_000, // Fallback
    currentBurnProgress: data?.currentBurnProgress ?? 45, // Fallback
    nextBurnDate: getNextQuarterlyBurnDate(),
    isLoading,
    error: error as Error | null,
  };
}
