# Stock Whisper AI Hub

A modern stock market dashboard built with React, TypeScript, and Tailwind CSS.

## Features

- **Real-time Stock Data**: Fetches live stock quotes and chart data
- **Market Overview**: View key market indices and sentiment
- **Watchlist**: Track your favorite stocks
- **Interactive Charts**: Visualize stock price trends over different time periods
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 16+ (or Bun)
- An Alpha Vantage API key (for stock data)

### Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/stock-whisper-ai-hub.git
cd stock-whisper-ai-hub
```

2. Install dependencies
```bash
npm install
# or
bun install
```

3. Set up your API key
   - Get a free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key)
   - Copy the `.env.local.example` file to `.env.local`
   - Replace `your_alpha_vantage_api_key_here` with your actual API key

4. Start the development server
```bash
npm run dev
# or
bun dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Usage

- **Stock Chart**: Select different time ranges (1D, 1W, 1M, 3M, 1Y, All)
- **Watchlist**: 
  - Click the "+" button to add new stocks
  - Click the star icon to favorite stocks
  - Hover over a stock to see the remove button
- **Market Overview**: See the major indices' performance and overall market sentiment

## Limitations

- The Alpha Vantage free tier has rate limits (5 calls per minute, 500 per day)
- The portfolio section requires authentication (not implemented in this demo)

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui Components
- Recharts for data visualization

## Future Enhancements

- User authentication
- Portfolio tracking with real positions
- Stock news integration
- Stock screener
- Advanced technical indicators

## License

MIT
