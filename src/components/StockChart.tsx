import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { fetchStockData, fetchStockQuote } from "@/lib/api";

interface StockChartProps {
  symbol: string;
  company: string;
}

const StockChart = ({ symbol, company }: StockChartProps) => {
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'All'>('1M');
  const [data, setData] = useState<Array<{date: string; price: number; volume: number}>>([]);
  const [stockQuote, setStockQuote] = useState<{price: number; change: number; changePercent: number} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch stock quote data (current price)
  useEffect(() => {
    const getStockQuote = async () => {
      try {
        const quote = await fetchStockQuote(symbol);
        setStockQuote({
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent
        });
        setError(null);
      } catch (err) {
        console.error("Error fetching stock quote:", err);
        setError("Failed to load current price data");
      }
    };
    
    getStockQuote();
    // Refresh every 60 seconds - in a real app, consider using websockets
    const interval = setInterval(getStockQuote, 60000);
    
    return () => clearInterval(interval);
  }, [symbol]);
  
  // Fetch chart data when timeRange changes
  useEffect(() => {
    const getChartData = async () => {
      setIsLoading(true);
      try {
        const chartData = await fetchStockData(symbol, timeRange);
        setData(chartData);
        setError(null);
      } catch (err) {
        console.error("Error fetching chart data:", err);
        setError("Failed to load chart data");
      } finally {
        setIsLoading(false);
      }
    };
    
    getChartData();
  }, [symbol, timeRange]);
  
  const isPositive = stockQuote?.change ? stockQuote.change >= 0 : true;
  
  if (isLoading && data.length === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader className="flex flex-col pb-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CardTitle>{company}</CardTitle>
              <span className="text-sm text-muted-foreground">{symbol}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-80">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading stock data...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (error && data.length === 0) {
    return (
      <Card className="col-span-2">
        <CardHeader className="flex flex-col pb-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <CardTitle>{company}</CardTitle>
              <span className="text-sm text-muted-foreground">{symbol}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-80">
          <p className="text-sm text-red-500">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            className="mt-4"
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-col pb-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle>{company}</CardTitle>
            <span className="text-sm text-muted-foreground">{symbol}</span>
          </div>
          <div className="flex items-center">
            {stockQuote ? (
              <>
                <span className="text-2xl font-semibold mr-2">${stockQuote.price.toFixed(2)}</span>
                <span className={`text-sm ${isPositive ? 'text-up' : 'text-down'}`}>
                  {isPositive ? '+' : ''}
                  {stockQuote.change.toFixed(2)} ({stockQuote.changePercent.toFixed(2)}%)
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">Loading...</span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-72 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {data.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{
                  top: 5,
                  right: 5,
                  left: 0,
                  bottom: 5,
                }}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop 
                      offset="5%" 
                      stopColor={isPositive ? "hsl(var(--up))" : "hsl(var(--down))"}  
                      stopOpacity={0.3}
                    />
                    <stop 
                      offset="95%" 
                      stopColor={isPositive ? "hsl(var(--up))" : "hsl(var(--down))"}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date"
                  stroke="hsl(var(--muted-foreground))" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis 
                  domain={['dataMin - 5', 'dataMax + 5']}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                  width={60}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    color: "hsl(var(--card-foreground))",
                    borderRadius: "0.5rem"
                  }}
                  labelStyle={{ color: "hsl(var(--card-foreground))" }}
                  formatter={(value) => [`$${value}`, 'Price']}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? "hsl(var(--up))" : "hsl(var(--down))"}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorPrice)"
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex justify-center gap-2 mt-4">
          <Button 
            variant={timeRange === '1D' ? "secondary" : "ghost"} 
            onClick={() => setTimeRange('1D')}
            className="px-3 py-1 h-8"
            disabled={isLoading}
          >
            1D
          </Button>
          <Button 
            variant={timeRange === '1W' ? "secondary" : "ghost"} 
            onClick={() => setTimeRange('1W')}
            className="px-3 py-1 h-8"
            disabled={isLoading}
          >
            1W
          </Button>
          <Button 
            variant={timeRange === '1M' ? "secondary" : "ghost"} 
            onClick={() => setTimeRange('1M')}
            className="px-3 py-1 h-8"
            disabled={isLoading}
          >
            1M
          </Button>
          <Button 
            variant={timeRange === '3M' ? "secondary" : "ghost"} 
            onClick={() => setTimeRange('3M')}
            className="px-3 py-1 h-8"
            disabled={isLoading}
          >
            3M
          </Button>
          <Button 
            variant={timeRange === '1Y' ? "secondary" : "ghost"} 
            onClick={() => setTimeRange('1Y')}
            className="px-3 py-1 h-8"
            disabled={isLoading}
          >
            1Y
          </Button>
          <Button 
            variant={timeRange === 'All' ? "secondary" : "ghost"} 
            onClick={() => setTimeRange('All')}
            className="px-3 py-1 h-8"
            disabled={isLoading}
          >
            All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockChart;
