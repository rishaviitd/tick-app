/**
 * AI Grading Service
 * Handles extracting student solutions from submissions using Gemini API
 */

import { aiGradingApi } from "@/lib/api";

/**
 * Extract solutions from a student's submission images
 * @param {string[]} base64Images - Array of Base64-encoded images of student's work
 * @param {Object} assignmentDetails - Details of the assignment
 * @param {string} assignmentDetails.title - Assignment title
 * @param {Array} assignmentDetails.questions - List of questions in the assignment
 * @returns {Object} Extracted student solutions
 */
export const gradeSubmission = async (base64Images, assignmentDetails) => {
  console.log("===== EXTRACTING SOLUTIONS START =====");
  console.log("Processing submission with details:", {
    assignmentTitle: assignmentDetails.title,
    questionsCount: assignmentDetails.questions?.length || 0,
    imageCount: base64Images?.length || 0,
  });

  if (!base64Images || base64Images.length === 0) {
    console.error("No image data provided");
    throw new Error("No image data provided for processing");
  }

  try {
    // Prepare the parts for the Gemini API request
    const promptPart = {
      text: `You are helping to extract student solutions from answer sheet images.
                
                ASSIGNMENT DETAILS:
                Title: ${assignmentDetails.title || "Math Assessment"}
                
                QUESTIONS:
                ${
                  assignmentDetails.questions
                    ?.map(
                      (q, i) =>
                        `${i + 1}. ${
                          q.text || q.questionText || "Question " + (i + 1)
                        }`
                    )
                    .join("\n") || "Questions not provided"
                }
                
                INSTRUCTIONS:
                1. Examine ALL the student's answer sheet images thoroughly - ${
                  base64Images.length
                } images are provided.
                2. Extract solutions for EACH question from ANY of the images.
                3. Make sure to extract solutions for ALL questions listed above.
                4. If a solution spans across multiple images, combine the information.
                5. For each question, provide the most complete solution you can find.
                6. If you cannot find a solution for a question, indicate this explicitly.
                
                Please return a JSON response **only** with the following exact structure (no markdown or code fences):
                {
                  "questionSolutions": [
                    {
                      "questionNumber": number,
                      "extractedSolution": "The extracted solution from student's work"
                    },
                    ... (repeat for all questions, even if solution not found) ...
                  ]
                }

                IMPORTANT: Return a solution entry for EVERY question, even if you couldn't find the solution in the images.
                For questions where no solution is visible, set "extractedSolution" to "No solution was found in the submission".`,
    };

    const imageParts = base64Images.map((imgData) => ({
      inline_data: {
        mime_type: "image/jpeg", // Assuming JPEG, adjust if needed
        data: imgData,
      },
    }));

    const requestData = {
      contents: [
        {
          parts: [promptPart, ...imageParts], // Combine prompt and all images
        },
      ],
    };

    console.log("Making API call to Gemini with:", {
      model: "gemini-1.5-flash", // Reverted model name
      promptLength: promptPart.text.length,
      imageCount: imageParts.length,
    });

    // Debug check for API key
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) {
      console.error("ERROR: Google API key is missing!");
      throw new Error(
        "API key for Gemini is missing. Please check your environment variables."
      );
    } else {
      // Only show first 4 chars and last 4 chars for security
      const maskedKey =
        apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4);
      console.log("Using API key:", maskedKey);
    }

    // Call the Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      let responseText = data.candidates[0].content.parts[0].text;

      // Log the raw Gemini response text for debugging
      console.log("RAW GEMINI RESPONSE TEXT:\n", responseText);

      // Clean up the response text (remove markdown formatting if present)
      responseText = responseText.replace(/```json\s*/g, "");
      responseText = responseText.replace(/```\s*/g, "");
      responseText = responseText.trim();

      console.log("Processing response text, length:", responseText.length);

      try {
        const extractionResult = JSON.parse(responseText);
        console.log("Successfully parsed extraction result:", {
          solutionsCount: extractionResult.questionSolutions?.length || 0,
        });

        // Ensure we have an entry for every question
        const feedbackData = [];
        const questionCount = assignmentDetails.questions.length;

        // Create a map of solutions by question number
        const solutionMap = new Map();
        if (extractionResult.questionSolutions?.length > 0) {
          extractionResult.questionSolutions.forEach((solution) => {
            solutionMap.set(
              solution.questionNumber,
              solution.extractedSolution ||
                "No solution was found in the submission"
            );
          });
        }

        // Ensure each question has a solution
        for (let i = 0; i < questionCount; i++) {
          const questionNumber = i + 1;
          const question = assignmentDetails.questions[i];
          const questionId = question._id || questionNumber.toString();

          // Get solution from map or use default
          const solution = solutionMap.has(questionNumber)
            ? solutionMap.get(questionNumber)
            : "No solution was found in the submission";

          feedbackData.push({
            questionId: questionId,
            solution: solution,
          });
        }

        console.log("Complete mapped feedback data:", feedbackData);
        console.log("===== EXTRACTING SOLUTIONS COMPLETE =====");

        return {
          success: true,
          feedbackData: feedbackData,
        };
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
        console.error("Raw response text:", responseText);

        // Return a default structure in case of parsing error
        const defaultFeedback = assignmentDetails.questions.map(
          (question, i) => ({
            questionId: question._id || (i + 1).toString(),
            solution: "Error extracting solution: " + parseError.message,
          })
        );

        return {
          success: true,
          feedbackData: defaultFeedback,
        };
      }
    } else {
      console.error("Invalid API response structure:", data);
      throw new Error("Invalid response structure from API");
    }
  } catch (error) {
    console.error("===== ERROR IN EXTRACTING SOLUTIONS =====");
    console.error("Error in extracting solutions:", error);
    console.error("Full error details:", {
      message: error.message,
      stack: error.stack,
    });

    // Instead of throwing, return a structured error response
    return {
      success: false,
      error: error.message || "An error occurred during solution extraction",
      feedbackData: assignmentDetails.questions.map((question, i) => ({
        questionId: question._id || (i + 1).toString(),
        solution: "Failed to extract solution",
      })),
    };
  }
};

