import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, FileText } from "lucide-react";
import { ClassCard } from "@/components/Dashboard/ClassCard";
import { useState, useEffect } from "react";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

// Configure axios base URL
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

interface Class {
  _id: string;
  title: string;
  students: string[];
  assignments: string[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        // Try to get auth info from localStorage
        let teacherId = null;
        let token =
          localStorage.getItem("token") || localStorage.getItem("authToken");

        // Try to get user data in different formats
        const userRaw = localStorage.getItem("user");

        // Try parsing user object if it exists
        if (userRaw) {
          try {
            const userData = JSON.parse(userRaw);
            teacherId = userData.id || userData._id || userData.userId;
          } catch (err) {
            console.error("Failed to parse user data:", err);
          }
        }

        // If still no userId, try direct keys
        if (!teacherId) {
          teacherId =
            localStorage.getItem("userId") ||
            localStorage.getItem("user_id") ||
            localStorage.getItem("id");
        }

        if (!teacherId) {
          console.error("No teacher ID found");
          setIsLoading(false);
          return;
        }

        console.log("Fetching classes for teacher:", teacherId);

        // Set auth header if token exists
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch classes for this teacher
        const response = await axios.get(
          `/api/v1/classes?teacher=${teacherId}`,
          { headers }
        );
        setClasses(response.data.data);
        console.log("Classes fetched:", response.data);
      } catch (error: any) {
        console.error("Error fetching classes:", error);
        toast({
          title: "Error loading classes",
          description:
            error.response?.data?.message || "Failed to load your classes",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [toast]);

  return (
    <div className="space-y-6 relative min-h-screen pb-28">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Manage your classes</p>
        </div>
        <Button
          onClick={() => navigate("/create-class")}
          className="mt-4 md:mt-0 bg-[#7359F8] hover:bg-[#6247e0] text-white flex items-center justify-center md:justify-start gap-2 px-4 py-2 rounded-full shadow w-full md:w-auto"
        >
          <Plus size={16} />
          <span>Class</span>
        </Button>
      </div>

      {/* Classes Section */}
      <section>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading your classes...
          </div>
        ) : classes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {classes.map((cls) => (
              <ClassCard
                key={cls._id}
                id={cls._id}
                name={cls.title}
                section=""
                studentCount={cls.students.length}
                assignments={cls.assignments.length}
                pending={0}
                onClick={() => navigate(`/class/${cls._id}`)}
                onImportStudents={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            You have no classes yet. Create your first class!
          </div>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
