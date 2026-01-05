import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import logo from "@/assets/rest-easy-logo.png";

const navLinks = [
  { href: "#problem", label: "The Problem" },
  { href: "#solution", label: "Our Solution" },
  { href: "#how-it-works", label: "How It Works" },
];

const Header = () => {
  const isMobile = useIsMobile();

  // Hide header on desktop (sidebar handles nav) and mobile (bottom nav handles it)
  if (!isMobile) {
    return null;
  }

  // Mobile: Show minimal header with logo only (bottom nav handles navigation)
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center h-14">
          <a href="/" className="flex items-center">
            <img src={logo} alt="Rest Easy" className="h-10 w-auto" />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
