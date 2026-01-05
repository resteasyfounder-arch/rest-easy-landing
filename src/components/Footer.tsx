import logo from "@/assets/rest-easy-logo.png";

const Footer = () => {
  return (
    <footer className="py-12 bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src={logo} 
              alt="Rest Easy" 
              className="h-12 w-auto brightness-0 invert opacity-90"
            />
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-6 justify-center">
            <a href="#" className="font-body text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="font-body text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#" className="font-body text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              Contact
            </a>
          </nav>

          {/* Copyright */}
          <p className="font-body text-sm text-primary-foreground/60">
            © 2025 Rest Easy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
