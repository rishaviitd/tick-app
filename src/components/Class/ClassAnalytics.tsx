
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AssignmentSummary } from "@/types/class";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip, 
  PieChart, 
  Pie, 
  Cell
} from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

interface ClassAnalyticsProps {
  assignments: AssignmentSummary[];
}

export const ClassAnalytics = ({ assignments }: ClassAnalyticsProps) => {
  const isMobile = useIsMobile();
  
  // Calculate subject performance data
  const subjectPerformance = assignments
    .filter(a => a.status === "completed")
    .reduce((acc: {name: string, value: number, count: number}[], assignment) => {
      const existingSubject = acc.find(item => item.name === assignment.subject);
      if (existingSubject) {
        existingSubject.value += assignment.completion;
        existingSubject.count += 1;
      } else {
        acc.push({ name: assignment.subject, value: assignment.completion, count: 1 });
      }
      return acc;
    }, [])
    .map(item => ({ name: item.name, value: Math.round(item.value / item.count) }));
  
  // Calculate monthly performance data
  const monthlyPerformance = assignments
    .filter(a => a.status === "completed")
    .reduce((acc: {name: string, completed: number, total: number}[], assignment) => {
      const date = new Date(assignment.date);
      const monthYear = date.toLocaleString('default', { month: 'short', year: '2-digit' });
      
      const existingMonth = acc.find(item => item.name === monthYear);
      if (existingMonth) {
        existingMonth.completed += 1;
        existingMonth.total += 1;
      } else {
        acc.push({ name: monthYear, completed: 1, total: 1 });
      }
      return acc;
    }, []);

  // Assignment count by status
  const assignmentStatusData = [
    { name: "Active", value: assignments.filter(a => a.status === "active").length, color: "#60a5fa" },
    { name: "Completed", value: assignments.filter(a => a.status === "completed").length, color: "#4ade80" },
    { name: "Draft", value: assignments.filter(a => a.status === "draft").length, color: "#d1d5db" }
  ];

  // Generate colors for pie chart
  const SUBJECT_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088fe"];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold tracking-tight mt-6">Class Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completed Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {assignments.filter(a => a.status === "completed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {assignments.filter(a => a.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Completion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(
                assignments.reduce((sum, assignment) => sum + assignment.completion, 0) / 
                (assignments.length || 1)
              )}%
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Assignment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={isMobile ? "h-[200px]" : "h-[250px]"}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assignmentStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {assignmentStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={isMobile ? "h-[200px]" : "h-[250px]"}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={subjectPerformance}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Completion']} />
                  <Bar dataKey="value" fill="#8884d8">
                    {subjectPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={SUBJECT_COLORS[index % SUBJECT_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
