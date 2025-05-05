// API client setup
import axios from "axios";

// API base URL - default to local development if not set
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://tick-backend-wg5c.onrender.com/api/v1";

// Create axios instance with common configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication API endpoints
export const authApi = {
  login: (credentials) => apiClient.post("/auth/login", credentials),
  register: (userData) => apiClient.post("/auth/register", userData),
  forgotPassword: (email) => apiClient.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) =>
    apiClient.post("/auth/reset-password", { token, password }),
};

// Class API endpoints
export const classApi = {
  getClasses: () => apiClient.get("/classes"),
  getClass: (classId) => apiClient.get(`/classes/${classId}`),
  createClass: (classData) => apiClient.post("/classes", classData),
  updateClass: (classId, classData) =>
    apiClient.put(`/classes/${classId}`, classData),
  deleteClass: (classId) => apiClient.delete(`/classes/${classId}`),
  getStudents: (classId) => apiClient.get(`/classes/${classId}/students`),
  addStudent: (classId, studentData) =>
    apiClient.post(`/classes/${classId}/students`, studentData),
};

// Assignment API endpoints
export const assignmentApi = {
  getAssignments: () => apiClient.get("/assignments"),
  getDetails: (assignmentId) => apiClient.get(`/assignments/${assignmentId}`),
  createAssignment: (assignmentData) =>
    apiClient.post("/assignments", assignmentData),
  updateAssignment: (assignmentId, assignmentData) =>
    apiClient.put(`/assignments/${assignmentId}`, assignmentData),
  deleteAssignment: (assignmentId) =>
    apiClient.delete(`/assignments/${assignmentId}`),

  // Student assignment management
  updateStudentAssignment: (assignmentId, studentId, data) =>
    apiClient.put(`/assignments/${assignmentId}/students/${studentId}`, data),

  // Available students
  getAvailableStudents: (assignmentId) =>
    apiClient.get(`/assignments/${assignmentId}/availableStudents`),

  // Draft management
  saveDraft: (draftData) => apiClient.post("/assignments/drafts", draftData),
  getDrafts: () => apiClient.get("/assignments/drafts"),
  getDraft: (draftId) => apiClient.get(`/assignments/drafts/${draftId}`),
  deleteDraft: (draftId) => apiClient.delete(`/assignments/drafts/${draftId}`),
};

// AI Grading API endpoints
export const aiGradingApi = {
  startGrading: (assignmentId, studentId, data) =>
    apiClient.post(
      `/ai-grading/${assignmentId}/students/${studentId}/start`,
      data
    ),

  updateGrades: (assignmentId, studentId, data) =>
    apiClient.put(
      `/ai-grading/${assignmentId}/students/${studentId}/update`,
      data
    ),

  getSubmissionStatus: (assignmentId, studentId) =>
    apiClient.get(`/ai-grading/${assignmentId}/students/${studentId}/status`),

  getDetailedFeedback: (assignmentId, studentId) =>
    apiClient.get(`/ai-grading/${assignmentId}/students/${studentId}/feedback`),
};
