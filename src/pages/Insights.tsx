import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowUp, 
  ArrowDown, 
  TrendingUp, 
  Brain, 
  Loader2, 
  Search,
  Calendar,
  LineChart,
  TrendingDown,
  Filter
} from "lucide-react";
import { fetchInsights, InsightItem } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const getTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'buy': return <ArrowUp className="h-4 w-4" />;
    case 'sell': return <ArrowDown className="h-4 w-4" />;
    case 'hold': return <LineChart className="h-4 w-4" />;
    case 'watch': return <TrendingUp className="h-4 w-4" />;
    default: return <TrendingUp className="h-4 w-4" />;
  }
};

const getRecommendationColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'buy': return "bg-up/10 text-up border-up/30";
    case 'sell': return "bg-down/10 text-down border-down/30";
    case 'hold': return "bg-amber-500/10 text-amber-500 border-amber-500/30";
    default: return "bg-primary/10 text-primary border-primary/30"; // For 'watch' type
  }
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 80) return "bg-up/10 text-up border-up/30";
  if (confidence >= 60) return "bg-amber-500/10 text-amber-500 border-amber-500/30";
  return "bg-down/10 text-down border-down/30";
};

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleDateString([], { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

const InsightsPage = () => {
  const [insights, setInsights] = useState<InsightItem[]>([]);
  const [filteredInsights, setFilteredInsights] = useState<InsightItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'confidence' | 'latest'>('confidence');

  useEffect(() => {
    const getInsights = async () => {
      setIsLoading(true);
      try {
        const data = await fetchInsights();
        setInsights(data);
        setFilteredInsights(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching insights:", err);
        setError("Failed to load AI insights");
      } finally {
        setIsLoading(false);
      }
    };

    getInsights();
  }, []);

  useEffect(() => {
    // Apply filters and search
    let results = [...insights];
    
    // Apply type filter
    if (typeFilter !== 'all') {
      results = results.filter(item => item.type === typeFilter);
    }
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        item => 
          item.symbol.toLowerCase().includes(query) || 
          item.company.toLowerCase().includes(query) ||
          item.summary.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    if (sortOrder === 'confidence') {
      results.sort((a, b) => b.confidence - a.confidence);
    } else {
      results.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }
    
    setFilteredInsights(results);
  }, [insights, typeFilter, searchQuery, sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already applied via useEffect
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">AI Insights</h1>
            <p className="text-muted-foreground">AI-powered stock analysis and recommendations</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              <Brain className="h-3 w-3 mr-1" />
              AI-Powered
            </Badge>
            <Badge variant="outline">
              <Calendar className="h-3 w-3 mr-1" />
              Updated {new Date().toLocaleDateString()}
            </Badge>
          </div>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="search"
                    placeholder="Search by symbol, company name or keywords..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                </form>
              </div>
              
              <div className="flex gap-2 w-full md:w-auto">
                <div className="w-full md:w-[180px]">
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filter by type" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Recommendations</SelectItem>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                      <SelectItem value="hold">Hold</SelectItem>
                      <SelectItem value="watch">Watch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full md:w-[180px]">
                  <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as 'confidence' | 'latest')}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <ArrowDown className="h-4 w-4" />
                        <SelectValue placeholder="Sort by" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confidence">Highest Confidence</SelectItem>
                      <SelectItem value="latest">Latest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="analysis">Market Analysis</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="insights">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading insights...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-red-500 mb-4">{error}</p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            ) : filteredInsights.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-muted-foreground mb-4">No insights found matching your criteria.</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredInsights.map((insight, index) => (
                  <Card key={index} className="flex flex-col h-full">
                    <CardHeader className="pb-2 flex flex-row items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant="outline" 
                            className={getRecommendationColor(insight.type)}
                          >
                            {getTypeIcon(insight.type)}
                            <span className="ml-1 capitalize">{insight.type}</span>
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={getConfidenceColor(insight.confidence)}
                          >
                            {insight.confidence}% Confidence
                          </Badge>
                        </div>
                        <div className="flex items-center">
                          <h3 className="text-lg font-bold">{insight.symbol}</h3>
                          <span className="text-sm text-muted-foreground ml-2">{insight.company}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-sm mb-4 flex-1">{insight.summary}</p>
                      <div className="text-sm text-muted-foreground mt-auto">
                        {insight.priceTarget && (
                          <div className="flex justify-between mb-1 font-medium">
                            <span>Price Target:</span>
                            <span className={insight.type === 'buy' ? 'text-up' : insight.type === 'sell' ? 'text-down' : ''}>
                              ${insight.priceTarget.toFixed(2)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <Badge variant="secondary" className="text-xs">
                            <Brain className="h-3 w-3 mr-1" />
                            AI Analysis
                          </Badge>
                          <span className="text-xs">{formatDate(insight.timestamp)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="analysis">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Market analysis coming soon</p>
            </div>
          </TabsContent>
          
          <TabsContent value="trends">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Trends coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default InsightsPage; 