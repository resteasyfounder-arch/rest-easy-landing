import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import logo from "@/assets/rest-easy-logo.png";

const navLinks = [
  { href: "#problem", label: "The Problem" },
  { href: "#solution", label: "Our Solution" },
  { href: "#how-it-works", label: "How It Works" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img src={logo} alt="Rest Easy" className="h-12 lg:h-14 w-auto" />
          </a>

          {/* Desktop Navigation - hidden on mobile (uses bottom nav) */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="gap-1">
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.href}>
                  <NavigationMenuLink asChild>
                    <Button 
                      variant="ghost" 
                      asChild 
                      className="font-body text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    >
                      <a href={link.href}>{link.label}</a>
                    </Button>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Desktop CTA - hidden on mobile */}
          <div className="hidden md:block">
            <Button variant="default" size="lg" className="font-body press-effect">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu - Hidden since we use bottom nav */}
          <div className="md:hidden">
            {/* Spacer to maintain header balance */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
