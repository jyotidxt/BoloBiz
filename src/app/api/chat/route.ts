import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { GeminiAIService } from "@/lib/ai/ai-service";
import * as businessService from "@/lib/services/business";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

// GET: Load persistent chat history (30-50 messages) scoped strictly to authenticated business
export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId } = session;
    const { searchParams } = new URL(request.url);
    const requestedSessionId = searchParams.get("sessionId");

    let chatSession;

    if (requestedSessionId) {
      chatSession = await prisma.conversationSession.findFirst({
        where: { id: requestedSessionId, businessId },
        include: {
          messages: {
            take: 50,
            orderBy: { createdAt: "asc" },
          },
        },
      });
    } else {
      // Retrieve the most recently active conversation session for this tenant
      chatSession = await prisma.conversationSession.findFirst({
        where: { businessId },
        orderBy: { updatedAt: "desc" },
        include: {
          messages: {
            take: 50,
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }

    if (!chatSession) {
      return NextResponse.json({ sessionId: null, messages: [] });
    }

    const formattedMessages = chatSession.messages.map((msg) => {
      let parsedTool = null;
      if (msg.toolCallDetails) {
        try {
          parsedTool = JSON.parse(msg.toolCallDetails);
        } catch {
          parsedTool = null;
        }
      }
      return {
        id: msg.id,
        role: msg.role,
        content: msg.content,
        toolCallDetails: parsedTool,
        createdAt: msg.createdAt,
      };
    });

    return NextResponse.json({
      sessionId: chatSession.id,
      messages: formattedMessages,
    });
  } catch (error: any) {
    console.error("GET /api/chat error:", error);
    return NextResponse.json(
      { error: "Failed to retrieve conversation history" },
      { status: 500 }
    );
  }
}

// POST: Process message and persist conversation to database
export async function POST(request: Request) {
  try {
    // 1. Authenticate user session
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId, userId } = session;

    // 2. Parse request payload
    const { message, sessionId: reqSessionId, confirmed } = await request.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 3. If Gemini API key is configured, execute production adapter pipeline
    if (GEMINI_API_KEY) {
      const aiService = new GeminiAIService(GEMINI_API_KEY, businessId, userId);
      const response = await aiService.sendMessage(message, reqSessionId, !!confirmed);
      return NextResponse.json(response);
    }

    // 4. Offline Simulator Fallback (if API key is missing)
    console.warn("GEMINI_API_KEY not configured. Running offline simulator.");
    
    // Retrieve or create ConversationSession
    let chatSessionDb;
    if (reqSessionId) {
      chatSessionDb = await prisma.conversationSession.findFirst({
        where: { id: reqSessionId, businessId },
      });
    }

    if (!chatSessionDb) {
      chatSessionDb = await prisma.conversationSession.create({
        data: { userId, businessId },
      });
    }

    const sessionId = chatSessionDb.id;

    // Execute mock parser matching Hindi/Hinglish/English intents (with mock confirmation state logic)
    const mockReply = await handleOfflineMockResponse(message, businessId, !!confirmed);

    // Save User message
    await prisma.chatMessage.create({
      data: { sessionId, role: "USER", content: message },
    });

    // Save Assistant message
    await prisma.chatMessage.create({
      data: {
        sessionId,
        role: "ASSISTANT",
        content: mockReply.content,
        toolCallDetails: mockReply.toolCall ? JSON.stringify(mockReply.toolCall) : null,
      },
    });

    // Update conversation session timestamp
    await prisma.conversationSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      sessionId,
      content: mockReply.content,
      toolExecuted: mockReply.toolCall,
    });
  } catch (error: any) {
    console.error("Chat route handler error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

// DELETE: Clear conversation history strictly scoped to authenticated business
export async function DELETE(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId } = session;
    const { searchParams } = new URL(request.url);
    const targetSessionId = searchParams.get("sessionId");

    if (targetSessionId) {
      // Delete specific session (scoped by businessId)
      await prisma.conversationSession.deleteMany({
        where: { id: targetSessionId, businessId },
      });
    } else {
      // Clear all sessions belonging to this business
      await prisma.conversationSession.deleteMany({
        where: { businessId },
      });
    }

    return NextResponse.json({ success: true, message: "Chat history cleared successfully" });
  } catch (error: any) {
    console.error("DELETE /api/chat error:", error);
    return NextResponse.json(
      { error: "Failed to clear chat history" },
      { status: 500 }
    );
  }
}

