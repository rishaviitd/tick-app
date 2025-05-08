/**
 * AI Bulk Evaluate Steps Service
 * Fetches rubric and saved steps breakdown, then evaluates each step using Gemini API in parallel.
 */
import { evaluateSolutionStep } from "./aiEvaluateSteps";
import { aiGradingApi } from "@/lib/api";

/**
 * Fire parallel evaluation requests for an array of question responses.
 * @param {string} assignmentId - ID of the assignment.
 * @param {string} studentId - ID of the student.
 * @param {Array<{questionId: string; questionText: string; solution: string}>} questionResponses
 * @returns {Array<Promise<{questionId: string; questionIndex: number; evaluation: any}>>}
 */
export const bulkEvaluateSolutionSteps = (
  assignmentId,
  studentId,
  questionResponses
) => {
  return questionResponses.map(({ questionId, questionText, solution }, idx) =>
    evaluateSolutionStep(
      assignmentId,
      studentId,
      questionId,
      questionText,
      solution
    )
      .then((result) => {
        // Prepare payload for backend
        const evaluatedStepsPayload = result.stepAnalysis.map(
          ({ stepNumber, status, justification }) => ({
            stepNumber,
            status: status.toLowerCase(),
            justification,
          })
        );
        const overallAssessmentStr =
          typeof result.overallAssessment === "string"
            ? result.overallAssessment
            : result.overallAssessment.summary ||
              JSON.stringify(result.overallAssessment);
        // Save evaluated steps to backend
        return aiGradingApi
          .evaluatedSteps(assignmentId, studentId, questionId, {
            overallAssessment: overallAssessmentStr,
            evaluatedSteps: evaluatedStepsPayload,
          })
          .then(() => ({ questionId, questionIndex: idx, evaluation: result }));
      })
      .catch((error) => {
        console.error(`Error evaluating Question ${idx + 1}:`, error);
        throw error;
      })
  );
};
