import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Check } from "lucide-react";
import { AnimatedSection, AnimatedItem } from "@/hooks/useScrollAnimation";
import familyUnpreparedImg from "@/assets/family-unprepared.png";
import preparedPersonImg from "@/assets/prepared-person.png";
import familyTalkingImg from "@/assets/family-talking.png";

const stats = [
  { value: "76%", subtitle: "No Will", label: "Americans without any estate planning documents" },
  { value: "212+", subtitle: "Hours Lost", label: "Spent settling affairs per death by grieving families" },
  { value: "30M", subtitle: "Deaths Expected", label: "Boomers projected to pass in next 10-15 years" },
];

const bulletPoints = [
  "Where things stand today",
  "What's covered",
  "What's missing",
  "What matters most next",
];

const ProblemSection = () => {
  return (
    <section id="problem" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 bg-destructive/10 text-destructive border-0 font-body">
            <AlertCircle className="w-3 h-3 mr-1" />
            The Problem
          </Badge>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mt-4 mb-6 text-balance">
            This isn't a motivation problem. It's an ambiguity problem.
          </h2>
          <p className="font-body text-lg text-muted-foreground leading-relaxed">
            Most people are not uninformed. They're overloaded. They know there are loose ends. They know they should deal with them. What stops action isn't denial or fear—it's ambiguity. Nothing feels clearly started or clearly done, so everything gets postponed.
          </p>
        </AnimatedSection>

        {/* Stats Strip */}
        <AnimatedSection animation="fade-up" delay={200} className="mb-20">
          <Card className="border-border/50 shadow-card">
            <CardContent className="py-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="font-display text-4xl lg:text-5xl font-bold text-primary mb-1">
                      {stat.value}
                    </div>
                    <div className="font-display text-sm font-semibold text-foreground mb-1">
                      {stat.subtitle}
                    </div>
                    <p className="font-body text-sm text-muted-foreground max-w-[220px] mx-auto">
                      {stat.label}
                    </p>
                    {index < stats.length - 1 && (
                      <Separator className="md:hidden mt-8" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </AnimatedSection>

        {/* Narrative Row 1 — Image left */}
        <AnimatedItem animation="fade-up" delay={0} className="mb-16">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="lg:w-1/2">
              <img
                src={familyUnpreparedImg}
                alt="A family struggling with unorganized affairs"
                className="rounded-2xl object-cover h-64 lg:h-80 w-full"
              />
            </div>
            <div className="lg:w-1/2 space-y-4">
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                Families don't struggle later because people didn't care. They struggle because information was scattered, decisions were partial, and no one had a clear picture of what existed and what didn't.
              </p>
              <p className="font-display text-xl font-semibold text-foreground">
                The real problem isn't preparation. It's unfinished business.
              </p>
            </div>
          </div>
        </AnimatedItem>

        {/* Narrative Row 2 — Image right */}
        <AnimatedItem animation="fade-up" delay={100} className="mb-16">
          <div className="flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-12">
            <div className="lg:w-1/2">
              <img
                src={preparedPersonImg}
                alt="A person feeling prepared and at ease"
                className="rounded-2xl object-cover h-64 lg:h-80 w-full"
              />
            </div>
            <div className="lg:w-1/2 space-y-4">
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                <span className="font-semibold text-foreground">Rest Easy is a Readiness Platform for unfinished business</span>—designed to bring clarity, not finality. It is emphatically not an end-of-life tool, nor a traditional estate planning service that focuses solely on legal documents.
              </p>
            </div>
          </div>
        </AnimatedItem>

        {/* Narrative Row 3 — Image left */}
        <AnimatedItem animation="fade-up" delay={200} className="mb-12">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            <div className="lg:w-1/2">
              <img
                src={familyTalkingImg}
                alt="A family having an open conversation about the future"
                className="rounded-2xl object-cover h-64 lg:h-80 w-full"
              />
            </div>
            <div className="lg:w-1/2 space-y-4">
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                We don't push people to finish tasks; we help them see. Rest Easy isn't a checklist, a static vault, or a service you "complete." Instead, it provides the essential visibility to understand:
              </p>
              <ul className="space-y-3">
                {bulletPoints.map((point) => (
                  <li key={point} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="font-body text-foreground font-medium">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </AnimatedItem>

        {/* Closing line */}
        <AnimatedItem animation="fade" delay={300}>
          <p className="text-center font-display text-xl lg:text-2xl font-semibold text-muted-foreground tracking-wide">
            Nothing more. Nothing less.
          </p>
        </AnimatedItem>
      </div>
    </section>
  );
};

export default ProblemSection;
