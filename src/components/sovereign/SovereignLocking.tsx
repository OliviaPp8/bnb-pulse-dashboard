import { useLanguage } from '@/i18n';
import { mockSovereignData } from '@/data/mockData';
import { Lock } from 'lucide-react';

export function SovereignLocking() {
  const { t } = useLanguage();

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(2)}M`;
    }
    return num.toLocaleString();
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center gap-2">
        <Lock className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">{t('sovereignLocking')}</h3>
      </div>

      <div className="flex flex-col items-center gap-4">
        {/* Percentage Display */}
        <div className="flex items-baseline gap-2">
          <span className="text-gradient-gold text-5xl font-bold">
            {mockSovereignData.lockPercentage}%
          </span>
          <span className="text-sm text-muted-foreground">{t('ofCirculating')}</span>
        </div>

        {/* Progress Bar */}
        <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-500"
            style={{ width: `${mockSovereignData.lockPercentage * 5}%` }}
          />
        </div>

        {/* Total Locked */}
        <div className="flex w-full items-center justify-between rounded-lg border border-border/50 bg-background/50 p-3">
          <span className="text-sm text-muted-foreground">{t('totalSovereignLocked')}</span>
          <span className="font-mono text-lg font-semibold text-foreground">
            {formatNumber(mockSovereignData.totalLocked)} BNB
          </span>
        </div>
      </div>
    </div>
  );
}
