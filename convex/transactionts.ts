import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc } from "./_generated/dataModel";
import { transactionFields } from "./schema";

// Transaction document validator (reuses schema + system fields)
const transactionDocValidator = v.object({
  _id: v.id("transactions"),
  _creationTime: v.number(),
  ...transactionFields,
});

/**
 * Get all transactions for a specific month, ordered by creation time (newest first)
 */
export const listTransactionsByMonth = query({
  args: { 
    month: v.string() // Format: "2024-03"
  },
  returns: v.array(transactionDocValidator),
  handler: async (ctx, args): Promise<Doc<"transactions">[]> => {
    const transactions = await ctx.db
      .query("transactions")
      .filter((q) => q.gte(q.field("created_on"), `${args.month}-01`))
      .filter((q) => q.lt(q.field("created_on"), getNextMonth(args.month)))
      .order("desc")
      .collect();
    
    return transactions;
  },
});

/**
 * Get transactions for a specific month filtered by direction
 */
export const listTransactionsByMonthAndDirection = query({
  args: { 
    month: v.string(), // Format: "2024-03"
    direction: v.union(v.literal("IN"), v.literal("OUT"), v.literal("NEUTRAL"))
  },
  returns: v.array(transactionDocValidator),
  handler: async (ctx, args): Promise<Doc<"transactions">[]> => {
    const transactions = await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("direction"), args.direction))
      .filter((q) => q.gte(q.field("created_on"), `${args.month}-01`))
      .filter((q) => q.lt(q.field("created_on"), getNextMonth(args.month)))
      .order("desc")
      .collect();
    
    return transactions;
  },
});

/**
 * Get transactions for a specific month filtered by user
 */
export const listTransactionsByMonthAndUser = query({
  args: { 
    month: v.string(), // Format: "2024-03"
    userId: v.float64()
  },
  returns: v.array(transactionDocValidator),
  handler: async (ctx, args): Promise<Doc<"transactions">[]> => {
    const transactions = await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("user_id"), args.userId))
      .filter((q) => q.gte(q.field("created_on"), `${args.month}-01`))
      .filter((q) => q.lt(q.field("created_on"), getNextMonth(args.month)))
      .order("desc")
      .collect();
    
    return transactions;
  },
});

/**
 * Get transactions for a specific month filtered by direction and user
 */
export const listTransactionsByMonthDirectionAndUser = query({
  args: { 
    month: v.string(), // Format: "2024-03"
    direction: v.union(v.literal("IN"), v.literal("OUT"), v.literal("NEUTRAL")),
    userId: v.float64()
  },
  returns: v.array(transactionDocValidator),
  handler: async (ctx, args): Promise<Doc<"transactions">[]> => {
    const transactions = await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("direction"), args.direction))
      .filter((q) => q.eq(q.field("user_id"), args.userId))
      .filter((q) => q.gte(q.field("created_on"), `${args.month}-01`))
      .filter((q) => q.lt(q.field("created_on"), getNextMonth(args.month)))
      .order("desc")
      .collect();
    
    return transactions;
  },
});

/**
 * Get available months that have transactions (for navigation)
 */
export const getAvailableMonths = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx): Promise<string[]> => {
    const transactions = await ctx.db
      .query("transactions")
      .order("desc")
      .collect();
    
    const months = new Set<string>();
    for (const transaction of transactions) {
      const month = transaction.created_on.substring(0, 7); // Extract "YYYY-MM"
      months.add(month);
    }
    
    return Array.from(months).sort().reverse(); // Latest months first
  },
});

/**
 * Get transaction summary for a specific month
 */
export const getMonthSummary = query({
  args: { 
    month: v.string() // Format: "2024-03"
  },
  returns: v.object({
    month: v.string(),
    totalTransactions: v.number(),
    incomingCount: v.number(),
    outgoingCount: v.number(),
    neutralCount: v.number(),
    totalIncoming: v.float64(),
    totalOutgoing: v.float64(),
  }),
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("transactions")
      .filter((q) => q.gte(q.field("created_on"), `${args.month}-01`))
      .filter((q) => q.lt(q.field("created_on"), getNextMonth(args.month)))
      .collect();
    
    let incomingCount = 0;
    let outgoingCount = 0;
    let neutralCount = 0;
    let totalIncoming = 0;
    let totalOutgoing = 0;
    
    for (const transaction of transactions) {
      if (transaction.direction === "IN") {
        incomingCount++;
        totalIncoming += transaction.target_amount_in_default_currency;
      } else if (transaction.direction === "OUT") {
        outgoingCount++;
        totalOutgoing += transaction.source_amount_in_default_currency;
      } else {
        neutralCount++;
      }
    }
    
    return {
      month: args.month,
      totalTransactions: transactions.length,
      incomingCount,
      outgoingCount,
      neutralCount,
      totalIncoming,
      totalOutgoing,
    };
  },
});

