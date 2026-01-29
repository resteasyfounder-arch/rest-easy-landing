import { Brain, MessageCircle, RefreshCw, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedItem } from "@/hooks/useScrollAnimation";

const capabilities = [
  {
    icon: Brain,
    title: "Understands Your Journey",
    description: "Remy knows your profile, tracks your progress, and remembers where you left off.",
  },
  {
    icon: MessageCircle,
    title: "Explains in Plain Language",
    description: "Get clear answers about your scores, what they mean, and what to focus on next.",
  },
  {
    icon: RefreshCw,
    title: "Adapts as Life Changes",
    description: "As your circumstances evolve, Remy adjusts recommendations to keep you on track.",
  },
];

const RemySection = () => {
  return (
    <section className="py-16 lg:py-24 bg-secondary/30 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <AnimatedItem animation="fade-up" delay={0}>
            <Card className="border-0 shadow-card bg-card/80 backdrop-blur-sm overflow-hidden relative">
              {/* Shimmer overlay */}
              <div className="absolute inset-0 animate-remy-shimmer pointer-events-none" />
              
              <CardContent className="p-8 lg:p-12">
                <div className="flex flex-col items-center text-center">
                  {/* Remy Avatar with pulse rings */}
                  <div className="relative mb-8">
                    {/* Pulse rings */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-full border-2 border-primary/20 animate-remy-pulse" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full border border-primary/10 animate-remy-pulse animation-delay-500" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-40 h-40 rounded-full border border-primary/5 animate-remy-pulse animation-delay-1000" />
                    </div>
                    
                    {/* Avatar icon */}
                    <div className="relative z-10 w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-elevated animate-remy-float">
                      <Sparkles className="w-10 h-10 text-primary-foreground" />
                    </div>
                  </div>

                  {/* Headline */}
                  <AnimatedItem animation="fade-up" delay={100}>
                    <h2 className="font-display text-3xl lg:text-4xl font-semibold text-foreground mb-4">
                      Meet Remy — Your Personal Rest Easy Manager
                    </h2>
                  </AnimatedItem>

                  {/* Subheadline */}
                  <AnimatedItem animation="fade-up" delay={200}>
                    <p className="font-body text-lg text-muted-foreground max-w-2xl mb-10">
                      A calm, trustworthy companion who helps you understand your Life Readiness journey 
                      and guides you toward peace of mind.
                    </p>
                  </AnimatedItem>

                  {/* Capability highlights */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-10 w-full">
                    {capabilities.map((capability, index) => (
                      <AnimatedItem key={capability.title} animation="fade-up" delay={300 + index * 100}>
                        <div className="flex flex-col items-center text-center p-4">
                          <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                            <capability.icon className="w-6 h-6 text-primary" />
                          </div>
                          <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                            {capability.title}
                          </h3>
                          <p className="font-body text-sm text-muted-foreground">
                            {capability.description}
                          </p>
                        </div>
                      </AnimatedItem>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <AnimatedItem animation="fade-up" delay={600}>
                    <Button 
                      size="lg" 
                      className="font-body text-base px-8"
                      disabled
                    >
                      <MessageCircle className="w-5 h-5 mr-2" />
                      Talk with Remy
                    </Button>
                    <p className="font-body text-xs text-muted-foreground mt-3">
                      Coming soon
                    </p>
                  </AnimatedItem>
                </div>
              </CardContent>
            </Card>
          </AnimatedItem>
        </div>
      </div>
    </section>
  );
};

export default RemySection;
