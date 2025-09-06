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
  const { type, role, level, techstack, amount, userid } = await request.json();

  try {
    const user = await getCurrentUser();
    const effectiveUserId = user?.id || userid;

    if (!effectiveUserId) {
      throw new Error("User ID is missing and is required to create an interview.");
    }

    const { object } = await generateObject({
      model: google("gemini-1.5-flash-latest"),
      schema: interviewQuestionsSchema,
      prompt: `Prepare exactly ${amount || 5} questions for a job interview. The job role is ${role || 'General'}. The job experience level is ${level || 'Intermediate'}. The tech stack used in the job is: ${techstack || 'Not specified'}. The focus should lean towards: ${type || 'Mixed'}. Do not use special characters like "/" or "*" which might break a voice assistant.`,
    });

    const interview = {
      role: role || "General Role",
      type: type || "Mixed",
      level: level || "Intermediate",
      techstack: (techstack || "").split(",").filter(Boolean),
      questions: object.questions,
      userId: effectiveUserId,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    const ref = await db.collection("interviews").add(interview);

    return Response.json({ success: true, id: ref.id }, { status: 200 });
  } catch (error) {
    console.error("Error generating interview:", error);
    return Response.json(
      { success: false, error: "Failed to generate interview" },
      { status: 500 }
    );
  }
}