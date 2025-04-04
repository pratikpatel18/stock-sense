import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "./ModeToggle";
import { Search, Bell, User, Menu, X, UserCircle, LogOut, Settings, HelpCircle, PieChart, TrendingUp, Brain, Sparkles, BarChart3, Target, Zap, Shield, LineChart, FileText, MessageSquare, LayoutDashboard, Briefcase, Newspaper, BarChartHorizontal, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { fetchStockQuote, searchStocks } from "@/lib/api";
import { 
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { debounce } from "lodash";

// Define StockSearchResult type
interface StockSearchResult {
  symbol: string;
  name: string;
  exchange?: string;
  region?: string;
  type?: string;
}

// Use BarChartHorizontal as Ticker icon
const Ticker = BarChartHorizontal;

// Popular stock tickers for suggestions
const popularStocks: StockSearchResult[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'Equity', region: 'United States' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Equity', region: 'United States' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Equity', region: 'United States' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Equity', region: 'United States' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', type: 'Equity', region: 'United States' },
  { symbol: 'META', name: 'Meta Platforms, Inc.', type: 'Equity', region: 'United States' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'Equity', region: 'United States' },
  { symbol: 'NFLX', name: 'Netflix, Inc.', type: 'Equity', region: 'United States' }
];

// Define interface for the CommandMenu props
interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(null);
  const [stockDetails, setStockDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleSearch = useCallback(
    debounce(async (term: string) => {
      if (term.length > 1) {
        setIsSearching(true);
        try {
          const results = await searchStocks(term);
          setSearchResults(results);
        } catch (error) {
          console.error("Search error:", error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300),
    []
  );

  const handleStockSelect = async (stock: StockSearchResult) => {
    setSelectedStock(stock);
    setIsLoadingDetails(true);
    
    try {
      const quoteData = await fetchStockQuote(stock.symbol);
      setStockDetails({
        ...quoteData,
        name: stock.name,
        region: stock.region,
        type: stock.type
      });
    } catch (error) {
      console.error("Error fetching stock details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleNavigateToStock = (symbol: string) => {
    navigate(`/stocks/${symbol}`);
    onOpenChange(false);
    setSelectedStock(null);
    setStockDetails(null);
    setSearchQuery("");
  };

  const handleInputChange = (value: string) => {
    setSearchQuery(value);
    setSelectedStock(null);
    setStockDetails(null);
    handleSearch(value);
  };

  const renderStockDetails = () => {
    if (!selectedStock) return null;
    
    return (
      <div className="p-4 border-t border-border">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg">{selectedStock.symbol}</h3>
            <p className="text-sm text-muted-foreground">{selectedStock.name}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {selectedStock.region}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {selectedStock.type}
              </Badge>
            </div>
          </div>
          <Button size="sm" onClick={() => handleNavigateToStock(selectedStock.symbol)}>
            View Details
          </Button>
        </div>
        
        {isLoadingDetails ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : stockDetails ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Price</span>
              <span className="font-semibold">${stockDetails.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Change</span>
              <div className="flex items-center">
                {stockDetails.change >= 0 ? 
                  <ArrowUp className="h-3 w-3 text-up mr-1" /> : 
                  <ArrowDown className="h-3 w-3 text-down mr-1" />
                }
                <span className={stockDetails.change >= 0 ? 'text-up font-medium' : 'text-down font-medium'}>
                  {stockDetails.change.toFixed(2)} ({stockDetails.changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-2 text-sm text-muted-foreground">
            No additional data available
          </div>
        )}
      </div>
    );
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput 
        placeholder="Search stocks by symbol or company name..."
        value={searchQuery}
        onValueChange={handleInputChange}
      />
      <CommandList>
        {isSearching ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Searching stocks...</span>
          </div>
        ) : (
          <>
            <CommandEmpty>
              {searchQuery.length > 0 ? (
                <div className="py-6 text-center text-sm">
                  <p>No results found for "{searchQuery}"</p>
                  <p className="text-muted-foreground mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  Start typing to search for stocks
                </div>
              )}
            </CommandEmpty>
            
            {!selectedStock && (
              <>
                {searchResults.length > 0 && (
                  <CommandGroup heading="Search Results">
                    {searchResults.map((stock) => (
                      <CommandItem
                        key={stock.symbol}
                        onSelect={() => handleStockSelect(stock)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <Ticker className="mr-2 h-4 w-4" />
                          <div>
                            <span className="font-medium">{stock.symbol}</span>
                            <span className="ml-2 text-sm text-muted-foreground truncate">
                              {stock.name}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {stock.region}
                        </Badge>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                
                {searchQuery.length === 0 && (
                  <CommandGroup heading="Popular Stocks">
                    {popularStocks.map((stock) => (
                      <CommandItem
                        key={stock.symbol}
                        onSelect={() => handleNavigateToStock(stock.symbol)}
                      >
                        <Ticker className="mr-2 h-4 w-4" />
                        <span className="font-medium">{stock.symbol}</span>
                        <span className="ml-2 text-sm text-muted-foreground truncate">
                          {stock.name}
                        </span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </>
            )}
            
            {renderStockDetails()}
            
            {!selectedStock && (
              <>
                <CommandSeparator />
                <CommandGroup heading="Pages">
                  <CommandItem onSelect={() => { navigate("/"); onOpenChange(false); }}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </CommandItem>
                  <CommandItem onSelect={() => { navigate("/portfolio"); onOpenChange(false); }}>
                    <Briefcase className="mr-2 h-4 w-4" />
                    Portfolio
                  </CommandItem>
                  <CommandItem onSelect={() => { navigate("/news"); onOpenChange(false); }}>
                    <Newspaper className="mr-2 h-4 w-4" />
                    News
                  </CommandItem>
                  <CommandItem onSelect={() => { navigate("/insights"); onOpenChange(false); }}>
                    <LineChart className="mr-2 h-4 w-4" />
                    Insights
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and brand */}
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2">
                <div className="relative h-8 w-8 overflow-hidden rounded-full bg-primary">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary-foreground">S</span>
                  </div>
                </div>
                <span className="text-xl font-bold">StockSense</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link to="/" className="nav-link">Dashboard</Link>
              <Link to="/stocks" className="nav-link">Stocks</Link>
              <Link to="/insights" className="nav-link">Insights</Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="nav-link flex items-center gap-1 relative px-3 py-1.5 group">
                    <div className="absolute -top-1 -right-1">
                      <Sparkles className="h-3 w-3 text-primary animate-pulse" />
                    </div>
                    <Brain className="mr-1 h-4 w-4" />
                    <span>SmartPlan</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-96 max-h-[80vh] overflow-y-auto">
                  <DropdownMenuLabel className="flex justify-between">
                    <span>AI-Powered Investment Strategy</span>
                    <Badge variant="outline" className="bg-primary/20 text-primary px-2 text-xs">Personalized</Badge>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <div className="p-3 space-y-3">
                    <div className="flex items-center gap-2 p-2 rounded-lg border border-primary/10 bg-primary/5">
                      <Zap className="h-10 w-10 p-1.5 text-primary bg-primary/10 rounded-lg shrink-0" />
                      <div>
                        <h4 className="font-medium">Your SmartPlan is ready</h4>
                        <p className="text-sm text-muted-foreground">Tailored insights for Indian markets based on your portfolio</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <Link 
                        to="/smartplan?tab=portfolio-analysis"
                        className="p-2 rounded-lg border flex flex-col items-center text-center hover:bg-muted/50 cursor-pointer"
                        onClick={() => setIsCommandOpen(false)}
                      >
                        <PieChart className="h-8 w-8 mb-1 text-blue-500" />
                        <span className="text-xs font-medium">Portfolio Analysis</span>
                      </Link>
                      <Link 
                        to="/smartplan?tab=investment-strategy"
                        className="p-2 rounded-lg border flex flex-col items-center text-center hover:bg-muted/50 cursor-pointer"
                        onClick={() => setIsCommandOpen(false)}
                      >
                        <Brain className="h-8 w-8 mb-1 text-primary" />
                        <span className="text-xs font-medium">Investment Strategy</span>
                      </Link>
                      <Link 
                        to="/smartplan?tab=stock-recommendations"
                        className="p-2 rounded-lg border flex flex-col items-center text-center hover:bg-muted/50 cursor-pointer"
                        onClick={() => setIsCommandOpen(false)}
                      >
                        <TrendingUp className="h-8 w-8 mb-1 text-up" />
                        <span className="text-xs font-medium">Stock Recommendations</span>
                      </Link>
                      <Link 
                        to="/smartplan?tab=risk-management"
                        className="p-2 rounded-lg border flex flex-col items-center text-center hover:bg-muted/50 cursor-pointer"
                        onClick={() => setIsCommandOpen(false)}
                      >
                        <Shield className="h-8 w-8 mb-1 text-amber-500" />
                        <span className="text-xs font-medium">Risk Management</span>
                      </Link>
                      <Link 
                        to="/smartplan?tab=ai-predictions"
                        className="p-2 rounded-lg border flex flex-col items-center text-center hover:bg-muted/50 cursor-pointer"
                        onClick={() => setIsCommandOpen(false)}
                      >
                        <LineChart className="h-8 w-8 mb-1 text-purple-500" />
                        <span className="text-xs font-medium">AI Predictions</span>
                      </Link>
                      <Link 
                        to="/smartplan?tab=sentiment-analysis"
                        className="p-2 rounded-lg border flex flex-col items-center text-center hover:bg-muted/50 cursor-pointer"
                        onClick={() => setIsCommandOpen(false)}
                      >
                        <MessageSquare className="h-8 w-8 mb-1 text-green-500" />
                        <span className="text-xs font-medium">Sentiment Analysis</span>
                      </Link>
                    </div>
                    
                    <DropdownMenuSeparator />
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium text-muted-foreground px-2">Recent Insights</h5>
                      
                      <div className="rounded-lg border p-2 hover:bg-muted/50 cursor-pointer" onClick={() => { navigate('/smartplan?tab=risk-management'); setIsCommandOpen(false); }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">Portfolio Rebalancing Alert</span>
                          <Badge variant="destructive" className="text-[10px] h-5">New</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Your portfolio needs rebalancing due to overexposure in technology sector</p>
                      </div>
                      
                      <div className="rounded-lg border p-2 hover:bg-muted/50 cursor-pointer" onClick={() => { navigate('/smartplan?tab=portfolio-analysis'); setIsCommandOpen(false); }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">Risk Assessment</span>
                          <Badge variant="secondary" className="text-[10px] h-5">2h ago</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">Volatility in your portfolio has increased by 8.5% this week</p>
                      </div>
                    </div>
                    
                    <Button className="w-full" onClick={() => { navigate('/smartplan'); setIsCommandOpen(false); }}>
                      View Full SmartPlan Dashboard
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link to="/news" className="nav-link">News</Link>
              <Link to="/portfolio" className="nav-link">Portfolio</Link>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex items-center gap-4">
              <Button variant="outline" className="w-64 justify-start text-muted-foreground" onClick={() => setIsCommandOpen(true)}>
                <Search className="mr-2 h-4 w-4" />
                <span>Search stocks...</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-auto">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/portfolio" className="flex items-center w-full">
                      <PieChart className="mr-2 h-4 w-4" />
                      <span>Portfolio</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <ModeToggle />
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden gap-2">
              <Button variant="ghost" size="icon" onClick={() => setIsCommandOpen(true)}>
                <Search className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Link to="/portfolio" className="flex items-center w-full">
                      <PieChart className="mr-2 h-4 w-4" />
                      <span>Portfolio</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <ModeToggle />
            </div>
          </div>

          {/* Mobile menu */}
          <div
            className={cn(
              "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
              isMenuOpen ? "max-h-96 py-4" : "max-h-0"
            )}
          >
            <div className="flex flex-col space-y-2">
              <Link to="/" className="nav-link">Dashboard</Link>
              <Link to="/stocks" className="nav-link">Stocks</Link>
              <Link to="/insights" className="nav-link">Insights</Link>
              <Link to="/smartplan" className="nav-link flex items-center">
                <Brain className="mr-2 h-4 w-4" />
                <span>SmartPlan</span>
                <Badge className="ml-2 bg-primary/20 text-primary px-2 py-0 text-xs">New</Badge>
              </Link>
              <Link to="/news" className="nav-link">News</Link>
              <Link to="/portfolio" className="nav-link">Portfolio</Link>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <CommandMenu open={isCommandOpen} onOpenChange={setIsCommandOpen} />
    </>
  );
};

export default Navbar;
