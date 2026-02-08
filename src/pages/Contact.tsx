import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";

const Contact = () => {
  return (
    <AppLayout>
      <Header />
      <main className="min-h-[60vh]">
        <section className="py-16 lg:py-24">
          <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
            <div className="text-center mb-12">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-7 h-7 text-primary" />
              </div>
              <h1 className="font-display text-3xl lg:text-4xl font-semibold text-foreground mb-3">
                Contact Us
              </h1>
              <p className="font-body text-lg text-muted-foreground">
                Have a question or feedback? We'd love to hear from you.
              </p>
            </div>

            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                // Placeholder — no backend wired yet
              }}
            >
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="How can we help?" rows={6} />
              </div>
              <Button type="submit" size="lg" className="w-full sm:w-auto">
                Send Message
              </Button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </AppLayout>
  );
};

export default Contact;
