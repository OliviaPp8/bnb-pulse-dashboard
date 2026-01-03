import { useLanguage } from '@/i18n';
import { mockInstitutionalHoldings } from '@/data/mockData';
import { Building2 } from 'lucide-react';

export function InstitutionalRankings() {
  const { t } = useLanguage();

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatCurrency = (num: number) => {
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center gap-2">
        <Building2 className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">{t('institutionalRankings')}</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="pb-3 font-medium">{t('ticker')}</th>
              <th className="pb-3 font-medium">{t('company')}</th>
              <th className="pb-3 text-right font-medium">{t('holdings')}</th>
              <th className="pb-3 text-right font-medium">{t('costBasis')}</th>
              <th className="pb-3 text-right font-medium">{t('mNavPremium')}</th>
            </tr>
          </thead>
          <tbody>
            {mockInstitutionalHoldings.map((holding) => (
              <tr key={holding.ticker} className="border-b border-border/50">
                <td className="py-3 font-mono font-semibold text-primary">
                  {holding.ticker}
                </td>
                <td className="py-3 text-foreground">{holding.company}</td>
                <td className="py-3 text-right text-foreground">
                  {formatNumber(holding.holdings)} BNB
                </td>
                <td className="py-3 text-right text-muted-foreground">
                  {formatCurrency(holding.costBasis)}
                </td>
                <td className="py-3 text-right">
                  <span className="rounded-md bg-primary/20 px-2 py-1 font-mono text-primary">
                    {holding.mNavPremium}x
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
