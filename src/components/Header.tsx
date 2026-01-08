import { useLanguage } from '@/i18n';
import { Twitter, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import bnbLogo from '@/assets/bnb-logo.png';

interface HeaderProps {
  onRefresh: () => void;
  lastUpdated: Date;
  isRefreshing: boolean;
}

export function Header({ onRefresh, lastUpdated, isRefreshing }: HeaderProps) {
  const { language, setLanguage, t } = useLanguage();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <img src={bnbLogo} alt="BNB" className="h-10 w-10" />
          <div>
            <h1 className="text-lg font-bold text-foreground">{t('title')}</h1>
            <p className="text-xs text-muted-foreground">{t('subtitle')}</p>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          {/* Last Updated */}
          <div className="hidden text-xs text-muted-foreground sm:block">
            {t('lastUpdated')}: {formatTime(lastUpdated)}
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{t('refresh')}</span>
          </Button>

          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')}
            className="font-medium"
          >
            {language === 'en' ? '中文' : 'EN'}
          </Button>

          {/* Twitter Link */}
          <a
            href="https://x.com/0xOliviaPp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Twitter className="h-5 w-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
