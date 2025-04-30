
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  Download, 
  Search,
  FileText
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AssignmentOverview } from "@/components/Analytics/AssignmentOverview";
import { StudentResultsTable } from "@/components/Analytics/StudentResultsTable";
import { useToast } from "@/hooks/use-toast";

const AnalyticsPage = () => {
  const [selectedClass, setSelectedClass] = useState("10A");
  const [selectedAssignment, setSelectedAssignment] = useState("midterm");
  const { toast } = useToast();
  
  // Mock data for analytics
  const analyticsData = {
    averageScore: 76,
    highestScore: 96,
    lowestScore: 42,
    submissionCount: 28,
    totalStudents: 32,
    scoreDistribution: [
      { range: "90-100%", count: 5, color: "#22C55E" },
      { range: "80-89%", count: 8, color: "#65A30D" },
      { range: "70-79%", count: 7, color: "#F59E0B" },
      { range: "60-69%", count: 5, color: "#F97316" },
      { range: "Below 60%", count: 3, color: "#EF4444" },
    ],
    questionPerformance: [
      { questionNumber: 1, averageScore: 82, maxScore: 10 },
      { questionNumber: 2, averageScore: 68, maxScore: 8 },
      { questionNumber: 3, averageScore: 75, maxScore: 7 },
      { questionNumber: 4, averageScore: 80, maxScore: 10 },
      { questionNumber: 5, averageScore: 60, maxScore: 15 },
    ]
  };
  
  // Mock data for student results
  const studentResults = [
    {
      id: "ST001",
      name: "John Doe",
      score: 43,
      maxScore: 50,
      percentage: 86,
      grade: "B",
      status: "shared" as const,
      submissionDate: "Apr 10, 2023",
    },
    {
      id: "ST002",
      name: "Jane Smith",
      score: 48,
      maxScore: 50,
      percentage: 96,
      grade: "A",
      status: "shared" as const,
      submissionDate: "Apr 10, 2023",
    },
    {
      id: "ST003",
      name: "Robert Johnson",
      score: 38,
      maxScore: 50,
      percentage: 76,
      grade: "C",
      status: "not-shared" as const,
      submissionDate: "Apr 11, 2023",
    },
    {
      id: "ST004",
      name: "Emily Davis",
      score: 41,
      maxScore: 50,
      percentage: 82,
      grade: "B",
      status: "shared" as const,
      submissionDate: "Apr 10, 2023",
    },
    {
      id: "ST005",
      name: "Michael Brown",
      score: 35,
      maxScore: 50,
      percentage: 70,
      grade: "C",
      status: "not-shared" as const,
      submissionDate: "Apr 12, 2023",
    },
  ];
  
  const handleViewResult = (id: string) => {
    toast({
      title: "View Result",
      description: `Viewing result for student ID: ${id}`,
    });
  };
  
  const handleShareResult = (id: string) => {
    toast({
      title: "Result Shared",
      description: `Result shared with student ID: ${id}`,
    });
  };
  
  const handleDownloadResult = (id: string) => {
    toast({
      title: "Result Downloaded",
      description: `Downloaded result for student ID: ${id}`,
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button variant="ghost" asChild className="mr-2">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">View assignment analytics and student performance</p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Select Assignment</CardTitle>
          <CardDescription>
            Choose a class and assignment to view analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-1/3">
              <label className="text-sm font-medium mb-1 block">Class</label>
              <Select
                value={selectedClass}
                onValueChange={setSelectedClass}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10A">Mathematics Grade 10A</SelectItem>
                  <SelectItem value="11B">Mathematics Grade 11B</SelectItem>
                  <SelectItem value="12C">Calculus Advanced 12C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="sm:w-1/3">
              <label className="text-sm font-medium mb-1 block">Assignment</label>
              <Select
                value={selectedAssignment}
                onValueChange={setSelectedAssignment}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="midterm">Midterm Exam</SelectItem>
                  <SelectItem value="quiz1">Quiz 1: Linear Equations</SelectItem>
                  <SelectItem value="quiz2">Quiz 2: Probability</SelectItem>
                  <SelectItem value="finalexam">Final Exam</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="sm:w-1/3 flex items-end">
              <Button className="w-full">
                <Search className="mr-2 h-4 w-4" />
                View Analytics
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Student Results</TabsTrigger>
          <TabsTrigger value="questions">Question Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="py-6">
          <AssignmentOverview {...analyticsData} />
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Key Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <FileText className="text-amber-500 h-5 w-5 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Question 5 needs attention</h4>
                    <p className="text-sm text-muted-foreground">
                      Students scored an average of 60% on question 5, which is significantly lower than other questions.
                      Consider reviewing the related concepts with the class.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <FileText className="text-green-500 h-5 w-5 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Strong performance on Question 1</h4>
                    <p className="text-sm text-muted-foreground">
                      Students performed well on question 1 with an average score of 82%, showing a good understanding of linear equations.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <FileText className="text-blue-500 h-5 w-5 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Missing submissions</h4>
                    <p className="text-sm text-muted-foreground">
                      4 students haven't submitted their assignments yet. Consider sending a reminder or extending the deadline.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="students" className="py-6">
          <StudentResultsTable 
            results={studentResults}
            onViewResult={handleViewResult}
            onShareResult={handleShareResult}
            onDownloadResult={handleDownloadResult}
          />
        </TabsContent>
        
        <TabsContent value="questions" className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analyticsData.questionPerformance.map((question, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">Question {question.questionNumber}</CardTitle>
                  <CardDescription>Average Score: {question.averageScore}%</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${question.averageScore}%` }}
                      ></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Max Score:</span>{" "}
                        <span className="font-medium">{question.maxScore} points</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Avg Score:</span>{" "}
                        <span className="font-medium">
                          {(question.maxScore * question.averageScore / 100).toFixed(1)} points
                        </span>
                      </div>
                    </div>
                    
                    <Button variant="outline" className="w-full">
                      View Detailed Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsPage;
