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
    // First, try to get the quote data
    const quoteResponse = await fetch(`${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`);
    
    if (!quoteResponse.ok) {
      throw new Error(`API error: ${quoteResponse.status}`);
    }
    
    const quoteData = await quoteResponse.json();
    
    if (quoteData['Error Message'] || quoteData['Information']) {
      throw new Error(quoteData['Error Message'] || quoteData['Information']);
    }
    
    const quote = quoteData['Global Quote'];
    if (!quote || Object.keys(quote).length === 0) {
      throw new Error('Invalid response from API');
    }
    
    let companyName = symbol;
    
    // Try to get company info to get the name
    try {
      const overviewResponse = await fetch(`${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`);
      
      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json();
        
        if (overviewData && overviewData.Name && !overviewData['Error Message']) {
          companyName = overviewData.Name;
        }
      }
    } catch (error) {
      console.error(`Error fetching company info for ${symbol}:`, error);
      // If we can't get the company name, just continue with the symbol
    }
    
    // Safely parse numerical values with fallbacks
    const priceStr = quote['05. price'] || '0';
    const changeStr = quote['09. change'] || '0';
    const changePercentStr = quote['10. change percent'] || '0%';
    
    // Remove any '%' character and convert to number
    const price = parseFloat(priceStr) || 0;
    const change = parseFloat(changeStr) || 0;
    const changePercent = parseFloat(changePercentStr.replace('%', '')) || 0;
    
    return {
      symbol,
      name: companyName,
      price,
      change,
      changePercent,
    };
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error);
    // Return mock data as fallback
    return getMockStockQuote(symbol);
  }
};

// Helper functions for mock data generation
const sumCharCodes = (str: string): number => {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i);
  }
  return sum;
};

const getCompanyName = (symbol: string): string => {
  const companyNames: Record<string, string> = {
    'RELIANCE': 'Reliance Industries Ltd.',
    'TCS': 'Tata Consultancy Services Ltd.',
    'HDFCBANK': 'HDFC Bank Ltd.',
    'INFY': 'Infosys Ltd.',
    'HINDUNILVR': 'Hindustan Unilever Ltd.',
    'ICICIBANK': 'ICICI Bank Ltd.',
    'BHARTIARTL': 'Bharti Airtel Ltd.',
    'ITC': 'ITC Ltd.',
    'SBIN': 'State Bank of India',
    'BAJFINANCE': 'Bajaj Finance Ltd.',
    'ASIANPAINT': 'Asian Paints Ltd.',
    'MARUTI': 'Maruti Suzuki India Ltd.',
    'SUNPHARMA': 'Sun Pharmaceutical Industries Ltd.',
    'TATAMOTORS': 'Tata Motors Ltd.',
    'WIPRO': 'Wipro Ltd.',
    'KOTAKBANK': 'Kotak Mahindra Bank Ltd.',
    'AXISBANK': 'Axis Bank Ltd.',
    'LT': 'Larsen & Toubro Ltd.',
    'ONGC': 'Oil and Natural Gas Corporation Ltd.',
    'NTPC': 'NTPC Ltd.',
    'ADANIPORTS': 'Adani Ports and Special Economic Zone Ltd.',
    'ULTRACEMCO': 'UltraTech Cement Ltd.',
    'HCLTECH': 'HCL Technologies Ltd.',
    'TITAN': 'Titan Company Ltd.',
    'JSWSTEEL': 'JSW Steel Ltd.'
  };
  
  return companyNames[symbol] || `${symbol} Stock`;
};

