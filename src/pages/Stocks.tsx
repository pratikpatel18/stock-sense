import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { fetchMarketIndices } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowUpRight, ArrowDownRight, Search } from 'lucide-react';

// Popular stock tickers for display
const popularStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', price: 175.04, change: 0.56, changePercent: 0.32 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology', price: 340.67, change: 3.45, changePercent: 1.02 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', price: 138.56, change: -0.78, changePercent: -0.56 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical', price: 174.63, change: 1.24, changePercent: 0.72 },
  { symbol: 'TSLA', name: 'Tesla, Inc.', sector: 'Automotive', price: 238.72, change: -4.29, changePercent: -1.76 },
  { symbol: 'META', name: 'Meta Platforms, Inc.', sector: 'Technology', price: 451.52, change: 7.89, changePercent: 1.78 },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology', price: 825.36, change: 15.32, changePercent: 1.89 },
  { symbol: 'NFLX', name: 'Netflix, Inc.', sector: 'Entertainment', price: 602.78, change: -2.36, changePercent: -0.39 },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial Services', price: 183.94, change: 1.45, changePercent: 0.79 },
  { symbol: 'V', name: 'Visa Inc.', sector: 'Financial Services', price: 275.36, change: 0.87, changePercent: 0.32 },
  { symbol: 'PG', name: 'Procter & Gamble Co.', sector: 'Consumer Defensive', price: 162.45, change: -0.34, changePercent: -0.21 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', price: 151.78, change: 0.92, changePercent: 0.61 },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc.', sector: 'Healthcare', price: 493.26, change: 5.87, changePercent: 1.2 },
  { symbol: 'HD', name: 'Home Depot Inc.', sector: 'Consumer Cyclical', price: 343.19, change: -1.23, changePercent: -0.36 },
  { symbol: 'PFE', name: 'Pfizer Inc.', sector: 'Healthcare', price: 27.43, change: -0.15, changePercent: -0.54 },
  { symbol: 'BAC', name: 'Bank of America Corp.', sector: 'Financial Services', price: 37.12, change: 0.45, changePercent: 1.23 },
];

// Market sectors with performance data
const sectors = [
  { name: 'Technology', performance: 1.24, monthlyPerformance: 2.87, yearlyPerformance: 15.43 },
  { name: 'Healthcare', performance: 0.56, monthlyPerformance: 1.34, yearlyPerformance: 8.76 },
  { name: 'Financial Services', performance: 0.89, monthlyPerformance: 2.12, yearlyPerformance: 9.54 },
  { name: 'Consumer Cyclical', performance: -0.34, monthlyPerformance: 0.78, yearlyPerformance: 7.65 },
  { name: 'Communication Services', performance: 0.67, monthlyPerformance: 1.56, yearlyPerformance: 11.23 },
  { name: 'Industrials', performance: 0.45, monthlyPerformance: 1.23, yearlyPerformance: 6.78 },
  { name: 'Consumer Defensive', performance: 0.12, monthlyPerformance: 0.45, yearlyPerformance: 3.56 },
  { name: 'Energy', performance: -1.23, monthlyPerformance: -2.45, yearlyPerformance: 5.67 },
  { name: 'Utilities', performance: -0.45, monthlyPerformance: -0.89, yearlyPerformance: 2.34 },
  { name: 'Real Estate', performance: -0.67, monthlyPerformance: -1.23, yearlyPerformance: 4.56 },
];

const StocksPage = () => {
  const [marketIndices, setMarketIndices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  useEffect(() => {
    const getMarketData = async () => {
      setIsLoading(true);
      try {
        const indices = await fetchMarketIndices();
        setMarketIndices(indices);
        setError(null);
      } catch (err) {
        console.error('Error fetching market indices:', err);
        setError("Failed to load market data");
        setMarketIndices([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    getMarketData();
  }, []);
  
  const filteredStocks = popularStocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || 
    stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    stock.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-1">Stocks</h1>
        <p className="text-muted-foreground mb-6">Explore stocks and market sectors</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {isLoading ? (
            <Card className="col-span-full h-40 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </Card>
          ) : error ? (
            <Card className="col-span-full">
              <CardContent className="pt-6">
                <p className="text-center text-red-500">{error}</p>
              </CardContent>
            </Card>
          ) : (
            marketIndices.map((index) => (
              <Card key={index.symbol}>
                <CardHeader className="pb-2">
                  <CardTitle>{index.name}</CardTitle>
                  <CardDescription>{index.symbol}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">{index.price.toFixed(2)}</span>
                    <div className="flex items-center">
                      {index.change >= 0 ? (
                        <Badge variant="outline" className="bg-up/10 text-up border-up">
                          <ArrowUpRight className="mr-1 h-3 w-3" />
                          +{index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-down/10 text-down border-down">
                          <ArrowDownRight className="mr-1 h-3 w-3" />
                          {index.change.toFixed(2)} ({index.changePercent.toFixed(2)}%)
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
        
        <Tabs defaultValue="stocks" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="stocks">Popular Stocks</TabsTrigger>
            <TabsTrigger value="sectors">Market Sectors</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stocks">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search stocks by name, symbol, or sector..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="rounded-md border">
              <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 font-medium">
                <div className="col-span-4">Name</div>
                <div className="col-span-2">Symbol</div>
                <div className="col-span-2 hidden md:block">Sector</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 md:col-span-2 text-right">Change</div>
              </div>
              
              {filteredStocks.length > 0 ? (
                filteredStocks.map((stock) => (
                  <Link
                    key={stock.symbol}
                    to={`/stocks/${stock.symbol}`}
                    className="grid grid-cols-12 gap-4 p-4 border-t hover:bg-muted/50 transition-colors"
                  >
                    <div className="col-span-4 font-medium">{stock.name}</div>
                    <div className="col-span-2">{stock.symbol}</div>
                    <div className="col-span-2 hidden md:block">{stock.sector}</div>
                    <div className="col-span-2 text-right">${stock.price.toFixed(2)}</div>
                    <div className={`col-span-2 md:col-span-2 text-right ${stock.change >= 0 ? 'text-up' : 'text-down'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No stocks found matching your search.
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="sectors">
            <div className="rounded-md border">
              <div className="grid grid-cols-10 gap-4 p-4 bg-muted/50 font-medium">
                <div className="col-span-4">Sector</div>
                <div className="col-span-2 text-right">Today</div>
                <div className="col-span-2 text-right">Monthly</div>
                <div className="col-span-2 text-right">Yearly</div>
              </div>
              
              {sectors.map((sector) => (
                <div
                  key={sector.name}
                  className="grid grid-cols-10 gap-4 p-4 border-t hover:bg-muted/50 transition-colors"
                >
                  <div className="col-span-4 font-medium">{sector.name}</div>
                  <div className={`col-span-2 text-right ${sector.performance >= 0 ? 'text-up' : 'text-down'}`}>
                    {sector.performance >= 0 ? '+' : ''}{sector.performance.toFixed(2)}%
                  </div>
                  <div className={`col-span-2 text-right ${sector.monthlyPerformance >= 0 ? 'text-up' : 'text-down'}`}>
                    {sector.monthlyPerformance >= 0 ? '+' : ''}{sector.monthlyPerformance.toFixed(2)}%
                  </div>
                  <div className={`col-span-2 text-right ${sector.yearlyPerformance >= 0 ? 'text-up' : 'text-down'}`}>
                    {sector.yearlyPerformance >= 0 ? '+' : ''}{sector.yearlyPerformance.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StocksPage; 