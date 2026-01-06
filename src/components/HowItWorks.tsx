import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sparkles, Camera, CheckCircle2, ArrowRight, FolderLock } from "lucide-react";
import { AnimatedSection, AnimatedItem } from "@/hooks/useScrollAnimation";

const steps = [
  {
    number: "01",
    icon: Sparkles,
    title: "Capture without commitment",
    description:
      "Effortlessly gather essential information at your own pace. Our intuitive platform provides helpful prompts, ensuring a low-pressure start.",
  },
  {
    number: "02",
    icon: Camera,
    title: "Instant snapshot",
    description:
      "Receive an immediate, high-level overview of your information across key domains, offering quick insights into your current preparedness.",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Neutral reality check",
    description:
      "Gain an objective understanding of your readiness across legal, financial, and personal domains — presented as straightforward status.",
  },
  {
    number: "04",
    icon: ArrowRight,
    title: "One clear next step",
    description:
      "Identify the single most impactful action to take next. We cut through complexity, providing just one actionable step at a time.",
  },
  {
    number: "05",
    icon: FolderLock,
    title: "A place to store, never get lost",
    description:
      "Safely store all your critical information in one accessible location. Your data is preserved and easily retrievable when needed.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-0 font-body">
            How It Works
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mt-4 mb-6 text-balance">
            Five simple steps to peace of mind
          </h2>
          <p className="font-body text-lg text-muted-foreground leading-relaxed">
            Our guided process makes it easy to organize your life and protect your loved ones.
          </p>
        </AnimatedSection>

        {/* Steps Accordion */}
        <AnimatedSection animation="fade-up" delay={200} className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {steps.map((step, index) => (
              <AccordionItem
                key={index}
                value={`step-${index}`}
                className="border border-border/50 rounded-xl px-6 shadow-card data-[state=open]:shadow-elevated transition-all"
              >
                <AccordionTrigger className="hover:no-underline py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-sage flex items-center justify-center shrink-0">
                      <step.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="text-left">
                      <span className="font-body text-xs text-muted-foreground uppercase tracking-wider">
                        Step {step.number}
                      </span>
                      <h3 className="font-display text-lg font-semibold text-foreground">
                        {step.title}
                      </h3>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pl-16">
                  <p className="font-body text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default HowItWorks;
