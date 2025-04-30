
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface AssignmentOverviewProps {
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  submissionCount: number;
  totalStudents: number;
  scoreDistribution: {
    range: string;
    count: number;
    color: string;
  }[];
  questionPerformance: {
    questionNumber: number;
    averageScore: number;
    maxScore: number;
  }[];
}

export const AssignmentOverview = ({
  averageScore,
  highestScore,
  lowestScore,
  submissionCount,
  totalStudents,
  scoreDistribution,
  questionPerformance,
}: AssignmentOverviewProps) => {
  const completionPercentage = Math.round((submissionCount / totalStudents) * 100);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="text-lg">Assignment Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Average Score</p>
              <p className="text-2xl font-bold">{averageScore}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Highest Score</p>
              <p className="text-2xl font-bold">{highestScore}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lowest Score</p>
              <p className="text-2xl font-bold">{lowestScore}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completion</p>
              <p className="text-2xl font-bold">{completionPercentage}%</p>
              <p className="text-xs text-muted-foreground">{submissionCount} out of {totalStudents} students</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Question Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={questionPerformance}
                margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="questionNumber" 
                  label={{ 
                    value: 'Question Number', 
                    position: 'insideBottom', 
                    offset: -10 
                  }} 
                />
                <YAxis 
                  label={{ 
                    value: 'Average Score (%)', 
                    angle: -90, 
                    position: 'insideLeft' 
                  }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Average Score']}
                  labelFormatter={(label) => `Question ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="averageScore" 
                  stroke="#4F46E5" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Score Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={scoreDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="count"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {scoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [value, 'Students']}
                  labelFormatter={(index) => scoreDistribution[index as number].range}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {scoreDistribution.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                ></div>
                <span className="text-xs">{entry.range}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
