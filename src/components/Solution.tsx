import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Activity, Shield, Circle, Info, ArrowRight } from "lucide-react";
import { AnimatedSection, AnimatedItem } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

const steps = [
  {
    step: 1,
    title: "Findability Assessment",
    icon: Search,
    price: "Free",
    priceSub: null,
    description:
      "A quick, free check to see how easily your loved ones could find important information if they needed it.",
    bullets: [
      "A short findability assessment",
      "A simple summary of strengths and gaps",
      "No account required",
      "No credit card",
    ],
    cta: "Start Free Findability Check",
    href: "/assessment",
    variant: "default" as const,
    emphasis: false,
    prerequisite: null,
  },
  {
    step: 2,
    title: "Life Readiness",
    icon: Activity,
    price: "$99",
    priceSub: "one-time",
    description:
      "A comprehensive assessment across key areas of life readiness, with a personalized analysis and report tailored to your situation.",
    bullets: [
      "Full Life Readiness Assessment",
      "Personalized scores and insights",
      "A clear, easy-to-read readiness report",
      "Guidance from Remy, your AI guide",
    ],
    cta: "Get My Life Readiness Report",
    href: "/readiness",
    variant: "default" as const,
    emphasis: false,
    prerequisite: null,
  },
  {
    step: 3,
    title: "Rest Easy Pro",
    icon: Shield,
    price: "$14.99",
    priceSub: "/ month",
    description:
      "Ongoing tools to help you make progress, stay organized, and keep everything up to date over time.",
    bullets: [
      "Actionable Roadmap inside the dashboard",
      "Progress tracking toward readiness goals",
      "EasyVault secure document storage",
      "Continued guidance from Remy",
      "Everything included in the previous steps",
    ],
    cta: "Upgrade to Pro",
    href: "/readiness",
    variant: "default" as const,
    emphasis: false,
    prerequisite: "Requires completion of the $99 Life Readiness Assessment",
  },
];

const Solution = () => {
  return (
    <section id="solution" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mb-6 text-balance">
            Choose how far you want to go
          </h2>
          <p className="font-body text-lg text-muted-foreground leading-relaxed">
            Start with a simple check, understand your full readiness, or unlock tools to take action and stay organized.
          </p>
        </AnimatedSection>

        {/* Steps – horizontal grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {steps.map((step, i) => (
            <AnimatedItem key={step.step} delay={i * 150} className="h-full">
              <Card
                className="h-full flex flex-col border-border/50 bg-background overflow-hidden transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 shadow-sm"
              >
                <CardContent className="p-8 flex flex-col h-full">
                  {/* Step badge */}
                  <Badge className="mb-5 self-start bg-primary/10 text-primary border-0 font-body text-xs">
                    Step {step.step}
                  </Badge>

                  {/* Title row with icon */}
                  <div className="flex items-center gap-3 mb-3">
                    <step.icon className="w-5 h-5 text-primary shrink-0" />
                    <h3 className="font-display text-xl sm:text-2xl font-semibold text-foreground">
                      {step.title}
                    </h3>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1.5 mb-4">
                    <span className={cn(
                      "font-display text-4xl font-bold",
                      step.price === "Free" ? "text-primary" : "text-foreground"
                    )}>
                      {step.price}
                    </span>
                    {step.priceSub && (
                      <span className="font-body text-sm text-muted-foreground">
                        {step.priceSub}
                      </span>
                    )}
                  </div>

                  {/* Prerequisite note */}
                  {step.prerequisite && (
                    <div className="flex items-start gap-2 mt-2 mb-4 p-3 rounded-lg bg-muted/50">
                      <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="font-body text-xs text-muted-foreground">
                        {step.prerequisite}
                      </p>
                    </div>
                  )}

                  {/* Description */}
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
                    {step.description}
                  </p>

                  {/* Bullet list */}
                  <ul className="space-y-2.5 mb-6">
                    {step.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2.5">
                        <Circle className="w-2 h-2 fill-primary/60 text-primary/60 shrink-0 mt-1.5" />
                        <span className="font-body text-sm text-foreground">
                          {bullet}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA – pushed to bottom */}
                  <div className="mt-auto pt-4">
                    <Button variant={step.variant} className="font-body w-full" asChild>
                      <a href={step.href}>
                        {step.cta}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </a>
                    </Button>
                  </div>
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
