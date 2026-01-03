import { useLanguage } from '@/i18n';
import { AsterData } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AsterIndexProps {
  data: AsterData;
}

export function AsterIndex({ data }: AsterIndexProps) {
  const { t } = useLanguage();

  const formatValue = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(1)}M`;
    }
    return `$${(value / 1_000).toFixed(0)}K`;
  };

  return (
    <Card className="card-glow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <TrendingUp className="h-4 w-4 text-chart-purple" />
          {t('asterIndex')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Arbitrage Window Status */}
        <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className={`h-4 w-4 ${data.isArbitrageOpen ? 'text-success' : 'text-muted-foreground'}`} />
            <span className="text-xs text-muted-foreground">{t('arbitrageWindow')}</span>
          </div>
          <Badge 
            variant={data.isArbitrageOpen ? 'default' : 'secondary'}
            className={data.isArbitrageOpen ? 'bg-success hover:bg-success' : ''}
          >
            {data.isArbitrageOpen ? t('open') : t('closed')}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-xs text-muted-foreground">{t('tradingVolume')}</p>
            <p className="font-mono text-lg font-bold text-foreground">
              {formatValue(data.tradingVolume)}
            </p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-xs text-muted-foreground">{t('actualHoldings')}</p>
            <p className="font-mono text-lg font-bold text-foreground">
              {formatValue(data.actualHoldings)}
            </p>
          </div>
        </div>

        {/* Ratio Display */}
        <div className="rounded-lg bg-chart-purple/10 p-3 text-center">
          <p className="text-xs text-muted-foreground">{t('ratio')}</p>
          <p className="text-2xl font-bold text-chart-purple">
            {data.ratio.toFixed(2)}x
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
