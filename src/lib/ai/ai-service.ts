import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { prisma } from "@/lib/db";
import * as businessService from "../services/business";
import * as analyticsService from "../services/analytics";

export interface AIServiceResponse {
  content: string;
  toolExecuted: {
    name: string;
    args: any;
    result: any;
  } | null;
  sessionId: string;
}

export interface AIService {
  sendMessage(message: string, sessionId?: string, confirmed?: boolean): Promise<AIServiceResponse>;
}

export class GeminiAIService implements AIService {
  private genAI: GoogleGenerativeAI;
  private businessId: string;
  private userId: string;

  constructor(apiKey: string, businessId: string, userId: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.businessId = businessId;
    this.userId = userId;
  }

  async sendMessage(message: string, sessionId?: string, confirmed?: boolean): Promise<AIServiceResponse> {
    // 1. Get or create session
    let chatSessionDb;
    if (sessionId) {
      chatSessionDb = await prisma.conversationSession.findFirst({
        where: { id: sessionId, businessId: this.businessId },
      });
    }

    if (!chatSessionDb) {
      chatSessionDb = await prisma.conversationSession.create({
        data: {
          userId: this.userId,
          businessId: this.businessId,
        },
      });
    }

    const finalSessionId = chatSessionDb.id;

    // 2. Fetch context history (last 15 messages)
    const pastMessages = await prisma.chatMessage.findMany({
      where: { sessionId: finalSessionId },
      orderBy: { createdAt: "asc" },
      take: 15,
    });

    // 3. Gather active database catalog profiles to minimize name hallucinations
    const customers = await prisma.customer.findMany({
      where: { businessId: this.businessId },
      select: { name: true, phone: true, outstandingBalance: true },
    });

    const products = await prisma.product.findMany({
      where: { businessId: this.businessId },
      select: { name: true, price: true, stockQuantity: true },
    });

    const customersContext = customers
      .map((c) => `- Name: "${c.name}", Phone: "${c.phone || "N/A"}", Credit: ₹${c.outstandingBalance}`)
      .join("\n");

    const productsContext = products
      .map((p) => `- Name: "${p.name}", Price: ₹${p.price}, Stock: ${p.stockQuantity}`)
      .join("\n");

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

    // 4. Set system prompt instructions
    const systemInstruction = `
You are BoloBiz, a voice-first AI business operating assistant for Kirana store owners, merchants, and small businesses in India.
Your mission statement is: "Run Your Business. बस बोलकर."

Response Rules:
1. Match the user's language style.
   - If they write/speak in Hinglish (e.g. "Ramesh ko 500 udhaar diya"), reply in Hinglish (e.g. "Ramesh ke khate mein ₹500 ka udhaar add karne ke liye confirm karein.").
   - If they write/speak in Hindi, reply in Hindi (e.g. "ठीक है! रमेश के खाते में ₹500 का उधार जोड़ने के लिए पुष्टि करें।").
   - If English, reply in English.
2. Keep responses brief, concise, friendly, and under 2-3 sentences.
3. You are an interface to a database. Never fabricate, guess, or hallucinate balances, stock counts, orders, sales, or names. If you need information, you MUST invoke a query tool.
4. If a tool output returns "AMBIGUOUS_CUSTOMER", you must stop execution and ask the user to clarify which customer they mean by presenting the matches (include their redacted phone numbers).
5. If a tool output returns "CONFIRMATION_REQUIRED", explain that this is a sensitive database update and prompt the user to confirm the details.
6. All operations must run using tools. Do not promise that an action is recorded unless the database service returns SUCCESS.

CURRENT TENANT CONTEXT (From Database):
- Today: ${currentDate}, ${currentTime}
- Registered Customers:
${customersContext || "(None yet)"}
- Inventory Catalog:
${productsContext || "(None yet)"}
`;

    // 5. Initialize model and tool definitions
    const model = this.genAI.getGenerativeModel({
      model: "gemini-3.5-flash",
      systemInstruction,
      tools: [
        {
          functionDeclarations: [
            {
              name: "createCustomer",
              description: "Create a new customer profile in the database.",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  name: { type: SchemaType.STRING, description: "Full name of the customer" },
                  phone: { type: SchemaType.STRING, description: "Phone number of the customer (optional)" },
                },
                required: ["name"],
              },
            },
            {
              name: "getCustomer",
              description: "Fetch details of a single customer profile.",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  name: { type: SchemaType.STRING, description: "Name of the customer to search" },
                },
                required: ["name"],
              },
            },
            {
              name: "listCustomers",
              description: "List all customers registered in the database.",
              parameters: { type: SchemaType.OBJECT, properties: {} },
            },
            {
              name: "createSale",
              description: "Record a sale transaction (income).",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  amount: { type: SchemaType.NUMBER, description: "Total sale value in INR" },
                  customerName: { type: SchemaType.STRING, description: "Optional name of the purchasing customer" },
                  description: { type: SchemaType.STRING, description: "Optional transaction description" },
                },
                required: ["amount"],
              },
            },
            {
              name: "createCredit",
              description: "Record a credit transaction (loan given to a customer).",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  amount: { type: SchemaType.NUMBER, description: "Total credit value in INR" },
                  customerName: { type: SchemaType.STRING, description: "Name of the customer receiving credit" },
                  description: { type: SchemaType.STRING, description: "Optional transaction description" },
                },
                required: ["amount", "customerName"],
              },
            },
            {
              name: "recordPayment",
              description: "Record a payment received from a customer (reducing their outstanding credit).",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  amount: { type: SchemaType.NUMBER, description: "Payment amount in INR" },
                  customerName: { type: SchemaType.STRING, description: "Name of the customer paying" },
                  description: { type: SchemaType.STRING, description: "Optional transaction description" },
                },
                required: ["amount", "customerName"],
              },
            },
            {
              name: "createExpense",
              description: "Record a business expense (cash outflow).",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  amount: { type: SchemaType.NUMBER, description: "Expense amount in INR" },
                  description: { type: SchemaType.STRING, description: "Note detailing the expense type" },
                },
                required: ["amount"],
              },
            },
            {
              name: "getCustomerBalance",
              description: "Retrieve the outstanding credit balance of a customer.",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  customerName: { type: SchemaType.STRING, description: "Name of the customer" },
                },
                required: ["customerName"],
              },
            },
            {
              name: "getOutstandingCustomers",
              description: "List all customers who have outstanding credit (debtors).",
              parameters: { type: SchemaType.OBJECT, properties: {} },
            },
            {
              name: "addInventory",
              description: "Adjust or add stock units for a product in inventory.",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  productName: { type: SchemaType.STRING, description: "Name of the product" },
                  quantity: { type: SchemaType.NUMBER, description: "Quantity to add (use negative to subtract)" },
                },
                required: ["productName", "quantity"],
              },
            },
            {
              name: "getInventory",
              description: "Get current stock levels of all products or a specific product name.",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  productName: { type: SchemaType.STRING, description: "Optional product name to filter" },
                },
              },
            },
            {
              name: "getLowStockProducts",
              description: "Find products that are below their low-stock safety thresholds.",
              parameters: { type: SchemaType.OBJECT, properties: {} },
            },
            {
              name: "getDailySales",
              description: "Retrieve total sales aggregate completed today.",
              parameters: { type: SchemaType.OBJECT, properties: {} },
            },
            {
              name: "getMonthlySales",
              description: "Retrieve total sales aggregate completed in the current month.",
              parameters: { type: SchemaType.OBJECT, properties: {} },
            },
            {
              name: "getBusinessSummary",
              description: "Get overall financial metrics (today's sales, expenses, and total outstanding credit).",
              parameters: { type: SchemaType.OBJECT, properties: {} },
            },
            {
              name: "getProactiveBusinessInsights",
              description: "Retrieve comprehensive deterministic business analytics, sales change stats, debtors credit aging, low-stock lists, and proactive insight findings to answer performance or state inquiries.",
              parameters: { type: SchemaType.OBJECT, properties: {} },
            },
          ],
        },
      ],
    });

    // 6. Map Chat history
    const history = pastMessages.map((msg) => ({
      role: msg.role === "USER" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });

    // 7. Send message to Gemini with network/failure boundaries
    let result;
    try {
      result = await chat.sendMessage(message);
    } catch (err) {
      console.error("Gemini AI API connection failed:", err);
      throw new Error("AI assistant is currently offline. Please type or speak again.");
    }

    let finalResponseText = "";
    let executedToolDetails = null;

    const functionCalls = result.response.functionCalls();

    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      const toolName = call.name;
      const toolArgs = call.args as any;

      console.log(`AI invoking tool: ${toolName} with args:`, toolArgs);

      // Execute tool operation via the shared Business Service layer
      const dbResult = await this.executeBusinessTool(toolName, toolArgs, confirmed);
      executedToolDetails = { name: toolName, args: toolArgs, result: dbResult };

      // Feed results back to the model with safety fail-safes
      let toolFollowUp;
      try {
        toolFollowUp = await chat.sendMessage([
          {
            functionResponse: {
              name: toolName,
              response: dbResult,
            },
          },
        ]);
      } catch (err) {
        console.error("Gemini AI API follow-up failed:", err);
        throw new Error("AI assistant failed to process action details. Please try again.");
      }

      finalResponseText = toolFollowUp.response.text();
    } else {
      finalResponseText = result.response.text();
    }

    // 8. Log User and Assistant messages to database ChatMessage logs
    await prisma.chatMessage.create({
      data: { sessionId: finalSessionId, role: "USER", content: message },
    });

    await prisma.chatMessage.create({
      data: {
        sessionId: finalSessionId,
        role: "ASSISTANT",
        content: finalResponseText,
        toolCallDetails: executedToolDetails ? JSON.stringify(executedToolDetails) : null,
      },
    });

    return {
      sessionId: finalSessionId,
      content: finalResponseText,
      toolExecuted: executedToolDetails,
    };
  }

  // Business Service Mapper (with confirmation checks)
  private async executeBusinessTool(name: string, args: any, confirmed?: boolean): Promise<any> {
    try {
      // 1. Enforce Confirmation constraints on sensitive mutations before executing
      const sensitiveMutations = ["createCredit", "recordPayment", "createExpense", "addInventory"];
      if (sensitiveMutations.includes(name) && confirmed !== true) {
        return {
          status: "CONFIRMATION_REQUIRED",
          message: `This action requires manual confirmation before database execution.`,
          actionDetails: {
            tool: name,
            args,
          },
        };
      }

      switch (name) {
        case "createCustomer":
          return await businessService.createCustomerService(this.businessId, args.name, args.phone);

        case "getCustomer":
          return await businessService.getCustomerService(this.businessId, args.name);

        case "listCustomers":
          return await businessService.listCustomersService(this.businessId);

        case "createSale":
          return await businessService.recordTransactionService(
            this.businessId,
            "SALE",
            args.amount,
            args.customerName,
            args.description
          );

        case "createCredit":
          return await businessService.recordTransactionService(
            this.businessId,
            "CREDIT",
            args.amount,
            args.customerName,
            args.description
          );

        case "recordPayment":
          return await businessService.recordTransactionService(
            this.businessId,
            "PAYMENT_RECEIVED",
            args.amount,
            args.customerName,
            args.description
          );

        case "createExpense":
          return await businessService.recordTransactionService(
            this.businessId,
            "EXPENSE",
            args.amount,
            undefined,
            args.description
          );

        case "getCustomerBalance":
          return await businessService.getCustomerBalanceService(this.businessId, args.customerName);

        case "getOutstandingCustomers":
          return await businessService.getOutstandingCustomersService(this.businessId);

        case "addInventory":
          return await businessService.addInventoryService(this.businessId, args.productName, args.quantity);

        case "getInventory":
          return await businessService.getInventoryService(this.businessId, args.productName);

        case "getLowStockProducts":
          return await businessService.getLowStockProductsService(this.businessId);

        case "getDailySales":
          return await businessService.getDailySalesService(this.businessId);

        case "getMonthlySales":
          return await businessService.getMonthlySalesService(this.businessId);

        case "getBusinessSummary":
          return await businessService.getBusinessSummaryService(this.businessId);

        case "getProactiveBusinessInsights":
          return await analyticsService.getBusinessAnalyticsAndInsights(this.businessId);

        default:
          return { status: "ERROR", message: `Tool "${name}" is not supported.` };
      }
    } catch (err: any) {
      console.error(`Error in executeBusinessTool (${name}):`, err);
      return { status: "ERROR", message: err.message || "Failed execution" };
    }
  }
}
