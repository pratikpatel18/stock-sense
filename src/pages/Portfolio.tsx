import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowUpRight, ArrowDownRight, Plus, X, Trash2, PieChart, LineChart, BarChart } from 'lucide-react';
import { fetchPortfolioData, updatePortfolio } from '@/lib/api';
import { PieChart as RechartsChart, Pie, Cell, ResponsiveContainer, Tooltip as ChartTooltip } from 'recharts';
import { toast } from '@/components/ui/use-toast';

// Placeholder colors for the pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const PortfolioPage = () => {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<any>({
    positions: [],
    totalValue: 0,
    performance: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0
    },
    sectorAllocation: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPosition, setNewPosition] = useState({
    symbol: '',
    shares: '0',
    averageCost: '0'
  });
  
  useEffect(() => {
    const getPortfolioData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchPortfolioData();
        setPortfolio(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching portfolio data:', err);
        setError("Failed to load portfolio data");
      } finally {
        setIsLoading(false);
      }
    };
    
    getPortfolioData();
  }, []);
  
  const handleAddPosition = async () => {
    if (!newPosition.symbol || !newPosition.shares || !newPosition.averageCost) {
      toast({
        title: "Invalid position",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Convert shares and averageCost to numbers
      const position = {
        symbol: newPosition.symbol.toUpperCase(),
        name: newPosition.symbol.toUpperCase(),
        shares: parseFloat(newPosition.shares),
        avgPrice: parseFloat(newPosition.averageCost),
        currentPrice: 0,
        value: 0,
        change: 0,
        changePercent: 0
      };
      
      // Add to portfolio
      const updatedPositions = [...portfolio.positions, position];
      const updatedPortfolio = {...portfolio, positions: updatedPositions};
      
      await updatePortfolio(updatedPortfolio);
      setPortfolio(updatedPortfolio);
      
      toast({
        title: "Position added",
        description: `Added ${position.shares} shares of ${position.symbol} at $${position.avgPrice}`
      });
      
      // Reset form
      setNewPosition({
        symbol: '',
        shares: '0',
        averageCost: '0'
      });
      
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error('Error adding position:', err);
      toast({
        title: "Error",
        description: "Failed to add position to portfolio",
        variant: "destructive"
      });
    }
  };
  
  const handleRemovePosition = async (symbolToRemove: string) => {
    try {
      const updatedPositions = portfolio.positions.filter(
        (position: any) => position.symbol !== symbolToRemove
      );
      const updatedPortfolio = {...portfolio, positions: updatedPositions};
      
      await updatePortfolio(updatedPortfolio);
      setPortfolio(updatedPortfolio);
      
      toast({
        title: "Position removed",
        description: `Removed ${symbolToRemove} from your portfolio`
      });
    } catch (err) {
      console.error('Error removing position:', err);
      toast({
        title: "Error",
        description: "Failed to remove position from portfolio",
        variant: "destructive"
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading portfolio data...</p>
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
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </main>
      </div>
    );
  }
  
  const renderSectorAllocation = () => {
    if (!portfolio.sectorAllocation || portfolio.sectorAllocation.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No sector data available</p>
        </div>
      );
    }
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <RechartsChart>
          <Pie
            data={portfolio.sectorAllocation}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {portfolio.sectorAllocation.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <ChartTooltip 
            formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name]}
          />
        </RechartsChart>
      </ResponsiveContainer>
    );
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">My Portfolio</h1>
            <p className="text-muted-foreground">Manage and track your investments</p>
          </div>
          
          <Button 
            className="mt-4 md:mt-0"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Position
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${portfolio.totalValue.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Daily Change</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold flex items-center ${portfolio.dayChangePercent >= 0 ? 'text-up' : 'text-down'}`}>
                {portfolio.dayChangePercent >= 0 ? (
                  <ArrowUpRight className="mr-1 h-5 w-5" />
                ) : (
                  <ArrowDownRight className="mr-1 h-5 w-5" />
                )}
                {portfolio.dayChangePercent >= 0 ? '+' : ''}
                {portfolio.dayChangePercent.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Monthly Change</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold flex items-center ${portfolio.totalGainPercent >= 0 ? 'text-up' : 'text-down'}`}>
                {portfolio.totalGainPercent >= 0 ? (
                  <ArrowUpRight className="mr-1 h-5 w-5" />
                ) : (
                  <ArrowDownRight className="mr-1 h-5 w-5" />
                )}
                {portfolio.totalGainPercent >= 0 ? '+' : ''}
                {portfolio.totalGainPercent.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>YTD Return</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold flex items-center ${portfolio.totalGainPercent >= 0 ? 'text-up' : 'text-down'}`}>
                {portfolio.totalGainPercent >= 0 ? (
                  <ArrowUpRight className="mr-1 h-5 w-5" />
                ) : (
                  <ArrowDownRight className="mr-1 h-5 w-5" />
                )}
                {portfolio.totalGainPercent >= 0 ? '+' : ''}
                {portfolio.totalGainPercent.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="holdings" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="holdings" className="flex gap-2 items-center">
              <LineChart className="h-4 w-4" />
              Holdings
            </TabsTrigger>
            <TabsTrigger value="allocation" className="flex gap-2 items-center">
              <PieChart className="h-4 w-4" />
              Allocation
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex gap-2 items-center">
              <BarChart className="h-4 w-4" />
              Performance
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="holdings">
            {portfolio.positions.length === 0 ? (
              <Card>
                <CardContent className="pt-6 pb-6">
                  <div className="flex flex-col items-center justify-center text-center p-8">
                    <p className="text-muted-foreground mb-4">You don't have any positions in your portfolio yet.</p>
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Position
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 font-medium">
                  <div className="col-span-4">Symbol</div>
                  <div className="col-span-2 text-right">Shares</div>
                  <div className="col-span-2 text-right">Avg Cost</div>
                  <div className="col-span-2 text-right">Current</div>
                  <div className="col-span-1 text-right">Return</div>
                  <div className="col-span-1"></div>
                </div>
                
                {portfolio.positions.map((position: any) => (
                  <div key={position.symbol} className="grid grid-cols-12 gap-4 p-4 border-t">
                    <div className="col-span-4 font-medium">
                      <Link to={`/stocks/${position.symbol}`} className="hover:underline flex items-center">
                        {position.symbol}
                        {position.name && <span className="ml-2 text-muted-foreground text-sm hidden md:inline">{position.name}</span>}
                      </Link>
                    </div>
                    <div className="col-span-2 text-right">{position.shares}</div>
                    <div className="col-span-2 text-right">${position.avgPrice.toFixed(2)}</div>
                    <div className="col-span-2 text-right">${position.currentPrice?.toFixed(2) || '--'}</div>
                    <div className={`col-span-1 text-right ${position.changePercent >= 0 ? 'text-up' : 'text-down'}`}>
                      {position.changePercent ? (
                        <>{position.changePercent >= 0 ? '+' : ''}{position.changePercent.toFixed(2)}%</>
                      ) : '--'}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleRemovePosition(position.symbol)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="allocation">
            <Card>
              <CardHeader>
                <CardTitle>Sector Allocation</CardTitle>
                <CardDescription>Breakdown of your portfolio by sector</CardDescription>
              </CardHeader>
              <CardContent>
                {renderSectorAllocation()}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="performance">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Performance charts coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Position</DialogTitle>
            <DialogDescription>
              Add a new stock position to your portfolio.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="symbol" className="text-right">
                Symbol
              </Label>
              <Input
                id="symbol"
                placeholder="AAPL"
                className="col-span-3"
                value={newPosition.symbol}
                onChange={(e) => setNewPosition({...newPosition, symbol: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="shares" className="text-right">
                Shares
              </Label>
              <Input
                id="shares"
                type="number"
                placeholder="0"
                className="col-span-3"
                value={newPosition.shares}
                onChange={(e) => setNewPosition({...newPosition, shares: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cost" className="text-right">
                Average Cost
              </Label>
              <Input
                id="cost"
                type="number"
                placeholder="0.00"
                className="col-span-3"
                value={newPosition.averageCost}
                onChange={(e) => setNewPosition({...newPosition, averageCost: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPosition}>
              Add to Portfolio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PortfolioPage; 