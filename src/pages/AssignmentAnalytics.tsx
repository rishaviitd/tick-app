
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const AssignmentAnalytics = () => {
  const { assignmentId } = useParams<{ assignmentId: string }>();
  
  // Mock data for the charts
  const scoreDistribution = [
    { range: "0-10", count: 2 },
    { range: "11-20", count: 5 },
    { range: "21-30", count: 12 },
    { range: "31-40", count: 8 },
    { range: "41-50", count: 3 },
  ];
  
  const questionPerformance = [
    { name: "Q1", average: 85, max: 100 },
    { name: "Q2", average: 65, max: 100 },
    { name: "Q3", average: 92, max: 100 },
    { name: "Q4", average: 78, max: 100 },
    { name: "Q5", average: 45, max: 100 },
  ];
  
  const performanceCategories = [
    { name: "Excellent", value: 15, color: "#4ade80" },
    { name: "Good", value: 30, color: "#60a5fa" },
    { name: "Average", value: 40, color: "#facc15" },
    { name: "Poor", value: 15, color: "#f87171" }
  ];
  
  const timeSpentData = [
    { name: "<15 min", count: 5 },
    { name: "15-30 min", count: 15 },
    { name: "30-45 min", count: 8 },
    { name: ">45 min", count: 2 },
  ];
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild className="p-0 h-auto">
            <Link to={`/assignment/${assignmentId}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Linear Equations Test • Mathematics Grade 10</p>
          </div>
        </div>
        
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">78%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Highest Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">96%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">94%</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Class Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">30</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Score Distribution</CardTitle>
            <CardDescription>Number of students in each score range</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Question Performance</CardTitle>
            <CardDescription>Average score per question</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={questionPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="average" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Categories</CardTitle>
            <CardDescription>Student performance distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performanceCategories}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {performanceCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Time Spent</CardTitle>
            <CardDescription>Estimated time spent by students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeSpentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="count" fill="#ffa726" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Areas for Improvement</CardTitle>
          <CardDescription>Topics that students struggled with</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Question 5: Systems of Linear Equations</h3>
                <p className="text-sm text-muted-foreground">
                  45% average score. Students struggled with solving systems of equations with 3 variables.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <FileText className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h3 className="font-medium">Question 2: Word Problems</h3>
                <p className="text-sm text-muted-foreground">
                  65% average score. Students had difficulty translating word problems into mathematical expressions.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignmentAnalytics;