/**
 * Update the solutions of a student's assignment
 * @param {string} assignmentId - ID of the assignment
 * @param {string} studentId - ID of the student
 * @param {Object} extractionResult - Result from Gemini API extraction
 * @returns {Promise<Object>} Response with success status
 */
export const updateGradingStatus = async (
  assignmentId,
  studentId,
  extractionResult
) => {
  try {
    console.log("===== UPDATING SOLUTIONS START =====");
    console.log("Updating solutions for:", { assignmentId, studentId });

    if (!extractionResult) {
      throw new Error("Extraction result is missing or invalid");
    }

    // Even if extraction had an error, try to update with what we have
    const questionSolutions = extractionResult.feedbackData || [];

    console.log("Solution data prepared:", {
      solutionsCount: questionSolutions.length,
      success: extractionResult.success,
    });

    // Update the student's assignment with the solutions
    console.log("Calling updateGrades API endpoint...");
    const updateResponse = await aiGradingApi.updateGrades(
      assignmentId,
      studentId,
      {
        status: "completed", // Use "completed" status since we're not grading anymore
        feedbackData: questionSolutions,
      }
    );

    console.log("Update API response:", {
      status: updateResponse.status,
      success: updateResponse.data?.success,
      message: updateResponse.data?.message,
    });

    if (!updateResponse.data?.success) {
      throw new Error(
        `Backend update failed: ${
          updateResponse.data?.message || "Unknown error"
        }`
      );
    }

    console.log("===== UPDATING SOLUTIONS COMPLETE =====");
    return {
      success: true,
      message: "Student solutions updated successfully",
    };
  } catch (error) {
    console.error("===== ERROR UPDATING SOLUTIONS =====");
    console.error("Error updating solutions:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });

    return {
      success: false,
      message: "Failed to update student solutions: " + error.message,
    };
  }
};
