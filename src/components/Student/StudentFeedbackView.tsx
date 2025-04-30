
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, FileText, MessageSquare } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FeedbackItem {
  questionNumber: number;
  questionText: string;
  score: number;
  maxScore: number;
  feedback: string;
  criteriaFeedback: {
    criteriaName: string;
    score: number;
    maxScore: number;
    feedback: string;
  }[];
}

interface StudentFeedbackViewProps {
  studentName: string;
  assignmentTitle: string;
  totalScore: number;
  maxScore: number;
  grade: string;
  submissionDate: string;
  gradedDate: string;
  feedbackItems: FeedbackItem[];
  allowRegrade: boolean;
  onRequestRegrade: () => void;
}

export const StudentFeedbackView = ({
  studentName,
  assignmentTitle,
  totalScore,
  maxScore,
  grade,
  submissionDate,
  gradedDate,
  feedbackItems,
  allowRegrade,
  onRequestRegrade
}: StudentFeedbackViewProps) => {
  const totalPercentage = Math.round((totalScore / maxScore) * 100);
  
  const getScoreColor = (percentage: number): string => {
    if (percentage >= 90) return "bg-green-100 text-green-800";
    if (percentage >= 80) return "bg-lime-100 text-lime-800";
    if (percentage >= 70) return "bg-amber-100 text-amber-800";
    if (percentage >= 60) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:justify-between md:items-start">
            <div>
              <CardTitle className="text-xl mb-2">{assignmentTitle}</CardTitle>
              <CardDescription>
                Results for {studentName}
              </CardDescription>
            </div>
            <Badge 
              variant="outline" 
              className={`${getScoreColor(totalPercentage)} text-lg px-3 py-1 self-start mt-2 md:mt-0`}
            >
              {grade}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Score</p>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{totalScore}</span>
                <span className="text-lg text-muted-foreground ml-1">/ {maxScore}</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{totalPercentage}%</p>
              
              <div className="mt-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Submission Date</span>
                  <span>{submissionDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Graded Date</span>
                  <span>{gradedDate}</span>
                </div>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground mb-1">Score Breakdown</p>
              <Progress value={totalPercentage} className="h-3 mb-2" />
              
              <div className="space-y-2 mt-4">
                {feedbackItems.map((item) => (
                  <div key={item.questionNumber} className="flex justify-between text-sm">
                    <span>Question {item.questionNumber}</span>
                    <div className="flex items-center">
                      <span className="font-medium">{item.score}</span>
                      <span className="text-muted-foreground ml-1">/ {item.maxScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <Button variant="outline">
            <Download size={16} className="mr-2" />
            Download PDF
          </Button>
          {allowRegrade && (
            <Button onClick={onRequestRegrade}>
              <MessageSquare size={16} className="mr-2" />
              Request Regrade
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Tabs defaultValue="feedback">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="feedback">Detailed Feedback</TabsTrigger>
          <TabsTrigger value="submission">Your Submission</TabsTrigger>
        </TabsList>
        
        <TabsContent value="feedback" className="space-y-6">
          {feedbackItems.map((item) => (
            <Card key={item.questionNumber}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">Question {item.questionNumber}</CardTitle>
                  <div className="flex items-center">
                    <span className="font-bold">{item.score}</span>
                    <span className="text-muted-foreground ml-1">/ {item.maxScore}</span>
                  </div>
                </div>
                <CardDescription className="mt-1">
                  {item.questionText}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Overall Feedback</h4>
                    <p className="text-sm bg-muted rounded-md p-3">{item.feedback}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm mb-2">Detailed Criteria</h4>
                    <div className="space-y-3">
                      {item.criteriaFeedback.map((criteria, index) => (
                        <div key={index} className="border rounded-md p-3">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-medium text-sm">{criteria.criteriaName}</span>
                            <div className="flex items-center">
                              <span className="text-sm font-medium">{criteria.score}</span>
                              <span className="text-xs text-muted-foreground ml-1">/ {criteria.maxScore}</span>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{criteria.feedback}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="submission">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Submission</CardTitle>
              <CardDescription>
                View your submitted work for this assignment
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="bg-slate-100 flex items-center justify-center p-10">
                  <div className="text-center">
                    <FileText size={64} className="mx-auto mb-4 text-slate-400" />
                    <p className="text-slate-500 mb-2">
                      Student submission for {assignmentTitle}
                    </p>
                    <Button variant="outline" size="sm">
                      <Download size={16} className="mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
