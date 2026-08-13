import { prisma } from "@/lib/db";

// Helper to resolve customer ambiguity securely within a business tenant
export async function resolveCustomer(businessId: string, customerName: string) {
  if (!customerName) return { status: "NO_NAME" };

  // Query customers containing the name to check for ambiguity
  const matches = await prisma.customer.findMany({
    where: {
      businessId,
      name: {
        contains: customerName,
      },
    },
  });

  if (matches.length === 0) {
    return { status: "NOT_FOUND" };
  }

  if (matches.length > 1) {
    // If there is an exact case-insensitive match, resolve it immediately
    const exactMatch = matches.find(
      (c) => c.name.toLowerCase() === customerName.toLowerCase()
    );
    if (exactMatch) {
      return { status: "FOUND", customer: exactMatch };
    }

    return {
      status: "AMBIGUOUS",
      matches: matches.map((m) => ({
        id: m.id,
        name: m.name,
        phone: m.phone ? m.phone.substring(0, 5) + "XXXXX" : "N/A",
      })),
    };
  }

  return { status: "FOUND", customer: matches[0] };
}

// 1. Create a customer
export async function createCustomerService(businessId: string, name: string, phone?: string) {
  if (!name.trim()) {
    throw new Error("Customer name is required");
  }

  return await prisma.customer.create({
    data: {
      name: name.trim(),
      phone: phone || null,
      businessId,
      outstandingBalance: 0.0,
    },
  });
}

// 2. Fetch a customer (handles ambiguity)
export async function getCustomerService(businessId: string, name: string) {
  const res = await resolveCustomer(businessId, name);
  if (res.status === "AMBIGUOUS") {
    return {
      status: "AMBIGUOUS_CUSTOMER",
      message: ` आपके पास "${name}" नाम के ${res.matches?.length} ग्राहक हैं। कृपया स्पष्ट करें:`,
      matches: res.matches,
    };
  }
  if (res.status === "NOT_FOUND") {
    return {
      status: "ERROR",
      message: `Customer "${name}" not found in database.`,
    };
  }
  return {
    status: "SUCCESS",
    customer: res.customer,
  };
}

// 3. List all customers
export async function listCustomersService(businessId: string) {
  const list = await prisma.customer.findMany({
    where: { businessId },
    orderBy: { name: "asc" },
  });
  return {
    status: "SUCCESS",
    customers: list.map((c) => ({
      name: c.name,
      phone: c.phone || "N/A",
      outstandingBalance: c.outstandingBalance,
    })),
  };
}

// 4. Record a generic/specific transaction
export async function recordTransactionService(
  businessId: string,
  type: "SALE" | "PURCHASE" | "CREDIT" | "PAYMENT_RECEIVED" | "EXPENSE" | "REFUND",
  amount: number,
  customerName?: string,
  description?: string
) {
  if (amount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  let customerId: string | undefined;
  let resolvedName = customerName;

  if (customerName && (type === "CREDIT" || type === "PAYMENT_RECEIVED" || type === "SALE")) {
    const res = await resolveCustomer(businessId, customerName);
    
    if (res.status === "AMBIGUOUS") {
      return {
        status: "AMBIGUOUS_CUSTOMER",
        message: `आपके पास "${customerName}" नाम के ${res.matches?.length} ग्राहक हैं। आप किस "${customerName}" की बात कर रहे हैं?`,
        matches: res.matches,
      };
    }

    if (res.status === "NOT_FOUND") {
      // Auto-create customer for credits/payments if user specifies one
      const newCustomer = await prisma.customer.create({
        data: {
          name: customerName,
          businessId,
          outstandingBalance: 0.0,
        },
      });
      customerId = newCustomer.id;
      resolvedName = newCustomer.name;
    } else if (res.status === "FOUND" && res.customer) {
      customerId = res.customer.id;
      resolvedName = res.customer.name;
    }
  }

  const transaction = await prisma.$transaction(async (tx) => {
    const trans = await tx.transaction.create({
      data: {
        type,
        amount,
        description: description || null,
        customerId: customerId || null,
        businessId,
      },
    });

    if (customerId && (type === "CREDIT" || type === "PAYMENT_RECEIVED")) {
      const delta = type === "CREDIT" ? amount : -amount;
      await tx.customer.update({
        where: { id: customerId },
        data: {
          outstandingBalance: {
            increment: delta,
          },
        },
      });
    }

    return trans;
  });

  // Fetch updated customer if linked
  let updatedBalance = 0;
  if (customerId) {
    const cust = await prisma.customer.findUnique({ where: { id: customerId } });
    updatedBalance = cust?.outstandingBalance || 0;
  }

  return {
    status: "SUCCESS",
    message: `Recorded ${type} transaction for ₹${amount}.`,
    transactionId: transaction.id,
    customerName: resolvedName || null,
    outstandingBalance: updatedBalance,
  };
}

// 5. Get customer balance
export async function getCustomerBalanceService(businessId: string, customerName: string) {
  const res = await resolveCustomer(businessId, customerName);
  
  if (res.status === "AMBIGUOUS") {
    return {
      status: "AMBIGUOUS_CUSTOMER",
      message: `आपके पास "${customerName}" नाम के ${res.matches?.length} ग्राहक हैं। कृपया स्पष्ट करें:`,
      matches: res.matches,
    };
  }
  if (res.status === "NOT_FOUND") {
    return {
      status: "SUCCESS",
      message: `ग्राहक "${customerName}" का कोई खाता नहीं मिला।`,
      balance: 0.0,
      customerName,
    };
  }

  return {
    status: "SUCCESS",
    customerName: res.customer?.name,
    balance: res.customer?.outstandingBalance || 0.0,
  };
}

// 6. Get outstanding customers
export async function getOutstandingCustomersService(businessId: string) {
  const debtors = await prisma.customer.findMany({
    where: {
      businessId,
      outstandingBalance: {
        gt: 0,
      },
    },
    orderBy: {
      outstandingBalance: "desc",
    },
  });

  return {
    status: "SUCCESS",
    debtors: debtors.map((d) => ({
      name: d.name,
      phone: d.phone || "N/A",
      outstandingBalance: d.outstandingBalance,
    })),
  };
}

// 7. Add stock adjustment to inventory
export async function addInventoryService(businessId: string, productName: string, quantity: number) {
  if (quantity === 0) {
    throw new Error("Quantity adjustment cannot be zero");
  }

  // Find exact product
  let product = await prisma.product.findFirst({
    where: {
      businessId,
      name: {
        equals: productName,
      },
    },
  });

  if (!product) {
    // Auto-create product with standard prices if not exists
    product = await prisma.product.create({
      data: {
        name: productName,
        price: 20.0,
        costPrice: 15.0,
        stockQuantity: 0.0,
        lowStockThreshold: 5.0,
        businessId,
      },
    });
  }

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: {
      stockQuantity: {
        increment: quantity,
      },
    },
  });

  return {
    status: "SUCCESS",
    productName: updated.name,
    stockQuantity: updated.stockQuantity,
  };
}

