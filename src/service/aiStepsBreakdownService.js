/**
 * AI Steps Breakdown Service
 * Handles analyzing student solutions and breaking them into steps using Gemini API
 */

/**
 * Break down a student's solution into steps.
 * @param {string} questionText - The text of the question.
 * @param {string} studentSolution - The extracted solution text from the student.
 * @returns {Object} The breakdown with studentThoughtProcess and steps.
 */
export const breakdownSolutionSteps = async (questionText, studentSolution) => {
  console.log("===== BREAKDOWN SOLUTION STEPS START =====");
  console.log("Question:", questionText);
  console.log("Student solution:", studentSolution);

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
      "studentWork": "Exact text/equation from student's work",
      "studentIntent": "What the student was trying to accomplish"
    }
    ... (repeat for all steps) ...

  ],
"studentThoughtProcess": "Brief overview of student's approach"
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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
  console.log("Gemini API Response received");

  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    console.error("Invalid API response structure:", data);
    throw new Error("Invalid response structure from API");
  }

  console.log("RAW RESPONSE TEXT:\n", rawText);
  let cleanedText = rawText
    .replace(/```json\s*/g, "")
    .replace(/```\s*/g, "")
    .trim();
  console.log("Cleaned response text:", cleanedText);

  try {
    const result = JSON.parse(cleanedText);
    console.log("Successfully parsed step breakdown result:", result);
    console.log("===== BREAKDOWN SOLUTION STEPS COMPLETE =====");
    return result;
  } catch (parseError) {
    console.error("Error parsing JSON response:", parseError);
    console.error("Raw response text:", cleanedText);
    throw new Error(
      "Failed to parse steps breakdown response: " + parseError.message
    );
  }
};
