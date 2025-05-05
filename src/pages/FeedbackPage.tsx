import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { aiGradingApi, assignmentApi } from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QuestionSolution {
  questionId: string;
  questionText: string;
  solution: string;
}

interface StudentSolutions {
  assignmentId: string;
  studentId: string;
  studentName: string;
  assignmentTitle: string;
  status: string;
  submissionDate: string;
  questionResponses: QuestionSolution[];
}

function FeedbackPage() {
  const { assignmentId, studentId } = useParams<{
    assignmentId: string;
    studentId: string;
  }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [solutions, setSolutions] = useState<StudentSolutions | null>(null);
  const [assignmentMeta, setAssignmentMeta] = useState<{
    questions: { questionText?: string; text?: string }[];
  } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log(
          "Loading solutions for assignment " +
            assignmentId +
            ", student " +
            studentId
        );
        const [solutionsResp, assignResp] = await Promise.all([
          aiGradingApi.getDetailedFeedback(assignmentId!, studentId!),
          assignmentApi.getDetails(assignmentId!),
        ]);
        console.log("Solutions API response:", solutionsResp);
        console.log("Assignment API response:", assignResp);

        if (solutionsResp.data.success) {
          setSolutions(solutionsResp.data.data);
        } else {
          throw new Error(
            solutionsResp.data.message || "Failed to fetch solutions"
          );
        }

        if (assignResp.data.success) {
          setAssignmentMeta({
            questions: assignResp.data.data.questions,
          });
        } else {
          console.warn("Failed to fetch assignment metadata");
        }
      } catch (err: any) {
        console.error("Error loading feedback page data:", err);
        setError(err.message || "An error occurred while loading data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [assignmentId, studentId]);

  const handleBackClick = () => {
    navigate(`/assignment/${assignmentId}`);
  };

  // Loading state
  if (loading || !assignmentMeta) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading solutions...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !solutions) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold">Error Loading Solutions</h2>
          <p className="text-muted-foreground">
            {error || "Failed to load solutions"}
          </p>
          <Button
            onClick={handleBackClick}
            className="bg-[#58CC02]/90 hover:bg-[#58CC02] text-white shadow-sm rounded-lg transition-all duration-200"
          >
            Return to Assignment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 space-y-6 py-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2 flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={handleBackClick}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assignment
          </Button>
          <h1 className="text-2xl font-bold">{solutions.assignmentTitle}</h1>
          <p className="text-muted-foreground">{solutions.studentName}</p>
        </div>
      </div>

      {/* Student Solutions */}
      <Card>
        <CardHeader>
          <CardTitle>Student Solutions</CardTitle>
          <CardDescription>
            Extracted solutions from the student's submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {solutions.questionResponses.map((question, index) => {
                return (
                  <div
                    key={question.questionId}
                    className="border rounded-lg p-4"
                  >
                    <div className="mb-3">
                      <h3 className="font-medium text-lg mb-2">
                        Question {index + 1}
                      </h3>
                      <p className="text-sm bg-muted p-2 rounded-md">
                        {question.questionText}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-1">
                        Student's Solution
                      </h4>
                      <p className="text-sm bg-slate-50 p-2 rounded-md whitespace-pre-wrap">
                        {question.solution && question.solution !== "pending"
                          ? question.solution
                          : "No solution was extracted from the submission"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default FeedbackPage;
