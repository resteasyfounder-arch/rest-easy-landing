import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import { Map, ChevronDown, ChevronUp, ArrowRight, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoadmapItem, CompletedItem } from "@/types/assessment";

interface RoadmapCardProps {
  items: RoadmapItem[];
  completedItems: CompletedItem[];
  isLoading?: boolean;
  className?: string;
  onViewAll?: () => void;
  onEditQuestion?: (item: RoadmapItem) => void;
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
  item,
  onNavigate,
  isNew,
}: {
  item: RoadmapItem;
  onNavigate: () => void;
  isNew?: boolean;
}) {
  return (
    <div 
      className={cn(
        "flex items-center justify-between py-2.5 px-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all group",
        isNew && "animate-fade-in"
      )}
    >
      <button
        onClick={onNavigate}
        className="flex items-center gap-3 min-w-0 flex-1 text-left"
      >
        <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30 flex-shrink-0 group-hover:border-primary transition-colors" />
        <div className="min-w-0 flex-1">
          <span className="text-sm font-medium text-foreground line-clamp-2">
            {item.question_text}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground truncate">
              {item.section_label}
            </span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Currently: {item.current_answer_label}
            </span>
          </div>
        </div>
      </button>
      <Button
        size="sm"
        variant="ghost"
        className="text-primary h-8 gap-1 flex-shrink-0 ml-2"
        onClick={onNavigate}
      >
        Improve
        <ArrowRight className="h-3 w-3" />
      </Button>
    </div>
  );
}

function CompletedActionItem({ item, isNew }: { item: CompletedItem; isNew?: boolean }) {
  return (
    <div 
      className={cn(
        "flex items-center gap-3 py-2.5 px-3 rounded-lg bg-muted/20 transition-all",
        isNew && "animate-scale-in"
      )}
    >
      <CheckCircle2 className={cn(
        "h-4 w-4 text-primary flex-shrink-0",
        isNew && "animate-[pulse_0.5s_ease-in-out]"
      )} />
      <div className="min-w-0 flex-1">
        <span className="text-sm text-muted-foreground line-through line-clamp-1">
          {item.question_text}
        </span>
        <span className="text-xs text-muted-foreground/70 block truncate">
          {item.section_label}
        </span>
      </div>
    </div>
  );
}


