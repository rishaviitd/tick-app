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
import { aiGradingApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QuestionFeedback {
  questionId: string;
  questionText: string;
  solution: string;
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
  submissionDate: string;
  aiFeedback: AIFeedback | null;
  questionResponses: QuestionFeedback[];
}

function FeedbackPage() {
  const { assignmentId, studentId } = useParams<{
    assignmentId: string;
    studentId: string;
  }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<DetailedFeedback | null>(null);
  const [maxScore, setMaxScore] = useState<number>(100);

  useEffect(() => {
    const fetchFeedback = async () => {
      if (!assignmentId || !studentId) {
        setError("Missing assignment or student ID");
        setLoading(false);
        return;
      }

      try {
        console.log(
          `Fetching feedback for assignment: ${assignmentId}, student: ${studentId}`
        );
        const response = await aiGradingApi.getDetailedFeedback(
          assignmentId,
          studentId
        );

        console.log("Feedback API response:", response);

        if (response.data?.success) {
          setFeedback(response.data.data);
          // Set maxScore from assignment context if available
          setMaxScore(100); // Default value
        } else {
          setError(response.data?.message || "Failed to fetch feedback");
        }
      } catch (err: any) {
        console.error("Error fetching feedback:", err);
        setError(err.message || "An error occurred while fetching feedback");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
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
  if (loading) {
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
          <Button onClick={handleBackClick}>Return to Assignment</Button>
        </div>
      </div>
    );
  }

  const scorePercentage = (feedback.totalScore / maxScore) * 100;

  return (
    <div className="container mx-auto px-4 space-y-6 py-8 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-2"
            onClick={handleBackClick}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Assignment
          </Button>
          <h1 className="text-2xl font-bold">{feedback.assignmentTitle}</h1>
          <p className="text-muted-foreground">{feedback.studentName}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button size="sm" onClick={handleShareFeedback}>
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
                  {feedback.questionResponses.map((question, index) => (
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
                            maxScore / feedback.questionResponses.length
                          )}
                        >
                          {question.feedback.marks} points
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
                          {question.solution || "No solution provided"}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium mb-1">Feedback</h4>
                        <p className="text-sm p-2 border-l-2 border-primary pl-3">
                          {question.feedback.comment || "No feedback provided"}
                        </p>
                      </div>
                    </div>
                  ))}
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
                    maxScore
                  )}`}
                >
                  {feedback.totalScore}
                </div>
                <p className="text-sm text-muted-foreground">
                  out of {maxScore} points
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
                    {new Date(feedback.submissionDate).toLocaleDateString()}
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
