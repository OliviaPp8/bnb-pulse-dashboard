import { useLanguage } from '@/i18n';
import { ActivityMonitor } from './ActivityMonitor';
import { LsdLocking } from './LsdLocking';
import { LpLocking } from './LpLocking';
import { AsterIndex } from './AsterIndex';
import { mockLsdData, mockAsterData, mockLpLockData } from '@/data/mockData';

export function ChainCurve() {
  const { t } = useLanguage();

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-1 rounded-full bg-chart-blue" />
        <div>
          <h2 className="text-xl font-bold text-foreground">{t('chainCurve')}</h2>
          <p className="text-sm text-muted-foreground">{t('chainCurveDesc')}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ActivityMonitor />
        <LsdLocking data={mockLsdData} />
        <LpLocking data={mockLpLockData} />
        <AsterIndex data={mockAsterData} />
      </div>
    </section>
  );
}
