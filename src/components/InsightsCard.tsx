import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowRight, TrendingUp, Brain, Loader2 } from "lucide-react";
import { fetchInsights, fetchStockData, InsightItem } from '@/lib/api';
import { Link } from 'react-router-dom';

// Mock prediction data for Reliance in INR
const predictionData = [
  { date: 'Apr', actual: 2750, predicted: 2745 },
  { date: 'May', actual: 2858, predicted: 2856 },
  { date: 'Jun', actual: 2965, predicted: 2963 },
  { date: 'Jul', actual: 3072, predicted: 3070 },
  { date: 'Aug', actual: 2968, predicted: 2969 },
  { date: 'Sep', actual: null, predicted: 3075 },
  { date: 'Oct', actual: null, predicted: 3180 },
  { date: 'Nov', actual: null, predicted: 3283 },
];

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 80) return "bg-up/10 text-up border-up/30";
  if (confidence >= 60) return "bg-amber-500/10 text-amber-500 border-amber-500/30";
  return "bg-down/10 text-down border-down/30";
};

const getRecommendationColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'buy': return "bg-up/10 text-up border-up/30";
    case 'sell': return "bg-down/10 text-down border-down/30";
    case 'hold': return "bg-amber-500/10 text-amber-500 border-amber-500/30";
    default: return "bg-primary/10 text-primary border-primary/30"; // For 'watch' type
  }
};

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Generate mock insights with Indian companies
const generateMockInsights = (): InsightItem[] => {
  return [
    {
      symbol: 'RELIANCE',
      company: 'Reliance Industries Ltd.',
      type: 'buy',
      summary: 'Strong retail and digital services growth potential make Reliance an attractive buy at current levels. The company continues to expand its ecosystem.',
      confidence: 85,
      priceTarget: 3150.00,
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
      symbol: 'TCS',
      company: 'Tata Consultancy Services Ltd.',
      type: 'hold',
      summary: 'TCS is performing well across all markets, but current valuation suggests limited upside in the near term. Long-term prospects remain strong.',
      confidence: 72,
      priceTarget: 3800.00,
      timestamp: new Date(Date.now() - 5 * 3600000).toISOString()
    },
    {
      symbol: 'TATAMOTORS',
      company: 'Tata Motors Ltd.',
      type: 'buy',
      summary: 'Strong domestic sales growth and improving margins in JLR segment. The EV transition strategy looks promising.',
      confidence: 78,
      priceTarget: 1050.00,
      timestamp: new Date(Date.now() - 8 * 3600000).toISOString()
    },
    {
      symbol: 'HDFCBANK',
      company: 'HDFC Bank Ltd.',
      type: 'watch',
      summary: 'Integration with parent HDFC is progressing well. Monitor upcoming quarterly results for confirmation of positive trends.',
      confidence: 65,
      priceTarget: 1850.00,
      timestamp: new Date(Date.now() - 12 * 3600000).toISOString()
    }
  ];
};

const InsightsCard = () => {
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsightsData = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch from API
        // For demo, use mock data
        setInsights(generateMockInsights());
        setError(null);
      } catch (err) {
        console.error("Error fetching insights:", err);
        setError("Failed to load insights");
      } finally {
        setLoading(false);
      }
    };
    
    fetchInsightsData();
  }, []);

  if (loading && insights.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-semibold">AI Insights</CardTitle>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              <Brain className="h-3 w-3 mr-1" />
              Powered by AI
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-80">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Processing market data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error && insights.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl font-semibold">AI Insights</CardTitle>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              <Brain className="h-3 w-3 mr-1" />
              Powered by AI
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-80">
          <p className="text-sm text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-xl font-semibold">AI Insights</CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            <Brain className="h-3 w-3 mr-1" />
            Powered by AI
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3 className="text-base font-medium mb-2">RELIANCE Price Forecast</h3>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={predictionData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10} 
                  tickLine={false} 
                />
                <YAxis 
                  domain={['dataMin - 100', 'dataMax + 100']} 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value}`}
                  width={45}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.5rem"
                  }}
                  formatter={(value) => [`₹${value}`, '']}
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2} 
                  dot={{ r: 3 }}
                  name="Actual"
                />
                <Line 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  dot={{ r: 3 }}
                  name="Predicted"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-sm mb-2">Top Recommendations</h3>
          <div className="space-y-2 max-h-[270px] overflow-y-auto pr-1">
            {insights.map((insight, idx) => (
              <div key={idx} className="p-2 border border-border rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{insight.symbol}</span>
                    <Badge variant="outline" className={getRecommendationColor(insight.type)}>
                      {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                    </Badge>
                  </div>
                  <Badge variant="outline" className={getConfidenceColor(insight.confidence)}>
                    {insight.confidence}% Confidence
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{insight.summary}</p>
                {insight.priceTarget && (
                  <p className="text-xs mt-1">
                    <span className="text-muted-foreground">Price Target:</span>{' '}
                    <span className={insight.type === 'buy' ? 'text-up' : insight.type === 'sell' ? 'text-down' : ''}>
                      ₹{insight.priceTarget.toFixed(2)}
                    </span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(insight.timestamp)}
                </p>
              </div>
            ))}
          </div>
          
          <Link 
            to="/insights"
            className="flex items-center justify-center w-full text-sm text-primary mt-3 py-1.5 hover:underline"
          >
            View all insights
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightsCard;
