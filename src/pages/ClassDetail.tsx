import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassData } from "@/types/class";
import { ClassSummary } from "@/components/Class/ClassSummary";
import { AssignmentsTab } from "@/components/Class/AssignmentsTab";
import { StudentsTab } from "@/components/Class/StudentsTab";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

// Configure axios base URL
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

interface Student {
  id: string;
  name: string;
  mobile: string;
  roll: string;
}

interface Assignment {
  id: string;
  title: string;
  subject: string;
  date: string;
  status: "draft" | "active" | "completed";
  completion: number;
  maxMarks?: number;
}

const ClassDetail = () => {
  const { classId } = useParams<{ classId: string }>();
  const [activeTab, setActiveTab] = useState("assignments");
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!classId) return;

    const fetchClassData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get auth token from localStorage
        const token =
          localStorage.getItem("token") || localStorage.getItem("authToken");
        const headers = token
          ? {
              Authorization: `Bearer ${token}`,
              "x-auth-token": token,
            }
          : {};

        // Fetch students
        const studentsResponse = await axios.get(
          `/api/v1/classes/students?classId=${classId}`,
          { headers }
        );

        // Transform student data to match our interface
        const students: Student[] = studentsResponse.data.data.map(
          (student: any) => ({
            id: student._id,
            name: student.full_name,
            mobile: student.mobileNo,
            roll: student.rollNo || "",
          })
        );

        // Fetch assignments for this class
        const assignmentsResponse = await axios
          .get(`/api/v1/classes/${classId}/assignments`, { headers })
          .catch((err) => {
            console.error("Error fetching assignments:", err);
            // Return a default empty array if assignment API fails
            return { data: { data: [] } };
          });

        // Transform assignment data to match our interface
        const assignments: Assignment[] =
          assignmentsResponse.data.data?.map((assignment: any) => ({
            id: assignment._id,
            title: assignment.title,
            subject: "Math", // Default subject for now
            date: new Date(
              assignment.createdAt || Date.now()
            ).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            status: assignment.active ? "active" : "completed",
            completion: assignment.active ? 0 : 100,
            maxMarks: 0, // We'll need to calculate this from questions later
          })) || [];

        setClassData({
          id: classId,
          name: studentsResponse.data.classTitle,
          section: "",
          studentCount: students.length,
          students,
          assignments,
        });
      } catch (err: any) {
        console.error("Error fetching class data:", err);
        setError(
          err.response?.data?.message ||
            "Failed to fetch class data. Please try again."
        );
        toast({
          title: "Error",
          description: "Failed to fetch class data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClassData();
  }, [classId, toast]);

  if (isLoading) {
    return <div className="flex justify-center p-6">Loading class data...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-6">{error}</div>;
  }

  if (!classData) {
    return <div className="p-6">No class data found</div>;
  }

  return (
    <div className="space-y-6">
      <ClassSummary classData={classData} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="students">
            Students ({classData.students.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-6 mt-4">
          <AssignmentsTab
            classId={classData.id}
            assignments={classData.assignments}
          />
        </TabsContent>

        <TabsContent value="students" className="mt-4">
          <StudentsTab students={classData.students} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassDetail;
