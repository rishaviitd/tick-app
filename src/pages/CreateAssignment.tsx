import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import "katex/dist/katex.min.css";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileUp,
  PlusCircle,
  Wand2,
  Trash,
  Edit,
  CheckSquare,
  Square,
  GripVertical,
  Upload,
  ArrowLeft,
  FileText,
  Save,
  Download,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";

// API paths - use relative paths to work with the vite proxy
const API_PATH = "/api/v1";

// Model interfaces for the app
interface Question {
  id: string;
  questionText: string;
  maxMarks: number;
  order: number;
  rubric?: string;
}

interface ExtractedQuestion {
  text: string;
  points: number;
  sourceFile: string;
}

type FileStatus = "ready" | "processing" | "completed" | "failed";

type StatusCallback = (
  fileName: string,
  status: FileStatus,
  errorMessage?: string
) => void;

export const extractQuestionsFromFiles = async (
  files: File[],
  statusCallback?: StatusCallback
): Promise<ExtractedQuestion[]> => {
  const allQuestions: ExtractedQuestion[] = [];

  try {
    // Process files sequentially to avoid overwhelming the API
    for (const file of files) {
      try {
        if (statusCallback) {
          statusCallback(file.name, "processing");
        }

        const base64File = await fileToBase64(file).catch((error) => {
          console.error(`Error converting ${file.name} to base64:`, error);
          throw new Error(`Failed to process ${file.name}: ${error.message}`);
        });

        const requestData = {
          contents: [
            {
              parts: [
                {
                  text: `Extract all questions from this document and return ONLY a JSON object with this exact structure. Always use markdown for mathematical varibles, expression, and equations. No code blocks should be present. If points/marks are not specified for a question, set the points value to 0:
                         {
                           "questions": [
                             {
                               "text": "The complete question text",
                               "points": number (if specified, otherwise 0),
                             }
                           ]
                         }`,
                },
                {
                  inline_data: {
                    mime_type: file.type,
                    data: base64File,
                  },
                },
              ],
            },
          ],
        };

        // Add request validation
        if (!base64File || !file.type) {
          throw new Error(`Invalid file data for ${file.name}`);
        }

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro-exp:generateContent?key=${
            import.meta.env.VITE_GOOGLE_API_KEY
          }`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error(`API Error for ${file.name}:`, errorData);
          throw new Error(
            `Failed to process ${file.name}: ${
              errorData.error?.message || response.statusText
            }`
          );
        }

        const data = await response.json();

        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
          throw new Error(`No valid content extracted from ${file.name}`);
        }

        let responseText = data.candidates[0].content.parts[0].text;

        // Clean up the response text
        try {
          // Remove any code fences (e.g., ```json or ```)
          responseText = responseText.replace(/```[a-zA-Z]*\n?/g, "");
          responseText = responseText.replace(/```/g, "");
          // Trim whitespace
          responseText = responseText.trim();

          // Extract only the JSON substring between first '{' and last '}'
          const jsonStart = responseText.indexOf("{");
          const jsonEnd = responseText.lastIndexOf("}");
          const jsonString =
            jsonStart >= 0 && jsonEnd > jsonStart
              ? responseText.slice(jsonStart, jsonEnd + 1)
              : responseText;
          // Parse the cleaned JSON string
          const parsedResponse = JSON.parse(jsonString);

          if (
            !parsedResponse.questions ||
            !Array.isArray(parsedResponse.questions)
          ) {
            throw new Error(
              `Invalid questions array in response from ${file.name}`
            );
          }

          const questionsWithSource = parsedResponse.questions.map((q) => ({
            ...q,
            sourceFile: file.name,
          }));

          allQuestions.push(...questionsWithSource);

          if (statusCallback) {
            statusCallback(file.name, "completed");
          }
        } catch (parseError) {
          console.error(`Error parsing response for ${file.name}:`, {
            originalText: data.candidates[0].content.parts[0].text,
            cleanedText: responseText,
            error: parseError,
          });
          throw new Error(
            `Failed to parse content from ${file.name}: ${
              parseError instanceof Error ? parseError.message : "Unknown error"
            }`
          );
        }

        // Add delay between files to avoid rate limiting
        await delay(1000);
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        if (statusCallback) {
          statusCallback(
            file.name,
            "failed",
            fileError instanceof Error ? fileError.message : "Unknown error"
          );
        }
        // Continue with next file instead of stopping the entire process
        continue;
      }
    }

    if (allQuestions.length === 0) {
      throw new Error(
        "No questions were successfully extracted from any files"
      );
    }

    return allQuestions.sort((a, b) => {
      if (a.sourceFile !== b.sourceFile) {
        return a.sourceFile.localeCompare(b.sourceFile);
      }
      return 0;
    });
  } catch (error) {
    console.error("Error in question extraction:", error);
    throw error;
  }
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();

      reader.onload = () => {
        try {
          const result = reader.result;
          if (typeof result === "string") {
            const base64String = result.split(",")[1];
            resolve(base64String);
          } else {
            reject(
              new Error(
                "Failed to process file: FileReader result is not a string"
              )
            );
          }
        } catch (error) {
          reject(
            new Error(
              `Failed to process file content: ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            )
          );
        }
      };

      reader.onerror = (event) => {
        reject(
          new Error(
            `Failed to read file: ${
              event.target ? "File read error" : "Unknown error"
            }`
          )
        );
      };

      reader.readAsDataURL(file);
    } catch (error) {
      reject(
        new Error(
          `Failed to initialize file reader: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        )
      );
    }
  });
};

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

interface Draft {
  title: string;
  maxMarks: number;
  questions: {
    text: string;
    points: number;
    rubric?: string;
  }[];
  lastUpdated: string;
}

const CreateAssignment = () => {
  const [activeTab, setActiveTab] = useState("questions");
  const [title, setTitle] = useState("");
  const [showTitleDialog, setShowTitleDialog] = useState(false);
  const [savingAction, setSavingAction] = useState<
    "draft" | "assignment" | null
  >(null);
  const [maxMarks, setMaxMarks] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileStatus, setFileStatus] = useState<
    Record<string, { status: FileStatus; error?: string }>
  >({});
  const [extractedQuestions, setExtractedQuestions] = useState<
    ExtractedQuestion[]
  >([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [questionRubrics, setQuestionRubrics] = useState<
    Record<string, string>
  >({});
  const [generatingRubric, setGeneratingRubric] = useState<
    Record<string, boolean>
  >({});

  const navigate = useNavigate();
  const location = useLocation();
  const { classId } = useParams<{ classId?: string }>();
  const { toast } = useToast();
  const { isAuthenticated, isLoading, token: authToken } = useAuth();

  // Parse the URL to check if we're editing an existing assignment
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get("edit");

    if (editId) {
      // In a real app, we would fetch the assignment data here
      // For now, we'll set some mock data
      setTitle("Linear Equations Test");
      setMaxMarks("50");

      // Mock questions for editing
      setQuestions([
        {
          id: "q1",
          questionText: "Solve the quadratic equation: 2x² + 5x - 3 = 0",
          maxMarks: 10,
          order: 1,
        },
        {
          id: "q2",
          questionText: "Find the derivative of f(x) = x³ + 2x² - 5x + 7",
          maxMarks: 8,
          order: 2,
        },
      ]);
    }
  }, [location]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    if (imageFiles.length === 0) {
      toast({
        title: "Invalid Files",
        description: "Please upload image files only (jpg, png, etc.)",
        variant: "destructive",
      });
      return;
    }

    setUploadedImages(imageFiles);
    setFileStatus(
      imageFiles.reduce((acc, file) => {
        acc[file.name] = { status: "ready" };
        return acc;
      }, {})
    );

    toast({
      title: "Images Uploaded",
      description: `${imageFiles.length} image(s) uploaded successfully.`,
    });
  };

  const updateFileStatus = (
    fileName: string,
    status: FileStatus,
    error: string | null = null
  ) => {
    setFileStatus((prev) => ({
      ...prev,
      [fileName]: { status, ...(error ? { error } : {}) },
    }));
  };

  const handleAnalyzeImages = async () => {
    if (uploadedImages.length === 0) {
      toast({
        title: "No Images",
        description: "Please upload images first before analyzing.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const extractedData = await extractQuestionsFromFiles(
        uploadedImages,
        updateFileStatus
      );

      // Convert to Question format
      const formattedQuestions = extractedData.map((q, index) => ({
        id: crypto.randomUUID(),
        questionText: q.text,
        maxMarks: q.points || 0,
        order: index + 1,
      }));

      setQuestions(formattedQuestions);
      setExtractedQuestions(extractedData);

      toast({
        title: "Analysis Complete",
        description: `${formattedQuestions.length} questions extracted. Please review and build rubrics.`,
      });

      setActiveTab("rubric");
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description:
          error.message || "Failed to analyze images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const handleQuestionChange = (
    questionId: string,
    field: keyof Question,
    value: string | number
  ) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, [field]: value } : q))
    );
  };

  const handleGenerateRubric = async (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    setGeneratingRubric((prev) => ({ ...prev, [questionId]: true }));

    toast({
      title: "Generating Rubric",
      description: "AI is generating a rubric for this question...",
    });

    try {
      // Call the AI API to generate a rubric
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-pro-exp:generateContent?key=${
          import.meta.env.VITE_GOOGLE_API_KEY
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Generate a detailed grading rubric for the following math question.
                    The rubric should include:
                    1. Key concepts being tested
                    2. Step-by-step solution approach
                    3. Marking scheme with point distribution
                    4. Common mistakes students might make
                    
                    Format the rubric with markdown.
                    
                    Question: ${question.questionText}
                    Total marks: ${question.maxMarks}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate rubric");
      }

      const data = await response.json();
      const rubricText = data.candidates[0]?.content?.parts[0]?.text || "";

      // Update the question's rubric
      setQuestionRubrics((prev) => ({ ...prev, [questionId]: rubricText }));

      // Also update the questions array
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId ? { ...q, rubric: rubricText } : q
        )
      );

      toast({
        title: "Rubric Generated",
        description: "The rubric has been generated successfully.",
      });
    } catch (error) {
      console.error("Error generating rubric:", error);
      toast({
        title: "Rubric Generation Failed",
        description: "Failed to generate rubric. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingRubric((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  // Calculate total marks from questions
  const calculateTotalMarks = useCallback(() => {
    return questions.reduce(
      (total, question) => total + (question.maxMarks || 0),
      0
    );
  }, [questions]);

  const handleSaveWithTitle = () => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please provide a title for the assignment.",
        variant: "destructive",
      });
      return;
    }

    setShowTitleDialog(false);

    if (savingAction === "draft") {
      saveAsDraft();
    } else if (savingAction === "assignment") {
      saveAssignment();
    }
  };

  const initiateAssignmentSave = () => {
    if (!title.trim()) {
      setSavingAction("assignment");
      setShowTitleDialog(true);
    } else {
      saveAssignment();
    }
  };

  const initiateDraftSave = () => {
    if (!title.trim()) {
      setSavingAction("draft");
      setShowTitleDialog(true);
    } else {
      saveAsDraft();
    }
  };

  const saveAssignment = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { returnTo: location.pathname } });
      return;
    }

    if (questions.length === 0) {
      toast({
        title: "Missing Questions",
        description: "Please upload and analyze at least one question image.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = authToken;
      const calculatedMaxMarks = calculateTotalMarks();

      // Format data for creating the assignment
      const assignmentData = {
        title,
        maxMarks: calculatedMaxMarks,
        questions: questions.map((q) => ({
          text: q.questionText,
          maxMarks: q.maxMarks,
          rubric: q.rubric || questionRubrics[q.id] || "",
        })),
        active: true, // Set as active by default
        classId: classId, // Pass the current classId from URL params
      };

      // Call the API to create the assignment
      const response = await fetch(`${API_PATH}/assignments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token as string,
        },
        body: JSON.stringify(assignmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create assignment");
      }

      const data = await response.json();

      // If this was created from a draft, delete the draft
      if (title) {
        try {
          await fetch(`${API_PATH}/drafts/${encodeURIComponent(title)}`, {
            method: "DELETE",
            headers: {
              "x-auth-token": token as string,
            },
          });
        } catch (error) {
          console.error(
            "Error deleting draft after creating assignment:",
            error
          );
          // Continue even if draft deletion fails
        }
      }

      toast({
        title: "Assignment Created",
        description:
          "The assignment has been created and activated successfully.",
      });

      // Navigate to the class page if classId exists, otherwise to dashboard
      if (classId) {
        navigate(`/class/${classId}`);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Error creating assignment:", error);
      toast({
        title: "Creation Failed",
        description:
          error.message || "Failed to create assignment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const saveAsDraft = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { returnTo: location.pathname } });
      return;
    }

    if (extractedQuestions.length === 0) {
      toast({
        title: "No Questions",
        description: "Please extract questions before saving as draft.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = authToken;
      const calculatedMaxMarks = calculateTotalMarks();

      // Format data for the API
      const draftData = {
        title,
        maxMarks: calculatedMaxMarks,
        questions: extractedQuestions.map((q, index) => ({
          text: q.text,
          points: q.points || 0,
          rubric:
            questions[index]?.rubric ||
            questionRubrics[questions[index]?.id] ||
            "",
        })),
      };

      console.log("Sending draft data:", draftData);
      console.log("Using token:", token);
      const draftEndpoint = `${API_PATH}/drafts`;
      console.log("Sending request to:", draftEndpoint);

      // Call the API to save the draft
      const response = await fetch(draftEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": token as string,
        },
        body: JSON.stringify(draftData),
      });

      console.log("Draft save response status:", response.status);
      // Safely parse JSON, fallback to empty object on parse failure
      let responseData: any;
      const responseText = await response.text();
      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = {};
      }
      console.log("Draft save response:", responseData);

      if (!response.ok) {
        const message =
          responseData.message || response.statusText || "Failed to save draft";
        throw new Error(message);
      }

      toast({
        title: "Draft Saved",
        description: "The assignment draft has been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    }
  };

  const fetchDrafts = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { returnTo: location.pathname } });
      return;
    }
    try {
      setIsLoadingDrafts(true);
      const token = authToken;
      const draftsEndpoint = `${API_PATH}/drafts`;
      console.log("Fetching drafts from:", draftsEndpoint);

      const response = await fetch(draftsEndpoint, {
        headers: {
          "x-auth-token": token as string,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to load drafts");
      }

      const data = await response.json();
      setDrafts(data.drafts || []);
    } catch (error) {
      console.error("Error loading drafts:", error);
      toast({
        title: "Error Loading Drafts",
        description:
          error.message || "Failed to load drafts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDrafts(false);
    }
  };

  const loadDraft = async (draftTitle: string) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { returnTo: location.pathname } });
      return;
    }
    try {
      const token = authToken;
      const response = await fetch(
        `${API_PATH}/drafts/${encodeURIComponent(draftTitle)}`,
        {
          headers: {
            "x-auth-token": token as string,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to load draft");
      }

      const { draft } = await response.json();

      // Update the form with the draft data
      setTitle(draft.title);
      setMaxMarks(draft.maxMarks.toString());

      // Format the questions for the UI
      const formattedExtractedQuestions = draft.questions.map((q) => ({
        text: q.text,
        points: q.points,
        sourceFile: "", // Empty source file as we're loading from draft
      }));

      setExtractedQuestions(formattedExtractedQuestions);

      // Also set questions for the rubric tab and prepare the rubric data
      const newQuestionRubrics: Record<string, string> = {};

      const formattedQuestions = draft.questions.map((q, index) => {
        const id = crypto.randomUUID();

        // Store the rubric text for this question ID
        if (q.rubric) {
          newQuestionRubrics[id] = q.rubric;
        }

        return {
          id,
          questionText: q.text,
          maxMarks: q.points,
          order: index + 1,
          rubric: q.rubric || "",
        };
      });

      // Set the questions state
      setQuestions(formattedQuestions);

      // Set the rubric texts in the questionRubrics state to display in text areas
      setQuestionRubrics(newQuestionRubrics);

      setShowDraftDialog(false);

      // Switch to the rubric tab if there are rubrics
      if (Object.keys(newQuestionRubrics).length > 0) {
        setActiveTab("rubric");
      }

      toast({
        title: "Draft Loaded",
        description: `Draft "${draft.title}" has been loaded successfully.`,
      });
    } catch (error) {
      console.error("Error loading draft:", error);
      toast({
        title: "Error Loading Draft",
        description: error.message || "Failed to load draft. Please try again.",
        variant: "destructive",
      });
    }
  };

  const deleteDraft = async (draftTitle: string) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { returnTo: location.pathname } });
      return;
    }
    try {
      const token = authToken;
      const response = await fetch(
        `${API_PATH}/drafts/${encodeURIComponent(draftTitle)}`,
        {
          method: "DELETE",
          headers: {
            "x-auth-token": token as string,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete draft");
      }

      // Remove the draft from the list
      setDrafts(drafts.filter((d) => d.title !== draftTitle));

      toast({
        title: "Draft Deleted",
        description: `Draft "${draftTitle}" has been deleted.`,
      });
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast({
        title: "Error Deleting Draft",
        description:
          error.message || "Failed to delete draft. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Create Assignment</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (!isAuthenticated) {
                navigate("/login", { state: { returnTo: location.pathname } });
                return;
              }
              fetchDrafts();
              setShowDraftDialog(true);
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Load Draft
          </Button>
          {!isLoading && !isAuthenticated && (
            <Button
              variant="outline"
              onClick={() =>
                navigate("/login", { state: { returnTo: location.pathname } })
              }
              className="text-red-500 border-red-200 hover:bg-red-50"
            >
              Log in to save progress
            </Button>
          )}
          {isAuthenticated && (
            <Button variant="outline" disabled>
              <span className="text-green-500">✓</span>
              <span className="ml-2">Authenticated</span>
            </Button>
          )}
        </div>
      </div>

      {/* Title Input Dialog */}
      <Dialog open={showTitleDialog} onOpenChange={setShowTitleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assignment Details</DialogTitle>
            <DialogDescription>
              Please provide a title for your assignment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title-dialog">Title</Label>
              <Input
                id="title-dialog"
                placeholder="e.g., Midterm Exam, Quiz 1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Total Marks</Label>
              <div className="text-sm bg-muted p-2 rounded-md">
                {calculateTotalMarks()} marks (calculated from questions)
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTitleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveWithTitle}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Drafts Dialog */}
      <Dialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Load Assignment Draft</DialogTitle>
            <DialogDescription>
              Select a draft to continue working on it.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[400px] overflow-y-auto">
            {isLoadingDrafts ? (
              <div className="flex justify-center items-center py-8">
                <div className="w-6 h-6 border-2 border-t-[#7359F8] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <span className="ml-2">Loading drafts...</span>
              </div>
            ) : drafts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No drafts found. Create and save a draft first.
              </div>
            ) : (
              <div className="space-y-2">
                {drafts.map((draft, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-3 flex justify-between items-center"
                  >
                    <div>
                      <h3 className="font-medium">{draft.title}</h3>
                      <div className="text-sm text-muted-foreground">
                        {draft.questions.length} questions • {draft.maxMarks}{" "}
                        marks
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last updated:{" "}
                        {new Date(draft.lastUpdated).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadDraft(draft.title)}
                      >
                        Load
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteDraft(draft.title)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="rubric">Build Rubric</TabsTrigger>
        </TabsList>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                {!uploadedImages.length ? (
                  <>
                    <FileUp
                      size={40}
                      className="mx-auto text-muted-foreground"
                    />
                    <div>
                      <p className="font-medium">
                        Upload and Extract Questions using AI
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload images of your question paper for analysis
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        multiple
                        className="hidden"
                      />
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="outline"
                        className="w-full max-w-xs"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Question Paper
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-center mb-4">
                      <FileText size={40} className="text-[#7359F8]" />
                    </div>
                    <div>
                      <p className="font-medium">Question Paper Uploaded</p>
                      <div className="mt-2 space-y-1">
                        {uploadedImages.map((file, index) => (
                          <p
                            key={index}
                            className="text-sm text-muted-foreground"
                          >
                            {file.name} ({(file.size / 1024).toFixed(1)} KB)
                            {fileStatus[file.name] && (
                              <span
                                className={`ml-2 ${
                                  fileStatus[file.name].status === "completed"
                                    ? "text-green-500"
                                    : fileStatus[file.name].status === "failed"
                                    ? "text-red-500"
                                    : fileStatus[file.name].status ===
                                      "processing"
                                    ? "text-amber-500"
                                    : "text-gray-500"
                                }`}
                              >
                                {fileStatus[file.name].status === "completed"
                                  ? "✓"
                                  : fileStatus[file.name].status === "failed"
                                  ? "✗"
                                  : fileStatus[file.name].status ===
                                    "processing"
                                  ? "..."
                                  : ""}
                              </span>
                            )}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                      <Button
                        onClick={handleAnalyzeImages}
                        className="w-full max-w-xs bg-[#7359F8] hover:bg-[#5e47c9]"
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></div>
                            Analyzing with AI...
                          </>
                        ) : (
                          <>
                            <Wand2 className="mr-2 h-4 w-4" />
                            Analyze with AI
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setUploadedImages([]);
                          setFileStatus({});
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                        className="text-sm"
                      >
                        Upload Different Paper
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {extractedQuestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Extracted Questions</CardTitle>
                <CardDescription>
                  {extractedQuestions.length} questions extracted from your
                  paper
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {extractedQuestions.map((question, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">Question {index + 1}</h3>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            className="w-16 h-8 text-sm border rounded px-2"
                            value={question.points || 0}
                            min="0"
                            onChange={(e) => {
                              const newValue = parseInt(e.target.value) || 0;
                              const updatedQuestions = [...extractedQuestions];
                              updatedQuestions[index] = {
                                ...updatedQuestions[index],
                                points: newValue,
                              };
                              setExtractedQuestions(updatedQuestions);

                              // Also update questions array for rubric tab
                              const updatedFormattedQuestions = [...questions];
                              if (updatedFormattedQuestions[index]) {
                                updatedFormattedQuestions[index].maxMarks =
                                  newValue;
                                setQuestions(updatedFormattedQuestions);
                              } else {
                                // Create a new question with unique ID if it doesn't exist
                                const newQuestion: Question = {
                                  id: crypto.randomUUID(),
                                  questionText: updatedQuestions[index].text,
                                  maxMarks: newValue,
                                  order: index,
                                };
                                setQuestions([
                                  ...updatedFormattedQuestions,
                                  newQuestion,
                                ]);
                              }
                            }}
                          />
                          <span className="text-sm text-gray-600">marks</span>
                        </div>
                      </div>
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkMath]}
                          rehypePlugins={[rehypeKatex, rehypeRaw]}
                        >
                          {question.text}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={initiateDraftSave}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save as Draft
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rubric" className="space-y-4">
          {questions.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center space-y-3">
                <p className="font-medium">No questions analyzed yet</p>
                <p className="text-sm text-muted-foreground">
                  Upload and analyze question images first
                </p>
                <Button onClick={() => setActiveTab("questions")}>
                  Upload Questions
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <h3 className="text-lg font-medium">Build Rubric</h3>

              <Accordion type="single" collapsible className="w-full">
                {questions.map((question, index) => (
                  <AccordionItem key={question.id} value={question.id}>
                    <AccordionTrigger className="hover:bg-gray-50 p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          Question {index + 1}
                        </span>
                        <span className="font-medium truncate max-w-[200px]">
                          {question.maxMarks > 0 && (
                            <span className="text-sm text-[#7359F8] mr-2">
                              [{question.maxMarks} marks]
                            </span>
                          )}
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex, rehypeRaw]}
                            components={{
                              p: ({ node, ...props }) => <span {...props} />,
                            }}
                          >
                            {question.questionText.length > 30
                              ? `${question.questionText.substring(0, 30)}...`
                              : question.questionText || "No question text"}
                          </ReactMarkdown>
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 border-t">
                      <div className="space-y-4">
                        <div className="prose prose-sm max-w-none mb-4">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex, rehypeRaw]}
                          >
                            {question.questionText}
                          </ReactMarkdown>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            variant="outline"
                            onClick={() => handleGenerateRubric(question.id)}
                            disabled={generatingRubric[question.id]}
                          >
                            {generatingRubric[question.id] ? (
                              <>
                                <div className="w-4 h-4 border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></div>
                                Generating...
                              </>
                            ) : (
                              <>
                                <Wand2 size={16} className="mr-2" />
                                Generate with AI
                              </>
                            )}
                          </Button>
                          <Button variant="outline">
                            <FileUp size={16} className="mr-2" />
                            Upload Rubric
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`rubric-${question.id}`}>
                            Rubric
                          </Label>
                          <Textarea
                            id={`rubric-${question.id}`}
                            placeholder="Define grading criteria for this question..."
                            className="min-h-[150px]"
                            value={questionRubrics[question.id] || ""}
                            onChange={(e) =>
                              setQuestionRubrics((prev) => ({
                                ...prev,
                                [question.id]: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="mt-6 flex flex-col space-y-3">
                <Button
                  onClick={initiateDraftSave}
                  variant="outline"
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Draft
                </Button>
                <Button
                  onClick={initiateAssignmentSave}
                  className="w-full bg-[#7359F8] hover:bg-[#5e47c9]"
                >
                  Create Assignment
                </Button>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreateAssignment;
