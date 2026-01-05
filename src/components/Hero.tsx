import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, Shield, Heart } from "lucide-react";
import { AnimatedSection, AnimatedItem } from "@/hooks/useScrollAnimation";
import heartIcon from "@/assets/rest-easy-heart.png";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero pt-20">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-accent/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-mint/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left content */}
          <div className="text-center lg:text-left space-y-6 lg:space-y-8">
            <AnimatedItem animation="fade-up" delay={0}>
              <Badge variant="secondary" className="font-body">
                <Shield className="w-4 h-4 mr-2" />
                Life Readiness Platform
              </Badge>
            </AnimatedItem>

            <AnimatedItem animation="fade-up" delay={100}>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-foreground leading-tight text-balance">
                So the people you love aren't left{" "}
                <span className="text-primary">guessing</span>
              </h1>
            </AnimatedItem>

            <AnimatedItem animation="fade-up" delay={200}>
              <p className="font-body text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Rest Easy helps you achieve Life Readiness — organizing your affairs for any unexpected moment, not just end-of-life.
              </p>
            </AnimatedItem>

            <AnimatedItem animation="fade-up" delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="font-body text-base px-8 py-6 shadow-soft hover:shadow-elevated transition-shadow" asChild>
                  <a href="/assessment">
                    Get Your Findability Score
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                <Button variant="outline" size="lg" className="font-body text-base px-8 py-6">
                  Learn More
                </Button>
              </div>
            </AnimatedItem>

            {/* Trust indicators */}
            <AnimatedItem animation="fade-up" delay={400}>
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start pt-4">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  <span className="font-body text-sm text-muted-foreground">Trusted by families</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="font-body text-sm text-muted-foreground">Bank-level security</span>
                </div>
              </div>
            </AnimatedItem>
          </div>

          {/* Right content - Floating heart illustration */}
          <AnimatedItem animation="scale" delay={200} className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Glowing background */}
              <div className="absolute inset-0 bg-gradient-sage rounded-full blur-3xl opacity-20 scale-150" />
              
              {/* Heart logo */}
              <div className="relative animate-float">
                <img 
                  src={heartIcon} 
                  alt="Rest Easy Heart" 
                  className="w-64 h-64 lg:w-80 lg:h-80 object-contain drop-shadow-2xl"
                />
              </div>

              {/* Floating cards */}
              <Card className="absolute -top-4 -left-8 shadow-card animate-float border-border/50" style={{ animationDelay: "1s" }}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg">📋</span>
                    </div>
                    <div>
                      <p className="font-body text-xs text-muted-foreground">Findability Score</p>
                      <div className="flex items-center gap-2">
                        <p className="font-display text-lg font-semibold text-primary">87%</p>
                        <Progress value={87} className="w-12 h-1.5" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="absolute -bottom-4 -right-8 shadow-card animate-float border-border/50" style={{ animationDelay: "3s" }}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                      <span className="text-lg">✓</span>
                    </div>
                    <div>
                      <p className="font-body text-xs text-muted-foreground">Life Readiness</p>
                      <Badge variant="default" className="mt-1 text-xs">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </AnimatedItem>
        </div>
      </div>
    </section>
  );
};

export default Hero;
