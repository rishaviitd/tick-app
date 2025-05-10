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
    }
    // …additional steps…
  ],
  "overallAssessment": {
    "summary": "Brief overall assessment",
    "score": "number [based on the rubric]",
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
  const model1 = "gemini-2.5-pro-exp-03-25";
  const model2 = "gemini-2.0-flash";
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model1}:generateContent?key=${apiKey}`,
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

  // Extract JSON content from code block if present
  const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = rawText.match(jsonBlockRegex);
  let jsonString;
  if (match && match[1]) {
    jsonString = match[1].trim();
    console.log("Extracted JSON from code block:", jsonString);
  } else {
    jsonString = rawText.trim();
    console.log("Assuming entire response is JSON:", jsonString);
  }
  // First, normalize all backslash sequences to single backslashes
  jsonString = jsonString.replace(/\\+/g, "\\");
  // Now convert all single backslashes to quadruple backslashes for safe JSON parsing
  jsonString = jsonString.replace(/\\/g, "\\\\\\\\");
  console.log("Backslash transformation for parsing:", jsonString);

  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    console.error("Error parsing transformed evaluation response:", err);
    console.error("Transformed JSON string:", jsonString);
    throw new Error("Failed to parse evaluation response: " + err.message);
  }
  // Post-process to revert quadruple backslashes to single in strings
  const replaceBackslashes = (str) => str.replace(/\\\\/g, "\\");
  if (Array.isArray(parsed.stepAnalysis)) {
    parsed.stepAnalysis = parsed.stepAnalysis.map((step) => ({
      ...step,
      justification: replaceBackslashes(step.justification),
    }));
  }
  if (parsed.overallAssessment) {
    if (typeof parsed.overallAssessment === "string") {
      parsed.overallAssessment = replaceBackslashes(parsed.overallAssessment);
    } else if (parsed.overallAssessment.summary) {
      parsed.overallAssessment.summary = replaceBackslashes(
        parsed.overallAssessment.summary
      );
    }
  }
  return parsed;
};
