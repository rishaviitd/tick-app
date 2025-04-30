/**
 * AI Grading Service
 * Handles direct grading of student submissions using Gemini API
 */

import { aiGradingApi } from "@/lib/api";

/**
 * Grade a student's submission in a single step
 * @param {string} base64Image - Base64-encoded image of student's work
 * @param {Object} assignmentDetails - Details of the assignment
 * @param {string} assignmentDetails.title - Assignment title
 * @param {number} assignmentDetails.maxMarks - Maximum marks for the assignment
 * @param {string} assignmentDetails.rubric - Grading rubric/criteria
 * @param {Array} assignmentDetails.questions - List of questions in the assignment
 * @returns {Object} Grading feedback and score
 */
export const gradeSubmission = async (base64Image, assignmentDetails) => {
  console.log("===== GRADING SUBMISSION START =====");
  console.log("Grading submission with details:", {
    assignmentTitle: assignmentDetails.title,
    maxMarks: assignmentDetails.maxMarks,
    questionsCount: assignmentDetails.questions?.length || 0,
    hasRubric: Boolean(assignmentDetails.rubric),
    imageSize: base64Image ? base64Image.length : 0,
  });

  try {
    // Prepare the request for Gemini API
    const requestData = {
      contents: [
        {
          parts: [
            {
              text: `You are an expert mathematics teacher grading a student's answer sheet.
                
                ASSIGNMENT DETAILS:
                Title: ${assignmentDetails.title || "Math Assessment"}
                Maximum Marks: ${assignmentDetails.maxMarks || 100}
                
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
                
                GRADING RUBRIC:
                ${
                  assignmentDetails.rubric ||
                  "Grade based on mathematical accuracy, problem-solving approach, and clarity of work"
                }
                
                INSTRUCTIONS:
                1. Examine the student's answer sheet image
                2. Identify and grade each answer
                3. Provide constructive feedback for each question
                4. Give a total score out of ${
                  assignmentDetails.maxMarks || 100
                }
                
                Please return a JSON response with the following structure:
                {
                  "overallAssessment": {
                    "summary": "Brief overall assessment of student's work",
                    "score": number (total score),
                    "percentage": number (percentage score)
                  },
                  "questionFeedback": [
                    {
                      "questionNumber": number,
                      "score": number,
                      "maxScore": number,
                      "feedback": "Detailed feedback for this question"
                    }
                  ],
                  "improvementAreas": ["List of areas where the student can improve"],
                  "strengths": ["List of student's strengths"]
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
    } else {
      // Only show first 4 chars and last 4 chars for security
      const maskedKey =
        apiKey.substring(0, 4) + "..." + apiKey.substring(apiKey.length - 4);
      console.log("Using API key:", maskedKey);
    }

    // Call the Gemini API - use a model that's stable and available
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${
        import.meta.env.VITE_GOOGLE_API_KEY
      }`,
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
        const gradingResult = JSON.parse(responseText);
        console.log("Successfully parsed grading result:", {
          score: gradingResult.overallAssessment?.score,
          percentage: gradingResult.overallAssessment?.percentage,
          feedbackItems: gradingResult.questionFeedback?.length || 0,
        });

        console.log("===== GRADING SUBMISSION COMPLETE =====");
        return {
          success: true,
          feedback: gradingResult,
          score: gradingResult.overallAssessment.score,
          percentage: gradingResult.overallAssessment.percentage,
        };
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
        console.error("Raw response text:", responseText);
        throw new Error(
          `Failed to parse grading result: ${parseError.message}`
        );
      }
    } else {
      console.error("Invalid API response structure:", data);
      throw new Error("Invalid response structure from API");
    }
  } catch (error) {
    console.error("===== ERROR IN GRADING SUBMISSION =====");
    console.error("Error in grading submission:", error);
    console.error("Full error details:", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};

/**
 * Update the grading status of a student's assignment
 * @param {string} assignmentId - ID of the assignment
 * @param {string} studentId - ID of the student
 * @param {Object} gradingResult - Result from Gemini API grading
 * @returns {Promise<Object>} Response with success status
 */
export const updateGradingStatus = async (
  assignmentId,
  studentId,
  gradingResult
) => {
  try {
    console.log("===== UPDATING GRADING STATUS START =====");
    console.log("Updating grading status for:", { assignmentId, studentId });

    if (!gradingResult || !gradingResult.overallAssessment) {
      console.error("Invalid grading result structure:", gradingResult);
      throw new Error("Grading result is missing required fields");
    }

    // Extract the score and feedback from the grading result
    const totalScore = gradingResult.overallAssessment.score;

    // Prepare feedback data for each question
    const questionFeedback =
      gradingResult.questionFeedback?.map((q) => ({
        questionId: q.questionNumber.toString(), // Using question number as ID
        marks: q.score,
        comment: q.feedback,
      })) || [];

    console.log("Prepared feedback data:", {
      totalScore,
      feedbackItems: questionFeedback.length,
    });

    // Update the student's assignment with the grades and feedback
    console.log("Calling updateGrades API endpoint...");
    const updateResponse = await aiGradingApi.updateGrades(
      assignmentId,
      studentId,
      {
        totalScore: totalScore,
        feedbackData: questionFeedback,
        aiFeedback: {
          overallAssessment: gradingResult.overallAssessment,
          improvementAreas: gradingResult.improvementAreas || [],
          strengths: gradingResult.strengths || [],
        },
      }
    );

    console.log("Grade update API response:", {
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

    console.log("===== UPDATING GRADING STATUS COMPLETE =====");
    return {
      success: true,
      message: "Grading status updated successfully",
      score: totalScore,
    };
  } catch (error) {
    console.error("===== ERROR UPDATING GRADING STATUS =====");
    console.error("Error updating grading status:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });
    throw error;
  }
};
