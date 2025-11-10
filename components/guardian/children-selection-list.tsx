"use client";

import { ChildSelectionCard } from "./child-selection-card";
import { Users } from "lucide-react";

interface Child {
  id: string;
  name: string;
  class: string;
  studentId: string;
  averageGrade?: number;
  grade?: string;
}

interface ChildrenSelectionListProps {
  children: Child[];
  selectedChildId?: string;
  onChildSelect: (childId: string) => void;
}

export function ChildrenSelectionList({
  children,
  selectedChildId,
  onChildSelect,
}: ChildrenSelectionListProps) {
  if (children.length === 0) {
    return (
      <div className="rounded-lg bg-muted p-8 text-center">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-foreground text-base font-medium mb-2">No Children Found</p>
        <p className="text-muted-foreground text-sm">
          You don't have any children registered in the system.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground mb-1">Select a Child</h2>
        <p className="text-sm text-muted-foreground">
          Choose which child's grades you want to view
        </p>
      </div>
      
      <div className="space-y-2">
        {children.map((child) => (
          <ChildSelectionCard
            key={child.id}
            child={child}
            onClick={() => onChildSelect(child.id)}
            isSelected={selectedChildId === child.id}
          />
        ))}
      </div>
    </div>
  );
}

