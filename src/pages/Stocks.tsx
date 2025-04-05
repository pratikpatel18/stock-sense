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
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', sector: 'Energy', price: 2874.25, change: 32.45, changePercent: 1.14 },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', sector: 'Technology', price: 3671.80, change: 45.20, changePercent: 1.25 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', sector: 'Financial Services', price: 1689.35, change: -12.40, changePercent: -0.73 },
  { symbol: 'INFY', name: 'Infosys Ltd.', sector: 'Technology', price: 1522.75, change: 18.55, changePercent: 1.23 },
  { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', sector: 'Consumer Defensive', price: 2514.60, change: -9.75, changePercent: -0.39 },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', sector: 'Financial Services', price: 1052.40, change: 21.30, changePercent: 2.07 },
  { symbol: 'BHARTIARTL', name: 'Bharti Airtel Ltd.', sector: 'Communication Services', price: 1187.50, change: 15.45, changePercent: 1.32 },
  { symbol: 'ITC', name: 'ITC Ltd.', sector: 'Consumer Defensive', price: 436.25, change: -2.15, changePercent: -0.49 },
  { symbol: 'SBIN', name: 'State Bank of India', sector: 'Financial Services', price: 745.90, change: 12.35, changePercent: 1.68 },
  { symbol: 'BAJFINANCE', name: 'Bajaj Finance Ltd.', sector: 'Financial Services', price: 6840.75, change: 78.50, changePercent: 1.16 },
  { symbol: 'ASIANPAINT', name: 'Asian Paints Ltd.', sector: 'Basic Materials', price: 3144.55, change: -28.60, changePercent: -0.90 },
  { symbol: 'MARUTI', name: 'Maruti Suzuki India Ltd.', sector: 'Automotive', price: 10526.85, change: 142.30, changePercent: 1.37 },
  { symbol: 'SUNPHARMA', name: 'Sun Pharmaceutical Industries Ltd.', sector: 'Healthcare', price: 1352.20, change: 23.45, changePercent: 1.77 },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', sector: 'Automotive', price: 942.15, change: -12.35, changePercent: -1.29 },
  { symbol: 'WIPRO', name: 'Wipro Ltd.', sector: 'Technology', price: 472.50, change: -3.25, changePercent: -0.68 },
  { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Ltd.', sector: 'Financial Services', price: 1784.30, change: 25.60, changePercent: 1.45 },
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
  const [marketIndices, setMarketIndices] = useState<any[]>([
    { name: 'NIFTY 50', symbol: 'NIFTY', price: 22460.35, change: 78.25, changePercent: 0.35 },
    { name: 'BSE SENSEX', symbol: 'SENSEX', price: 73852.20, change: 242.60, changePercent: 0.33 },
    { name: 'NIFTY Bank', symbol: 'BANKNIFTY', price: 48275.15, change: -185.35, changePercent: -0.38 },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Comment out or remove the useEffect that fetches market indices
  // useEffect(() => {
  //   const getMarketData = async () => {
  //     setIsLoading(true);
  //     try {
  //       const indices = await fetchMarketIndices();
  //       setMarketIndices(indices);
  //       setError(null);
  //     } catch (err) {
  //       console.error('Error fetching market indices:', err);
  //       setError("Failed to load market data");
  //       setMarketIndices([]);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   
  //   getMarketData();
  // }, []);
  
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
                    <div className="col-span-2 text-right">₹{stock.price.toFixed(2)}</div>
                    <div className={`col-span-2 md:col-span-2 text-right ${stock.change >= 0 ? 'text-up' : 'text-down'}`}>
                      <span className={stock.change >= 0 ? 'text-up' : 'text-down'}>
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                      </span>
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