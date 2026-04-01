import { useState } from "react";
import { cn } from "@/lib/utils";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { speakText, stopSpeaking } from "@/hooks/use-speech";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  isStreaming?: boolean;
}

const ChatMessage = ({ message, isUser, isStreaming }: ChatMessageProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = async () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      await speakText(message);
      setIsSpeaking(false);
    }
  };

  return (
    <div
      className={cn(
        "flex w-full animate-fade-in",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-6 py-4 shadow-sm transition-all duration-200",
          isUser
            ? "bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg"
            : "bg-card text-card-foreground border border-border"
        )}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {message}
          {isStreaming && (
            <span className="inline-block w-1 h-4 ml-1 bg-current animate-pulse" />
          )}
        </p>
        {!isUser && !isStreaming && (
          <div className="mt-2 flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSpeak}
              className={cn(
                "h-7 w-7 rounded-full",
                isSpeaking ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
