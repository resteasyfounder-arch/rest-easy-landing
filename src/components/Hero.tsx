import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, Heart } from "lucide-react";
import { AnimatedItem } from "@/hooks/useScrollAnimation";
import heartLogo from "@/assets/rest-easy-heart.png";

const Hero = () => {
  return (
    <section className="relative min-h-[70vh] lg:min-h-[80vh] flex items-center overflow-hidden bg-gradient-hero pt-20 pb-12 lg:pb-20">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center space-y-6 lg:space-y-8">
          {/* Heart Logo */}
          <AnimatedItem animation="fade-up" delay={0}>
            <div className="flex justify-center mb-2">
              <img 
                src={heartLogo} 
                alt="Rest Easy" 
                className="w-16 h-16 lg:w-20 lg:h-20 object-contain"
              />
            </div>
          </AnimatedItem>

          <AnimatedItem animation="fade-up" delay={50}>
            <Badge variant="secondary" className="font-body">
              <Shield className="w-4 h-4 mr-2" />
              Life Readiness Platform
            </Badge>
          </AnimatedItem>

          <AnimatedItem animation="fade-up" delay={100}>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-foreground leading-tight text-balance">
              Get your affairs in order with{" "}
              <span className="text-primary">Rest Easy</span>
            </h1>
          </AnimatedItem>

          <AnimatedItem animation="fade-up" delay={200}>
            <p className="font-body text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Rest Easy helps you achieve Life Readiness — organizing your
              affairs for any unexpected moment, not just end-of-life.
            </p>
          </AnimatedItem>

          <AnimatedItem animation="fade-up" delay={300}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="font-body text-base px-8 py-6 shadow-soft hover:shadow-elevated transition-shadow"
                asChild
              >
                <a href="/readiness">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="font-body text-base px-8 py-6"
              >
                Learn More
              </Button>
            </div>
          </AnimatedItem>

          {/* Trust indicators */}
          <AnimatedItem animation="fade-up" delay={400}>
            <div className="flex flex-wrap gap-6 justify-center pt-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                <span className="font-body text-sm text-muted-foreground">
                  Trusted by families
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <span className="font-body text-sm text-muted-foreground">
                  Bank-level security
                </span>
              </div>
            </div>
          </AnimatedItem>
        </div>
      </div>
    </section>
  );
};

export default Hero;
