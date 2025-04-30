import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  File,
  X,
  Edit,
  Pencil,
  Save,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import apiClient from "@/lib/api"; // Import the axios-based API client

interface Student {
  full_name: string;
  mobileNo: string;
  rollNo: string;
  id?: string; // For UI purposes only
  isEditing?: boolean;
  hasDuplicateRoll?: boolean;
}

const CreateClass = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth(); // Get auth context
  const [className, setClassName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const isIntentionalSubmit = useRef(false);
  const [duplicateWarnings, setDuplicateWarnings] = useState<{
    rollNumbers: string[];
    mobileNumbers: string[];
  }>({
    rollNumbers: [],
    mobileNumbers: [],
  });

  // Debug localStorage on component mount
  useEffect(() => {
    console.log("Debugging localStorage - Component mounted");
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key);
        console.log(`${key}:`, value);
      }
    }

    // Log auth state for debugging
    console.log("CreateClass: Auth state:", {
      isAuthenticated,
      userId: user?.id,
    });
  }, [isAuthenticated, user]);

  // Check for duplicates whenever students change
  useEffect(() => {
    console.log("Running duplicate check on students change");
    checkForDuplicates();
  }, [students]);

  const checkForDuplicates = () => {
    // Check for duplicate roll numbers
    const nonEmptyRollNumbers = students
      .filter((student) => student.rollNo?.trim())
      .map((student) => student.rollNo.trim());

    const rollNumberCounts: Record<string, number> = {};
    const duplicateRolls: string[] = [];

    nonEmptyRollNumbers.forEach((roll) => {
      rollNumberCounts[roll] = (rollNumberCounts[roll] || 0) + 1;
      if (rollNumberCounts[roll] > 1 && !duplicateRolls.includes(roll)) {
        duplicateRolls.push(roll);
      }
    });

    // Mark students with duplicate roll numbers
    const updatedStudents = students.map((student) => ({
      ...student,
      hasDuplicateRoll:
        student.rollNo && duplicateRolls.includes(student.rollNo.trim()),
    }));

    // Check for duplicate mobile numbers
    const mobileNumbers = students.map((student) => student.mobileNo);
    const mobileNumberCounts: Record<string, number> = {};
    const duplicateMobiles: string[] = [];

    mobileNumbers.forEach((mobile) => {
      mobileNumberCounts[mobile] = (mobileNumberCounts[mobile] || 0) + 1;
      if (
        mobileNumberCounts[mobile] > 1 &&
        !duplicateMobiles.includes(mobile)
      ) {
        duplicateMobiles.push(mobile);
      }
    });

    setDuplicateWarnings({
      rollNumbers: duplicateRolls,
      mobileNumbers: duplicateMobiles,
    });

    if (
      updatedStudents.some((s) => s.hasDuplicateRoll) !==
      students.some((s) => s.hasDuplicateRoll)
    ) {
      setStudents(updatedStudents);
    }
  };

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
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      parseFile(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file: File) => {
    const fileType = file.name.split(".").pop()?.toLowerCase();
    console.log("Parsing file:", file.name, "type:", fileType);

    if (fileType === "csv") {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          console.log("CSV parsing results:", results.data);
          const parsedStudents = results.data
            .filter((row: any) => row["Full Name"] && row["Mobile Number"])
            .map((row: any, index: number) => ({
              full_name: row["Full Name"],
              mobileNo: row["Mobile Number"].toString(),
              rollNo: row["Roll Number"] ? row["Roll Number"].toString() : "",
              id: `temp-${index}`, // Temporary ID for UI purposes
            }));
          setStudents(parsedStudents);
          console.log("Parsed students:", parsedStudents);
          // Just update the state, don't do anything else
          toast({
            title: "File parsed successfully",
            description: `Found ${parsedStudents.length} students in the file`,
          });
        },
        error: (error) => {
          console.error("CSV parsing error:", error);
          toast({
            title: "Error parsing CSV",
            description: error.message,
            variant: "destructive",
          });
        },
      });
    } else if (fileType === "xlsx" || fileType === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          console.log("Excel parsing results:", jsonData);

          const parsedStudents = jsonData
            .filter((row: any) => row["Full Name"] && row["Mobile Number"])
            .map((row: any, index: number) => ({
              full_name: row["Full Name"],
              mobileNo: row["Mobile Number"].toString(),
              rollNo: row["Roll Number"] ? row["Roll Number"].toString() : "",
              id: `temp-${index}`, // Temporary ID for UI purposes
            }));

          setStudents(parsedStudents);
          console.log("Parsed students:", parsedStudents);
          // Just update the state, don't do anything else
          toast({
            title: "File parsed successfully",
            description: `Found ${parsedStudents.length} students in the file`,
          });
        } catch (error: any) {
          console.error("Excel parsing error:", error);
          toast({
            title: "Error parsing Excel file",
            description: error.message,
            variant: "destructive",
          });
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      console.error("Unsupported file type:", fileType);
      toast({
        title: "Unsupported file format",
        description: "Please upload a CSV or Excel file",
        variant: "destructive",
      });
    }
  };

  const handleOpenEditDialog = (student: Student) => {
    setEditingStudent({ ...student });
    setIsEditDialogOpen(true);
  };

  const handleSaveEditedStudent = () => {
    if (!editingStudent) return;

    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === editingStudent.id
          ? {
              ...editingStudent,
              // Trim values to avoid whitespace issues
              full_name: editingStudent.full_name.trim(),
              mobileNo: editingStudent.mobileNo.trim(),
              rollNo: editingStudent.rollNo?.trim() || "",
            }
          : student
      )
    );

    setIsEditDialogOpen(false);
    setEditingStudent(null);

    toast({
      title: "Student updated",
      description: "Student information has been updated",
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents((prevStudents) =>
      prevStudents.filter((student) => student.id !== studentId)
    );

    toast({
      title: "Student removed",
      description: "Student has been removed from the list",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    isIntentionalSubmit.current = true;

    if (!className.trim()) {
      toast({
        title: "Class name is required",
        variant: "destructive",
      });
      return;
    }

    if (students.length === 0) {
      toast({
        title: "Please add at least one student",
        variant: "destructive",
      });
      return;
    }

    // Check for duplicates before submitting
    if (
      duplicateWarnings.rollNumbers.length > 0 ||
      duplicateWarnings.mobileNumbers.length > 0
    ) {
      toast({
        title: "Please fix duplicates before continuing",
        description:
          "There are duplicate roll numbers or mobile numbers in your student list",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Make sure we have the teacher's ID from auth context
      const teacherId = user?.id;

      if (!teacherId) {
        toast({
          title: "Authentication error",
          description: "User ID not found. Please login again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log("Creating class with teacher ID:", teacherId);

      // Use the axios API client for the POST request
      const response = await apiClient.post("/classes", {
        title: className,
        teacherId: teacherId,
        students: students.map(
          ({ id, isEditing, hasDuplicateRoll, ...rest }) => rest
        ),
      });

      console.log("Class creation response:", response.data);

      toast({
        title: "Class created successfully",
        description: `Created class "${className}" with ${students.length} students`,
      });

      // Navigate to the dashboard or the new class page
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Error creating class:", error);

      // Handle API-specific errors
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message || error.message;
        toast({
          title: "Error creating class",
          description: errorMessage,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error creating class",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Create New Class</h1>

      <Card>
        <form
          id="create-class-form"
          onSubmit={(e) => {
            // Only allow form submission if intentional
            if (!isIntentionalSubmit.current) {
              console.log("Blocking unintentional form submission");
              e.preventDefault();
              return;
            }
            handleSubmit(e);
          }}
        >
          <CardHeader>
            <CardTitle>Class Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="className">Class Name</Label>
              <Input
                id="className"
                placeholder="e.g., 10 A, 11 B, 12 C"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Student Data</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/20"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <File className="h-8 w-8 text-primary" />
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-sm font-medium">
                      {students.length} students found
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setFile(null);
                        setStudents([]);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="mb-1 font-medium">
                      Drag and drop your file here
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      Upload a CSV or Excel file with student information
                    </p>
                    <div>
                      <label htmlFor="file-upload">
                        <Button
                          type="button"
                          variant="outline"
                          className="relative"
                          onClick={() =>
                            document.getElementById("file-upload")?.click()
                          }
                        >
                          Browse Files
                          <input
                            id="file-upload"
                            type="file"
                            className="sr-only"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileChange}
                          />
                        </Button>
                      </label>
                    </div>
                  </>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                The file should have columns for "Full Name", "Mobile Number",
                and "Roll Number" as shown in the example.
              </p>
            </div>

            {/* Display warnings for duplicate roll or mobile numbers */}
            {(duplicateWarnings.rollNumbers.length > 0 ||
              duplicateWarnings.mobileNumbers.length > 0) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Duplicates detected</AlertTitle>
                <AlertDescription>
                  {duplicateWarnings.rollNumbers.length > 0 && (
                    <div className="mt-2">
                      <p>Duplicate roll numbers:</p>
                      <ul className="list-disc pl-5 mt-1">
                        {duplicateWarnings.rollNumbers.map((roll, index) => (
                          <li key={`roll-${index}`}>{roll}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {duplicateWarnings.mobileNumbers.length > 0 && (
                    <div className="mt-2">
                      <p>Duplicate mobile numbers:</p>
                      <ul className="list-disc pl-5 mt-1">
                        {duplicateWarnings.mobileNumbers.map(
                          (mobile, index) => (
                            <li key={`mobile-${index}`}>{mobile}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
                  <p className="mt-2">
                    Please fix the duplicates before submitting.
                  </p>
                </AlertDescription>
              </Alert>
            )}

            {students.length > 0 && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label>Student Preview</Label>
                  <p className="text-sm text-muted-foreground">
                    {students.length} students
                  </p>
                </div>
                <Card>
                  <ScrollArea className="h-64">
                    <div className="grid grid-cols-4 text-sm font-medium bg-muted px-4 py-2 border-b">
                      <div>Name</div>
                      <div>Mobile</div>
                      <div>Roll No.</div>
                      <div className="text-right">Actions</div>
                    </div>
                    {students.map((student) => (
                      <div
                        key={student.id}
                        className={`grid grid-cols-4 px-4 py-3 text-sm border-b last:border-0 hover:bg-muted/30 ${
                          student.hasDuplicateRoll ? "bg-red-50" : ""
                        }`}
                      >
                        <div className="truncate">{student.full_name}</div>
                        <div>{student.mobileNo}</div>
                        <div
                          className={
                            student.hasDuplicateRoll
                              ? "text-red-500 font-medium"
                              : ""
                          }
                        >
                          {student.rollNo || "-"}
                          {student.hasDuplicateRoll && (
                            <AlertCircle className="inline-block ml-1 h-4 w-4" />
                          )}
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditDialog(student)}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              student.id && handleDeleteStudent(student.id)
                            }
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </Card>
              </div>
            )}
          </CardContent>

          <CardFooter>
            <Button
              type="button"
              onClick={() => {
                isIntentionalSubmit.current = true;
                handleSubmit(new Event("submit") as unknown as React.FormEvent);
              }}
              className="w-full bg-[#7359F8] hover:bg-[#5e47c9]"
              disabled={
                isLoading ||
                students.length === 0 ||
                duplicateWarnings.rollNumbers.length > 0 ||
                duplicateWarnings.mobileNumbers.length > 0
              }
            >
              {isLoading ? "Creating Class..." : "Create Class"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="student-name">Full Name</Label>
              <Input
                id="student-name"
                value={editingStudent?.full_name || ""}
                onChange={(e) =>
                  setEditingStudent((prev) =>
                    prev ? { ...prev, full_name: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-mobile">Mobile Number</Label>
              <Input
                id="student-mobile"
                value={editingStudent?.mobileNo || ""}
                onChange={(e) =>
                  setEditingStudent((prev) =>
                    prev ? { ...prev, mobileNo: e.target.value } : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="student-roll">Roll Number</Label>
              <Input
                id="student-roll"
                value={editingStudent?.rollNo || ""}
                onChange={(e) =>
                  setEditingStudent((prev) =>
                    prev ? { ...prev, rollNo: e.target.value } : null
                  )
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveEditedStudent}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreateClass;
