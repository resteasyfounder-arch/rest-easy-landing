import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";
import Header from "@/components/Header";

const Results = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <Header />
      <div className="pt-20 px-4 pb-8">
        <div className="max-w-lg mx-auto text-center py-12">
          <h1 className="text-3xl font-display font-semibold text-foreground mb-4">
            Your Results
          </h1>
          <p className="text-muted-foreground font-body mb-8">
            Results dashboard coming soon. Complete an assessment to see your personalized recommendations.
          </p>
          <Button onClick={() => navigate("/assessment")} className="press-effect">
            Take Assessment
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default Results;
