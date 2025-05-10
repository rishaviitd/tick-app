/**
 * AI Steps Breakdown Service
 * Handles analyzing student solutions and breaking them into steps using Gemini API
 */

/**
 * Break down a student's solution into steps.
 * @param {string} questionText - The text of the question.
 * @param {string} studentSolution - The extracted solution text from the student.
 * @returns {Object} The breakdown with steps array.
 */
export const breakdownSolutionSteps = async (questionText, studentSolution) => {
  console.log("===== BREAKDOWN SOLUTION STEPS START =====");

  if (!questionText || !studentSolution) {
    console.error("Missing question text or student solution");
    throw new Error(
      "Question text and student solution are required for step breakdown"
    );
  }

  const promptPart = {
    text: `Analyze this mathematical solution that has been extracted from the student's handwritten response. 
Question: ${questionText}
Student solution: ${studentSolution}

Return ONLY a valid JSON object (with markdown formatting for mathematical terms and equations) with the following structure:
{
  
  "steps": [
    {
      "stepNumber": 1,
      "studentWork": "Exact text/equation from student's work"
    }
    ... (repeat for all steps) ...

  ]
}

Important: Do not modify or improve the steps. Report exactly what the student wrote.
`,
  };

  const requestData = {
    contents: [
      {
        parts: [promptPart],
      },
    ],
  };

  // Debug and API key check
  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("ERROR: Google API key is missing!");
    throw new Error(
      "API key for Gemini is missing. Please check your environment variables."
    );
  } else {
    const maskedKey =
      apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4);
    console.log("Using API key:", maskedKey);
  }

  console.log("Making API call to Gemini for step breakdown with:", {
    model: "gemini-2.0-flash",
    promptLength: promptPart.text.length,
  });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    }
  );

  console.log("API response status:", response.status);
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
  } else {
    jsonString = rawText.trim();
  }
  // First, normalize all backslash sequences to single backslashes
  jsonString = jsonString.replace(/\\+/g, "\\");
  // Now convert all single backslashes to quadruple backslashes for safe JSON parsing
  jsonString = jsonString.replace(/\\/g, "\\\\\\\\");
  console.log("Backslas", jsonString);

  let parsed;
  try {
    parsed = JSON.parse(jsonString);
  } catch (parseError) {
    console.error("Error parsing transformed JSON:", parseError);
    console.error("Transformed JSON string:", jsonString);
    throw new Error(
      "Failed to parse steps breakdown response: " + parseError.message
    );
  }
  // Post-process to revert quadruple backslashes to double in strings
  const replaceBackslashes = (str) => str.replace(/\\\\/g, "\\");

  if (Array.isArray(parsed.steps)) {
    parsed.steps = parsed.steps.map((step) => ({
      stepNumber: step.stepNumber,
      studentWork: replaceBackslashes(step.studentWork),
    }));
  }
  return parsed;
};
