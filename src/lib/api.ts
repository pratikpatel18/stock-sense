// API service for stock data
// Using Alpha Vantage API - you'll need to get your own API key from https://www.alphavantage.co/

const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || 'demo';
const BASE_URL = 'https://www.alphavantage.co/query';

interface StockQuote {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
}

interface MarketIndex {
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface StockChartData {
  date: string;
  price: number;
  volume: number;
}

interface NewsItem {
  title: string;
  url: string;
  source: string;
  summary: string;
  banner_image?: string;
  time_published: string;
  topics?: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface PortfolioPosition {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  change: number; 
  changePercent: number;
}

export interface PortfolioData {
  positions: PortfolioPosition[];
  totalValue: number;
  dayChange: number;
  dayChangePercent: number;
  totalGain: number;
  totalGainPercent: number;
  sectorAllocation: { name: string; value: number }[];
}

export interface InsightItem {
  symbol: string;
  company: string;
  type: 'buy' | 'sell' | 'hold' | 'watch';
  summary: string;
  confidence: number; // 0-100
  priceTarget?: number;
  timestamp: string;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
}

// Stock quote API
export const fetchStockQuote = async (symbol: string): Promise<StockQuote> => {
  try {
    const response = await fetch(`${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`);
    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }
    
    const quote = data['Global Quote'];
    if (!quote || Object.keys(quote).length === 0) {
      throw new Error('Invalid response from API');
    }
    
    return {
      symbol,
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
    };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    // Return mock data as fallback
    return {
      symbol,
      price: 100 + Math.random() * 200,
      change: (Math.random() * 10) - 5,
      changePercent: (Math.random() * 5) - 2.5,
    };
  }
};

export const fetchStockData = async (
  symbol: string, 
  timeRange: '1D' | '1W' | '1M' | '3M' | '1Y' | 'All'
): Promise<StockChartData[]> => {
  try {
    // Map timeRange to Alpha Vantage interval
    const interval = 
      timeRange === '1D' ? 'TIME_SERIES_INTRADAY&interval=5min' : 
      timeRange === '1W' ? 'TIME_SERIES_DAILY' :
      timeRange === '1M' ? 'TIME_SERIES_DAILY' :
      timeRange === '3M' ? 'TIME_SERIES_WEEKLY' :
      'TIME_SERIES_MONTHLY';
    
    const response = await fetch(`${BASE_URL}?function=${interval}&symbol=${symbol}&apikey=${API_KEY}`);
    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }
    
    // Different time series have different response keys
    const timeSeriesKey = 
      timeRange === '1D' ? 'Time Series (5min)' :
      timeRange === '1W' || timeRange === '1M' ? 'Time Series (Daily)' :
      timeRange === '3M' ? 'Weekly Time Series' :
      'Monthly Time Series';
    
    const timeSeries = data[timeSeriesKey];
    
    if (!timeSeries || Object.keys(timeSeries).length === 0) {
      throw new Error('Invalid response from API');
    }
    
    // Convert API response to chart data format
    const chartData = Object.entries(timeSeries)
      .map(([date, values]: [string, any]) => ({
        date,
        price: parseFloat(values['4. close']),
        volume: parseFloat(values['5. volume']),
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Limit data points based on timeRange
    const limitedData = 
      timeRange === '1D' ? chartData.slice(-24) :
      timeRange === '1W' ? chartData.slice(-7) :
      timeRange === '1M' ? chartData.slice(-30) :
      timeRange === '3M' ? chartData.slice(-13) :
      timeRange === '1Y' ? chartData.slice(-12) :
      chartData;
    
    // Format dates for display
    return limitedData.map(item => {
      let formattedDate;
      if (timeRange === '1D') {
        formattedDate = new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (timeRange === '1W' || timeRange === '1M') {
        formattedDate = new Date(item.date).toLocaleDateString([], { month: 'short', day: 'numeric' });
      } else {
        formattedDate = new Date(item.date).toLocaleDateString([], { month: 'short', year: '2-digit' });
      }
      
      return {
        ...item,
        date: formattedDate
      };
    });
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    // Return mock data as fallback
    return generateMockChartData(timeRange);
  }
};

export const fetchMarketIndices = async (): Promise<MarketIndex[]> => {
  try {
    // Alpha Vantage doesn't have a single endpoint for all indices, 
    // would need multiple calls in a real app
    // For demo purposes, fetch SPY as a proxy for S&P 500
    const spyResponse = await fetchStockQuote('SPY');
    const qqqResponse = await fetchStockQuote('QQQ'); // Nasdaq proxy
    const diaResponse = await fetchStockQuote('DIA'); // Dow Jones proxy
    const iwmResponse = await fetchStockQuote('IWM'); // Russell 2000 proxy
    
    return [
      {
        name: 'S&P 500',
        price: spyResponse.price,
        change: spyResponse.change,
        changePercent: spyResponse.changePercent
      },
      {
        name: 'Nasdaq',
        price: qqqResponse.price,
        change: qqqResponse.change,
        changePercent: qqqResponse.changePercent
      },
      {
        name: 'Dow Jones',
        price: diaResponse.price,
        change: diaResponse.change,
        changePercent: diaResponse.changePercent
      },
      {
        name: 'Russell 2000',
        price: iwmResponse.price,
        change: iwmResponse.change,
        changePercent: iwmResponse.changePercent
      }
    ];
  } catch (error) {
    console.error('Error fetching market indices:', error);
    // Return mock data as fallback
    return [
      { name: "S&P 500", price: 4982.73, change: 38.41, changePercent: 0.78 },
      { name: "Nasdaq", price: 15628.95, change: 164.90, changePercent: 1.07 },
      { name: "Dow Jones", price: 36879.00, change: -134.15, changePercent: -0.36 },
      { name: "Russell 2000", price: 2014.38, change: 7.34, changePercent: 0.37 }
    ];
  }
};

// News API
export const fetchStockNews = async (symbol?: string): Promise<NewsItem[]> => {
  try {
    // Alpha Vantage only provides news for specific tickers
    // We'll use a real API call when a symbol is provided, otherwise use mock data
    if (symbol) {
      const response = await fetch(`${BASE_URL}?function=NEWS_SENTIMENT&tickers=${symbol}&apikey=${API_KEY}`);
      const data = await response.json();
      
      if (data['Error Message']) {
        throw new Error(data['Error Message']);
      }
      
      if (!data.feed || !Array.isArray(data.feed) || data.feed.length === 0) {
        throw new Error('No news data available');
      }
      
      return data.feed.slice(0, 6).map((item: any) => ({
        title: item.title,
        url: item.url,
        source: item.source,
        summary: item.summary,
        banner_image: item.banner_image,
        time_published: new Date(item.time_published).toLocaleString(),
        topics: item.topics?.map((t: any) => t.topic),
        sentiment: getSentiment(item.overall_sentiment_score)
      }));
    } else {
      throw new Error('Symbol required for news');
    }
  } catch (error) {
    console.error('Error fetching news:', error);
    // Return mock data as fallback
    return generateMockNews(symbol);
  }
};

// General financial news without specific symbol requirement
export const fetchFinancialNews = async (): Promise<NewsItem[]> => {
  try {
    const response = await fetch(`${BASE_URL}?function=NEWS_SENTIMENT&apikey=${API_KEY}`);
    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }
    
    if (!data.feed || !Array.isArray(data.feed) || data.feed.length === 0) {
      throw new Error('No news data available');
    }
    
    return data.feed.slice(0, 12).map((item: any) => ({
      title: item.title,
      url: item.url,
      source: item.source,
      summary: item.summary,
      time_published: new Date(item.time_published).toLocaleString(),
      topics: item.topics?.map((t: any) => t.topic) || ['markets'],
      sentiment: getSentiment(item.overall_sentiment_score)
    }));
  } catch (error) {
    console.error('Error fetching financial news:', error);
    // Return mock data as fallback
    return generateMockFinancialNews();
  }
};

// Helper to generate mock news
const generateMockNews = (symbol?: string): NewsItem[] => {
  const headlines = [
    { title: "Market Rally Extends As This Dow Giant Breaks Out", source: "Investor's Daily" },
    { title: "Tech Stocks Surge On AI Optimism", source: "Wall Street Journal" },
    { title: "Fed Signals Rate Cut Later This Year", source: "CNBC" },
    { title: "Inflation Data Shows Cooling Trend", source: "Bloomberg" },
    { title: "Earnings Beat Expectations Across Sectors", source: "Financial Times" },
    { title: "Market Volatility Rises Amid Global Tensions", source: "Reuters" }
  ];
  
  if (symbol) {
    // Add company-specific headlines
    headlines.unshift(
      { title: `${symbol} Announces Quarterly Earnings Beat`, source: "MarketWatch" },
      { title: `${symbol} Launches New Product Line`, source: "Business Insider" }
    );
  }
  
  return headlines.slice(0, 6).map((item, index) => ({
    title: item.title,
    source: item.source,
    url: "#",
    summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    time_published: new Date(Date.now() - (index * 3600000)).toLocaleString(),
    sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)] as 'positive' | 'negative' | 'neutral',
    banner_image: `https://source.unsplash.com/random/800x400?business,${index}`
  }));
};

// Helper to generate mock financial news
const generateMockFinancialNews = (): NewsItem[] => {
  const categories = ['markets', 'stocks', 'economy', 'business', 'technology', 'crypto'];
  const sentiments = ['positive', 'neutral', 'negative'];
  
  return Array(12).fill(0).map((_, i) => ({
    title: `Financial news headline ${i + 1}`,
    url: "#",
    source: ["Bloomberg", "CNBC", "The Wall Street Journal", "Financial Times", "Reuters"][i % 5],
    summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    time_published: new Date(Date.now() - i * 3600000).toLocaleString(),
    topics: [categories[i % categories.length]],
    sentiment: sentiments[i % sentiments.length] as 'positive' | 'negative' | 'neutral'
  }));
};

// Portfolio API (mock implementation with localStorage persistence)
export const fetchPortfolioData = async (): Promise<PortfolioData> => {
  try {
    // In a real app, this would fetch from a backend API
    // For demo, we'll load from localStorage or use mock data
    const savedPortfolio = localStorage.getItem('portfolio');
    let portfolio: PortfolioPosition[] = [];
    
    if (savedPortfolio) {
      portfolio = JSON.parse(savedPortfolio);
    } else {
      // Default portfolio
      portfolio = [
        { symbol: 'AAPL', name: 'Apple Inc.', shares: 10, avgPrice: 150.00, currentPrice: 0, value: 0, change: 0, changePercent: 0 },
        { symbol: 'MSFT', name: 'Microsoft Corp.', shares: 5, avgPrice: 300.00, currentPrice: 0, value: 0, change: 0, changePercent: 0 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 3, avgPrice: 120.00, currentPrice: 0, value: 0, change: 0, changePercent: 0 },
        { symbol: 'AMZN', name: 'Amazon.com', shares: 2, avgPrice: 160.00, currentPrice: 0, value: 0, change: 0, changePercent: 0 },
      ];
    }
    
    // Fetch current prices and calculate values
    const updatedPortfolio = await Promise.all(
      portfolio.map(async (position) => {
        try {
          const quote = await fetchStockQuote(position.symbol);
          const currentPrice = quote.price;
          const value = position.shares * currentPrice;
          const change = currentPrice - position.avgPrice;
          const changePercent = (change / position.avgPrice) * 100;
          
          return {
            ...position,
            currentPrice,
            value,
            change,
            changePercent
          };
        } catch (error) {
          console.error(`Error updating position for ${position.symbol}:`, error);
          return position;
        }
      })
    );
    
    // Calculate totals
    const totalValue = updatedPortfolio.reduce((sum, position) => sum + position.value, 0);
    const investedValue = updatedPortfolio.reduce((sum, position) => sum + (position.shares * position.avgPrice), 0);
    const totalGain = totalValue - investedValue;
    const totalGainPercent = (totalGain / investedValue) * 100;
    
    // Mock day change (would be calculated from previous day's close in a real app)
    const dayChange = totalValue * (Math.random() * 0.03 - 0.01);
    const dayChangePercent = (dayChange / totalValue) * 100;
    
    // Calculate sector allocation (mock sectors)
    const sectorMap: Record<string, number> = {
      'Technology': 0,
      'Consumer': 0,
      'Healthcare': 0,
      'Finance': 0,
      'Other': 0
    };
    
    // Map stocks to sectors (in a real app, this would come from a proper data source)
    updatedPortfolio.forEach(position => {
      if (['AAPL', 'MSFT', 'GOOGL'].includes(position.symbol)) {
        sectorMap['Technology'] += position.value;
      } else if (['AMZN', 'SBUX', 'NKE'].includes(position.symbol)) {
        sectorMap['Consumer'] += position.value;
      } else if (['JNJ', 'PFE', 'UNH'].includes(position.symbol)) {
        sectorMap['Healthcare'] += position.value;
      } else if (['JPM', 'BAC', 'GS'].includes(position.symbol)) {
        sectorMap['Finance'] += position.value;
      } else {
        sectorMap['Other'] += position.value;
      }
    });
    
    const sectorAllocation = Object.entries(sectorMap)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value: Math.round((value / totalValue) * 100)
      }));
    
    // Save to localStorage
    localStorage.setItem('portfolio', JSON.stringify(updatedPortfolio));
    
    return {
      positions: updatedPortfolio,
      totalValue,
      dayChange,
      dayChangePercent,
      totalGain,
      totalGainPercent,
      sectorAllocation
    };
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    // Return mock data as fallback
    return generateMockPortfolio();
  }
};

