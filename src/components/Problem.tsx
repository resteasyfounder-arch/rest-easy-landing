import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileQuestion, MapPin, Zap, AlertCircle } from "lucide-react";
import { AnimatedSection, AnimatedItem } from "@/hooks/useScrollAnimation";

const stats = [
  { value: "76%", label: "Americans without any estate planning documents" },
  { value: "212+", label: "Hours lost settling affairs per death by families" },
  { value: "30M", label: "Boomers projected to pass in the next 10-15 years" },
];

const challenges = [
  {
    icon: FileQuestion,
    title: "Exploding Digital Footprint",
    description: "The sheer volume of digital accounts, passwords, and fragmented information has led to unprecedented cognitive overload."
  },
  {
    icon: MapPin,
    title: "Increased Family Distribution",
    description: "Modern families are geographically dispersed, intensifying the challenge of coordinating affairs across diverse households."
  },
  {
    icon: Zap,
    title: "Rapid Pace of Change",
    description: "Constant technological and regulatory changes make it difficult to maintain a current view of one's life affairs."
  },
];

const Problem = () => {
  return (
    <section id="problem" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4 border-destructive/30 text-destructive font-body">
            <AlertCircle className="w-3 h-3 mr-1" />
            The Challenge
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mt-4 mb-6 text-balance">
            This isn't a motivation problem. It's an ambiguity problem.
          </h2>
          <p className="font-body text-lg text-muted-foreground leading-relaxed">
            Most people aren't uninformed; they're overloaded. Nothing feels clearly started or clearly done, leaving vital information scattered and decisions partial.
          </p>
        </AnimatedSection>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, index) => (
            <AnimatedItem key={index} animation="fade-up" delay={index * 100}>
              <Card className="text-center border-border/50 shadow-card hover:shadow-elevated transition-shadow h-full">
                <CardContent className="p-8">
                  <p className="font-display text-4xl lg:text-5xl font-bold text-primary mb-3">{stat.value}</p>
                  <p className="font-body text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </AnimatedItem>
          ))}
        </div>

        <Separator className="mb-16" />

        {/* Challenges */}
        <div className="grid md:grid-cols-3 gap-8">
          {challenges.map((challenge, index) => (
            <AnimatedItem key={index} animation="fade-up" delay={index * 150}>
              <Card className="group bg-secondary/50 hover:bg-secondary transition-colors border-0 h-full">
                <CardHeader>
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <challenge.icon className="w-7 h-7 text-primary" />
                  </div>
                  <CardTitle className="font-display text-xl text-foreground">{challenge.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-body text-muted-foreground leading-relaxed">{challenge.description}</p>
                </CardContent>
              </Card>
            </AnimatedItem>
          ))}
        </div>

        {/* Bottom message */}
        <AnimatedSection animation="fade" delay={200} className="mt-16 text-center">
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto italic">
            "Families don't struggle because someone didn't care. They struggle because the pathway to Life Readiness was unclear."
          </p>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Problem;
