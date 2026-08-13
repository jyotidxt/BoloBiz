"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";

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
  const { language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat thread to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Show a temporary toast notification
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleMicClick = () => {
    const notice = language === "hi"
      ? "🎙️ आवाज (Voice) इनपुट की सुविधा Phase 3 में आ रही है! कृपया टाइप करके पूछें।"
      : "🎙️ Voice input features are coming next in Phase 3! Please type your command.";
    triggerToast(notice);
  };

  // Reset/Clear Conversation Session
  const handleClearChat = () => {
    setMessages([]);
    setSessionId(null);
    const notice = language === "hi" ? "चैट का इतिहास साफ़ कर दिया गया है।" : "Chat conversation history cleared.";
    triggerToast(notice);
  };

  // Process sending message
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

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "ASSISTANT",
        content: data.content,
        toolCallDetails: data.toolExecuted,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "ASSISTANT",
        content: language === "hi"
          ? "मुझसे संपर्क करने में कोई दिक्कत आ रही है। कृपया इंटरनेट चेक करें। (Failed to connect to BoloBiz)"
          : "Sorry, I am having trouble connecting. Please check your internet connection.",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to handle chip suggestion clicks
  const handleSuggestionClick = (query: string) => {
    handleSendMessage(query);
  };

  // Localized template constants
  const pageTitle = language === "hi" ? "BoloBiz AI असिस्टेंट" : "BoloBiz AI Assistant";
  const pageSubtitle = language === "hi" ? "बिज़नेस का हिसाब रखें — बस बोलकर" : "Run your business simply by speaking";
  const clearChatBtn = language === "hi" ? "चैट साफ़ करें 🗑️" : "Clear Chat 🗑️";
  const placeholderText = language === "hi" ? "बिज़नेस कमांड लिखें... (जैसे: 'Ramesh ko 500 udhaar diye')" : "Type a business command...";
  const sendBtnLabel = language === "hi" ? "भेजें" : "Send";

  const suggestions = language === "hi"
    ? [
        "आज कितनी sale हुई?",
        "किसका payment बाकी है?",
        "Maggi कितनी बची है?",
        "Ramesh ka balance batao.",
      ]
    : [
        "What is today's sale?",
        "Who has pending payments?",
        "How much Maggi is left in stock?",
        "Add Ramesh as a customer.",
      ];

  return (
    <div style={styles.container} className="animate-fade-in">
      {/* Toast Alert popup */}
      {toastMessage && (
        <div style={styles.toast} className="animate-fade-in">
          {toastMessage}
        </div>
      )}

      {/* Header bar */}
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>🎙️ {pageTitle}</h2>
          <p style={styles.subtitle}>{pageSubtitle}</p>
        </div>

        <div>
          <button onClick={handleClearChat} style={styles.clearBtn}>
            {clearChatBtn}
          </button>
        </div>
      </div>

      {/* Conversation Thread Canvas */}
      <div className="glass-panel" style={styles.chatCard}>
        <div style={styles.chatArea}>
          {messages.length === 0 ? (
            <div style={styles.welcomePrompt}>
              <div style={styles.micCircleBig} onClick={handleMicClick}>
                🎙️
              </div>
              <h3 style={{ color: "var(--text-primary)" }}>
                {language === "hi" ? "बिज़नेस का हिसाब बस बोलकर" : "BoloBiz Is Listening"}
              </h3>
              <p style={{ maxWidth: "450px", margin: "0.5rem auto", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                {language === "hi"
                  ? "अपनी भाषा में पूछें। नीचे दिए गए किसी भी उदाहरण पर क्लिक करें और देखें कि BoloBiz कैसे काम करता है।"
                  : "Type naturally in English, Hindi, or Hinglish. E.g. 'Ramesh ko 500 udhaar diye.' Click on any suggestion chip below to test."
                }
              </p>
              
              {/* Suggestion Chips */}
              <div style={styles.suggestions}>
                {suggestions.map((sug, idx) => (
                  <div
                    key={idx}
                    style={styles.suggestCard}
                    onClick={() => handleSuggestionClick(sug)}
                  >
                    💬 {sug}
                  </div>
                ))}
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
                          <span>⚡ {language === "hi" ? "सिस्टम एक्शन" : "System Action Executed"}</span>
                          <span style={styles.receiptBadge}>
                            {msg.toolCallDetails.name}
                          </span>
                        </div>
                        <div style={styles.receiptBody}>
                          {/* Render details based on tool */}
                          {msg.toolCallDetails.name === "createCustomer" && (
                            <div><strong>Name:</strong> {msg.toolCallDetails.args.name}</div>
                          )}
                          {(msg.toolCallDetails.name === "createSale" ||
                            msg.toolCallDetails.name === "createCredit" ||
                            msg.toolCallDetails.name === "recordPayment" ||
                            msg.toolCallDetails.name === "createExpense") && (
                            <>
                              <div><strong>Amount:</strong> ₹{msg.toolCallDetails.args.amount}</div>
                              {msg.toolCallDetails.args.customerName && (
                                <div><strong>Customer:</strong> {msg.toolCallDetails.args.customerName}</div>
                              )}
                              {msg.toolCallDetails.result?.outstandingBalance !== undefined && (
                                <div style={{ color: "var(--accent-purple)", marginTop: "0.25rem" }}>
                                  <strong>New Balance:</strong> ₹{msg.toolCallDetails.result.outstandingBalance}
                                </div>
                              )}
                            </>
                          )}
                          {msg.toolCallDetails.name === "addInventory" && (
                            <>
                              <div><strong>Product:</strong> {msg.toolCallDetails.args.productName}</div>
                              <div><strong>Adjustment:</strong> {msg.toolCallDetails.args.quantity}</div>
                              {msg.toolCallDetails.result?.stockQuantity !== undefined && (
                                <div><strong>Updated Quantity:</strong> {msg.toolCallDetails.result.stockQuantity}</div>
                              )}
                            </>
                          )}
                          {msg.toolCallDetails.name === "getInventory" && (
                            <div>
                              <strong>Product:</strong> {msg.toolCallDetails.args.productName || "All Catalog"}
                              {msg.toolCallDetails.result?.stock !== undefined && (
                                <div><strong>Stock Level:</strong> {msg.toolCallDetails.result.stock} units</div>
                              )}
                            </div>
                          )}
                          {msg.toolCallDetails.name === "getCustomerBalance" && (
                            <div>
                              <strong>Customer:</strong> {msg.toolCallDetails.args.customerName}
                              {msg.toolCallDetails.result?.balance !== undefined && (
                                <div style={{ color: "var(--status-danger)", fontWeight: 700 }}>
                                  <strong>Outstanding:</strong> ₹{msg.toolCallDetails.result.balance}
                                </div>
                              )}
                            </div>
                          )}
                          {/* Generic summary message fallback */}
                          {!["createCustomer", "createSale", "createCredit", "recordPayment", "createExpense", "addInventory", "getInventory", "getCustomerBalance"].includes(msg.toolCallDetails.name) && (
                            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                              Queried actual database records.
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
            onClick={handleMicClick}
            style={styles.micBtn}
            aria-label="Activate voice (disabled)"
          >
            🎙️
          </button>

          <input
            type="text"
            placeholder={placeholderText}
            style={styles.input}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
            disabled={loading}
          />

          <button
            onClick={() => handleSendMessage()}
            style={styles.sendBtn}
            disabled={loading || !inputText.trim()}
          >
            {sendBtnLabel}
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
  toast: {
    position: "fixed" as const,
    bottom: "100px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#1e1b4b",
    color: "#ffffff",
    padding: "0.75rem 1.5rem",
    borderRadius: "30px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
    fontSize: "0.9rem",
    fontWeight: 600,
    zIndex: 100,
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
    color: "var(--text-primary)",
  },
  subtitle: {
    fontSize: "0.9rem",
    color: "var(--text-secondary)",
  },
  clearBtn: {
    background: "#ffffff",
    border: "1px solid rgba(0, 0, 0, 0.08)",
    padding: "0.5rem 1rem",
    borderRadius: "15px",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
    transition: "all 0.2s ease",
    ":hover": {
      background: "#f9fafb",
      color: "var(--text-primary)",
    },
  },
  chatCard: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    padding: "1.5rem",
    overflow: "hidden",
    background: "#ffffff",
    border: "1px solid rgba(0, 0, 0, 0.05)",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.03)",
    borderRadius: "20px",
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
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "var(--accent-gradient)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "2.25rem",
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(219, 39, 119, 0.25)",
    marginBottom: "1.5rem",
    transition: "transform 0.2s ease",
    color: "#fff",
    ":hover": {
      transform: "scale(1.03)",
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
    background: "#f9fafb",
    border: "1px solid rgba(0, 0, 0, 0.06)",
    padding: "0.65rem 1.25rem",
    borderRadius: "20px",
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.01)",
    transition: "all 0.2s ease",
    ":hover": {
      borderColor: "var(--accent-purple)",
      background: "rgba(124, 58, 237, 0.05)",
      color: "var(--accent-purple)",
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
    padding: "0.85rem 1.25rem",
    background: "var(--accent-gradient)",
    borderRadius: "20px 20px 4px 20px",
    color: "#fff",
    boxShadow: "0 4px 15px rgba(219, 39, 119, 0.15)",
    fontSize: "0.95rem",
    textAlign: "left" as const,
  },
  assistantRow: {
    display: "flex",
    justifyContent: "flex-start",
  },
  assistantBubble: {
    maxWidth: "70%",
    padding: "0.85rem 1.25rem",
    background: "#f3f4f6",
    border: "1px solid rgba(0,0,0,0.04)",
    borderRadius: "20px 20px 20px 4px",
    color: "var(--text-primary)",
    fontSize: "0.95rem",
    textAlign: "left" as const,
  },
  receiptCard: {
    marginTop: "0.75rem",
    background: "#ffffff",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: "10px",
    padding: "0.75rem 1rem",
    boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
    color: "var(--text-primary)",
  },
  receiptHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
    paddingBottom: "0.5rem",
    marginBottom: "0.5rem",
  },
  receiptBadge: {
    background: "rgba(124, 58, 237, 0.08)",
    color: "var(--accent-purple)",
    padding: "0.15rem 0.4rem",
    borderRadius: "4px",
    fontSize: "0.7rem",
    fontWeight: 700,
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
    background: "#f9fafb",
    border: "1px solid rgba(0, 0, 0, 0.06)",
    padding: "0.5rem",
    borderRadius: "30px",
  },
  micBtn: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "#ffffff",
    border: "1px solid rgba(0,0,0,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.25rem",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
    transition: "all 0.2s ease",
    ":hover": {
      background: "#f3f4f6",
    },
  },
  input: {
    flex: 1,
    padding: "0.75rem 1rem",
    color: "var(--text-primary)",
    fontSize: "0.95rem",
    background: "transparent",
  },
  sendBtn: {
    background: "var(--accent-purple)",
    color: "#fff",
    fontWeight: 700,
    padding: "0.65rem 1.5rem",
    borderRadius: "20px",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(124, 58, 237, 0.2)",
    transition: "all 0.2s ease",
    ":hover": {
      background: "#6d28d9",
    },
    ":disabled": {
      background: "#e5e7eb",
      color: "var(--text-muted)",
      boxShadow: "none",
      cursor: "default",
    },
  },
};
