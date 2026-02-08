import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Search, Activity, Shield, Check, Minus, Sparkles, ArrowRight } from "lucide-react";
import { AnimatedSection, AnimatedItem } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

const features = [
  {
    name: "Findability Assessment",
    description: "Quick check to see how easily your loved ones could locate your important information",
  },
  {
    name: "Life Readiness Assessment",
    description: "Comprehensive evaluation across 6 life areas to understand your full preparedness picture",
  },
  {
    name: "Personalized Report",
    description: "Detailed analysis with scores, strengths, and areas needing attention tailored to your situation",
  },
  {
    name: "Remy AI Guide",
    description: "Your personal AI companion that explains results, answers questions, and guides your next steps",
  },
  {
    name: "Actionable Roadmap",
    description: "Step-by-step plan with prioritized tasks and progress tracking to improve your readiness score",
  },
  {
    name: "EasyVault Document Storage",
    description: "Secure, organized storage for essential documents across 6 categories with progress tracking",
  },
];

const tiers = [
  {
    name: "Discover",
    tagline: "See where you stand today",
    price: "Free",
    priceSub: "No credit card needed",
    icon: Search,
    included: [true, false, false, false, false, false],
    cta: "Take Quick Check",
    href: "/assessment",
    variant: "outline" as const,
    highlighted: false,
    premium: false,
  },
  {
    name: "Readiness",
    tagline: "Understand your full picture",
    price: "$99",
    priceSub: "One-time payment",
    icon: Activity,
    included: [true, true, true, true, false, false],
    cta: "Get Your Report",
    href: "/readiness",
    variant: "default" as const,
    highlighted: true,
    premium: false,
  },
  {
    name: "Rest Easy Pro",
    tagline: "Take action & stay organized",
    price: "$14.99",
    priceSub: "/month",
    priceNote: "Cancel anytime",
    icon: Shield,
    included: [true, true, true, true, true, true],
    cta: "Go Pro",
    href: "/readiness",
    variant: "default" as const,
    highlighted: false,
    premium: true,
  },
];

const Solution = () => {
  return (
    <section id="solution" className="py-20 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-14">
          <Badge className="mb-4 bg-primary/10 text-primary border-0 font-body">
            <Sparkles className="w-3 h-3 mr-1" />
            Choose Your Path
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mt-4 mb-6 text-balance">
            Find your level of readiness
          </h2>
          <p className="font-body text-lg text-muted-foreground leading-relaxed">
            Start free, or unlock the full experience with a personalized report and actionable tools.
          </p>
        </AnimatedSection>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {tiers.map((tier, i) => (
            <AnimatedItem key={tier.name} delay={i * 120}>
              <Card
                className={cn(
                  "relative border-border/50 shadow-card bg-background flex flex-col overflow-hidden",
                  tier.highlighted && "border-primary border-2 shadow-lg",
                  tier.premium && "bg-primary/5"
                )}
              >
                {tier.highlighted && (
                  <div className="bg-primary text-primary-foreground text-xs font-body font-semibold text-center py-1.5">
                    Most Popular
                  </div>
                )}

                <CardContent className={cn("flex flex-col items-center text-center p-8", !tier.highlighted && "pt-10")}>
                  <div className="w-14 h-14 rounded-2xl bg-gradient-sage flex items-center justify-center mb-5">
                    <tier.icon className="w-7 h-7 text-primary-foreground" />
                  </div>

                  <h3 className="font-display text-2xl font-semibold text-foreground">{tier.name}</h3>
                  <p className="font-body text-sm text-muted-foreground mt-1 mb-6">{tier.tagline}</p>

                  <div className="mb-1 flex items-baseline gap-0.5">
                    <span className="font-display text-4xl font-bold text-foreground">{tier.price}</span>
                    {tier.priceSub === "/month" && (
                      <span className="font-body text-base text-muted-foreground">/month</span>
                    )}
                  </div>
                  {tier.priceSub !== "/month" && (
                    <p className="font-body text-xs text-muted-foreground mb-2">{tier.priceSub}</p>
                  )}
                  {"priceNote" in tier && tier.priceNote && (
                    <p className="font-body text-xs text-muted-foreground mb-2">{tier.priceNote}</p>
                  )}
                  <div className="mb-6" />

                  <Button variant={tier.variant} className="font-body w-full" asChild>
                    <a href={tier.href}>
                      {tier.cta}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </a>
                  </Button>

                  <Separator className="my-6" />

                  <ul className="w-full space-y-4 text-left">
                    {features.map((feature, fi) => (
                      <li key={feature.name} className="flex gap-3">
                        {tier.included[fi] ? (
                          <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        ) : (
                          <Minus className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                        )}
                        <div className="flex flex-col">
                          <span className={cn("font-body text-sm font-medium", tier.included[fi] ? "text-foreground" : "text-muted-foreground/50")}>
                            {feature.name}
                          </span>
                          <span className={cn("font-body text-xs leading-snug mt-0.5", tier.included[fi] ? "text-muted-foreground" : "text-muted-foreground/30")}>
                            {feature.description}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </AnimatedItem>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solution;
