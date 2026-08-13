"use client";

import { useState, useEffect, useRef } from "react";

interface DemoMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
}

interface QuestionOption {
  text: string;
  answer: string;
  widgetType: "SALES" | "CREDIT" | "INVENTORY" | "CONFIRMATION";
  widgetData: any;
}

const QUESTIONS: QuestionOption[] = [
  {
    text: "आज कितनी sale हुई?",
    answer: "आज आपकी कुल बिक्री (Sales) ₹8,450 रही है, जिसमें कुल 14 ऑर्डर्स पूरे हुए।",
    widgetType: "SALES",
    widgetData: { amount: 8450, orders: 14, cashSales: 6450, creditSales: 2000 },
  },
  {
    text: "किसका payment बाकी है?",
    answer: "अमित का ₹800 और रमेश का ₹2,350 उधार बाकी है। कुल बकाया राशि ₹3,150 है।",
    widgetType: "CREDIT",
    widgetData: { total: 3150, list: [{ name: "Ramesh Kumar", bal: 2350 }, { name: "Amit Sharma", bal: 800 }] },
  },
  {
    text: "Maggi कितनी बची है?",
    answer: "स्टॉक में Maggi के अभी 42 पैकेट उपलब्ध हैं। यह रिऑर्डर लेवल (5) से सुरक्षित है।",
    widgetType: "INVENTORY",
    widgetData: { name: "Maggi Noodles", stock: 42, price: 14, status: "SAFE" },
  },
  {
    text: "Mark Ramesh's ₹500 payment as received.",
    answer: "ठीक है! रमेश का ₹500 का भुगतान (Payment) दर्ज कर लिया है। उनका नया बकाया उधार ₹1,850 है।",
    widgetType: "CONFIRMATION",
    widgetData: { customer: "Ramesh Kumar", type: "PAYMENT_RECEIVED", amount: 500, outstanding: 1850 },
  },
];

