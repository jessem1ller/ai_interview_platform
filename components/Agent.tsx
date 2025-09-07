"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { createFeedback } from "@/lib/actions/general.action";

const Agent = ({ userName, userId, interviewId, feedbackId, type, questions }: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState("INACTIVE");
  const [messages, setMessages] = useState<any[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState("");
  const firstName = userName?.split(' ')[0] || 'there';

  // This handler only needs to listen for transcripts to display them.
  const handleMessage = useCallback(async (message: any) => {
    if (message.type === "transcript" && message.transcriptType === "final") {
      setMessages((prev) => [...prev, { role: message.role, content: message.transcript }]);
    }
  }, []);

  const onCallStart = useCallback(() => setCallStatus("ACTIVE"), []);
  const onCallEnd = useCallback(() => {
    setCallStatus("FINISHED");
    if (type === "generate") {
      router.push('/');
      router.refresh();
    }
  }, [type, router]);
  
  const onSpeechStart = useCallback(() => setIsSpeaking(true), []);
  const onSpeechEnd = useCallback(() => setIsSpeaking(false), []);
  const onError = useCallback((error: any) => console.log("Error:", error), []);

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
    const handleGenerateFeedback = async (transcript: any[]) => {
      if (!transcript || transcript.length === 0) return;
      const { success } = await createFeedback({ interviewId: interviewId!, userId: userId!, transcript, feedbackId });
      if (success) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        router.push("/");
      }
    };
    if (callStatus === "FINISHED" && type !== "generate") {
      handleGenerateFeedback(messages);
    }
  }, [callStatus, messages, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    setCallStatus("CONNECTING");

    if (type === "generate") {
      const assistantId = process.env.NEXT_PUBLIC_VAPI_GENERATION_ASSISTANT_ID;
      const variables = {
        variableValues: {
          username: firstName,
          userid: userId
        }
      };

      // ✅ ADD THIS LOG TO SEE THE DATA
      console.log("SENDING TO VAPI:", {
        assistantId: assistantId,
        payload: variables
      });

      vapi.start(assistantId!, variables);

    } else {
      const assistantId = process.env.NEXT_PUBLIC_VAPI_INTERVIEWER_ASSISTANT_ID;
      const formattedQuestions = questions?.map((q) => `- ${q}`).join("\n") ?? "";
      const variables = {
        variableValues: {
          questions: formattedQuestions,
          name: firstName
        }
      };
      
      console.log("SENDING TO VAPI:", {
        assistantId: assistantId,
        payload: variables
      });
      
      vapi.start(assistantId!, variables);
    }
  };

  const handleDisconnect = () => vapi.stop();

  return (
    <>
      <div className="call-view">
        <div className="card-interviewer">
          <div className="avatar">
            <Image src="/ai-avatar.png" alt="profile-image" width={65} height={54} className="object-cover" />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>Johnny Five Interviewer</h3>
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