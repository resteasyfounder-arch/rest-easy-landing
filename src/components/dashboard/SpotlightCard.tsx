import { useNavigate } from "react-router-dom";
import { Play, ArrowRight, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface SpotlightCardProps {
    title: string;
    description: string;
    progress: number;
    sectionId: string;
    isLocked?: boolean;
}

export const SpotlightCard = ({
    title,
    description,
    progress,
    sectionId,
    isLocked
}: SpotlightCardProps) => {
    const navigate = useNavigate();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="group relative overflow-hidden rounded-3xl bg-white/40 backdrop-blur-md border border-white/60 shadow-xl"
        >
            {/* Dynamic Ambient Glow */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-primary/10 to-transparent blur-3xl rounded-full translate-x-1/3 -translate-y-1/3 group-hover:bg-primary/20 transition-colors duration-700" />

            <div className="relative z-10 p-8 md:p-12 flex flex-col items-start gap-8">

                {/* Kicker */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-soft">
                        <Target className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary/80">
                        Current Focus
                    </span>
                </div>

                {/* Content */}
                <div className="space-y-4 max-w-xl">
                    <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.0] tracking-tight">
                        {title}
                    </h2>
                    <p className="text-xl text-muted-foreground font-body leading-relaxed text-balance">
                        {description}
                    </p>
                </div>

                {/* Action Area */}
                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-6 mt-4">
                    <Button
                        size="lg"
                        className="flex-1 sm:flex-none h-14 px-8 text-lg rounded-full shadow-elevated hover:scale-[1.02] transition-transform"
                        onClick={() => navigate(`/readiness?section=${sectionId}`)}
                    >
                        Resume Journey <Play className="ml-2 h-5 w-5 fill-current" />
                    </Button>

                    {/* Minimal Progress Value */}
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-24 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                                className="h-full bg-primary"
                            />
                        </div>
                        <span className="text-sm font-medium text-muted-foreground tabular-nums">
                            {Math.round(progress)}%
                        </span>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};
