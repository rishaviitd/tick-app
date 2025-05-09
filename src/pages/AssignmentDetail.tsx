import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Share2,
  BarChart,
  FileText,
  FileUp,
  Eye,
  Edit,
  CheckCircle,
  Loader2,
  RotateCcw,
  AlertCircle,
  Upload,
  ArrowLeft,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { assignmentApi } from "@/lib/api";
import { classApi } from "@/lib/api";
import { aiGradingApi } from "@/lib/api";
import {
  gradeSubmission,
  updateGradingStatus,
} from "@/service/aiGradingService";
import { orchestrateSolutionAssessment } from "@/service/aiOrchestrationService";
import { AssignmentDetail, StudentAssignment } from "@/types/class";

const AssignmentDetailPage = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("grade");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<AssignmentDetail | null>(null);
  const [availableStudents, setAvailableStudents] = useState<
    { id: string; name: string }[]
  >([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [assigningStudent, setAssigningStudent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [assigningStudentId, setAssigningStudentId] = useState<string | null>(
    null
  );
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Helper to test Gemini API connection

  // Helper to convert a File to base64 string
  const fileToBase64 = (file: File): Promise<string | null> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });

  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      if (!assignmentId) return;

      setLoading(true);
      setError(null);

      try {
        console.log(`Fetching assignment details for ID: ${assignmentId}`);

        // Test the Gemini API connection

        const response = await assignmentApi.getDetails(assignmentId);

        if (response.data.success) {
          const assignmentData = response.data.data;
          console.log("Assignment data received:", assignmentData);
          console.log("Class ID in response:", assignmentData.classId);
          console.log(
            "Students in assignment:",
            assignmentData.students?.length || 0
          );

          // Check if classId exists
          if (!assignmentData.classId) {
            console.warn("No classId found in the assignment data!");
          }

          setAssignment(assignmentData);
        } else {
          setError(
            response.data.message || "Failed to load assignment details"
          );
        }
      } catch (err: any) {
        console.error("Error fetching assignment details:", err);
        setError(`Failed to load assignment details: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentDetails();
  }, [assignmentId]);

  // Fetch available students who aren't already assigned to this assignment
  useEffect(() => {
    const fetchAvailableStudents = async () => {
      if (!assignmentId) {
        console.log("No assignmentId available");
        return;
      }

      try {
        setLoadingStudents(true);
        console.log(
          `Fetching available students for assignment: ${assignmentId}`
        );

        // Use the direct endpoint instead of trying to get class students first
        const response = await assignmentApi.getAvailableStudents(assignmentId);
        console.log("Available students API response:", response.data);

        if (response.data && response.data.success && response.data.data) {
          // Format the student data
          const students = response.data.data.map((student: any) => ({
            id: student._id || student.id,
            name: student.full_name || student.name,
          }));

          // Also include students with pending status from our assignment
          if (assignment && assignment.students) {
            const pendingStudents = assignment.students
              .filter((s) => s.status === "pending")
              .map((s) => ({
                id: s.studentId,
                name: s.studentName,
              }));

            // Combine and remove duplicates
            const combinedStudents = [...students];

            pendingStudents.forEach((pendingStudent) => {
              if (!combinedStudents.some((s) => s.id === pendingStudent.id)) {
                combinedStudents.push(pendingStudent);
              }
            });

            console.log("Available students to display:", combinedStudents);
            setAvailableStudents(combinedStudents);
          } else {
            console.log("Available students to display:", students);
            setAvailableStudents(students);
          }
        } else {
          console.warn("Unexpected API response format:", response.data);

          // Only fall back to dummy data in development environment
          if (import.meta.env.DEV) {
            console.log("Using development fallback data for students");
            setAvailableStudents([
              { id: "ST005", name: "Alex Brown" },
              { id: "ST006", name: "Sarah Miller" },
              { id: "ST007", name: "David Jones" },
            ]);
          } else {
            // In production, just set an empty array
            setAvailableStudents([]);
          }
        }
      } catch (err) {
        console.error("Error fetching available students:", err);

        // Only fall back to dummy data in development environment
        if (import.meta.env.DEV) {
          console.log(
            "Using development fallback data for students after error"
          );
          setAvailableStudents([
            { id: "ST005", name: "Alex Brown" },
            { id: "ST006", name: "Sarah Miller" },
            { id: "ST007", name: "David Jones" },
          ]);
        } else {
          // In production, just set an empty array
          setAvailableStudents([]);
        }
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchAvailableStudents();
  }, [assignmentId, assignment?.students]);

  const handleShareResults = () => {
    if (!assignment || !assignmentId) return;

    if (selectedStudents.length === 0) {
      toast({
        title: "No Students Selected",
        description: "Please select students to share results with",
        variant: "destructive",
      });
      return;
    }

    // Show the share dialog instead of immediately sharing
    setShowShareDialog(true);
  };

  const confirmShareResults = async () => {
    if (!assignment || !assignmentId) return;

    // Start the animation
    setIsSharing(true);
    setShareSuccess(true);

    // Wait for animation to complete, then close dialog
    setTimeout(() => {
      // Wait a moment to show the success state before closing
      setTimeout(() => {
        // Reset states and close dialog
        setIsSharing(false);
        setShareSuccess(false);
        setShowShareDialog(false);
        setSelectedStudents([]);
      }, 1500);
    }, 2500); // Allow animation to play longer (2.5s) for better visual effect
  };

  const handleEditAssignment = () => {
    navigate(`/create-assignment?edit=${assignmentId}`);
  };

  const handleRetryGrading = async (studentId: string) => {
    if (!assignmentId) return;

    try {
      const response = await assignmentApi.retryGrading(
        assignmentId,
        studentId
      );

      if (response.data.success) {
        toast({
          title: "Retry Grading",
          description: `Retrying grading for student ${studentId}`,
        });

        // Update the student status in the UI
        if (assignment) {
          const updatedStudents = assignment.students.map((s) => {
            if (s.studentId === studentId) {
              return { ...s, status: "processing" as const };
            }
            return s;
          });

          setAssignment({ ...assignment, students: updatedStudents });
        }
      } else {
        toast({
          title: "Retry Failed",
          description: response.data.message || "Failed to retry grading",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error retrying grading:", err);
      toast({
        title: "Retry Failed",
        description: "There was a problem retrying the grading",
        variant: "destructive",
      });
    }
  };

  const handleShareWithStudent = async (studentId: string) => {
    if (!assignmentId) return;

    try {
      const response = await assignmentApi.updateStudentAssignment(
        assignmentId,
        studentId,
        { isShared: true }
      );

      if (response.data.success) {
        toast({
          title: "Results Shared",
          description: `Results have been shared with student ${studentId}`,
        });

        // Update the student status in the UI
        if (assignment) {
          const updatedStudents = assignment.students.map((s) => {
            if (s.studentId === studentId) {
              return { ...s, isShared: true };
            }
            return s;
          });

          setAssignment({ ...assignment, students: updatedStudents });
        }
      } else {
        toast({
          title: "Sharing Failed",
          description: response.data.message || "Failed to share results",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error sharing results:", err);
      toast({
        title: "Sharing Failed",
        description: "There was a problem sharing the results",
        variant: "destructive",
      });
    }
  };

  const handleViewFeedback = async (studentId: string) => {
    if (!assignmentId) return;

    try {
      // Get detailed AI feedback for this student's assignment
      const feedbackResponse = await aiGradingApi.getDetailedFeedback(
        assignmentId,
        studentId
      );

      if (feedbackResponse.data?.success) {
        // Navigate to the feedback page with the feedback data
        navigate(`/assignment/${assignmentId}/student/${studentId}/feedback`);
      } else {
        toast({
          title: "Error",
          description: "Could not retrieve feedback for this student",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error getting feedback:", err);
      toast({
        title: "Error",
        description: "There was a problem retrieving the feedback",
        variant: "destructive",
      });
    }
  };

  const handleSearchStudent = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Add a function to check grading status and update UI when complete
  const checkGradingStatus = async (
    assignmentId: string,
    studentId: string,
    studentName: string
  ) => {
    try {
      console.log(`Starting status check for student: ${studentName}`);

      // Poll the status every few seconds
      const statusCheckInterval = setInterval(async () => {
        try {
          console.log(`Checking status for ${studentName}...`);
          const statusResponse = await aiGradingApi.getSubmissionStatus(
            assignmentId,
            studentId
          );

          if (statusResponse.data?.success) {
            const status = statusResponse.data.data.status;
            console.log(`Current status for ${studentName}: ${status}`);

            // If grading is complete
            if (status === "graded") {
              clearInterval(statusCheckInterval);
              console.log(
                `Grading complete for ${studentName}, fetching details...`
              );

              // Calculate the score by summing up individual question scores
              const score = await fetchAndCalculateStudentScore(studentId);

              toast({
                title: "Grading Complete",
                description: `${studentName}'s assignment has been graded${
                  score !== null ? ` with score: ${score}` : ""
                }`,
              });

              // Update the student status in the UI
              if (assignment) {
                const updatedStudents = assignment.students.map((s) => {
                  if (s.studentId === studentId) {
                    return {
                      ...s,
                      status: "graded" as const,
                      score: score !== null ? score : undefined,
                    };
                  }
                  return s;
                });

                setAssignment({ ...assignment, students: updatedStudents });
              }
            } else if (status === "failed") {
              clearInterval(statusCheckInterval);
              console.log(`Grading failed for ${studentName}`);

              toast({
                title: "Grading Failed",
                description: `Failed to grade ${studentName}'s assignment. Please try again.`,
                variant: "destructive",
              });

              // Update the UI to show failed status
              if (assignment) {
                const updatedStudents = assignment.students.map((s) => {
                  if (s.studentId === studentId) {
                    return { ...s, status: "failed" as const };
                  }
                  return s;
                });

                setAssignment({ ...assignment, students: updatedStudents });
              }
            }
            // If still processing, continue polling
          }
        } catch (err) {
          console.error("Error checking grading status:", err);
          clearInterval(statusCheckInterval);
        }
      }, 5000); // Check every 5 seconds

      // Clear interval after 5 minutes (prevent indefinite polling)
      setTimeout(() => {
        clearInterval(statusCheckInterval);
        console.log(`Stopped polling for ${studentName} after timeout`);

        // If we're still waiting after 5 minutes, update UI to show possible failure
        if (assignment) {
          const student = assignment.students.find(
            (s) => s.studentId === studentId
          );
          if (student && student.status === "processing") {
            toast({
              title: "Grading Timeout",
              description: `Grading for ${studentName} is taking longer than expected. Please check back later.`,
              variant: "destructive",
            });
          }
        }
      }, 300000); // 5 minutes
    } catch (err) {
      console.error("Error setting up status checking:", err);
    }
  };

  // Add a function to fetch and calculate the total score for a student
  const fetchAndCalculateStudentScore = async (studentId: string) => {
    if (!assignmentId) return null;

    try {
      // Get detailed feedback for this student's assignment
      const feedbackResponse = await aiGradingApi.getDetailedFeedback(
        assignmentId,
        studentId
      );

      if (feedbackResponse.data?.success) {
        const feedbackData = feedbackResponse.data.data;

        // If there's a direct totalScore property, use that
        if (typeof feedbackData.totalScore === "number") {
          return feedbackData.totalScore;
        }

        // Otherwise sum up scores from individual questions
        if (Array.isArray(feedbackData.questionFeedback)) {
          const totalScore = feedbackData.questionFeedback.reduce(
            (sum: number, question: any) => sum + (question.score || 0),
            0
          );
          return totalScore;
        }
      }

      return null;
    } catch (err) {
      console.error(`Error calculating score for student ${studentId}:`, err);
      return null;
    }
  };

  // Update the student score in the assignment state
  const updateStudentScore = async (studentId: string) => {
    if (!assignment) return;

    const score = await fetchAndCalculateStudentScore(studentId);

    if (score !== null) {
      setAssignment({
        ...assignment,
        students: assignment.students.map((s) =>
          s.studentId === studentId ? { ...s, score } : s
        ),
      });
    }
  };

  // Fetch scores for all graded students when tab changes to results
  useEffect(() => {
    if (activeTab === "results" && assignment) {
      // Only fetch scores for students with graded status who don't have a score yet
      const studentsNeedingScores = assignment.students.filter(
        (s) => s.status === "graded" && s.score === undefined
      );

      studentsNeedingScores.forEach((student) => {
        updateStudentScore(student.studentId);
      });
    }
  }, [activeTab, assignment]);

  // Modify handleAssignStudent to include assignment details with grading
  const handleAssignStudent = async (
    studentId: string,
    studentName: string,
    uploadedFiles: File[]
  ) => {
    if (!assignmentId || !assignment) {
      toast({
        title: "Error",
        description: "Assignment details not loaded.",
        variant: "destructive",
      });
      return;
    }

    // Check if student is already assigned with a status other than pending
    const existingAssignment = assignment.students.find(
      (s) => s.studentId === studentId && s.status !== "pending"
    );

    if (existingAssignment) {
      toast({
        title: "Already Assigned",
        description: `${studentName} already has this assignment with status: ${existingAssignment.status}`,
        variant: "destructive",
      });
      return;
    }

    if (uploadedFiles.length === 0) {
      toast({
        title: "No Files",
        description: "Please upload submission files first.",
        variant: "destructive",
      });
      return;
    }

    // mark this student as assigning
    setAssigningStudentId(studentId);
    setIsProcessing(true);
    // show processing toast for this student
    toast({
      title: "Processing Submission",
      description: `Assigning ${studentName} and starting solution extraction...`,
    });

    try {
      // 1. Update student status to 'processing'
      const updateResponse = await assignmentApi.updateStudentAssignment(
        assignmentId,
        studentId,
        {
          status: "processing",
        }
      );

      console.log("Update student assignment response:", updateResponse);

      if (!updateResponse.data.success) {
        throw new Error(
          "Failed to update student status: " + updateResponse.data.message
        );
      }

      // Update local state
      setAssignment(
        (prev) =>
          prev && {
            ...prev,
            students: prev.students.some((s) => s.studentId === studentId)
              ? prev.students.map((s) =>
                  s.studentId === studentId
                    ? { ...s, status: "processing" as const }
                    : s
                )
              : [
                  ...prev.students,
                  {
                    studentId,
                    studentName,
                    status: "processing" as const,
                    isShared: false,
                  },
                ],
          }
      );

      // 2. Collect all Base64 image data
      const base64Images: string[] = [];
      for (const file of uploadedFiles) {
        try {
          const base64Data = await fileToBase64(file);
          if (base64Data) {
            base64Images.push(base64Data);
          }
        } catch (err) {
          console.error("Error converting file to base64:", err);
        }
      }

      // After processing, update UI to show student is now assigned
      // Remove from available students list
      setAvailableStudents((prevStudents) =>
        prevStudents.filter((s) => s.id !== studentId)
      );

      // Debug log assignment questions
      console.log("Assignment questions:", assignment.questions);

      // 3. Prepare grading data with robust validation
      // First validate questions array
      if (
        !assignment.questions ||
        !Array.isArray(assignment.questions) ||
        assignment.questions.length === 0
      ) {
        throw new Error("Assignment has no questions to grade");
      }

      // Create a safe version of the questions with default values
      const safeQuestions = assignment.questions
        .filter((q) => q !== null && q !== undefined)
        .map((q) => {
          // Debug each question
          console.log("Processing question:", q);

          // Create a safe version with defaults for all properties
          return {
            id: q?._id || "",
            text: q?.text || "Question text not available",
            maxMarks: typeof q?.maxMarks === "number" ? q.maxMarks : 0,
            rubric: q?.rubric || "",
          };
        });

      // Validate we have questions after filtering
      if (safeQuestions.length === 0) {
        throw new Error("No valid questions found in the assignment");
      }

      // Prepare the correct data format for gradeSubmission
      // The service expects two separate parameters: base64Images and assignmentDetails
      const assignmentDetails = {
        title: assignment.title || "Assignment",
        questions: safeQuestions,
        assignmentId: assignmentId,
        studentId: studentId,
      };

      console.log("Prepared assignment details:", assignmentDetails);

      // 4. Start the grading process
      const gradingResponse = await gradeSubmission(
        base64Images,
        assignmentDetails
      );
      console.log("Grading response:", gradingResponse);

      if (!gradingResponse || !gradingResponse.success) {
        throw new Error(
          gradingResponse?.message || "Failed to process submission"
        );
      }

      // 5. Orchestrate breakdown and evaluation of solution steps
      const questionResponses = gradingResponse.feedbackData.map((f) => {
        const metaQ = assignment.questions.find((q) => q._id === f.questionId);
        return {
          questionId: f.questionId,
          questionText: metaQ?.text || "",
          solution: f.solution,
        };
      });
      await orchestrateSolutionAssessment(
        assignmentId!,
        studentId,
        questionResponses
      );

      // 6. Update student status to 'graded' in backend
      await assignmentApi.updateStudentAssignment(assignmentId, studentId, {
        status: "graded",
      });

      // Update UI to reflect graded status
      setAssignment(
        (prev) =>
          prev && {
            ...prev,
            students: prev.students.map((s) =>
              s.studentId === studentId
                ? { ...s, status: "graded" as const }
                : s
            ),
          }
      );

      toast({
        title: "Grading Complete",
        description: `${studentName}'s solutions have been graded.`,
      });
    } catch (error: any) {
      console.error("Error processing submission:", error);

      // Log more details about the error
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });

      toast({
        title: "Processing Failed",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });

      // Revert status to failed
      try {
        // Update the backend status to failed
        await assignmentApi.updateStudentAssignment(assignmentId, studentId, {
          status: "failed",
        });

        // Update local state
        setAssignment(
          (prev) =>
            prev && {
              ...prev,
              students: prev.students.map((s) =>
                s.studentId === studentId
                  ? { ...s, status: "failed" as const }
                  : s
              ),
            }
        );
      } catch (updateError) {
        console.error("Error updating student status to failed:", updateError);
      }
    } finally {
      setIsProcessing(false);
      // clear assigning state
      setAssigningStudentId(null);
    }
  };

  const toggleStudentSelection = (studentId: string) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter((id) => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };

  const selectAllStudents = () => {
    if (!assignment) return;

    if (selectedStudents.length === assignment.students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(assignment.students.map((s) => s.studentId));
    }
  };

  // For demonstration if no real data is available yet

  // Use demo data if API fails to load

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setUploadedFiles(filesArray);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading assignment details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (!assignment) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-semibold">Error Loading Assignment</h2>
          <p className="text-muted-foreground">
            {error || "Failed to load assignment details"}
          </p>
          <Button onClick={() => navigate("/assignments")}>
            Return to Assignments
          </Button>
        </div>
      </div>
    );
  }

  // Filter available students by search query and exclude those already graded
  const filteredStudents = availableStudents.filter((s) => {
    const matchesSearch = s.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const isGraded = assignment.students.some(
      (st) => st.studentId === s.id && st.status === "graded"
    );
    return matchesSearch && !isGraded;
  });

  const pendingCount = assignment.students.filter(
    (s) => s.status === "pending"
  ).length;
  const processingCount = assignment.students.filter(
    (s) => s.status === "processing"
  ).length;
  const gradedCount = assignment.students.filter(
    (s) => s.status === "graded"
  ).length;
  const failedCount = assignment.students.filter(
    (s) => s.status === "failed"
  ).length;

  const totalStudents = assignment.students.length;

  // Recalculate completion percentage based on graded students
  const completionPercentage =
    totalStudents > 0 ? Math.round((gradedCount / totalStudents) * 100) : 0;

  return (
    <div className="container mx-auto px-4 space-y-6 pb-8 max-w-5xl">
      {assignment && assignment.classId && (
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={() => navigate(`/class/${assignment.classId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Class
        </Button>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {assignment.title}
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            {assignment.maxMarks} marks
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={handleEditAssignment}
            className="hover:bg-gray-50 transition-colors"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Assignment
          </Button>
          <Button
            variant="outline"
            onClick={handleShareResults}
            className="hover:bg-gray-50 transition-colors"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share Results
          </Button>
        </div>
      </div>

      {assignment.status === "active" && (
        <Card className="mb-2">
          <CardContent className="p-3">
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span>
                  {gradedCount} of {totalStudents} graded
                </span>
                <span className="font-medium">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-1" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grade">Grade</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="grade" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Upload Answer Sheets</CardTitle>
                  <CardDescription>
                    Upload student answer sheets or assign from class
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg">
                    <FileUp size={40} className="text-muted-foreground mb-4" />
                    <p className="text-sm text-center text-muted-foreground mb-6 max-w-md">
                      Upload student answer sheets to be automatically graded
                    </p>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      multiple
                      accept="image/*,.pdf"
                      onChange={handleFileChange}
                    />
                    <Button onClick={handleUploadClick}>
                      <FileText className="mr-2 h-4 w-4" />
                      Select Files
                    </Button>

                    {uploadedFiles.length > 0 && (
                      <div className="w-full mt-6 border rounded-md">
                        <div className="p-4 flex justify-between items-center">
                          <h4 className="text-sm font-medium">
                            Selected Files
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setUploadedFiles([])}
                          >
                            Clear
                          </Button>
                        </div>
                        <div className="p-2 max-h-[200px] overflow-y-auto">
                          {uploadedFiles.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 hover:bg-muted rounded-md"
                            >
                              <div className="flex items-center">
                                <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                                <span className="text-sm">{file.name}</span>
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {uploadedFiles.length > 0 && (
                      <div className="mt-4 p-4 bg-blue-50 text-blue-800 rounded-md text-sm">
                        <p className="flex items-center font-medium">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Files ready for assignment
                        </p>
                        <p className="mt-2 text-xs text-blue-600">
                          Click "Assign" next to a student to assign these files
                          and start grading
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="w-full">
              <Card>
                <CardHeader>
                  <CardTitle>Assign Students</CardTitle>
                  <CardDescription>Assign students from class</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Search students..."
                    value={searchQuery}
                    onChange={handleSearchStudent}
                    className="mb-4"
                  />

                  <div className="overflow-x-auto">
                    <ScrollArea className="h-[300px]">
                      <div className="min-w-[250px] space-y-3">
                        {loadingStudents ? (
                          <div className="flex flex-col items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Loading students...
                            </p>
                          </div>
                        ) : filteredStudents.length > 0 ? (
                          filteredStudents.map((student) => (
                            <div
                              key={student.id}
                              className="flex items-center justify-between p-3 border rounded-md"
                            >
                              <div className="flex items-center space-x-2">
                                <label
                                  htmlFor={`student-${student.id}`}
                                  className="font-medium cursor-pointer"
                                >
                                  {student.name}
                                </label>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleAssignStudent(
                                      student.id,
                                      student.name,
                                      uploadedFiles
                                    )
                                  }
                                  disabled={assigningStudentId === student.id}
                                >
                                  {assigningStudentId === student.id ? (
                                    <>
                                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                                      Grading...
                                    </>
                                  ) : (
                                    "Assign"
                                  )}
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-muted-foreground">
                              {availableStudents.length > 0
                                ? "No matching students found"
                                : "No available students to assign"}
                            </p>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
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
                            <TableHead>Score</TableHead>
                            <TableHead className="text-right">
                              Feedback
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {assignment.students.map((student) => (
                            <TableRow key={student.studentId}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedStudents.includes(
                                    student.studentId
                                  )}
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
                                  <span className="text-gray-500 text-xs">
                                    Pending
                                  </span>
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
                                      <span className="text-xs">
                                        Calculating...
                                      </span>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Share Results Confirmation Dialog */}
      <Dialog
        open={showShareDialog}
        onOpenChange={(open) => {
          if (!isSharing) {
            setShowShareDialog(open);
          }
        }}
      >
        <DialogContent className="sm:max-w-md overflow-hidden">
          {/* Success Animation Overlay */}
          <div
            className={`absolute inset-0 flex flex-col items-center justify-center bg-green-500 z-50 transition-all duration-700 ${
              shareSuccess ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            style={{ borderRadius: "inherit" }}
          >
            <div className="flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center mb-6">
                {/* Pulse effect behind the circle */}
                <div
                  className={`absolute rounded-full bg-white/30 ${
                    shareSuccess ? "animate-pulse-ring-once" : "opacity-0"
                  }`}
                  style={{ height: "100px", width: "100px" }}
                ></div>

                {/* White circular background that scales up */}
                <div
                  className={`absolute bg-white rounded-full ${
                    shareSuccess ? "animate-scale-up" : "opacity-0"
                  }`}
                  style={{ height: "80px", width: "80px" }}
                ></div>

                {/* Checkmark SVG with animation */}
                <svg
                  className={`relative h-12 w-12 text-green-500 ${
                    shareSuccess ? "animate-check-mark" : "opacity-0"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              {/* Results shared text */}
              <h2
                className={`text-white font-bold text-xl transition-opacity duration-500 ${
                  shareSuccess ? "opacity-100" : "opacity-0"
                }`}
              >
                Results Shared
              </h2>
            </div>
          </div>

          <DialogHeader>
            <DialogTitle>Share Results</DialogTitle>
            <DialogDescription>
              Results will be shared with the following students:
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 max-h-[200px] overflow-y-auto">
            <div className="space-y-2">
              {assignment &&
                selectedStudents.map((studentId) => {
                  const student = assignment.students.find(
                    (s) => s.studentId === studentId
                  );
                  return (
                    <div
                      key={studentId}
                      className="p-3 bg-muted rounded-md flex items-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>{student?.studentName || studentId}</span>
                    </div>
                  );
                })}
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between sm:justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setShowShareDialog(false)}
              disabled={isSharing}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmShareResults}
              className="bg-primary hover:bg-primary/90"
              disabled={isSharing}
            >
              {isSharing ? (
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sharing...
                </div>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Results
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentDetailPage;
