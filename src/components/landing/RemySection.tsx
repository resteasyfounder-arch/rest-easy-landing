import { useState } from "react";
import { Link } from "react-router-dom";
import { Brain, Compass, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedItem } from "@/hooks/useScrollAnimation";
import remyAvatar from "@/assets/remy-avatar.png";

const capabilities = [
  {
    icon: Brain,
    title: "Explains the process clearly",
    description: "Understand what Rest Easy does and why each step matters.",
  },
  {
    icon: Compass,
    title: "Guides your next step",
    description: "Start with Findability, then move into full readiness planning.",
  },
  {
    icon: Sparkles,
    title: "Stays focused on readiness",
    description: "All guidance is specific to your Rest Easy journey.",
  },
];

type GuestIntent = "purpose" | "findability" | "login";

const intentContent: Record<
  GuestIntent,
  {
    title: string;
    body: string;
    primaryLabel: string;
    primaryHref: string;
    secondaryLabel?: string;
    secondaryHref?: string;
  }
> = {
  purpose: {
    title: "What is Rest Easy?",
    body: "Rest Easy helps you organize your life-readiness decisions so your loved ones can act with confidence when it matters most.",
    primaryLabel: "Take Findability Assessment",
    primaryHref: "/assessment",
    secondaryLabel: "Sign up / Log in",
    secondaryHref: "/login",
  },
  findability: {
    title: "Start with Findability",
    body: "Findability is the fast starting point. It gives you a clear snapshot and points you to the highest-impact next steps.",
    primaryLabel: "Start Findability",
    primaryHref: "/assessment",
    secondaryLabel: "See full readiness flow",
    secondaryHref: "/readiness",
  },
  login: {
    title: "Unlock full guidance",
    body: "Sign in to get personalized Remy recommendations across profile, readiness, dashboard, and report results.",
    primaryLabel: "Sign up / Log in",
    primaryHref: "/login",
    secondaryLabel: "Try Findability first",
    secondaryHref: "/assessment",
  },
};

const RemySection = () => {
  const [intent, setIntent] = useState<GuestIntent>("purpose");
  const content = intentContent[intent];

  return (
    <section className="relative overflow-hidden bg-background py-16 lg:py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mb-12 text-center">
          <AnimatedItem animation="fade-up" delay={0}>
            <h2 className="mb-4 font-display text-3xl font-semibold text-foreground lg:text-4xl">
              Meet Remy, your Rest Easy guide
            </h2>
          </AnimatedItem>
          <AnimatedItem animation="fade-up" delay={100}>
            <p className="mx-auto max-w-2xl font-body text-lg text-muted-foreground">
              Remy is a product feature that helps you understand the process, pick the right next step, and move forward with confidence.
            </p>
          </AnimatedItem>
        </div>

        <div className="mx-auto mb-10 grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-2">
          <AnimatedItem animation="fade-up" delay={200}>
            <div className="h-full rounded-2xl border border-border/50 bg-card p-6 shadow-soft">
              <div className="mb-6 flex items-center gap-4">
                <img
                  src={remyAvatar}
                  alt="Remy - Rest Easy Guide"
                  className="h-16 w-16 animate-remy-float rounded-full shadow-card"
                />
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground">Hi, I&apos;m Remy</h3>
                  <p className="font-body text-sm text-muted-foreground">Here to guide your readiness journey</p>
                </div>
              </div>

              <div className="space-y-4">
                {capabilities.map((capability) => (
                  <div key={capability.title} className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <capability.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-body text-sm font-medium text-foreground">{capability.title}</h4>
                      <p className="font-body text-xs text-muted-foreground">{capability.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedItem>

          <AnimatedItem animation="fade-up" delay={300}>
            <div className="h-full rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-card p-6 shadow-soft">
              <h3 className="font-display text-xl font-semibold text-foreground">How can Remy help right now?</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose what you need and Remy will guide you to the right next step.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant={intent === "purpose" ? "default" : "outline"} onClick={() => setIntent("purpose")}>
                  What is Rest Easy?
                </Button>
                <Button size="sm" variant={intent === "findability" ? "default" : "outline"} onClick={() => setIntent("findability")}>
                  Findability
                </Button>
                <Button size="sm" variant={intent === "login" ? "default" : "outline"} onClick={() => setIntent("login")}>
                  Sign up / Log in
                </Button>
              </div>

              <div className="mt-4 rounded-xl border border-border/60 bg-background/70 p-4">
                <p className="text-sm font-semibold text-foreground">{content.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{content.body}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild size="sm" className="gap-1.5">
                    <Link to={content.primaryHref}>{content.primaryLabel}</Link>
                  </Button>
                  {content.secondaryLabel && content.secondaryHref && (
                    <Button asChild size="sm" variant="outline">
                      <Link to={content.secondaryHref}>{content.secondaryLabel}</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </AnimatedItem>
        </div>

        <AnimatedItem animation="fade-up" delay={400}>
          <div className="text-center">
            <Button asChild size="lg" className="px-8 font-body text-base">
              <Link to="/assessment">Start with Remy Guidance</Link>
            </Button>
            <p className="mt-3 font-body text-xs text-muted-foreground">
              Remy is available across your readiness flow as a guided feature.
            </p>
          </div>
        </AnimatedItem>
      </div>
    </section>
  );
};

export default RemySection;
