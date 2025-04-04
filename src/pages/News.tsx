import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { fetchFinancialNews } from '@/lib/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Calendar, Tag, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NewsPage = () => {
  const [newsArticles, setNewsArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  useEffect(() => {
    const getNewsData = async () => {
      setIsLoading(true);
      try {
        const news = await fetchFinancialNews();
        setNewsArticles(news);
        setError(null);
      } catch (err) {
        console.error('Error fetching news:', err);
        setError("Failed to load news articles");
        setNewsArticles([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    getNewsData();
  }, []);
  
  const categories = [
    { value: "all", label: "All Categories" },
    { value: "markets", label: "Markets" },
    { value: "stocks", label: "Stocks" },
    { value: "economy", label: "Economy" },
    { value: "business", label: "Business" },
    { value: "technology", label: "Technology" },
    { value: "crypto", label: "Cryptocurrency" },
  ];
  
  const filteredNews = newsArticles.filter(article => {
    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.source.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || 
      (article.topics && article.topics.includes(selectedCategory));
    
    return matchesSearch && matchesCategory;
  });
  
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'text-up';
      case 'negative':
        return 'text-down';
      default:
        return 'text-muted-foreground';
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-1">Financial News</h1>
        <p className="text-muted-foreground mb-6">Latest market and financial news</p>
        
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search news..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue="latest" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="latest">Latest</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="market">Market News</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="latest">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center text-red-500 p-6">
                {error}
              </div>
            ) : filteredNews.length === 0 ? (
              <div className="text-center text-muted-foreground p-8">
                No news articles found matching your criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNews.map((article, index) => (
                  <Card key={index} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start gap-2">
                        <Badge variant="outline">{article.topics?.[0] || 'General'}</Badge>
                        <Badge variant="secondary" className={getSentimentColor(article.sentiment)}>
                          {article.sentiment}
                        </Badge>
                      </div>
                      <CardTitle className="mt-2">{article.title}</CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {article.time_published}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p>{article.summary}</p>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-4 border-t">
                      <div className="text-sm text-muted-foreground">Source: {article.source}</div>
                      <Button variant="ghost" size="sm" className="flex items-center gap-1" asChild>
                        <a href={article.url} target="_blank" rel="noreferrer">
                          Read
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="trending">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Trending news coming soon</p>
            </div>
          </TabsContent>
          
          <TabsContent value="market">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Market news coming soon</p>
            </div>
          </TabsContent>
          
          <TabsContent value="analysis">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Analysis coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default NewsPage; 