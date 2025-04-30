import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import apiClient, { classApi } from "@/lib/api"; // Import the axios-based API client

// Debug component to test API calls
const ApiDebugger = () => {
  const { token, user } = useAuth();
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testClassesApi = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Testing API with axios client");

      // Use the axios API client to fetch classes
      const response = await apiClient.get(`/classes?teacher=${user?.id}`);
      console.log("Classes API response:", response.data);

      setApiResponse(response.data);
    } catch (err) {
      console.error("API test error:", err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-8 p-4 border border-red-300 rounded-md bg-red-50">
      <h3 className="font-bold text-red-800 mb-2">API Debugger</h3>
      <div className="mb-2">
        <Button
          onClick={testClassesApi}
          disabled={isLoading}
          variant="outline"
          className="bg-white text-red-700 border-red-700"
        >
          Test Classes API
        </Button>
      </div>

      {isLoading && <p className="text-gray-600">Testing API...</p>}

      {error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-600 rounded">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {apiResponse && (
        <div className="mt-2 overflow-auto max-h-48">
          <pre className="text-xs">{JSON.stringify(apiResponse, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

// Types for our data
interface Class {
  _id: string;
  title: string;
  teacher: string;
  students: string[];
  assignments: string[];
}

const Dashboard = () => {
  const { user, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("Dashboard: Component mounted, auth state:", {
      isAuthenticated,
      userId: user?.id,
    });

    const fetchClasses = async () => {
      try {
        setIsLoading(true);

        // Use the authenticated user's ID directly
        const teacherId = user?.id;

        if (!teacherId) {
          console.error("No teacher ID available");
          setClasses([]);
          return;
        }

        console.log("Dashboard: Fetching classes for teacher:", teacherId);

        // Use the axios API client
        const response = await apiClient.get(`/classes?teacher=${teacherId}`);
        const data = response.data;

        console.log("Dashboard: Classes data:", data);

        // Check if data has the expected structure
        if (data.data && Array.isArray(data.data)) {
          setClasses(data.data);
        } else {
          console.warn("Dashboard: Unexpected data format:", data);
          setClasses([]);
        }
      } catch (err) {
        console.error("Error fetching classes:", err);
        toast({
          title: "Error loading classes",
          description: "Please try again later",
          variant: "destructive",
        });
        setError("Failed to load classes");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && user?.id) {
      fetchClasses();
    }
  }, [toast, isAuthenticated, user, token]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Manage your classes</p>
      </div>

      <section>
        <Button
          onClick={() => navigate("/create-class")}
          className="w-full bg-indigo-600 mb-8"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Class
        </Button>

        {isLoading ? (
          <div className="text-center py-8">Loading your classes...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : classes.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {classes.map((classItem) => (
              <div
                key={classItem._id}
                className="bg-white p-4 rounded-lg shadow-md cursor-pointer"
                onClick={() => navigate(`/class/${classItem._id}`)}
              >
                <h3 className="font-medium text-lg">{classItem.title}</h3>
                <p>
                  {classItem.students.length} student
                  {classItem.students.length !== 1 ? "s" : ""}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            You have no classes yet. Create your first class!
          </div>
        )}
      </section>

      {/* Always show debugger for now to help diagnose issues */}
      <ApiDebugger />
    </div>
  );
};

export default Dashboard;
