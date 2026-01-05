import { Search, Activity, ArrowRight } from "lucide-react";

const scores = [
  {
    icon: Search,
    title: "Findability Score",
    question: "Can the right people find and act quickly?",
    time: "~2 minutes",
    focus: "Measures execution under stress — access and clarity in emergencies",
    cta: "If something unexpected happened tomorrow, could the right people find what they need?"
  },
  {
    icon: Activity,
    title: "Life Readiness Score",
    question: "Is your life actually ready beyond just finding things?",
    time: "20-40 minutes (incremental)",
    focus: "Measures sustained preparedness — roles defined, documents in place, gaps prioritized",
    cta: "Life changes. Your readiness should keep up."
  },
];

const Solution = () => {
  return (
    <section id="solution" className="py-20 lg:py-32 bg-secondary/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-body text-sm font-semibold text-primary uppercase tracking-wider">Our Solution</span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mt-4 mb-6 text-balance">
            Two Scores. Two Moments. One System.
          </h2>
          <p className="font-body text-lg text-muted-foreground leading-relaxed">
            Rest Easy uses two complementary scores to guide you from immediate action to sustained preparedness.
          </p>
        </div>

        {/* Score Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {scores.map((score, index) => (
            <div 
              key={index}
              className="bg-card p-8 lg:p-10 rounded-3xl shadow-card border border-border/50 hover:shadow-elevated transition-all group"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-sage flex items-center justify-center shrink-0">
                  <score.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display text-2xl font-semibold text-foreground">{score.title}</h3>
                  <p className="font-body text-sm text-muted-foreground mt-1">{score.time}</p>
                </div>
              </div>

              <p className="font-display text-xl text-primary mb-4 italic">"{score.question}"</p>
              
              <p className="font-body text-muted-foreground mb-6 leading-relaxed">{score.focus}</p>

              <div className="p-4 bg-secondary rounded-xl">
                <p className="font-body text-sm text-secondary-foreground">
                  <span className="font-semibold">Ask yourself:</span> {score.cta}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* How they work together */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 p-6 bg-card rounded-2xl shadow-soft border border-border/50">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              <span className="font-body font-medium text-foreground">Findability</span>
            </div>
            <ArrowRight className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <span className="font-body font-medium text-foreground">Life Readiness</span>
            </div>
          </div>
          <p className="font-body text-muted-foreground mt-4">
            Findability gets you in the door. Life Readiness keeps things working over time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Solution;
