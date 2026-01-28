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

// Fetch supply data from Etherscan API v2 (real-time on-chain data for BSC)
const fetchSupplyData = async (): Promise<SupplyApiResult> => {
  const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY || '';
  
  if (!apiKey) {
    console.warn('VITE_ETHERSCAN_API_KEY not configured, using fallback data');
    return { circulating: 140_619_950, burned: INITIAL_SUPPLY - 140_619_950 };
  }
  
  // Fetch circulating supply from Etherscan API v2 with chainid=56 (BSC)
  const response = await fetch(
    `https://api.etherscan.io/v2/api?chainid=56&module=stats&action=bnbsupply&apikey=${apiKey}`
  );
  
  let circulating = 140_619_950; // Fallback to approximate real value
  
  if (response.ok) {
    try {
      const data = await response.json();
      console.log('Etherscan v2 bnbsupply response:', data);
      
      if (data.status === '1' && data.result) {
        // Result is in Wei, divide by 10^18
        const supplyInWei = BigInt(data.result);
        circulating = Number(supplyInWei / BigInt(10 ** 18));
        console.log('Parsed circulating supply from Etherscan v2:', circulating);
      } else if (data.message) {
        console.error('Etherscan API error:', data.message, data.result);
      }
    } catch (e) {
      console.error('Error parsing Etherscan response:', e);
    }
  } else {
    console.error('Etherscan API HTTP error:', response.status);
  }
  
  // Calculate burned amount: Initial supply - current circulating
  const burned = INITIAL_SUPPLY - circulating;
  console.log('Calculated burned amount:', burned);
  
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
