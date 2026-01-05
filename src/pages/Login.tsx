import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Mail, Lock, Chrome } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import logo from "@/assets/rest-easy-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder - no actual auth yet
    console.log("Auth placeholder:", { email, password, isSignUp });
  };

  return (
    <AppLayout hideBottomNav>
      <div className="min-h-screen flex flex-col">
        {/* Mobile Back Button */}
        <div className="md:hidden p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md space-y-8">
            {/* Logo */}
            <div className="text-center">
              <img src={logo} alt="Rest Easy" className="h-16 mx-auto mb-6" />
              <h1 className="font-display text-3xl font-bold text-foreground">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h1>
              <p className="mt-2 text-muted-foreground font-body">
                {isSignUp
                  ? "Start your journey to peace of mind"
                  : "Sign in to continue your journey"}
              </p>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-body">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 font-body"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-body">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 font-body"
                  />
                </div>
              </div>

              {!isSignUp && (
                <div className="text-right">
                  <button
                    type="button"
                    className="text-sm text-primary hover:underline font-body"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                className="w-full font-body font-medium press-effect"
                size="lg"
              >
                {isSignUp ? "Create Account" : "Sign In"}
              </Button>
            </form>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-4 text-xs text-muted-foreground font-body">
                or continue with
              </span>
            </div>

            {/* Social Login Placeholders */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="font-body gap-2" disabled>
                <Chrome className="h-4 w-4" />
                Google
              </Button>
              <Button variant="outline" className="font-body gap-2" disabled>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                </svg>
                Apple
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground font-body">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-primary hover:underline font-medium"
              >
                {isSignUp ? "Sign in" : "Create one"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Login;
