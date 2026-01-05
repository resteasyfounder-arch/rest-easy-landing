import { useNavigate } from "react-router-dom";
import { ArrowRight, Bookmark, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ResultsCTAProps {
  onRetake?: () => void;
}

const ResultsCTA = ({ onRetake }: ResultsCTAProps) => {
  const navigate = useNavigate();

  const handleStartMission = () => {
    navigate("/login");
  };

  const handleSaveForLater = () => {
    // Results are already saved in localStorage
    navigate("/");
  };

  const handleRetake = () => {
    if (onRetake) {
      onRetake();
    } else {
      navigate("/assessment");
    }
  };

  return (
    <div className="space-y-3 pt-4">
      {/* Primary CTA */}
      <Button
        size="lg"
        onClick={handleStartMission}
        className="w-full font-body font-medium press-effect gap-2 h-12"
      >
        Start My First Rescue Mission
        <ArrowRight className="h-4 w-4" />
      </Button>

      {/* Secondary CTAs */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={handleSaveForLater}
          className="w-full font-body gap-2"
        >
          <Bookmark className="h-4 w-4" />
          Save & Exit
        </Button>
        <Button
          variant="ghost"
          size="lg"
          onClick={handleRetake}
          className="w-full font-body gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Retake
        </Button>
      </div>
    </div>
  );
};

export default ResultsCTA;
