// AI Orchestration Service
// Orchestrates step breakdown and evaluation of student solutions in parallel, and saves results to the backend

import { breakdownSolutionSteps } from "./aiStepsBreakdownService";
import { evaluateSolutionStep } from "./aiEvaluateSteps";
import { assignmentApi, aiGradingApi } from "@/lib/api";

/**
 * Orchestrates breakdown and evaluation for multiple question responses.
 * For each question, it:
 *  1. Breaks down the student solution into steps and saves to backend
 *  2. Evaluates the breakdown against the rubric and saves to backend
 *
 * @param {string} assignmentId - ID of the assignment
 * @param {string} studentId - ID of the student
 * @param {Array<{questionId: string; questionText: string; solution: string}>} questionResponses
 * @returns {Promise<Array<{questionId: string; breakdown: any; evaluation: any}>>}
 */
export const orchestrateSolutionAssessment = async (
  assignmentId,
  studentId,
  questionResponses
) => {
  // Create a parallel task for each question
  const tasks = questionResponses.map(
    ({ questionId, questionText, solution }) =>
      (async () => {
        // 1. Breakdown steps
        const breakdown = await breakdownSolutionSteps(questionText, solution);
        // Save breakdown to backend
        await assignmentApi.saveQuestionStepsBreakdown(
          assignmentId,
          studentId,
          questionId,
          breakdown
        );

        // 2. Evaluate steps
        const evaluationResult = await evaluateSolutionStep(
          assignmentId,
          studentId,
          questionId,
          questionText,
          solution
        );
        // Prepare payload for evaluated steps
        const evaluatedStepsPayload = evaluationResult.stepAnalysis.map(
          ({ stepNumber, status, justification }) => ({
            stepNumber,
            status: status.toLowerCase(),
            justification,
          })
        );
        // Prepare overall assessment string
        const overallAssessmentStr =
          typeof evaluationResult.overallAssessment === "string"
            ? evaluationResult.overallAssessment
            : evaluationResult.overallAssessment.summary ||
              JSON.stringify(evaluationResult.overallAssessment);

        // Save evaluation to backend
        await aiGradingApi.evaluatedSteps(assignmentId, studentId, questionId, {
          overallAssessment: overallAssessmentStr,
          evaluatedSteps: evaluatedStepsPayload,
        });

        return {
          questionId,
          breakdown,
          evaluation: evaluationResult,
        };
      })()
  );

  // Wait for all question tasks to complete
  return Promise.all(tasks);
};
