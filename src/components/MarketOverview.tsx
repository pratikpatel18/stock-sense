
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react";

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
        <span className="text-sm text-muted-foreground">${price.toLocaleString()}</span>
      </div>
      <div className={`flex items-center ${isPositive ? 'text-up' : 'text-down'}`}>
        <span className="font-medium mr-1">
          {isPositive ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
        </span>
        {isPositive ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
      </div>
    </div>
  );
};

const MarketOverview = () => {
  // Mock data - would be fetched from API in production
  const marketIndices = [
    { name: "S&P 500", price: 4982.73, change: 38.41, changePercent: 0.78 },
    { name: "Nasdaq", price: 15628.95, change: 164.90, changePercent: 1.07 },
    { name: "Dow Jones", price: 36879.00, change: -134.15, changePercent: -0.36 },
    { name: "Russell 2000", price: 2014.38, change: 7.34, changePercent: 0.37 }
  ];

  // Calculate overall market sentiment based on indices
  const positiveIndices = marketIndices.filter(index => index.change > 0).length;
  const sentiment = positiveIndices >= marketIndices.length / 2 ? "Bullish" : "Bearish";
  const sentimentColor = sentiment === "Bullish" ? "bg-up/20 text-up" : "bg-down/20 text-down";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Market Overview</CardTitle>
        <Badge className={`${sentimentColor}`} variant="outline">
          <TrendingUp className="mr-1 h-3 w-3" />
          {sentiment}
        </Badge>
      </CardHeader>
      <CardContent>
        {marketIndices.map((index, i) => (
          <MarketIndex key={i} {...index} />
        ))}
      </CardContent>
    </Card>
  );
};

export default MarketOverview;
