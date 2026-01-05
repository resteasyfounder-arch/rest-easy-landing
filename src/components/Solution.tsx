import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Activity, ArrowRight, Sparkles, Clock, TrendingUp, CheckCircle2 } from "lucide-react";

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
    features: ["Immediate results", "No commitment", "Actionable insights"]
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
    features: ["Complete assessment", "Ongoing guidance", "Progress tracking"]
  },
];

const Solution = () => {
  return (
    <section id="solution" className="py-20 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-0 font-body">
            <Sparkles className="w-3 h-3 mr-1" />
            Our Solution
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mt-4 mb-6 text-balance">
            Two Scores. Two Moments. One System.
          </h2>
          <p className="font-body text-lg text-muted-foreground leading-relaxed">
            Rest Easy uses two complementary scores to guide you from immediate action to sustained preparedness.
          </p>
        </div>

        {/* Mobile Tabs View */}
        <div className="lg:hidden max-w-md mx-auto">
          <Tabs defaultValue="findability" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="findability" className="font-body">Findability</TabsTrigger>
              <TabsTrigger value="readiness" className="font-body">Life Readiness</TabsTrigger>
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
          {scores.map((score) => (
            <ScoreCard key={score.id} score={score} />
          ))}
        </div>

        {/* How they work together */}
        <div className="mt-16 text-center">
          <Card className="inline-flex items-center gap-4 p-6 shadow-soft border-border/50">
            <CardContent className="flex items-center gap-4 p-0">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-primary" />
                <span className="font-body font-medium text-foreground">Findability</span>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <span className="font-body font-medium text-foreground">Life Readiness</span>
              </div>
            </CardContent>
          </Card>
          <p className="font-body text-muted-foreground mt-4">
            Findability gets you in the door. Life Readiness keeps things working over time.
          </p>
        </div>
      </div>
    </section>
  );
};

interface ScoreCardProps {
  score: typeof scores[0];
}

const ScoreCard = ({ score }: ScoreCardProps) => {
  const BadgeIcon = score.badgeIcon;
  
  return (
    <Card className="border-border/50 shadow-card hover:shadow-elevated transition-all">
      <CardHeader>
        <div className="flex items-start gap-4 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-sage flex items-center justify-center shrink-0">
            <score.icon className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-primary/10 text-primary border-0 font-body text-xs">
                <BadgeIcon className="w-3 h-3 mr-1" />
                {score.badge}
              </Badge>
            </div>
            <CardTitle className="font-display text-2xl text-foreground">{score.title}</CardTitle>
            <p className="font-body text-sm text-muted-foreground mt-1">{score.time}</p>
          </div>
        </div>
        <CardDescription className="font-display text-lg text-primary italic">
          "{score.question}"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="font-body text-muted-foreground leading-relaxed">{score.focus}</p>
        
        <ul className="space-y-2">
          {score.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="font-body text-sm text-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        <Card className="bg-secondary border-0">
          <CardContent className="p-4">
            <p className="font-body text-sm text-secondary-foreground">
              <span className="font-semibold">Ask yourself:</span> {score.cta}
            </p>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default Solution;
