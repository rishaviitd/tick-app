import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { AssignmentCard } from "@/components/Dashboard/AssignmentCard";
import { AssignmentSummary } from "@/types/class";

interface AssignmentsTabProps {
  classId: string;
  assignments: AssignmentSummary[];
  onCreateAssignment?: () => void;
}

export const AssignmentsTab = ({
  classId,
  assignments,
  onCreateAssignment,
}: AssignmentsTabProps) => {
  const navigate = useNavigate();

  const draftAssignments = assignments.filter((a) => a.status === "draft");
  const activeAssignments = assignments.filter((a) => a.status === "active");

  // Function to handle creating a new assignment
  const handleCreateAssignment = () => {
    if (onCreateAssignment) {
      onCreateAssignment();
    } else {
      navigate(`/class/${classId}/create-assignment`);
    }
  };

  // Function to handle click on draft assignment
  const handleDraftClick = (draftTitle: string) => {
    navigate(
      `/class/${classId}/create-assignment?draft=${encodeURIComponent(
        draftTitle
      )}`
    );
  };

  return (
    <div className="space-y-6">
      <Button
        onClick={handleCreateAssignment}
        className="w-full flex items-center justify-center gap-2 bg-[#58CC02]/90 hover:bg-[#58CC02] text-white shadow-sm rounded-xl transition-all duration-200 py-6"
      >
        <PlusCircle size={20} />
        Create Assignment
      </Button>

      {activeAssignments.length === 0 ? (
        <Card className="w-full p-6 text-center text-muted-foreground">
          You currently have no assignments created. Create one!
        </Card>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Active Assignments [{activeAssignments.length}]
          </h2>
          <div className="overflow-x-auto pb-2 -mx-4 px-4">
            <div
              className="flex space-x-4 min-w-full"
              style={{ scrollbarWidth: "none" }}
            >
              {activeAssignments.map((assignment) => (
                <div key={assignment.id} className="w-[270px] flex-shrink-0">
                  <AssignmentCard
                    id={assignment.id}
                    title={assignment.title}
                    subject={assignment.subject}
                    date={assignment.date}
                    status={assignment.status}
                    completion={assignment.completion}
                    maxMarks={assignment.maxMarks}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {draftAssignments.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">
            Drafts [{draftAssignments.length}]
          </h2>
          <div className="overflow-x-auto pb-2 -mx-4 px-4">
            <div
              className="flex space-x-4 min-w-full"
              style={{ scrollbarWidth: "none" }}
            >
              {draftAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="w-[270px] flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => handleDraftClick(assignment.title)}
                >
                  <AssignmentCard
                    id={assignment.id}
                    title={assignment.title}
                    subject={assignment.subject}
                    date={assignment.date}
                    status={assignment.status}
                    completion={assignment.completion}
                    maxMarks={assignment.maxMarks}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
