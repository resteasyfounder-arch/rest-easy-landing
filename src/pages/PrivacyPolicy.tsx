import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppLayout from "@/components/layout/AppLayout";

const PrivacyPolicy = () => {
  return (
    <AppLayout>
      <Header />
      <main className="min-h-[60vh]">
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
            <h1 className="font-display text-3xl lg:text-4xl font-semibold text-foreground mb-2">
              Privacy Policy
            </h1>
            <p className="font-body text-sm text-muted-foreground mb-10">
              Last updated: February 2026
            </p>

            <div className="space-y-8 font-body text-muted-foreground leading-relaxed">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  1. Information We Collect
                </h2>
                <p>
                  We collect information you provide directly, such as your name, email address, and
                  assessment responses. We also collect usage data to improve your experience.
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  2. How We Use Your Information
                </h2>
                <p>
                  Your information is used to provide and improve Rest Easy's services, generate
                  personalized readiness reports, and communicate with you about your account.
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  3. Data Security
                </h2>
                <p>
                  We take the security of your data seriously. All sensitive information is encrypted
                  in transit and at rest. We use industry-standard security measures to protect your
                  personal information.
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  4. Data Sharing
                </h2>
                <p>
                  We do not sell your personal information. We only share data with trusted service
                  providers necessary to operate our platform, and only as required by law.
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  5. Your Rights
                </h2>
                <p>
                  You have the right to access, correct, or delete your personal data at any time.
                  Contact us at the address below to exercise these rights.
                </p>
              </div>

              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                  6. Contact
                </h2>
                <p>
                  If you have questions about this Privacy Policy, please reach out through our{" "}
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

export default PrivacyPolicy;
