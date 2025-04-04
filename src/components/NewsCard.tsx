import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchStockNews } from '@/lib/api';

interface NewsItem {
  title: string;
  source: string;
  time_published: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  url: string;
  summary: string;
  banner_image?: string;
}

const NewsCard = () => {
  const [filter, setFilter] = useState<string>('all');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getNews = async () => {
      setIsLoading(true);
      try {
        // For demo purposes, we'll fetch news for a popular stock
        // In a real app, you might fetch general market news or news for stocks in the user's watchlist
        const newsData = await fetchStockNews('AAPL');
        setNews(newsData);
        setError(null);
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("Failed to load news data");
      } finally {
        setIsLoading(false);
      }
    };

    getNews();
    
    // Refresh every 15 minutes
    const interval = setInterval(getNews, 15 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Filter news based on selected sentiment
  const filteredNews = filter === 'all' 
    ? news 
    : news.filter(item => item.sentiment === filter);
  
  // Format timestamp to relative time (e.g., "2h ago")
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const publishedTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - publishedTime.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-3 w-3" />;
      case 'negative':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getSentimentClass = (sentiment?: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-up/10 text-up border-up/30';
      case 'negative':
        return 'bg-down/10 text-down border-down/30';
      default:
        return 'bg-neutral/10 text-neutral border-neutral/30';
    }
  };

  if (isLoading && news.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-semibold">Market News</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-72">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading news...</p>
        </CardContent>
      </Card>
    );
  }

  if (error && news.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-semibold">Market News</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-72">
          <p className="text-sm text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Market News</CardTitle>
        <Select
          value={filter}
          onValueChange={(value) => setFilter(value)}
        >
          <SelectTrigger className="w-[130px] h-8">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All News</SelectItem>
            <SelectItem value="positive">Positive</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="negative">Negative</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[340px] overflow-y-auto pr-1">
          {filteredNews.length > 0 ? (
            filteredNews.map((newsItem, i) => (
              <a 
                key={i} 
                href={newsItem.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:bg-secondary/50 rounded-md p-2 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-sm">{newsItem.title}</h3>
                  {newsItem.sentiment && (
                    <Badge variant="outline" className={`ml-2 ${getSentimentClass(newsItem.sentiment)}`}>
                      {getSentimentIcon(newsItem.sentiment)}
                    </Badge>
                  )}
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{newsItem.source} • {formatTimeAgo(newsItem.time_published)}</span>
                  <ArrowRight className="h-3 w-3" />
                </div>
              </a>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No news matching the selected filter
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsCard;
