import { useLanguage } from '@/i18n';
import { SupplyProgress } from './SupplyProgress';
import { DeflationClock } from './DeflationClock';
import { BestYield } from './BestYield';
import { mockSupplyData, mockBurnData, bestYieldCombination } from '@/data/mockData';

export function ThePulse() {
  const { t } = useLanguage();

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-1 rounded-full bg-primary" />
        <div>
          <h2 className="text-xl font-bold text-foreground">{t('thePulse')}</h2>
          <p className="text-sm text-muted-foreground">{t('thePulseDesc')}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SupplyProgress />
        <DeflationClock data={mockBurnData} />
        <BestYield data={bestYieldCombination} />
      </div>
    </section>
  );
}
