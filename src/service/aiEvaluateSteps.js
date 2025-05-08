/**
 * AI Evaluate Steps Service
 * Evaluates a single student's solution step against rubric and breakdown using Gemini API
 */
import { assignmentApi, aiGradingApi } from "@/lib/api";

/**
 * Evaluate a single question's solution steps.
 * @param {string} assignmentId - ID of the assignment.
 * @param {string} studentId - ID of the student.
 * @param {string} questionId - ID of the question.
 * @param {string} questionText - Text of the question.
 * @param {string} solution - Student's solution text.
 * @returns {Promise<any>} The evaluation result.
 */
export const evaluateSolutionStep = async (
  assignmentId,
  studentId,
  questionId,
  questionText,
  solution
) => {
  // Fetch rubric
  const rubricResp = await assignmentApi.getQuestionRubric(
    assignmentId,
    questionId
  );
  const rubric = rubricResp.data.data.rubric;

  // Fetch steps breakdown
  const breakdownResp = await aiGradingApi.getQuestionStepsBreakdown(
    assignmentId,
    studentId,
    questionId
  );
  const stepsBreakdown = breakdownResp.data.data;

  // Construct prompt
  const prompt = `Evaluate this step-by-step math solution.
Question: ${questionText}
Rubric: ${JSON.stringify(rubric)}
Solution: ${solution}
Step Breakdown: ${JSON.stringify(stepsBreakdown)}

Return **ONLY** a valid JSON object (markdown formatting for variables and equations) with the following structure:

{
  "stepAnalysis": [
    {
      "stepNumber": 1,
      "status": "Correct/Incorrect/Partially Correct",
      "justification": "Brief explanation",
      "skillPoints": ["list", "of", "demonstrated", "skills"]
    }
    // …additional steps…
  ],
  "overallAssessment": {
    "summary": "Brief overall assessment",
    "score": "1-5",
    "correctness": "Mostly Correct/Partially Correct/Incorrect"
  }
}`;

  // Prepare request
  const requestData = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("ERROR: Google API key is missing!");
    throw new Error(
      "API key for Gemini is missing. Please check your environment variables."
    );
  }

  // Call Gemini API
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Gemini API Error:", errorData);
    throw new Error(
      `API Error: ${errorData.error?.message || "Unknown error"}`
    );
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    console.error("Invalid API response structure:", data);
    throw new Error("Invalid response structure from API");
  }

  // Clean and parse JSON
  const cleaned = rawText
    .replace(/```json\s*/g, "")
    .replace(/```/g, "")
    .trim();
  let result;
  try {
    result = JSON.parse(cleaned);
  } catch (err) {
    console.error("Error parsing evaluation response:", err);
    console.error("Raw response text:", cleaned);
    throw new Error("Failed to parse evaluation response: " + err.message);
  }

  return result;
};
