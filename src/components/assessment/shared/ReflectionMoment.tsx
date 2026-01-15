import { cn } from "@/lib/utils";

interface ReflectionMomentProps {
  message: string;
  show: boolean;
  className?: string;
}

const ReflectionMoment = ({ message, show, className }: ReflectionMomentProps) => {
  if (!show) return null;

  return (
    <div
      className={cn(
        "py-4 animate-fade-up",
        className
      )}
    >
      <p className="text-center text-base font-body text-muted-foreground italic leading-relaxed">
        "{message}"
      </p>
    </div>
  );
};

export default ReflectionMoment;
