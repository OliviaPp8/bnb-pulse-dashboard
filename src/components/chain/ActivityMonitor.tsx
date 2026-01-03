import { useLanguage } from '@/i18n';
import { ChainMetrics } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Fuel, Users } from 'lucide-react';
import { TranslationKey } from '@/i18n/translations';

interface ActivityMonitorProps {
  data: ChainMetrics[];
}

export function ActivityMonitor({ data }: ActivityMonitorProps) {
  const { t } = useLanguage();

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}K`;
    }
    return num.toFixed(1);
  };

  return (
    <Card className="card-glow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Activity className="h-4 w-4 text-chart-blue" />
          {t('activityMonitor')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((chain) => (
          <div key={chain.network} className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">
              {t(chain.networkKey as TranslationKey)}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {/* TPS */}
              <div className="rounded-lg bg-secondary/50 p-2 text-center">
                <Activity className="mx-auto mb-1 h-3 w-3 text-muted-foreground" />
                <p className="font-mono text-sm font-bold text-foreground">
                  {formatNumber(chain.tps)}
                </p>
                <p className="text-[10px] text-muted-foreground">{t('tps')}</p>
              </div>
              {/* Gas */}
              <div className="rounded-lg bg-secondary/50 p-2 text-center">
                <Fuel className="mx-auto mb-1 h-3 w-3 text-muted-foreground" />
                <p className="font-mono text-sm font-bold text-foreground">
                  {chain.gasPrice}
                </p>
                <p className="text-[10px] text-muted-foreground">{t('gwei')}</p>
              </div>
              {/* DAU */}
              <div className="rounded-lg bg-secondary/50 p-2 text-center">
                <Users className="mx-auto mb-1 h-3 w-3 text-muted-foreground" />
                <p className="font-mono text-sm font-bold text-foreground">
                  {formatNumber(chain.dau)}
                </p>
                <p className="text-[10px] text-muted-foreground">{t('dau')}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