export function RoadmapCard({
  items,
  completedItems,
  isLoading = false,
  onViewAll,
  onEditQuestion,
  className,
}: RoadmapCardProps) {
  const navigate = useNavigate();
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
  
  // Track previous items for animation detection
  const prevItemsRef = useRef<Set<string>>(new Set());
  const prevCompletedRef = useRef<Set<string>>(new Set());
  const [newItems, setNewItems] = useState<Set<string>>(new Set());
  const [newCompleted, setNewCompleted] = useState<Set<string>>(new Set());
  
  // Detect changes to items for animations
  useEffect(() => {
    const currentItemIds = new Set(items.map(i => i.question_id));
    const currentCompletedIds = new Set(completedItems.map(i => i.question_id));
    
    // Find newly completed items (were in items, now in completed)
    const justCompleted = new Set<string>();
    prevItemsRef.current.forEach(id => {
      if (currentCompletedIds.has(id) && !prevCompletedRef.current.has(id)) {
        justCompleted.add(id);
      }
    });
    
    // Find new items that appeared
    const justAdded = new Set<string>();
    currentItemIds.forEach(id => {
      if (!prevItemsRef.current.has(id)) {
        justAdded.add(id);
      }
    });
    
    if (justCompleted.size > 0) {
      setNewCompleted(justCompleted);
      // Clear animation state after animation completes
      setTimeout(() => setNewCompleted(new Set()), 600);
    }
    
    if (justAdded.size > 0) {
      setNewItems(justAdded);
      setTimeout(() => setNewItems(new Set()), 600);
    }
    
    prevItemsRef.current = currentItemIds;
    prevCompletedRef.current = currentCompletedIds;
  }, [items, completedItems]);

  const totalItems = items.length + completedItems.length;
  const completedCount = completedItems.length;
  const remainingCount = items.length;
  const progressPercent = totalItems > 0 
    ? Math.round((completedCount / totalItems) * 100) 
    : 0;

  // Filter items by priority
  const filteredItems = items.filter((item) => {
    if (priorityFilter !== "all" && item.priority !== priorityFilter) {
      return false;
    }
    return true;
  });

  // Group by priority
  const groupedItems = {
    HIGH: filteredItems.filter((a) => a.priority === "HIGH"),
    MEDIUM: filteredItems.filter((a) => a.priority === "MEDIUM"),
    LOW: filteredItems.filter((a) => a.priority === "LOW"),
  };

  const toggleExpanded = (priority: string) => {
    setExpandedPriority((prev) => ({ ...prev, [priority]: !prev[priority] }));
  };

  const showMore = (priority: string) => {
    setShowMoreCounts((prev) => ({ ...prev, [priority]: prev[priority] + 5 }));
  };

  const handleNavigateToQuestion = (item: RoadmapItem) => {
    // If onEditQuestion is provided, open the modal instead of navigating
    if (onEditQuestion) {
      onEditQuestion(item);
    } else {
      // Fallback: Navigate to the readiness page
      navigate(`/readiness?section=${item.section_id}&question=${item.question_id}&returnTo=dashboard`);
    }
  };

  const renderPrioritySection = (priority: "HIGH" | "MEDIUM" | "LOW") => {
    const sectionItems = groupedItems[priority];
    if (sectionItems.length === 0) return null;

    const config = priorityConfig[priority];
    const isExpanded = expandedPriority[priority];
    const showCount = showMoreCounts[priority];
    const displayedItems = sectionItems.slice(0, showCount);
    const hasMore = sectionItems.length > showCount;

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
          <span className="text-xs text-muted-foreground">({sectionItems.length})</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground ml-auto" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto" />
          )}
        </button>

        {isExpanded && (
          <div className="space-y-2 pl-4">
            {displayedItems.map((item) => (
              <RoadmapActionItem
                key={item.question_id}
                item={item}
                onNavigate={() => handleNavigateToQuestion(item)}
                isNew={newItems.has(item.question_id)}
              />
            ))}
            {hasMore && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground w-full"
                onClick={() => showMore(priority)}
              >
                Show {sectionItems.length - showCount} more
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className={cn("border-border/50 animate-pulse", className)}>
        <CardHeader className="pb-4">
          <div className="h-6 w-32 bg-muted rounded" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-12 w-full bg-muted rounded" />
          <div className="h-12 w-full bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

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
                {remainingCount} to improve, {completedCount} completed
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
        {/* Show remaining items */}
        {statusFilter !== "completed" && (
          <>
            {renderPrioritySection("HIGH")}
            {renderPrioritySection("MEDIUM")}
            {renderPrioritySection("LOW")}
          </>
        )}

        {/* Show completed items */}
        {statusFilter !== "remaining" && completedItems.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm text-primary">Completed</span>
              <span className="text-xs text-muted-foreground">({completedItems.length})</span>
            </div>
            <div className="space-y-2 pl-4">
              {completedItems.slice(0, 5).map((item) => (
                <CompletedActionItem 
                  key={item.question_id} 
                  item={item} 
                  isNew={newCompleted.has(item.question_id)}
                />
              ))}
              {completedItems.length > 5 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  + {completedItems.length - 5} more completed
                </p>
              )}
            </div>
          </div>
        )}

        {/* Empty states */}
        {statusFilter === "remaining" && filteredItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {items.length === 0 ? (
              <div className="space-y-2">
                <CheckCircle2 className="h-8 w-8 text-primary mx-auto" />
                <p className="text-sm font-medium text-foreground">All done!</p>
                <p className="text-xs">You've maximized your readiness score.</p>
              </div>
            ) : (
              <p className="text-sm">No items match your filter.</p>
            )}
          </div>
        )}

        {statusFilter === "completed" && completedItems.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No completed items yet. Keep going!</p>
          </div>
        )}

        {onViewAll && (
          <div className="pt-2 border-t border-border/50">
            <Button
              variant="ghost"
              className="w-full text-primary"
              onClick={onViewAll}
            >
              View Full Report
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default RoadmapCard;
