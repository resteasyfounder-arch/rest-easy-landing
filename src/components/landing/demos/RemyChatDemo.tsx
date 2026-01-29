import { useEffect, useState } from "react";
import remyAvatar from "@/assets/remy-avatar.png";

const conversations = [
  {
    user: "What should I focus on first?",
    remy: "Based on your assessment, I'd prioritize updating your healthcare directive. It's a quick win that protects your wishes.",
  },
  {
    user: "Why is my legal score low?",
    remy: "Your legal readiness is at 45% because you haven't completed a will yet. I can walk you through your options.",
  },
  {
    user: "What's next after I finish the will?",
    remy: "Great progress! Next, let's secure your digital accounts and set up beneficiary access.",
  },
];

const RemyChatDemo = () => {
  const [conversationIndex, setConversationIndex] = useState(0);
  const [showUser, setShowUser] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [showRemy, setShowRemy] = useState(false);
  const [displayedText, setDisplayedText] = useState("");

  const currentConversation = conversations[conversationIndex];

  useEffect(() => {
    // Reset state for new conversation
    setShowUser(false);
    setShowTyping(false);
    setShowRemy(false);
    setDisplayedText("");

    // Show user message
    const userTimer = setTimeout(() => setShowUser(true), 500);

    // Show typing indicator
    const typingTimer = setTimeout(() => setShowTyping(true), 1500);

    // Hide typing, start showing Remy's response
    const remyTimer = setTimeout(() => {
      setShowTyping(false);
      setShowRemy(true);
    }, 2500);

    return () => {
      clearTimeout(userTimer);
      clearTimeout(typingTimer);
      clearTimeout(remyTimer);
    };
  }, [conversationIndex]);

  // Type out Remy's response character by character
  useEffect(() => {
    if (!showRemy) return;

    const text = currentConversation.remy;
    let charIndex = 0;

    const typeTimer = setInterval(() => {
      if (charIndex < text.length) {
        setDisplayedText(text.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeTimer);
        // Move to next conversation after delay
        setTimeout(() => {
          setConversationIndex((prev) => (prev + 1) % conversations.length);
        }, 3000);
      }
    }, 25);

    return () => clearInterval(typeTimer);
  }, [showRemy, currentConversation.remy]);

  return (
    <div className="p-4 h-full min-h-[280px] flex flex-col justify-center" aria-hidden="true">
      {/* Chat container */}
      <div className="space-y-3">
        {/* User message */}
        <div
          className={`flex justify-end transition-all duration-300 ${
            showUser ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <div className="bg-primary/10 text-foreground rounded-2xl rounded-br-md px-4 py-2 max-w-[85%]">
            <p className="font-body text-sm">{currentConversation.user}</p>
          </div>
        </div>

        {/* Typing indicator */}
        <div
          className={`flex items-start gap-2 transition-all duration-300 ${
            showTyping ? "opacity-100" : "opacity-0"
          }`}
        >
          <img
            src={remyAvatar}
            alt="Remy"
            className="w-8 h-8 rounded-full shrink-0"
          />
          <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-typing-dot" />
              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-typing-dot animation-delay-150" />
              <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-typing-dot animation-delay-300" />
            </div>
          </div>
        </div>

        {/* Remy's response */}
        <div
          className={`flex items-start gap-2 transition-all duration-300 ${
            showRemy ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
          }`}
        >
          <img
            src={remyAvatar}
            alt="Remy"
            className="w-8 h-8 rounded-full shrink-0"
          />
          <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-2 max-w-[85%]">
            <p className="font-body text-sm text-foreground">
              {displayedText}
              <span className="inline-block w-0.5 h-4 bg-primary/60 ml-0.5 animate-pulse" />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemyChatDemo;
