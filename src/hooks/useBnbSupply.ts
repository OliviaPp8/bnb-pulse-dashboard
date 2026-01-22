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

// Fetch supply data from BscScan (real-time on-chain data)
const fetchSupplyData = async (): Promise<SupplyApiResult> => {
  const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY || '';
  
  // Fetch circulating supply from BscScan bnbsupply endpoint
  const response = await fetch(
    `https://api.bscscan.com/api?module=stats&action=bnbsupply&apikey=${apiKey}`
  );
  
  let circulating = 144_000_000; // Fallback
  
  if (response.ok) {
    try {
      const data = await response.json();
      console.log('BscScan bnbsupply response:', data);
      
      if (data.status === '1' && data.result) {
        // Result is in Wei, divide by 10^18
        const supplyInWei = BigInt(data.result);
        circulating = Number(supplyInWei / BigInt(10 ** 18));
        console.log('Parsed circulating supply from BscScan:', circulating);
      }
    } catch (e) {
      console.error('Error parsing BscScan response:', e);
    }
  } else {
    console.error('BscScan API error:', response.status);
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
