import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Map, Circle, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActionItem } from "@/types/report";

interface RoadmapCardProps {
  actions: ActionItem[];
  completedCount?: number;
  onActionStart?: (action: ActionItem) => void;
  onViewAll?: () => void;
  className?: string;
}

type PriorityFilter = "all" | "HIGH" | "MEDIUM" | "LOW";
type StatusFilter = "remaining" | "completed" | "all";

const priorityConfig = {
  HIGH: {
    dot: "bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    label: "High Priority",
  },
  MEDIUM: {
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    label: "Medium Priority",
  },
  LOW: {
    dot: "bg-slate-400",
    text: "text-slate-600 dark:text-slate-400",
    label: "Low Priority",
  },
};

function RoadmapActionItem({
  action,
  onStart,
}: {
  action: ActionItem;
  onStart?: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <span className="text-sm font-medium text-foreground truncate">
          {action.title}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <Badge variant="outline" className="text-xs hidden sm:inline-flex">
          {action.timeline}
        </Badge>
        {onStart && (
          <Button
            size="sm"
            variant="ghost"
            className="text-primary h-7 gap-1"
            onClick={onStart}
          >
            Start
            <ExternalLink className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

export function RoadmapCard({
  actions,
  completedCount = 0,
  onActionStart,
  onViewAll,
  className,
}: RoadmapCardProps) {
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("remaining");
  const [expandedPriority, setExpandedPriority] = useState<Record<string, boolean>>({
    HIGH: true,
    MEDIUM: true,
    LOW: false,
  });
  const [showMoreCounts, setShowMoreCounts] = useState<Record<string, number>>({
    HIGH: 3,
    MEDIUM: 3,
    LOW: 3,
  });

  const totalActions = actions.length;
  const remainingCount = totalActions - completedCount;
  const progressPercent = totalActions > 0 
    ? Math.round((completedCount / totalActions) * 100) 
    : 0;

  // Filter actions
  const filteredActions = actions.filter((action) => {
    if (priorityFilter !== "all" && action.priority !== priorityFilter) {
      return false;
    }
    return true;
  });

  // Group by priority
  const groupedActions = {
    HIGH: filteredActions.filter((a) => a.priority === "HIGH"),
    MEDIUM: filteredActions.filter((a) => a.priority === "MEDIUM"),
    LOW: filteredActions.filter((a) => a.priority === "LOW"),
  };

  const toggleExpanded = (priority: string) => {
    setExpandedPriority((prev) => ({ ...prev, [priority]: !prev[priority] }));
  };

  const showMore = (priority: string) => {
    setShowMoreCounts((prev) => ({ ...prev, [priority]: prev[priority] + 5 }));
  };

  const renderPrioritySection = (priority: "HIGH" | "MEDIUM" | "LOW") => {
    const items = groupedActions[priority];
    if (items.length === 0) return null;

    const config = priorityConfig[priority];
    const isExpanded = expandedPriority[priority];
    const showCount = showMoreCounts[priority];
    const displayedItems = items.slice(0, showCount);
    const hasMore = items.length > showCount;

    return (
      <div key={priority}>
        <button
          onClick={() => toggleExpanded(priority)}
          className="flex items-center gap-2 mb-3 w-full text-left hover:opacity-80 transition-opacity"
        >
          <div className={cn("h-2 w-2 rounded-full", config.dot)} />
          <span className={cn("font-medium text-sm", config.text)}>
            {config.label}
          </span>
          <span className="text-xs text-muted-foreground">({items.length})</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground ml-auto" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
          )}
        </button>

        {isExpanded && (
          <div className="space-y-2 pl-4">
            {displayedItems.map((action, index) => (
              <RoadmapActionItem
                key={`${action.title}-${index}`}
                action={action}
                onStart={onActionStart ? () => onActionStart(action) : undefined}
              />
            ))}
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground w-full"
                onClick={() => showMore(priority)}
              >
                Show {items.length - showCount} more
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className={cn("border-border/50", className)}>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Map className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="font-display text-lg">Your Roadmap</CardTitle>
              <p className="text-sm text-muted-foreground">
                {remainingCount} remaining, {completedCount} completed
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <Select
              value={priorityFilter}
              onValueChange={(v) => setPriorityFilter(v as PriorityFilter)}
            >
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue placeholder="By Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <SelectTrigger className="w-[110px] h-8 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="remaining">Remaining</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-foreground">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {renderPrioritySection("HIGH")}
        {renderPrioritySection("MEDIUM")}
        {renderPrioritySection("LOW")}

        {filteredActions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No actions found matching your filters.</p>
          </div>
        )}

        {onViewAll && (
          <div className="pt-2 border-t border-border/50">
            <Button
              variant="ghost"
              className="w-full text-primary"
              onClick={onViewAll}
            >
              View Full Action Plan
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RoadmapCard;
