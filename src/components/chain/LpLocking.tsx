import { useLanguage } from '@/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Droplets, Loader2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TranslationKey } from '@/i18n/translations';

export interface LpLockData {
  platform: string;
  platformKey: string;
  lockedValue: number;
  lpPairs: number;
}

interface LpLockingProps {
  data: LpLockData[];
  isLoading?: boolean;
  error?: Error | null;
}

export function LpLocking({ data, isLoading, error }: LpLockingProps) {
  const { t } = useLanguage();

  const totalLocked = data.reduce((sum, item) => sum + item.lockedValue, 0);

  const formatNumber = (num: number) => {
    if (num >= 1_000_000_000) {
      return `$${(num / 1_000_000_000).toFixed(2)}B`;
    }
    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`;
    }
    return `$${(num / 1_000).toFixed(0)}K`;
  };

  const chartData = data.map((item) => ({
    name: t(item.platformKey as TranslationKey) || item.platform,
    value: item.lockedValue,
  }));

  const colors = ['hsl(199, 89%, 48%)', 'hsl(262, 83%, 58%)', 'hsl(340, 82%, 52%)', 'hsl(142, 76%, 36%)'];

  return (
    <Card className="card-glow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Droplets className="h-4 w-4 text-chart-blue" />
          {t('lpLocking')}
          {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
          {error && (
            <span className="text-destructive" title={error.message}>
              <AlertCircle className="h-3 w-3" />
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Locked Value */}
        <div className="rounded-lg bg-chart-blue/10 p-3 text-center">
          <p className="text-xs text-muted-foreground">{t('totalLockedValue')}</p>
          <p className="text-2xl font-bold text-chart-blue">
            {formatNumber(totalLocked)}
          </p>
        </div>

        {/* Bar Chart */}
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis 
                type="category" 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(220, 9%, 55%)', fontSize: 11 }}
                width={100}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(228, 12%, 12%)',
                  border: '1px solid hsl(228, 10%, 20%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'hsl(40, 6%, 95%)',
                }}
                labelStyle={{ color: 'hsl(40, 6%, 95%)' }}
                itemStyle={{ color: 'hsl(40, 6%, 95%)' }}
                formatter={(value: number) => [formatNumber(value), t('totalLockedValue')]}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Data source indicator */}
        <div className="flex items-center justify-end gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] text-muted-foreground">DefiLlama API</span>
        </div>
      </CardContent>
    </Card>
  );
}
