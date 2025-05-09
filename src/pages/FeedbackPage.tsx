import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, FileText, ImageIcon } from "lucide-react";
import { aiGradingApi, assignmentApi } from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkBreaks from "remark-breaks";
import "katex/dist/katex.min.css";

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
  const [activeQuestionTab, setActiveQuestionTab] = useState<string>("0");
  const [breakdowns, setBreakdowns] = useState<Record<string, any>>({});
  const [breakdownsLoading, setBreakdownsLoading] = useState(false);
  const [breakdownsError, setBreakdownsError] = useState<string | null>(null);

  // Helper to replace literal \n with actual newlines for Markdown rendering
  const unescapeNewlines = (str: string) => str.replace(/\\n/g, "\n");

  // Set first question as active by default when solutions load
  useEffect(() => {
    if (solutions && solutions.questionResponses.length > 0) {
      setActiveQuestionTab("0");
    }
  }, [solutions]);

  // Load data effect
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

  // Get active question based on the active tab index
  const activeQuestion =
    solutions?.questionResponses[parseInt(activeQuestionTab)] || null;

  return (
    <div className="container mx-auto px-2 space-y-3 pt-1 pb-4 max-w-full">
      <div>
        <h1 className="text-xl font-bold">{solutions.assignmentTitle}</h1>
        <p className="text-muted-foreground text-sm">{solutions.studentName}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-1">
        <TabsList className="mb-1">
          <TabsTrigger value="solutions">Extracted Solutions</TabsTrigger>
          <TabsTrigger value="submissions">Original Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="solutions" className="mt-1">
          <Card className="shadow-sm">
            <CardHeader className="py-2 px-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-base">Student Solutions</CardTitle>
                  <CardDescription className="text-xs">
                    Extracted solutions from the student's submission
                  </CardDescription>
                </div>

                {/* Question tabs */}
                <Tabs
                  value={activeQuestionTab}
                  onValueChange={setActiveQuestionTab}
                >
                  <TabsList className="h-8">
                    {solutions.questionResponses.map((_, index) => (
                      <TabsTrigger
                        key={index}
                        value={index.toString()}
                        className="px-3 py-1 text-xs"
                      >
                        Q{index + 1}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>

            <CardContent className="px-3 py-2">
              {activeQuestion && (
                <div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Left column: Question and Solution */}
                    <div className="bg-white rounded-md p-2 max-h-[calc(100vh-220px)] overflow-auto">
                      <div className="mb-3">
                        <div className="text-sm bg-muted p-2 rounded-md">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                          >
                            {activeQuestion.questionText}
                          </ReactMarkdown>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-1 flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          Student's Solution
                        </h4>
                        {!isMissingSolution(activeQuestion.solution) ? (
                          <div className="text-sm bg-slate-50 p-2 rounded-md whitespace-pre-wrap">
                            <ReactMarkdown
                              remarkPlugins={[remarkMath, remarkBreaks]}
                              rehypePlugins={[rehypeKatex]}
                            >
                              {unescapeNewlines(activeQuestion.solution)}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <div className="text-sm bg-slate-50 p-3 rounded-md text-center text-muted-foreground">
                            <p>No solution was extracted from the submission</p>
                            <p className="text-xs mt-1">
                              Try viewing the original submission images
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Overall Assessment moved to left column */}
                      {!isMissingSolution(activeQuestion.solution) &&
                        breakdowns[activeQuestion.questionId] &&
                        breakdowns[activeQuestion.questionId]
                          .overallAssessment && (
                          <div className="mt-3 bg-slate-50 p-2 rounded-md">
                            <h4 className="font-medium text-sm">
                              Overall Assessment
                            </h4>
                            <p className="text-sm">
                              {
                                breakdowns[activeQuestion.questionId]
                                  .overallAssessment
                              }
                            </p>
                          </div>
                        )}
                    </div>

                    {/* Right column: Steps Breakdown */}
                    {!isMissingSolution(activeQuestion.solution) && (
                      <div className="bg-white rounded-md p-2 max-h-[calc(100vh-220px)] overflow-auto">
                        <h4 className="text-sm font-medium mb-1">
                          Steps Breakdown & Evaluation
                        </h4>
                        {breakdownsLoading ? (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading steps...
                          </div>
                        ) : breakdowns[activeQuestion.questionId] ? (
                          <div className="space-y-2">
                            {/* Steps list */}
                            <ul className="space-y-2">
                              {breakdowns[activeQuestion.questionId].steps.map(
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
                                    status.toLowerCase().includes("partially")
                                  )
                                    statusColor = "text-yellow-600";
                                  return (
                                    <li
                                      key={step.stepNumber}
                                      className="border p-2 rounded-md relative"
                                    >
                                      <div className="flex justify-between items-center mb-1">
                                        <strong className="text-sm">
                                          Work:
                                        </strong>
                                        <span
                                          className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                                            status.toLowerCase() === "correct"
                                              ? "bg-green-100 text-green-800"
                                              : status.toLowerCase() ===
                                                "incorrect"
                                              ? "bg-red-100 text-red-800"
                                              : status
                                                  .toLowerCase()
                                                  .includes("partially")
                                              ? "bg-yellow-100 text-yellow-800"
                                              : "bg-gray-100 text-gray-800"
                                          }`}
                                        >
                                          {status
                                            ? status.toUpperCase()
                                            : "STEP"}
                                        </span>
                                      </div>
                                      <div className="text-sm whitespace-pre-wrap">
                                        <ReactMarkdown
                                          remarkPlugins={[
                                            remarkMath,
                                            remarkBreaks,
                                          ]}
                                          rehypePlugins={[rehypeKatex]}
                                        >
                                          {unescapeNewlines(step.studentWork)}
                                        </ReactMarkdown>
                                      </div>

                                      {justification && (
                                        <div className="mt-1 border-t pt-1">
                                          <div className="flex items-center">
                                            <strong className="text-sm">
                                              Justification:
                                            </strong>
                                          </div>
                                          <div className="text-sm italic whitespace-pre-wrap">
                                            <ReactMarkdown
                                              remarkPlugins={[
                                                remarkMath,
                                                remarkBreaks,
                                              ]}
                                              rehypePlugins={[rehypeKatex]}
                                            >
                                              {unescapeNewlines(justification)}
                                            </ReactMarkdown>
                                          </div>
                                        </div>
                                      )}
                                    </li>
                                  );
                                }
                              )}
                            </ul>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No breakdown available.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions">
          <Card className="shadow-sm">
            <CardHeader className="py-2 px-4">
              <CardTitle className="text-base">Original Submission</CardTitle>
              <CardDescription className="text-xs">
                View the student's submitted answer sheets
              </CardDescription>
            </CardHeader>
            <CardContent className="px-3 py-2">
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

      <div>
        <Separator className="my-2" />
        <div className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Submission date:{" "}
            {solutions.submissionDate
              ? new Date(solutions.submissionDate).toLocaleString()
              : "Not available"}
          </p>
          <p className="text-xs">
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
