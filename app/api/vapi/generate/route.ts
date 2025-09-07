// in /api/vapi/generate/route.ts

import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

const google = createGoogleGenerativeAI();

const interviewQuestionsSchema = z.object({
  questions: z.array(z.string()),
});

export async function POST(request: Request) {
  // Vapi sends the toolCallId in the headers for server-side tools
  const toolCallId = request.headers.get('X-Vapi-Tool-Call-Id');

  try {
    // The parameters are in the main body, not nested in "toolCall"
    const { type, role, level, techstack, amount, userid, username } = await request.json();

    if (!userid) {
      throw new Error("User ID is missing from the Vapi request.");
    }

    const { object } = await generateObject({
      model: google("gemini-1.5-flash-latest"),
      schema: interviewQuestionsSchema,
      prompt: `Prepare exactly ${amount || 5} interview questions for a user named ${username}. The job role is ${role || 'General'}. The job experience level is ${level || 'Intermediate'}. The tech stack is: ${techstack || 'Not specified'}. The interview type is: ${type || 'Mixed'}.`,
    });

    const interview = {
      role: role || "General Role",
      type: type || "Mixed",
      level: level || "Intermediate",
      techstack: (techstack || "").split(",").map((s: string) => s.trim()).filter(Boolean),
      questions: object.questions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    await db.collection("interviews").add(interview);

    return Response.json({
      results: [{ toolCallId: toolCallId, result: "The interview was created successfully." }],
    });
  } catch (error) {
    console.error("Error generating interview:", error);
    return Response.json({
      results: [{ toolCallId: toolCallId, result: "There was an error creating the interview." }],
    });
  }
};