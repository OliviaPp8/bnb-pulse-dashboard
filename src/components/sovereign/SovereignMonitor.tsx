import { useLanguage } from '@/i18n';
import { 
  explicitSupporters, 
  implicitSupporters, 
  sovereignStats,
  type SovereignSupporter,
  type SupportLevel 
} from '@/data/sovereignData';
import { 
  Globe, 
  Shield, 
  Eye, 
  Building, 
  Server,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

function SupporterCard({ supporter }: { supporter: SovereignSupporter }) {
  const { t, language } = useLanguage();

  const formatLastSeen = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getLevelColor = (level: SupportLevel) => {
    switch (level) {
      case 'strategic':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'infrastructure':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'indirect':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getLevelIcon = (level: SupportLevel) => {
    switch (level) {
      case 'strategic':
        return <Shield className="h-3 w-3" />;
      case 'infrastructure':
        return <Server className="h-3 w-3" />;
      case 'indirect':
        return <TrendingUp className="h-3 w-3" />;
    }
  };

  return (
    <div className="rounded-lg border border-border/50 bg-background/50 p-3 transition-colors hover:bg-background/80">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{getFlagEmoji(supporter.countryCode)}</span>
            <span className="font-medium text-foreground truncate">
              {supporter.country}
            </span>
            {supporter.status === 'active' ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-primary font-medium truncate">
            {t(supporter.fundKey as any) || supporter.fund}
          </p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${getLevelColor(supporter.level)}`}>
                {getLevelIcon(supporter.level)}
                {t(supporter.level as any)}
              </span>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-[200px]">
              <p className="text-xs">{t(supporter.natureKey as any) || supporter.nature}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
        {t(supporter.descriptionKey as any) || supporter.description}
      </p>
      
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>{t(supporter.natureKey as any) || supporter.nature}</span>
        <span>{formatLastSeen(supporter.lastUpdated)}</span>
      </div>
    </div>
  );
}

function getFlagEmoji(countryCode: string): string {
  const flags: Record<string, string> = {
    'AE': '🇦🇪',
    'KZ': '🇰🇿',
    'BH': '🇧🇭',
    'SG': '🇸🇬',
    'HK': '🇭🇰',
  };
  return flags[countryCode] || '🏳️';
}

export function SovereignMonitor() {
  const { t } = useLanguage();

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground">{t('sovereignMonitor')}</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500" />
            {sovereignStats.activeCount} {t('active')}
          </span>
        </div>
      </div>

      {/* Explicit Support Section */}
      <div className="mb-4">
        <div className="mb-2 flex items-center gap-2">
          <Shield className="h-4 w-4 text-green-500" />
          <h4 className="text-sm font-medium text-foreground">{t('explicitSupport')}</h4>
          <span className="text-xs text-muted-foreground">({t('theIronCore')})</span>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">{t('explicitSupportDesc')}</p>
        <div className="space-y-2">
          {explicitSupporters.map((supporter) => (
            <SupporterCard key={supporter.id} supporter={supporter} />
          ))}
        </div>
      </div>

      {/* Implicit Support Section */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <Eye className="h-4 w-4 text-gray-400" />
          <h4 className="text-sm font-medium text-foreground">{t('implicitSupport')}</h4>
          <span className="text-xs text-muted-foreground">({t('shadowBackers')})</span>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">{t('implicitSupportDesc')}</p>
        <div className="space-y-2">
          {implicitSupporters.map((supporter) => (
            <SupporterCard key={supporter.id} supporter={supporter} />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/50 pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span>{t('strategic')}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          <span>{t('infrastructure')}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-gray-500" />
          <span>{t('indirect')}</span>
        </div>
      </div>
    </div>
  );
}
