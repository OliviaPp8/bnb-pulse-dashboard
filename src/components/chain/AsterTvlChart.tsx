import { useLanguage } from '@/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Loader2 } from 'lucide-react';
import { useAsterTvl } from '@/hooks/useAsterTvl';

interface TokenBar {
  name: string;
  usd: number;
  color: string;
}

export function AsterTvlChart() {
  const { t } = useLanguage();
  const { data, isLoading, error } = useAsterTvl();

  const formatNumber = (num: number) => {
    if (num >= 1_000_000_000) {
      return `$${(num / 1_000_000_000).toFixed(2)}B`;
    }
    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(0)}M`;
    }
    if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(0)}K`;
    }
    return `$${num.toFixed(0)}`;
  };

  // Build token breakdown data (backing composition: slisBNB + BNB)
  const tokens: TokenBar[] = data ? [
    { name: 'slisBNB', usd: data.tokens.slisBnb.usd, color: 'hsl(var(--chart-blue))' },
    { name: 'BNB', usd: data.tokens.bnb.usd, color: 'hsl(var(--success))' },
  ].filter(t => t.usd > 0) : [];

  const totalFromTokens = tokens.reduce((sum, t) => sum + t.usd, 0);

  return (
    <Card className="card-glow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <BarChart3 className="h-4 w-4 text-chart-yellow" />
          {t('asterTvl')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex h-20 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex h-20 items-center justify-center">
            <p className="text-sm text-muted-foreground">{t('loadingError')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Total TVL */}
            <div className="rounded-lg bg-chart-yellow/10 p-3 text-center">
              <p className="text-xs text-muted-foreground">{t('asterBscTvl')}</p>
              <p className="text-2xl font-bold text-chart-yellow">
                {formatNumber(data?.totalTvl || 0)}
              </p>
            </div>

            {/* Token Breakdown Bar */}
            {totalFromTokens > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground text-center">Backing Composition (Est.)</p>
                {/* Stacked Bar */}
                <div className="flex h-6 w-full overflow-hidden rounded-full">
                  {tokens.map((token, idx) => {
                    const percentage = (token.usd / totalFromTokens) * 100;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-center text-[10px] font-medium text-white transition-all"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: token.color,
                        }}
                        title={`${token.name}: ${formatNumber(token.usd)} (${percentage.toFixed(0)}%)`}
                      >
                        {percentage > 15 ? `${token.name} ${percentage.toFixed(0)}%` : ''}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-3 text-xs">
                  {tokens.map((token, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: token.color }}
                      />
                      <span className="text-muted-foreground">{token.name}</span>
                      <span className="font-medium text-foreground">{formatNumber(token.usd)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
