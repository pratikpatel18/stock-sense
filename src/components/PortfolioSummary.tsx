import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Wallet, Lock, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchPortfolioData, addToPortfolio, removeFromPortfolio, PortfolioData, PortfolioPosition } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Link } from 'react-router-dom';

const AddPositionDialog = ({ onAdd }: { onAdd: () => void }) => {
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handleAdd = async () => {
    if (!symbol || !shares || !price) {
      setError('All fields are required');
      return;
    }

    const sharesNum = parseFloat(shares);
    const priceNum = parseFloat(price);

    if (isNaN(sharesNum) || sharesNum <= 0) {
      setError('Shares must be a positive number');
      return;
    }

    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price must be a positive number');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await addToPortfolio(symbol.toUpperCase(), sharesNum, priceNum);
      if (success) {
        setSymbol('');
        setShares('');
        setPrice('');
        setOpen(false);
        onAdd();
      } else {
        setError('Failed to add position. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> Add Position
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Position</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="symbol">Stock Symbol</Label>
            <Input
              id="symbol"
              placeholder="e.g. RELIANCE"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shares">Number of Shares</Label>
            <Input
              id="shares"
              placeholder="e.g. 10"
              type="number"
              min="0.01"
              step="0.01"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Purchase Price (₹)</Label>
            <Input
              id="price"
              placeholder="e.g. 2800.50"
              type="number"
              min="0.01"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button onClick={handleAdd} disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Add to Portfolio
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Mock initial portfolio with Indian stocks
const mockInitialPortfolio = (): PortfolioPosition[] => {
  return [
    { 
      symbol: 'RELIANCE', 
      name: 'Reliance Industries Ltd.', 
      shares: 10, 
      avgPrice: 2800.50, 
      currentPrice: 2874.25, 
      value: 28742.50, 
      change: 73.75, 
      changePercent: 2.63 
    },
    { 
      symbol: 'TCS', 
      name: 'Tata Consultancy Services Ltd.', 
      shares: 5, 
      avgPrice: 3500.75, 
      currentPrice: 3671.80, 
      value: 18359.00, 
      change: 171.05, 
      changePercent: 4.89 
    },
    { 
      symbol: 'HDFCBANK', 
      name: 'HDFC Bank Ltd.', 
      shares: 15, 
      avgPrice: 1650.25, 
      currentPrice: 1689.35, 
      value: 25340.25, 
      change: 39.10, 
      changePercent: 2.37 
    },
    { 
      symbol: 'INFY', 
      name: 'Infosys Ltd.', 
      shares: 20, 
      avgPrice: 1490.80, 
      currentPrice: 1522.75, 
      value: 30455.00, 
      change: 31.95, 
      changePercent: 2.14 
    },
  ];
};

const PortfolioSummary = () => {
  // For a real app, we would check if user is authenticated
  const isAuthenticated = true; // For demo, set to true to show real portfolio
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    positions: [],
    totalValue: 0,
    dayChange: 0,
    dayChangePercent: 0,
    totalGain: 0,
    totalGainPercent: 0,
    sectorAllocation: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPortfolioData = async () => {
    setLoading(true);
    try {
      const data = await fetchPortfolioData();
      setPortfolioData(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching portfolio data:", err);
      setError("Failed to load portfolio data");
    } finally {
      setLoading(false);
    }
  };

  // Initialize with mock data
  useEffect(() => {
    const initializePortfolio = async () => {
      // Check if we have portfolio data in localStorage
      const savedPortfolio = localStorage.getItem('portfolio');
      
      if (!savedPortfolio) {
        // Initialize with mock data
        const initialPositions = mockInitialPortfolio();
        localStorage.setItem('portfolio', JSON.stringify(initialPositions));
      }
      
      // Load the portfolio data
      loadPortfolioData();
    };
    
    initializePortfolio();
    
    // Refresh every 60 seconds
    const interval = setInterval(loadPortfolioData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRemovePosition = async (symbol: string) => {
    if (confirm(`Are you sure you want to remove ${symbol} from your portfolio?`)) {
      try {
        await removeFromPortfolio(symbol);
        loadPortfolioData();
      } catch (err) {
        console.error("Error removing position:", err);
      }
    }
  };

  const COLORS = [
    'hsl(var(--primary))',
    '#3b82f6',
    '#6366f1',
    '#8b5cf6',
    '#a855f7'
  ];

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-semibold">Portfolio</CardTitle>
          <Badge variant="outline">
            <Lock className="mr-1 h-3 w-3" />
            Sign in required
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-72">
          <Lock className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-center text-muted-foreground mb-4">
            Sign in to track your portfolio performance and allocation
          </p>
          <Button>Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  if (loading && !portfolioData) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-semibold">Portfolio</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-72">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading portfolio...</p>
        </CardContent>
      </Card>
    );
  }

  if (error && !portfolioData) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-semibold">Portfolio</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-72">
          <p className="text-sm text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!portfolioData || portfolioData.positions.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-semibold">Portfolio</CardTitle>
          <AddPositionDialog onAdd={loadPortfolioData} />
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-72">
          <p className="text-center text-muted-foreground mb-4">
            Your portfolio is empty. Add a position to get started.
          </p>
          <Button>Add Position</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="text-xl font-semibold">My Portfolio</CardTitle>
          {!loading && (
            <div className="text-sm text-muted-foreground">
              Total Value: ₹{portfolioData.totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          )}
        </div>
        {isAuthenticated ? (
          <AddPositionDialog onAdd={loadPortfolioData} />
        ) : (
          <Button variant="outline" size="sm" className="gap-1">
            <Lock className="h-4 w-4" /> Sign In to View
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-500">{error}</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={loadPortfolioData}
            >
              Retry
            </Button>
          </div>
        ) : portfolioData.positions.length === 0 ? (
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Your portfolio is empty.</p>
            <AddPositionDialog onAdd={loadPortfolioData} />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Day Change</div>
                <div className={`text-lg font-bold ${portfolioData.dayChange >= 0 ? 'text-up' : 'text-down'}`}>
                  {portfolioData.dayChange >= 0 ? '+' : ''}
                  ₹{portfolioData.dayChange.toFixed(2)} ({portfolioData.dayChangePercent.toFixed(2)}%)
                </div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Total Gain</div>
                <div className={`text-lg font-bold ${portfolioData.totalGain >= 0 ? 'text-up' : 'text-down'}`}>
                  {portfolioData.totalGain >= 0 ? '+' : ''}
                  ₹{portfolioData.totalGain.toFixed(2)} ({portfolioData.totalGainPercent.toFixed(2)}%)
                </div>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">Positions</div>
                <div className="text-lg font-bold">{portfolioData.positions.length}</div>
              </div>
            </div>
            
            {/* Positions Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Symbol</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Shares</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Avg Price</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Current</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Value</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Gain</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                  {portfolioData.positions.map((position, index) => (
                    <tr key={index} className="hover:bg-muted/50">
                      <td className="px-4 py-2">
                        <Link to={`/stock/${position.symbol}`} className="hover:underline font-semibold flex items-center">
                          {position.symbol}
                        </Link>
                        <div className="text-xs text-muted-foreground">{position.name}</div>
                      </td>
                      <td className="px-4 py-2 text-right">
                        {position.shares}
                      </td>
                      <td className="px-4 py-2 text-right whitespace-nowrap">
                        ₹{position.avgPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right whitespace-nowrap">
                        ₹{position.currentPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right whitespace-nowrap font-medium">
                        ₹{position.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-2 text-right whitespace-nowrap">
                        <span className={`${position.change >= 0 ? 'text-up' : 'text-down'}`}>
                          {position.change >= 0 ? '+' : ''}
                          ₹{position.change.toFixed(2)} ({position.changePercent.toFixed(2)}%)
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7" 
                          onClick={() => handleRemovePosition(position.symbol)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioSummary;
