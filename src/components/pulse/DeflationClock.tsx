import { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame, Loader2, TrendingDown } from 'lucide-react';
import { useBep95Burn } from '@/hooks/useBep95Burn';
import { useBurnInfo } from '@/hooks/useBurnInfo';

export function DeflationClock() {
  const { t } = useLanguage();
  const { burnRate, isLoading: isBurnLoading } = useBep95Burn();
  const { nextBurnEstimatedAmount, currentBurnProgress, nextBurnDate, isLoading: isBurnInfoLoading } = useBurnInfo();
  
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(nextBurnDate));

  function calculateTimeLeft(targetDate: Date) {
    const difference = targetDate.getTime() - Date.now();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(nextBurnDate));
    }, 1000);

    return () => clearInterval(timer);
  }, [nextBurnDate]);

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(0)}K`;
    }
    return num.toFixed(0);
  };

  return (
    <Card className="card-glow">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          {t('deflationClock')}
          {(isBurnLoading || isBurnInfoLoading) && (
            <Loader2 className="h-3 w-3 animate-spin" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Next Burn Label */}
        <p className="text-xs text-muted-foreground">{t('nextQuarterlyBurn')}</p>

        {/* Countdown Grid */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: timeLeft.days, label: t('days') },
            { value: timeLeft.hours, label: t('hours') },
            { value: timeLeft.minutes, label: t('minutes') },
            { value: timeLeft.seconds, label: t('seconds') },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <div className="rounded-lg bg-secondary p-2">
                <span className="font-mono text-xl font-bold text-foreground">
                  {String(item.value).padStart(2, '0')}
                </span>
              </div>
              <span className="mt-1 block text-[10px] text-muted-foreground">
                {item.label}
              </span>
            </div>
          ))}
        </div>

        {/* Estimated Burn Amount & Progress */}
        <div className="space-y-2 rounded-lg bg-secondary/50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-chart-yellow" />
              <span className="text-xs text-muted-foreground">{t('estimatedBurnAmount')}</span>
            </div>
            <span className="font-mono text-sm font-bold text-chart-yellow">
              {formatNumber(nextBurnEstimatedAmount)} BNB
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">{t('quarterProgress')}</span>
              <span className="font-mono text-foreground">{currentBurnProgress.toFixed(1)}%</span>
            </div>
            <Progress value={currentBurnProgress} className="h-1.5" />
          </div>
        </div>

        {/* BEP-95 Burn Rate */}
        <div className="flex items-center justify-between rounded-lg bg-destructive/10 p-3">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 animate-pulse-glow text-destructive" />
            <span className="text-xs text-muted-foreground">{t('bep95BurnRate')}</span>
          </div>
          {isBurnLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <span className="font-mono text-sm font-bold text-destructive">
              {burnRate.toFixed(2)} BNB{t('perMinute')}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
