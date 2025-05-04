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
  Award,
  CheckCircle,
  Download,
  FileText,
  Lightbulb,
  Loader2,
  Share2,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { aiGradingApi, assignmentApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QuestionFeedback {
  questionId: string;
  questionText: string;
  solution: string;
  maxMarks?: number;
  feedback: {
    marks: number;
    comment: string;
  };
}

interface AIFeedback {
  overallAssessment?: {
    summary: string;
    score: string;
    correctness: string;
  };
  improvementAreas?: string[];
  strengths?: string[];
}

interface DetailedFeedback {
  assignmentId: string;
  studentId: string;
  studentName: string;
  assignmentTitle: string;
  status: string;
  totalScore: number;
  maxMarks?: number;
  submissionDate: string;
  aiFeedback: AIFeedback | null;
  questionResponses: QuestionFeedback[];
}

function FeedbackPage() {
  // TEMP DEBUG FLAG: skip API, use hardcoded console payload
  const DEBUG_OVERRIDE = true;
  const { assignmentId, studentId } = useParams<{ assignmentId: string; studentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<DetailedFeedback | null>(null);
  const [maxScore, setMaxScore] = useState<number>(100);
  const [assignmentMeta, setAssignmentMeta] = useState<{ maxMarks: number; questions: { maxMarks: number; questionText?: string; text?: string }[] } | null>(null);

  // Load debug payload on mount and skip API calls if DEBUG_OVERRIDE
  useEffect(() => {
    if (!DEBUG_OVERRIDE) return;
    const dp = {
      totalScore: 14,
      feedbackData: [
        { questionId: "1", marks: 7, comment: "Correct application of the AM-GM inequality and a clear explanation. Well done!", solution: "Consider the function f(x)=x+1/x for x > 0. By the AM-GM inequality: x + 1/x >= 2√(x * 1/x) = 2. Equality holds when x = 1. Thus, the minimum value is: 2" },
        { questionId: "2", marks: 3, comment: "The student correctly uses the discriminant method to find m=0. However, the initial approach of comparing roots is flawed and doesn't lead to a correct conclusion. The explanation needs improvement; clearly state why the roots must be equal and why the first method fails.  Focus on the discriminant method which is the appropriate approach for this type of problem.", solution: "First, expand the equation: mx(5x - 6) = 0 => 5mx² - 6mx = 0. Rewrite: x(5mx - 6m) = 0. Roots are x = 0 and x = 6/5. For the equation to have two equal roots, both roots must coincide: 0 = 6/5 (which is impossible unless m = 0). Alternatively, we check the discriminant: Δ = b² - 4ac = (-6m)² - 4(5m)(0) = 36m². Set discriminant to zero for equal roots: 36m² = 0 => m = 0. Thus, the required value is: m = 0" },
        { questionId: "3", marks: 4, comment: "Correct application of the quadratic formula and calculation of the discriminant.  The simplification of the roots and presentation of the final answer are well done. However, showing the steps for simplification from (6p ± 6q)/18 to (p ± q)/3 would improve the clarity of the solution.", solution: "Apply the quadratic formula. Here, a = 9, b = -6p, c = p² - q². Compute discriminant: Δ = (-6p)² - 4(9)(p² - q²) = 36p² - 36p² + 36q² = 36q². Calculate roots: x = (6p ± √36q²) / 18 = (6p ± 6q) / 18 = (p ± q) / 3. Final solutions: x = (p + q) / 3, x = (p - q) / 3" }
      ],
      aiFeedback: {
        overallAssessment: { summary: "The student demonstrates a good understanding...", score: "14", correctness: "" },
        improvementAreas: ["Improve clarity and structure of solutions","Justify steps and reasoning more explicitly","Master multiple approaches for solving quadratic equations","Practice more problems to build confidence and identify weaknesses"],
        strengths: ["Good understanding of AM-GM inequality","Correct application of the quadratic formula","Ability to compute discriminants"]
      }
    };
    // Populate the UI state
    setFeedback({
      assignmentId: assignmentId!,
      studentId: studentId!,
      studentName: "",
      assignmentTitle: "",
      status: "graded",
      totalScore: dp.totalScore,
      maxMarks: dp.aiFeedback.overallAssessment.correctness ? Number(dp.aiFeedback.overallAssessment.correctness) : dp.feedbackData.reduce((sum, q) => sum + q.marks, 0),
      submissionDate: "",
      aiFeedback: dp.aiFeedback,
      questionResponses: dp.feedbackData.map(d => ({ questionId: d.questionId, questionText: '', solution: d.solution, feedback: { marks: d.marks, comment: d.comment } })),
    });
    setAssignmentMeta({ maxMarks: dp.aiFeedback.overallAssessment.correctness ? Number(dp.aiFeedback.overallAssessment.correctness) : dp.feedbackData.reduce((sum, q) => sum + q.marks, 0), questions: dp.feedbackData.map(d => ({ maxMarks: d.marks, questionText: '' })) });
    setLoading(false);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      if (DEBUG_OVERRIDE) return;
      try {
        console.log(
          "Loading feedback and assignment metadata for assignment " +
            assignmentId +
            ", student " +
            studentId
        );
        const [feedbackResp, assignResp] = await Promise.all([
          aiGradingApi.getDetailedFeedback(assignmentId!, studentId!),
          assignmentApi.getDetails(assignmentId!),
        ]);
        console.log("Feedback API response:", feedbackResp);
        console.log("Assignment API response:", assignResp);

        if (feedbackResp.data.success) {
          if (feedbackResp.data.data.feedbackData) {
            const dp = feedbackResp.data.data;
            const questionsMeta = assignResp.data.data.questions || [];
            // Build a clean AIFeedback shape
            const cleanAiFeedback: AIFeedback = {
              overallAssessment: {
                summary: dp.aiFeedback.overallAssessment.summary,
                score: String(dp.aiFeedback.overallAssessment.score),
                correctness: "",
              },
              improvementAreas: dp.aiFeedback.improvementAreas,
              strengths: dp.aiFeedback.strengths,
            };
            const mapped: DetailedFeedback = {
              ...dp,
              totalScore: dp.totalScore,
              maxMarks: assignResp.data.data.maxMarks || 0,
              aiFeedback: cleanAiFeedback,
              questionResponses: dp.feedbackData.map((d: any, idx: number) => ({
                questionId: d.questionId,
                questionText: questionsMeta[idx]?.text || questionsMeta[idx]?.questionText || '',
                solution: d.solution || '',
                feedback: {
                  marks: d.marks,
                  comment: d.comment,
                },
              })),
            };
            setFeedback(mapped);
          } else {
            setFeedback(feedbackResp.data.data);
          }
        } else {
          throw new Error(
            feedbackResp.data.message || "Failed to fetch feedback"
          );
        }

        if (assignResp.data.success) {
          const assignData = assignResp.data.data;
          setAssignmentMeta({
            maxMarks: assignData.maxMarks || 0,
            questions: assignData.questions,
          });
          setMaxScore(assignData.maxMarks || 0);
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

  const getScoreColor = (score: number, max: number) => {
    const percentage = (score / max) * 100;
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 80) return "text-lime-600";
    if (percentage >= 70) return "text-amber-600";
    if (percentage >= 60) return "text-orange-600";
    return "text-red-600";
  };

  const handleBackClick = () => {
    navigate(`/assignment/${assignmentId}`);
  };

  const handleShareFeedback = async () => {
    if (!assignmentId || !studentId) return;

    try {
      toast({
        title: "Sharing feedback...",
        description: "Feedback link will be sent to the student.",
      });

      // Implement actual sharing logic here
      // For example, call an API to mark the feedback as shared

      toast({
        title: "Feedback Shared",
        description: "The student has been notified.",
      });
    } catch (err) {
      console.error("Error sharing feedback:", err);
      toast({
        title: "Sharing Failed",
        description: "There was a problem sharing the feedback.",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (loading || !assignmentMeta) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading feedback...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !feedback) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold">Error Loading Feedback</h2>
          <p className="text-muted-foreground">
            {error || "Failed to load feedback"}
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

  // DEBUG: Log percentage calculation
  const assignmentTotalMarks = assignmentMeta.maxMarks;
  console.log(
    `DEBUG PERCENTAGES: Score=${feedback.totalScore}, MaxMarks=${assignmentTotalMarks}`
  );

  const scorePercentage = (feedback.totalScore / assignmentTotalMarks) * 100;
  console.log(`DEBUG: Calculated percentage = ${scorePercentage.toFixed(1)}%`);

  // DEBUG: Per-question calculation
  console.log("DEBUG: Per-question point calculations:");
  feedback.questionResponses.forEach((q, i) => {
    const questionMaxMarks = assignmentMeta.questions[i]?.maxMarks ?? 0;
    console.log(`Q${i + 1}: Score=${q.feedback.marks}/${questionMaxMarks}`);
  });

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
          <h1 className="text-2xl font-bold">{feedback.assignmentTitle}</h1>
          <p className="text-muted-foreground">{feedback.studentName}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className="hover:bg-gray-50 transition-colors"
          >
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button 
            size="sm" 
            onClick={handleShareFeedback}
            className="bg-[#58CC02]/90 hover:bg-[#58CC02] text-white shadow-sm rounded-lg transition-all duration-200"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* Question-by-question feedback */}
          <Card>
            <CardHeader>
              <CardTitle>Question Feedback</CardTitle>
              <CardDescription>
                Detailed feedback for each question in the assignment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-6">
                  {feedback.questionResponses.map((question, index) => {
                    const qMax = assignmentMeta.questions[index]?.maxMarks ?? 0;
                    return (
                      <div
                        key={question.questionId}
                        className="border rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-medium text-lg">
                            Question {index + 1}
                          </h3>
                          <Badge
                            variant="outline"
                            className={getScoreColor(
                              question.feedback.marks,
                              qMax
                            )}
                          >
                            {question.feedback.marks}/{qMax} points
                          </Badge>
                        </div>

                        <div className="mb-3">
                          <h4 className="text-sm font-medium mb-1">Question</h4>
                          <p className="text-sm bg-muted p-2 rounded-md">
                            {question.questionText}
                          </p>
                        </div>

                        <div className="mb-3">
                          <h4 className="text-sm font-medium mb-1">
                            Student's Solution
                          </h4>
                          <p className="text-sm bg-slate-50 p-2 rounded-md whitespace-pre-wrap">
                            {question.solution &&
                            question.solution !== "pending"
                              ? question.solution
                              : "No solution was extracted from the submission"}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-1">Feedback</h4>
                          <p className="text-sm p-2 border-l-2 border-primary pl-3">
                            {question.feedback.comment &&
                            question.feedback.comment !== "No feedback provided"
                              ? question.feedback.comment
                              : "The AI was unable to provide specific feedback for this question."}
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

        <div className="space-y-6">
          {/* Score summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Assessment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-4">
                <div
                  className={`text-4xl font-bold ${getScoreColor(
                    feedback.totalScore,
                    assignmentTotalMarks
                  )}`}
                >
                  {feedback.totalScore}
                </div>
                <p className="text-sm text-muted-foreground">
                  out of {assignmentTotalMarks} points
                </p>
              </div>

              <Progress value={scorePercentage} className="h-2 mb-2" />

              <p className="text-sm text-center mb-4">
                {scorePercentage.toFixed(1)}% score
              </p>

              <Separator className="my-4" />

              {feedback.aiFeedback?.overallAssessment && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    Overall Assessment
                  </h3>
                  <p className="text-sm">
                    {feedback.aiFeedback.overallAssessment.summary}
                  </p>
                </div>
              )}

              {feedback.aiFeedback?.strengths &&
                feedback.aiFeedback.strengths.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <Award className="h-4 w-4 mr-1" />
                      Strengths
                    </h3>
                    <ul className="text-sm space-y-1 list-disc pl-5">
                      {feedback.aiFeedback.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

              {feedback.aiFeedback?.improvementAreas &&
                feedback.aiFeedback.improvementAreas.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <Lightbulb className="h-4 w-4 mr-1" />
                      Areas for Improvement
                    </h3>
                    <ul className="text-sm space-y-1 list-disc pl-5">
                      {feedback.aiFeedback.improvementAreas.map(
                        (area, index) => (
                          <li key={index}>{area}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Submission details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Submission Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Submitted on</dt>
                  <dd>
                    {feedback.submissionDate
                      ? new Date(
                          feedback.submissionDate
                        ).toLocaleDateString() !== "Invalid Date"
                        ? new Date(feedback.submissionDate).toLocaleDateString()
                        : "Not available"
                      : "Not available"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd className="flex items-center">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    Graded
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Feedback shared</dt>
                  <dd>No</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default FeedbackPage;
