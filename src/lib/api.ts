import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL;
const API_PATH = "/api/v1";

// Create axios instance with base URL and default headers
const apiClient = axios.create({
  baseURL: `${API_URL}${API_PATH}`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors
    console.error("API Error:", error.response?.data || error.message);

    // Handle auth errors (redirect to login)
    if (error.response?.status === 401) {
      // Could redirect to login or dispatch auth error action
      console.log("Authentication error - redirecting to login");
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Helper to set token explicitly
const setAuthToken = (token: string) => {
  localStorage.setItem("token", token);
  apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
};

// Assignment API endpoints
export const assignmentApi = {
  // Set auth token explicitly
  setAuthToken,

  // Get all assignments
  getAll: () => apiClient.get("/assignments"),

  // Get assignment details
  getDetails: (assignmentId: string) =>
    apiClient.get(`/assignments/${assignmentId}`),

  // Get available students for this assignment
  getAvailableStudents: (assignmentId: string) =>
    apiClient.get(`/assignments/${assignmentId}/availableStudents`),

  // Get rubric for a specific question in an assignment
  getQuestionRubric: (assignmentId: string, questionId: string) =>
    apiClient.get(
      `/assignments/${assignmentId}/questions/${questionId}/rubric`
    ),

  // Create new assignment
  create: (data: any) => apiClient.post("/assignments", data),

  // Update assignment
  update: (assignmentId: string, data: any) =>
    apiClient.put(`/assignments/${assignmentId}`, data),

  // Student assignment management
  updateStudentAssignment: (
    assignmentId: string,
    studentId: string,
    data: any
  ) =>
    apiClient.put(`/assignments/${assignmentId}/students/${studentId}`, data),

  // Retry grading
  retryGrading: (assignmentId: string, studentId: string) =>
    apiClient.post(`/assignments/${assignmentId}/students/${studentId}/retry`),

  // Save AI steps breakdown for a student's question response
  saveQuestionStepsBreakdown: (
    assignmentId: string,
    studentId: string,
    questionId: string,
    breakdown: { studentThoughtProcess: string; steps: any[] }
  ) =>
    apiClient.post(
      `/assignments/${assignmentId}/students/${studentId}/questions/${questionId}/stepsBreakdown`,
      breakdown
    ),

  // Assignment draft operations
  saveDraft: (data: any) => apiClient.post("/assignments/drafts", data),
  getAllDrafts: () => apiClient.get("/assignments/drafts"),
  getDraft: (id: number) => apiClient.get(`/assignments/drafts/${id}`),
  deleteDraft: (id: number) => apiClient.delete(`/assignments/drafts/${id}`),
};

// Class API endpoints
export const classApi = {
  // Set auth token explicitly
  setAuthToken,

  getAll: () => apiClient.get("/classes"),
  getStudents: (classId: string) =>
    apiClient.get("/classes/students", {
      params: { classId },
    }),
  getAssignments: (classId: string) =>
    apiClient.get(`/classes/${classId}/assignments`),
};

// Student API endpoints
export const studentApi = {
  // Set auth token explicitly
  setAuthToken,

  getAll: () => apiClient.get("/students"),
  getDetails: (studentId: string) => apiClient.get(`/students/${studentId}`),
};

// AI Grading API endpoints
export const aiGradingApi = {
  // Set auth token explicitly
  setAuthToken,

  // Start the grading process
  startGrading: (
    assignmentId: string,
    studentId: string,
    submissionData: any
  ) =>
    apiClient.post(`/ai-grading/${assignmentId}/students/${studentId}/grade`, {
      submissionData,
    }),

  // Upload a submission file
  uploadSubmission: (
    assignmentId: string,
    studentId: string,
    formData: FormData
  ) => {
    return axios.post(
      `${API_URL}${API_PATH}/ai-grading/${assignmentId}/students/${studentId}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
  },

  // Update grades from AI processing
  updateGrades: (assignmentId: string, studentId: string, gradeData: any) =>
    apiClient.put(
      `/ai-grading/${assignmentId}/students/${studentId}/grades`,
      gradeData
    ),

  // Get submission status
  getSubmissionStatus: (assignmentId: string, studentId: string) =>
    apiClient.get(`/ai-grading/${assignmentId}/students/${studentId}/status`),

  // Get detailed feedback for a student's assignment
  getDetailedFeedback: (assignmentId: string, studentId: string) =>
    apiClient.get(`/ai-grading/${assignmentId}/students/${studentId}/feedback`),

  // Get saved steps breakdown for a student's question response
  getQuestionStepsBreakdown: (
    assignmentId: string,
    studentId: string,
    questionId: string
  ) =>
    apiClient.get(
      `/ai-grading/${assignmentId}/students/${studentId}/questions/${questionId}/stepsBreakdown`
    ),

  // Evaluate steps and overall assessment for a student's question response
  evaluatedSteps: (
    assignmentId: string,
    studentId: string,
    questionId: string,
    data: {
      overallAssessment: string;
      evaluatedSteps: {
        stepNumber: number;
        status: string;
        justification: string;
      }[];
    }
  ) =>
    apiClient.post(
      `/ai-grading/${assignmentId}/students/${studentId}/questions/${questionId}/evaluatedSteps`,
      data
    ),
};

export default apiClient;
