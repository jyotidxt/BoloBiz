"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";

interface DemoScenario {
  userQuery: string;
  assistantReply: string;
  type: string;
  amount?: number;
  customer?: string;
  resultLabel: string;
  resultLabelEn: string;
}

const SCENARIOS: Record<"hinglish" | "english" | "hindi", DemoScenario> = {
  hindi: {
    userQuery: "आज रमेश को ₹500 उधार दिए।",
    assistantReply: "ठीक है! रमेश के खाते में ₹500 का उधार जोड़ दिया गया है!",
    type: "CREDIT",
    amount: 500,
    customer: "Ramesh Kumar",
    resultLabel: "बकाया राशि अपडेट",
    resultLabelEn: "Balance Updated",
  },
  hinglish: {
    userQuery: "Aaj Ramesh ko ₹500 udhaar diye.",
    assistantReply: "Done! Ramesh ke khate mein ₹500 ka udhaar add kar diya hai.",
    type: "CREDIT",
    amount: 500,
    customer: "Ramesh Kumar",
    resultLabel: "बकाया राशि अपडेट (Hinglish)",
    resultLabelEn: "Hinglish Ledger Updated",
  },
  english: {
    userQuery: "I gave Ramesh ₹500 on credit today.",
    assistantReply: "Alright! Recorded ₹500 credit under Ramesh's profile.",
    type: "CREDIT",
    amount: 500,
    customer: "Ramesh Kumar",
    resultLabel: "बकाया राशि अपडेट (English)",
    resultLabelEn: "Ledger Credit Logged",
  },
};