// Add new function to update the portfolio directly
export const updatePortfolio = async (portfolioData: any): Promise<boolean> => {
  try {
    if (!portfolioData || !portfolioData.positions) {
      throw new Error('Invalid portfolio data');
    }
    
    // Update current prices and values
    const updatedPositions = await Promise.all(
      portfolioData.positions.map(async (position: any) => {
        try {
          const quote = await fetchStockQuote(position.symbol);
          const currentPrice = quote.price;
          const value = position.shares * currentPrice;
          const change = currentPrice - position.avgPrice;
          const changePercent = (change / position.avgPrice) * 100;
          
          return {
            ...position,
            currentPrice,
            value,
            change,
            changePercent
          };
        } catch (error) {
          console.error(`Error updating position for ${position.symbol}:`, error);
          return position;
        }
      })
    );
    
    // Calculate aggregated values
    const totalValue = updatedPositions.reduce((sum, position) => sum + position.value, 0);
    const investedValue = updatedPositions.reduce((sum, position) => sum + (position.shares * position.avgPrice), 0);
    const totalGain = totalValue - investedValue;
    const totalGainPercent = investedValue > 0 ? (totalGain / investedValue) * 100 : 0;
    
    // Mock day change (would be calculated from previous day's close in a real app)
    const dayChange = totalValue * (Math.random() * 0.03 - 0.01);
    const dayChangePercent = (dayChange / totalValue) * 100;
    
    // Update sector allocation
    const sectorMap: Record<string, number> = {
      'Technology': 0,
      'Consumer': 0,
      'Healthcare': 0,
      'Finance': 0,
      'Other': 0
    };
    
    // Map stocks to sectors (in a real app, this would come from a proper data source)
    updatedPositions.forEach(position => {
      if (['AAPL', 'MSFT', 'GOOGL'].includes(position.symbol)) {
        sectorMap['Technology'] += position.value;
      } else if (['AMZN', 'SBUX', 'NKE'].includes(position.symbol)) {
        sectorMap['Consumer'] += position.value;
      } else if (['JNJ', 'PFE', 'UNH'].includes(position.symbol)) {
        sectorMap['Healthcare'] += position.value;
      } else if (['JPM', 'BAC', 'GS'].includes(position.symbol)) {
        sectorMap['Finance'] += position.value;
      } else {
        sectorMap['Other'] += position.value;
      }
    });
    
    const sectorAllocation = Object.entries(sectorMap)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value
      }));
    
    // Create complete portfolio data object
    const updatedPortfolio: PortfolioData = {
      positions: updatedPositions,
      totalValue,
      dayChange,
      dayChangePercent,
      totalGain,
      totalGainPercent,
      sectorAllocation
    };
    
    // Save to localStorage
    localStorage.setItem('portfolio', JSON.stringify(updatedPositions));
    return true;
  } catch (error) {
    console.error('Error updating portfolio:', error);
    return false;
  }
};

