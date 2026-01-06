import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FileQuestion, MapPin, Zap, AlertCircle } from "lucide-react";
import { AnimatedSection, AnimatedItem } from "@/hooks/useScrollAnimation";
const stats = [{
  value: "76%",
  label: "Americans without any estate planning documents"
}, {
  value: "212+",
  label: "Hours lost settling affairs per death by families"
}, {
  value: "30M",
  label: "Boomers projected to pass in the next 10-15 years"
}];
const challenges = [{
  icon: FileQuestion,
  title: "Exploding Digital Footprint",
  description: "The sheer volume of digital accounts, passwords, and fragmented information has led to unprecedented cognitive overload."
}, {
  icon: MapPin,
  title: "Increased Family Distribution",
  description: "Modern families are geographically dispersed, intensifying the challenge of coordinating affairs across diverse households."
}, {
  icon: Zap,
  title: "Rapid Pace of Change",
  description: "Constant technological and regulatory changes make it difficult to maintain a current view of one's life affairs."
}];
const Problem = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <AnimatedSection className="text-center mb-12">
          <Badge variant="outline" className="mb-4">The Challenge</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Getting Organized Feels Impossible
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Modern life creates complexity that traditional planning can't handle.
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <AnimatedItem key={index} delay={index * 0.1}>
              <Card className="text-center bg-background">
                <CardContent className="pt-6">
                  <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </AnimatedItem>
          ))}
        </div>

        <Separator className="my-12" />

        <div className="grid md:grid-cols-3 gap-6">
          {challenges.map((challenge, index) => (
            <AnimatedItem key={index} delay={index * 0.1}>
              <Card className="h-full">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <challenge.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{challenge.description}</p>
                </CardContent>
              </Card>
            </AnimatedItem>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Problem;