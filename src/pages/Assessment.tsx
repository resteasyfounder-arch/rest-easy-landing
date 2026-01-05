import AssessmentWizard from "@/components/assessment/AssessmentWizard";
import WizardStep from "@/components/assessment/WizardStep";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Assessment = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate("/results");
  };

  return (
    <AssessmentWizard title="Findability Score" onComplete={handleComplete}>
      <WizardStep
        title="Welcome to the Assessment"
        description="We'll ask you a few questions to help determine your family's life readiness score."
      >
        <div className="space-y-4">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="font-body text-sm text-muted-foreground">
              This assessment takes approximately 5-10 minutes to complete. Your answers are confidential and help us provide personalized recommendations.
            </p>
          </div>
        </div>
      </WizardStep>

      <WizardStep
        title="How organized are your important documents?"
        description="Think about birth certificates, wills, insurance policies, etc."
      >
        <div className="space-y-3">
          {[
            "Everything is organized and easy to find",
            "Mostly organized with some scattered items",
            "Somewhat disorganized",
            "Very disorganized or don't know where things are",
          ].map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full h-auto py-4 px-4 justify-start text-left font-body press-effect"
            >
              {option}
            </Button>
          ))}
        </div>
      </WizardStep>

      <WizardStep
        title="Do your family members know how to access important accounts?"
        description="Consider banking, utilities, subscriptions, and digital accounts."
      >
        <div className="space-y-3">
          {[
            "Yes, everything is documented and shared",
            "Some information is shared, but not complete",
            "Very little is shared",
            "No, they wouldn't know where to start",
          ].map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full h-auto py-4 px-4 justify-start text-left font-body press-effect"
            >
              {option}
            </Button>
          ))}
        </div>
      </WizardStep>

      <WizardStep
        title="You're all set!"
        description="Based on your answers, we'll generate your personalized Findability Score."
      >
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
            <span className="text-3xl">🎉</span>
          </div>
          <p className="font-body text-muted-foreground max-w-xs">
            Click "Complete" below to see your results and get personalized recommendations.
          </p>
        </div>
      </WizardStep>
    </AssessmentWizard>
  );
};

export default Assessment;
