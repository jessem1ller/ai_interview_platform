import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";
import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";
import { getCurrentUser } from "@/lib/actions/auth.action";

// 1. Create a configured Google AI client
const google = createGoogleGenerativeAI({
  apiKey: process.env.NEXT_GOOGLE_GENERATIVE_AI_API_KEY,
});

// 2. Define the expected output schema
const interviewQuestionsSchema = z.object({
  questions: z.array(z.string()),
});

export async function POST(request: Request) {
  const { type, role, level, techstack, amount, userid } = await request.json();

  try {
    const user = await getCurrentUser();
    const effectiveUserId = user?.id || userid;

    // 3. Use generateObject for reliable JSON output
    const { object } = await generateObject({
      model: google("gemini-1.5-flash-latest"),
      schema: interviewQuestionsSchema,
      prompt: `Prepare exactly ${amount} questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus should lean towards: ${type}.
        Do not use special characters like "/" or "*" which might break a voice assistant.
      `,
    });

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(","),
      questions: object.questions, // No JSON.parse() needed!
      userId: effectiveUserId,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString(),
    };

    const ref = await db.collection("interviews").add(interview);

    // 4. Return the new interview's ID in the response
    return Response.json({ success: true, id: ref.id }, { status: 200 });
  } catch (error)
  {
    console.error("Error generating interview:", error);
    return Response.json(
      { success: false, error: "Failed to generate interview" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
