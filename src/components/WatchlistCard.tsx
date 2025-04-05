import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Star, PlusCircle, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { fetchStockQuote } from '@/lib/api';

interface StockItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  starred: boolean;
  isLoading?: boolean;
}

const WatchlistCard = () => {
  // Initial watchlist with common Indian stocks
  const initialWatchlist: StockItem[] = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', price: 0, change: 0, changePercent: 0, starred: true, isLoading: true },
    { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', price: 0, change: 0, changePercent: 0, starred: true, isLoading: true },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: 0, change: 0, changePercent: 0, starred: false, isLoading: true },
    { symbol: 'INFY', name: 'Infosys Ltd.', price: 0, change: 0, changePercent: 0, starred: false, isLoading: true },
    { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd.', price: 0, change: 0, changePercent: 0, starred: true, isLoading: true },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd.', price: 0, change: 0, changePercent: 0, starred: false, isLoading: true },
  ];
  
  const [watchlistStocks, setWatchlistStocks] = useState<StockItem[]>(initialWatchlist);
  const [showAddSymbol, setShowAddSymbol] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  
  // Load watchlist from localStorage or use default
  useEffect(() => {
    const savedWatchlist = localStorage.getItem('watchlist');
    if (savedWatchlist) {
      try {
        const parsed = JSON.parse(savedWatchlist);
        // Mark all saved stocks as loading initially
        const withLoading = parsed.map((stock: StockItem) => ({
          ...stock,
          isLoading: true
        }));
        setWatchlistStocks(withLoading);
      } catch (err) {
        console.error("Error parsing saved watchlist:", err);
      }
    }
  }, []);
  
  // Save watchlist to localStorage when it changes
  useEffect(() => {
    if (!isLoadingAll) {
      localStorage.setItem('watchlist', JSON.stringify(watchlistStocks));
    }
  }, [watchlistStocks, isLoadingAll]);
  
  // Fetch data for each stock in watchlist
  useEffect(() => {
    const fetchAllStockData = async () => {
      setIsLoadingAll(true);
      let updatedStocks = [...watchlistStocks];
      let hasError = false;
      
      // Create a promise for each stock quote
      const promises = watchlistStocks.map(async (stock, index) => {
        try {
          const quote = await fetchStockQuote(stock.symbol);
          // Update the stock with real data
          updatedStocks[index] = {
            ...updatedStocks[index],
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            isLoading: false
          };
        } catch (err) {
          console.error(`Error fetching data for ${stock.symbol}:`, err);
          hasError = true;
          // Mark as not loading but keep existing data
          updatedStocks[index] = {
            ...updatedStocks[index],
            isLoading: false
          };
        }
      });
      
      // Wait for all promises to resolve
      await Promise.all(promises);
      
      setWatchlistStocks(updatedStocks);
      setError(hasError ? "Some stocks failed to load" : null);
      setIsLoadingAll(false);
    };
    
    if (watchlistStocks.length > 0) {
      fetchAllStockData();
      
      // Refresh every 60 seconds
      const interval = setInterval(fetchAllStockData, 60000);
      return () => clearInterval(interval);
    }
  }, [watchlistStocks.length]);
  
  const toggleStar = (index: number) => {
    const updatedStocks = [...watchlistStocks];
    updatedStocks[index].starred = !updatedStocks[index].starred;
    setWatchlistStocks(updatedStocks);
  };
  
  const removeStock = (index: number) => {
    const updatedStocks = [...watchlistStocks];
    updatedStocks.splice(index, 1);
    setWatchlistStocks(updatedStocks);
  };
  
  const addSymbol = async () => {
    if (newSymbol.trim()) {
      const symbol = newSymbol.toUpperCase().trim();
      
      // Check if symbol already exists in watchlist
      if (watchlistStocks.some(stock => stock.symbol === symbol)) {
        setError(`${symbol} is already in your watchlist`);
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      // Add new symbol with loading state
      const newStock: StockItem = {
        symbol,
        name: `${symbol}`,
        price: 0,
        change: 0,
        changePercent: 0,
        starred: false,
        isLoading: true
      };
      
      setWatchlistStocks([...watchlistStocks, newStock]);
      setNewSymbol('');
      setShowAddSymbol(false);
      
      // Fetch data for the new stock
      try {
        const quote = await fetchStockQuote(symbol);
        // Update the new stock with real data
        setWatchlistStocks(currentStocks => {
          const updatedStocks = [...currentStocks];
          const newStockIndex = updatedStocks.findIndex(s => s.symbol === symbol);
          
          if (newStockIndex >= 0) {
            updatedStocks[newStockIndex] = {
              ...updatedStocks[newStockIndex],
              price: quote.price,
              change: quote.change,
              changePercent: quote.changePercent,
              name: quote.name || symbol,
              isLoading: false
            };
          }
          
          return updatedStocks;
        });
      } catch (err) {
        console.error(`Error fetching data for ${symbol}:`, err);
        setError(`Failed to load data for ${symbol}`);
        setTimeout(() => setError(null), 3000);
      }
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Watchlist</CardTitle>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setShowAddSymbol(!showAddSymbol)}
        >
          <PlusCircle className="h-5 w-5" />
        </Button>
      </CardHeader>
      <CardContent>
        {showAddSymbol && (
          <div className="flex gap-2 mb-4">
            <Input 
              placeholder="Add symbol (e.g. AAPL)"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && addSymbol()}
            />
            <Button onClick={addSymbol}>Add</Button>
          </div>
        )}
        
        {error && (
          <div className="mb-2 text-sm text-red-500">
            {error}
          </div>
        )}
        
        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {watchlistStocks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Your watchlist is empty. Add some stocks to track.
            </div>
          ) : (
            watchlistStocks.map((stock, index) => {
              const isPositive = stock.change >= 0;
              
              return (
                <div 
                  key={stock.symbol} 
                  className="flex justify-between items-center py-2 border-b last:border-0 border-border hover:bg-accent/50 rounded px-2"
                >
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 p-0"
                      onClick={() => toggleStar(index)}
                    >
                      <Star className={`h-4 w-4 ${stock.starred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
                    </Button>
                    
                    <div>
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[120px]">{stock.name}</div>
                    </div>
                  </div>
                  
                  {stock.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <div className="text-right">
                      <div className="font-medium">₹{(stock.price * 83.15).toFixed(2)}</div>
                      <div className={`text-xs ${stock.change >= 0 ? 'text-up' : 'text-down'} flex items-center justify-end`}>
                        {stock.change >= 0 ? 
                          <ArrowUp className="h-3 w-3 mr-1" /> : 
                          <ArrowDown className="h-3 w-3 mr-1" />
                        }
                        {(stock.change * 83.15).toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                      </div>
                    </div>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeStock(index)}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default WatchlistCard;
