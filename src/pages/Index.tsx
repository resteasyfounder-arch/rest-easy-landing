import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { JourneySection } from "@/components/landing";
import Solution from "@/components/Solution";
import Footer from "@/components/Footer";
import AppLayout from "@/components/layout/AppLayout";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <AppLayout>
      <Header />
      <main>
        <Hero />
        <JourneySection />
        <Solution />
      </main>
      <Footer />
    </AppLayout>
  );
};

export default Index;
