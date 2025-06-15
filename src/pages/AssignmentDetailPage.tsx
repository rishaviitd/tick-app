import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Share2, Edit, CheckCircle, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { assignmentApi } from "@/lib/api";
import { AssignmentDetail } from "@/types/class";

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

  const handleEditAssignment = () => {
    navigate(`/create-assignment?edit=${assignmentId}`);
  };

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

    try {
      // Update each selected student's assignment to be shared
      const updatePromises = selectedStudents.map((studentId) =>
        assignmentApi.updateStudentAssignment(assignmentId, studentId, {
          isShared: true,
        })
      );

      await Promise.all(updatePromises);

      toast({
        title: "Results Shared",
        description: `Results shared with ${selectedStudents.length} student(s)`,
      });

      // Refresh assignment data
      window.location.reload();
    } catch (err) {
      console.error("Error sharing results:", err);
      toast({
        title: "Sharing Failed",
        description: "There was a problem sharing the results",
        variant: "destructive",
      });
    }

    // Close the dialog and reset selection
    setShowShareDialog(false);
    setSelectedStudents([]);
  };

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
            {assignment?.title}
          </h1>

          <p className="text-sm text-muted-foreground mt-1">
            {assignment?.maxMarks} marks
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

      {/* Share Results Confirmation Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
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
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmShareResults}
              className="bg-primary hover:bg-primary/90"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Results
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentDetailPage;
