import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Upload, Check, FileText, FileUp, Save } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const AssignmentSetup = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("paper");
  const [formState, setFormState] = useState({
    title: "New Assignment",
    subject: "",
    maxMarks: "",
    description: "",
    paperUploaded: false,
    rubricUploaded: false,
    markingSchemeUploaded: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormState({
      ...formState,
      [name]: value,
    });
  };

  const handleUploadPaper = () => {
    // Mock successful upload
    setFormState({
      ...formState,
      paperUploaded: true,
    });

    toast({
      title: "Paper Uploaded",
      description: "Question paper has been successfully uploaded",
    });
  };

  const handleUploadRubric = () => {
    // Mock successful upload
    setFormState({
      ...formState,
      rubricUploaded: true,
    });

    toast({
      title: "Rubric Uploaded",
      description: "Rubric has been successfully uploaded",
    });
  };

  const handleGenerateRubric = () => {
    if (!formState.paperUploaded) {
      toast({
        title: "Upload Paper First",
        description:
          "Please upload the question paper before generating a rubric",
        variant: "destructive",
      });
      return;
    }

    // Mock successful generation
    setFormState({
      ...formState,
      rubricUploaded: true,
    });

    toast({
      title: "Rubric Generated",
      description: "AI has generated a rubric based on the question paper",
    });
  };

  const handleUploadMarkingScheme = () => {
    // Mock successful upload
    setFormState({
      ...formState,
      markingSchemeUploaded: true,
    });

    toast({
      title: "Marking Scheme Uploaded",
      description: "Marking scheme has been successfully uploaded",
    });
  };

  const handleSaveAndActivate = () => {
    if (!formState.paperUploaded || !formState.rubricUploaded) {
      toast({
        title: "Missing Requirements",
        description:
          "Please upload both question paper and rubric before activating",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Assignment Activated",
      description: "Assignment has been saved and activated successfully",
    });

    navigate(`/assignment/${assignmentId}`);
  };

  const allUploaded = formState.paperUploaded && formState.rubricUploaded;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild className="p-0 h-auto">
            <Link to="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Assignment Setup
            </h1>
            <p className="text-muted-foreground">
              Configure your assignment before activating
            </p>
          </div>
        </div>

        <Button onClick={handleSaveAndActivate} disabled={!allUploaded}>
          <Check className="mr-2 h-4 w-4" />
          Save & Activate
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Assignment Details</CardTitle>
              <CardDescription>
                Basic information about the assignment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formState.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Midterm Exam"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formState.subject}
                  onChange={handleInputChange}
                  placeholder="e.g., Algebra"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxMarks">Maximum Marks</Label>
                <Input
                  id="maxMarks"
                  name="maxMarks"
                  type="number"
                  value={formState.maxMarks}
                  onChange={handleInputChange}
                  placeholder="e.g., 100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formState.description}
                  onChange={handleInputChange}
                  placeholder="Add a description for this assignment"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Setup Progress</CardTitle>
              <CardDescription>Required steps to activate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full p-1 ${
                      formState.paperUploaded
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Check size={16} />
                  </div>
                  <span
                    className={formState.paperUploaded ? "text-green-600" : ""}
                  >
                    Upload Question Paper
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full p-1 ${
                      formState.rubricUploaded
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Check size={16} />
                  </div>
                  <span
                    className={formState.rubricUploaded ? "text-green-600" : ""}
                  >
                    Set Up Rubric
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full p-1 ${
                      formState.markingSchemeUploaded
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Check size={16} />
                  </div>
                  <span
                    className={
                      formState.markingSchemeUploaded ? "text-green-600" : ""
                    }
                  >
                    Upload Marking Scheme (Optional)
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  setFormState((prev) => ({
                    ...prev,
                    paperUploaded: false,
                    rubricUploaded: false,
                    markingSchemeUploaded: false,
                  }))
                }
              >
                Reset Progress
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="paper">Question Paper</TabsTrigger>
          <TabsTrigger value="rubric">Rubric</TabsTrigger>
          <TabsTrigger value="marking">Marking Scheme</TabsTrigger>
        </TabsList>

        <TabsContent value="paper" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Question Paper</CardTitle>
              <CardDescription>
                Upload your question paper as a PDF or image
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formState.paperUploaded ? (
                <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-green-50">
                  <FileText size={60} className="text-green-600 mb-4" />
                  <p className="text-green-600 font-medium mb-2">
                    Question Paper Uploaded
                  </p>
                  <p className="text-sm text-green-600 mb-6">
                    Your question paper has been successfully uploaded
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                      View Paper
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUploadPaper}
                    >
                      Replace
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg">
                  <FileUp size={60} className="text-muted-foreground mb-4" />
                  <p className="text-sm text-center text-muted-foreground mb-6 max-w-md">
                    Upload your question paper. Our AI will automatically
                    extract questions and prepare for grading.
                  </p>
                  <Button onClick={handleUploadPaper}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Question Paper
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rubric" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Set Up Rubric</CardTitle>
              <CardDescription>
                Upload an existing rubric or generate one using AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formState.rubricUploaded ? (
                <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-green-50">
                  <FileText size={60} className="text-green-600 mb-4" />
                  <p className="text-green-600 font-medium mb-2">
                    Rubric Ready
                  </p>
                  <p className="text-sm text-green-600 mb-6">
                    Your rubric has been set up and is ready for grading
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                      View Rubric
                    </Button>
                    <Button variant="outline" size="sm">
                      Edit Rubric
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg">
                  <FileUp size={60} className="text-muted-foreground mb-4" />
                  <p className="text-sm text-center text-muted-foreground mb-6 max-w-md">
                    Either upload your existing rubric or let our AI generate
                    one based on your question paper.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={handleUploadRubric}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Rubric
                    </Button>
                    <Button
                      onClick={handleGenerateRubric}
                      disabled={!formState.paperUploaded}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Generate with AI
                    </Button>
                  </div>
                  {!formState.paperUploaded && (
                    <p className="mt-4 text-xs text-amber-600">
                      Upload question paper first to enable AI generation
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Marking Scheme (Optional)</CardTitle>
              <CardDescription>
                Upload a marking scheme or solution for reference
              </CardDescription>
            </CardHeader>
            <CardContent>
              {formState.markingSchemeUploaded ? (
                <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-green-50">
                  <FileText size={60} className="text-green-600 mb-4" />
                  <p className="text-green-600 font-medium mb-2">
                    Marking Scheme Uploaded
                  </p>
                  <p className="text-sm text-green-600 mb-6">
                    Your marking scheme has been uploaded successfully
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                      View Marking Scheme
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUploadMarkingScheme}
                    >
                      Replace
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-lg">
                  <FileUp size={60} className="text-muted-foreground mb-4" />
                  <p className="text-sm text-center text-muted-foreground mb-6 max-w-md">
                    Upload your marking scheme or solution if available. This
                    will help with the grading process.
                  </p>
                  <Button variant="outline" onClick={handleUploadMarkingScheme}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Marking Scheme
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssignmentSetup;
