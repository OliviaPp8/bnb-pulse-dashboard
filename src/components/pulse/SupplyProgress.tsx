import { useLanguage } from '@/i18n';
import { SupplyData } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SupplyProgressProps {
  data: SupplyData;
}

export function SupplyProgress({ data }: SupplyProgressProps) {
  const { t } = useLanguage();
  
  const progressPercent = ((data.circulating - data.target) / (200_000_000 - data.target)) * 100;
  const burnedPercent = 100 - progressPercent;

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(0)}M`;
    }
    return num.toLocaleString();
  };

  return (
    <Card className="card-glow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {t('circulatingSupply')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Number */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">
            {formatNumber(data.circulating)}
          </span>
          <span className="text-sm text-muted-foreground">BNB</span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{t('targetSupply')}: {formatNumber(data.target)}</span>
            <span className="text-primary">{burnedPercent.toFixed(1)}% {t('burnProgress')}</span>
          </div>
          <div className="relative h-3 overflow-hidden rounded-full bg-secondary">
            <div 
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-primary to-warning transition-all duration-1000"
              style={{ width: `${burnedPercent}%` }}
            />
          </div>
        </div>

        {/* Burned Stats */}
        <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
          <span className="text-xs text-muted-foreground">{t('totalBurned')}</span>
          <span className="font-mono text-sm font-bold text-success">
            {formatNumber(data.totalBurned)} BNB
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
