import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle, Calendar } from "lucide-react";
import { AssignmentCard } from "@/components/Dashboard/AssignmentCard";
import { AssignmentSummary } from "@/types/class";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AssignmentsTabProps {
  classId: string;
  assignments: AssignmentSummary[];
}

export const AssignmentsTab = ({
  classId,
  assignments,
}: AssignmentsTabProps) => {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState<string>("all");

  const draftAssignments = assignments.filter((a) => a.status === "draft");
  const activeAssignments = assignments.filter((a) => a.status === "active");
  const completedAssignments = assignments.filter(
    (a) => a.status === "completed"
  );

  // Filter completed assignments by month if a specific month is selected
  const filteredCompletedAssignments =
    selectedMonth === "all"
      ? completedAssignments
      : completedAssignments.filter((a) => {
          const assignmentDate = new Date(a.date);
          return (
            assignmentDate.toLocaleString("default", { month: "long" }) ===
            selectedMonth
          );
        });

  // Generate an array of months from the completed assignments
  const months = Array.from(
    new Set(
      completedAssignments.map((a) => {
        const date = new Date(a.date);
        return date.toLocaleString("default", { month: "long" });
      })
    )
  );

  // Function to handle creating a new assignment
  const handleCreateAssignment = () => {
    navigate(`/class/${classId}/create-assignment`);
  };

  return (
    <div className="space-y-6">
      <Button
        onClick={handleCreateAssignment}
        className="w-full bg-[#58CC02] hover:bg-[#51AA02] text-white flex items-center justify-center gap-2"
      >
        <PlusCircle size={18} />
        Create Assignment
      </Button>

      {activeAssignments.length > 0 && (
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

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Completed Assignments [{filteredCompletedAssignments.length}]
          </h2>
          {completedAssignments.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Select
                      value={selectedMonth}
                      onValueChange={setSelectedMonth}
                    >
                      <SelectTrigger className="w-[140px] h-8 text-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Select Month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Months</SelectItem>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Filter by month</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <div className="overflow-x-auto pb-2 -mx-4 px-4">
          <div
            className="flex space-x-4 min-w-full"
            style={{ scrollbarWidth: "none" }}
          >
            {filteredCompletedAssignments.length > 0 ? (
              filteredCompletedAssignments.map((assignment) => (
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
              ))
            ) : (
              <Card className="w-full p-6 text-center text-muted-foreground">
                {selectedMonth !== "all" 
                  ? "No assignments found for the selected month" 
                  : "No completed assignments yet"}
              </Card>
            )}
          </div>
        </div>
      </div>

      {assignments.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No assignments yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first assignment to get started
          </p>
          <Card className="border border-[#EEF9EE] p-6 bg-[#EEF9EE]/30 text-[#58CC02]">
            <p className="flex items-center justify-center">
              <PlusCircle className="mr-2 h-5 w-5" />
              Click the button above to create an assignment
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};
