import { useLanguage } from '@/i18n';
import { YieldTable } from './YieldTable';
import { AirdropTracker } from './AirdropTracker';
import { mockAirdropData } from '@/data/mockData';
import { useBinanceYields } from '@/hooks/useBinanceYields';
import { Loader2, Wifi, WifiOff } from 'lucide-react';

export function ExchangeCurve() {
  const { t } = useLanguage();
  const { data, isLoading, error } = useBinanceYields();

  const yieldData = data?.yields || [];
  const lastUpdated = data?.lastUpdated;
  const isLive = data?.isLive || false;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-success" />
          <div>
            <h2 className="text-xl font-bold text-foreground">{t('exchangeCurve')}</h2>
            <p className="text-sm text-muted-foreground">{t('exchangeCurveDesc')}</p>
          </div>
        </div>

        {/* Data source indicator */}
        <div className="flex items-center gap-2 text-xs">
          {isLoading ? (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              {t('loading')}...
            </span>
          ) : isLive ? (
            <span className="flex items-center gap-1 text-success">
              <Wifi className="h-3 w-3" />
              Binance API
            </span>
          ) : (
            <span className="flex items-center gap-1 text-muted-foreground">
              <WifiOff className="h-3 w-3" />
              Mock Data
            </span>
          )}
          {lastUpdated && (
            <span className="text-muted-foreground">
              {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <YieldTable data={yieldData} isLoading={isLoading} />
        </div>
        <div>
          <AirdropTracker data={mockAirdropData} />
        </div>
      </div>
    </section>
  );
}