export const addToPortfolio = async (
  symbol: string,
  shares: number,
  purchasePrice: number
): Promise<boolean> => {
  try {
    const quote = await fetchStockQuote(symbol);
    const savedPortfolio = localStorage.getItem('portfolio');
    let portfolio: PortfolioPosition[] = savedPortfolio ? JSON.parse(savedPortfolio) : [];
    
    // Check if position already exists
    const existingIndex = portfolio.findIndex(pos => pos.symbol === symbol);
    
    if (existingIndex >= 0) {
      // Update existing position with weighted average price
      const existing = portfolio[existingIndex];
      const totalShares = existing.shares + shares;
      const totalCost = (existing.shares * existing.avgPrice) + (shares * purchasePrice);
      const newAvgPrice = totalCost / totalShares;
      
      portfolio[existingIndex] = {
        ...existing,
        shares: totalShares,
        avgPrice: newAvgPrice,
        currentPrice: quote.price,
        value: totalShares * quote.price,
        change: quote.price - newAvgPrice,
        changePercent: ((quote.price - newAvgPrice) / newAvgPrice) * 100
      };
    } else {
      // Add new position
      portfolio.push({
        symbol,
        name: quote.name || symbol,
        shares,
        avgPrice: purchasePrice,
        currentPrice: quote.price,
        value: shares * quote.price,
        change: quote.price - purchasePrice,
        changePercent: ((quote.price - purchasePrice) / purchasePrice) * 100
      });
    }
    
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
    return true;
  } catch (error) {
    console.error('Error adding to portfolio:', error);
    return false;
  }
};

