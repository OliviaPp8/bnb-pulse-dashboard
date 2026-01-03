import { useState, useCallback } from 'react';
import { Header } from '@/components/Header';
import { ThePulse } from '@/components/pulse';
import { ExchangeCurve } from '@/components/exchange';
import { ChainCurve } from '@/components/chain';
import { SovereignCurve } from '@/components/sovereign';

const Index = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    // Simulate refresh delay - will be replaced with real API calls
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onRefresh={handleRefresh} 
        lastUpdated={lastUpdated} 
        isRefreshing={isRefreshing} 
      />
      
      <main className="container space-y-8 py-6">
        {/* The Pulse - Core Vitals */}
        <ThePulse />

        {/* Exchange Curve - Yield Rankings */}
        <ExchangeCurve />

        {/* Chain Curve - On-chain Activity */}
        <ChainCurve />

        {/* DAT & Sovereign Curve - Institutional Holdings */}
        <SovereignCurve />
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container text-center text-xs text-muted-foreground">
          <p>BNB Alpha Terminal © 2025 | Data for informational purposes only</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
