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

// Fetch supply data from CoinGecko and burned amount from Etherscan
const fetchSupplyData = async (): Promise<SupplyApiResult> => {
  const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY || '';
  
  // Fetch both in parallel: CoinGecko for circulating supply, Etherscan for burned
  const [geckoResponse, burnedResponse] = await Promise.all([
    fetch('https://api.coingecko.com/api/v3/coins/binancecoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false'),
    fetch(`https://api.etherscan.io/v2/api?chainid=56&module=account&action=balance&address=${DEAD_ADDRESS}&apikey=${apiKey}`)
  ]);
  
  // Parse circulating supply from CoinGecko
  let circulating = 144_000_000; // Fallback
  if (geckoResponse.ok) {
    try {
      const geckoData = await geckoResponse.json();
      console.log('CoinGecko market_data:', geckoData?.market_data?.circulating_supply, geckoData?.market_data?.total_supply);
      if (geckoData?.market_data?.circulating_supply) {
        circulating = Math.round(geckoData.market_data.circulating_supply);
        console.log('Parsed circulating supply:', circulating);
      }
    } catch (e) {
      console.error('Error parsing CoinGecko response:', e);
    }
  } else {
    console.error('CoinGecko API error:', geckoResponse.status);
  }
  
  // Parse burned amount from dead address (Etherscan)
  let burned = INITIAL_SUPPLY - circulating; // Fallback to calculation
  if (burnedResponse.ok) {
    try {
      const burnedData = await burnedResponse.json();
      if (burnedData.status === '1') {
        const balanceInWei = BigInt(burnedData.result);
        burned = Number(balanceInWei / BigInt(10 ** 18));
        console.log('Parsed burned from dead address:', burned);
      }
    } catch (e) {
      console.error('Error parsing Etherscan response:', e);
    }
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
