import { useLanguage } from '@/i18n';
import { useBscYields, YieldPool } from '@/hooks/useBscYields';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { TrendingUp, Shield, Layers, Flame, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AsterBacking } from './AsterBacking';

function formatTvl(tvl: number): string {
  if (tvl >= 1_000_000_000) {
    return `$${(tvl / 1_000_000_000).toFixed(2)}B`;
  }
  if (tvl >= 1_000_000) {
    return `$${(tvl / 1_000_000).toFixed(2)}M`;
  }
  if (tvl >= 1_000) {
    return `$${(tvl / 1_000).toFixed(1)}K`;
  }
  return `$${tvl.toFixed(0)}`;
}

function formatApy(apy: number | null): string {
  if (apy === null || apy === undefined) return '-';
  if (apy < 0.01) return '<0.01%';
  if (apy < 1) return `${apy.toFixed(2)}%`;
  if (apy < 10) return `${apy.toFixed(1)}%`;
  return `${apy.toFixed(0)}%`;
}

function getApyColor(apy: number): string {
  if (apy >= 20) return 'text-chart-green';
  if (apy >= 10) return 'text-yellow-400';
  if (apy >= 5) return 'text-chart-blue';
  return 'text-muted-foreground';
}

function getProjectDisplayName(project: string): string {
  const nameMap: Record<string, string> = {
    'venus': 'Venus',
    'lista-dao': 'Lista DAO',
    'pancakeswap-amm-v3': 'PancakeSwap V3',
    'pancakeswap-amm': 'PancakeSwap V2',
    'tranchess': 'Tranchess',
    'kinza-finance': 'Kinza',
    'radiant-v2': 'Radiant',
    'thena-v1': 'Thena',
    'aster': 'Aster',
    'alpaca-finance': 'Alpaca',
    'wombat-exchange': 'Wombat',
    'biswap-v3': 'Biswap V3',
  };
  return nameMap[project.toLowerCase()] || project.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

interface YieldTableProps {
  pools: YieldPool[];
  isLoading: boolean;
  emptyMessage: string;
}

function YieldTable({ pools, isLoading, emptyMessage }: YieldTableProps) {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (pools.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="text-xs">{t('channel')}</TableHead>
          <TableHead className="text-xs">{t('productType')}</TableHead>
          <TableHead className="text-xs text-right">{t('apr')}</TableHead>
          <TableHead className="text-xs text-right hidden sm:table-cell">TVL</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {pools.map((pool, index) => (
          <TableRow key={`${pool.pool}-${index}`} className="hover:bg-muted/30">
            <TableCell className="py-2">
              <span className="font-medium text-sm">{getProjectDisplayName(pool.project)}</span>
            </TableCell>
            <TableCell className="py-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className="text-sm text-muted-foreground truncate max-w-[120px] block">
                      {pool.symbol}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{pool.symbol}</p>
                    {pool.poolMeta && <p className="text-xs text-muted-foreground">{pool.poolMeta}</p>}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableCell>
            <TableCell className="py-2 text-right">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <span className={`font-mono font-semibold ${getApyColor(pool.apy)}`}>
                      {formatApy(pool.apy)}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs space-y-1">
                      <p>Base: {formatApy(pool.apyBase)}</p>
                      <p>Reward: {formatApy(pool.apyReward)}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableCell>
            <TableCell className="py-2 text-right hidden sm:table-cell">
              <span className="text-sm text-muted-foreground font-mono">
                {formatTvl(pool.tvlUsd)}
              </span>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export function OnChainYields() {
  const { t } = useLanguage();
  const { data, isLoading, error } = useBscYields();

  const categories = [
    {
      key: 'stable' as const,
      title: t('stableYields'),
      description: t('stableYieldsDesc'),
      icon: Shield,
      color: 'text-chart-blue',
      bgColor: 'bg-chart-blue/10',
    },
    {
      key: 'structured' as const,
      title: t('structuredYields'),
      description: t('structuredYieldsDesc'),
      icon: Layers,
      color: 'text-chart-purple',
      bgColor: 'bg-chart-purple/10',
    },
    {
      key: 'degen' as const,
      title: t('degenYields'),
      description: t('degenYieldsDesc'),
      icon: Flame,
      color: 'text-chart-orange',
      bgColor: 'bg-chart-orange/10',
    },
  ];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-chart-green" />
          <div>
            <h2 className="text-xl font-bold text-foreground">{t('onChainYields')}</h2>
            <p className="text-sm text-muted-foreground">{t('onChainYieldsDesc')}</p>
          </div>
        </div>
        
        {data?.summary.topYield && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-chart-green/10">
            <TrendingUp className="h-4 w-4 text-chart-green" />
            <span className="text-sm text-muted-foreground">{t('topYield')}:</span>
            <span className="font-mono font-semibold text-chart-green">
              {formatApy(data.summary.topYield.apy)}
            </span>
            <span className="text-xs text-muted-foreground">
              ({data.summary.topYield.project})
            </span>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map(({ key, title, description, icon: Icon, color, bgColor }) => (
          <Card key={key} className="bg-card/50 backdrop-blur border-border/50">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${bgColor}`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">{title}</CardTitle>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <YieldTable 
                pools={data?.pools[key] || []} 
                isLoading={isLoading}
                emptyMessage={t('noYieldsFound')}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Aster asBNB - Stable Category Highlight */}
      <AsterBacking />

      {data?.lastUpdated && (
        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <span>{t('dataSource')}: DefiLlama</span>
          <ExternalLink className="h-3 w-3" />
        </div>
      )}
    </section>
  );
}
