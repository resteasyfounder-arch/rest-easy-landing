import { Scale, Wallet, Heart, Key, Users } from "lucide-react";

interface LifeAreaIcon {
  icon: React.ElementType;
  label: string;
  angle: number;
  delay: number;
}

const lifeAreaIcons: LifeAreaIcon[] = [
  { icon: Scale, label: "Legal", angle: -90, delay: 0 },
  { icon: Heart, label: "Healthcare", angle: -18, delay: 0.5 },
  { icon: Users, label: "Family", angle: 54, delay: 1 },
  { icon: Wallet, label: "Financial", angle: 126, delay: 1.5 },
  { icon: Key, label: "Digital", angle: 198, delay: 2 },
];

interface FloatingIconsProps {
  children: React.ReactNode;
}

const FloatingIcons = ({ children }: FloatingIconsProps) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Orbital path - subtle ring */}
      <div className="absolute w-40 h-40 lg:w-56 lg:h-56 rounded-full border border-primary/10" />
      
      {/* Floating icons */}
      {lifeAreaIcons.map(({ icon: Icon, label, angle, delay }) => (
        <div
          key={label}
          className="absolute w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center animate-orbit-float motion-reduce:animate-none"
          style={{
            transform: `rotate(${angle}deg) translateX(80px) rotate(-${angle}deg)`,
            animationDelay: `${delay}s`,
            willChange: "transform",
          }}
          aria-hidden="true"
        >
          <div className="w-full h-full rounded-full bg-background shadow-soft flex items-center justify-center border border-border/50 animate-glow-pulse motion-reduce:animate-none" style={{ animationDelay: `${delay}s` }}>
            <Icon className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
          </div>
        </div>
      ))}
      
      {/* Larger orbit for desktop */}
      {lifeAreaIcons.map(({ icon: Icon, label, angle, delay }) => (
        <div
          key={`${label}-lg`}
          className="hidden lg:flex absolute w-10 h-10 items-center justify-center animate-orbit-float motion-reduce:animate-none"
          style={{
            transform: `rotate(${angle}deg) translateX(112px) rotate(-${angle}deg)`,
            animationDelay: `${delay}s`,
            willChange: "transform",
          }}
          aria-hidden="true"
        >
          <div className="w-full h-full rounded-full bg-background shadow-soft flex items-center justify-center border border-border/50 animate-glow-pulse motion-reduce:animate-none" style={{ animationDelay: `${delay}s` }}>
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      ))}
      
      {/* Hide mobile orbit on large screens to avoid duplicates */}
      <style>{`
        @media (min-width: 1024px) {
          .absolute.w-8:not(.hidden) {
            display: none;
          }
        }
      `}</style>
      
      {/* Center content (heart logo) */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default FloatingIcons;
