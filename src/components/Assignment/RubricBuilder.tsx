
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
  FileUp,
  PlusCircle, 
  Wand2, 
  Trash, 
  Edit
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export interface RubricCriteria {
  id: string;
  title: string;
  description: string;
  points: number;
}

interface RubricBuilderProps {
  questionId: string;
  criteria: RubricCriteria[];
  onCriteriaUpdate: (criteria: RubricCriteria[]) => void;
}

export const RubricBuilder = ({ 
  questionId, 
  criteria, 
  onCriteriaUpdate 
}: RubricBuilderProps) => {
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCriteriaId, setEditingCriteriaId] = useState<string | null>(null);
  
  // New criteria form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPoints, setNewPoints] = useState(5);
  
  const handleGenerateWithAI = () => {
    setIsAIGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const aiGeneratedCriteria: RubricCriteria[] = [
        {
          id: `crit-${Date.now()}-1`,
          title: "Mathematical Approach",
          description: "Student demonstrates a clear understanding of the mathematical concepts and applies the appropriate formulas and methods.",
          points: 10,
        },
        {
          id: `crit-${Date.now()}-2`,
          title: "Logical Reasoning",
          description: "Student shows step-by-step reasoning with clear explanations for each step of the solution.",
          points: 8,
        },
        {
          id: `crit-${Date.now()}-3`,
          title: "Accuracy of Calculations",
          description: "All calculations are performed correctly without arithmetic errors.",
          points: 7,
        },
        {
          id: `crit-${Date.now()}-4`,
          title: "Presentation and Organization",
          description: "Work is well-organized, legible, and follows a logical flow.",
          points: 5,
        },
      ];
      
      onCriteriaUpdate(aiGeneratedCriteria);
      setIsAIGenerating(false);
    }, 2000);
  };
  
  const handleAddCriteria = () => {
    if (!newTitle.trim()) return;
    
    const newCriteria: RubricCriteria = {
      id: editingCriteriaId || `crit-${Date.now()}`,
      title: newTitle,
      description: newDescription,
      points: newPoints,
    };
    
    if (editingCriteriaId) {
      // Editing existing criteria
      const updatedCriteria = criteria.map(crit => 
        crit.id === editingCriteriaId ? newCriteria : crit
      );
      onCriteriaUpdate(updatedCriteria);
    } else {
      // Adding new criteria
      onCriteriaUpdate([...criteria, newCriteria]);
    }
    
    resetForm();
    setIsAddDialogOpen(false);
  };
  
  const resetForm = () => {
    setNewTitle("");
    setNewDescription("");
    setNewPoints(5);
    setEditingCriteriaId(null);
  };
  
  const handleEditCriteria = (criteriaId: string) => {
    const criteriaToEdit = criteria.find(crit => crit.id === criteriaId);
    if (!criteriaToEdit) return;
    
    setNewTitle(criteriaToEdit.title);
    setNewDescription(criteriaToEdit.description);
    setNewPoints(criteriaToEdit.points);
    setEditingCriteriaId(criteriaId);
    setIsAddDialogOpen(true);
  };
  
  const handleDeleteCriteria = (criteriaId: string) => {
    onCriteriaUpdate(criteria.filter(crit => crit.id !== criteriaId));
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Rubric</CardTitle>
        <CardDescription>
          Define the grading criteria for this question
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    resetForm();
                    setIsAddDialogOpen(true);
                  }}
                >
                  <PlusCircle size={16} className="mr-2" />
                  Add Criteria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCriteriaId ? "Edit Criteria" : "Add Grading Criteria"}
                  </DialogTitle>
                  <DialogDescription>
                    Define what you'll be looking for when grading this question.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Criteria Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Mathematical approach"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe what you're looking for in this criteria"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      min="1"
                      value={newPoints}
                      onChange={(e) => setNewPoints(Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCriteria}>
                    {editingCriteriaId ? "Save Changes" : "Add Criteria"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Button variant="outline" onClick={handleGenerateWithAI} disabled={isAIGenerating}>
              <Wand2 size={16} className="mr-2" />
              {isAIGenerating ? "Generating..." : "Generate with AI"}
            </Button>
            
            <Button variant="outline">
              <FileUp size={16} className="mr-2" />
              Upload Rubric
            </Button>
          </div>
          
          {criteria.length > 0 ? (
            <div className="space-y-3 mt-4">
              {criteria.map((crit) => (
                <div 
                  key={crit.id}
                  className="border rounded-lg p-3 flex items-start justify-between"
                >
                  <div>
                    <div className="font-medium flex items-center">
                      {crit.title}
                      <span className="ml-2 text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                        {crit.points} points
                      </span>
                    </div>
                    {crit.description && (
                      <p className="text-sm text-muted-foreground mt-1">{crit.description}</p>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditCriteria(crit.id)}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteCriteria(crit.id)}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed rounded-lg p-8 text-center mt-4">
              <p className="text-muted-foreground mb-4">No rubric criteria defined yet</p>
              <div className="flex justify-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  <PlusCircle size={16} className="mr-2" />
                  Add Manually
                </Button>
                <Button variant="default" onClick={handleGenerateWithAI} disabled={isAIGenerating}>
                  <Wand2 size={16} className="mr-2" />
                  {isAIGenerating ? "Generating..." : "Generate with AI"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
