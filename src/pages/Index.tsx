import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { JourneySection, ProblemSection, RemySection } from "@/components/landing";
import Solution from "@/components/Solution";
import Footer from "@/components/Footer";
import AppLayout from "@/components/layout/AppLayout";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <AppLayout>
      <Header />
      <main className="bg-gradient-hero">
        <Hero />
        <ProblemSection />
        <Solution />
        <JourneySection />
        <RemySection />
      </main>
      <Footer />
    </AppLayout>
  );
};

export default Index;
