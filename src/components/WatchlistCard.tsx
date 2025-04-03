
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, Star, PlusCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface StockItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  starred: boolean;
}

const WatchlistCard = () => {
  const [watchlistStocks, setWatchlistStocks] = useState<StockItem[]>([
    { symbol: 'AAPL', name: 'Apple Inc.', price: 173.41, change: 2.56, changePercent: 1.5, starred: true },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 397.58, change: 5.37, changePercent: 1.37, starred: true },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 141.16, change: -1.32, changePercent: -0.93, starred: false },
    { symbol: 'AMZN', name: 'Amazon.com', price: 175.35, change: 3.12, changePercent: 1.81, starred: false },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 203.64, change: -7.48, changePercent: -3.54, starred: true },
    { symbol: 'META', name: 'Meta Platforms', price: 474.38, change: 8.62, changePercent: 1.85, starred: false },
  ]);
  
  const [showAddSymbol, setShowAddSymbol] = useState(false);
  const [newSymbol, setNewSymbol] = useState('');
  
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
  
  const addSymbol = () => {
    if (newSymbol.trim()) {
      // In a real app, this would validate and fetch the stock data
      const mockNewStock: StockItem = {
        symbol: newSymbol.toUpperCase(),
        name: `${newSymbol.toUpperCase()} Corp.`,
        price: Math.random() * 500 + 50,
        change: (Math.random() * 10) - 5,
        changePercent: (Math.random() * 5) - 2.5,
        starred: false
      };
      
      setWatchlistStocks([...watchlistStocks, mockNewStock]);
      setNewSymbol('');
      setShowAddSymbol(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Watchlist</CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 px-2"
          onClick={() => setShowAddSymbol(!showAddSymbol)}
        >
          <PlusCircle className="h-4 w-4" />
          <span className="ml-1">Add</span>
        </Button>
      </CardHeader>
      <CardContent>
        {showAddSymbol && (
          <div className="flex gap-2 mb-3">
            <Input 
              placeholder="Enter symbol..." 
              value={newSymbol} 
              onChange={(e) => setNewSymbol(e.target.value)}
              className="h-8"
            />
            <Button className="h-8" onClick={addSymbol}>Add</Button>
          </div>
        )}
        
        <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
          {watchlistStocks.map((stock, index) => {
            const isPositive = stock.change >= 0;
            
            return (
              <div 
                key={stock.symbol} 
                className="flex justify-between items-center p-2 hover:bg-secondary/50 rounded-md cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7" 
                    onClick={() => toggleStar(index)}
                  >
                    <Star 
                      className={`h-4 w-4 ${stock.starred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                    />
                  </Button>
                  <div className="flex flex-col">
                    <span className="font-medium">{stock.symbol}</span>
                    <span className="text-xs text-muted-foreground">{stock.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex flex-col items-end">
                    <span className="font-medium">${stock.price.toFixed(2)}</span>
                    <span className={isPositive ? 'text-up text-xs' : 'text-down text-xs'}>
                      {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 opacity-0 hover:opacity-100 transition-opacity"
                    onClick={() => removeStock(index)}
                  >
                    <X className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default WatchlistCard;
