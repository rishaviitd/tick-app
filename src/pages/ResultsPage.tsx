import React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AssignmentDetail } from "@/types/class";
import { useNavigate } from "react-router-dom";

interface ResultsPageProps {
  assignment: AssignmentDetail;
  selectedStudents: string[];
  toggleStudentSelection: (studentId: string) => void;
  selectAllStudents: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({
  assignment,
  selectedStudents,
  toggleStudentSelection,
  selectAllStudents,
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRetryGrading = (studentId: string) => {
    toast({
      title: "Retry Grading",
      description: "Retry functionality is not implemented yet.",
    });
  };

  const refreshAllScores = () => {
    toast({
      title: "Refresh Scores",
      description: "Refresh functionality is not implemented yet.",
    });
  };

  const handleViewFeedback = (studentId: string) => {
    navigate(`/assignment/${assignment.id}/student/${studentId}/feedback`);
  };

  return (
    <Card>
      <CardHeader className="pb-3 sticky top-0 z-10 bg-card">
        <div className="flex items-center justify-between">
          <CardTitle>Student Results</CardTitle>
          <div className="flex gap-2">
            <Checkbox
              id="select-all"
              checked={
                selectedStudents.length === assignment.students.length &&
                assignment.students.length > 0
              }
              onCheckedChange={selectAllStudents}
            />
            <label htmlFor="select-all" className="text-sm">
              Select All
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <ScrollArea className="h-[400px] w-full">
            <div className="min-w-[600px]">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead className="w-10">
                      <span className="sr-only">Select</span>
                    </TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <div className="flex items-center space-x-2">
                        <span>Score</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.preventDefault();
                            refreshAllScores();
                          }}
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Feedback</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignment.students.map((student) => (
                    <TableRow key={student.studentId}>
                      <TableCell>
                        <Checkbox
                          checked={selectedStudents.includes(student.studentId)}
                          onCheckedChange={() =>
                            toggleStudentSelection(student.studentId)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.studentName}
                      </TableCell>
                      <TableCell>
                        {student.status === "graded" && (
                          <div className="flex items-center">
                            <CheckCircle
                              size={16}
                              className="text-green-500 mr-1"
                            />
                            <span className="text-xs">Graded</span>
                          </div>
                        )}
                        {student.status === "processing" && (
                          <div className="flex items-center">
                            <Loader2
                              size={16}
                              className="text-blue-500 animate-spin mr-1"
                            />
                            <span className="text-xs">Processing</span>
                          </div>
                        )}
                        {student.status === "failed" && (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <AlertCircle
                                size={16}
                                className="text-red-500 mr-1"
                              />
                              <span className="text-xs">Failed</span>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleRetryGrading(student.studentId)
                                }
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 h-7"
                              >
                                <RotateCcw size={12} className="mr-1" />
                                <span className="text-xs">Retry</span>
                              </Button>
                            </div>
                          </div>
                        )}
                        {student.status === "pending" && (
                          <span className="text-gray-500 text-xs">Pending</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {student.status === "graded" ? (
                          student.score !== undefined ? (
                            `${student.score}/${assignment.maxMarks}`
                          ) : (
                            <div className="flex items-center">
                              <Loader2
                                size={14}
                                className="animate-spin mr-1"
                              />
                              <span className="text-xs">Calculating...</span>
                            </div>
                          )
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {(student.status === "graded" ||
                          student.status === "completed") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleViewFeedback(student.studentId)
                            }
                          >
                            <Eye size={16} className="mr-1" />
                            <span className="sr-only sm:not-sr-only sm:text-xs">
                              View
                            </span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResultsPage;
