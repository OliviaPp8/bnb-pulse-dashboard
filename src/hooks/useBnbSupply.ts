import { useQuery } from '@tanstack/react-query';

interface BnbSupplyData {
  circulating: number;
  target: number;
  totalBurned: number;
  burnPercentage: number;
  isLoading: boolean;
  error: Error | null;
}

interface SupplyApiResult {
  circulating: number;
  burned: number;
}

const INITIAL_SUPPLY = 200_000_000; // Initial BNB supply
const TARGET_SUPPLY = 100_000_000; // Target supply after burns
const DEAD_ADDRESS = '0x000000000000000000000000000000000000dEaD'; // BNB burn address

// Fetch both circulating supply and burned amount in a single query
const fetchSupplyData = async (): Promise<SupplyApiResult> => {
  const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY || '';
  
  // Fetch both in parallel
  const [supplyResponse, burnedResponse] = await Promise.all([
    fetch(`https://api.etherscan.io/v2/api?chainid=56&module=stats&action=circulatingtokensupply&apikey=${apiKey}`),
    fetch(`https://api.etherscan.io/v2/api?chainid=56&module=account&action=balance&address=${DEAD_ADDRESS}&apikey=${apiKey}`)
  ]);
  
  if (!supplyResponse.ok || !burnedResponse.ok) {
    throw new Error('API request failed');
  }
  
  const [supplyData, burnedData] = await Promise.all([
    supplyResponse.json(),
    burnedResponse.json()
  ]);
  
  // Parse circulating supply
  let circulating = 144_000_000; // Fallback
  if (supplyData.status === '1') {
    const supplyInWei = BigInt(supplyData.result);
    circulating = Number(supplyInWei / BigInt(10 ** 18));
  }
  
  // Parse burned amount from dead address
  let burned = INITIAL_SUPPLY - circulating; // Fallback to calculation
  if (burnedData.status === '1') {
    const balanceInWei = BigInt(burnedData.result);
    burned = Number(balanceInWei / BigInt(10 ** 18));
  }
  
  return { circulating, burned };
};

export function useBnbSupply(): BnbSupplyData {
  const { data, isLoading, error } = useQuery({
    queryKey: ['bnb-supply-data'],
    queryFn: fetchSupplyData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 3,
  });

  const circulatingSupply = data?.circulating ?? 144_000_000;
  const totalBurned = data?.burned ?? (INITIAL_SUPPLY - circulatingSupply);
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
