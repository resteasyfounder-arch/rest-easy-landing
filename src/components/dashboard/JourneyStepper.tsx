import { useNavigate } from "react-router-dom";
import { CheckCircle2, Lock, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Step {
    id: string;
    title: string;
    status: "completed" | "in_progress" | "locked" | "available";
}

interface JourneyStepperProps {
    steps: Step[];
    currentStepId: string;
}

export const JourneyStepper = ({ steps, currentStepId }: JourneyStepperProps) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-1 py-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6 pl-4">
                Your Roadmap
            </h3>

            <div className="relative border-l border-border/50 ml-6 space-y-6">
                {steps.map((step, index) => {
                    const isCurrent = step.id === currentStepId;
                    const isCompleted = step.status === "completed";
                    const isLocked = step.status === "locked";

                    return (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative pl-8"
                        >
                            {/* Timeline Dot */}
                            <div className={cn(
                                "absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full transition-colors duration-300 ring-4 ring-background",
                                isCompleted ? "bg-primary" :
                                    isCurrent ? "bg-primary animate-pulse" :
                                        "bg-muted-foreground/30"
                            )} />

                            <button
                                disabled={isLocked}
                                onClick={() => !isLocked && navigate(`/readiness?section=${step.id}`)}
                                className={cn(
                                    "group flex items-center justify-between w-full text-left transition-all duration-200",
                                    isLocked ? "cursor-not-allowed opacity-50" : "hover:translate-x-1 cursor-pointer"
                                )}
                            >
                                <div className="space-y-0.5">
                                    <span className={cn(
                                        "block text-sm font-medium transition-colors",
                                        isCurrent ? "text-foreground font-semibold" :
                                            isCompleted ? "text-foreground/80 line-through decoration-primary/30" :
                                                "text-muted-foreground"
                                    )}>
                                        {step.title}
                                    </span>
                                </div>

                                {isCompleted && <CheckCircle2 className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />}
                                {isLocked && <Lock className="w-3 h-3 text-muted-foreground/50" />}
                            </button>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
