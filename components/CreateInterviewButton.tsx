// components/CreateInterviewButton.tsx

"use client";

import { useRouter } from "next/navigation";
import { vapi } from "@/lib/vapi.sdk";
import { Button } from "@/components/ui/button";

const CreateInterviewButton = () => {
  const router = useRouter();

  const handleCreateInterview = () => {
    // ✅ Define the arrays as separate, mutable string arrays
    const interviewTypes: string[] = ["technical", "behavioral", "mixed"];
    const requiredFields: string[] = ["role", "level", "techstack", "amount", "type"];

    // Define the tool that Vapi will use to gather information
    const createInterviewTool = {
      type: "function",
      function: {
        name: "createInterview",
        description: "Creates a new mock interview based on user specifications.",
        parameters: {
          type: "object",
          properties: {
            role: { type: "string", description: "The job role, e.g., Senior Frontend Developer" },
            level: { type: "string", description: "The job experience level, e.g., Senior, Junior" },
            techstack: { type: "string", description: "Comma-separated list of technologies, e.g., React, TypeScript, Node.js" },
            amount: { type: "string", description: "The number of questions, e.g., 5, 10" },
            type: {
              type: "string",
              enum: interviewTypes, // ✅ Use the mutable array here
              description: "The type of interview questions."
            },
          },
          required: requiredFields, // ✅ Use the mutable array here
        },
      },
    } as const;

    // Starts the Vapi agent
    vapi.start({
      model: {
        provider: "openai",
        model: "gpt-4o",
        tools: [createInterviewTool],
        messages: [{
          role: 'system',
          content: 'You are an assistant that helps users create a mock job interview. Ask the user for the job role, experience level, tech stack, number of questions, and the type of interview (technical, behavioral, or mixed).'
        }]
      },
      clientMessages: [],
      serverMessages: [],
    });

    // Listens for when Vapi has collected all the information
    vapi.on("message", async (message: any) => {
      if (
        message.type === "function-call" &&
        message.functionCall?.name === "createInterview"
      ) {
        const interviewDetails = message.functionCall.parameters;

        try {
          // Calls your API to save the interview to Firebase
          const response = await fetch("/api/vapi/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(interviewDetails),
          });
          const result = await response.json();

          if (result.success && result.id) {
            // Redirects to the newly created interview page
            router.push(`/interview/${result.id}`);
          } else {
            console.error("Failed to create interview:", result.error);
          }
        } catch (error) {
          console.error("Error calling API:", error);
        } finally {
          vapi.stop();
        }
      }
    });
  };

  return (
    <Button onClick={handleCreateInterview} className="btn-primary max-sm-w-full">
      Start an Interview
    </Button>
  );
};

export default CreateInterviewButton;