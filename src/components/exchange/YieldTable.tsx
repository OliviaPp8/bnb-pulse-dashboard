import { useLanguage } from '@/i18n';
import { YieldData } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TranslationKey } from '@/i18n/translations';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface YieldTableProps {
  data: YieldData[];
  isLoading?: boolean;
}

export function YieldTable({ data, isLoading }: YieldTableProps) {
  const { t } = useLanguage();

  const getAprColor = (apr: number) => {
    if (apr >= 8) return 'bg-success text-success-foreground';
    if (apr >= 5) return 'bg-primary text-primary-foreground';
    return 'bg-secondary text-secondary-foreground';
  };

  return (
    <Card className="card-glow">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">
          {t('yieldRankings')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground">{t('channel')}</TableHead>
              <TableHead className="text-muted-foreground">{t('productType')}</TableHead>
              <TableHead className="text-right text-muted-foreground">{t('apr')}</TableHead>
              <TableHead className="text-muted-foreground">{t('bonusRewards')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index} className="border-border">
                <TableCell className="font-medium text-foreground">
                  <span className="flex items-center gap-1">
                    {t(item.channelKey as TranslationKey)}
                    {item.isEstimated && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-3 w-3 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{t('estimatedValueNote')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {t(item.productTypeKey as TranslationKey)}
                </TableCell>
                <TableCell className="text-right">
                  <Badge className={`${getAprColor(item.apr)} ${item.isEstimated ? 'opacity-70' : ''}`}>
                    {item.isEstimated ? '~' : ''}{item.apr.toFixed(1)}%
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {t(item.bonusKey as TranslationKey)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="mt-2 text-xs text-muted-foreground">
          * {t('estimatedValueFootnote')}
        </p>
      </CardContent>
    </Card>
  );
}