export const removeFromPortfolio = async (symbol: string): Promise<boolean> => {
  try {
    const savedPortfolio = localStorage.getItem('portfolio');
    if (!savedPortfolio) return false;
    
    let portfolio: PortfolioPosition[] = JSON.parse(savedPortfolio);
    const updatedPortfolio = portfolio.filter(pos => pos.symbol !== symbol);
    
    localStorage.setItem('portfolio', JSON.stringify(updatedPortfolio));
    return true;
  } catch (error) {
    console.error('Error removing from portfolio:', error);
    return false;
  }
};

// AI Insights API (mock implementation)
export const fetchInsights = async (): Promise<InsightItem[]> => {
  // In a real app, this would connect to an AI-powered backend
  // For demo, we'll generate mock insights
  return generateMockInsights();
};

// Helper function to generate mock chart data (used as fallback)
const generateMockChartData = (timeRange: '1D' | '1W' | '1M' | '3M' | '1Y' | 'All'): StockChartData[] => {
  const dataPoints = 
    timeRange === '1D' ? 24 : 
    timeRange === '1W' ? 7 : 
    timeRange === '1M' ? 30 :
    timeRange === '3M' ? 90 : 
    timeRange === '1Y' ? 12 : 5;
  
  let baseValue = 150;
  const volatility = 
    timeRange === '1D' ? 1 : 
    timeRange === '1W' ? 3 : 
    timeRange === '1M' ? 8 :
    timeRange === '3M' ? 15 : 
    timeRange === '1Y' ? 30 : 50;
  
  const data = [];
  
  for (let i = 0; i < dataPoints; i++) {
    // Create realistic price movements with some trend
    const change = (Math.random() - 0.48) * volatility;
    baseValue = Math.max(10, baseValue + change);
    
    let label;
    if (timeRange === '1D') {
      label = `${(i % 12) + 1}${i < 12 ? 'AM' : 'PM'}`;
    } else if (timeRange === '1W') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      label = days[i % 7];
    } else if (timeRange === '1M' || timeRange === '3M') {
      label = `${(i % 30) + 1}/${Math.floor(i / 30) + 1}`;
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      label = months[i % 12];
    }
    
    data.push({
      date: label,
      price: parseFloat(baseValue.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000) + 500000
    });
  }
  
  return data;
}

