
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Draggable, 
  DraggableProvided, 
  Droppable,
  DroppableProvided,
  DropResult,
  DragDropContext
} from "react-beautiful-dnd";
import { 
  GripVertical, 
  Trash, 
  PlusCircle, 
  Edit, 
  FileText 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export interface Question {
  id: string;
  questionText: string;
  maxMarks: number;
  order: number;
}

interface QuestionListProps {
  questions: Question[];
  onQuestionsUpdated: (questions: Question[]) => void;
}

export const QuestionList = ({ questions, onQuestionsUpdated }: QuestionListProps) => {
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editedQuestionText, setEditedQuestionText] = useState("");
  const [editedMaxMarks, setEditedMaxMarks] = useState(0);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    
    if (!destination) return;
    if (destination.index === source.index) return;
    
    const reorderedQuestions = Array.from(questions);
    const [movedQuestion] = reorderedQuestions.splice(source.index, 1);
    reorderedQuestions.splice(destination.index, 0, movedQuestion);
    
    // Update order property for each question
    const updatedQuestions = reorderedQuestions.map((q, index) => ({
      ...q,
      order: index + 1
    }));
    
    onQuestionsUpdated(updatedQuestions);
  };
  
  const handleEditQuestion = (question: Question) => {
    setEditingQuestionId(question.id);
    setEditedQuestionText(question.questionText);
    setEditedMaxMarks(question.maxMarks);
  };
  
  const handleSaveQuestion = () => {
    if (!editingQuestionId) return;
    
    const updatedQuestions = questions.map(q => 
      q.id === editingQuestionId 
        ? { ...q, questionText: editedQuestionText, maxMarks: editedMaxMarks } 
        : q
    );
    
    onQuestionsUpdated(updatedQuestions);
    setEditingQuestionId(null);
  };
  
  const handleDeleteQuestion = (id: string) => {
    const filteredQuestions = questions.filter(q => q.id !== id);
    const reorderedQuestions = filteredQuestions.map((q, index) => ({
      ...q,
      order: index + 1
    }));
    
    onQuestionsUpdated(reorderedQuestions);
  };
  
  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      questionText: "New question",
      maxMarks: 10,
      order: questions.length + 1
    };
    
    onQuestionsUpdated([...questions, newQuestion]);
    
    // Start editing the new question
    handleEditQuestion(newQuestion);
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Assignment Questions</CardTitle>
          <Button onClick={handleAddQuestion} variant="outline" size="sm">
            <PlusCircle size={16} className="mr-2" />
            Add Question
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="questions-list">
            {(provided: DroppableProvided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-3"
              >
                {questions.length === 0 ? (
                  <div className="text-center py-8 border border-dashed rounded-lg">
                    <FileText size={32} className="mx-auto mb-2 text-muted-foreground" />
                    <p className="text-muted-foreground">No questions added yet</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={handleAddQuestion}
                    >
                      Add Question
                    </Button>
                  </div>
                ) : (
                  questions.map((question, index) => (
                    <Draggable 
                      key={question.id} 
                      draggableId={question.id} 
                      index={index}
                    >
                      {(provided: DraggableProvided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="border rounded-lg p-3"
                        >
                          {editingQuestionId === question.id ? (
                            <div className="space-y-3">
                              <Textarea 
                                value={editedQuestionText}
                                onChange={(e) => setEditedQuestionText(e.target.value)}
                                placeholder="Enter question text"
                                className="w-full"
                              />
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <label className="text-sm mb-1 block">Max Marks</label>
                                  <Input 
                                    type="number"
                                    value={editedMaxMarks}
                                    onChange={(e) => setEditedMaxMarks(Number(e.target.value))}
                                    min="1"
                                  />
                                </div>
                                <div className="space-x-2 self-end">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => setEditingQuestionId(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button 
                                    size="sm"
                                    onClick={handleSaveQuestion}
                                  >
                                    Save
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-2">
                              <div {...provided.dragHandleProps} className="mt-1">
                                <GripVertical size={20} className="text-muted-foreground" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">
                                  Question {index + 1}
                                  <span className="ml-2 text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                                    {question.maxMarks} marks
                                  </span>
                                </div>
                                <p className="text-sm mt-1">{question.questionText}</p>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEditQuestion(question)}
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteQuestion(question.id)}
                                >
                                  <Trash size={16} />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  );
};
