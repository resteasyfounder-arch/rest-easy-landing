import { FormEvent, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import logo from "@/assets/rest-easy-logo.png";

type AuthMode = "sign-in" | "sign-up";
const MIN_PASSWORD_LENGTH = 10;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signUp, isLoading } = useAuth();

  const from = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from || "/dashboard";
  }, [location.state]);

  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    if (mode === "sign-up") {
      if (!fullName.trim()) {
        setError("Please enter your name.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
        return;
      }
    }

    setSubmitting(true);
    try {
      if (mode === "sign-in") {
        await login(email.trim(), password);
        navigate(from, { replace: true });
      } else {
        const result = await signUp(email.trim(), password, fullName.trim());
        if (result.requiresEmailVerification) {
          setMode("sign-in");
          setError("Check your email to verify your account, then sign in.");
          return;
        }
        navigate(from, { replace: true });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to authenticate.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout hideNav>
      <div className="min-h-screen flex flex-col">
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
            <div className="text-center">
              <img src={logo} alt="Rest Easy" className="h-16 mx-auto mb-6" />
              <h1 className="font-display text-3xl font-bold text-foreground">
                {mode === "sign-in" ? "Welcome Back" : "Create Your Account"}
              </h1>
              <p className="mt-2 text-muted-foreground font-body">
                {mode === "sign-in"
                  ? "Sign in to continue your readiness journey."
                  : "Set up your secure Rest Easy account."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
              <Button
                type="button"
                variant={mode === "sign-in" ? "default" : "ghost"}
                className="w-full"
                onClick={() => {
                  setMode("sign-in");
                  setError(null);
                }}
                disabled={submitting || isLoading}
              >
                Sign In
              </Button>
              <Button
                type="button"
                variant={mode === "sign-up" ? "default" : "ghost"}
                className="w-full"
                onClick={() => {
                  setMode("sign-up");
                  setError(null);
                }}
                disabled={submitting || isLoading}
              >
                Sign Up
              </Button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === "sign-up" && (
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Murray"
                    autoComplete="name"
                    disabled={submitting || isLoading}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={submitting || isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                  disabled={submitting || isLoading}
                />
              </div>

              {mode === "sign-up" && (
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    disabled={submitting || isLoading}
                  />
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive font-body">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full font-body font-medium press-effect"
                size="lg"
                disabled={submitting || isLoading}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {mode === "sign-in" ? "Signing In..." : "Creating Account..."}
                  </>
                ) : mode === "sign-in" ? (
                  "Sign In"
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>

            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="w-full font-body"
              disabled={submitting || isLoading}
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
