"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { createFeedback } from "@/lib/actions/general.action";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

const interviewTypes: string[] = ["technical", "behavioral", "mixed"];
const requiredFields: string[] = ["role", "level", "techstack", "amount", "type"];

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
        type: { type: "string", enum: interviewTypes, description: "The type of interview questions." },
      },
      required: requiredFields,
    },
  },
} as const;


const Agent = ({ userName, userId, interviewId, feedbackId, type, questions }: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");

  const handleMessage = useCallback(async (message: any) => {
    if (message.type === "transcript" && message.transcriptType === "final") {
      // --- This is the corrected line ---
      const newMessage = {
        role: message.role as 'user' | 'assistant', // Added type assertion
        content: message.transcript,
      };
      setMessages((prev) => [...prev, newMessage]);
    }
    if (
      type === "generate" &&
      message.type === "function-call" &&
      message.functionCall?.name === "createInterview"
    ) {
      const interviewDetails = message.functionCall.parameters;
      try {
        const response = await fetch("/api/vapi/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...interviewDetails, userid: userId }),
        });
        const result = await response.json();
        if (result.success && result.id) {
          router.push(`/interview/${result.id}`);
        } else {
          console.error("Failed to create interview:", result.error);
          router.push('/');
        }
      } catch (error) {
        console.error("Error calling API:", error);
      } finally {
        vapi.stop();
      }
    }
  }, [type, userId, router]);

  const onCallStart = useCallback(() => setCallStatus(CallStatus.ACTIVE), []);
  const onCallEnd = useCallback(() => setCallStatus(CallStatus.FINISHED), []);
  const onSpeechStart = useCallback(() => setIsSpeaking(true), []);
  const onSpeechEnd = useCallback(() => setIsSpeaking(false), []);
  const onError = useCallback((error: any) => {
    console.log("Error:", error);
    if (error?.errorMsg === 'Meeting has ended') {
      setCallStatus(CallStatus.FINISHED);
    }
  }, []);

  useEffect(() => {
    vapi.on("message", handleMessage);
    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);
    return () => {
      vapi.off("message", handleMessage);
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, [handleMessage, onCallStart, onCallEnd, onSpeechStart, onSpeechEnd, onError]);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }
    const handleGenerateFeedback = async (transcript: SavedMessage[]) => {
      if (!transcript || transcript.length === 0) return;
      console.log("handleGenerateFeedback");
      const { success, feedbackId: id } = await createFeedback({ interviewId: interviewId!, userId: userId!, transcript, feedbackId });
      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/");
      }
    };
    if (callStatus === CallStatus.FINISHED && type !== "generate") {
      handleGenerateFeedback(messages);
    }
  }, [callStatus, messages, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
  setCallStatus(CallStatus.CONNECTING);

  if (type === "generate") {
    vapi.start({
      firstMessage: "Hello! I can help you create a mock interview. To get started, what is the job role you're preparing for?",
      model: {
        provider: "openai",
        model: "gpt-4o",
        tools: [createInterviewTool],
        messages: [{
          role: 'system',
          content: "You are an assistant that helps a user create a mock interview. Your primary goal is to collect all necessary information by asking questions one at a time. Once you have all the details, you MUST call the `createInterview` function. Do not end the conversation until the function has been successfully called."
        }]
      },
      // ✅ Add these two empty arrays
      clientMessages: [],
      serverMessages: [],
    });
  } else {
    const formattedQuestions = questions?.map((q) => `- ${q}`).join("\n") ?? "";
    vapi.start({
      firstMessage: "Welcome to your mock interview. Let's begin with your first question.",
      model: {
        provider: "openai",
        model: "gpt-4o",
        messages: [{
          role: "system",
          content: `You are an AI interviewer. Your role is to ask the user the following questions one by one. Do not deviate. The questions are:\n${formattedQuestions}`
        }]
      },
      // ✅ Add these two empty arrays
      clientMessages: [],
      serverMessages: [],
    });
  }
};

  const handleDisconnect = () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();
  };

  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image src="/ai-avatar.png" alt="profile-image" width={65} height={54} className="object-cover" />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
        </div>
        <div className="card-border">
          <div className="card-content">
            <Image src="/user-avatar.png" alt="profile-image" width={539} height={539} className="rounded-full object-cover size-[120px]" />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>
      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p key={lastMessage} className={cn("transition-opacity duration-500 opacity-0", "animate-fadeIn opacity-100")}>
              {lastMessage}
            </p>
          </div>
        </div>
      )}
      <div className="w-full flex justify-center">
        {callStatus !== "ACTIVE" ? (
          <button className="relative btn-call" onClick={handleCall}>
            <span className={cn("absolute animate-ping rounded-full opacity-75", callStatus !== "CONNECTING" && "hidden")} />
            <span className="relative">
              {callStatus === "INACTIVE" || callStatus === "FINISHED" ? "Call" : "..."}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={handleDisconnect}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;