import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppLayout from "@/components/layout/AppLayout";

const TermsOfService = () => {
  return (
    <AppLayout>
      <Header />
      <main className="min-h-[60vh]">
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h1 className="font-display text-3xl lg:text-4xl font-semibold text-foreground mb-2">
              Terms of Service
            </h1>
            <p className="font-body text-sm text-muted-foreground mb-10">
              Last updated: February 2026
            </p>

            <div className="space-y-8 font-body text-muted-foreground leading-relaxed">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  1. Acceptance of Terms
                </h2>
                <p>
                  By accessing or using Rest Easy, you agree to be bound by these Terms of Service.
                  If you do not agree, please do not use the platform.
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  2. Description of Service
                </h2>
                <p>
                  Rest Easy provides a life readiness platform that helps families organize important
                  information, assess their preparedness, and create action plans. The service
                  includes AI-powered guidance through our assistant, Remy.
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  3. User Accounts
                </h2>
                <p>
                  You are responsible for maintaining the confidentiality of your account credentials
                  and for all activities that occur under your account.
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  4. Acceptable Use
                </h2>
                <p>
                  You agree to use Rest Easy only for lawful purposes and in accordance with these
                  terms. You may not misuse the platform or attempt to access it through unauthorized
                  means.
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  5. Limitation of Liability
                </h2>
                <p>
                  Rest Easy provides general guidance and organizational tools. It does not
                  constitute legal, financial, or medical advice. We are not liable for decisions
                  made based on information provided through the platform.
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  6. Changes to Terms
                </h2>
                <p>
                  We may update these Terms from time to time. Continued use of Rest Easy after
                  changes constitutes acceptance of the updated terms.
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  7. Contact
                </h2>
                <p>
                  Questions about these Terms? Reach out through our{" "}
                  <a href="/contact" className="text-primary hover:underline">
                    Contact page
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </AppLayout>
  );
};

export default TermsOfService;