// Helper function to generate mock stock quote data
const getMockStockQuote = (symbol: string): StockQuote => {
  // Generate a realistic price based on the symbol's character codes
  const basePrice = sumCharCodes(symbol) % 1000 + 50;
  const price = basePrice + Math.random() * 50;
  
  // Generate a change that's typically within 5% of the price
  const changePercent = (Math.random() * 10 - 5); // -5% to +5%
  const change = price * (changePercent / 100);
  
  return {
    symbol,
    name: getCompanyName(symbol),
    price: price, // Keep base price in USD for calculations
    change: change,
    changePercent: changePercent,
  };
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

export const fetchMarketIndices = async () => {
  try {
    // In a real app, we would fetch from an actual API
    // For now, we're using mock data for Indian market indices
    
    // Simulate a network request
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Return mock data for Indian market indices
    return [
      { name: 'NIFTY 50', symbol: 'NIFTY', price: 22460.35, change: 78.25, changePercent: 0.35 },
      { name: 'BSE SENSEX', symbol: 'SENSEX', price: 73852.20, change: 242.60, changePercent: 0.33 },
      { name: 'NIFTY Bank', symbol: 'BANKNIFTY', price: 48275.15, change: -185.35, changePercent: -0.38 },
    ];
  } catch (error) {
    console.error('Error fetching market indices:', error);
    throw error;
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
    { title: "Nifty, Sensex Climb to Fresh Record Highs", source: "Economic Times" },
    { title: "RBI Keeps Interest Rates Unchanged, Maintains Growth Forecast", source: "Business Standard" },
    { title: "IT Stocks Rally on Strong Quarterly Results", source: "Mint" },
    { title: "Indian GDP Growth Exceeds Expectations", source: "Financial Express" },
    { title: "FIIs Increase Stake in Indian Equities", source: "Business Line" },
    { title: "Auto Sector Shows Strong Recovery in Monthly Sales", source: "Moneycontrol" }
  ];
  
  if (symbol) {
    // Add company-specific headlines for Indian companies
    if (symbol === 'RELIANCE') {
      headlines.unshift(
        { title: "Reliance Retail Expands with New Store Format", source: "Economic Times" },
        { title: "Reliance Jio Introduces New 5G Plans", source: "Business Standard" }
      );
    } else if (symbol === 'TCS') {
      headlines.unshift(
        { title: "TCS Wins Major Digital Transformation Deal", source: "Mint" },
        { title: "TCS Announces Robust Quarterly Results", source: "Financial Express" }
      );
    } else if (symbol === 'HDFCBANK') {
      headlines.unshift(
        { title: "HDFC Bank Completes Merger Integration", source: "Business Line" },
        { title: "HDFC Bank Expands Rural Banking Initiative", source: "Moneycontrol" }
      );
    } else if (symbol === 'INFY') {
      headlines.unshift(
        { title: "Infosys Launches New AI Platform", source: "Economic Times" },
        { title: "Infosys Signs Strategic Partnership with Global Client", source: "Business Standard" }
      );
    } else {
      headlines.unshift(
        { title: `${symbol} Announces Quarterly Results`, source: "Financial Express" },
        { title: `${symbol} Unveils Strategic Growth Plans`, source: "Business Line" }
      );
    }
  }
  
  return headlines.slice(0, 6).map((item, index) => ({
    title: item.title,
    source: item.source,
    url: "#",
    summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    time_published: new Date(Date.now() - (index * 3600000)).toLocaleString(),
    sentiment: ['positive', 'neutral', 'negative'][Math.floor(Math.random() * 3)] as 'positive' | 'negative' | 'neutral',
    banner_image: `https://source.unsplash.com/random/800x400?business,india,${index}`
  }));
};

// Helper to generate mock financial news
const generateMockFinancialNews = (): NewsItem[] => {
  const headlines = [
    { title: "Nifty and Sensex Close at Record Highs", source: "Economic Times", topic: "markets" },
    { title: "RBI Policy Review: Key Takeaways", source: "Business Standard", topic: "economy" },
    { title: "IT Sector Q1 Performance Analysis", source: "Mint", topic: "technology" },
    { title: "Auto Sales Data Shows Growth Momentum", source: "Financial Express", topic: "business" },
    { title: "Banking Sector NPAs Continue to Improve", source: "Business Line", topic: "finance" },
    { title: "Crude Oil Price Impact on Indian Economy", source: "Moneycontrol", topic: "economy" },
    { title: "FII Investment Trends in Indian Markets", source: "CNBC-TV18", topic: "markets" },
    { title: "Rupee Strengthens Against US Dollar", source: "Reuters", topic: "forex" },
    { title: "Indian Pharma Companies See Export Growth", source: "Mint", topic: "healthcare" },
    { title: "Telecom Sector Revenue Growth Analysis", source: "Economic Times", topic: "technology" },
    { title: "Real Estate Market Revival in Major Cities", source: "Financial Express", topic: "realestate" },
    { title: "Government Announces New Economic Measures", source: "Business Standard", topic: "policy" }
  ];
  
  const sentiments = ['positive', 'neutral', 'negative'];
  
  return headlines.map((item, i) => ({
    title: item.title,
    url: "#",
    source: item.source,
    summary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    time_published: new Date(Date.now() - i * 3600000).toLocaleString(),
    topics: [item.topic],
    sentiment: sentiments[i % sentiments.length] as 'positive' | 'negative' | 'neutral'
  }));
};

// Portfolio API (mock implementation with localStorage persistence)
export const fetchPortfolioData = async (): Promise<PortfolioData> => {
  try {
    // In a real app, this would be an API call to get the user's portfolio
    // For the demo, we'll use localStorage to persist mock data
    
    // Check if we have stored portfolio data
    const savedPositions = localStorage.getItem('portfolio');
    let positions: PortfolioPosition[] = [];
    
    if (savedPositions) {
      positions = JSON.parse(savedPositions);
    } else {
      // Use Indian stocks for the mock portfolio data
      positions = [
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
        }
      ];
      localStorage.setItem('portfolio', JSON.stringify(positions));
    }
    
    // Calculate total value and gain/loss
    let totalValue = 0;
    let totalCost = 0;
    let dayChange = 0;
    
    for (const position of positions) {
      // Values are already in INR, no need to convert
      position.value = position.shares * position.currentPrice;
      position.change = position.currentPrice - position.avgPrice;
      position.changePercent = (position.change / position.avgPrice) * 100;
      
      totalValue += position.value;
      totalCost += position.shares * position.avgPrice;
      
      // Simulate a daily change value (random but consistent)
      const randomChangePct = -0.67; // Negative daily change for demonstration
      const positionDayChange = position.value * (randomChangePct / 100);
      dayChange += positionDayChange;
    }
    
    const totalGain = totalValue - totalCost;
    const totalGainPercent = (totalGain / totalCost) * 100;
    const dayChangePercent = (dayChange / totalValue) * 100;
    
    // Generate sector allocation for Indian market
    const sectors = [
      { name: 'Technology', value: 48 },
      { name: 'Energy', value: 28 },
      { name: 'Financial', value: 24 }
    ];
    
    return {
      positions,
      totalValue,
      dayChange,
      dayChangePercent,
      totalGain,
      totalGainPercent,
      sectorAllocation: sectors
    };
  } catch (error) {
    console.error('Error fetching portfolio data:', error);
    throw error;
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
      { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', shares: 10, avgPrice: 2800.50, currentPrice: 2874.25, value: 28742.50, change: 73.75, changePercent: 2.63 },
      { symbol: 'TCS', name: 'Tata Consultancy Services Ltd.', shares: 5, avgPrice: 3500.75, currentPrice: 3671.80, value: 18359.00, change: 171.05, changePercent: 4.89 },
      { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', shares: 15, avgPrice: 1650.25, currentPrice: 1689.35, value: 25340.25, change: 39.10, changePercent: 2.37 },
      { symbol: 'INFY', name: 'Infosys Ltd.', shares: 20, avgPrice: 1490.80, currentPrice: 1522.75, value: 30455.00, change: 31.95, changePercent: 2.14 },
    ],
    totalValue: 102896.75,
    dayChange: -688.45,
    dayChangePercent: -0.67,
    totalGain: 5154.75,
    totalGainPercent: 5.28,
    sectorAllocation: [
      { name: 'Technology', value: 48 },
      { name: 'Energy', value: 28 },
      { name: 'Financial', value: 24 }
    ]
  };
};

// Helper to generate mock insights
const generateMockInsights = (): InsightItem[] => {
  return [
    {
      symbol: 'RELIANCE',
      company: 'Reliance Industries Ltd.',
      type: 'buy',
      summary: 'Strong retail and telecom growth potential make Reliance an attractive buy at current levels. The company\'s expansion into new-age sectors and green energy creates additional upside.',
      confidence: 85,
      priceTarget: 3200.00,
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString()
    },
    {
      symbol: 'TCS',
      company: 'Tata Consultancy Services Ltd.',
      type: 'hold',
      summary: 'TCS\'s digital services demand remains strong, but current valuation suggests limited upside in the near term. Long-term prospects remain positive with AI integration and expanding global footprint.',
      confidence: 72,
      priceTarget: 3900.00,
      timestamp: new Date(Date.now() - 5 * 3600000).toISOString()
    },
    {
      symbol: 'TATAMOTORS',
      company: 'Tata Motors Ltd.',
      type: 'sell',
      summary: 'Increased competition in the EV market and input cost pressures suggest potential downside. The company faces margin challenges in its domestic business despite JLR\'s strong performance.',
      confidence: 68,
      priceTarget: 825.00,
      timestamp: new Date(Date.now() - 8 * 3600000).toISOString()
    },
    {
      symbol: 'INFY',
      company: 'Infosys Ltd.',
      type: 'buy',
      summary: 'Infosys continues to gain market share in digital transformation and AI services. The company is well-positioned to benefit from global tech spending recovery.',
      confidence: 78,
      priceTarget: 1750.00,
      timestamp: new Date(Date.now() - 12 * 3600000).toISOString()
    },
    {
      symbol: 'HDFCBANK',
      company: 'HDFC Bank Ltd.',
      type: 'watch',
      summary: 'Loan growth is stabilizing and asset quality remains strong. Monitor upcoming quarterly results for confirmation of positive trends in the post-merger scenario before adding to positions.',
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

// Helper function to get stock search results
const getMockSearchResults = (query: string): StockSearchResult[] => {
  // Generate a set of fake results based on the query
  const results: StockSearchResult[] = [];
  
  // Add an exact match if the query looks like a stock symbol
  if (query.length <= 5 && query.toUpperCase() === query) {
    results.push({
      symbol: query.toUpperCase(),
      name: getCompanyName(query.toUpperCase()),
      type: 'Equity',
      region: 'United States',
    });
  }
  
  // Add some similar matches
  const variations = ['A', 'B', 'C', 'X', 'Y', 'Z'];
  for (let i = 0; i < 3; i++) {
    const randomSymbol = query.toUpperCase() + variations[i % variations.length];
    if (!results.find(r => r.symbol === randomSymbol)) {
      results.push({
        symbol: randomSymbol,
        name: getCompanyName(randomSymbol),
        type: 'Equity',
        region: 'United States',
      });
    }
  }
  
  // Add common large cap stocks as well
  const commonStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', region: 'United States', type: 'Equity' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', region: 'United States', type: 'Equity' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', region: 'United States', type: 'Equity' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', region: 'United States', type: 'Equity' },
    { symbol: 'TSLA', name: 'Tesla, Inc.', region: 'United States', type: 'Equity' },
    { symbol: 'META', name: 'Meta Platforms, Inc.', region: 'United States', type: 'Equity' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', region: 'United States', type: 'Equity' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', region: 'United States', type: 'Equity' },
  ];
  
  for (const stock of commonStocks) {
    if (
      (stock.symbol.includes(query.toUpperCase()) || 
       stock.name.toLowerCase().includes(query.toLowerCase())) &&
      !results.find(r => r.symbol === stock.symbol)
    ) {
      results.push(stock);
      if (results.length >= 10) break;
    }
  }
  
  return results.slice(0, 10); // Limit to 10 results
}; 