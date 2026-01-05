import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import logo from "@/assets/rest-easy-logo.png";

const footerLinks = {
  product: [
    { label: "Features", href: "#solution" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Security", href: "#" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

const Footer = () => {
  return (
    <footer className="py-16 bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <img 
              src={logo} 
              alt="Rest Easy" 
              className="h-12 w-auto brightness-0 invert opacity-90 mb-6"
            />
            <p className="font-body text-primary-foreground/70 leading-relaxed max-w-sm mb-6">
              Life readiness for every family. Organize, protect, and share what matters most.
            </p>
            <Button variant="outline" className="font-body border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10">
              Get Started Free
            </Button>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-display font-semibold text-primary-foreground mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href + link.label}>
                  <a 
                    href={link.href}
                    className="font-body text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display font-semibold text-primary-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href + link.label}>
                  <a 
                    href={link.href}
                    className="font-body text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-display font-semibold text-primary-foreground mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href + link.label}>
                  <a 
                    href={link.href}
                    className="font-body text-primary-foreground/70 hover:text-primary-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="bg-primary-foreground/10 mb-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-body text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} Rest Easy. All rights reserved.
          </p>
          <p className="font-body text-sm text-primary-foreground/50">
            Made with care for families everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
