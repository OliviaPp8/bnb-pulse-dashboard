import { useQuery } from '@tanstack/react-query';

interface BlockReward {
  blockNumber: string;
  blockMiner: string;
  blockReward: string;
  systemReward: string;
  burnedFee: string;
  timestamp: string;
}

interface Bep95BurnData {
  burnRate: number; // BNB per minute
  latestBurnedFee: number; // Latest block burned fee in BNB
  isLoading: boolean;
  error: Error | null;
}

const fetchLatestBlockNumber = async (apiKey: string): Promise<number> => {
  const response = await fetch(`https://bsc-mainnet.nodereal.io/v1/${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_blockNumber',
      params: [],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch block number: ${response.status}`);
  }

  const data = await response.json();
  return parseInt(data.result, 16);
};

const fetchBlockReward = async (apiKey: string, blockNumber: number): Promise<BlockReward> => {
  const response = await fetch(`https://bsc-mainnet.nodereal.io/v1/${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'nr_getBlockReward',
      params: [blockNumber],
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch block reward: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message || 'Failed to fetch block reward');
  }

  return data.result;
};

const calculateBurnRate = async (apiKey: string): Promise<{ burnRate: number; latestBurnedFee: number }> => {
  // Get latest block number
  const latestBlock = await fetchLatestBlockNumber(apiKey);
  
  // Fetch last 20 blocks to calculate average burn rate
  // BSC produces ~1 block per 3 seconds, so 20 blocks ≈ 1 minute
  const blockPromises: Promise<BlockReward>[] = [];
  for (let i = 0; i < 20; i++) {
    blockPromises.push(fetchBlockReward(apiKey, latestBlock - i));
  }
  
  const blockRewards = await Promise.all(blockPromises);
  
  // Calculate total burned in these blocks
  let totalBurned = 0;
  blockRewards.forEach((reward) => {
    // burnedFee is in wei (hex), convert to BNB
    const burnedWei = BigInt(reward.burnedFee);
    totalBurned += Number(burnedWei) / 1e18;
  });
  
  // Get time span (first block to last block)
  const firstTimestamp = parseInt(blockRewards[blockRewards.length - 1].timestamp, 16);
  const lastTimestamp = parseInt(blockRewards[0].timestamp, 16);
  const timeSpanSeconds = lastTimestamp - firstTimestamp;
  
  // Calculate burn rate per minute
  const burnRate = timeSpanSeconds > 0 ? (totalBurned / timeSpanSeconds) * 60 : 0;
  
  // Latest burned fee
  const latestBurnedFee = Number(BigInt(blockRewards[0].burnedFee)) / 1e18;
  
  return { burnRate, latestBurnedFee };
};

export function useBep95Burn(): Bep95BurnData {
  const apiKey = import.meta.env.NODEREAL_API_KEY || '';

  const { data, isLoading, error } = useQuery({
    queryKey: ['bep95-burn-rate'],
    queryFn: () => calculateBurnRate(apiKey),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: 3,
    enabled: !!apiKey,
  });

  return {
    burnRate: data?.burnRate ?? 1.5, // Fallback to mock data
    latestBurnedFee: data?.latestBurnedFee ?? 0.001,
    isLoading,
    error: error as Error | null,
  };
}
