import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sparkles, Camera, CheckCircle2, ArrowRight, FolderLock } from "lucide-react";
import { AnimatedSection, AnimatedItem } from "@/hooks/useScrollAnimation";
const steps = [{
  number: "01",
  icon: Sparkles,
  title: "Capture without commitment",
  description: "Effortlessly gather essential information at your own pace. Our intuitive platform provides helpful prompts, ensuring a low-pressure start."
}, {
  number: "02",
  icon: Camera,
  title: "Instant snapshot",
  description: "Receive an immediate, high-level overview of your information across key domains, offering quick insights into your current preparedness."
}, {
  number: "03",
  icon: CheckCircle2,
  title: "Neutral reality check",
  description: "Gain an objective understanding of your readiness across legal, financial, and personal domains — presented as straightforward status."
}, {
  number: "04",
  icon: ArrowRight,
  title: "One clear next step",
  description: "Identify the single most impactful action to take next. We cut through complexity, providing just one actionable step at a time."
}, {
  number: "05",
  icon: FolderLock,
  title: "A place to store, never get lost",
  description: "Safely store all your critical information in one accessible location. Your data is preserved and easily retrievable when needed."
}];
const HowItWorks = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-12">
          <Badge variant="outline" className="mb-4">How It Works</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Five Simple Steps to Peace of Mind
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our guided process makes organizing your life affairs straightforward and stress-free.
          </p>
        </AnimatedSection>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {steps.map((step, index) => (
              <AnimatedItem key={index} delay={index * 0.1}>
                <AccordionItem value={`step-${index}`}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-4 text-left">
                      <span className="text-sm font-mono text-primary">{step.number}</span>
                      <step.icon className="w-5 h-5 text-primary" />
                      <span className="font-semibold">{step.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-muted-foreground pl-16">{step.description}</p>
                  </AccordionContent>
                </AccordionItem>
              </AnimatedItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};
export default HowItWorks;