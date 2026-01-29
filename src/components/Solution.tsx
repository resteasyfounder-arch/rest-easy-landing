import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Activity, ArrowRight, Sparkles } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

const Solution = () => {
  return (
    <section id="solution" className="py-20 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-12">
          <Badge className="mb-4 bg-primary/10 text-primary border-0 font-body">
            <Sparkles className="w-3 h-3 mr-1" />
            Two Paths Forward
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mt-4 mb-6 text-balance">
            Start with a quick check, or dive into the full picture
          </h2>
          <p className="font-body text-lg text-muted-foreground leading-relaxed">
            Choose how you'd like to begin your journey to Life Readiness.
          </p>
        </AnimatedSection>

        {/* Two paths */}
        <div className="max-w-4xl mx-auto">
          <Card className="border-border/50 shadow-card bg-background">
            <CardContent className="py-8 px-6">
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Findability Path */}
                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-secondary/50 hover:bg-secondary/70 transition-colors">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-sage flex items-center justify-center mb-4">
                    <Search className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-medium text-foreground mb-2">
                    Findability Check
                  </h3>
                  <p className="font-body text-sm text-muted-foreground mb-4">
                    Quick 2-minute assessment to see if the right people can find what they need
                  </p>
                  <Button variant="outline" className="font-body" asChild>
                    <a href="/assessment">
                      Take Quick Check
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </a>
                  </Button>
                </div>

                {/* Life Readiness Path */}
                <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-colors">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-sage flex items-center justify-center mb-4">
                    <Activity className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h3 className="font-display text-xl font-medium text-foreground mb-2">
                    Life Readiness
                  </h3>
                  <p className="font-body text-sm text-muted-foreground mb-4">
                    Comprehensive assessment across all nine areas with personalized roadmap
                  </p>
                  <Button className="font-body" asChild>
                    <a href="/readiness">
                      Start Full Assessment
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default Solution;