// Helper function to get the next month string
function getNextMonth(month: string): string {
  const [year, monthNum] = month.split('-').map(Number);
  const date = new Date(year, monthNum, 1); // monthNum is 0-indexed in Date constructor
  const nextMonth = date.getMonth() + 1;
  const nextYear = date.getFullYear();
  
  if (nextMonth > 11) {
    return `${nextYear + 1}-01-01`;
  } else {
    const formattedMonth = String(nextMonth + 1).padStart(2, '0');
    return `${nextYear}-${formattedMonth}-01`;
  }
}

/**
 * Create sample transaction data for testing (run this once to populate data)
 */
export const createSampleData = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const sampleTransactions = [
      // December 2024
      {
        created_at: "2024-12-15 10:30:00",
        created_on: "2024-12-15",
        direction: "IN" as const,
        exchange_rate: 1.0,
        expenditure_category: null,
        finished_on: "2024-12-15",
        id: 1001,
        is_net: 1.0,
        reference: "SALARY-DEC-2024",
        source_amount: 5000.0,
        source_amount_in_default_currency: 5000.0,
        source_currency: "USD" as const,
        source_name: "ACME Corp",
        status: "COMPLETED" as const,
        target_amount: 5000.0,
        target_amount_in_default_currency: 5000.0,
        target_currency: "USD" as const,
        target_name: "My Account",
        transaction_id: "TX-DEC-001",
        updated_at: "2024-12-15 10:30:00",
        user_id: 123,
      },
      {
        created_at: "2024-12-10 14:20:00",
        created_on: "2024-12-10",
        direction: "OUT" as const,
        exchange_rate: 1.0,
        expenditure_category: "INFRASTRUCTURE" as const,
        finished_on: "2024-12-10",
        id: 1002,
        is_net: 1.0,
        reference: "AWS-HOSTING",
        source_amount: 150.0,
        source_amount_in_default_currency: 150.0,
        source_currency: "USD" as const,
        source_name: "My Account",
        status: "COMPLETED" as const,
        target_amount: 150.0,
        target_amount_in_default_currency: 150.0,
        target_currency: "USD" as const,
        target_name: "Amazon Web Services",
        transaction_id: "TX-DEC-002",
        updated_at: "2024-12-10 14:20:00",
        user_id: 123,
      },
      // November 2024
      {
        created_at: "2024-11-25 09:15:00",
        created_on: "2024-11-25",
        direction: "IN" as const,
        exchange_rate: 1.0,
        expenditure_category: null,
        finished_on: "2024-11-25",
        id: 1003,
        is_net: 1.0,
        reference: "CLIENT-PAYMENT",
        source_amount: 2500.0,
        source_amount_in_default_currency: 2500.0,
        source_currency: "USD" as const,
        source_name: "Client XYZ",
        status: "COMPLETED" as const,
        target_amount: 2500.0,
        target_amount_in_default_currency: 2500.0,
        target_currency: "USD" as const,
        target_name: "My Account",
        transaction_id: "TX-NOV-001",
        updated_at: "2024-11-25 09:15:00",
        user_id: 123,
      },
      {
        created_at: "2024-11-20 16:45:00",
        created_on: "2024-11-20",
        direction: "OUT" as const,
        exchange_rate: 1.0,
        expenditure_category: "MARKETING" as const,
        finished_on: "2024-11-20",
        id: 1004,
        is_net: 1.0,
        reference: "GOOGLE-ADS",
        source_amount: 300.0,
        source_amount_in_default_currency: 300.0,
        source_currency: "USD" as const,
        source_name: "My Account",
        status: "COMPLETED" as const,
        target_amount: 300.0,
        target_amount_in_default_currency: 300.0,
        target_currency: "USD" as const,
        target_name: "Google Ads",
        transaction_id: "TX-NOV-002",
        updated_at: "2024-11-20 16:45:00",
        user_id: 123,
      },
      // October 2024
      {
        created_at: "2024-10-30 11:00:00",
        created_on: "2024-10-30",
        direction: "OUT" as const,
        exchange_rate: 1.0,
        expenditure_category: "LEGAL" as const,
        finished_on: "2024-10-30",
        id: 1005,
        is_net: 1.0,
        reference: "LEGAL-CONSULTATION",
        source_amount: 800.0,
        source_amount_in_default_currency: 800.0,
        source_currency: "USD" as const,
        source_name: "My Account",
        status: "COMPLETED" as const,
        target_amount: 800.0,
        target_amount_in_default_currency: 800.0,
        target_currency: "USD" as const,
        target_name: "Law Firm ABC",
        transaction_id: "TX-OCT-001",
        updated_at: "2024-10-30 11:00:00",
        user_id: 123,
      }
    ];

    let count = 0;
    for (const transaction of sampleTransactions) {
      await ctx.db.insert("transactions", transaction);
      count++;
    }

    return count;
  },
});
