// Mock data for BNB Alpha Terminal
// This will be replaced with real API data later

export interface SupplyData {
  circulating: number;
  target: number;
  totalBurned: number;
  burnPercentage: number;
}

export interface BurnData {
  nextBurnDate: Date;
  bep95BurnRate: number; // BNB per minute
}

export interface YieldData {
  channel: string;
  channelKey: string;
  productTypeKey: string;
  apr: number;
  bonusKey: string;
}

export interface AirdropData {
  count: number;
  totalValue: number;
  history: { month: string; value: number }[];
}

export interface ChainMetrics {
  network: string;
  networkKey: string;
  tps: number;
  gasPrice: number;
  dau: number;
}

export interface LsdData {
  protocol: string;
  protocolKey: string;
  locked: number;
}

export interface LpLockData {
  platform: string;
  platformKey: string;
  lockedValue: number;
  lpPairs: number;
}

export interface AsterData {
  tradingVolume: number;
  actualHoldings: number;
  ratio: number;
  isArbitrageOpen: boolean;
}

export const mockSupplyData: SupplyData = {
  circulating: 137_000_000,
  target: 100_000_000,
  totalBurned: 63_000_000,
  burnPercentage: 31.5,
};

export const mockBurnData: BurnData = {
  nextBurnDate: new Date('2025-04-15T00:00:00Z'),
  bep95BurnRate: 1.23,
};

export const mockYieldData: YieldData[] = [
  {
    channel: 'Simple Earn',
    channelKey: 'simpleEarn',
    productTypeKey: 'exchangeFinance',
    apr: 2.5,
    bonusKey: 'hodlerAirdrop',
  },
  {
    channel: 'Launchpool',
    channelKey: 'launchpool',
    productTypeKey: 'newCoinMining',
    apr: 8.0,
    bonusKey: 'estimatedPerBnb',
  },
  {
    channel: 'BNB Vault',
    channelKey: 'bnbVault',
    productTypeKey: 'aggregatedPool',
    apr: 5.5,
    bonusKey: 'autoParticipate',
  },
  {
    channel: 'Megadrop',
    channelKey: 'megadrop',
    productTypeKey: 'web3Quest',
    apr: 10.0,
    bonusKey: 'stakingLocked',
  },
];

export const mockAirdropData: AirdropData = {
  count: 57,
  totalValue: 2_450_000,
  history: [
    { month: 'Jan', value: 380000 },
    { month: 'Feb', value: 420000 },
    { month: 'Mar', value: 510000 },
    { month: 'Apr', value: 290000 },
    { month: 'May', value: 450000 },
    { month: 'Jun', value: 400000 },
  ],
};

export const mockChainMetrics: ChainMetrics[] = [
  {
    network: 'BSC',
    networkKey: 'bscNetwork',
    tps: 78.5,
    gasPrice: 1.0,
    dau: 1_250_000,
  },
  {
    network: 'opBNB',
    networkKey: 'opBnbNetwork',
    tps: 4500,
    gasPrice: 0.001,
    dau: 890_000,
  },
];

export const mockLsdData: LsdData[] = [
  {
    protocol: 'Lista DAO',
    protocolKey: 'listaDao',
    locked: 2_850_000,
  },
  {
    protocol: 'PancakeSwap',
    protocolKey: 'pancakeSwap',
    locked: 1_920_000,
  },
];

export const mockAsterData: AsterData = {
  tradingVolume: 45_000_000,
  actualHoldings: 28_000_000,
  ratio: 1.61,
  isArbitrageOpen: true,
};

export const mockLpLockData: LpLockData[] = [
  {
    platform: 'PinkSale',
    platformKey: 'pinkSale',
    lockedValue: 224_750_000, // From DefiLlama BSC TVL
    lpPairs: 15000,
  },
  {
    platform: 'UNCX Network',
    platformKey: 'uncxNetwork',
    lockedValue: 58_540_000, // From DefiLlama BSC TVL
    lpPairs: 4200,
  },
];

export const bestYieldCombination = {
  protocol: 'Lista slisBNB + Launchpool',
  apr: 12.5,
};

// Institutional Holdings
export interface InstitutionalHolding {
  ticker: string;
  company: string;
  holdings: number;
  costBasis: number;
  currentPrice: number;
  mNavPremium: number;
}

export interface SovereignNode {
  region: string;
  regionKey: string;
  status: 'active' | 'inactive';
  lastSeen: string;
}

export interface SovereignData {
  lockPercentage: number;
  totalLocked: number;
}

export const mockInstitutionalHoldings: InstitutionalHolding[] = [
  {
    ticker: 'BNC.US',
    company: 'CEA Industries',
    holdings: 515_054,
    costBasis: 851,
    currentPrice: 939,
    mNavPremium: 0.57,
  },
  {
    ticker: 'NA.US',
    company: 'Nano Labs',
    holdings: 128_000,
    costBasis: 713,
    currentPrice: 939,
    mNavPremium: 0.35,
  },
  {
    ticker: 'BTC.BK',
    company: 'The Brooker Group',
    holdings: 43_022,
    costBasis: 0,
    currentPrice: 939,
    mNavPremium: 1.66,
  },
];

export const mockSovereignNodes: SovereignNode[] = [
  {
    region: 'Abu Dhabi',
    regionKey: 'abuDhabi',
    status: 'active',
    lastSeen: '2025-01-02T12:00:00Z',
  },
  {
    region: 'Singapore',
    regionKey: 'singapore',
    status: 'active',
    lastSeen: '2025-01-02T11:45:00Z',
  },
  {
    region: 'Switzerland',
    regionKey: 'switzerland',
    status: 'inactive',
    lastSeen: '2024-12-28T08:30:00Z',
  },
];

export const mockSovereignData: SovereignData = {
  lockPercentage: 4.2,
  totalLocked: 5_754_000,
};
