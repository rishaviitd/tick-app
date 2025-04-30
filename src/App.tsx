import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AppLayout } from "./components/Layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import CreateAssignment from "./pages/CreateAssignment";
import CreateClass from "./pages/CreateClass";
import GradingPage from "./pages/GradingPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import StudentView from "./pages/StudentView";
import NotFound from "./pages/NotFound";
import ClassDetail from "./pages/ClassDetail";
import AssignmentDetail from "./pages/AssignmentDetail";
import AssignmentSetup from "./pages/AssignmentSetup";
import AssignmentAnalytics from "./pages/AssignmentAnalytics";
import AuthCallback from "./pages/AuthCallback";
import AuthError from "./pages/AuthError";
import FeedbackPage from "./pages/FeedbackPage";
import { AuthProvider } from "./context/AuthContext";
import { PrivateRoute } from "./components/PrivateRoute";

// Create a client
const queryClient = new QueryClient();

// Login page redirect component
const LoginRedirect = () => {
  window.location.href = "https://www.usetick.com/login";
  return null;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<LoginRedirect />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/auth/error" element={<AuthError />} />

              {/* Protected routes */}
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/class/:classId" element={<ClassDetail />} />
                <Route
                  path="/assignment/:assignmentId"
                  element={<AssignmentDetail />}
                />
                <Route
                  path="/assignment/setup/:assignmentId"
                  element={<AssignmentSetup />}
                />
                <Route
                  path="/assignment/:assignmentId/analytics"
                  element={<AssignmentAnalytics />}
                />
                <Route
                  path="/assignment/:assignmentId/student/:studentId/feedback"
                  element={<FeedbackPage />}
                />
                <Route
                  path="/create-assignment"
                  element={<CreateAssignment />}
                />
                <Route
                  path="/class/:classId/create-assignment"
                  element={<CreateAssignment />}
                />
                <Route path="/create-class" element={<CreateClass />} />
                <Route path="grading" element={<GradingPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
              </Route>

              {/* Student view might need different auth */}
              <Route path="/student-view" element={<StudentView />} />

              {/* Catch all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </QueryClientProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
