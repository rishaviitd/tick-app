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
  Download,
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
import { AssignmentDetail, StudentAssignment } from "@/types/class";
import apiClient from "@/lib/api";
import { Document, Page, pdfjs } from "react-pdf";
// Import required stylesheets for proper PDF rendering
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
// Use the correct legacy JS worker build to avoid dynamic import failures
pdfjs.GlobalWorkerOptions.workerSrc =
  "https://unpkg.com/pdfjs-dist@4.8.69/legacy/build/pdf.worker.min.mjs";
import GradingPage from "./GradingPage";
import ResultsPage from "./ResultsPage";

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
  const [showScanner, setShowScanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [assigningStudentId, setAssigningStudentId] = useState<string | null>(
    null
  );
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  // Track per-student scanned file for preview and assignment
  const [studentUploads, setStudentUploads] = useState<Record<string, File>>(
    {}
  );
  // Ref to store which student is uploading
  const uploadContextRef = useRef<{
    studentId: string;
    studentName: string;
  } | null>(null);

  // Listen for scanned PDF from the embedded scanner iframe
  useEffect(() => {
    const handleScannedPDF = (e: MessageEvent) => {
      if (
        e.data?.type === "scannedPDF" &&
        e.data.blob &&
        uploadContextRef.current
      ) {
        const { studentId } = uploadContextRef.current;
        const pdfBlob = e.data.blob as Blob;
        const file = new File([pdfBlob], "scanned.pdf", {
          type: "application/pdf",
        });
        // Store scanned file for this student
        setStudentUploads((prev) => ({ ...prev, [studentId]: file }));
        setShowScanner(false);
        uploadContextRef.current = null;
      }
    };
    window.addEventListener("message", handleScannedPDF);
    return () => window.removeEventListener("message", handleScannedPDF);
  }, []);

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

            setAvailableStudents(combinedStudents);
          } else {
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
    toast({
      title: "View Feedback",
      description: "View Feedback functionality is not implemented yet.",
    });
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

  const handleSearchStudent = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
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

  // Open the scanner micro-frontend in a modal
  const handleUploadClick = (studentId: string, studentName: string) => {
    uploadContextRef.current = { studentId, studentName };
    setShowScanner(true);
  };

  // PDF preview component for robust multi-page rendering
  function MyPDFPreview({
    file,
    studentName,
  }: {
    file: File;
    studentName: string;
  }) {
    const [numPages, setNumPages] = useState<number>(0);
    const [error, setError] = useState<Error | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const onDocumentLoadSuccess = ({
      numPages: loaded,
    }: {
      numPages: number;
    }) => {
      setNumPages(loaded);
      setLoading(false);
      console.log(`PDF loaded successfully with ${loaded} pages`);
    };

    const onDocumentLoadError = (err: Error) => {
      console.error("Error loading PDF:", err);
      setError(err);
      setLoading(false);
    };

    return (
      <div className="p-3 max-h-[80vh] overflow-y-auto">
        <a
          href={URL.createObjectURL(file)}
          download={`${studentName}-submission.pdf`}
          className="flex items-center mb-2 text-sm text-primary hover:underline"
        >
          <Download className="mr-1 h-4 w-4" />
          Download PDF
        </a>

        {/* Debug info */}
        <div className="text-xs text-gray-500 mb-2">
          File type: {file.type}, Size: {Math.round(file.size / 1024)}KB
        </div>

        <Document
          file={URL.createObjectURL(file)}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div className="py-4 text-center">Loading PDF...</div>}
          noData={
            <div className="py-4 text-center text-red-500">
              No PDF file provided.
            </div>
          }
          options={{
            cMapUrl: "https://unpkg.com/pdfjs-dist@4.8.69/legacy/cmaps/",
            cMapPacked: true,
            standardFontDataUrl:
              "https://unpkg.com/pdfjs-dist@4.8.69/legacy/standard_fonts/",
          }}
        >
          {Array.from({ length: numPages }, (_, i) => (
            <Page
              key={i}
              pageNumber={i + 1}
              width={window.innerWidth * 0.9}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              error={`Failed to load page ${i + 1}`}
            />
          ))}
        </Document>

        {/* Error state */}
        {error && (
          <div className="p-4 mt-4 bg-red-50 text-red-600 rounded-md">
            <p className="font-medium">Error loading PDF:</p>
            <p className="text-sm">{error.message}</p>
            <p className="text-xs mt-2">
              Try downloading the file to view it externally.
            </p>
          </div>
        )}

        {/* Loading state but no pages */}
        {!loading && numPages === 0 && !error && (
          <div className="p-4 mt-4 bg-yellow-50 text-yellow-600 rounded-md">
            <p>
              PDF loaded but no pages were found. The file may be empty or
              corrupted.
            </p>
          </div>
        )}
      </div>
    );
  }

  // Callback to update a student's status and responses when grading completes
  const handleGradeComplete = (studentId: string, responses: any[]) => {
    setAssignment((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        students: prev.students.map((s) =>
          s.studentId === studentId ? { ...s, status: "graded", responses } : s
        ),
      };
    });
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
      {/* Scanner modal for scanning answer sheets */}
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent className="fixed inset-0 left-0 top-0 translate-x-0 translate-y-0 w-full h-full max-w-none max-h-none p-0 m-0 border-none z-50 bg-white">
          <iframe
            src="/scanner/index.html"
            className="w-full h-full border-none"
            title="Document Scanner"
          />
        </DialogContent>
      </Dialog>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold tracking-tight">
            {assignment.title}
          </h1>
          <span className="text-sm text-muted-foreground">
            {assignment.maxMarks} marks
          </span>
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grade">
            Graded [{gradedCount} / {totalStudents}]
          </TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="grade" className="space-y-6">
          <GradingPage
            availableStudents={availableStudents}
            loadingStudents={loadingStudents}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            studentUploads={studentUploads}
            setStudentUploads={setStudentUploads}
            uploadContextRef={uploadContextRef}
            setShowScanner={setShowScanner}
            assigningStudentId={assigningStudentId}
            assignmentId={assignmentId!}
            onGradeComplete={handleGradeComplete}
          />
        </TabsContent>
        <TabsContent value="results" className="space-y-4">
          <ResultsPage
            assignment={assignment!}
            selectedStudents={selectedStudents}
            toggleStudentSelection={toggleStudentSelection}
            selectAllStudents={selectAllStudents}
          />
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
                ></div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentDetailPage;
