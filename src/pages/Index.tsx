import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Solution from "@/components/Solution";
import Footer from "@/components/Footer";
import AppLayout from "@/components/layout/AppLayout";

const Index = () => {
  return (
    <AppLayout>
      <Header />
      <main>
        <Hero />
        <Solution />
      </main>
      <Footer />
    </AppLayout>
  );
};

export default Index;
