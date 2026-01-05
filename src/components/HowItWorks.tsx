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
    description: "Effortlessly gather essential information at your own pace. Our intuitive platform provides helpful prompts, ensuring a low-pressure start."
  },
  {
    number: "02",
    icon: Camera,
    title: "Instant snapshot",
    description: "Receive an immediate, high-level overview of your information across key domains, offering quick insights into your current preparedness."
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Neutral reality check",
    description: "Gain an objective understanding of your readiness across legal, financial, and personal domains — presented as straightforward status."
  },
  {
    number: "04",
    icon: ArrowRight,
    title: "One clear next step",
    description: "Identify the single most impactful action to take next. We cut through complexity, providing just one actionable step at a time."
  },
  {
    number: "05",
    icon: FolderLock,
    title: "A place to store, never get lost",
    description: "Safely store all your critical information in one accessible location. Your data is preserved and easily retrievable when needed."
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 bg-accent text-accent-foreground border-0 font-body">
            Simple Process
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mt-4 mb-6 text-balance">
            Five simple steps to Life Readiness
          </h2>
          <p className="font-body text-lg text-muted-foreground leading-relaxed">
            Progress accumulates quietly and consistently as your preparedness improves.
          </p>
        </AnimatedSection>

        {/* Mobile Accordion View */}
        <div className="lg:hidden max-w-md mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {steps.map((step, index) => (
              <AccordionItem 
                key={index} 
                value={`step-${index}`}
                className="border rounded-xl bg-card shadow-soft px-4"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex items-center gap-4">
                    <Badge className="bg-primary/10 text-primary border-0 font-display font-bold">
                      {step.number}
                    </Badge>
                    <span className="font-display text-base font-semibold text-foreground text-left">
                      {step.title}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <p className="font-body text-muted-foreground leading-relaxed pl-14">
                    {step.description}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Desktop Timeline View */}
        <div className="hidden lg:block relative max-w-4xl mx-auto">
          {/* Connecting line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" />

          {steps.map((step, index) => (
            <AnimatedItem 
              key={index}
              animation={index % 2 === 0 ? "fade-right" : "fade-left"}
              delay={index * 100}
              className={`relative flex gap-12 mb-12 last:mb-0 ${
                index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
              }`}
            >
              {/* Step number indicator */}
              <div className="absolute left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-primary flex items-center justify-center z-10">
                <span className="font-display text-lg font-bold text-primary-foreground">{step.number}</span>
              </div>

              {/* Content */}
              <div className={`w-1/2 ${index % 2 === 0 ? 'pr-20 text-right' : 'pl-20'}`}>
                <Card className={`border-border/50 shadow-card hover:shadow-elevated transition-shadow ${
                  index % 2 === 0 ? 'ml-auto' : ''
                }`}>
                  <CardHeader className="pb-2">
                    <div className={`flex items-center gap-4 mb-2 ${index % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                      <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0">
                        <step.icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="font-display text-xl text-foreground">{step.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="font-body text-muted-foreground leading-relaxed">
                      {step.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </div>

              {/* Empty space for alternating layout */}
              <div className="w-1/2" />
            </AnimatedItem>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
