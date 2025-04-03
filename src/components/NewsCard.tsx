
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NewsItem {
  title: string;
  source: string;
  time: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  url: string;
}

const NewsCard = () => {
  const [filter, setFilter] = useState<string>('all');

  // Mock news data - would be fetched from API in production
  const allNews: NewsItem[] = [
    {
      title: "Apple's AI Strategy Will Be Revealed Next Month",
      source: "Bloomberg",
      time: "1h ago",
      sentiment: 'positive',
      url: "#"
    },
    {
      title: "Tesla Stock Falls After Missed Delivery Targets",
      source: "Reuters",
      time: "2h ago",
      sentiment: 'negative',
      url: "#"
    },
    {
      title: "Fed Likely to Hold Interest Rates Steady in Next Meeting",
      source: "Financial Times",
      time: "3h ago",
      sentiment: 'neutral',
      url: "#"
    },
    {
      title: "Microsoft Cloud Revenue Jumps 29% in Latest Quarter",
      source: "CNBC",
      time: "4h ago",
      sentiment: 'positive',
      url: "#"
    },
    {
      title: "Amazon to Cut 4% of Workforce in logistics Division",
      source: "Wall Street Journal",
      time: "5h ago",
      sentiment: 'negative',
      url: "#"
    },
    {
      title: "Google's AI Models Show Promising Results in Financial Analysis",
      source: "TechCrunch",
      time: "6h ago",
      sentiment: 'positive',
      url: "#"
    },
  ];

  // Filter news based on selected sentiment
  const filteredNews = filter === 'all' 
    ? allNews 
    : allNews.filter(item => item.sentiment === filter);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-3 w-3" />;
      case 'negative':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getSentimentClass = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-up/10 text-up border-up/30';
      case 'negative':
        return 'bg-down/10 text-down border-down/30';
      default:
        return 'bg-neutral/10 text-neutral border-neutral/30';
    }
  };

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
        <div className="space-y-4">
          {filteredNews.length > 0 ? (
            filteredNews.map((news, i) => (
              <a 
                key={i} 
                href={news.url}
                className="block hover:bg-secondary/50 rounded-md p-2 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-sm">{news.title}</h3>
                  <Badge variant="outline" className={`ml-2 ${getSentimentClass(news.sentiment)}`}>
                    {getSentimentIcon(news.sentiment)}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{news.source} • {news.time}</span>
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
