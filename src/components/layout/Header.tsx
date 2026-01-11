import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Rocket, Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/assessment", label: "Career Assessment" },
    { path: "/dashboard", label: "Dashboard" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-card/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="gradient-primary p-2 rounded-lg shadow-md group-hover:shadow-glow transition-shadow duration-300">
            <Rocket className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Career<span className="gradient-text">Launch</span> AI
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path}>
              <Button
                variant={isActive(link.path) ? "secondary" : "ghost"}
                className={isActive(link.path) ? "font-semibold" : ""}
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost">Log in</Button>
          </Link>
          <Link to="/assessment">
            <Button variant="hero" size="default">
              Get Started
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden border-t border-border bg-card p-4 animate-slide-down">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant={isActive(link.path) ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  {link.label}
                </Button>
              </Link>
            ))}
            <div className="border-t border-border pt-3 mt-2 flex flex-col gap-2">
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full">Log in</Button>
              </Link>
              <Link to="/assessment" onClick={() => setIsMenuOpen(false)}>
                <Button variant="hero" className="w-full">Get Started</Button>
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
