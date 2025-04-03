
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowRight, TrendingUp, Brain } from "lucide-react";

// Mock AI insights data
const aiInsights = [
  {
    ticker: "AAPL",
    recommendation: "Buy",
    confidence: 85,
    reasoning: "Strong fundamentals, robust product pipeline, and attractive valuation."
  },
  {
    ticker: "TSLA",
    recommendation: "Hold",
    confidence: 60,
    reasoning: "Uncertain demand outlook balanced by leadership in EV market."
  },
  {
    ticker: "MSFT",
    recommendation: "Buy",
    confidence: 92,
    reasoning: "Cloud growth accelerating and AI investments paying dividends."
  }
];

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 80) return "bg-up/10 text-up border-up/30";
  if (confidence >= 60) return "bg-amber-500/10 text-amber-500 border-amber-500/30";
  return "bg-down/10 text-down border-down/30";
};

const getRecommendationColor = (recommendation: string) => {
  switch (recommendation.toLowerCase()) {
    case 'buy': return "bg-up/10 text-up border-up/30";
    case 'sell': return "bg-down/10 text-down border-down/30";
    default: return "bg-amber-500/10 text-amber-500 border-amber-500/30";
  }
};

// Mock prediction data
const predictionData = [
  { date: 'Apr', actual: 150, predicted: 145 },
  { date: 'May', actual: 158, predicted: 156 },
  { date: 'Jun', actual: 165, predicted: 163 },
  { date: 'Jul', actual: 172, predicted: 170 },
  { date: 'Aug', actual: 168, predicted: 169 },
  { date: 'Sep', actual: null, predicted: 175 },
  { date: 'Oct', actual: null, predicted: 180 },
  { date: 'Nov', actual: null, predicted: 183 },
];

const InsightsCard = () => {
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
          <h3 className="font-medium text-sm mb-2">Price Forecast (AAPL)</h3>
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
                  domain={['dataMin - 10', 'dataMax + 10']} 
                  stroke="hsl(var(--muted-foreground))" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                  width={35}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "0.5rem"
                  }}
                  formatter={(value) => [`$${value}`, '']}
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
          <div className="space-y-2">
            {aiInsights.map((insight, idx) => (
              <div key={idx} className="p-2 border border-border rounded-md">
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{insight.ticker}</span>
                    <Badge variant="outline" className={getRecommendationColor(insight.recommendation)}>
                      {insight.recommendation}
                    </Badge>
                  </div>
                  <Badge variant="outline" className={getConfidenceColor(insight.confidence)}>
                    {insight.confidence}% Confidence
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{insight.reasoning}</p>
              </div>
            ))}
          </div>
          
          <a 
            href="/insights"
            className="flex items-center justify-center w-full text-sm text-primary mt-3 py-1.5 hover:underline"
          >
            View all insights
            <ArrowRight className="ml-1 h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightsCard;