// Helper to simulate NLU parsing and confirmation states offline
async function handleOfflineMockResponse(message: string, businessId: string, confirmed: boolean) {
  const cleanMsg = message.toLowerCase().trim();

  // 1. Transaction matches (Credit / Payments / Sales / Expenses)
  if (cleanMsg.includes("udhaar") || cleanMsg.includes("credit") || cleanMsg.includes("de diye")) {
    const numbers = cleanMsg.match(/\d+/g);
    const amount = numbers ? parseInt(numbers[0]) : 500;
    
    let name = "Ramesh";
    const nameMatch = message.match(/(?:aaj|ko|liye|ne)\s+([A-Za-z]+)/i);
    if (nameMatch && nameMatch[1]) name = nameMatch[1];

    if (!confirmed) {
      return {
        content: `ठीक है! ${name} के लिए ₹${amount} का उधार दर्ज करने से पहले कृपया नीचे पुष्टि करें।`,
        toolCall: {
          name: "createCredit",
          args: { amount, customerName: name },
          result: {
            status: "CONFIRMATION_REQUIRED",
            message: "Action requires manual confirmation before database execution.",
            actionDetails: { tool: "createCredit", args: { amount, customerName: name } }
          }
        }
      };
    }

    const dbResult = await businessService.recordTransactionService(
      businessId,
      "CREDIT",
      amount,
      name
    );

    return {
      content: `ठीक है! मैंने ${name} के खाते में ₹${amount} का उधार (Credit) दर्ज कर लिया है। नया बकाया: ₹${dbResult.outstandingBalance || 0}।`,
      toolCall: { name: "createCredit", args: { amount, customerName: name }, result: dbResult },
    };
  }

  // Payment logs
  if (cleanMsg.includes("payment") || cleanMsg.includes("paise diye") || cleanMsg.includes("rupaye diye")) {
    const numbers = cleanMsg.match(/\d+/g);
    const amount = numbers ? parseInt(numbers[0]) : 200;
    
    let name = "Ramesh";
    const nameMatch = message.match(/(?:aaj|ko|liye|ne)\s+([A-Za-z]+)/i);
    if (nameMatch && nameMatch[1]) name = nameMatch[1];

    if (!confirmed) {
      return {
        content: `ठीक है! ${name} से ₹${amount} का भुगतान (Payment) दर्ज करने से पहले कृपया नीचे पुष्टि करें।`,
        toolCall: {
          name: "recordPayment",
          args: { amount, customerName: name },
          result: {
            status: "CONFIRMATION_REQUIRED",
            message: "Action requires manual confirmation before database execution.",
            actionDetails: { tool: "recordPayment", args: { amount, customerName: name } }
          }
        }
      };
    }

    const dbResult = await businessService.recordTransactionService(
      businessId,
      "PAYMENT_RECEIVED",
      amount,
      name
    );

    return {
      content: `Done! ${name} से ₹${amount} का भुगतान (Payment) दर्ज कर लिया गया है। नया बकाया: ₹${dbResult.outstandingBalance || 0}।`,
      toolCall: { name: "recordPayment", args: { amount, customerName: name }, result: dbResult },
    };
  }

  // Sales aggregates "sales kitni hui" or "aaj ki sale"
  if (cleanMsg.includes("sale") || cleanMsg.includes("biki") || cleanMsg.includes("bikli")) {
    const dbResult = await businessService.getDailySalesService(businessId);
    return {
      content: `आज आपकी कुल बिक्री (Sales) ₹${dbResult.totalSales} रही (कुल ${dbResult.salesCount} ऑर्डर्स)।`,
      toolCall: { name: "getDailySales", args: {}, result: dbResult },
    };
  }

  // Outstanding credit list
  if (cleanMsg.includes("outstanding") || cleanMsg.includes("udhaar baki") || cleanMsg.includes("kiska payment")) {
    const dbResult = await businessService.getOutstandingCustomersService(businessId);
    const debtStr = dbResult.debtors.map((d) => `${d.name}: ₹${d.outstandingBalance}`).join(", ");
    return {
      content: dbResult.debtors.length > 0 
        ? `बाकी उधार इस प्रकार है: ${debtStr} (कुल बकाया: ₹${dbResult.debtors.reduce((sum, d) => sum + d.outstandingBalance, 0)})`
        : `बहुत बढ़िया! अभी किसी भी ग्राहक का उधार बाकी नहीं है।`,
      toolCall: { name: "getOutstandingCustomers", args: {}, result: dbResult },
    };
  }

  // Stock status "Maggi kitni bachi hai"
  if (cleanMsg.includes("stock") || cleanMsg.includes("bachi hai") || cleanMsg.includes("bacha hai")) {
    let prodName = "Maggi";
    if (cleanMsg.includes("maggi")) prodName = "Maggi";
    const dbResult = await businessService.getInventoryService(businessId, prodName);
    return {
      content: `स्टॉक में ${dbResult.productName || prodName} के अभी ${dbResult.stock || 0} यूनिट उपलब्ध हैं।`,
      toolCall: { name: "getInventory", args: { productName: prodName }, result: dbResult },
    };
  }

  // Fallback helper
  return {
    content: "नमस्ते! मैं BoloBiz AI असिस्टेंट हूँ। मैं आपके Kirana बिज़नेस का हिसाब रखने में मदद कर सकता हूँ। आप बोलकर या लिखकर लेन-देन, स्टॉक, या रिपोर्ट्स अपडेट कर सकते हैं।",
    toolCall: null,
  };
}
