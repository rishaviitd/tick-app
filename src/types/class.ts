export interface Student {
  id: string;
  name: string;
  mobile: string;
  roll: string;
}

export interface ClassData {
  id: string;
  name: string;
  section: string;
  studentCount: number;
  students: Student[];
  assignments: AssignmentSummary[];
}

export interface AssignmentSummary {
  id: string;
  title: string;
  subject: string;
  date: string;
  status: "draft" | "active" | "completed";
  completion: number;
  dueDate?: string;
  maxMarks?: number;
}

export interface AssignmentQuestion {
  _id?: string;
  text: string;
  maxMarks?: number;
  rubric?: string;
}

export interface AssignmentDetail extends AssignmentSummary {
  description?: string;
  rubric?: string;
  questionPaper?: string;
  markingScheme?: string;
  classId?: string;
  className?: string;
  questions: AssignmentQuestion[];
  students: StudentAssignment[];
}

export interface StudentAssignment {
  studentId: string;
  studentName: string;
  status: "pending" | "submitted" | "processing" | "graded" | "failed";
  score?: number;
  submissionDate?: string;
  submissionUrl?: string;
  feedbackUrl?: string;
  sharedUrl?: string;
  isShared: boolean;
}
