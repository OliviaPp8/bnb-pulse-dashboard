import { useLanguage } from '@/i18n';
import { AirdropData } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gift } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AirdropTrackerProps {
  data: AirdropData;
}

export function AirdropTracker({ data }: AirdropTrackerProps) {
  const { t } = useLanguage();

  const formatValue = (value: number) => {
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    return `$${(value / 1_000).toFixed(0)}K`;
  };

  return (
    <Card className="card-glow h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Gift className="h-4 w-4 text-primary" />
          {t('airdropTracker')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-xs text-muted-foreground">{t('airdropsIn2025')}</p>
            <p className="text-2xl font-bold text-primary">{data.count}</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-3">
            <p className="text-xs text-muted-foreground">{t('totalShadowDividend')}</p>
            <p className="text-2xl font-bold text-success">{formatValue(data.totalValue)}</p>
            <p className="text-[10px] text-muted-foreground">{t('estimated')}</p>
          </div>
        </div>

        {/* Mini Chart */}
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.history}>
              <defs>
                <linearGradient id="airdropGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(43, 89%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(43, 89%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(220, 9%, 55%)', fontSize: 10 }}
              />
              <YAxis hide />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(228, 12%, 12%)',
                  border: '1px solid hsl(228, 10%, 20%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: 'hsl(40, 6%, 95%)' }}
                formatter={(value: number) => [formatValue(value), 'Value']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(43, 89%, 50%)"
                strokeWidth={2}
                fill="url(#airdropGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
