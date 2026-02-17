import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Heart } from "lucide-react";
import heartLogo from "@/assets/rest-easy-heart.png";

const HeroAnimatedItem = ({
  children,
  delay = 0,
  duration = 600,
  movement = 6,
  className = ""






}: {children: React.ReactNode;delay?: number;duration?: number;movement?: number;className?: string;}) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={className}
      style={{
        transitionProperty: "opacity, transform",
        transitionTimingFunction: "ease-out",
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : `translateY(${movement}px)`
      }}>

      {children}
    </div>);

};

const Hero = () => {
  return (
    <section className="relative min-h-[70vh] lg:min-h-[80vh] flex items-center overflow-hidden pt-20 pb-12 lg:pb-20">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-hero-drift-1" />
        <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-hero-drift-2" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
          {/* Left: Text and buttons */}
          <div className="flex-1 text-center lg:text-left space-y-6 lg:space-y-8">
            <HeroAnimatedItem delay={100} duration={700} movement={6}>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-foreground leading-tight text-balance">
                Get your affairs in order with{" "}
                <span className="text-primary">Rest Assured</span>
              </h1>
            </HeroAnimatedItem>

            <HeroAnimatedItem delay={200} duration={700} movement={6}>
              <p className="font-body text-lg lg:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Rest Easy helps you achieve Life Readiness — organizing your
                affairs for any unexpected moment, not just end-of-life.
              </p>
            </HeroAnimatedItem>

            <HeroAnimatedItem delay={350} duration={600} movement={0}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  className="group font-body text-base px-8 py-6 shadow-soft hover:shadow-elevated transition-all duration-150 active:scale-[0.98]"
                  asChild>

                  <a href="/login">
                    Log In
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </a>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="font-body text-base px-8 py-6 transition-all duration-150 active:scale-[0.98]"
                  asChild>

                  <a href="/assessment">Free Findability Assessment</a>
                </Button>
              </div>
            </HeroAnimatedItem>

            {/* Trust indicators */}
            <HeroAnimatedItem delay={500} duration={600} movement={0}>
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start pt-4">
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
            </HeroAnimatedItem>
          </div>

          {/* Right: Heart logo */}
          <HeroAnimatedItem delay={0} duration={800} className="flex-shrink-0">
            <img
              src={heartLogo}
              alt="Rest Easy"
              className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 object-contain animate-hero-heartbeat" />

          </HeroAnimatedItem>
        </div>
      </div>
    </section>);

};

export default Hero;