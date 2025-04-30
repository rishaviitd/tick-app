
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  BookOpen,
  XCircle
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface SubmissionFile {
  id: string;
  name: string;
  size: number;
  status: "uploading" | "processing" | "completed" | "error";
  progress: number;
  studentId?: string;
  studentName?: string;
}

export const UploadSubmissions = () => {
  const [files, setFiles] = useState<SubmissionFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).map(file => ({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        status: "uploading" as const,
        progress: 0
      }));
      
      setFiles(prev => [...prev, ...newFiles]);
      
      // Simulate upload and processing for each file
      newFiles.forEach(file => simulateFileUpload(file.id));
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        status: "uploading" as const,
        progress: 0
      }));
      
      setFiles(prev => [...prev, ...newFiles]);
      
      // Simulate upload and processing for each file
      newFiles.forEach(file => simulateFileUpload(file.id));
    }
  };
  
  const simulateFileUpload = (fileId: string) => {
    const interval = setInterval(() => {
      setFiles(prev => {
        const fileIndex = prev.findIndex(f => f.id === fileId);
        if (fileIndex === -1) {
          clearInterval(interval);
          return prev;
        }
        
        const file = prev[fileIndex];
        
        // If already completed or errored, stop
        if (file.status === "completed" || file.status === "error") {
          clearInterval(interval);
          return prev;
        }
        
        // Update progress
        let newProgress = file.progress + Math.floor(Math.random() * 10) + 5;
        let newStatus = file.status;
        
        // Handle upload completion
        if (newProgress >= 100 && file.status === "uploading") {
          newProgress = 100;
          newStatus = "processing";
          
          // Start AI processing after upload completes
          setTimeout(() => {
            // 90% chance of success, 10% chance of error
            const success = Math.random() > 0.1;
            
            setFiles(prev => {
              const fileIndex = prev.findIndex(f => f.id === fileId);
              if (fileIndex === -1) return prev;
              
              const updatedFiles = [...prev];
              
              if (success) {
                // Generate a mock student match
                const studentId = `ST${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
                const studentNames = ["John Doe", "Jane Smith", "Robert Johnson", "Emily Davis", "Michael Brown"];
                const randomName = studentNames[Math.floor(Math.random() * studentNames.length)];
                
                updatedFiles[fileIndex] = {
                  ...updatedFiles[fileIndex],
                  status: "completed",
                  progress: 100,
                  studentId,
                  studentName: randomName
                };
                
                toast({
                  title: "Submission processed",
                  description: `${file.name} has been matched to ${randomName}`,
                  variant: "default",
                });
              } else {
                updatedFiles[fileIndex] = {
                  ...updatedFiles[fileIndex],
                  status: "error",
                  progress: 100
                };
                
                toast({
                  title: "Processing failed",
                  description: `Could not identify student for ${file.name}`,
                  variant: "destructive",
                });
              }
              
              return updatedFiles;
            });
          }, 2000 + Math.random() * 2000); // Random delay between 2-4 seconds for processing
        }
        
        // Create new files array with updated file
        const updatedFiles = [...prev];
        updatedFiles[fileIndex] = {
          ...file,
          progress: newProgress,
          status: newStatus
        };
        
        return updatedFiles;
      });
    }, 200);
  };
  
  const getFileStatusIcon = (status: SubmissionFile["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 size={16} className="text-green-500" />;
      case "error":
        return <XCircle size={16} className="text-red-500" />;
      case "uploading":
      case "processing":
      default:
        return <FileText size={16} className="text-muted-foreground" />;
    }
  };
  
  const getFileStatusText = (file: SubmissionFile) => {
    switch (file.status) {
      case "uploading":
        return "Uploading...";
      case "processing":
        return "AI processing...";
      case "completed":
        return file.studentName ? `Matched to ${file.studentName}` : "Processed";
      case "error":
        return "Processing failed";
      default:
        return "";
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Submissions</CardTitle>
        <CardDescription>
          Upload student submissions for grading. Our AI will automatically match submissions to students.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`upload-dropzone ${isDragging ? 'active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="submissionUpload"
            className="hidden"
            multiple
            accept="image/*,.pdf"
            onChange={handleFileChange}
          />
          <Upload size={32} className="mb-2" />
          <p className="mb-2 text-sm font-medium">Drag & drop student submissions here</p>
          <p className="text-xs mb-4">Upload multiple files at once</p>
          <label htmlFor="submissionUpload">
            <Button variant="secondary" className="cursor-pointer">
              Select Files
            </Button>
          </label>
        </div>
        
        {files.length > 0 && (
          <Card className="overflow-hidden">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Uploaded Submissions</CardTitle>
                <Button variant="outline" size="sm">
                  <BookOpen size={14} className="mr-2" />
                  View All
                </Button>
              </div>
            </CardHeader>
            <ScrollArea className="h-60">
              <CardContent>
                <div className="space-y-2">
                  {files.map((file) => (
                    <div key={file.id} className="border rounded-md p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center">
                          {getFileStatusIcon(file.status)}
                          <span className="ml-2 text-sm font-medium">{file.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      
                      <Progress value={file.progress} className="h-1 mb-1" />
                      
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">
                          {getFileStatusText(file)}
                        </span>
                        {file.status === "completed" && file.studentId && (
                          <span className="text-xs bg-secondary px-2 py-0.5 rounded">
                            ID: {file.studentId}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </ScrollArea>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};
