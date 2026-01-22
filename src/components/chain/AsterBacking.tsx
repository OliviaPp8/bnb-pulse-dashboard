import { useLanguage } from '@/i18n';
import { useAsterOnchain } from '@/hooks/useAsterOnchain';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Star, ExternalLink, Info } from 'lucide-react';

function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `$${(num / 1_000_000_000).toFixed(2)}B`;
  }
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(1)}M`;
  }
  if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(0)}K`;
  }
  return `$${num.toFixed(0)}`;
}

function formatAmount(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`;
  }
  return num.toFixed(2);
}

export function AsterBacking() {
  const { t } = useLanguage();
  const { data, isLoading, error } = useAsterOnchain();

  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur border-border/50 col-span-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return null; // Don't show card on error
  }

  const tokens = [
    { 
      name: 'slisBNB', 
      usd: data.backing.slisBnb.usd, 
      percentage: data.backing.slisBnb.percentage,
      color: 'hsl(var(--chart-blue))',
      amount: data.backing.slisBnb.amount,
    },
    { 
      name: 'BNB', 
      usd: data.backing.bnb.usd, 
      percentage: data.backing.bnb.percentage,
      color: 'hsl(var(--success))',
      amount: data.backing.bnb.amount,
    },
  ].filter(t => t.usd > 0);

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50 col-span-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-chart-yellow/10">
              <Star className="h-4 w-4 text-chart-yellow" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                asBNB (Aster)
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{t('asterIndexTooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
              <p className="text-xs text-muted-foreground">Liquid Staking + Launchpool</p>
            </div>
          </div>
          <a 
            href="https://www.astherus.finance/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            astherus.finance
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Row */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">Total TVL</p>
            <p className="text-xl font-bold text-chart-yellow">
              {formatNumber(data.totalTvlUsd)}
            </p>
          </div>
          <div className="rounded-lg bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">asBNB Supply</p>
            <p className="text-xl font-bold text-foreground">
              {formatAmount(data.asBnbSupply)}
            </p>
          </div>
          <div className="rounded-lg bg-muted/30 p-3 text-center">
            <p className="text-xs text-muted-foreground">Est. APY</p>
            <p className="text-xl font-bold text-chart-green">
              {data.apy > 0 ? `${data.apy.toFixed(1)}%` : '-'}
            </p>
          </div>
        </div>

        {/* Backing Composition */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground text-center">{t('backingComposition')}</p>
          
          {/* Stacked Bar */}
          <div className="flex h-6 w-full overflow-hidden rounded-full">
            {tokens.map((token, idx) => (
              <TooltipProvider key={idx}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className="flex items-center justify-center text-[10px] font-medium text-white transition-all cursor-default"
                      style={{
                        width: `${token.percentage}%`,
                        backgroundColor: token.color,
                      }}
                    >
                      {token.percentage > 15 ? `${token.name} ${token.percentage.toFixed(0)}%` : ''}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{token.name}: {formatAmount(token.amount)}</p>
                    <p className="text-xs text-muted-foreground">{formatNumber(token.usd)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 text-xs">
            {tokens.map((token, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <div
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: token.color }}
                />
                <span className="text-muted-foreground">{token.name}</span>
                <span className="font-medium text-foreground">{formatNumber(token.usd)}</span>
                <span className="text-muted-foreground">({formatAmount(token.amount)})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Source */}
        <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
          <span>{t('onchainData')} via NodeReal</span>
        </div>
      </CardContent>
    </Card>
  );
}
