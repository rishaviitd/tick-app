import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClassData } from "@/types/class";
import { ClassSummary } from "@/components/Class/ClassSummary";
import { AssignmentsTab } from "@/components/Class/AssignmentsTab";
import { StudentsTab } from "@/components/Class/StudentsTab";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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

const fetchDraftAssignments = async (
  classId: string,
  token: string
): Promise<Assignment[]> => {
  try {
    // Fetch drafts from the API
    const draftsEndpoint = `${axios.defaults.baseURL}/api/v1/assignments/drafts`;
    console.log("Fetching drafts from:", draftsEndpoint);

    const draftsResponse = await axios.get(draftsEndpoint, {
      headers: {
        "x-auth-token": token,
        Authorization: `Bearer ${token}`,
      },
    });

    // Transform draft data to match our interface and filter by classId
    // We'll check if the draft has a classId property and if it matches the current class
    const drafts: Assignment[] = (draftsResponse.data.drafts || [])
      .filter((draft: any) => {
        // Include all drafts if they don't have a classId
        return !draft.classId || draft.classId === classId;
      })
      .map((draft: any) => ({
        id: draft.title, // Using title as ID for drafts since they don't have proper IDs yet
        title: draft.title,
        subject: "Draft", // Mark as draft
        date: new Date(draft.lastUpdated || Date.now()).toLocaleDateString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          }
        ),
        status: "draft",
        completion: 0,
        maxMarks: draft.maxMarks || 0,
      }));

    return drafts;
  } catch (error) {
    console.error("Error fetching drafts:", error);
    // Return empty array if there's an error
    return [];
  }
};

const ClassDetail = () => {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("assignments");
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const location = useLocation(); // Get current location

  useEffect(() => {
    if (!classId) return;

    const fetchClassData = async () => {
      try {
        console.log("Fetching class data for classId:", classId);
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

        console.log("Fetched assignments for class:", assignmentsResponse.data);

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
            // Calculate completion based on graded students
            completion:
              assignment.students && assignment.students.length > 0
                ? Math.round(
                    (assignment.students.filter(
                      (s: any) => s.status === "graded"
                    ).length /
                      assignment.students.length) *
                      100
                  )
                : assignment.active
                ? 0
                : 100,
            maxMarks: assignment.maxMarks || 0,
          })) || [];

        // Get drafts if the user is authenticated
        if (token) {
          const drafts = await fetchDraftAssignments(classId, token);

          // Add the drafts to the assignments array
          assignments.push(...drafts);
        }

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
  }, [classId, toast, location.key]); // Add location.key to dependencies to refresh on navigation

  const handleCreateAssignment = () => {
    // Navigate to the create assignment page for this class
    navigate(`/class/${classId}/create-assignment`);
  };

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
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        onClick={() => navigate("/dashboard")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
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
            onCreateAssignment={handleCreateAssignment}
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
