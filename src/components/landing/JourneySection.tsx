import { MessageCircle, Compass, Sparkles, Target } from "lucide-react";
import JourneyStep from "./JourneyStep";
import QuestionFlowDemo from "./demos/QuestionFlowDemo";
import JourneyProgressDemo from "./demos/JourneyProgressDemo";
import ReportGenerationDemo from "./demos/ReportGenerationDemo";
import RoadmapDemo from "./demos/RoadmapDemo";
import { AnimatedItem } from "@/hooks/useScrollAnimation";

const journeySteps = [
  {
    step: 1,
    title: "Start with Thoughtful Questions",
    description:
      "Our gentle assessment guides you through one question at a time, covering everything from legal documents to digital accounts. No overwhelm, just clarity.",
    icon: MessageCircle,
    cardTitle: "Thoughtful Assessment",
    cardSubtitle: "Gentle, one question at a time",
    demo: <QuestionFlowDemo />,
  },
  {
    step: 2,
    title: "See Your Journey Unfold",
    description:
      "Track your progress across all life areas. Watch as each section completes, giving you a clear picture of where you stand and what's left to cover.",
    icon: Compass,
    cardTitle: "Track Your Progress",
    cardSubtitle: "See your journey unfold section by section",
    demo: <JourneyProgressDemo />,
  },
  {
    step: 3,
    title: "Receive Personalized Insights",
    description:
      "Our specialized assistant, Remy, analyzes your responses to generate a comprehensive readiness report. Understand your strengths, identify gaps, and get tailored recommendations.",
    icon: Sparkles,
    cardTitle: "Personalized Insights",
    cardSubtitle: "AI-powered report generation",
    demo: <ReportGenerationDemo />,
  },
  {
    step: 4,
    title: "Follow Your Action Roadmap",
    description:
      "Know exactly what to do next with a prioritized action plan. Check off tasks as you complete them, and watch your readiness score climb.",
    icon: Target,
    cardTitle: "Clear Action Roadmap",
    cardSubtitle: "Know exactly what to do next",
    demo: <RoadmapDemo />,
  },
];

const JourneySection = () => {
  return (
    <section id="journey" className="py-16 lg:py-24 relative">
      {/* Section Header */}
      <div className="container mx-auto px-4 lg:px-8 mb-12 lg:mb-16 text-center">
        <AnimatedItem animation="fade-up" delay={0}>
          <h2 className="font-display text-3xl lg:text-4xl xl:text-5xl font-semibold text-foreground mb-4">
            Your Path to Life Readiness
          </h2>
        </AnimatedItem>
        <AnimatedItem animation="fade-up" delay={100}>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            A simple four-step journey from uncertainty to complete peace of mind
          </p>
        </AnimatedItem>
      </div>

      {/* Journey Steps with connectors */}
      <div className="relative">
        {journeySteps.map((step, index) => (
          <JourneyStep
            key={step.step}
            {...step}
            reversed={index % 2 === 0}
            isLast={index === journeySteps.length - 1}
          />
        ))}
      </div>
    </section>
  );
};

export default JourneySection;
