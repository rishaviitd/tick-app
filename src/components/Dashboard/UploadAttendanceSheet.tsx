
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UploadAttendanceSheetProps {
  onUploadComplete: (studentsData: any) => void;
}

export const UploadAttendanceSheet = ({ onUploadComplete }: UploadAttendanceSheetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleFile = (file: File) => {
    // Check if file is an image or PDF
    if (!file.type.includes('image/') && file.type !== 'application/pdf') {
      toast({
        title: "Invalid file type",
        description: "Please upload an image or PDF file",
        variant: "destructive",
      });
      return;
    }
    
    setFile(file);
  };
  
  const uploadFile = () => {
    if (!file) return;
    
    setIsUploading(true);
    
    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      setIsProcessing(true);
      
      // Simulate AI processing
      setTimeout(() => {
        setIsProcessing(false);
        
        // Mock student data
        const mockStudentData = {
          success: true,
          students: [
            { id: "ST001", name: "John Doe", email: "john.doe@example.com", class: "10A", roll: "01" },
            { id: "ST002", name: "Jane Smith", email: "jane.smith@example.com", class: "10A", roll: "02" },
            { id: "ST003", name: "Robert Johnson", email: "robert.j@example.com", class: "10A", roll: "03" },
            // More students would be here in a real application
          ]
        };
        
        onUploadComplete(mockStudentData);
        
        toast({
          title: "Upload successful",
          description: `${mockStudentData.students.length} students imported from attendance sheet`,
          variant: "default",
        });
        
        setIsOpen(false);
        setFile(null);
      }, 2000);
    }, 1500);
  };
  
  const cancelUpload = () => {
    setFile(null);
    setIsUploading(false);
    setIsProcessing(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="space-x-2">
          <Upload size={16} />
          <span>Import Attendance Sheet</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Attendance Sheet</DialogTitle>
          <DialogDescription>
            Upload an attendance sheet image or PDF to automatically generate a student database.
            Our AI will extract student information and create records for each student.
          </DialogDescription>
        </DialogHeader>
        
        {!file ? (
          <div
            className={`upload-dropzone ${isDragging ? 'active' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="fileUpload"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
            <FileText size={32} className="mb-2" />
            <p className="mb-2 text-sm font-medium">Drag & drop your attendance sheet here</p>
            <p className="text-xs mb-4">Supports images and PDF files</p>
            <label htmlFor="fileUpload">
              <Button size="sm" variant="secondary" className="cursor-pointer">
                Select File
              </Button>
            </label>
          </div>
        ) : (
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText size={24} />
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              {!isUploading && !isProcessing && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={cancelUpload}
                >
                  <X size={16} />
                </Button>
              )}
            </div>
            
            {isUploading && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full animate-pulse w-full"></div>
                </div>
                <p className="text-xs mt-2 text-center">Uploading file...</p>
              </div>
            )}
            
            {isProcessing && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-amber-500 h-2 rounded-full w-full animate-pulse"></div>
                </div>
                <p className="text-xs mt-2 text-center">AI is processing attendance sheet...</p>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            disabled={!file || isUploading || isProcessing}
            onClick={uploadFile}
          >
            {isUploading ? "Uploading..." : isProcessing ? "Processing..." : "Import Students"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
