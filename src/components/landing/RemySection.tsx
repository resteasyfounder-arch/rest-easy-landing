import { Brain, MessageCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedItem } from "@/hooks/useScrollAnimation";
import { BentoCard } from "./BentoCard";
import RemyChatDemo from "./demos/RemyChatDemo";
import remyAvatar from "@/assets/remy-avatar.png";

const capabilities = [
  {
    icon: Brain,
    title: "Understands Your Journey",
    description: "Knows your profile and tracks your progress.",
  },
  {
    icon: MessageCircle,
    title: "Explains in Plain Language",
    description: "Clear answers about scores and next steps.",
  },
  {
    icon: RefreshCw,
    title: "Adapts as Life Changes",
    description: "Adjusts recommendations as you evolve.",
  },
];

const RemySection = () => {
  return (
    <section className="py-16 lg:py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <AnimatedItem animation="fade-up" delay={0}>
            <h2 className="font-display text-3xl lg:text-4xl font-semibold text-foreground mb-4">
              Meet Remy — Your Personal Rest Easy Manager
            </h2>
          </AnimatedItem>
          <AnimatedItem animation="fade-up" delay={100}>
            <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
              A calm, trustworthy companion who helps you understand your Life Readiness journey
              and guides you toward peace of mind.
            </p>
          </AnimatedItem>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto mb-10">
          {/* Left Card - Remy Introduction */}
          <AnimatedItem animation="fade-up" delay={200}>
            <div className="h-full rounded-2xl border border-border/50 bg-card p-6 shadow-soft">
              {/* Remy Avatar and Title */}
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={remyAvatar}
                  alt="Remy - Your Rest Easy Manager"
                  className="w-16 h-16 rounded-full shadow-card animate-remy-float"
                />
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground">
                    Hi, I'm Remy
                  </h3>
                  <p className="font-body text-sm text-muted-foreground">
                    Your AI-powered guide
                  </p>
                </div>
              </div>

              {/* Capabilities */}
              <div className="space-y-4">
                {capabilities.map((capability) => (
                  <div key={capability.title} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <capability.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-body text-sm font-medium text-foreground">
                        {capability.title}
                      </h4>
                      <p className="font-body text-xs text-muted-foreground">
                        {capability.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedItem>

          {/* Right Card - Interactive Demo */}
          <AnimatedItem animation="fade-up" delay={300}>
            <BentoCard
              icon={MessageCircle}
              title="Ask Remy Anything"
              subtitle="See how Remy helps you navigate your journey"
              className="h-full"
            >
              <RemyChatDemo />
            </BentoCard>
          </AnimatedItem>
        </div>

        {/* CTA */}
        <AnimatedItem animation="fade-up" delay={400}>
          <div className="text-center">
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
          </div>
        </AnimatedItem>
      </div>
    </section>
  );
};

export default RemySection;
