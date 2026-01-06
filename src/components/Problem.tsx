import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileQuestion, MapPin, Zap, AlertCircle } from "lucide-react";
import { AnimatedSection, AnimatedItem } from "@/hooks/useScrollAnimation";

const stats = [
  {
    value: "76%",
    label: "Americans without any estate planning documents",
  },
  {
    value: "212+",
    label: "Hours lost settling affairs per death by families",
  },
  {
    value: "30M",
    label: "Boomers projected to pass in the next 10-15 years",
  },
];

const challenges = [
  {
    icon: FileQuestion,
    title: "Exploding Digital Footprint",
    description:
      "The sheer volume of digital accounts, passwords, and fragmented information has led to unprecedented cognitive overload.",
  },
  {
    icon: MapPin,
    title: "Increased Family Distribution",
    description:
      "Modern families are geographically dispersed, intensifying the challenge of coordinating affairs across diverse households.",
  },
  {
    icon: Zap,
    title: "Rapid Pace of Change",
    description:
      "Constant technological and regulatory changes make it difficult to maintain a current view of one's life affairs.",
  },
];

const Problem = () => {
  return (
    <section id="problem" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 bg-destructive/10 text-destructive border-0 font-body">
            <AlertCircle className="w-3 h-3 mr-1" />
            The Problem
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mt-4 mb-6 text-balance">
            Life doesn't come with a manual—but the aftermath does.
          </h2>
          <p className="font-body text-lg text-muted-foreground leading-relaxed">
            When the unexpected happens, families are left scrambling through chaos.
            Critical information is scattered, outdated, or simply lost.
          </p>
        </AnimatedSection>

        {/* Stats */}
        <AnimatedSection animation="fade-up" delay={200} className="mb-16">
          <Card className="border-border/50 shadow-card">
            <CardContent className="py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="font-display text-4xl lg:text-5xl font-bold text-primary mb-2">
                      {stat.value}
                    </div>
                    <p className="font-body text-sm text-muted-foreground max-w-[200px] mx-auto">
                      {stat.label}
                    </p>
                    {index < stats.length - 1 && (
                      <Separator className="md:hidden mt-8" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Challenges */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {challenges.map((challenge, index) => (
            <AnimatedItem
              key={index}
              animation="fade-up"
              delay={index * 100}
            >
              <Card className="border-border/50 shadow-card hover:shadow-elevated transition-all h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                    <challenge.icon className="w-6 h-6 text-destructive" />
                  </div>
                  <CardTitle className="font-display text-xl text-foreground">
                    {challenge.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    {challenge.description}
                  </p>
                </CardContent>
              </Card>
            </AnimatedItem>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Problem;
