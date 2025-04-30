import { Card, CardContent } from "@/components/ui/card";
import { ClassData } from "@/types/class";

interface ClassSummaryProps {
  classData: ClassData;
}

export const ClassSummary = ({ classData }: ClassSummaryProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {classData.name}
            </h1>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