// Helper to generate mock portfolio
const generateMockPortfolio = (): PortfolioData => {
  return {
    positions: [
      { symbol: 'AAPL', name: 'Apple Inc.', shares: 10, avgPrice: 150.00, currentPrice: 173.41, value: 1734.10, change: 23.41, changePercent: 15.61 },
      { symbol: 'MSFT', name: 'Microsoft Corp.', shares: 5, avgPrice: 300.00, currentPrice: 397.58, value: 1987.90, change: 97.58, changePercent: 32.53 },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 3, avgPrice: 120.00, currentPrice: 141.16, value: 423.48, change: 21.16, changePercent: 17.63 },
      { symbol: 'AMZN', name: 'Amazon.com', shares: 2, avgPrice: 160.00, currentPrice: 175.35, value: 350.70, change: 15.35, changePercent: 9.59 },
    ],
    totalValue: 4496.18,
    dayChange: 82.34,
    dayChangePercent: 1.87,
    totalGain: 496.18,
    totalGainPercent: 12.40,
    sectorAllocation: [
      { name: 'Technology', value: 92 },
      { name: 'Consumer', value: 8 }
    ]
  };
};

// Helper to generate mock insights
const generateMockInsights = (): InsightItem[] => {
  return [
    {
      symbol: 'AAPL',
      company: 'Apple Inc.',
      type: 'buy',
      summary: 'Strong iPhone sales and services growth potential make Apple an attractive buy at current levels. The company\'s ecosystem continues to expand with new product categories.',
      confidence: 85,
      priceTarget: 210.00,
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
      symbol: 'MSFT',
      company: 'Microsoft Corp.',
      type: 'hold',
      summary: 'Microsoft\'s cloud business is performing well, but current valuation suggests limited upside in the near term. Long-term prospects remain strong with AI integration across product lines.',
      confidence: 72,
      priceTarget: 410.00,
      timestamp: new Date(Date.now() - 5 * 3600000).toISOString()
    },
    {
      symbol: 'TSLA',
      company: 'Tesla Inc.',
      type: 'sell',
      summary: 'Increased competition in the EV market and production challenges suggest potential downside. The company faces margin pressure and slower growth than previously expected.',
      confidence: 68,
      priceTarget: 175.00,
      timestamp: new Date(Date.now() - 8 * 3600000).toISOString()
    },
    {
      symbol: 'AMD',
      company: 'Advanced Micro Devices',
      type: 'buy',
      summary: 'AMD continues to gain market share in high-performance computing and data center segments. The company is well-positioned to benefit from AI computing growth.',
      confidence: 78,
      priceTarget: 190.00,
      timestamp: new Date(Date.now() - 12 * 3600000).toISOString()
    },
    {
      symbol: 'AMZN',
      company: 'Amazon.com',
      type: 'watch',
      summary: 'AWS growth is stabilizing and retail margins are improving. Monitor upcoming earnings for confirmation of positive trends before adding to positions.',
      confidence: 65,
      timestamp: new Date(Date.now() - 18 * 3600000).toISOString()
    }
  ];
};

