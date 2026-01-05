import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import logo from "@/assets/rest-easy-logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img src={logo} alt="Rest Easy" className="h-12 lg:h-14 w-auto" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#problem" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              The Problem
            </a>
            <a href="#solution" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Our Solution
            </a>
            <a href="#how-it-works" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <Button variant="default" size="lg" className="font-body">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <nav className="flex flex-col gap-4">
              <a href="#problem" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                The Problem
              </a>
              <a href="#solution" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Our Solution
              </a>
              <a href="#how-it-works" className="font-body text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                How It Works
              </a>
              <Button variant="default" size="lg" className="font-body mt-2 w-full">
                Get Started
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
