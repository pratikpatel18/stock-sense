import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import InsightsPage from "./pages/Insights";
import StockDetails from "./pages/StockDetails";
import StocksPage from "./pages/Stocks";
import NewsPage from "./pages/News";
import PortfolioPage from "./pages/Portfolio";
import SmartPlan from "./pages/SmartPlan";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/stocks" element={<StocksPage />} />
          <Route path="/stocks/:symbol" element={<StockDetails />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/smartplan" element={<SmartPlan />} />
          {/* Other routes would be added here for portfolio */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
