import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const currency = v.union(
  v.literal("HUF"),
  v.literal("EUR"),
  v.literal("USD"),
  v.literal("DKK"),
  v.literal("GBP"),
  v.literal("AED")
);

export const transactionFields = {
  created_at: v.string(),
  created_on: v.string(),
  direction: v.union(v.literal("IN"), v.literal("OUT"), v.literal("NEUTRAL")),
  exchange_rate: v.float64(),
  expenditure_category: v.union(
    v.null(),
    v.literal("INFRASTRUCTURE"),
    v.literal("TAXES"),
    v.literal("MARKETING"),
    v.literal("LEGAL"),
    v.literal("OTHER")
  ),
  finished_on: v.string(),
  id: v.float64(),
  is_net: v.float64(),
  reference: v.union(v.null(), v.string()),
  source_amount: v.float64(),
  source_amount_in_default_currency: v.float64(),
  source_currency: currency,
  source_name: v.union(v.null(), v.string()),
  status: v.union(v.null(), v.literal("COMPLETED"), v.literal("CANCELLED")),
  target_amount: v.float64(),
  target_amount_in_default_currency: v.float64(),
  target_currency: currency,
  target_name: v.union(v.null(), v.string()),
  transaction_id: v.string(),
  updated_at: v.string(),
  user_id: v.union(v.null(), v.float64()),
};

export default defineSchema({
  tasks: defineTable({
    isCompleted: v.boolean(),
    text: v.string(),
  }),
  transactions: defineTable(transactionFields),
});