export default function ConversationDemo() {
  const [messages, setMessages] = useState<DemoMessage[]>([
    { id: "1", role: "ASSISTANT", content: "नमस्ते! मैं BoloBiz हूँ। कोई भी प्रश्न पूछने के लिए नीचे दिए गए बटन पर क्लिक करें।" },
  ]);
  const [activeWidget, setActiveWidget] = useState<"SALES" | "CREDIT" | "INVENTORY" | "CONFIRMATION" | null>(null);
  const [widgetData, setWidgetData] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const handleChipClick = (opt: QuestionOption) => {
    if (isTyping) return;

    // Add user question
    const userMsg: DemoMessage = {
      id: Math.random().toString(),
      role: "USER",
      content: opt.text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate thinking & response
    setTimeout(() => {
      setIsTyping(false);
      const assistantMsg: DemoMessage = {
        id: Math.random().toString(),
        role: "ASSISTANT",
        content: opt.answer,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setActiveWidget(opt.widgetType);
      setWidgetData(opt.widgetData);
    }, 1200);
  };

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <section id="demo" style={styles.section}>
      <div style={styles.container}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.heading}>Interactive Sandbox Simulator</h2>
          <p style={styles.subtext}>
            Test a simulated BoloBiz interface. Click on any question chip below to see how BoloBiz queries data and updates the visual UI.
          </p>
        </div>

        <div style={styles.splitLayout}>
          {/* Chat thread box */}
          <div className="glass-panel" style={styles.chatCard}>
            <div style={styles.chatHeader}>
              <span style={styles.badgeLive}>🟢 Sandbox Environment</span>
              <span>BoloBiz AI Assistant</span>
            </div>

            <div style={styles.chatBody}>
              {messages.map((m) => (
                <div key={m.id} style={m.role === "USER" ? styles.userRow : styles.assistantRow}>
                  <div style={m.role === "USER" ? styles.userBubble : styles.assistantBubble}>
                    {m.content}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={styles.assistantRow}>
                  <div style={styles.assistantBubble}>
                    <div style={styles.typingIndicator}>
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={threadEndRef} />
            </div>

            {/* Chips area */}
            <div style={styles.chipsContainer}>
              {QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChipClick(q)}
                  disabled={isTyping}
                  style={styles.chip}
                >
                  💬 {q.text}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Widget Display representing client UI sync */}
          <div className="glass-panel" style={styles.widgetCard}>
            <div style={styles.widgetHeader}>
              📊 Client Dashboard Sync View
            </div>
            <div style={styles.widgetBody}>
              {!activeWidget ? (
                <div style={styles.widgetEmpty}>
                  <span>💡</span>
                  <p>Click a question chip to view synchronized database reports.</p>
                </div>
              ) : (
                <div style={{ width: "100%" }} className="animate-fade-in">
                  {activeWidget === "SALES" && (
                    <div>
                      <h4 style={styles.widgetTitle}>Today's Sales Dashboard</h4>
                      <div style={styles.metricBig}>₹{widgetData.amount.toLocaleString()}</div>
                      <div style={styles.metricGrid}>
                        <div style={styles.metricCol}>
                          <span style={styles.metricLabel}>Cash Sales</span>
                          <span style={styles.metricVal}>₹{widgetData.cashSales.toLocaleString()}</span>
                        </div>
                        <div style={styles.metricCol}>
                          <span style={styles.metricLabel}>Credit Sales</span>
                          <span style={styles.metricVal}>₹{widgetData.creditSales.toLocaleString()}</span>
                        </div>
                      </div>
                      <div style={styles.widgetFooter}>Computed from {widgetData.orders} active receipts</div>
                    </div>
                  )}

                  {activeWidget === "CREDIT" && (
                    <div>
                      <h4 style={styles.widgetTitle}>Credit Ledger (Baki Udhaar)</h4>
                      <div style={{ ...styles.metricBig, color: "var(--status-danger)", fontSize: "2rem" }}>
                        ₹{widgetData.total.toLocaleString()}
                      </div>
                      <div style={styles.ledgerList}>
                        {widgetData.list.map((item: any, idx: number) => (
                          <div key={idx} style={styles.ledgerRow}>
                            <span>{item.name}</span>
                            <span style={{ color: "var(--status-danger)", fontWeight: 700 }}>₹{item.bal.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeWidget === "INVENTORY" && (
                    <div>
                      <h4 style={styles.widgetTitle}>Inventory Product Status</h4>
                      <div style={styles.productBadge}>
                        <strong>{widgetData.name}</strong>
                      </div>
                      <div style={styles.metricBig}>{widgetData.stock} Units</div>
                      <div style={styles.metricGrid}>
                        <div style={styles.metricCol}>
                          <span style={styles.metricLabel}>Price</span>
                          <span style={styles.metricVal}>₹{widgetData.price}</span>
                        </div>
                        <div style={styles.metricCol}>
                          <span style={styles.metricLabel}>Threshold Status</span>
                          <span style={{ color: "var(--status-success)", fontWeight: 700 }}>SAFE</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeWidget === "CONFIRMATION" && (
                    <div>
                      <h4 style={styles.widgetTitle}>Transaction Receipt Approved</h4>
                      <div style={styles.receiptBox}>
                        <div><strong>Transaction type:</strong> PAYMENT_RECEIVED</div>
                        <div><strong>Customer Name:</strong> {widgetData.customer}</div>
                        <div><strong>Amount:</strong> ₹{widgetData.amount}</div>
                        <hr style={styles.receiptDivider} />
                        <div style={{ color: "var(--accent-cyan)" }}>
                          <strong>Outstanding Udhaar:</strong> ₹{widgetData.outstanding}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const styles = {
  section: {
    padding: "100px 2rem",
    backgroundColor: "var(--bg-primary)",
    position: "relative" as const,
  },
  container: {
    maxWidth: "1280px",
    width: "100%",
    margin: "0 auto",
  },
  sectionHeader: {
    textAlign: "center" as const,
    marginBottom: "4.5rem",
  },
  heading: {
    fontSize: "2.5rem",
    fontWeight: 800,
    color: "#fff",
    marginBottom: "1rem",
  },
  subtext: {
    fontSize: "1.15rem",
    color: "var(--text-secondary)",
    maxWidth: "700px",
    margin: "0 auto",
    lineHeight: 1.6,
  },
  splitLayout: {
    display: "grid",
    gridTemplateColumns: "1.3fr 1fr",
    gap: "2.5rem",
    "@media(max-width: 900px)": {
      gridTemplateColumns: "1fr",
    },
  },
  chatCard: {
    height: "460px",
    display: "flex",
    flexDirection: "column" as const,
    borderRadius: "16px",
    overflow: "hidden",
  },
  chatHeader: {
    background: "rgba(255,255,255,0.02)",
    padding: "0.85rem 1.25rem",
    borderBottom: "1px solid var(--glass-border)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
    fontWeight: 600,
  },
  badgeLive: {
    color: "var(--accent-cyan)",
  },
  chatBody: {
    flex: 1,
    padding: "1.25rem",
    overflowY: "auto" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
  },
  userRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
  userBubble: {
    padding: "0.6rem 1rem",
    background: "linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-purple) 100%)",
    color: "#fff",
    borderRadius: "15px 15px 2px 15px",
    fontSize: "0.85rem",
    maxWidth: "80%",
  },
  assistantRow: {
    display: "flex",
    justifyContent: "flex-start",
  },
  assistantBubble: {
    padding: "0.75rem 1.25rem",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    color: "#fff",
    borderRadius: "15px 15px 15px 2px",
    fontSize: "0.85rem",
    maxWidth: "80%",
    textAlign: "left" as const,
  },
  chipsContainer: {
    display: "flex",
    gap: "0.5rem",
    padding: "1rem",
    background: "rgba(0,0,0,0.2)",
    borderTop: "1px solid var(--glass-border)",
    flexWrap: "wrap" as const,
  },
  chip: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.06)",
    padding: "0.4rem 0.85rem",
    borderRadius: "15px",
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      borderColor: "var(--accent-cyan)",
      background: "rgba(6, 182, 212, 0.06)",
      color: "#fff",
    },
  },
  widgetCard: {
    borderRadius: "16px",
    padding: "2rem",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    height: "460px",
  },
  widgetHeader: {
    fontSize: "0.95rem",
    fontWeight: 700,
    color: "var(--text-secondary)",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
    width: "100%",
    paddingBottom: "0.75rem",
    marginBottom: "1.5rem",
    textAlign: "left" as const,
  },
  widgetBody: {
    flex: 1,
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  widgetEmpty: {
    textAlign: "center" as const,
    color: "var(--text-muted)",
    fontSize: "0.9rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
    maxWidth: "260px",
  },
  widgetTitle: {
    fontSize: "1.1rem",
    color: "#fff",
    fontWeight: 700,
    marginBottom: "1rem",
  },
  metricBig: {
    fontSize: "2.5rem",
    fontWeight: 800,
    color: "var(--accent-cyan)",
    marginBottom: "1.5rem",
  },
  metricGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem",
    width: "100%",
    marginBottom: "1.5rem",
  },
  metricCol: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.25rem",
  },
  metricLabel: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    textTransform: "uppercase" as const,
  },
  metricVal: {
    fontSize: "1.1rem",
    color: "#fff",
    fontWeight: 700,
  },
  widgetFooter: {
    fontSize: "0.8rem",
    color: "var(--text-muted)",
  },
  ledgerList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
    width: "100%",
  },
  ledgerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem",
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.05)",
    borderRadius: "8px",
  },
  productBadge: {
    background: "rgba(255,255,255,0.04)",
    padding: "0.35rem 0.75rem",
    borderRadius: "15px",
    display: "inline-block",
    marginBottom: "0.5rem",
  },
  receiptBox: {
    background: "#080c14",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "8px",
    padding: "1rem",
    fontSize: "0.85rem",
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.4rem",
  },
  receiptDivider: {
    border: "none",
    borderTop: "1px solid rgba(255,255,255,0.08)",
    margin: "0.5rem 0",
  },
  typingIndicator: {
    display: "flex",
    gap: "0.3rem",
    alignItems: "center",
  },
};
