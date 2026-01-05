import { Sparkles, Camera, CheckCircle2, ArrowRight, FolderLock } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Sparkles,
    title: "Capture without commitment",
    description: "Effortlessly gather essential information at your own pace. Our intuitive platform provides helpful prompts, ensuring a low-pressure start."
  },
  {
    number: "02",
    icon: Camera,
    title: "Instant snapshot",
    description: "Receive an immediate, high-level overview of your information across key domains, offering quick insights into your current preparedness."
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Neutral reality check",
    description: "Gain an objective understanding of your readiness across legal, financial, and personal domains — presented as straightforward status."
  },
  {
    number: "04",
    icon: ArrowRight,
    title: "One clear next step",
    description: "Identify the single most impactful action to take next. We cut through complexity, providing just one actionable step at a time."
  },
  {
    number: "05",
    icon: FolderLock,
    title: "A place to store, never get lost",
    description: "Safely store all your critical information in one accessible location. Your data is preserved and easily retrievable when needed."
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-body text-sm font-semibold text-primary uppercase tracking-wider">How It Works</span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mt-4 mb-6 text-balance">
            Five simple steps to Life Readiness
          </h2>
          <p className="font-body text-lg text-muted-foreground leading-relaxed">
            Progress accumulates quietly and consistently as your preparedness improves.
          </p>
        </div>

        {/* Steps */}
        <div className="relative max-w-4xl mx-auto">
          {/* Connecting line */}
          <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-px bg-border hidden md:block" />

          {steps.map((step, index) => (
            <div 
              key={index}
              className={`relative flex flex-col md:flex-row gap-6 md:gap-12 mb-12 last:mb-0 ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              }`}
            >
              {/* Step number indicator */}
              <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-primary items-center justify-center z-10">
                <span className="font-display text-lg font-bold text-primary-foreground">{step.number}</span>
              </div>

              {/* Content */}
              <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-20 md:text-right' : 'md:pl-20'}`}>
                <div className={`bg-card p-6 lg:p-8 rounded-2xl shadow-card border border-border/50 hover:shadow-elevated transition-shadow ${
                  index % 2 === 0 ? 'md:ml-auto' : ''
                }`}>
                  <div className={`flex items-center gap-4 mb-4 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center shrink-0 md:hidden">
                      <step.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="md:hidden font-display text-sm font-bold text-primary">{step.number}</div>
                    <h3 className="font-display text-xl font-semibold text-foreground">{step.title}</h3>
                  </div>
                  <p className="font-body text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>

              {/* Empty space for alternating layout */}
              <div className="hidden md:block md:w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
