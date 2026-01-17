import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { useGuestProfile } from "@/hooks/useGuestProfile";
import { ClipboardList, TrendingUp, FileText, LogOut, Sparkles, UserCircle, CheckCircle2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

const Dashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { completedCount, totalQuestions, isComplete: isProfileComplete } = useGuestProfile();

  const profileProgress = Math.round((completedCount / totalQuestions) * 100);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Welcome Back
            </h1>
            <p className="text-muted-foreground font-body">
              Here's your progress overview
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </div>

        {/* Progress Overview Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Profile Completeness */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-2">
                <span className="font-display text-2xl font-bold text-foreground">
                  {completedCount}/{totalQuestions}
                </span>
                {isProfileComplete && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
              </div>
              <Progress value={profileProgress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {isProfileComplete ? "Complete" : "Questions answered"}
              </p>
            </CardContent>
          </Card>

          {/* Findability Score */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Findability Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-2">
                <span className="font-display text-2xl font-bold text-primary">
                  --
                </span>
              </div>
              <Progress value={0} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Complete assessment to see score
              </p>
            </CardContent>
          </Card>

          {/* Life Readiness */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="font-display text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Life Readiness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between mb-2">
                <span className="font-display text-2xl font-bold text-foreground">
                  --
                </span>
              </div>
              <Progress value={0} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                Complete profile to unlock
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="font-display text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ClipboardList className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold">Take Assessment</h3>
                <p className="text-sm text-muted-foreground font-body">
                  Update your findability score
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/assessment">Start</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold">Life Readiness</h3>
                <p className="text-sm text-muted-foreground font-body">
                  Complete your full readiness assessment
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/readiness">Start</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold">View Results</h3>
                <p className="text-sm text-muted-foreground font-body">
                  See detailed breakdown
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/results">View</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-semibold">Resources</h3>
                <p className="text-sm text-muted-foreground font-body">
                  Tips to improve your score
                </p>
                <Button variant="outline" size="sm" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
