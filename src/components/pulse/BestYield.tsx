import { useLanguage } from '@/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

interface BestYieldProps {
  data: {
    protocol: string;
    apr: number;
  };
}

export function BestYield({ data }: BestYieldProps) {
  const { t } = useLanguage();

  return (
    <Card className="card-glow relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
      
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {t('bestYield')}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative space-y-4">
        {/* Current Top APR Label */}
        <p className="text-xs text-muted-foreground">{t('currentTopApr')}</p>

        {/* APR Display */}
        <div className="flex items-baseline gap-2">
          <span className="text-gradient-gold text-4xl font-bold">
            {data.apr}%
          </span>
          <span className="text-sm text-muted-foreground">APR</span>
        </div>

        {/* Protocol Info */}
        <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">{t('combined')}</span>
          </div>
          <span className="text-sm font-medium text-foreground">
            {data.protocol}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
