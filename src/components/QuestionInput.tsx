import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, MicOff } from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech";

interface QuestionInputProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

const QuestionInput = ({ onSubmit, isLoading }: QuestionInputProps) => {
  const [question, setQuestion] = useState("");
  const { isListening, transcript, startListening, stopListening, isSupported } = useSpeechRecognition();

  useEffect(() => {
    if (transcript) {
      setQuestion(transcript);
    }
  }, [transcript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      onSubmit(question.trim());
      setQuestion("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isListening ? "Listening..." : "Ask me anything..."}
        className={`min-h-[100px] pr-24 resize-none bg-card border-border focus:border-primary transition-colors ${isListening ? "border-red-500 ring-1 ring-red-500/30" : ""}`}
        disabled={isLoading}
      />
      <div className="absolute bottom-3 right-3 flex items-center gap-2">
        {isSupported && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={toggleListening}
            className={`h-10 w-10 rounded-full transition-all duration-200 ${isListening ? "bg-red-500 text-white hover:bg-red-600 animate-pulse" : "hover:bg-muted"}`}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        )}
        <Button
          type="submit"
          size="icon"
          disabled={!question.trim() || isLoading}
          className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent hover:shadow-glow transition-all duration-200"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default QuestionInput;
