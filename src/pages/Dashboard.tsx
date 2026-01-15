import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";
import { ClipboardList, TrendingUp, FileText, LogOut, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import AppLayout from "@/components/layout/AppLayout";

const Dashboard = () => {
  const { logout } = useAuth();

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Welcome Back
            </h1>
            <p className="text-muted-foreground font-body">
              Here's your findability overview
            </p>
          </div>
          <Button variant="outline" onClick={logout} className="gap-2">
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </div>

        {/* Score Card */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="font-display text-lg">Your Findability Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4">
              <span className="font-display text-5xl font-bold text-primary">87%</span>
              <span className="text-sm text-muted-foreground font-body pb-2">
                Great progress!
              </span>
            </div>
            <Progress value={87} className="mt-4 h-3" />
          </CardContent>
        </Card>

        {/* Quick Actions */}
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
    </AppLayout>
  );
};

export default Dashboard;
