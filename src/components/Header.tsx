import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useActiveSection } from "@/hooks/useActiveSection";
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

const sectionIds = navItems.map((item) => item.id);

const scrollToSection = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const Header = ({ isAuthenticated = false }: HeaderProps) => {
  const isMobile = useIsMobile();
  const { activeSection, setOverride } = useActiveSection(sectionIds);

  const handleNavClick = (id: string) => {
    setOverride(id);
    scrollToSection(id);
  };
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
          <div className="flex items-center justify-between h-14">
            <button onClick={scrollToTop} className="flex items-center shrink-0">
              <img src={logo} alt="Rest Easy" className="h-8 w-auto" />
            </button>
            <nav className="flex items-center gap-1 overflow-x-auto ml-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={cn(
                    "text-xs font-medium whitespace-nowrap py-1 px-2 transition-all duration-200 border-b-2",
                    activeSection === item.id
                      ? "text-foreground border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground"
                  )}
                >
                  {item.label}
                </button>
              ))}
            </nav>
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

          <nav className="flex items-center rounded-full bg-secondary/50 px-1.5 py-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "text-sm font-medium font-body rounded-full px-4 py-1.5 transition-all duration-200",
                  activeSection === item.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
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
              <Link to="/assessment">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
