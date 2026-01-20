import { useLanguage } from '@/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Loader2 } from 'lucide-react';
import { useAsterTvl } from '@/hooks/useAsterTvl';

export function AsterTvlChart() {
  const { t } = useLanguage();
  const { data, isLoading, error } = useAsterTvl();

  const formatNumber = (num: number) => {
    if (num >= 1_000_000_000) {
      return `$${(num / 1_000_000_000).toFixed(2)}B`;
    }
    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`;
    }
    if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(0)}K`;
    }
    return `$${num.toFixed(0)}`;
  };

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
          <div className="rounded-lg bg-chart-yellow/10 p-4 text-center">
            <p className="text-xs text-muted-foreground">{t('asterBscTvl')}</p>
            <p className="text-2xl font-bold text-chart-yellow">
              {formatNumber(data?.totalTvl || 0)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
