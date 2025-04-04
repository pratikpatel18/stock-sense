import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Wallet, Lock, Loader2, Plus } from "lucide-react";
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
              placeholder="e.g. AAPL"
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
            <Label htmlFor="price">Purchase Price</Label>
            <Input
              id="price"
              placeholder="e.g. 150.00"
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

// Mock initial portfolio with US stocks
const mockInitialPortfolio = (): PortfolioPosition[] => {
  return [
    { 
      symbol: 'AAPL', 
      name: 'Apple Inc.', 
      shares: 10, 
      avgPrice: 150.00, 
      currentPrice: 173.41, 
      value: 1734.10, 
      change: 23.41, 
      changePercent: 15.61 
    },
    { 
      symbol: 'MSFT', 
      name: 'Microsoft Corp.', 
      shares: 5, 
      avgPrice: 300.00, 
      currentPrice: 397.58, 
      value: 1987.90, 
      change: 97.58, 
      changePercent: 32.53 
    },
    { 
      symbol: 'GOOGL', 
      name: 'Alphabet Inc.', 
      shares: 8, 
      avgPrice: 120.00, 
      currentPrice: 141.16, 
      value: 1129.28, 
      change: 21.16, 
      changePercent: 17.63 
    },
    { 
      symbol: 'AMZN', 
      name: 'Amazon.com Inc.', 
      shares: 6, 
      avgPrice: 160.00, 
      currentPrice: 175.35, 
      value: 1052.10, 
      change: 15.35, 
      changePercent: 9.59 
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">Portfolio</CardTitle>
        <div className="flex items-center gap-2">
          <AddPositionDialog onAdd={loadPortfolioData} />
          <Badge variant="outline">
            <Wallet className="mr-1 h-3 w-3" />
            ${portfolioData.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="text-xs text-muted-foreground">Day Change</div>
            <div className={`text-lg font-bold ${portfolioData.dayChange >= 0 ? 'text-up' : 'text-down'}`}>
              {portfolioData.dayChange >= 0 ? '+' : ''}${Math.abs(portfolioData.dayChange).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
              ({portfolioData.dayChange >= 0 ? '+' : ''}{portfolioData.dayChangePercent.toFixed(2)}%)
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Total Gain</div>
            <div className={`text-lg font-bold ${portfolioData.totalGain >= 0 ? 'text-up' : 'text-down'}`}>
              {portfolioData.totalGain >= 0 ? '+' : ''}${Math.abs(portfolioData.totalGain).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
              ({portfolioData.totalGain >= 0 ? '+' : ''}{portfolioData.totalGainPercent.toFixed(2)}%)
            </div>
          </div>
        </div>
        
        {portfolioData.sectorAllocation.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioData.sectorAllocation}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}%`}
                  labelLine={false}
                >
                  {portfolioData.sectorAllocation.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-medium mb-2">Positions</h3>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {portfolioData.positions.map((position, index) => (
                <div key={index} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-medium">{position.symbol}</div>
                    <div className="text-xs text-muted-foreground">{position.shares} shares @ ${position.avgPrice.toFixed(2)}</div>
                  </div>
                  <div className="text-right">
                    <div>${position.value.toFixed(2)}</div>
                    <div className={position.change >= 0 ? 'text-up text-xs' : 'text-down text-xs'}>
                      {position.change >= 0 ? '+' : ''}${position.change.toFixed(2)} ({position.changePercent.toFixed(2)}%)
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 w-7 p-0"
                    onClick={() => handleRemovePosition(position.symbol)}
                  >
                    &times;
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PortfolioSummary;
