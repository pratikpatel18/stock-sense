
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "./ModeToggle";
import { Search, Bell, User, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Would normally navigate to search results
      console.log("Searching for:", searchQuery);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and brand */}
          <div className="flex items-center gap-2">
            <div className="relative h-8 w-8 overflow-hidden rounded-full bg-primary">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">S</span>
              </div>
            </div>
            <span className="text-xl font-bold">StockWhisper</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="nav-link">Dashboard</Link>
            <Link to="/stocks" className="nav-link">Stocks</Link>
            <Link to="/insights" className="nav-link">Insights</Link>
            <Link to="/news" className="nav-link">News</Link>
            <Link to="/portfolio" className="nav-link">Portfolio</Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="search"
                placeholder="Search stocks..."
                className="w-64 pl-9 pr-4"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </form>
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <ModeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden gap-2">
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
          <form onSubmit={handleSearch} className="relative mb-4">
            <Input
              type="search"
              placeholder="Search stocks..."
              className="w-full pl-9 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          </form>
          <div className="flex flex-col space-y-2">
            <Link to="/" className="nav-link">Dashboard</Link>
            <Link to="/stocks" className="nav-link">Stocks</Link>
            <Link to="/insights" className="nav-link">Insights</Link>
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
  );
};

export default Navbar;
