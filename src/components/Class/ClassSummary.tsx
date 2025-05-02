import { Card, CardContent } from "@/components/ui/card";
import { ClassData } from "@/types/class";
import { Users } from "lucide-react";

interface ClassSummaryProps {
  classData: ClassData;
}

export const ClassSummary = ({ classData }: ClassSummaryProps) => {
  return (
    <Card className="mb-6 border border-gray-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)]">
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-800 mb-2">
              {classData.name}
            </h1>
            <div className="flex items-center text-gray-600">
              <Users size={16} className="mr-2" />
              <span>{classData.studentCount} {classData.studentCount === 1 ? "student" : "students"}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
