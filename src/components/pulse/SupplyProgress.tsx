import { useLanguage } from '@/i18n';
import { useBnbSupply } from '@/hooks/useBnbSupply';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle } from 'lucide-react';

export function SupplyProgress() {
  const { t } = useLanguage();
  const { circulating, target, totalBurned, isLoading, error } = useBnbSupply();
  
  const progressPercent = ((circulating - target) / (200_000_000 - target)) * 100;
  const burnedPercent = 100 - progressPercent;

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    }
    return num.toLocaleString();
  };

  return (
    <Card className="card-glow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {t('circulatingSupply')}
          {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
          {error && (
            <span className="text-destructive" title={error.message}>
              <AlertCircle className="h-3 w-3" />
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Number */}
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-foreground">
            {formatNumber(circulating)}
          </span>
          <span className="text-sm text-muted-foreground">BNB</span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{t('targetSupply')}: {formatNumber(target)}</span>
            <span className="text-primary">{burnedPercent.toFixed(1)}% {t('burnProgress')}</span>
          </div>
          <div className="relative h-3 overflow-hidden rounded-full bg-secondary">
            <div 
              className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-primary to-warning transition-all duration-1000"
              style={{ width: `${Math.min(Math.max(burnedPercent, 0), 100)}%` }}
            />
          </div>
        </div>

        {/* Burned Stats */}
        <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
          <span className="text-xs text-muted-foreground">{t('totalBurned')}</span>
          <span className="font-mono text-sm font-bold text-success">
            {formatNumber(totalBurned)} BNB
          </span>
        </div>

        {/* Real-time indicator */}
        <div className="flex items-center justify-end gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] text-muted-foreground">Etherscan API</span>
        </div>
      </CardContent>
    </Card>
  );
}
