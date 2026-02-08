import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppLayout from "@/components/layout/AppLayout";
import heartLogo from "@/assets/rest-easy-heart.png";

const About = () => {
  return (
    <AppLayout>
      <Header />
      <main className="min-h-[60vh]">
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <div className="flex items-center gap-4 mb-8">
              <img src={heartLogo} alt="" className="w-12 h-12" />
              <h1 className="font-display text-3xl lg:text-4xl font-semibold text-foreground">
                About Rest Easy
              </h1>
            </div>

            <div className="prose prose-lg max-w-none space-y-6">
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                Rest Easy was born from a simple truth: nobody wants to think about life's hardest
                moments, but everyone deserves to be prepared for them.
              </p>
              <p className="font-body text-muted-foreground leading-relaxed">
                We believe that life readiness isn't about fear — it's about love. It's about making
                sure the people you care about most are protected, informed, and never left guessing.
              </p>
              <p className="font-body text-muted-foreground leading-relaxed">
                Our platform guides families through a thoughtful, gentle process to organize what
                matters most — from important documents to digital accounts, from healthcare wishes
                to financial plans. With the help of Remy, your AI-powered guide, the journey feels
                less overwhelming and more empowering.
              </p>
              <p className="font-body text-muted-foreground leading-relaxed">
                Rest Easy is made with care for families everywhere. Because peace of mind is
                something every family deserves.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </AppLayout>
  );
};

export default About;
