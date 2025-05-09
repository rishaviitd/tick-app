import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/auth/context/AuthContext";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import apiClient, { classApi } from "@/lib/api"; // Import the axios-based API client

// Types for our data
interface Class {
  _id: string;
  title: string;
  teacher: string;
  students: string[];
  assignments: string[];
}

// Debug component to test API calls

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const [error, setError] = useState<string | null>(null);
  const [hasInitiallyFetched, setHasInitiallyFetched] = useState(false);

  // Create a memoized fetch function to avoid recreation on each render
  const fetchClasses = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const teacherId = user.id;
      console.log("Dashboard: Fetching classes for teacher:", teacherId);

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
    } catch (err: any) {
      console.error("Error fetching classes:", err);

      // Check if this is the "No classes found" 404 error
      if (
        err.response &&
        err.response.status === 404 &&
        err.response.data &&
        err.response.data.message === "No classes found for this teacher"
      ) {
        // This is not an error, just an empty state
        setClasses([]);
      } else {
        // This is a real error
        toast({
          title: "Error loading classes",
          description: "Please try again later",
          variant: "destructive",
        });
        setError("Failed to load classes");
      }
    } finally {
      setIsLoading(false);
      setHasInitiallyFetched(true);
    }
  }, [isAuthenticated, user?.id, toast]);

  // Only fetch data once on mount, and when authentication/user changes
  useEffect(() => {
    console.log("Dashboard: useEffect triggered with:", {
      isAuthenticated,
      userId: user?.id,
      hasInitiallyFetched,
    });

    if (!hasInitiallyFetched && isAuthenticated && user?.id) {
      fetchClasses();
    }
  }, [isAuthenticated, user?.id, hasInitiallyFetched, fetchClasses]);

  // Handle routing for class items
  const handleClassClick = (classId: string) => {
    navigate(`/class/${classId}`);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Manage your classes</p>
      </div>

      <section>
        <Button
          onClick={() => navigate("/create-class")}
          className="w-full bg-[#58CC02] hover:bg-[#51AA02] mb-8"
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
                className="bg-white p-4 rounded-lg shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] cursor-pointer hover:shadow-lg transition-shadow border border-gray-100"
                onClick={() => handleClassClick(classItem._id)}
              >
                <h3 className="font-medium text-lg font-inter">
                  {classItem.title}
                </h3>
                <p className="text-gray-600">
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
    </div>
  );
};

export default Dashboard;
