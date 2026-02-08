import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import logo from "@/assets/rest-easy-logo.png";

const productLinks = [
  { label: "The Problem", href: "/#problem" },
  { label: "Our Solution", href: "/#solution" },
  { label: "Your Journey", href: "/#journey" },
  { label: "Meet Remy", href: "/#remy" },
];

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

const AnchorLinkList = ({ title, links }: { title: string; links: { label: string; href: string }[] }) => (
  <div>
    <h4 className="font-display font-semibold text-primary-foreground mb-4">{title}</h4>
    <ul className="space-y-3">
      {links.map((link) => (
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
);

const RouterLinkList = ({ title, links }: { title: string; links: { label: string; href: string }[] }) => (
  <div>
    <h4 className="font-display font-semibold text-primary-foreground mb-4">{title}</h4>
    <ul className="space-y-3">
      {links.map((link) => (
        <li key={link.href + link.label}>
          <Link
            to={link.href}
            className="font-body text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  return (
    <footer className="py-16 bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <img src={logo} alt="Rest Easy" className="h-12 w-auto brightness-0 invert opacity-90 mb-6" />
            <p className="font-body text-primary-foreground/70 leading-relaxed max-w-sm mb-6">
              Life readiness for every family. Organize, protect, and share what matters most.
            </p>
          </div>

          <AnchorLinkList title="Product" links={productLinks} />
          <RouterLinkList title="Company" links={companyLinks} />
          <RouterLinkList title="Legal" links={legalLinks} />
        </div>

        <Separator className="bg-primary-foreground/10 mb-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="font-body text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} Rest Easy. All rights reserved.
          </p>
          <p className="font-body text-sm text-primary-foreground/50">Made with care for families everywhere.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
