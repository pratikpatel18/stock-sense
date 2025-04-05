import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, TrendingUp, Loader2 } from "lucide-react";
import { fetchMarketIndices } from "@/lib/api";

interface MarketIndexProps {
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const MarketIndex = ({ name, price, change, changePercent }: MarketIndexProps) => {
  const isPositive = change >= 0;
  
  return (
    <div className="flex justify-between items-center py-2 border-b last:border-0 border-border">
      <div className="flex flex-col">
        <span className="font-medium">{name}</span>
        <span className="text-sm text-muted-foreground">₹{(price * 83.15).toLocaleString()}</span>
      </div>
      <div className={`flex items-center ${isPositive ? 'text-up' : 'text-down'}`}>
        <span className="font-medium mr-1">
          {isPositive ? '+' : ''}{(change * 83.15).toFixed(2)} ({changePercent.toFixed(2)}%)
        </span>
        {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
      </div>
    </div>
  );
};

const MarketOverview = () => {
  const [marketIndices, setMarketIndices] = useState<MarketIndexProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getMarketData = async () => {
      try {
        const data = await fetchMarketIndices();
        setMarketIndices(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching market indices:", err);
        setError("Failed to load market data");
      } finally {
        setIsLoading(false);
      }
    };

    getMarketData();
    
    // Refresh every 60 seconds
    const interval = setInterval(getMarketData, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Calculate overall market sentiment based on indices
  const positiveIndices = marketIndices.filter(index => index.change > 0).length;
  const sentiment = positiveIndices >= marketIndices.length / 2 ? "Bullish" : "Bearish";
  const sentimentColor = sentiment === "Bullish" ? "bg-up/20 text-up" : "bg-down/20 text-down";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Market Overview</CardTitle>
        {marketIndices.length > 0 ? (
          <Badge className={`${sentimentColor}`} variant="outline">
            <TrendingUp className="mr-1 h-3 w-3" />
            {sentiment}
          </Badge>
        ) : (
          <Badge variant="outline">
            <TrendingUp className="mr-1 h-3 w-3" />
            Loading...
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : (
          marketIndices.map((index, i) => (
            <MarketIndex key={i} {...index} />
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default MarketOverview;
