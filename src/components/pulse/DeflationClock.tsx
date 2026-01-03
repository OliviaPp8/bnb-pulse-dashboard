import { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n';
import { BurnData } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';

interface DeflationClockProps {
  data: BurnData;
}

export function DeflationClock({ data }: DeflationClockProps) {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = data.nextBurnDate.getTime() - Date.now();
    
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
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [data.nextBurnDate]);

  return (
    <Card className="card-glow">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {t('deflationClock')}
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

        {/* BEP-95 Burn Rate */}
        <div className="flex items-center justify-between rounded-lg bg-destructive/10 p-3">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 animate-pulse-glow text-destructive" />
            <span className="text-xs text-muted-foreground">{t('bep95BurnRate')}</span>
          </div>
          <span className="font-mono text-sm font-bold text-destructive">
            {data.bep95BurnRate.toFixed(2)} BNB{t('perMinute')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
