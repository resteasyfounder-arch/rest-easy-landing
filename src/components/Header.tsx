import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import logo from "@/assets/rest-easy-logo.png";

interface HeaderProps {
  isAuthenticated?: boolean;
}

const navItems = [
  { label: "The Problem", id: "problem" },
  { label: "Your Journey", id: "journey" },
  { label: "Meet Remy", id: "remy" },
  { label: "Our Solution", id: "solution" },
];

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const Header = ({ isAuthenticated = false }: HeaderProps) => {
  const isMobile = useIsMobile();

  if (isAuthenticated) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isMobile) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-14">
            <button onClick={scrollToTop} className="flex items-center">
              <img src={logo} alt="Rest Easy" className="h-10 w-auto" />
            </button>
          </div>
          <div className="flex items-center justify-center gap-4 pb-2 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button onClick={scrollToTop} className="flex items-center">
            <img src={logo} alt="Rest Easy" className="h-10 w-auto" />
          </button>

          <nav className="flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link to="/login">Log In</Link>
            </Button>
            <Button asChild>
              <Link to="/assessment">Get Your Findability Score</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
