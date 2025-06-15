import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Download } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { gradingApi } from "@/lib/api";

// Use the correct legacy JS worker build to avoid dynamic import failures
pdfjs.GlobalWorkerOptions.workerSrc =
  "https://unpkg.com/pdfjs-dist@4.8.69/legacy/build/pdf.worker.min.mjs";

interface Student {
  id: string;
  name: string;
}

interface GradingPageProps {
  availableStudents: Student[];
  loadingStudents: boolean;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  studentUploads: Record<string, File>;
  setStudentUploads: React.Dispatch<React.SetStateAction<Record<string, File>>>;
  uploadContextRef: React.MutableRefObject<{
    studentId: string;
    studentName: string;
  } | null>;
  setShowScanner: (open: boolean) => void;
  assigningStudentId: string | null;
  assignmentId: string;
  onGradeComplete: (studentId: string, responses: any[]) => void;
}

// PDF preview component for robust multi-page rendering
function MyPDFPreview({
  file,
  studentName,
}: {
  file: File;
  studentName: string;
}) {
  const [numPages, setNumPages] = React.useState<number>(0);
  const [error, setError] = React.useState<Error | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);

  const onDocumentLoadSuccess = ({
    numPages: loaded,
  }: {
    numPages: number;
  }) => {
    setNumPages(loaded);
    setLoading(false);
  };

  const onDocumentLoadError = (err: Error) => {
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
      {error && (
        <div className="p-4 mt-4 bg-red-50 text-red-600 rounded-md">
          <p className="font-medium">Error loading PDF:</p>
          <p className="text-sm">{error.message}</p>
        </div>
      )}
    </div>
  );
}

const GradingPage: React.FC<GradingPageProps> = ({
  availableStudents,
  loadingStudents,
  searchQuery,
  setSearchQuery,
  studentUploads,
  setStudentUploads,
  uploadContextRef,
  setShowScanner,
  assigningStudentId,
  assignmentId,
  onGradeComplete,
}) => {
  // Track which students have been graded in this session
  const [gradedIds, setGradedIds] = React.useState<string[]>([]);
  const filteredStudents = availableStudents.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardContent className="space-y-4">
        <Input
          placeholder="Search students..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="mb-2 mt-4"
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
                filteredStudents.map((student) => {
                  const file = studentUploads[student.id];
                  return (
                    <details
                      key={student.id}
                      className="border rounded-md mb-4"
                    >
                      <summary className="flex items-center justify-between p-3 cursor-pointer">
                        <span className="font-medium">{student.name}</span>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              uploadContextRef.current = {
                                studentId: student.id,
                                studentName: student.name,
                              };
                              setShowScanner(true);
                            }}
                            disabled={assigningStudentId === student.id}
                          >
                            {file ? "Re-upload" : "Upload"}
                          </Button>
                          <Button
                            size="sm"
                            variant="default"
                            disabled={!file || gradedIds.includes(student.id)}
                            onClick={async () => {
                              if (!file || gradedIds.includes(student.id))
                                return;
                              const formData = new FormData();
                              formData.append("file", file);
                              formData.append("studentId", student.id);
                              formData.append("assignmentId", assignmentId);
                              try {
                                const { data } =
                                  await gradingApi.uploadSubmission(
                                    assignmentId,
                                    student.id,
                                    formData
                                  );
                                console.log("Split submission response:", data);
                                // Notify parent and update local graded status
                                onGradeComplete(student.id, data.urls);
                                setGradedIds((prev) => [...prev, student.id]);
                              } catch (error) {
                                console.error(
                                  "Error splitting submission:",
                                  error
                                );
                              }
                            }}
                          >
                            {gradedIds.includes(student.id)
                              ? "Graded"
                              : "Grade"}
                          </Button>
                        </div>
                      </summary>
                      {file && (
                        <MyPDFPreview file={file} studentName={student.name} />
                      )}
                    </details>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No available students to assign
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};

export default GradingPage;
