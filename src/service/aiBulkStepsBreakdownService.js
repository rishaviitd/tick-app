/**
 * AI Bulk Steps Breakdown Service
 * Sends breakdownSolutionSteps requests in parallel for multiple questions.
 */
import { breakdownSolutionSteps } from "./aiStepsBreakdownService";
import { assignmentApi } from "@/lib/api";

/**
 * Fire parallel breakdown requests for an array of question responses and save to backend.
 * @param {string} assignmentId - ID of the assignment.
 * @param {string} studentId - ID of the student.
 * @param {Array<{questionId: string, questionText: string, solution: string}>} questionResponses
 * @returns {Array<Promise<{questionId: string, questionIndex: number, breakdown: any}>>}
 */
export const bulkBreakdownSolutionSteps = (
  assignmentId,
  studentId,
  questionResponses
) => {
  return questionResponses.map(({ questionId, questionText, solution }, idx) =>
    breakdownSolutionSteps(questionText, solution).then((breakdown) => {
      // Save breakdown via assignmentApi helper
      assignmentApi
        .saveQuestionStepsBreakdown(
          assignmentId,
          studentId,
          questionId,
          breakdown
        )
        .then((response) => {
          console.log(
            `Saved breakdown for Question ${idx + 1}:`,
            response.data
          );
        })
        .catch((error) => {
          console.error(
            `Error saving breakdown for Question ${idx + 1}:`,
            error.response?.data || error.message
          );
        });
      return { questionId, questionIndex: idx, breakdown };
    })
  );
};
