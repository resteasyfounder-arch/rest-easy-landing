import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import logo from "@/assets/rest-easy-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = () => {
    login();
    navigate("/dashboard");
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
          <div className="w-full max-w-md space-y-8 text-center">
            {/* Logo */}
            <div>
              <img src={logo} alt="Rest Easy" className="h-16 mx-auto mb-6" />
              <h1 className="font-display text-3xl font-bold text-foreground">
                Welcome Back
              </h1>
              <p className="mt-2 text-muted-foreground font-body">
                Sign in to continue your journey
              </p>
            </div>

            {/* Simulated Login Button */}
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground font-body">
                Authentication coming soon. For now, click below to preview the logged-in experience.
              </p>
              <Button
                onClick={handleLogin}
                className="w-full font-body font-medium press-effect"
                size="lg"
              >
                Continue to Dashboard
              </Button>
            </div>

            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="font-body"
            >
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Login;
