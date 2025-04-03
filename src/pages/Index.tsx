
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import MarketOverview from '@/components/MarketOverview';
import StockChart from '@/components/StockChart';
import WatchlistCard from '@/components/WatchlistCard';
import NewsCard from '@/components/NewsCard';
import InsightsCard from '@/components/InsightsCard';
import PortfolioSummary from '@/components/PortfolioSummary';

const Index = () => {
  // In a real app, we would load this data from APIs
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Skeleton loaders */}
            {Array(6).fill(0).map((_, i) => (
              <div 
                key={i} 
                className={`animate-pulse bg-card rounded-lg h-[320px] ${
                  i === 0 ? 'lg:col-span-2' : ''
                }`}
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StockChart symbol="AAPL" company="Apple Inc." />
            <MarketOverview />
            <WatchlistCard />
            <NewsCard />
            <InsightsCard />
            <PortfolioSummary />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
