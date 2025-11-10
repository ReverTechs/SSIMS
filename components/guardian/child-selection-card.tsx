"use client";

import { ChevronRight, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Child {
  id: string;
  name: string;
  class: string;
  studentId: string;
  averageGrade?: number;
  grade?: string;
}

interface ChildSelectionCardProps {
  child: Child;
  onClick: () => void;
  isSelected?: boolean;
}

export function ChildSelectionCard({ child, onClick, isSelected }: ChildSelectionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full rounded-lg p-4 text-left transition-all duration-200",
        // Use theme colors - match system theme, grey only on hover
        "bg-card hover:bg-[#2D2D2D]",
        "border border-border hover:border-[#404040]",
        "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-background",
        isSelected && "ring-2 ring-primary/30 bg-[#2D2D2D]"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className="flex-shrink-0">
          <div className="p-2 rounded-md bg-muted group-hover:bg-[#404040] transition-colors">
            <User className="h-6 w-6 text-foreground" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-base font-medium text-foreground mb-1 truncate">
            {child.name}
          </h3>
          
          {/* Subtitle */}
          <p className="text-sm text-muted-foreground truncate">
            {child.class}
            {child.averageGrade !== undefined && (
              <span className="ml-2">
                • Average: {child.averageGrade.toFixed(1)}% {child.grade && `(${child.grade})`}
              </span>
            )}
          </p>
        </div>

        {/* Chevron */}
        <div className="flex-shrink-0">
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </div>
    </button>
  );
}

