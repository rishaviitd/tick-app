
import { Card, CardContent } from "@/components/ui/card";
import { Users, FileText, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ClassCardProps {
  id: string;
  name: string;
  section: string; // Kept for compatibility but won't be displayed
  studentCount: number;
  assignments: number;
  pending: number;
  onClick: () => void;
  onImportStudents: () => void; // Kept for compatibility but won't be used
}

export const ClassCard = ({ 
  id,
  name, 
  studentCount, 
  assignments, 
  pending, 
  onClick
}: ClassCardProps) => {
  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-all duration-300 group border border-gray-200 active:bg-gray-50"
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{name}</h3>
          {pending > 0 && (
            <Badge variant="outline" className="bg-amber-100 text-amber-800">
              {pending} Active
            </Badge>
          )}
        </div>
        
        <div className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users size={16} />
            <span>{studentCount} Students</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText size={16} />
            <span>{assignments} Assignments</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
