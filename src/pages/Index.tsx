import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import MarketOverview from '@/components/MarketOverview';
import StockChart from '@/components/StockChart';
import WatchlistCard from '@/components/WatchlistCard';
import NewsCard from '@/components/NewsCard';
import InsightsCard from '@/components/InsightsCard';
import PortfolioSummary from '@/components/PortfolioSummary';
import { ArrowUp, ArrowDown, StarIcon } from 'lucide-react';

const Index = () => {
  // In a real app, we would load this data from APIs
  const [isLoading, setIsLoading] = useState(true);
  
  const [featuredStock, setFeaturedStock] = useState({
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    price: 2874.25,
    change: 32.45,
    changePercent: 1.14
  });
  
  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const indianWatchlist = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', price: 2874.25, change: 32.45, changePercent: 1.14, favorite: true },
    { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', price: 3671.80, change: 45.20, changePercent: 1.25, favorite: true },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: 1689.35, change: -12.40, changePercent: -0.73, favorite: false },
    { symbol: 'INFY', name: 'Infosys Ltd.', price: 1522.75, change: 18.55, changePercent: 1.23, favorite: true },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', price: 942.15, change: -12.35, changePercent: -1.29, favorite: false }
  ];
  
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
            <StockChart symbol="RELIANCE" company="Reliance Industries Ltd." />
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