// Helper to determine sentiment from score
const getSentiment = (score: number): 'positive' | 'negative' | 'neutral' => {
  if (score > 0.25) return 'positive';
  if (score < -0.25) return 'negative';
  return 'neutral';
};

// Add a function to fetch stock analysis
export const fetchStockAnalysis = async (symbol: string): Promise<any> => {
  try {
    // In a real app, this would make an API call to get analysis data
    // Since we're mocking, we'll return realistic-looking data
    // Simulate API request delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create mock analysis data based on symbol
    return {
      technicalAnalysis: {
        recommendation: generateRecommendation(),
        signals: {
          macd: Math.random() > 0.5 ? 'bullish' : 'bearish',
          rsi: 30 + Math.random() * 40, // Between 30-70
          sma50: Math.random() > 0.6 ? 'above' : 'below',
          sma200: Math.random() > 0.5 ? 'above' : 'below',
          bollingerBands: ['lower', 'middle', 'upper'][Math.floor(Math.random() * 3)]
        },
        support: parseFloat((Math.random() * 0.9 * 100).toFixed(2)),
        resistance: parseFloat((Math.random() * 1.1 * 100 + 10).toFixed(2)),
      },
      fundamentalAnalysis: {
        pe: (10 + Math.random() * 30).toFixed(2),
        eps: (1 + Math.random() * 10).toFixed(2),
        dividendYield: (Math.random() * 5).toFixed(2) + '%',
        debtToEquity: (Math.random() * 2).toFixed(2),
        quickRatio: (Math.random() * 3).toFixed(2),
        roe: (Math.random() * 30).toFixed(2) + '%',
      },
      sentimentAnalysis: {
        overall: generateSentiment(),
        newsCount: Math.floor(Math.random() * 100),
        socialMentions: Math.floor(Math.random() * 1000),
        insiderTrading: Math.random() > 0.7 ? 'selling' : 'buying',
        shortInterest: (Math.random() * 20).toFixed(2) + '%',
      },
      aiPredictions: {
        priceTarget: {
          low: parseFloat((80 + Math.random() * 20).toFixed(2)),
          median: parseFloat((100 + Math.random() * 20).toFixed(2)),
          high: parseFloat((120 + Math.random() * 30).toFixed(2)),
        },
        shortTerm: generateRecommendation(),
        longTerm: generateRecommendation(),
        confidence: (50 + Math.random() * 50).toFixed(1) + '%',
      },
      riskAssessment: {
        volatility: (Math.random() * 50).toFixed(2),
        beta: (0.5 + Math.random() * 1.5).toFixed(2),
        sharpeRatio: (Math.random() * 3).toFixed(2),
        valueAtRisk: (Math.random() * 5).toFixed(2) + '%',
        riskScore: Math.floor(Math.random() * 100),
      }
    };
  } catch (error) {
    console.error(`Error fetching analysis for ${symbol}:`, error);
    throw error;
  }
};

