
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { StudentFeedbackView } from "@/components/Student/StudentFeedbackView";

const StudentView = () => {
  const { toast } = useToast();
  
  // Mock data for student feedback
  const studentFeedbackData = {
    studentName: "Michael Brown",
    assignmentTitle: "Midterm Exam - Mathematics",
    totalScore: 35,
    maxScore: 50,
    grade: "C",
    submissionDate: "April 10, 2023",
    gradedDate: "April 13, 2023",
    allowRegrade: true,
    feedbackItems: [
      {
        questionNumber: 1,
        questionText: "Solve the quadratic equation: 2x² + 5x - 3 = 0",
        score: 8,
        maxScore: 10,
        feedback: "Good approach to the quadratic equation, but you made a small arithmetic error in one of your steps. Your solution method was correct, but the final answer was affected by this calculation mistake.",
        criteriaFeedback: [
          {
            criteriaName: "Mathematical Approach",
            score: 4,
            maxScore: 4,
            feedback: "Excellent use of the quadratic formula with all steps clearly shown."
          },
          {
            criteriaName: "Logical Reasoning",
            score: 3,
            maxScore: 3,
            feedback: "Clear logical progression with all steps explained properly."
          },
          {
            criteriaName: "Accuracy of Calculations",
            score: 1,
            maxScore: 3,
            feedback: "Made an arithmetic error when calculating the final values for x."
          }
        ]
      },
      {
        questionNumber: 2,
        questionText: "Find the derivative of f(x) = x³ + 2x² - 5x + 7",
        score: 6,
        maxScore: 8,
        feedback: "You successfully applied the power rule for most terms, but missed applying the derivative rule correctly for the 2x² term. Remember that the derivative of ax^n is a*n*x^(n-1).",
        criteriaFeedback: [
          {
            criteriaName: "Mathematical Approach",
            score: 3,
            maxScore: 4,
            feedback: "Mostly correct approach with proper application of derivative rules for most terms."
          },
          {
            criteriaName: "Logical Reasoning",
            score: 2,
            maxScore: 3,
            feedback: "Steps were clear but explanations were incomplete in some areas."
          },
          {
            criteriaName: "Accuracy of Calculations",
            score: 1,
            maxScore: 1,
            feedback: "Calculations were correct for the terms that were properly differentiated."
          }
        ]
      },
      {
        questionNumber: 3,
        questionText: "If the probability of an event is 0.4, what is the probability of its complement?",
        score: 5,
        maxScore: 5,
        feedback: "Perfect solution! You correctly applied the complement rule, showing a solid understanding of probability concepts.",
        criteriaFeedback: [
          {
            criteriaName: "Mathematical Approach",
            score: 4,
            maxScore: 4,
            feedback: "Perfect approach using the complement rule P(A') = 1 - P(A)."
          },
          {
            criteriaName: "Logical Reasoning",
            score: 3,
            maxScore: 3,
            feedback: "Clear explanation of the complement concept and formula application."
          },
          {
            criteriaName: "Accuracy of Calculations",
            score: 2,
            maxScore: 2,
            feedback: "Calculation was performed perfectly with the correct final answer of 0.6 or 60%."
          }
        ]
      }
    ]
  };
  
  const handleRequestRegrade = () => {
    toast({
      title: "Regrade Requested",
      description: "Your request for a regrade has been submitted to your teacher.",
    });
  };
  
  return (
    <div className="py-8 px-4 min-h-screen bg-gray-50">
      <StudentFeedbackView 
        {...studentFeedbackData}
        onRequestRegrade={handleRequestRegrade}
      />
    </div>
  );
};

export default StudentView;
