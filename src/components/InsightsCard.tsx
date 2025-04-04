import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowRight, TrendingUp, Brain, Loader2 } from "lucide-react";
import { fetchInsights, fetchStockData, InsightItem } from '@/lib/api';
import { Link } from 'react-router-dom';

// Mock prediction data - would be generated by an AI model in a real app
const predictionData = [
  { date: 'Apr', actual: 2150, predicted: 2145 },
  { date: 'May', actual: 2258, predicted: 2256 },
  { date: 'Jun', actual: 2365, predicted: 2363 },
  { date: 'Jul', actual: 2472, predicted: 2470 },
  { date: 'Aug', actual: 2368, predicted: 2369 },
  { date: 'Sep', actual: null, predicted: 2475 },
  { date: 'Oct', actual: null, predicted: 2580 },
  { date: 'Nov', actual: null, predicted: 2683 },
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

// Generate mock insights for US stocks
const generateMockInsights = (): InsightItem[] => {
  return [
    {
      symbol: 'AAPL',
      company: 'Apple Inc.',
      type: 'buy',
      summary: 'Strong iPhone sales and growing services revenue, along with potential in AR/VR initiatives, make Apple an attractive long-term buy.',
      confidence: 85,
      priceTarget: 190.00,
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
      symbol: 'MSFT',
      company: 'Microsoft Corp.',
      type: 'hold',
      summary: 'Microsoft is showing resilience with cloud growth despite AI investment costs. Current valuation suggests holding positions while monitoring upcoming quarters.',
      confidence: 72,
      priceTarget: 420.00,
      timestamp: new Date(Date.now() - 5 * 3600000).toISOString()
    },
    {
      symbol: 'TSLA',
      company: 'Tesla Inc.',
      type: 'buy',
      summary: 'Strong EV delivery growth and expanding energy business position Tesla for continued growth. Recent dips provide buying opportunity.',
      confidence: 78,
      priceTarget: 275.00,
      timestamp: new Date(Date.now() - 8 * 3600000).toISOString()
    },
    {
      symbol: 'JPM',
      company: 'JPMorgan Chase & Co.',
      type: 'watch',
      summary: 'Improving interest income and potential for higher margins with interest rate changes make JPM worth monitoring closely.',
      confidence: 65,
      timestamp: new Date(Date.now() - 12 * 3600000).toISOString()
    },
    {
      symbol: 'AMZN',
      company: 'Amazon.com Inc.',
      type: 'buy',
      summary: 'Strong AWS growth and retail margin improvements position Amazon well for future growth. The company continues to expand into new markets.',
      confidence: 80,
      priceTarget: 190.00,
      timestamp: new Date(Date.now() - 18 * 3600000).toISOString()
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
          <h3 className="font-medium text-sm mb-2">Price Forecast (RELIANCE.NS)</h3>
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