// Helper functions for analysis data
function generateRecommendation() {
  const recommendations = ['strong buy', 'buy', 'hold', 'sell', 'strong sell'];
  const weights = [0.2, 0.3, 0.3, 0.15, 0.05]; // Weighted probabilities
  
  let random = Math.random();
  let cumulativeWeight = 0;
  
  for (let i = 0; i < recommendations.length; i++) {
    cumulativeWeight += weights[i];
    if (random <= cumulativeWeight) {
      return recommendations[i];
    }
  }
  
  return recommendations[0]; // Fallback
}

function generateSentiment() {
  const sentiments = ['very positive', 'positive', 'neutral', 'negative', 'very negative'];
  const weights = [0.15, 0.35, 0.3, 0.15, 0.05]; // Weighted probabilities
  
  let random = Math.random();
  let cumulativeWeight = 0;
  
  for (let i = 0; i < sentiments.length; i++) {
    cumulativeWeight += weights[i];
    if (random <= cumulativeWeight) {
      return sentiments[i];
    }
  }
  
  return sentiments[1]; // Fallback
}

// Search for stocks by keyword (symbol or name)
export const searchStocks = async (query: string): Promise<StockSearchResult[]> => {
  try {
    // Real implementation would call Alpha Vantage's SYMBOL_SEARCH endpoint
    const response = await fetch(`${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}&apikey=${API_KEY}`);
    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }
    
    if (!data.bestMatches || !Array.isArray(data.bestMatches)) {
      throw new Error('No results found');
    }
    
    return data.bestMatches.map((match: any) => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'],
      region: match['4. region'],
    }));
  } catch (error) {
    console.error(`Error searching stocks for '${query}':`, error);
    
    // Return mock data as fallback
    // Filter mock stocks that match the query
    return getMockSearchResults(query);
  }
};

// Helper function to generate mock search results
function getMockSearchResults(query: string): StockSearchResult[] {
  const mockStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Equity', region: 'United States' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'GOOG', name: 'Alphabet Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'META', name: 'Meta Platforms Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'TSLA', name: 'Tesla Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'Equity', region: 'United States' },
    { symbol: 'BRK.A', name: 'Berkshire Hathaway Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'Equity', region: 'United States' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'Equity', region: 'United States' },
    { symbol: 'UNH', name: 'UnitedHealth Group Incorporated', type: 'Equity', region: 'United States' },
    { symbol: 'V', name: 'Visa Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'PG', name: 'Procter & Gamble Company', type: 'Equity', region: 'United States' },
    { symbol: 'XOM', name: 'Exxon Mobil Corporation', type: 'Equity', region: 'United States' },
    { symbol: 'MA', name: 'Mastercard Incorporated', type: 'Equity', region: 'United States' },
    { symbol: 'HD', name: 'Home Depot Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'BAC', name: 'Bank of America Corporation', type: 'Equity', region: 'United States' },
    { symbol: 'ABBV', name: 'AbbVie Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'PFE', name: 'Pfizer Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'AVGO', name: 'Broadcom Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'COST', name: 'Costco Wholesale Corporation', type: 'Equity', region: 'United States' },
    { symbol: 'DIS', name: 'Walt Disney Company', type: 'Equity', region: 'United States' },
    { symbol: 'CSCO', name: 'Cisco Systems Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'VZ', name: 'Verizon Communications Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'ADBE', name: 'Adobe Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'NFLX', name: 'Netflix Inc.', type: 'Equity', region: 'United States' },
    { symbol: 'CMCSA', name: 'Comcast Corporation', type: 'Equity', region: 'United States' },
    { symbol: 'INTC', name: 'Intel Corporation', type: 'Equity', region: 'United States' }
  ];
  
  const lowerQuery = query.toLowerCase();
  return mockStocks.filter(stock => 
    stock.symbol.toLowerCase().includes(lowerQuery) || 
    stock.name.toLowerCase().includes(lowerQuery)
  ).slice(0, 8); // Return top 8 results
} 