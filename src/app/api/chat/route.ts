import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAuthSession } from "@/lib/auth";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const session = await getAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { businessId, userId } = session;

    // 2. Parse request parameters
    const { message, sessionId: reqSessionId } = await request.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // 3. Retrieve or create ConversationSession
    let chatSessionDb;
    if (reqSessionId) {
      chatSessionDb = await prisma.conversationSession.findFirst({
        where: { id: reqSessionId, businessId },
      });
    }

    if (!chatSessionDb) {
      chatSessionDb = await prisma.conversationSession.create({
        data: {
          userId,
          businessId,
        },
      });
    }

    const sessionId = chatSessionDb.id;

    // 4. Fetch last 15 messages for conversational history
    const pastMessages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      take: 15,
    });

    // 5. Gather business context (existing customers & products) to prevent LLM naming hallucinations
    const customers = await prisma.customer.findMany({
      where: { businessId },
      select: { name: true, phone: true, outstandingBalance: true },
    });

    const products = await prisma.product.findMany({
      where: { businessId },
      select: { name: true, price: true, stockQuantity: true },
    });

    const customersContext = customers
      .map((c) => `- Name: "${c.name}", Phone: "${c.phone || "N/A"}", Outstanding Credit: ₹${c.outstandingBalance}`)
      .join("\n");

    const productsContext = products
      .map((p) => `- Name: "${p.name}", Price: ₹${p.price}, Current Stock: ${p.stockQuantity}`)
      .join("\n");

    // 6. Build the System Instruction Prompt
    const currentDate = new Date().toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const currentTime = new Date().toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
    });

    const systemInstruction = `
You are BoloBiz, a voice-first AI business operating assistant for micro, small, and medium businesses (MSMEs) in India.
Your mission is: "Run Your Business. बस बोलकर."

Rules:
1. Speak in the user's language and style. If the user speaks in Hinglish (e.g. "Ramesh ko 500 udhaar diya"), respond in Hinglish (e.g. "Ramesh ke khate mein ₹500 udhaar add kar diya hai."). If Hindi, respond in Hindi. If English, respond in English. Always match their tone, language, and vocabulary.
2. Be extremely concise. Keep responses under 2-3 sentences.
3. You are an interface to a database. Never make up business metrics or transactions. If you need details, call "getBusinessInsights" tool to query them.
4. When performing transactions or adding items, rely on the tools. If a customer name in the query doesn't match perfectly but is similar to an existing customer, verify or create the customer as appropriate.
5. If the user asks about an outstanding balance, current inventory, or today's sales, you MUST use the appropriate tool to fetch actual values before replying.

CURRENT CONTEXT:
- Today's Date: ${currentDate}
- Current Time: ${currentTime}
- Registered Customers in database:
${customersContext || "(No customers registered yet. You can add them dynamically.)"}

- Registered Products in database:
${productsContext || "(No products in inventory yet. You can add them dynamically.)"}
`;

    // 7. Initialize Gemini API Client
    if (!GEMINI_API_KEY) {
      // Mock flow if no API Key is provided
      console.warn("GEMINI_API_KEY is not set. Running in Mock AI response mode.");
      const mockReply = await handleMockAIResponse(message, businessId);
      
      // Save User Message
      await prisma.chatMessage.create({
        data: { sessionId, role: "USER", content: message },
      });
      
      // Save Assistant Message
      const savedMsg = await prisma.chatMessage.create({
        data: {
          sessionId,
          role: "ASSISTANT",
          content: mockReply.content,
          toolCallDetails: mockReply.toolCall ? JSON.stringify(mockReply.toolCall) : null,
        },
      });

      return NextResponse.json({
        sessionId,
        content: mockReply.content,
        toolExecuted: mockReply.toolCall,
      });
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash", // Using highly responsive model
      systemInstruction: systemInstruction,
      tools: [
        {
          functionDeclarations: [
            {
              name: "recordTransaction",
              description: "Record a transaction (SALE, PURCHASE, CREDIT (loan given), PAYMENT_RECEIVED (repayment received), EXPENSE, REFUND)",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  type: {
                    type: SchemaType.STRING,
                    enum: ["SALE", "PURCHASE", "CREDIT", "PAYMENT_RECEIVED", "EXPENSE", "REFUND"],
                    description: "Type of transaction",
                  },
                  amount: {
                    type: SchemaType.NUMBER,
                    description: "Total transaction amount in INR",
                  },
                  customerName: {
                    type: SchemaType.STRING,
                    description: "Name of the customer. Required for CREDIT and PAYMENT_RECEIVED transactions.",
                  },
                  description: {
                    type: SchemaType.STRING,
                    description: "Brief note describing the transaction",
                  },
                },
                required: ["type", "amount"],
              },
            },
            {
              name: "addCustomer",
              description: "Create a new customer profile in the business database.",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  name: {
                    type: SchemaType.STRING,
                    description: "Full name of the customer",
                  },
                  phone: {
                    type: SchemaType.STRING,
                    description: "Phone number of the customer (optional)",
                  },
                },
                required: ["name"],
              },
            },
            {
              name: "addProduct",
              description: "Add a new product with price and stock to the inventory.",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  name: {
                    type: SchemaType.STRING,
                    description: "Name of the product",
                  },
                  price: {
                    type: SchemaType.NUMBER,
                    description: "Selling price of the product",
                  },
                  costPrice: {
                    type: SchemaType.NUMBER,
                    description: "Wholesale cost price of the product (optional)",
                  },
                  stockQuantity: {
                    type: SchemaType.NUMBER,
                    description: "Initial inventory quantity (optional)",
                  },
                  lowStockThreshold: {
                    type: SchemaType.NUMBER,
                    description: "Low stock alert threshold, defaults to 5 (optional)",
                  },
                },
                required: ["name", "price"],
              },
            },
            {
              name: "updateStock",
              description: "Add or reduce stock for an existing product in the inventory.",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  productName: {
                    type: SchemaType.STRING,
                    description: "Exact name of the product",
                  },
                  quantityAdjustment: {
                    type: SchemaType.NUMBER,
                    description: "Positive number to add stock, negative number to reduce stock",
                  },
                },
                required: ["productName", "quantityAdjustment"],
              },
            },
            {
              name: "getBusinessInsights",
              description: "Query stored business data to get live summaries or answers to business questions.",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  queryType: {
                    type: SchemaType.STRING,
                    enum: ["SALES_SUMMARY", "CREDIT_SUMMARY", "STOCK_SUMMARY", "TOP_PRODUCTS"],
                    description: "Type of query to execute on the business database",
                  },
                },
                required: ["queryType"],
              },
            },
          ],
        },
      ],
    });

    // 8. Transform history into format Gemini expects
    const history = pastMessages.map((msg) => ({
      role: msg.role === "USER" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });

    // 9. Send the user message to Gemini
    let result = await chat.sendMessage(message);
    let finalResponseText = "";
    let executedToolDetails = null;

    const functionCalls = result.response.functionCalls();

    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      const toolName = call.name;
      const toolArgs = call.args as any;

      console.log(`Executing tool ${toolName} with args:`, toolArgs);

      // Execute database modifications
      const dbResult = await executeTool(toolName, toolArgs, businessId);
      executedToolDetails = { name: toolName, args: toolArgs, result: dbResult };

      // Feed tool output back to Gemini
      const toolFollowUp = await chat.sendMessage([
        {
          functionResponse: {
            name: toolName,
            response: dbResult,
          },
        },
      ]);

      finalResponseText = toolFollowUp.response.text();
    } else {
      finalResponseText = result.response.text();
    }

    // 10. Save the exchange to the database
    await prisma.chatMessage.create({
      data: { sessionId, role: "USER", content: message },
    });

    await prisma.chatMessage.create({
      data: {
        sessionId,
        role: "ASSISTANT",
        content: finalResponseText,
        toolCallDetails: executedToolDetails ? JSON.stringify(executedToolDetails) : null,
      },
    });

    return NextResponse.json({
      sessionId,
      content: finalResponseText,
      toolExecuted: executedToolDetails,
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request. Please try again." },
      { status: 500 }
    );
  }
}

