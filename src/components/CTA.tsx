import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Clock } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import heartIcon from "@/assets/rest-easy-heart.png";
const CTA = () => {
  return (
    <section className="py-16 md:py-24 bg-primary">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <Card className="bg-sage-800/90 border-0 text-primary-foreground">
            <CardContent className="p-8 md:p-12 text-center">
              <div className="flex justify-center mb-6">
                <img src={heartIcon} alt="Rest Easy" className="w-16 h-16" />
              </div>
              <Badge variant="secondary" className="mb-4">
                <Clock className="w-3 h-3 mr-1" />
                Takes only 5 minutes
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Rest Easy?
              </h2>
              <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
                Take our free Findability Assessment and discover how prepared your loved ones would be to find what they need.
              </p>
              <Button size="lg" variant="secondary" className="group">
                Start Your Free Assessment
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </section>
  );
};
export default CTA;