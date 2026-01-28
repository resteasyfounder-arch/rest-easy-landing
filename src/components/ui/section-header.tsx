import { cn } from "@/lib/utils";

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    kicker?: string;
    align?: "left" | "center";
    className?: string;
    action?: React.ReactNode;
}

export function SectionHeader({
    title,
    subtitle,
    kicker,
    align = "left",
    className,
    action
}: SectionHeaderProps) {
    return (
        <div className={cn(
            "space-y-4 mb-8 md:mb-12 border-b border-border/40 pb-6",
            align === "center" ? "text-center mx-auto max-w-2xl" : "text-left",
            className
        )}>
            {/* Editorial Kicker */}
            {kicker && (
                <span className="inline-block text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-primary/80 mb-1 animate-fade-in">
                    {kicker}
                </span>
            )}

            <div className="flex items-end justify-between gap-4">
                <div className="space-y-2">
                    <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
                        {title}
                    </h2>

                    {subtitle && (
                        <p className="text-lg md:text-xl text-muted-foreground font-body leading-relaxed max-w-2xl text-balance">
                            {subtitle}
                        </p>
                    )}
                </div>

                {action && (
                    <div className="hidden sm:block pb-1">{action}</div>
                )}
            </div>
        </div>
    );
}
