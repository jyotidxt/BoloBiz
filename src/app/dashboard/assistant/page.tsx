"use client";

import { useState, useEffect, useRef } from "react";

interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  toolCallDetails?: {
    name: string;
    args: any;
    result: any;
  } | null;
  createdAt: Date;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [languageMode, setLanguageMode] = useState<"hi-IN" | "en-IN">("hi-IN");
  const [loading, setLoading] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll chat thread
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = languageMode;

        rec.onstart = () => {
          setIsRecording(true);
        };

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputText(transcript);
            handleSendMessage(transcript);
          }
        };

        rec.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsRecording(false);
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, [languageMode]);

  // Toggle voice recognition
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome/Edge or type your message.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setInputText("");
      recognitionRef.current.lang = languageMode;
      recognitionRef.current.start();
    }
  };

  // Text-To-Speech Synthesis helper
  const speakText = (text: string) => {
    if (!ttsEnabled || typeof window === "undefined" || !window.speechSynthesis) return;

    // Cancel any ongoing speaking
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    // Find a suitable voice
    const voices = window.speechSynthesis.getVoices();
    
    if (languageMode === "hi-IN") {
      // Find a Hindi voice
      const hindiVoice = voices.find((v) => v.lang.includes("hi-") || v.lang.includes("IN"));
      if (hindiVoice) utterance.voice = hindiVoice;
    } else {
      // Find an Indian English or general English voice
      const engVoice = voices.find((v) => v.lang.includes("en-IN") || v.lang.includes("en-US"));
      if (engVoice) utterance.voice = engVoice;
    }

    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Handle message posting
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    setInputText("");
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: "USER",
      content: text,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId: sessionId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to contact assistant");
      }

      setSessionId(data.sessionId);

      let parsedTools = null;
      if (data.toolExecuted) {
        parsedTools = data.toolExecuted;
      }

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "ASSISTANT",
        content: data.content,
        toolCallDetails: parsedTools,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      
      // Proactive Text-To-Speech
      speakText(data.content);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "ASSISTANT",
        content: "मुझसे संपर्क करने में कोई दिक्कत आ रही है। कृपया दोबारा बोलें या इंटरनेट चेक करें। (Failed to connect to BoloBiz)",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>🎙️ BoloBiz Voice Assistant</h2>
          <p style={styles.subtitle}>बस बोलकर अपना बिज़नेस चलाएं</p>
        </div>

        <div style={styles.controls}>
          <div style={styles.toggleContainer}>
            <span style={styles.controlLabel}>Audio Readout 🔊</span>
            <button
              onClick={() => setTtsEnabled(!ttsEnabled)}
              style={ttsEnabled ? styles.toggleOn : styles.toggleOff}
            >
              {ttsEnabled ? "ON" : "OFF"}
            </button>
          </div>

          <div style={styles.toggleContainer}>
            <span style={styles.controlLabel}>Primary Language:</span>
            <button
              onClick={() => setLanguageMode(languageMode === "hi-IN" ? "en-IN" : "hi-IN")}
              style={styles.languageToggleBtn}
            >
              {languageMode === "hi-IN" ? "🇮🇳 Hindi / Hinglish" : "🇬🇧 English"}
            </button>
          </div>
        </div>
      </div>

      {/* Main chat window container */}
      <div className="glass-panel" style={styles.chatCard}>
        <div style={styles.chatArea}>
          {messages.length === 0 ? (
            <div style={styles.welcomePrompt}>
              <div style={styles.micCircleBig} onClick={toggleRecording}>
                🎙️
              </div>
              <h3>BoloBiz Is Listening</h3>
              <p style={{ maxWidth: "450px", margin: "0.5rem auto", color: "var(--text-secondary)" }}>
                Start talking to do actions instantly. The AI will translate your dialect and execute it securely.
              </p>
              <div style={styles.suggestions}>
                <div style={styles.suggestCard} onClick={() => setInputText("Aaj Ramesh ko 500 rupaye udhaar diye")}>
                  "Aaj Ramesh ko 500 rupaye udhaar diye"
                </div>
                <div style={styles.suggestCard} onClick={() => setInputText("aaj ki sale kitni hui?")}>
                  "Aaj ki sales kitni hui?"
                </div>
                <div style={styles.suggestCard} onClick={() => setInputText("nayi item Maggi add karo ₹15 price par")}>
                  "Nayi item Maggi add karo..."
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.messagesList}>
              {messages.map((msg) => (
                <div key={msg.id} style={msg.role === "USER" ? styles.userRow : styles.assistantRow}>
                  <div style={msg.role === "USER" ? styles.userBubble : styles.assistantBubble}>
                    <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
                    
                    {/* Render transaction confirmation card if tool executed */}
                    {msg.toolCallDetails && (
                      <div style={styles.receiptCard}>
                        <div style={styles.receiptHeader}>
                          <span>⚡ System Action Executed</span>
                          <span style={styles.receiptBadge}>
                            {msg.toolCallDetails.name === "recordTransaction" && "Khata Transaction"}
                            {msg.toolCallDetails.name === "addCustomer" && "New Customer"}
                            {msg.toolCallDetails.name === "addProduct" && "New Product"}
                            {msg.toolCallDetails.name === "updateStock" && "Stock Adjustment"}
                            {msg.toolCallDetails.name === "getBusinessInsights" && "Database Query"}
                          </span>
                        </div>
                        <div style={styles.receiptBody}>
                          {msg.toolCallDetails.name === "recordTransaction" && (
                            <>
                              <div><strong>Type:</strong> {msg.toolCallDetails.args.type}</div>
                              <div><strong>Amount:</strong> ₹{msg.toolCallDetails.args.amount}</div>
                              {msg.toolCallDetails.args.customerName && (
                                <div><strong>Customer:</strong> {msg.toolCallDetails.args.customerName}</div>
                              )}
                              {msg.toolCallDetails.result?.outstandingBalance !== undefined && (
                                <div style={{ color: "var(--accent-cyan)", marginTop: "0.25rem" }}>
                                  <strong>New Ledger Balance:</strong> ₹{msg.toolCallDetails.result.outstandingBalance}
                                </div>
                              )}
                            </>
                          )}
                          {msg.toolCallDetails.name === "addCustomer" && (
                            <div><strong>Name:</strong> {msg.toolCallDetails.args.name}</div>
                          )}
                          {msg.toolCallDetails.name === "addProduct" && (
                            <>
                              <div><strong>Product:</strong> {msg.toolCallDetails.args.name}</div>
                              <div><strong>Price:</strong> ₹{msg.toolCallDetails.args.price}</div>
                            </>
                          )}
                          {msg.toolCallDetails.name === "updateStock" && (
                            <>
                              <div><strong>Product:</strong> {msg.toolCallDetails.args.productName}</div>
                              <div><strong>Adjustment:</strong> {msg.toolCallDetails.args.quantityAdjustment > 0 ? "+" : ""}{msg.toolCallDetails.args.quantityAdjustment}</div>
                            </>
                          )}
                          {msg.toolCallDetails.name === "getBusinessInsights" && (
                            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                              Queried database metrics securely.
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={styles.assistantRow}>
                  <div style={styles.assistantBubble}>
                    <div style={styles.typingIndicator}>
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div style={styles.inputContainer}>
          <button
            onClick={toggleRecording}
            style={isRecording ? styles.micBtnActive : styles.micBtn}
            className={isRecording ? "animate-pulse-mic" : ""}
          >
            {isRecording ? "🔴" : "🎙️"}
          </button>

          <input
            type="text"
            placeholder={isRecording ? "Listening..." : "Type a command or speak..."}
            style={styles.input}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
          />

          <button onClick={() => handleSendMessage()} style={styles.sendBtn}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    height: "calc(100vh - 120px)",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    flexWrap: "wrap" as const,
    gap: "1rem",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: 800,
    color: "#fff",
  },
  subtitle: {
    fontSize: "0.9rem",
    color: "var(--text-secondary)",
  },
  controls: {
    display: "flex",
    gap: "1.5rem",
    alignItems: "center",
  },
  toggleContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  controlLabel: {
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
    fontWeight: 500,
  },
  toggleOn: {
    padding: "0.3rem 0.75rem",
    borderRadius: "12px",
    background: "var(--status-success)",
    color: "#fff",
    fontSize: "0.75rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  toggleOff: {
    padding: "0.3rem 0.75rem",
    borderRadius: "12px",
    background: "var(--bg-tertiary)",
    color: "var(--text-secondary)",
    fontSize: "0.75rem",
    fontWeight: 700,
    cursor: "pointer",
  },
  languageToggleBtn: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "0.4rem 1rem",
    borderRadius: "15px",
    color: "#fff",
    fontSize: "0.85rem",
    fontWeight: 500,
    cursor: "pointer",
  },
  chatCard: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    padding: "1.5rem",
    overflow: "hidden",
  },
  chatArea: {
    flex: 1,
    overflowY: "auto" as const,
    marginBottom: "1rem",
    paddingRight: "0.5rem",
  },
  welcomePrompt: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    textAlign: "center" as const,
    padding: "2rem",
  },
  micCircleBig: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-indigo) 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2.5rem",
    cursor: "pointer",
    boxShadow: "0 10px 30px rgba(6, 182, 212, 0.3)",
    marginBottom: "1.5rem",
    transition: "transform 0.2s ease",
    ":hover": {
      transform: "scale(1.05)",
    },
  },
  suggestions: {
    display: "flex",
    gap: "0.75rem",
    marginTop: "2.5rem",
    flexWrap: "wrap" as const,
    justifyContent: "center",
  },
  suggestCard: {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    padding: "0.75rem 1.25rem",
    borderRadius: "20px",
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      borderColor: "var(--accent-cyan)",
      background: "rgba(6, 182, 212, 0.05)",
      color: "#fff",
    },
  },
  messagesList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "1.5rem",
  },
  userRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
  userBubble: {
    maxWidth: "70%",
    padding: "1rem 1.25rem",
    background: "linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-purple) 100%)",
    borderRadius: "20px 20px 4px 20px",
    color: "#fff",
    boxShadow: "0 4px 15px rgba(99, 102, 241, 0.15)",
  },
  assistantRow: {
    display: "flex",
    justifyContent: "flex-start",
  },
  assistantBubble: {
    maxWidth: "70%",
    padding: "1rem 1.25rem",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "20px 20px 20px 4px",
    color: "#fff",
  },
  receiptCard: {
    marginTop: "0.75rem",
    background: "rgba(10, 15, 29, 0.8)",
    border: "1px solid rgba(6, 182, 212, 0.2)",
    borderRadius: "10px",
    padding: "0.75rem 1rem",
  },
  receiptHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.75rem",
    color: "var(--text-secondary)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    paddingBottom: "0.5rem",
    marginBottom: "0.5rem",
  },
  receiptBadge: {
    background: "rgba(6, 182, 212, 0.12)",
    color: "var(--accent-cyan)",
    padding: "0.15rem 0.4rem",
    borderRadius: "4px",
    fontSize: "0.7rem",
    fontWeight: 600,
  },
  receiptBody: {
    fontSize: "0.85rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.25rem",
  },
  typingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
    padding: "0.25rem 0.5rem",
  },
  inputContainer: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center",
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    padding: "0.5rem",
    borderRadius: "30px",
  },
  micBtn: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.25rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  micBtnActive: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "var(--status-danger)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.25rem",
    cursor: "pointer",
  },
  input: {
    flex: 1,
    padding: "0.75rem 1rem",
    color: "#fff",
    fontSize: "0.95rem",
  },
  sendBtn: {
    background: "var(--accent-cyan)",
    color: "#fff",
    fontWeight: 600,
    padding: "0.6rem 1.5rem",
    borderRadius: "20px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      background: "var(--accent-cyan-hover)",
    },
  },
};
