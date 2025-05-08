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
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  ImageIcon,
} from "lucide-react";
import { aiGradingApi, assignmentApi } from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [activeTab, setActiveTab] = useState("solutions");
  const [breakdowns, setBreakdowns] = useState<Record<string, any>>({});
  const [breakdownsLoading, setBreakdownsLoading] = useState(false);
  const [breakdownsError, setBreakdownsError] = useState<string | null>(null);

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

  // Load step breakdowns and evaluations once solutions are available
  useEffect(() => {
    const fetchBreakdowns = async () => {
      if (!solutions) return;
      setBreakdownsLoading(true);
      try {
        const results = await Promise.all(
          solutions.questionResponses.map((q) =>
            aiGradingApi
              .getQuestionStepsBreakdown(
                assignmentId!,
                studentId!,
                q.questionId
              )
              .then((res) => ({
                questionId: q.questionId,
                data: res.data.data,
              }))
              .catch((err) => {
                console.error(
                  `Error loading breakdown for question ${q.questionId}:`,
                  err
                );
                return { questionId: q.questionId, data: null };
              })
          )
        );
        const map: Record<string, any> = {};
        results.forEach((r) => {
          if (r.data) {
            map[r.questionId] = r.data;
          }
        });
        setBreakdowns(map);
      } catch (err: any) {
        console.error("Error fetching breakdowns:", err);
        setBreakdownsError(err.message || "Failed to load breakdowns");
      } finally {
        setBreakdownsLoading(false);
      }
    };
    fetchBreakdowns();
  }, [solutions, assignmentId, studentId]);

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

  // Helper to check if solution text indicates no solution
  const isMissingSolution = (solution: string) => {
    const noSolutionPhrases = [
      "no solution was found",
      "no solution was extracted",
      "no solution could be extracted",
      "failed to extract solution",
      "error extracting solution",
    ];

    return (
      !solution ||
      solution === "undefined" ||
      solution === "null" ||
      noSolutionPhrases.some((phrase) =>
        solution.toLowerCase().includes(phrase)
      )
    );
  };

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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="solutions">Extracted Solutions</TabsTrigger>
          <TabsTrigger value="submissions">Original Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="solutions">
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
                    const hasSolution = !isMissingSolution(question.solution);

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
                          <h4 className="text-sm font-medium mb-1 flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            Student's Solution
                          </h4>
                          {hasSolution ? (
                            <p className="text-sm bg-slate-50 p-2 rounded-md whitespace-pre-wrap">
                              {question.solution}
                            </p>
                          ) : (
                            <div className="text-sm bg-slate-50 p-3 rounded-md text-center text-muted-foreground">
                              <p>
                                No solution was extracted from the submission
                              </p>
                              <p className="text-xs mt-1">
                                Try viewing the original submission images
                              </p>
                            </div>
                          )}
                        </div>

                        {hasSolution && (
                          <div className="mt-4">
                            <h4 className="text-sm font-medium mb-1">
                              Steps Breakdown & Evaluation
                            </h4>
                            {breakdownsLoading ? (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading steps...
                              </div>
                            ) : breakdowns[question.questionId] ? (
                              <>
                                <p className="text-xs italic mb-2 bg-slate-50 p-2 rounded-md whitespace-pre-wrap">
                                  {
                                    breakdowns[question.questionId]
                                      .studentThoughtProcess
                                  }
                                </p>
                                <ul className="space-y-2">
                                  {breakdowns[question.questionId].steps.map(
                                    (step: any) => {
                                      const status = step.status || "";
                                      const justification =
                                        step.justification || "";
                                      let statusColor = "text-gray-700";
                                      if (status.toLowerCase() === "correct")
                                        statusColor = "text-green-600";
                                      if (status.toLowerCase() === "incorrect")
                                        statusColor = "text-red-600";
                                      if (
                                        status
                                          .toLowerCase()
                                          .includes("partially")
                                      )
                                        statusColor = "text-yellow-600";
                                      return (
                                        <li
                                          key={step.stepNumber}
                                          className="border p-2 rounded-md"
                                        >
                                          <div className="flex justify-between items-center">
                                            <span
                                              className={`font-semibold ${statusColor}`}
                                            >
                                              {status
                                                ? status.toUpperCase()
                                                : "STEP"}
                                            </span>
                                            <span className="text-xs font-medium">
                                              Step {step.stepNumber}
                                            </span>
                                          </div>
                                          <p className="text-sm">
                                            <strong>Work:</strong>{" "}
                                            {step.studentWork}
                                          </p>
                                          <p className="text-sm">
                                            <strong>Intent:</strong>{" "}
                                            {step.studentIntent}
                                          </p>
                                          {justification && (
                                            <p className="text-sm italic">
                                              <strong>Justification:</strong>{" "}
                                              {justification}
                                            </p>
                                          )}
                                        </li>
                                      );
                                    }
                                  )}
                                </ul>
                                {breakdowns[question.questionId]
                                  .overallAssessment && (
                                  <div className="mt-3 bg-slate-50 p-3 rounded-md">
                                    <h4 className="font-medium text-sm">
                                      Overall Assessment
                                    </h4>
                                    <p className="text-sm">
                                      {
                                        breakdowns[question.questionId]
                                          .overallAssessment
                                      }
                                    </p>
                                  </div>
                                )}
                              </>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                No breakdown available.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions">
          <Card>
            <CardHeader>
              <CardTitle>Original Submission</CardTitle>
              <CardDescription>
                View the student's submitted answer sheets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 border rounded-md bg-slate-50">
                <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  This is where the original submission images would be
                  displayed.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  The image viewing feature is currently under development.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-4">
        <Separator className="my-4" />
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Submission date:{" "}
            {solutions.submissionDate
              ? new Date(solutions.submissionDate).toLocaleString()
              : "Not available"}
          </p>
          <p className="text-sm">
            Status:{" "}
            <span className="text-blue-600 font-medium">
              {solutions.status}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default FeedbackPage;