export default function VoiceDemo() {
  const { language, aiLanguage, setAiLanguage, t } = useLanguage();
  const [demoLang, setDemoLang] = useState<"hinglish" | "english" | "hindi">("hindi");
  const [demoState, setDemoState] = useState<"idle" | "listening" | "typing" | "thinking" | "done">("idle");
  const [typedText, setTypedText] = useState("");
  const [showReply, setShowReply] = useState(false);

  const current = SCENARIOS[demoLang];

  const runDemo = () => {
    if (demoState !== "idle") return;

    setDemoState("listening");
    setTypedText("");
    setShowReply(false);

    setTimeout(() => {
      setDemoState("typing");
      let fullText = current.userQuery;
      let i = 0;
      const interval = setInterval(() => {
        setTypedText((prev) => prev + fullText[i]);
        i++;
        if (i >= fullText.length) {
          clearInterval(interval);
          
          setTimeout(() => {
            setDemoState("thinking");

            setTimeout(() => {
              setDemoState("done");
              setShowReply(true);

              if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(current.assistantReply);
                utterance.lang = demoLang === "english" ? "en-IN" : "hi-IN";
                window.speechSynthesis.speak(utterance);
              }

              setTimeout(() => {
                setDemoState("idle");
                setTypedText("");
                setShowReply(false);
              }, 5000);

            }, 800);
          }, 600);
        }
      }, 50);
    }, 1500);
  };

  return (
    <div className="glass-panel" style={styles.card}>
      {/* Header bar */}
      <div style={styles.header}>
        <div style={styles.dots}>
          <span style={{ ...styles.dot, backgroundColor: "#ff5f56" }}></span>
          <span style={{ ...styles.dot, backgroundColor: "#ffbd2e" }}></span>
          <span style={{ ...styles.dot, backgroundColor: "#27c93f" }}></span>
        </div>
        
        {/* AI Language Configuration dropdown inside the demo card */}
        <div style={styles.aiSelectorBlock}>
          <span style={styles.aiLabel}>AI Language:</span>
          <select
            value={aiLanguage}
            onChange={(e) => setAiLanguage(e.target.value as any)}
            style={styles.aiSelect}
            aria-label="Select AI Recognition Language"
          >
            <option value="auto">Auto Detect ▾</option>
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
            <option value="hinglish">Hinglish</option>
          </select>
        </div>

        <div style={{ width: "10px" }}></div>
      </div>

      <div style={{ padding: "1.25rem 1.5rem 1.5rem 1.5rem", display: "flex", flexDirection: "column" as const, flex: 1, justifyContent: "space-between" }}>
        
        {/* Title */}
        <div style={styles.mainTitle}>
          {language === "hi" 
            ? "बोलिए, BoloBiz समझेगा और आपके लिए काम करेगा" 
            : "Speak, BoloBiz understands & acts automatically"
          }
        </div>

        {/* Center Mic wave visualizer */}
        <div style={styles.micWorkspace}>
          <div style={styles.waveWrapper}>
            {/* Pulsing waves */}
            <div style={{ ...styles.waveOuter, ...(demoState === "listening" ? styles.waveOuterActive : {}) }}></div>
            <div style={{ ...styles.waveInner, ...(demoState === "listening" ? styles.waveInnerActive : {}) }}></div>
            
            <button
              onClick={runDemo}
              style={{ ...styles.micBtn, ...(demoState === "listening" ? styles.micBtnActive : {}) }}
              disabled={demoState !== "idle"}
              aria-label="Tap to speak"
            >
              🎙️
            </button>
          </div>
          <button onClick={runDemo} disabled={demoState !== "idle"} style={styles.speakPill}>
            {demoState === "idle" && (language === "hi" ? "आप बोलें..." : "Tap to speak...")}
            {demoState === "listening" && (language === "hi" ? "सुन रहा हूँ..." : "Listening...")}
            {demoState === "typing" && (language === "hi" ? "प्रोसेसिंग..." : "Processing...")}
            {demoState === "thinking" && (language === "hi" ? "प्रोसेसिंग..." : "Analyzing...")}
            {demoState === "done" && (language === "hi" ? "डन!" : "Done!")}
          </button>
        </div>

        {/* Chat Log View */}
        <div style={styles.chatLogs}>
          {/* User speech bubble */}
          {(demoState === "typing" || demoState === "thinking" || demoState === "done") && (
            <div style={styles.chatRow} className="animate-fade-in">
              <div style={styles.avatar}>👨‍💼</div>
              <div style={styles.userBubble}>
                <span>{typedText || "..."}</span>
                <span style={styles.waveIcon}>📊</span>
              </div>
            </div>
          )}

          {/* AI Reply bubble */}
          {showReply && (
            <div style={styles.chatRow} className="animate-fade-in">
              <div style={styles.aiAvatar}>🤖</div>
              <div style={styles.aiBubble}>
                <span>{current.assistantReply}</span>
                <span style={styles.checkIcon}>✅</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Language Toggles for Conversation Dialogues */}
        <div style={styles.footerToggles}>
          <button
            onClick={() => { if (demoState === "idle") setDemoLang("hindi"); }}
            style={demoLang === "hindi" ? styles.activeLangBtn : styles.langBtn}
            disabled={demoState !== "idle"}
          >
            हिंदी
          </button>
          <button
            onClick={() => { if (demoState === "idle") setDemoLang("english"); }}
            style={demoLang === "english" ? styles.activeLangBtn : styles.langBtn}
            disabled={demoState !== "idle"}
          >
            English
          </button>
          <button
            onClick={() => { if (demoState === "idle") setDemoLang("hinglish"); }}
            style={demoLang === "hinglish" ? styles.activeLangBtn : styles.langBtn}
            disabled={demoState !== "idle"}
          >
            Hinglish
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    width: "100%",
    maxWidth: "460px",
    borderRadius: "24px",
    display: "flex",
    flexDirection: "column" as const,
    overflow: "hidden",
    background: "#ffffff",
    boxShadow: "0 20px 50px rgba(0, 0, 0, 0.08)",
    height: "540px",
    border: "1px solid rgba(0,0,0,0.06)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.85rem 1.25rem",
    background: "#f9fafb",
    borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
  },
  dots: {
    display: "flex",
    gap: "0.4rem",
  },
  dot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },
  aiSelectorBlock: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    background: "rgba(0, 0, 0, 0.03)",
    padding: "0.25rem 0.65rem",
    borderRadius: "12px",
    border: "1px solid rgba(0,0,0,0.06)",
  },
  aiLabel: {
    fontSize: "0.75rem",
    color: "var(--text-secondary)",
    fontWeight: 700,
  },
  aiSelect: {
    fontSize: "0.75rem",
    color: "#7c3aed",
    fontWeight: 700,
    cursor: "pointer",
    background: "transparent",
    border: "none",
    outline: "none",
  },
  mainTitle: {
    fontSize: "1.25rem",
    fontWeight: 700,
    color: "var(--text-primary)",
    textAlign: "center" as const,
    lineHeight: 1.4,
  },
  micWorkspace: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    margin: "0.5rem 0",
  },
  waveWrapper: {
    position: "relative" as const,
    width: "90px",
    height: "90px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  waveOuter: {
    position: "absolute" as const,
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    background: "rgba(219, 39, 119, 0.04)",
    transform: "scale(0.8)",
    opacity: 0,
    transition: "all 0.5s ease",
  },
  waveOuterActive: {
    animation: "pulse-wave 2s infinite ease-in-out",
    opacity: 1,
  },
  waveInner: {
    position: "absolute" as const,
    width: "80%",
    height: "80%",
    borderRadius: "50%",
    background: "rgba(219, 39, 119, 0.08)",
    transform: "scale(0.8)",
    opacity: 0,
    transition: "all 0.5s ease",
  },
  waveInnerActive: {
    animation: "pulse-wave 1.5s infinite ease-in-out",
    opacity: 1,
  },
  micBtn: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "var(--accent-gradient)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.65rem",
    cursor: "pointer",
    boxShadow: "0 4px 15px rgba(219, 39, 119, 0.35)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    zIndex: 2,
    border: "none",
    color: "#fff",
  },
  micBtnActive: {
    transform: "scale(0.95)",
  },
  speakPill: {
    marginTop: "0.85rem",
    background: "#7c3aed",
    color: "#fff",
    fontSize: "0.85rem",
    fontWeight: 700,
    padding: "0.4rem 1.25rem",
    borderRadius: "20px",
    boxShadow: "0 4px 10px rgba(124, 58, 237, 0.2)",
    cursor: "pointer",
  },
  chatLogs: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
    overflowY: "auto" as const,
    padding: "0.5rem 0",
    maxHeight: "150px",
    minHeight: "100px",
  },
  chatRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
  },
  avatar: {
    fontSize: "1.5rem",
  },
  aiAvatar: {
    fontSize: "1.5rem",
  },
  userBubble: {
    flex: 1,
    background: "#f3f4f6",
    border: "1px solid rgba(0,0,0,0.04)",
    borderRadius: "15px",
    padding: "0.65rem 1rem",
    fontSize: "0.9rem",
    color: "#1f2937",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: 500,
    textAlign: "left" as const,
  },
  aiBubble: {
    flex: 1,
    background: "#ffffff",
    border: "1px solid rgba(0,0,0,0.06)",
    borderRadius: "15px",
    padding: "0.65rem 1rem",
    fontSize: "0.9rem",
    color: "#1f2937",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: 600,
    textAlign: "left" as const,
    boxShadow: "0 4px 12px rgba(0,0,0,0.02)",
  },
  waveIcon: {
    color: "var(--accent-pink)",
  },
  checkIcon: {
    color: "var(--status-success)",
  },
  footerToggles: {
    display: "flex",
    justifyContent: "center",
    gap: "0.5rem",
    marginTop: "0.5rem",
  },
  langBtn: {
    padding: "0.35rem 1.25rem",
    borderRadius: "15px",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: "var(--text-secondary)",
    border: "1px solid rgba(0,0,0,0.06)",
    cursor: "pointer",
    background: "#f9fafb",
  },
  activeLangBtn: {
    padding: "0.35rem 1.25rem",
    borderRadius: "15px",
    fontSize: "0.8rem",
    fontWeight: 700,
    color: "var(--accent-pink)",
    border: "1px solid rgba(219, 39, 119, 0.15)",
    background: "rgba(219, 39, 119, 0.08)",
    cursor: "pointer",
  },
};
