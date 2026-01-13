import { useQuery } from '@tanstack/react-query';
import { ChainMetrics } from '@/data/mockData';

interface BlockData {
  number: string;
  timestamp: string;
  transactions: string[];
  gasUsed: string;
  gasLimit: string;
}

const fetchChainMetrics = async (apiKey: string): Promise<ChainMetrics[]> => {
  const endpoint = `https://bsc-mainnet.nodereal.io/v1/${apiKey}`;

  // Batch requests: get latest block, gas price, and block number
  const batchRequests = [
    { jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] },
    { jsonrpc: '2.0', id: 2, method: 'eth_gasPrice', params: [] },
  ];

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(batchRequests),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const results = await response.json();
  
  // Parse results
  const blockNumberHex = results.find((r: { id: number }) => r.id === 1)?.result;
  const gasPriceHex = results.find((r: { id: number }) => r.id === 2)?.result;
  
  const latestBlockNumber = parseInt(blockNumberHex, 16);
  const gasPrice = parseInt(gasPriceHex, 16) / 1e9; // Convert to Gwei

  // Fetch last 10 blocks to calculate TPS
  const blockRequests = [];
  for (let i = 0; i < 10; i++) {
    blockRequests.push({
      jsonrpc: '2.0',
      id: i + 10,
      method: 'eth_getBlockByNumber',
      params: [`0x${(latestBlockNumber - i).toString(16)}`, false],
    });
  }

  const blocksResponse = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(blockRequests),
  });

  if (!blocksResponse.ok) {
    throw new Error(`Failed to fetch blocks: ${blocksResponse.status}`);
  }

  const blocksResults = await blocksResponse.json();
  
  // Calculate TPS from last 10 blocks
  let totalTransactions = 0;
  let firstTimestamp = 0;
  let lastTimestamp = 0;

  blocksResults.forEach((result: { id: number; result: BlockData }, index: number) => {
    if (result.result) {
      const block = result.result;
      totalTransactions += block.transactions?.length || 0;
      const timestamp = parseInt(block.timestamp, 16);
      
      if (index === 0) {
        lastTimestamp = timestamp;
      }
      if (index === blocksResults.length - 1) {
        firstTimestamp = timestamp;
      }
    }
  });

  const timeSpan = lastTimestamp - firstTimestamp;
  const tps = timeSpan > 0 ? totalTransactions / timeSpan : 0;

  // For DAU, we'll use an estimate based on transaction count
  // Real DAU would require indexing unique addresses
  const estimatedDau = Math.round(tps * 86400 * 0.15); // Rough estimate: 15% unique users

  return [
    {
      network: 'BSC',
      networkKey: 'bscMainnet',
      tps: Math.round(tps * 10) / 10,
      gasPrice: Math.round(gasPrice * 10) / 10,
      dau: estimatedDau,
    },
    {
      network: 'opBNB',
      networkKey: 'opBnbMainnet',
      tps: 4500, // opBNB mock data - would need separate API
      gasPrice: 0.001,
      dau: 850000,
    },
  ];
};

export function useChainMetrics() {
  const apiKey = import.meta.env.VITE_NODEREAL_API_KEY || '';

  const { data, isLoading, error } = useQuery({
    queryKey: ['chain-metrics'],
    queryFn: () => fetchChainMetrics(apiKey),
    staleTime: 15 * 1000, // 15 seconds
    refetchInterval: 15 * 1000, // Refetch every 15 seconds
    retry: 3,
    enabled: !!apiKey,
  });

  // Fallback to mock data if API fails
  const fallbackData: ChainMetrics[] = [
    { network: 'BSC', networkKey: 'bscMainnet', tps: 2100, gasPrice: 1.0, dau: 1200000 },
    { network: 'opBNB', networkKey: 'opBnbMainnet', tps: 4500, gasPrice: 0.001, dau: 850000 },
  ];

  return {
    data: data ?? fallbackData,
    isLoading,
    error: error as Error | null,
  };
}
