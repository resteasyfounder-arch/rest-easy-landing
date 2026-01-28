import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RoadmapRowProps {
    title: string;
    description: string;
    status: "locked" | "available" | "completed" | "in_progress";
    onClick?: () => void;
    className?: string;
}

export const RoadmapRow = ({
    title,
    description,
    status,
    onClick,
    className,
}: RoadmapRowProps) => {
    const isLocked = status === "locked";
    const isCompleted = status === "completed";
    const isInProgress = status === "in_progress";

    return (
        <div
            onClick={!isLocked ? onClick : undefined}
            className={cn(
                "group flex items-center gap-4 py-4 px-4 -mx-4 rounded-lg transition-all",
                !isLocked && "hover:bg-secondary/50 cursor-pointer",
                isLocked && "opacity-60 cursor-not-allowed",
                className
            )}
        >
            {/* Icon State */}
            <div className="flex-shrink-0">
                {isCompleted ? (
                    <CheckCircle2 className="h-6 w-6 text-primary animate-in zoom-in duration-300" />
                ) : isLocked ? (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                ) : (
                    <Circle className={cn(
                        "h-5 w-5 text-muted-foreground",
                        isInProgress && "text-primary border-2 border-primary rounded-full"
                    )} />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className={cn(
                        "font-medium text-base",
                        isCompleted ? "text-muted-foreground line-through decoration-border" : "text-foreground"
                    )}>
                        {title}
                    </h3>
                    {isInProgress && (
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            In Progress
                        </span>
                    )}
                </div>
                <p className="text-sm text-muted-foreground truncate max-w-lg">
                    {description}
                </p>
            </div>

            {/* Action Arrow (only if interactive) */}
            {!isLocked && !isCompleted && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {/* Undo/Review Action for Completed */}
            {isCompleted && (
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-muted-foreground font-medium hover:text-primary">Review</span>
                </div>
            )}
        </div>
    );
};
