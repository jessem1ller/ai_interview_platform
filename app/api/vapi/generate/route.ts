import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import { getCurrentUser } from "@/lib/actions/auth.action";

const google = createGoogleGenerativeAI();

const interviewQuestionsSchema = z.object({
  questions: z.array(z.string()),
});

export async function POST(request: Request) {
  let toolCallId: string | undefined;

  try {
    const { toolCall } = await request.json();
    
    const { type, role, level, techstack, amount, userid } = toolCall.parameters;
    toolCallId = toolCall.id;

    if (!userid) {
      throw new Error("User ID is missing from the tool call parameters.");
    }

    const { object } = await generateObject({
      model: google("gemini-1.5-flash-latest"),
      schema: interviewQuestionsSchema,
      prompt: `Prepare exactly ${amount || 5} questions for a job interview. The job role is ${role || 'General'}. The job experience level is ${level || 'Intermediate'}. The tech stack used in the job is: ${techstack || 'Not specified'}. The focus should lean towards: ${type || 'Mixed'}. Do not use special characters.`,
    });

    const interview = {
      role: role || "General Role",
      type: type || "Mixed",
      level: level || "Intermediate",
      // ✅ Added (s: string) here to fix the TypeScript error
      techstack: (techstack || "").split(",").map((s: string) => s.trim()).filter(Boolean),
      questions: object.questions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({
      results: [
        {
          toolCallId: toolCallId,
          result: "Your mock interview has been successfully created.",
        },
      ],
    });
  } catch (error) {
    console.error("Error generating interview:", error);
    
    return Response.json({
      results: [
        {
          toolCallId: toolCallId,
          result: "Sorry, there was an error creating your interview. Please try again.",
        },
      ],
    });
  }
}