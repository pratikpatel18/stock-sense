import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, TrendingUp, Brain, Shield, LineChart, MessageSquare, Zap } from 'lucide-react';

const SmartPlan = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('portfolio-analysis');
  
  // Parse URL query parameters to get the active tab
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-2 mb-6">
          <h1 className="text-3xl font-bold">SmartPlan Dashboard</h1>
          <p className="text-muted-foreground">AI-powered investment strategies personalized to your portfolio</p>
        </div>
        
        <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 mb-6 flex items-start gap-4">
          <Zap className="h-12 w-12 p-2 text-primary bg-primary/10 rounded-lg shrink-0" />
          <div>
            <h2 className="text-xl font-semibold">Your SmartPlan insights are ready</h2>
            <p className="text-muted-foreground">We've analyzed your portfolio and market trends to provide personalized recommendations.</p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2">
            <TabsTrigger value="portfolio-analysis" className="flex flex-col p-3 h-auto">
              <PieChart className="h-5 w-5 mb-1" />
              <span>Portfolio Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="investment-strategy" className="flex flex-col p-3 h-auto">
              <Brain className="h-5 w-5 mb-1" />
              <span>Investment Strategy</span>
            </TabsTrigger>
            <TabsTrigger value="stock-recommendations" className="flex flex-col p-3 h-auto">
              <TrendingUp className="h-5 w-5 mb-1" />
              <span>Stock Recommendations</span>
            </TabsTrigger>
            <TabsTrigger value="risk-management" className="flex flex-col p-3 h-auto">
              <Shield className="h-5 w-5 mb-1" />
              <span>Risk Management</span>
            </TabsTrigger>
            <TabsTrigger value="ai-predictions" className="flex flex-col p-3 h-auto">
              <LineChart className="h-5 w-5 mb-1" />
              <span>AI Predictions</span>
            </TabsTrigger>
            <TabsTrigger value="sentiment-analysis" className="flex flex-col p-3 h-auto">
              <MessageSquare className="h-5 w-5 mb-1" />
              <span>Sentiment Analysis</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="portfolio-analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Asset Allocation Review</CardTitle>
                <CardDescription>Analysis of your portfolio's distribution across asset classes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-md">
                  <p className="text-muted-foreground">Interactive asset allocation chart will appear here</p>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment</CardTitle>
                  <CardDescription>Portfolio risk level analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-40 flex items-center justify-center border-2 border-dashed border-muted rounded-md">
                    <p className="text-muted-foreground">Risk metrics will appear here</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Sector Exposure</CardTitle>
                  <CardDescription>Distribution across industry sectors</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-40 flex items-center justify-center border-2 border-dashed border-muted rounded-md">
                    <p className="text-muted-foreground">Sector breakdown will appear here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Other tab contents would be similar placeholder structures */}
          <TabsContent value="investment-strategy">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Investment Strategies</CardTitle>
                <CardDescription>Personalized strategies based on your risk profile and goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-md">
                  <p className="text-muted-foreground">Investment strategy recommendations will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stock-recommendations">
            <Card>
              <CardHeader>
                <CardTitle>Smart Stock Picks</CardTitle>
                <CardDescription>AI-recommended stocks based on your portfolio and market trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-md">
                  <p className="text-muted-foreground">Stock recommendations will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="risk-management">
            <Card>
              <CardHeader>
                <CardTitle>Risk Management & Alerts</CardTitle>
                <CardDescription>Stop-loss recommendations and portfolio rebalancing alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-md">
                  <p className="text-muted-foreground">Risk management insights will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="ai-predictions">
            <Card>
              <CardHeader>
                <CardTitle>AI Market Predictions</CardTitle>
                <CardDescription>Forward-looking analysis of market trends and price forecasting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-md">
                  <p className="text-muted-foreground">Price predictions and market forecasts will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sentiment-analysis">
            <Card>
              <CardHeader>
                <CardTitle>Market Sentiment Analysis</CardTitle>
                <CardDescription>AI analysis of news, trends, and social media for stock sentiment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted rounded-md">
                  <p className="text-muted-foreground">Sentiment analysis dashboard will appear here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default SmartPlan; 