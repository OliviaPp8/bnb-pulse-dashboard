import { useLanguage } from '@/i18n';
import { mockSovereignNodes } from '@/data/mockData';
import { Globe, Signal, SignalZero } from 'lucide-react';

export function SovereignMonitor() {
  const { t, language } = useLanguage();

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center gap-2">
        <Globe className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">{t('sovereignMonitor')}</h3>
      </div>

      <p className="mb-4 text-xs text-muted-foreground">{t('strategicNodes')}</p>

      <div className="space-y-3">
        {mockSovereignNodes.map((node) => (
          <div
            key={node.region}
            className="flex items-center justify-between rounded-lg border border-border/50 bg-background/50 p-3"
          >
            <div className="flex items-center gap-3">
              {node.status === 'active' ? (
                <Signal className="h-4 w-4 text-green-500" />
              ) : (
                <SignalZero className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="font-medium text-foreground">
                {t(node.regionKey as any)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  node.status === 'active'
                    ? 'bg-green-500/20 text-green-500'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {t(node.status as any)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatLastSeen(node.lastSeen)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
