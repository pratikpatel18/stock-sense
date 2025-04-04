import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import StockChart from '@/components/StockChart';
import NewsCard from '@/components/NewsCard';
import { fetchStockQuote, fetchStockData, fetchStockAnalysis } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, LineChart, Building2, MessageSquare, Sparkles, ShieldAlert, ArrowDown, ArrowUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Tooltip } from "@/components/ui/tooltip";

const StockDetails = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [stockData, setStockData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [analysisData, setAnalysisData] = useState<any | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  useEffect(() => {
    const getStockData = async () => {
      if (!symbol) return;
      
      setIsLoading(true);
      try {
        const quote = await fetchStockQuote(symbol);
        setStockData({
          ...quote,
          name: quote.name || `${symbol} Stock`,
        });
        setError(null);
      } catch (err) {
        console.error(`Error fetching data for ${symbol}:`, err);
        setError("Failed to load stock data");
      } finally {
        setIsLoading(false);
      }
    };
    
    getStockData();
  }, [symbol]);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const symbol = location.pathname.split('/').pop() || '';
        const data = await fetchStockData(symbol, '1M');
        setStockData(data);
        
        // If we're on the analysis tab, also fetch analysis data
        if (activeTab === "analysis") {
          await fetchAnalysisData(symbol);
        }
      } catch (err) {
        setError("Failed to load stock data. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [location.pathname]);
  
  // Fetch analysis data when switching to analysis tab
  useEffect(() => {
    if (activeTab === "analysis" && !analysisData && !analysisLoading) {
      const symbol = location.pathname.split('/').pop() || '';
      fetchAnalysisData(symbol);
    }
  }, [activeTab, analysisData, analysisLoading]);
  
  const fetchAnalysisData = async (symbol: string) => {
    setAnalysisLoading(true);
    setAnalysisError(null);
    
    try {
      const data = await fetchStockAnalysis(symbol);
      setAnalysisData(data);
    } catch (err) {
      setAnalysisError("Failed to load analysis data. Please try again later.");
      console.error(err);
    } finally {
      setAnalysisLoading(false);
    }
  };
  
  // Function to get color for recommendation
  const getRecommendationColor = (recommendation: string) => {
    switch(recommendation.toLowerCase()) {
      case 'strong buy': return 'bg-green-500 text-white';
      case 'buy': return 'bg-green-400 text-white';
      case 'hold': return 'bg-yellow-500 text-white';
      case 'sell': return 'bg-red-400 text-white';
      case 'strong sell': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };
  
  // Function to get color for sentiment
  const getSentimentColor = (sentiment: string) => {
    switch(sentiment.toLowerCase()) {
      case 'very positive': return 'text-green-600';
      case 'positive': return 'text-green-500';
      case 'neutral': return 'text-yellow-500';
      case 'negative': return 'text-red-500';
      case 'very negative': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };
  
  // Function to get color based on risk score
  const getRiskColor = (score: number) => {
    if (score < 30) return 'bg-green-500';
    if (score < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  if (!symbol) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-[60vh]">
            <p className="text-muted-foreground">No stock symbol provided</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading stock data for {symbol}...</p>
          </div>
        </main>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <p className="text-red-500 mb-4">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <StockChart symbol={symbol} company={stockData.name} />
            </div>
            
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price</span>
                      <span className="font-medium">${stockData.price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Change</span>
                      <span className={stockData.change >= 0 ? 'text-up' : 'text-down'}>
                        {stockData.change >= 0 ? '+' : ''}{stockData.change.toFixed(2)} ({stockData.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Market Cap</span>
                      <span className="font-medium">
                        ${(stockData.price * (1000000 + Math.random() * 10000000)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Volume</span>
                      <span className="font-medium">
                        {(1000000 + Math.floor(Math.random() * 10000000)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Trading Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Open</span>
                      <span className="font-medium">
                        ${(stockData.price - stockData.change * Math.random()).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Previous Close</span>
                      <span className="font-medium">
                        ${(stockData.price - stockData.change).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Day Range</span>
                      <span className="font-medium">
                        ${(stockData.price - Math.abs(stockData.change) - 2).toFixed(2)} - 
                        ${(stockData.price + Math.abs(stockData.change) + 1).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">52wk Range</span>
                      <span className="font-medium">
                        ${(stockData.price * 0.7).toFixed(2)} - 
                        ${(stockData.price * 1.2).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
        
      case "analysis":
        return (
          <div className="space-y-6">
            {analysisLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading analysis data...</span>
              </div>
            ) : analysisError ? (
              <div className="p-4 bg-red-50 text-red-500 rounded-md">
                {analysisError}
              </div>
            ) : analysisData ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Technical Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <LineChart className="h-5 w-5" />
                        Technical Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="text-sm text-muted-foreground mb-2">Recommendation</div>
                        <Badge className={getRecommendationColor(analysisData.technicalAnalysis.recommendation)}>
                          {analysisData.technicalAnalysis.recommendation.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-sm text-muted-foreground mb-2">Technical Signals</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="text-xs">
                            MACD: <span className={analysisData.technicalAnalysis.signals.macd === 'bullish' ? 'text-green-500' : 'text-red-500'}>
                              {analysisData.technicalAnalysis.signals.macd}
                            </span>
                          </div>
                          <div className="text-xs">
                            RSI: <span className={analysisData.technicalAnalysis.signals.rsi < 30 ? 'text-red-500' : analysisData.technicalAnalysis.signals.rsi > 70 ? 'text-green-500' : 'text-yellow-500'}>
                              {analysisData.technicalAnalysis.signals.rsi.toFixed(1)}
                            </span>
                          </div>
                          <div className="text-xs">
                            SMA 50: <span className={analysisData.technicalAnalysis.signals.sma50 === 'above' ? 'text-green-500' : 'text-red-500'}>
                              {analysisData.technicalAnalysis.signals.sma50}
                            </span>
                          </div>
                          <div className="text-xs">
                            SMA 200: <span className={analysisData.technicalAnalysis.signals.sma200 === 'above' ? 'text-green-500' : 'text-red-500'}>
                              {analysisData.technicalAnalysis.signals.sma200}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-muted-foreground mb-2">Support & Resistance</div>
                        <div className="flex justify-between">
                          <div>
                            <span className="text-xs text-muted-foreground">Support</span>
                            <div className="font-semibold">${analysisData.technicalAnalysis.support}</div>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">Resistance</span>
                            <div className="font-semibold">${analysisData.technicalAnalysis.resistance}</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Fundamental Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5" />
                        Fundamental Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground">P/E Ratio</div>
                          <div className="font-semibold">{analysisData.fundamentalAnalysis.pe}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">EPS</div>
                          <div className="font-semibold">${analysisData.fundamentalAnalysis.eps}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Dividend Yield</div>
                          <div className="font-semibold">{analysisData.fundamentalAnalysis.dividendYield}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Debt/Equity</div>
                          <div className="font-semibold">{analysisData.fundamentalAnalysis.debtToEquity}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Quick Ratio</div>
                          <div className="font-semibold">{analysisData.fundamentalAnalysis.quickRatio}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">ROE</div>
                          <div className="font-semibold">{analysisData.fundamentalAnalysis.roe}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Sentiment Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Sentiment Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="text-sm text-muted-foreground mb-2">Overall Sentiment</div>
                        <div className={`text-lg font-semibold ${getSentimentColor(analysisData.sentimentAnalysis.overall)}`}>
                          {analysisData.sentimentAnalysis.overall.charAt(0).toUpperCase() + analysisData.sentimentAnalysis.overall.slice(1)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-muted-foreground">News Articles</div>
                          <div className="font-semibold">{analysisData.sentimentAnalysis.newsCount}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Social Mentions</div>
                          <div className="font-semibold">{analysisData.sentimentAnalysis.socialMentions}</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Insider Trading</div>
                          <div className={`font-semibold ${analysisData.sentimentAnalysis.insiderTrading === 'buying' ? 'text-green-500' : 'text-red-500'}`}>
                            {analysisData.sentimentAnalysis.insiderTrading.charAt(0).toUpperCase() + analysisData.sentimentAnalysis.insiderTrading.slice(1)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Short Interest</div>
                          <div className="font-semibold">{analysisData.sentimentAnalysis.shortInterest}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* AI Predictions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        AI Predictions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="text-sm text-muted-foreground mb-2">Price Targets</div>
                        <div className="flex justify-between">
                          <div>
                            <div className="text-xs text-muted-foreground">Low</div>
                            <div className="font-semibold">${analysisData.aiPredictions.priceTarget.low}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Median</div>
                            <div className="font-semibold">${analysisData.aiPredictions.priceTarget.median}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">High</div>
                            <div className="font-semibold">${analysisData.aiPredictions.priceTarget.high}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="text-xs text-muted-foreground">Short Term</div>
                          <Badge className={getRecommendationColor(analysisData.aiPredictions.shortTerm)}>
                            {analysisData.aiPredictions.shortTerm.toUpperCase()}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">Long Term</div>
                          <Badge className={getRecommendationColor(analysisData.aiPredictions.longTerm)}>
                            {analysisData.aiPredictions.longTerm.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-muted-foreground">Confidence</div>
                        <div className="font-semibold">{analysisData.aiPredictions.confidence}</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Risk Assessment */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5" />
                      Risk Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <div className="text-xs text-muted-foreground">Volatility</div>
                        <div className="font-semibold">{analysisData.riskAssessment.volatility}%</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Beta</div>
                        <div className="font-semibold">{analysisData.riskAssessment.beta}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Sharpe Ratio</div>
                        <div className="font-semibold">{analysisData.riskAssessment.sharpeRatio}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Value at Risk</div>
                        <div className="font-semibold">{analysisData.riskAssessment.valueAtRisk}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">Risk Score</div>
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full ${getRiskColor(analysisData.riskAssessment.riskScore)} flex items-center justify-center text-white font-semibold`}>
                            {analysisData.riskAssessment.riskScore}
                          </div>
                          <span className="ml-2 text-sm">
                            {analysisData.riskAssessment.riskScore < 30 ? 'Low' : 
                             analysisData.riskAssessment.riskScore < 70 ? 'Moderate' : 'High'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center py-10 text-muted-foreground">
                No analysis data available.
              </div>
            )}
          </div>
        );
        
      case "news":
        return (
          <NewsCard />
        );
        
      case "financials":
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Financials coming soon</p>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6 flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold">{stockData.name} ({symbol})</h1>
            <p className="text-muted-foreground">Stock details and analysis</p>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="news">News</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            {renderTabContent()}
          </TabsContent>
          
          <TabsContent value="analysis">
            {renderTabContent()}
          </TabsContent>
          
          <TabsContent value="news">
            {renderTabContent()}
          </TabsContent>
          
          <TabsContent value="financials">
            {renderTabContent()}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default StockDetails; 