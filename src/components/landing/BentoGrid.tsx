import { MessageCircle, Compass, Target } from "lucide-react";
import BentoCard from "./BentoCard";
import QuestionFlowDemo from "./demos/QuestionFlowDemo";
import JourneyProgressDemo from "./demos/JourneyProgressDemo";
import RoadmapDemo from "./demos/RoadmapDemo";

const BentoGrid = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Question Flow Demo */}
      <BentoCard
        icon={MessageCircle}
        title="Thoughtful Assessment"
        subtitle="Gentle, one question at a time"
      >
        <QuestionFlowDemo />
      </BentoCard>

      {/* Journey Progress Demo */}
      <BentoCard
        icon={Compass}
        title="Track Your Progress"
        subtitle="See your journey unfold"
      >
        <JourneyProgressDemo />
      </BentoCard>

      {/* Roadmap Demo - spans full width on larger screens */}
      <BentoCard
        icon={Target}
        title="Clear Action Roadmap"
        subtitle="Know exactly what to do next"
        span="wide"
      >
        <RoadmapDemo />
      </BentoCard>
    </div>
  );
};

export default BentoGrid;
