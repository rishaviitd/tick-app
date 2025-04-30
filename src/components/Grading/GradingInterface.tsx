
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Pencil, 
  CheckCircle, 
  Wand2, 
  FileText, 
  MessageSquare,
  RotateCcw
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GradingCriteria {
  id: string;
  title: string;
  description: string;
  maxPoints: number;
  points: number;
  feedback: string;
}

interface GradingInterfaceProps {
  submissionId: string;
  studentName: string;
  questionNumber: number;
  questionText: string;
  maxMarks: number;
  criteria: GradingCriteria[];
}

export const GradingInterface = ({
  submissionId,
  studentName,
  questionNumber,
  questionText,
  maxMarks,
  criteria: initialCriteria,
}: GradingInterfaceProps) => {
  const [isGrading, setIsGrading] = useState(false);
  const [criteria, setCriteria] = useState<GradingCriteria[]>(initialCriteria);
  const [overallFeedback, setOverallFeedback] = useState("");
  const [isAIGrading, setIsAIGrading] = useState(false);
  
  const totalPoints = criteria.reduce((sum, crit) => sum + crit.points, 0);
  const totalMaxPoints = criteria.reduce((sum, crit) => sum + crit.maxPoints, 0);
  const percentageScore = Math.round((totalPoints / totalMaxPoints) * 100);
  
  const handleCriteriaPointsChange = (id: string, points: number) => {
    setCriteria(prev => 
      prev.map(crit => 
        crit.id === id 
          ? { ...crit, points: Math.min(Math.max(0, points), crit.maxPoints) } 
          : crit
      )
    );
  };
  
  const handleCriteriaFeedbackChange = (id: string, feedback: string) => {
    setCriteria(prev => 
      prev.map(crit => 
        crit.id === id 
          ? { ...crit, feedback } 
          : crit
      )
    );
  };
  
  const handleAIGrade = () => {
    setIsAIGrading(true);
    
    // Simulate AI grading
    setTimeout(() => {
      // Mock AI-generated grades and feedback
      const aiGradedCriteria = criteria.map(crit => {
        const randomPoints = Math.floor(Math.random() * (crit.maxPoints + 1));
        let feedback = "";
        
        if (randomPoints < crit.maxPoints * 0.3) {
          feedback = "Needs significant improvement. The approach taken doesn't demonstrate understanding of the key concepts.";
        } else if (randomPoints < crit.maxPoints * 0.7) {
          feedback = "Shows partial understanding, but some key elements are missing or incorrectly applied.";
        } else {
          feedback = "Excellent work! Demonstrates thorough understanding of the concepts and applies them correctly.";
        }
        
        return {
          ...crit,
          points: randomPoints,
          feedback
        };
      });
      
      setCriteria(aiGradedCriteria);
      setOverallFeedback("The student has demonstrated partial understanding of the mathematical concepts. Work shows logical progression but has some conceptual gaps that need addressing. Calculations are mostly accurate but there are some errors that affected the final answer.");
      setIsAIGrading(false);
    }, 2500);
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div>
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Student Submission</CardTitle>
              <div className="text-sm text-muted-foreground">
                Question {questionNumber} • {maxMarks} marks
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <h4 className="font-medium mb-2">Question</h4>
              <p className="text-sm bg-muted p-3 rounded-md">{questionText}</p>
            </div>
            
            <div className="border rounded-md overflow-hidden">
              {/* This would be the actual scanned assignment in a real app */}
              <div className="bg-slate-100 h-[300px] sm:h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <FileText size={48} className="mx-auto mb-2 text-slate-400" />
                  <p className="text-sm text-slate-500">
                    {studentName}'s submission for Question {questionNumber}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                Grading: {studentName}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleAIGrade}
                  disabled={isAIGrading}
                >
                  <Wand2 size={16} className="mr-2" />
                  {isAIGrading ? "AI Grading..." : "Auto-Grade"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="criteria">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="criteria">Criteria</TabsTrigger>
                <TabsTrigger value="overall">Overall Feedback</TabsTrigger>
              </TabsList>
              
              <TabsContent value="criteria" className="space-y-4">
                <ScrollArea className="h-[350px] sm:h-[450px] pr-4">
                  {criteria.map((crit) => (
                    <div key={crit.id} className="border rounded-md p-3 mb-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="pr-2">
                          <h4 className="font-medium">{crit.title}</h4>
                          <p className="text-xs text-muted-foreground">{crit.description}</p>
                        </div>
                        <div className="flex items-center shrink-0">
                          <Input
                            type="number"
                            value={crit.points}
                            onChange={(e) => handleCriteriaPointsChange(crit.id, parseInt(e.target.value))}
                            className="w-16 text-center"
                            min="0"
                            max={crit.maxPoints}
                          />
                          <span className="text-sm text-muted-foreground ml-1">
                            / {crit.maxPoints}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`feedback-${crit.id}`} className="text-xs">Feedback</Label>
                        <Textarea
                          id={`feedback-${crit.id}`}
                          placeholder="Add feedback for this criteria..."
                          value={crit.feedback}
                          onChange={(e) => handleCriteriaFeedbackChange(crit.id, e.target.value)}
                          rows={2}
                          className="resize-none text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="overall">
                <div className="space-y-4">
                  <Textarea
                    placeholder="Add overall feedback for this question..."
                    value={overallFeedback}
                    onChange={(e) => setOverallFeedback(e.target.value)}
                    rows={8}
                    className="text-sm"
                  />
                  
                  <div className="flex gap-2">
                    <Button variant="outline" className="w-full">
                      <MessageSquare size={16} className="mr-2" />
                      Suggest Feedback
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setOverallFeedback("")}>
                      <RotateCcw size={16} className="mr-2" />
                      Clear
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-medium">
                    Total Score: {totalPoints}/{totalMaxPoints}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {percentageScore}% of maximum points
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: getScoreColor(percentageScore) }}>
                    {getGradeFromPercentage(percentageScore)}
                  </div>
                  <p className="text-xs text-muted-foreground">Grade</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="w-full">
                  <Pencil size={16} className="mr-2" />
                  Save Draft
                </Button>
                <Button className="w-full">
                  <CheckCircle size={16} className="mr-2" />
                  Submit Grade
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper functions
function getScoreColor(percentage: number): string {
  if (percentage >= 90) return "#22C55E"; // Green
  if (percentage >= 80) return "#65A30D"; // Lime
  if (percentage >= 70) return "#F59E0B"; // Amber
  if (percentage >= 60) return "#F97316"; // Orange
  return "#EF4444"; // Red
}

function getGradeFromPercentage(percentage: number): string {
  if (percentage >= 90) return "A";
  if (percentage >= 80) return "B";
  if (percentage >= 70) return "C";
  if (percentage >= 60) return "D";
  return "F";
}
