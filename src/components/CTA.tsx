import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Clock } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import heartIcon from "@/assets/rest-easy-heart.png";

const CTA = () => {
  return (
    <section className="py-20 lg:py-32 bg-gradient-sage relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-10 left-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <AnimatedSection animation="scale">
          <Card className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm border-white/20 shadow-elevated">
            <CardContent className="p-8 lg:p-12 text-center">
              {/* Icon */}
              <div className="mb-8 flex justify-center">
                <img 
                  src={heartIcon} 
                  alt="Rest Easy Heart" 
                  className="w-20 h-20 object-contain opacity-90"
                />
              </div>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-primary-foreground mb-6 text-balance">
                Start your Life Readiness journey today
              </h2>
              
              <p className="font-body text-lg lg:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto leading-relaxed">
                Take the free 2-minute Findability Assessment and see where you stand. No obligation, no pressure — just clarity.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="font-body text-base px-8 py-6 bg-white text-primary hover:bg-white/90 shadow-elevated"
                  asChild
                >
                  <a href="/assessment">
                    Get Your Findability Score
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </a>
                </Button>
                
                <Badge variant="secondary" className="bg-white/20 text-primary-foreground border-0 px-4 py-2">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="font-body text-sm">Only takes 2 minutes</span>
                </Badge>
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default CTA;