// 8. Fetch product stock inventory
export async function getInventoryService(businessId: string, productName?: string) {
  if (productName) {
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
        status: "SUCCESS",
        message: `उत्पाद "${productName}" इन्वेंट्री में नहीं मिला।`,
        stock: 0.0,
        productName,
      };
    }

    return {
      status: "SUCCESS",
      productName: product.name,
      stock: product.stockQuantity,
    };
  }

  const list = await prisma.product.findMany({
    where: { businessId },
    orderBy: { name: "asc" },
  });

  return {
    status: "SUCCESS",
    inventory: list.map((p) => ({
      name: p.name,
      stock: p.stockQuantity,
      price: p.price,
    })),
  };
}

// 9. Get low stock alert products
export async function getLowStockProductsService(businessId: string) {
  const products = await prisma.product.findMany({
    where: { businessId },
  });

  const lowStock = products.filter((p) => p.stockQuantity <= p.lowStockThreshold);

  return {
    status: "SUCCESS",
    lowStock: lowStock.map((p) => ({
      name: p.name,
      stock: p.stockQuantity,
      threshold: p.lowStockThreshold,
    })),
  };
}

// 10. Get daily sales aggregates
export async function getDailySalesService(businessId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const sales = await prisma.transaction.aggregate({
    where: {
      businessId,
      type: "SALE",
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
    _sum: { amount: true },
    _count: { id: true },
  });

  return {
    status: "SUCCESS",
    totalSales: sales._sum.amount || 0.0,
    salesCount: sales._count.id || 0,
  };
}

// 11. Get monthly sales aggregates
export async function getMonthlySalesService(businessId: string) {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const sales = await prisma.transaction.aggregate({
    where: {
      businessId,
      type: "SALE",
      createdAt: {
        gte: startOfMonth,
      },
    },
    _sum: { amount: true },
    _count: { id: true },
  });

  return {
    status: "SUCCESS",
    totalSales: sales._sum.amount || 0.0,
    salesCount: sales._count.id || 0,
  };
}

// 12. Get consolidated business summary metrics
export async function getBusinessSummaryService(businessId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const salesToday = await prisma.transaction.aggregate({
    where: { businessId, type: "SALE", createdAt: { gte: startOfDay } },
    _sum: { amount: true },
  });

  const expensesToday = await prisma.transaction.aggregate({
    where: { businessId, type: "EXPENSE", createdAt: { gte: startOfDay } },
    _sum: { amount: true },
  });

  const customers = await prisma.customer.findMany({
    where: { businessId },
    select: { outstandingBalance: true },
  });
  
  const totalCredit = customers.reduce((sum, c) => sum + c.outstandingBalance, 0);

  return {
    status: "SUCCESS",
    salesToday: salesToday._sum.amount || 0.0,
    expensesToday: expensesToday._sum.amount || 0.0,
    totalOutstandingCredit: totalCredit,
  };
}
