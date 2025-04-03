
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Wallet } from "lucide-react";

const PortfolioSummary = () => {
  // Mock portfolio data
  const portfolioValue = 125437.82;
  const dayChange = 1823.45;
  const dayChangePercent = 1.47;
  const totalGain = 15437.82;
  const totalGainPercent = 14.03;
  
  // Portfolio allocation data
  const allocationData = [
    { name: 'Technology', value: 42 },
    { name: 'Finance', value: 23 },
    { name: 'Healthcare', value: 15 },
    { name: 'Energy', value: 12 },
    { name: 'Other', value: 8 },
  ];
  
  const COLORS = [
    'hsl(var(--primary))',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#a855f7'
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Portfolio Summary</CardTitle>
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
          <Wallet className="h-3 w-3 mr-1" />
          Virtual Portfolio
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-baseline">
            <span className="text-2xl font-bold">${portfolioValue.toLocaleString()}</span>
            <span className="ml-2 text-sm text-up">
              +${dayChange.toLocaleString()} ({dayChangePercent}%)
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Total Gain: <span className="text-up">+${totalGain.toLocaleString()} ({totalGainPercent}%)</span>
          </div>
        </div>
        
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2">Allocation</h3>
          <div className="h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  wrapperStyle={{
                    fontSize: '12px',
                    color: 'hsl(var(--muted-foreground))',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <a 
            href="/portfolio"
            className="flex items-center justify-center w-full text-sm text-primary mt-3 py-1.5 hover:underline"
          >
            View portfolio details
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default PortfolioSummary;