// Tool Execution Handler
async function executeTool(name: string, args: any, businessId: string) {
  try {
    switch (name) {
      case "recordTransaction": {
        const { type, amount, customerName, description } = args;

        let customerId: string | undefined;
        let finalCustomerName = customerName;

        if (customerName) {
          // Look up customer (case insensitive match)
          let customer = await prisma.customer.findFirst({
            where: {
              businessId,
              name: {
                equals: customerName,
              },
            },
          });

          // Proactive UX: Create customer if they do not exist
          if (!customer) {
            customer = await prisma.customer.create({
              data: {
                name: customerName,
                businessId,
                outstandingBalance: 0.0,
              },
            });
            console.log(`Automatically created missing customer: ${customerName}`);
          }

          customerId = customer.id;
          finalCustomerName = customer.name;
        }

        // Insert transaction record
        const transaction = await prisma.transaction.create({
          data: {
            type,
            amount: parseFloat(amount),
            description: description || null,
            customerId: customerId || null,
            businessId,
          },
        });

        // Update outstanding customer balance if type is CREDIT or PAYMENT_RECEIVED
        if (customerId && (type === "CREDIT" || type === "PAYMENT_RECEIVED")) {
          const delta = type === "CREDIT" ? parseFloat(amount) : -parseFloat(amount);
          const updatedCustomer = await prisma.customer.update({
            where: { id: customerId },
            data: {
              outstandingBalance: {
                increment: delta,
              },
            },
          });

          return {
            status: "SUCCESS",
            message: `Transaction recorded. Updated outstanding balance for ${updatedCustomer.name} is ₹${updatedCustomer.outstandingBalance}.`,
            transactionId: transaction.id,
            outstandingBalance: updatedCustomer.outstandingBalance,
            customerName: updatedCustomer.name,
          };
        }

        return {
          status: "SUCCESS",
          message: `Transaction of type ${type} for ₹${amount} recorded successfully.`,
          transactionId: transaction.id,
          customerName: finalCustomerName || null,
        };
      }

      case "addCustomer": {
        const { name, phone } = args;
        const customer = await prisma.customer.create({
          data: {
            name,
            phone: phone || null,
            businessId,
            outstandingBalance: 0.0,
          },
        });
        return {
          status: "SUCCESS",
          message: `Customer ${customer.name} created successfully.`,
          customerId: customer.id,
        };
      }

      case "addProduct": {
        const { name, price, costPrice, stockQuantity, lowStockThreshold } = args;
        const product = await prisma.product.create({
          data: {
            name,
            price: parseFloat(price),
            costPrice: costPrice ? parseFloat(costPrice) : 0.0,
            stockQuantity: stockQuantity ? parseFloat(stockQuantity) : 0.0,
            lowStockThreshold: lowStockThreshold ? parseFloat(lowStockThreshold) : 5.0,
            businessId,
          },
        });
        return {
          status: "SUCCESS",
          message: `Product ${product.name} added with price ₹${product.price} and stock ${product.stockQuantity}.`,
          productId: product.id,
        };
      }

      case "updateStock": {
        const { productName, quantityAdjustment } = args;
        const product = await prisma.product.findFirst({
          where: {
            businessId,
            name: {
              equals: productName,
            },
          },
        });

        if (!product) {
          return {
            status: "ERROR",
            message: `Product "${productName}" not found in inventory.`,
          };
        }

        const updated = await prisma.product.update({
          where: { id: product.id },
          data: {
            stockQuantity: {
              increment: parseFloat(quantityAdjustment),
            },
          },
        });

        return {
          status: "SUCCESS",
          message: `Stock updated for ${updated.name}. New stock: ${updated.stockQuantity}.`,
          productName: updated.name,
          newStock: updated.stockQuantity,
        };
      }

      case "getBusinessInsights": {
        const { queryType } = args;
        if (queryType === "SALES_SUMMARY") {
          const sales = await prisma.transaction.aggregate({
            where: { businessId, type: "SALE" },
            _sum: { amount: true },
            _count: { id: true },
          });
          return {
            totalSalesAmount: sales._sum.amount || 0.0,
            totalSalesCount: sales._count.id || 0,
          };
        }

        if (queryType === "CREDIT_SUMMARY") {
          const customers = await prisma.customer.findMany({
            where: { businessId, outstandingBalance: { gt: 0 } },
            orderBy: { outstandingBalance: "desc" },
            select: { name: true, outstandingBalance: true },
          });
          const totalCredit = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);
          return {
            totalCreditOutstanding: totalCredit,
            debtorsList: customers,
          };
        }

        if (queryType === "STOCK_SUMMARY") {
          const products = await prisma.product.findMany({
            where: { businessId },
            select: { name: true, stockQuantity: true, lowStockThreshold: true },
          });
          const lowStockList = products.filter((p) => p.stockQuantity <= p.lowStockThreshold);
          return {
            totalProductsCount: products.length,
            lowStockProducts: lowStockList,
          };
        }

        if (queryType === "TOP_PRODUCTS") {
          // Standard mock/summarized query logic on sqlite: select transactions and map,
          // since we have transaction items, let's fetch sum of quantities
          const topSalesData = await prisma.transactionItem.groupBy({
            by: ["productId"],
            _sum: {
              quantity: true,
            },
          });

          const topSales = topSalesData
            .sort((a, b) => (b._sum.quantity || 0) - (a._sum.quantity || 0))
            .slice(0, 5);

          const list = [];
          for (const item of topSales) {
            const prod = await prisma.product.findUnique({
              where: { id: item.productId, businessId },
              select: { name: true },
            });
            if (prod) {
              list.push({
                productName: prod.name,
                unitsSold: item._sum.quantity || 0,
              });
            }
          }
          return { topSellingProducts: list };
        }

        return { status: "ERROR", message: "Unknown insights query" };
      }

      default:
        return { status: "ERROR", message: `Tool ${name} is not implemented.` };
    }
  } catch (err: any) {
    console.error(`Error executing tool ${name}:`, err);
    return { status: "ERROR", message: err.message || "Failed execution" };
  }
}

