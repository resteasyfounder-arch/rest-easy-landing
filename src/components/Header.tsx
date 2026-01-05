import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import logo from "@/assets/rest-easy-logo.png";

interface HeaderProps {
  isAuthenticated?: boolean;
}

const Header = ({ isAuthenticated = false }: HeaderProps) => {
  const isMobile = useIsMobile();

  // Authenticated users don't need this header (sidebar handles nav)
  if (isAuthenticated) {
    return null;
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Mobile: Show minimal header with logo only (bottom nav handles navigation)
  if (isMobile) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-14">
            <button onClick={scrollToTop} className="flex items-center">
              <img src={logo} alt="Rest Easy" className="h-10 w-auto" />
            </button>
          </div>
        </div>
      </header>
    );
  }

  // Desktop: Full navbar with logo left, buttons right
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <button onClick={scrollToTop} className="flex items-center">
            <img src={logo} alt="Rest Easy" className="h-10 w-auto" />
          </button>
          
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
