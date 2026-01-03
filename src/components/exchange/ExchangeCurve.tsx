import { useLanguage } from '@/i18n';
import { YieldTable } from './YieldTable';
import { AirdropTracker } from './AirdropTracker';
import { mockYieldData, mockAirdropData } from '@/data/mockData';

export function ExchangeCurve() {
  const { t } = useLanguage();

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-8 w-1 rounded-full bg-success" />
        <div>
          <h2 className="text-xl font-bold text-foreground">{t('exchangeCurve')}</h2>
          <p className="text-sm text-muted-foreground">{t('exchangeCurveDesc')}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <YieldTable data={mockYieldData} />
        </div>
        <div>
          <AirdropTracker data={mockAirdropData} />
        </div>
      </div>
    </section>
  );
}
