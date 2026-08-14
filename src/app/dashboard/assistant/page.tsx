"use client";

import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useVoiceRecognition } from "@/hooks/useVoiceRecognition";
import { useVoiceSynthesis } from "@/hooks/useVoiceSynthesis";
import { formatCurrency } from "@/lib/utils/format";

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

interface PendingAction {
  tool: string;
  args: any;
  originalMessage: string;
}

export default function AssistantPage() {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  // Voice State Machine: IDLE | LISTENING | PROCESSING | THINKING | SPEAKING | ERROR
  const [voiceState, setVoiceState] = useState<"IDLE" | "LISTENING" | "PROCESSING" | "THINKING" | "SPEAKING" | "ERROR">("IDLE");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Voice Settings
  const [voiceInputLanguage, setVoiceInputLanguage] = useState<"hi-IN" | "en-IN" | "auto">("auto");
  const [ttsEnabled, setTtsEnabled] = useState(true);

  // Confirmed mutation states
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  // Recording Timer
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Speech hooks
  const { speak, stop: stopSynthesis, isSpeaking: isTtsSpeaking } = useVoiceSynthesis();

  const handleVoiceRecognitionResult = (finalTranscript: string) => {
    setVoiceState("PROCESSING");
    handleSendMessage(finalTranscript);
  };

  const handleVoiceRecognitionError = (errorMsg: string) => {
    setErrorMessage(errorMsg);
    setVoiceState("ERROR");
  };

  const {
    isListening,
    transcript: liveTranscript,
    startListening,
    stopListening,
    cancelListening,
    isSupported: isSttSupported,
  } = useVoiceRecognition({
    onResult: handleVoiceRecognitionResult,
    onError: handleVoiceRecognitionError,
  });

  // Track recording duration
  useEffect(() => {
    let timer: any = null;
    if (voiceState === "LISTENING") {
      setRecordingSeconds(0);
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [voiceState]);

  // Load Voice settings from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTts = localStorage.getItem("bolobiz_voice_responses");
      if (savedTts !== null) {
        setTtsEnabled(savedTts === "On");
      }
    }
  }, []);

  // Sync state machine with speech synthesizer
  useEffect(() => {
    if (isTtsSpeaking) {
      setVoiceState("SPEAKING");
    } else if (voiceState === "SPEAKING") {
      setVoiceState("IDLE");
    }
  }, [isTtsSpeaking]);

  // Sync state machine with speech recognition
  useEffect(() => {
    if (isListening) {
      setVoiceState("LISTENING");
    } else if (voiceState === "LISTENING" && !isListening) {
      setVoiceState("IDLE");
    }
  }, [isListening]);

  // Auto-scroll chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, voiceState]);

  // Settings modification
  const handleTtsToggle = (enabled: boolean) => {
    setTtsEnabled(enabled);
    localStorage.setItem("bolobiz_voice_responses", enabled ? "On" : "Off");
    if (!enabled) {
      stopSynthesis();
      if (voiceState === "SPEAKING") {
        setVoiceState("IDLE");
      }
    }
  };

  const triggerMic = () => {
    if (voiceState === "LISTENING") {
      setVoiceState("PROCESSING");
      stopListening();
    } else {
      setErrorMessage(null);
      stopSynthesis();
      startListening(voiceInputLanguage);
    }
  };

  const handleCancelRecording = () => {
    cancelListening();
    setVoiceState("IDLE");
  };

  const handleClearChat = () => {
    setMessages([]);
    setSessionId(null);
    setPendingAction(null);
    stopSynthesis();
    setVoiceState("IDLE");
  };

  // Process sending message
  const handleSendMessage = async (text: string, isConfirmed = false) => {
    if (!text.trim() || voiceState === "THINKING") return;

    setInputText("");
    setPendingAction(null);
    stopSynthesis();
    setVoiceState("THINKING");

    // Add user bubble (except for confirmation messages where the user just tapped confirm)
    if (!isConfirmed) {
      const userMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "USER",
        content: text,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId: sessionId,
          confirmed: isConfirmed,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to contact assistant");
      }

      setSessionId(data.sessionId);

      // 1. Detect if the tool output requires mutation confirmation from the user
      if (
        data.toolExecuted &&
        data.toolExecuted.result &&
        data.toolExecuted.result.status === "CONFIRMATION_REQUIRED"
      ) {
        setPendingAction({
          tool: data.toolExecuted.name,
          args: data.toolExecuted.result.actionDetails.args,
          originalMessage: text,
        });
      }

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: "ASSISTANT",
        content: data.content,
        toolCallDetails: data.toolExecuted,
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setVoiceState("IDLE");

      // Speak response back
      speak(data.content, ttsEnabled);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An error occurred. Please check connection.");
      setVoiceState("ERROR");
      
      const errorBubble: ChatMessage = {
        id: Math.random().toString(),
        role: "ASSISTANT",
        content: language === "hi"
          ? "मुझे आपके अनुरोध को पूरा करने में समस्या आ रही है। कृपया दुबारा प्रयास करें।"
          : "Sorry, I am having trouble connecting. Please try again.",
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, errorBubble]);
    }
  };

  const handleConfirmAction = () => {
    if (pendingAction) {
      handleSendMessage(pendingAction.originalMessage, true);
    }
  };

  const handleCancelAction = () => {
    setPendingAction(null);
    const cancelBubble: ChatMessage = {
      id: Math.random().toString(),
      role: "ASSISTANT",
      content: language === "hi" ? "ठीक है, कार्रवाई रद्द कर दी गई है।" : "Okay, the action was cancelled.",
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, cancelBubble]);
  };

  // Helper format recording clock
  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // Localized texts
  const title = language === "hi" ? "BoloBiz वॉइस-फर्स्ट AI असिस्टेंट" : "BoloBiz Voice-First AI Assistant";
  const subtitle = language === "hi" ? "अपना बिज़नेस चलाएं — बस बोलकर" : "Run your business simply by speaking";
  const clearBtn = language === "hi" ? "चैट साफ़ करें 🗑️" : "Clear Chat 🗑️";
  const inputPlaceholder = language === "hi" ? "लिखें या बोलें... (जैसे: 'Ramesh ko 500 udhaar diye')" : "Type or click Speak to talk...";
  const sendLabel = language === "hi" ? "भेजें" : "Send";

  const suggestions = language === "hi"
    ? [
        "आज कितनी sale हुई?",
        "किसका payment बाकी है?",
        "Maggi कितनी बची है?",
        "Ramesh ka balance batao.",
      ]
    : [
        "What is today's sale?",
        "Who has pending credit?",
        "How much Maggi is left in stock?",
        "Add Ramesh as a customer.",
      ];

  return (
    <div style={styles.container} className="animate-fade-in">
      <div style={styles.headerRow}>
        <div>
          <h2 style={styles.title}>🎙️ {title}</h2>
          <p style={styles.subtitle}>{subtitle}</p>
        </div>

        <div style={styles.rightHeader}>
          <button onClick={handleClearChat} style={styles.clearBtn}>
            {clearBtn}
          </button>
        </div>
      </div>

      {/* Voice Controls Setting Card */}
      <div className="glass-panel" style={styles.settingsCard}>
        <div style={styles.settingItem}>
          <span style={styles.settingLabel}>🌐 {language === "hi" ? "इनपुट भाषा:" : "Speech Input Language:"}</span>
          <select
            value={voiceInputLanguage}
            onChange={(e) => setVoiceInputLanguage(e.target.value as any)}
            style={styles.settingSelect}
          >
            <option value="auto">{language === "hi" ? "ऑटो डिटेक्ट" : "Auto Detect"}</option>
            <option value="hi-IN">🇮🇳 हिंदी (Hindi / Hinglish)</option>
            <option value="en-IN">🇬🇧 English (en-IN)</option>
          </select>
        </div>

        <div style={styles.settingItem}>
          <span style={styles.settingLabel}>🔊 {language === "hi" ? "आवाज में उत्तर:" : "Vocal Responses:"}</span>
          <button
            onClick={() => handleTtsToggle(!ttsEnabled)}
            style={ttsEnabled ? styles.toggleOn : styles.toggleOff}
          >
            {ttsEnabled ? (language === "hi" ? "चालू" : "ON") : (language === "hi" ? "बंद" : "OFF")}
          </button>
        </div>
      </div>

      {/* Main Chat Canvas */}
      <div className="glass-panel" style={styles.chatCard}>
        
        {/* Error notification header */}
        {voiceState === "ERROR" && errorMessage && (
          <div style={styles.errorAlert}>
            <span>⚠️ {errorMessage}</span>
            <button onClick={() => setVoiceState("IDLE")} style={styles.errorDismissBtn}>✕</button>
          </div>
        )}

        <div style={styles.chatArea}>
          {messages.length === 0 ? (
            <div style={styles.welcomePrompt}>
              <div
                style={{
                  ...styles.micCircleBig,
                  animation: voiceState === "LISTENING" ? "pulse-wave 2s infinite ease-in-out" : "none",
                }}
                onClick={triggerMic}
              >
                🎙️
              </div>
              <h3 style={{ color: "var(--text-primary)" }}>
                {language === "hi" ? "बोलना शुरू करने के लिए माइक टैप करें" : "Tap Microphone to Speak"}
              </h3>
              <p style={{ maxWidth: "480px", margin: "0.5rem auto", color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                {language === "hi"
                  ? "BoloBiz आपकी बोली को समझकर ऑटोमैटिक खाता अपडेट कर देगा। नीचे दिए उदाहरण पर क्लिक करें:"
                  : "BoloBiz understands natural Hindi, Hinglish, and English. Click on any chip suggestion below to test:"
                }
              </p>

              {/* Suggestions list */}
              <div style={styles.suggestions}>
                {suggestions.map((sug, idx) => (
                  <div
                    key={idx}
                    style={styles.suggestCard}
                    onClick={() => handleSendMessage(sug)}
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
                    
                    {/* Inline Speaker Playback Indicator */}
                    {msg.role === "ASSISTANT" && (
                      <div style={styles.speakerRow}>
                        <button
                          onClick={() => speak(msg.content, true)}
                          style={styles.speakerBtn}
                          title="Repeat voice readout"
                        >
                          🔊
                        </button>
                        {isTtsSpeaking && (
                          <button
                            onClick={stopSynthesis}
                            style={styles.speakerBtn}
                            title="Stop speaking"
                          >
                            🔇
                          </button>
                        )}
                      </div>
                    )}

                    {/* Render transaction confirmation card if tool executed */}
                    {msg.toolCallDetails && (
                      <div style={styles.receiptCard}>
                        <div style={styles.receiptHeader}>
                          <span>⚡ {language === "hi" ? "सिस्टम कार्रवाई" : "System Action Status"}</span>
                          <span style={styles.receiptBadge}>
                            {msg.toolCallDetails.name}
                          </span>
                        </div>
                        <div style={styles.receiptBody}>
                          {msg.toolCallDetails.result?.status === "CONFIRMATION_REQUIRED" ? (
                            <div style={styles.confirmationPanel}>
                              <p style={styles.confirmText}>
                                ⚠️ <strong>{language === "hi" ? "पुष्टि की आवश्यकता है:" : "Pending Confirmation:"}</strong>
                              </p>
                              <div style={styles.confirmDetails}>
                                {msg.toolCallDetails.name === "createCredit" && (
                                  <>
                                    <div>Type: 🔴 CREDIT (Loan)</div>
                                    <div>To Customer: {msg.toolCallDetails.args.customerName}</div>
                                    <div>Amount: {formatCurrency(msg.toolCallDetails.args.amount)}</div>
                                  </>
                                )}
                                {msg.toolCallDetails.name === "recordPayment" && (
                                  <>
                                    <div>Type: 🟢 PAYMENT_RECEIVED</div>
                                    <div>From Customer: {msg.toolCallDetails.args.customerName}</div>
                                    <div>Amount: {formatCurrency(msg.toolCallDetails.args.amount)}</div>
                                  </>
                                )}
                                {msg.toolCallDetails.name === "createExpense" && (
                                  <>
                                    <div>Type: 💸 EXPENSE</div>
                                    <div>Amount: {formatCurrency(msg.toolCallDetails.args.amount)}</div>
                                    {msg.toolCallDetails.args.description && (
                                      <div>Note: {msg.toolCallDetails.args.description}</div>
                                    )}
                                  </>
                                )}
                                {msg.toolCallDetails.name === "addInventory" && (
                                  <>
                                    <div>Type: 📦 STOCK ADJUSTMENT</div>
                                    <div>Product: {msg.toolCallDetails.args.productName}</div>
                                    <div>Quantity: {msg.toolCallDetails.args.quantity} units</div>
                                  </>
                                )}
                              </div>
                              
                              {/* Confirm & Cancel UI controls */}
                              {pendingAction && (
                                <div style={styles.confirmBtnRow}>
                                  <button 
                                    onClick={handleConfirmAction} 
                                    disabled={voiceState === "THINKING" || voiceState === "PROCESSING"}
                                    style={styles.confirmBtn}
                                  >
                                    {voiceState === "THINKING" || voiceState === "PROCESSING"
                                      ? (language === "hi" ? "सहेज रहा है..." : "Saving...")
                                      : `✅ ${language === "hi" ? "पुष्टि करें" : "Confirm & Run"}`
                                    }
                                  </button>
                                  <button 
                                    onClick={handleCancelAction} 
                                    disabled={voiceState === "THINKING" || voiceState === "PROCESSING"}
                                    style={styles.cancelBtn}
                                  >
                                    ✕ {language === "hi" ? "रद्द करें" : "Cancel"}
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <>
                              {/* Normal successful execution receipt */}
                              {msg.toolCallDetails.name === "createCustomer" && (
                                <div><strong>Name:</strong> {msg.toolCallDetails.args.name}</div>
                              )}
                              {(msg.toolCallDetails.name === "createSale" ||
                                msg.toolCallDetails.name === "createCredit" ||
                                msg.toolCallDetails.name === "recordPayment" ||
                                msg.toolCallDetails.name === "createExpense") && (
                                <>
                                  <div><strong>Amount:</strong> {formatCurrency(msg.toolCallDetails.args.amount)}</div>
                                  {msg.toolCallDetails.args.customerName && (
                                    <div><strong>Customer:</strong> {msg.toolCallDetails.args.customerName}</div>
                                  )}
                                  {msg.toolCallDetails.result?.outstandingBalance !== undefined && (
                                    <div style={{ color: "var(--accent-purple)", marginTop: "0.25rem", fontWeight: 700 }}>
                                      New Balance: {formatCurrency(msg.toolCallDetails.result.outstandingBalance)}
                                    </div>
                                  )}
                                </>
                              )}
                              {msg.toolCallDetails.name === "addInventory" && (
                                  <>
                                    <div><strong>Product:</strong> {msg.toolCallDetails.args.productName}</div>
                                    <div><strong>Quantity:</strong> {msg.toolCallDetails.args.quantity}</div>
                                    {msg.toolCallDetails.result?.stockQuantity !== undefined && (
                                      <div><strong>Updated Stock:</strong> {msg.toolCallDetails.result.stockQuantity}</div>
                                    )}
                                  </>
                              )}
                              {msg.toolCallDetails.name === "getInventory" && (
                                <div>
                                  <strong>Product:</strong> {msg.toolCallDetails.args.productName || "All Catalog"}
                                  {msg.toolCallDetails.result?.stock !== undefined && (
                                    <div><strong>Stock level:</strong> {msg.toolCallDetails.result.stock} units</div>
                                  )}
                                </div>
                              )}
                              {msg.toolCallDetails.name === "getCustomerBalance" && (
                                <div>
                                  <strong>Customer:</strong> {msg.toolCallDetails.args.customerName}
                                  {msg.toolCallDetails.result?.balance !== undefined && (
                                    <div><strong>Outstanding Debt:</strong> {formatCurrency(msg.toolCallDetails.result.balance)}</div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {voiceState === "THINKING" && (
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

        {/* Bouncing Audio Waveform (Visible during LISTENING or SPEAKING) */}
        {(voiceState === "LISTENING" || voiceState === "SPEAKING") && (
          <div style={styles.waveformContainer}>
            <span style={styles.waveformText}>
              {voiceState === "LISTENING"
                ? `${language === "hi" ? "सुन रहा हूँ" : "Listening..."} (${formatTimer(recordingSeconds)})`
                : (language === "hi" ? "बोल रहा हूँ..." : "Speaking...")
              }
            </span>
            <div style={styles.waveformBars}>
              <div style={styles.waveBar}></div>
              <div style={styles.waveBar}></div>
              <div style={styles.waveBar}></div>
              <div style={styles.waveBar}></div>
              <div style={styles.waveBar}></div>
              <div style={styles.waveBar}></div>
              <div style={styles.waveBar}></div>
              <div style={styles.waveBar}></div>
            </div>
          </div>
        )}

        {/* Real-time transcribed text display */}
        {voiceState === "LISTENING" && liveTranscript && (
          <div style={styles.liveTranscriptCard}>
            <span style={styles.liveTranscriptLabel}>🎙️ {language === "hi" ? "लाइव अनुवाद:" : "Live transcript:"}</span>
            <p style={styles.liveTranscriptText}>"{liveTranscript}"</p>
          </div>
        )}

        {/* Input Controls Bar */}
        <div style={styles.inputContainer}>
          <button
            onClick={triggerMic}
            style={voiceState === "LISTENING" ? styles.micBtnListening : styles.micBtn}
            aria-label="Tap to record voice command"
          >
            {voiceState === "LISTENING" ? "⏹️" : "🎙️"}
          </button>

          {voiceState === "LISTENING" ? (
            <div style={styles.recordingStatePanel}>
              <span style={styles.recordingPrompt}>
                {liveTranscript ? `"${liveTranscript}"` : (language === "hi" ? "बोलिए, मैं सुन रहा हूँ..." : "Speak now...")}
              </span>
              <button onClick={handleCancelRecording} style={styles.recordingCancelBtn}>
                {language === "hi" ? "रद्द करें" : "Cancel"}
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder={inputPlaceholder}
                style={styles.input}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendMessage(inputText);
                }}
                disabled={voiceState === "THINKING"}
              />

              <button
                onClick={() => handleSendMessage(inputText)}
                style={styles.sendBtn}
                disabled={voiceState === "THINKING" || !inputText.trim()}
              >
                {sendLabel}
              </button>
            </>
          )}
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
    position: "relative" as const,
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
    flexWrap: "wrap" as const,
    gap: "1rem",
  },
  rightHeader: {
    display: "flex",
    alignItems: "center",
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
  },
  settingsCard: {
    display: "flex",
    gap: "2.5rem",
    padding: "1rem 1.5rem",
    background: "#ffffff",
    borderRadius: "16px",
    border: "1px solid rgba(0,0,0,0.04)",
    marginBottom: "1.25rem",
    flexWrap: "wrap" as const,
  },
  settingItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  settingLabel: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
  },
  settingSelect: {
    background: "#f9fafb",
    border: "1px solid rgba(0,0,0,0.08)",
    borderRadius: "10px",
    padding: "0.35rem 0.75rem",
    fontSize: "0.85rem",
    color: "var(--text-primary)",
    cursor: "pointer",
  },
  toggleOn: {
    background: "var(--accent-purple)",
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.75rem",
    padding: "0.35rem 0.85rem",
    borderRadius: "10px",
    cursor: "pointer",
    border: "none",
  },
  toggleOff: {
    background: "#f3f4f6",
    color: "var(--text-secondary)",
    fontWeight: 600,
    fontSize: "0.75rem",
    padding: "0.35rem 0.85rem",
    borderRadius: "10px",
    cursor: "pointer",
    border: "1px solid rgba(0,0,0,0.06)",
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
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
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
    position: "relative" as const,
  },
  speakerRow: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.5rem",
    borderTop: "1px solid rgba(0,0,0,0.05)",
    paddingTop: "0.4rem",
  },
  speakerBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    padding: "0 0.25rem",
    ":hover": {
      color: "var(--accent-purple)",
    },
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
  confirmationPanel: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
  },
  confirmText: {
    color: "var(--status-danger)",
    fontSize: "0.85rem",
    margin: 0,
  },
  confirmDetails: {
    fontSize: "0.85rem",
    padding: "0.5rem",
    background: "#f9fafb",
    borderRadius: "6px",
    border: "1px dashed rgba(0,0,0,0.08)",
  },
  confirmBtnRow: {
    display: "flex",
    gap: "0.75rem",
    marginTop: "0.5rem",
  },
  confirmBtn: {
    background: "var(--accent-purple)",
    color: "#fff",
    border: "none",
    padding: "0.45rem 1rem",
    borderRadius: "8px",
    fontSize: "0.8rem",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(124, 58, 237, 0.2)",
  },
  cancelBtn: {
    background: "#ffffff",
    border: "1px solid rgba(0,0,0,0.1)",
    padding: "0.45rem 1rem",
    borderRadius: "8px",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
    cursor: "pointer",
  },
  typingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "0.3rem",
    padding: "0.25rem 0.5rem",
  },
  waveformContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "rgba(124, 58, 237, 0.05)",
    border: "1px solid rgba(124, 58, 237, 0.15)",
    padding: "0.6rem 1.25rem",
    borderRadius: "15px",
    marginBottom: "1rem",
  },
  waveformText: {
    fontSize: "0.85rem",
    color: "var(--accent-purple)",
    fontWeight: 600,
  },
  waveformBars: {
    display: "flex",
    alignItems: "center",
    gap: "3px",
    height: "30px",
  },
  waveBar: {
    width: "3px",
    height: "8px",
    backgroundColor: "var(--accent-purple)",
    borderRadius: "2px",
    animation: "bounceWave 1.2s infinite ease-in-out",
  },
  liveTranscriptCard: {
    background: "#f9fafb",
    border: "1px solid rgba(0,0,0,0.06)",
    padding: "0.75rem 1rem",
    borderRadius: "12px",
    marginBottom: "1rem",
  },
  liveTranscriptLabel: {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "var(--text-muted)",
    display: "block",
    marginBottom: "0.25rem",
  },
  liveTranscriptText: {
    fontSize: "0.9rem",
    fontStyle: "italic",
    color: "var(--text-primary)",
    margin: 0,
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
  micBtnListening: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "var(--status-danger)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.1rem",
    cursor: "pointer",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
    animation: "pulse-wave 1.5s infinite ease-in-out",
  },
  recordingStatePanel: {
    flex: 1,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: "0.5rem",
  },
  recordingPrompt: {
    fontSize: "0.9rem",
    fontStyle: "italic",
    color: "var(--text-secondary)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "80%",
  },
  recordingCancelBtn: {
    background: "transparent",
    border: "none",
    color: "var(--status-danger)",
    fontWeight: 600,
    fontSize: "0.85rem",
    cursor: "pointer",
    padding: "0.25rem 0.5rem",
    ":hover": {
      textDecoration: "underline",
    },
  },
  input: {
    flex: 1,
    padding: "0.75rem 1rem",
    color: "var(--text-primary)",
    fontSize: "0.95rem",
    background: "transparent",
    border: "none",
    outline: "none",
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
    border: "none",
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
  errorAlert: {
    background: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    color: "var(--status-danger)",
    padding: "0.75rem 1rem",
    borderRadius: "12px",
    marginBottom: "1rem",
    fontSize: "0.85rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  errorDismissBtn: {
    background: "transparent",
    border: "none",
    color: "var(--status-danger)",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "bold",
  },
};
