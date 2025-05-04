import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

interface AssignmentCardProps {
  id: string;
  title: string;
  subject: string;
  date: string;
  status: "draft" | "active" | "completed";
  completion: number;
  maxMarks?: number;
}

export const AssignmentCard = ({
  id,
  title,
  subject,
  date,
  status,
  completion,
  maxMarks,
}: AssignmentCardProps) => {
  const navigate = useNavigate();

  const statusConfig = {
    draft: {
      label: "Draft",
      color: "bg-gray-50 text-gray-500 border-gray-200",
      icon: Clock,
    },
    active: {
      label: "Active",
      color: "bg-[#EEF9EE]/60 text-[#58CC02] border-[#EEF9EE]",
      icon: AlertCircle,
    },
    completed: {
      label: "Completed",
      color: "bg-[#EEF9EE]/60 text-[#51AA02] border-[#EEF9EE]",
      icon: CheckCircle,
    },
  };

  const StatusIcon = statusConfig[status].icon;

  const handleClick = () => {
    if (status === "draft") {
      navigate(`/create-assignment?draft=${encodeURIComponent(title)}`);
    } else {
      navigate(`/assignment/${id}`);
    }
  };

  return (
    <Card
      className="overflow-hidden hover:shadow-md transition-all duration-200 border border-gray-100/60 active:bg-gray-50/40 w-full"
      onClick={handleClick}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-base truncate pr-2">{title}</h3>
          {status !== "active" && (
            <Badge variant="outline" className={statusConfig[status].color}>
              {statusConfig[status].label}
            </Badge>
          )}
        </div>

        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>{date}</span>
            </div>
          </div>

          {status !== "draft" && (
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>{completion}%</span>
              </div>
              <Progress value={completion} className="h-2" />
            </div>
          )}

          {status === "draft" && (
            <div className="flex items-center gap-1.5 text-sm text-[#58CC02]">
              <StatusIcon size={14} />
              <span>Setup required</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
