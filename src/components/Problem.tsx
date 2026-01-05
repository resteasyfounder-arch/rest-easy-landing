import { FileQuestion, MapPin, Zap } from "lucide-react";

const stats = [
  { value: "76%", label: "Americans without any estate planning documents" },
  { value: "212+", label: "Hours lost settling affairs per death by families" },
  { value: "30M", label: "Boomers projected to pass in the next 10-15 years" },
];

const challenges = [
  {
    icon: FileQuestion,
    title: "Exploding Digital Footprint",
    description: "The sheer volume of digital accounts, passwords, and fragmented information has led to unprecedented cognitive overload."
  },
  {
    icon: MapPin,
    title: "Increased Family Distribution",
    description: "Modern families are geographically dispersed, intensifying the challenge of coordinating affairs across diverse households."
  },
  {
    icon: Zap,
    title: "Rapid Pace of Change",
    description: "Constant technological and regulatory changes make it difficult to maintain a current view of one's life affairs."
  },
];

const Problem = () => {
  return (
    <section id="problem" className="py-20 lg:py-32 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-body text-sm font-semibold text-primary uppercase tracking-wider">The Challenge</span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-foreground mt-4 mb-6 text-balance">
            This isn't a motivation problem. It's an ambiguity problem.
          </h2>
          <p className="font-body text-lg text-muted-foreground leading-relaxed">
            Most people aren't uninformed; they're overloaded. Nothing feels clearly started or clearly done, leaving vital information scattered and decisions partial.
          </p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-6 mb-20">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-card p-8 rounded-2xl shadow-card text-center border border-border/50 hover:shadow-elevated transition-shadow"
            >
              <p className="font-display text-4xl lg:text-5xl font-bold text-primary mb-3">{stat.value}</p>
              <p className="font-body text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Challenges */}
        <div className="grid md:grid-cols-3 gap-8">
          {challenges.map((challenge, index) => (
            <div 
              key={index}
              className="group p-8 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <challenge.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-3">{challenge.title}</h3>
              <p className="font-body text-muted-foreground leading-relaxed">{challenge.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom message */}
        <div className="mt-16 text-center">
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto italic">
            "Families don't struggle because someone didn't care. They struggle because the pathway to Life Readiness was unclear."
          </p>
        </div>
      </div>
    </section>
  );
};

export default Problem;
