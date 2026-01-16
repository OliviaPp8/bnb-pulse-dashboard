import { useLanguage } from '@/i18n';
import { Landmark } from 'lucide-react';
import { InstitutionalRankings } from './InstitutionalRankings';
import { SovereignMonitor } from './SovereignMonitor';

export function SovereignCurve() {
  const { t } = useLanguage();

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
          <Landmark className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">{t('datSovereignCurve')}</h2>
          <p className="text-sm text-muted-foreground">{t('datSovereignCurveDesc')}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left Column: Institutional Rankings */}
        <InstitutionalRankings />

        {/* Right Column: Sovereign */}
        <SovereignMonitor />
      </div>
    </section>
  );
}
