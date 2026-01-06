import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Activity, ArrowRight, Sparkles, Clock, TrendingUp, CheckCircle2, Star } from "lucide-react";
import { AnimatedSection, AnimatedItem } from "@/hooks/useScrollAnimation";

const scores = [
  {
    id: "findability",
    icon: Search,
    title: "Findability Score",
    question: "Can the right people find and act quickly?",
    time: "~2 minutes",
    focus: "Measures execution under stress — access and clarity in emergencies",
    cta: "If something unexpected happened tomorrow, could the right people find what they need?",
    badge: "Free Assessment",
    badgeIcon: Clock,
    isPrimary: true,
    features: ["Immediate results", "No commitment", "Actionable insights"],
  },
  {
    id: "readiness",
    icon: Activity,
    title: "Life Readiness Score",
    question: "Is your life actually ready beyond just finding things?",
    time: "20-40 minutes (incremental)",
    focus: "Measures sustained preparedness — roles defined, documents in place, gaps prioritized",
    cta: "Life changes. Your readiness should keep up.",
    badge: "Comprehensive",
    badgeIcon: TrendingUp,
    isPrimary: false,
    features: ["Complete assessment", "Ongoing guidance", "Progress tracking"],
  },
];

const Solution = () => {
  return (
    <section id="solution" className="py-20 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-0 font-body">
            <Sparkles className="w-3 h-3 mr-1" />
            Our Solution
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mt-4 mb-6 text-balance">
            Get your Readiness Score. Protect your family. Start today without the overwhelm.
          </h2>
          <p className="font-body text-lg text-muted-foreground leading-relaxed">
            Rest Easy assesses your preparedness across nine key areas—so you know exactly where you stand and what to
            do next.
          </p>
        </AnimatedSection>

        {/* Mobile Tabs View */}
        <div className="lg:hidden max-w-md mx-auto">
          <Tabs defaultValue="findability" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
              <TabsTrigger value="findability" className="font-body data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Search className="w-4 h-4 mr-2" />
                Findability
              </TabsTrigger>
              <TabsTrigger value="readiness" className="font-body data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Activity className="w-4 h-4 mr-2" />
                Life Readiness
              </TabsTrigger>
            </TabsList>
            {scores.map((score) => (
              <TabsContent key={score.id} value={score.id}>
                <ScoreCard score={score} />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Desktop Cards View */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {scores.map((score, index) => (
            <AnimatedItem key={score.id} animation={index === 0 ? "fade-right" : "fade-left"} delay={index * 150}>
              <ScoreCard score={score} />
            </AnimatedItem>
          ))}
        </div>

        {/* How they work together */}
        <AnimatedSection animation="fade-up" delay={300} className="mt-16">
          <Card className="max-w-2xl mx-auto border-border/50 shadow-card bg-background">
            <CardContent className="py-8 px-6">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <div className="flex items-center gap-3 bg-primary/5 rounded-full px-4 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-sage flex items-center justify-center">
                    <Search className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="font-body font-medium text-foreground">Findability</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-8 h-[2px] bg-border hidden sm:block" />
                  <ArrowRight className="w-5 h-5" />
                  <div className="w-8 h-[2px] bg-border hidden sm:block" />
                </div>
                <div className="flex items-center gap-3 bg-primary/5 rounded-full px-4 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-sage flex items-center justify-center">
                    <Activity className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="font-body font-medium text-foreground">Life Readiness</span>
                </div>
              </div>
              <p className="font-body text-muted-foreground text-center mt-6">
                Findability gets you in the door. Life Readiness keeps things working over time.
              </p>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </section>
  );
};

interface ScoreCardProps {
  score: (typeof scores)[0];
}

const ScoreCard = ({ score }: ScoreCardProps) => {
  const BadgeIcon = score.badgeIcon;

  return (
    <Card className={`border-border/50 shadow-card hover:shadow-elevated transition-all h-full relative overflow-hidden ${score.isPrimary ? 'ring-2 ring-primary/20' : ''}`}>
      {score.isPrimary && (
        <div className="absolute top-0 right-0">
          <div className="bg-primary text-primary-foreground text-xs font-body font-medium px-3 py-1 rounded-bl-lg flex items-center gap-1">
            <Star className="w-3 h-3" />
            Start Here
          </div>
        </div>
      )}
      
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4 mb-3">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 ${score.isPrimary ? 'bg-gradient-sage' : 'bg-muted'}`}>
            <score.icon className={`w-8 h-8 ${score.isPrimary ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
          </div>
          <div className="flex-1 pt-1">
            <Badge className={`mb-2 border-0 font-body text-xs ${score.isPrimary ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              <BadgeIcon className="w-3 h-3 mr-1" />
              {score.badge}
            </Badge>
            <CardTitle className="font-display text-2xl text-foreground">{score.title}</CardTitle>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
          <Clock className="w-4 h-4" />
          {score.time}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-5">
        <CardDescription className="font-display text-lg text-primary italic border-l-2 border-primary/30 pl-4">
          "{score.question}"
        </CardDescription>
        
        <p className="font-body text-muted-foreground leading-relaxed">{score.focus}</p>

        <ul className="space-y-3">
          {score.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-3 h-3 text-primary" />
              </div>
              <span className="font-body text-sm text-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        <Card className="bg-secondary/50 border-0">
          <CardContent className="p-4">
            <p className="font-body text-sm text-secondary-foreground">
              <span className="font-semibold text-foreground">Ask yourself:</span> {score.cta}
            </p>
          </CardContent>
        </Card>

        {score.isPrimary ? (
          <Button className="w-full font-body" size="lg" asChild>
            <a href="/assessment">
              Take Free Assessment
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </Button>
        ) : (
          <Button className="w-full font-body" size="lg" variant="outline" asChild>
            <a href="/login">
              Sign Up or Log In
              <ArrowRight className="ml-2 w-4 h-4" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default Solution;
