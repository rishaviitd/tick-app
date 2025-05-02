import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/context/AuthContext";
import { PlusCircle, BookOpen, Users, Calendar, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import apiClient, { classApi } from "@/lib/api"; // Import the axios-based API client

// Types for our data
interface Class {
  _id: string;
  title: string;
  teacher: string;
  students: string[];
  assignments: string[];
}

// Debug component to test API calls - hidden in production
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
    <div className="fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">Manage your classes and assignments</p>
      </div>

      <section className="mb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classes.length}</div>
            </CardContent>
            <CardFooter>
              <LayoutGrid className="text-primary mr-2 h-4 w-4" />
              <span className="text-xs text-gray-500">Active classes</span>
            </CardFooter>
          </Card>
          
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {classes.reduce((total, c) => total + c.students.length, 0)}
              </div>
            </CardContent>
            <CardFooter>
              <Users className="text-blue-500 mr-2 h-4 w-4" />
              <span className="text-xs text-gray-500">Enrolled students</span>
            </CardFooter>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {classes.reduce((total, c) => total + c.assignments.length, 0)}
              </div>
            </CardContent>
            <CardFooter>
              <BookOpen className="text-amber-500 mr-2 h-4 w-4" />
              <span className="text-xs text-gray-500">Total assignments</span>
            </CardFooter>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Last Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-md font-bold">Today</div>
            </CardContent>
            <CardFooter>
              <Calendar className="text-purple-500 mr-2 h-4 w-4" />
              <span className="text-xs text-gray-500">Recent updates</span>
            </CardFooter>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Your Classes</h2>
          <Button
            onClick={() => navigate("/create-class")}
            className="bg-primary hover:bg-accent text-white"
          >
            <PlusCircle className="mr-2 h-4 w-4" /> New Class
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your classes...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {classes.map((classItem) => (
              <Card 
                key={classItem._id}
                className="card-with-hover cursor-pointer overflow-hidden bg-white"
                onClick={() => handleClassClick(classItem._id)}
              >
                <div className="h-2 bg-primary"></div>
                <CardHeader>
                  <CardTitle className="text-xl">{classItem.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>
                      {classItem.students.length} student
                      {classItem.students.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2 text-gray-600">
                    <BookOpen className="h-4 w-4" />
                    <span>
                      {classItem.assignments.length} assignment
                      {classItem.assignments.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="bg-secondary/30 text-xs text-gray-500">
                  Click to manage class
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center border-dashed border-2">
            <div className="flex flex-col items-center justify-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">No Classes Yet</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                You haven't created any classes yet. Create your first class to get started with tick AI.
              </p>
              <Button
                onClick={() => navigate("/create-class")}
                className="bg-primary hover:bg-accent text-white"
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Create First Class
              </Button>
            </div>
          </Card>
        )}
      </section>

      {/* Only show debugger in development */}
      {import.meta.env.DEV && <ApiDebugger />}
    </div>
  );
};

export default Dashboard;
