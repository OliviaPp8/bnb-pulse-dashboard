// Sovereign Fund Support Data for BNB Ecosystem

export type SupportType = 'explicit' | 'implicit';
export type SupportLevel = 'strategic' | 'infrastructure' | 'indirect';

export interface SovereignSupporter {
  id: string;
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2
  fund: string;
  fundKey: string;
  type: SupportType;
  level: SupportLevel;
  nature: string;
  natureKey: string;
  description: string;
  descriptionKey: string;
  status: 'active' | 'monitoring';
  lastUpdated: string;
}

// Explicit Support: Middle East & Central Asia (The Iron Core)
export const explicitSupporters: SovereignSupporter[] = [
  {
    id: 'uae-mubadala',
    country: 'UAE',
    countryCode: 'AE',
    fund: 'Mubadala & ADQ',
    fundKey: 'mubadalaAdq',
    type: 'explicit',
    level: 'strategic',
    nature: 'Strategic Investment & Ecosystem Incubation',
    natureKey: 'strategicInvestment',
    description: 'Abu Dhabi sovereign capital is the cornerstone of BNB Chain\'s Middle East compliance architecture.',
    descriptionKey: 'uaeDescription',
    status: 'active',
    lastUpdated: '2026-01-15T12:00:00Z',
  },
  {
    id: 'kz-national',
    country: 'Kazakhstan',
    countryCode: 'KZ',
    fund: 'National Fund of Kazakhstan',
    fundKey: 'kazakhstanFund',
    type: 'explicit',
    level: 'infrastructure',
    nature: 'Technology Adoption & Infrastructure',
    natureKey: 'techInfrastructure',
    description: 'National-level CBDC technology partner (Digital Tenge bridge testing).',
    descriptionKey: 'kazakhstanDescription',
    status: 'active',
    lastUpdated: '2026-01-10T08:30:00Z',
  },
  {
    id: 'bh-mumtalakat',
    country: 'Bahrain',
    countryCode: 'BH',
    fund: 'Mumtalakat',
    fundKey: 'mumtalakat',
    type: 'explicit',
    level: 'strategic',
    nature: 'Early Regulatory Sandbox Support',
    natureKey: 'regulatorySandbox',
    description: 'First Gulf nation to grant full Binance license; supports BNB payment network via fintech subsidiaries.',
    descriptionKey: 'bahrainDescription',
    status: 'active',
    lastUpdated: '2026-01-12T14:00:00Z',
  },
];

// Implicit Support: VC Penetration (The Shadow Backers)
export const implicitSupporters: SovereignSupporter[] = [
  {
    id: 'sg-vertex',
    country: 'Singapore',
    countryCode: 'SG',
    fund: 'Vertex Ventures (Temasek-linked)',
    fundKey: 'vertexVentures',
    type: 'implicit',
    level: 'indirect',
    nature: 'LP Investment in Crypto VCs',
    natureKey: 'lpInvestment',
    description: 'Indirect BNB exposure through DeFi infrastructure investments on BNB Chain.',
    descriptionKey: 'singaporeDescription',
    status: 'monitoring',
    lastUpdated: '2026-01-08T10:00:00Z',
  },
  {
    id: 'hk-soe',
    country: 'Hong Kong/China',
    countryCode: 'HK',
    fund: 'SOE-linked Funds (CPIC, CMBI offshore)',
    fundKey: 'soeFunds',
    type: 'implicit',
    level: 'infrastructure',
    nature: 'Computing & Storage Support',
    natureKey: 'computingStorage',
    description: 'Participating in Greenfield (storage chain) node construction via HK Web3 compliance channels.',
    descriptionKey: 'hongkongDescription',
    status: 'monitoring',
    lastUpdated: '2026-01-05T16:00:00Z',
  },
];

export const allSovereignSupporters = [...explicitSupporters, ...implicitSupporters];

// Summary statistics
export const sovereignStats = {
  explicitCount: explicitSupporters.length,
  implicitCount: implicitSupporters.length,
  strategicPartners: allSovereignSupporters.filter(s => s.level === 'strategic').length,
  infrastructurePartners: allSovereignSupporters.filter(s => s.level === 'infrastructure').length,
  activeCount: allSovereignSupporters.filter(s => s.status === 'active').length,
};
