/**
 * AI Grading Service
 * Handles extracting student solutions from submissions using Gemini API
 */

import { aiGradingApi } from "@/lib/api";

/**
 * Extract solutions from a student's submission
 * @param {string} base64Image - Base64-encoded image of student's work
 * @param {Object} assignmentDetails - Details of the assignment
 * @param {string} assignmentDetails.title - Assignment title
 * @param {Array} assignmentDetails.questions - List of questions in the assignment
 * @returns {Object} Extracted student solutions
 */
export const gradeSubmission = async (base64Image, assignmentDetails) => {
  console.log("===== EXTRACTING SOLUTIONS START =====");
  console.log("Processing submission with details:", {
    assignmentTitle: assignmentDetails.title,
    questionsCount: assignmentDetails.questions?.length || 0,
    imageSize: base64Image ? base64Image.length : 0,
  });

  if (!base64Image) {
    console.error("No image data provided");
    throw new Error("No image data provided for processing");
  }

  try {
    // Prepare the request for Gemini API
    const requestData = {
      contents: [
        {
          parts: [
            {
              text: `You are helping to extract student solutions from an answer sheet image.
                
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
                1. Examine the student's answer sheet image
                2. Only extract the exact written solution for each question
                3. Return a JSON with the question number and extracted solution text
                
                Please return a JSON response **only** with the following exact structure (no markdown or code fences):
                {
                  "questionSolutions": [
                    {
                      "questionNumber": number,
                      "extractedSolution": "The extracted solution from student's work"
                    }
                  ]
                }`,
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image,
              },
            },
          ],
        },
      ],
    };

    console.log("Making API call to Gemini with:", {
      model: "gemini-1.5-flash",
      promptLength: requestData.contents[0].parts[0].text.length,
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

    // Call the Gemini API - use a model that's stable and available
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

        // Map question numbers to actual question IDs if available
        const feedbackData = [];

        if (extractionResult.questionSolutions?.length > 0) {
          extractionResult.questionSolutions.forEach((solution) => {
            const questionNumber = solution.questionNumber;
            // Find the actual question ID from the assignment details
            // Adjust for zero-based index in the array vs one-based question numbers
            const questionIndex = questionNumber - 1;
            const questionId =
              assignmentDetails.questions[questionIndex]?._id ||
              questionNumber.toString();

            feedbackData.push({
              questionId: questionId,
              solution: solution.extractedSolution || "No solution extracted",
            });
          });
        }

        // If no solutions were extracted, handle this case
        if (feedbackData.length === 0) {
          console.warn("No solutions were extracted from the image");

          // Create default empty solutions for each question
          assignmentDetails.questions.forEach((question, index) => {
            feedbackData.push({
              questionId: question._id || (index + 1).toString(),
              solution: "No solution could be extracted",
            });
          });
        }

        console.log("Mapped feedback data:", feedbackData);
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
