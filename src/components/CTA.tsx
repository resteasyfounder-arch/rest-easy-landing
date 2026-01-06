import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Clock } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import heartIcon from "@/assets/rest-easy-heart.png";

const CTA = () => {
  return (
    <section id="cta" className="py-20 lg:py-32 bg-gradient-sage">
      <div className="container mx-auto px-4 lg:px-8">
        <AnimatedSection className="max-w-4xl mx-auto text-center">
          <Card className="border-0 bg-sage-800/90 shadow-elevated overflow-hidden">
            <CardContent className="py-12 px-6 lg:px-16">
              <div className="flex justify-center mb-6">
                <img
                  src={heartIcon}
                  alt="Rest Easy Heart"
                  className="w-16 h-16 object-contain"
                />
              </div>

              <Badge className="mb-6 bg-primary-foreground/20 text-primary-foreground border-0 font-body">
                <Clock className="w-3 h-3 mr-1" />
                Takes only 2 minutes
              </Badge>

              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-primary-foreground mb-6 text-balance">
                Ready to see where you stand?
              </h2>

              <p className="font-body text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                Take our free Findability Assessment and discover how prepared your family
                really is. No commitment, just clarity.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="font-body text-base px-8 py-6"
                  asChild
                >
                  <a href="/assessment">
                    Start Free Assessment
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </a>
                </Button>
              </div>

              <p className="font-body text-sm text-primary-foreground/60 mt-6">
                No credit card required • Results in 2 minutes
              </p>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default CTA;
