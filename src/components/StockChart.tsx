
import { useState } from 'react';
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

interface StockChartProps {
  symbol: string;
  company: string;
}

const StockChart = ({ symbol, company }: StockChartProps) => {
  const [timeRange, setTimeRange] = useState<'1D' | '1W' | '1M' | '3M' | '1Y' | 'All'>('1M');
  
  // Mock data - would be fetched from API based on timeRange
  const generateMockData = () => {
    // Generate different data based on the selected time range
    const dataPoints = timeRange === '1D' ? 24 : 
                       timeRange === '1W' ? 7 : 
                       timeRange === '1M' ? 30 :
                       timeRange === '3M' ? 90 : 
                       timeRange === '1Y' ? 12 : 5;
    
    let baseValue = 150;
    const volatility = timeRange === '1D' ? 1 : 
                      timeRange === '1W' ? 3 : 
                      timeRange === '1M' ? 8 :
                      timeRange === '3M' ? 15 : 
                      timeRange === '1Y' ? 30 : 50;
    
    const data = [];
    let timestamp = new Date();
    
    for (let i = 0; i < dataPoints; i++) {
      // Create realistic price movements with some trend
      const change = (Math.random() - 0.48) * volatility;
      baseValue = Math.max(10, baseValue + change);
      
      let label;
      if (timeRange === '1D') {
        label = `${(i % 12) + 1}${i < 12 ? 'AM' : 'PM'}`;
      } else if (timeRange === '1W') {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        label = days[i % 7];
      } else if (timeRange === '1M' || timeRange === '3M') {
        label = `${(i % 30) + 1}/${Math.floor(i / 30) + 1}`;
      } else {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        label = months[i % 12];
      }
      
      data.push({
        date: label,
        price: parseFloat(baseValue.toFixed(2)),
        volume: Math.floor(Math.random() * 1000000) + 500000
      });
    }
    return data;
  };
  
  const data = generateMockData();
  const currentPrice = data[data.length - 1].price;
  const previousPrice = data[0].price;
  const change = currentPrice - previousPrice;
  const changePercent = (change / previousPrice) * 100;
  const isPositive = change >= 0;
  
  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-col pb-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CardTitle>{company}</CardTitle>
            <span className="text-sm text-muted-foreground">{symbol}</span>
          </div>
          <div className="flex items-center">
            <span className="text-2xl font-semibold mr-2">${currentPrice.toFixed(2)}</span>
            <span className={`text-sm ${isPositive ? 'text-up' : 'text-down'}`}>
              {isPositive ? '+' : ''}
              {change.toFixed(2)} ({changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="h-72">
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
        </div>
        <div className="flex justify-center gap-2 mt-4">
          <Button 
            variant={timeRange === '1D' ? "secondary" : "ghost"} 
            onClick={() => setTimeRange('1D')}
            className="px-3 py-1 h-8"
          >
            1D
          </Button>
          <Button 
            variant={timeRange === '1W' ? "secondary" : "ghost"} 
            onClick={() => setTimeRange('1W')}
            className="px-3 py-1 h-8"
          >
            1W
          </Button>
          <Button 
            variant={timeRange === '1M' ? "secondary" : "ghost"} 
            onClick={() => setTimeRange('1M')}
            className="px-3 py-1 h-8"
          >
            1M
          </Button>
          <Button 
            variant={timeRange === '3M' ? "secondary" : "ghost"} 
            onClick={() => setTimeRange('3M')}
            className="px-3 py-1 h-8"
          >
            3M
          </Button>
          <Button 
            variant={timeRange === '1Y' ? "secondary" : "ghost"} 
            onClick={() => setTimeRange('1Y')}
            className="px-3 py-1 h-8"
          >
            1Y
          </Button>
          <Button 
            variant={timeRange === 'All' ? "secondary" : "ghost"} 
            onClick={() => setTimeRange('All')}
            className="px-3 py-1 h-8"
          >
            All
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockChart;