// Handler for offline mock development when API key is missing
async function handleMockAIResponse(message: string, businessId: string) {
  const cleanMsg = message.toLowerCase().trim();

  // Try to parse transaction matches like "Ramesh ko 500 udhaar diye" or "Ramesh credit 500"
  if (cleanMsg.includes("udhaar") || cleanMsg.includes("credit") || cleanMsg.includes("de diye")) {
    const numbers = cleanMsg.match(/\d+/g);
    const amount = numbers ? parseInt(numbers[0]) : 500;
    
    // Extract a name (capitalized word or word near transaction keywords)
    let name = "Ramesh";
    const nameMatch = message.match(/(?:aaj|ko|liye|ne)\s+([A-Za-z]+)/i);
    if (nameMatch && nameMatch[1]) name = nameMatch[1];
    else {
      // Look for any word of length > 2 that isn't a keyword
      const words = message.split(/\s+/);
      for (const w of words) {
        if (w.length > 3 && !["udhaar", "credit", "aaj", "rupaye", "rupe", "diye", "aaj", "aajki"].includes(w.toLowerCase())) {
          name = w;
          break;
        }
      }
    }

    const res = await executeTool("recordTransaction", { type: "CREDIT", amount, customerName: name }, businessId);
    return {
      content: `ठीक है! मैंने ${name} के खाते में ₹${amount} का उधार (Credit) दर्ज कर लिया है।`,
      toolCall: { name: "recordTransaction", args: { type: "CREDIT", amount, customerName: name }, result: res },
    };
  }

  // Sales match "sales kitni hui" or "aaj ki sale"
  if (cleanMsg.includes("sale") || cleanMsg.includes("biki") || cleanMsg.includes("bikli")) {
    const res = await executeTool("getBusinessInsights", { queryType: "SALES_SUMMARY" }, businessId) as any;
    return {
      content: `आज आपकी कुल बिक्री (Sales) ₹${res.totalSalesAmount} रही (कुल ${res.totalSalesCount} ऑर्डर्स)।`,
      toolCall: { name: "getBusinessInsights", args: { queryType: "SALES_SUMMARY" }, result: res },
    };
  }

  // Outstanding check "udhaar baki"
  if (cleanMsg.includes("udhaar baki") || cleanMsg.includes("kis-kis ka") || cleanMsg.includes("kiska kiska")) {
    const res = await executeTool("getBusinessInsights", { queryType: "CREDIT_SUMMARY" }, businessId) as any;
    const debtStr = res.debtorsList.map((d: any) => `${d.name}: ₹${d.outstandingBalance}`).join(", ");
    return {
      content: res.debtorsList.length > 0 
        ? `बाकी उधार इस प्रकार है: ${debtStr} (कुल: ₹${res.totalCreditOutstanding})`
        : `बहुत बढ़िया! अभी किसी भी ग्राहक का उधार बाकी नहीं है।`,
      toolCall: { name: "getBusinessInsights", args: { queryType: "CREDIT_SUMMARY" }, result: res },
    };
  }

  // Product addition "Maggi add karo"
  if (cleanMsg.includes("add product") || cleanMsg.includes("product add") || cleanMsg.includes("nayi item")) {
    const res = await executeTool("addProduct", { name: "Maggi", price: 14, stockQuantity: 20 }, businessId);
    return {
      content: `मैंने ₹14 की कीमत के साथ 20 यूनिट "Maggi" स्टॉक में जोड़ दी है।`,
      toolCall: { name: "addProduct", args: { name: "Maggi", price: 14, stockQuantity: 20 }, result: res },
    };
  }

  // Fallback response matching Hinglish/Hindi
  let greeting = "नमस्ते! मैं बोलोबिज़ हूँ। मैं आपके बिज़नेस का हिसाब रखने में मदद कर सकता हूँ। आप बोलकर उधार, बिक्री या स्टॉक अपडेट कर सकते हैं।";
  if (cleanMsg.includes("hello") || cleanMsg.includes("hi")) {
    greeting = "Hello! I am BoloBiz. How can I help you manage your business today?";
  }
  return {
    content: greeting,
    toolCall: null,
  };
}
