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
const DEAD_ADDRESS = '0x000000000000000000000000000000000000dEaD'; // BNB burn address

// Fetch circulating supply from Etherscan API
const fetchCirculatingSupply = async (): Promise<number> => {
  const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY || '';
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

// Fetch burned amount from dead address balance
const fetchBurnedFromDeadAddress = async (): Promise<number> => {
  const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY || '';
  const url = `https://api.etherscan.io/v2/api?chainid=56&module=account&action=balance&address=${DEAD_ADDRESS}&apikey=${apiKey}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.status !== '1') {
    throw new Error(data.message || 'Failed to fetch dead address balance');
  }
  
  // Convert from wei to BNB (divide by 10^18)
  const balanceInWei = BigInt(data.result);
  const balanceInBnb = Number(balanceInWei / BigInt(10 ** 18));
  
  return balanceInBnb;
};

export function useBnbSupply(): BnbSupplyData {
  // Fetch circulating supply
  const { data: circulating, isLoading: isLoadingSupply, error: supplyError } = useQuery({
    queryKey: ['bnb-circulating-supply'],
    queryFn: fetchCirculatingSupply,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 3,
  });

  // Fetch burned amount from dead address
  const { data: burnedFromDead, isLoading: isLoadingBurned, error: burnedError } = useQuery({
    queryKey: ['bnb-dead-address-balance'],
    queryFn: fetchBurnedFromDeadAddress,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
    retry: 3,
  });

  const circulatingSupply = circulating ?? 144_000_000; // Fallback
  const totalBurned = burnedFromDead ?? (INITIAL_SUPPLY - circulatingSupply); // Use dead address balance, fallback to calculation
  const burnPercentage = (totalBurned / INITIAL_SUPPLY) * 100;

  return {
    circulating: circulatingSupply,
    target: TARGET_SUPPLY,
    totalBurned,
    burnPercentage,
    isLoading: isLoadingSupply || isLoadingBurned,
    error: (supplyError || burnedError) as Error | null,
  };
}
