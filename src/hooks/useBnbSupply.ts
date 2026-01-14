import { useQuery } from '@tanstack/react-query';

interface BnbSupplyData {
  circulating: number;
  target: number;
  totalBurned: number;
  burnPercentage: number;
  isLoading: boolean;
  error: Error | null;
}

const INITIAL_SUPPLY = 200_000_000; // Initial BNB supply
const TARGET_SUPPLY = 100_000_000; // Target supply after burns

const fetchCirculatingSupply = async (): Promise<number> => {
  const apiKey = import.meta.env.ETHERSCAN_API_KEY || '';
  const url = `https://api.etherscan.io/v2/api?chainid=56&module=stats&action=circulatingtokensupply&apikey=${apiKey}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.status !== '1') {
    throw new Error(data.message || 'Failed to fetch supply data');
  }
  
  // Convert from wei to BNB (divide by 10^18)
  const supplyInWei = BigInt(data.result);
  const supplyInBnb = Number(supplyInWei / BigInt(10 ** 18));
  
  return supplyInBnb;
};

export function useBnbSupply(): BnbSupplyData {
  const { data: circulating, isLoading, error } = useQuery({
    queryKey: ['bnb-circulating-supply'],
    queryFn: fetchCirculatingSupply,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 3,
  });

  const circulatingSupply = circulating ?? 137_000_000; // Fallback to mock data
  const totalBurned = INITIAL_SUPPLY - circulatingSupply;
  const burnPercentage = (totalBurned / INITIAL_SUPPLY) * 100;

  return {
    circulating: circulatingSupply,
    target: TARGET_SUPPLY,
    totalBurned,
    burnPercentage,
    isLoading,
    error: error as Error | null,
  };
}
