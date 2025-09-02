import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Transaction History Schema
export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // 'swap', 'stake', 'send', 'receive'
  fromToken: varchar("from_token"),
  toToken: varchar("to_token"),
  amount: text("amount").notNull(),
  txHash: varchar("tx_hash").notNull(),
  status: varchar("status").notNull().default('pending'), // 'pending', 'confirmed', 'failed'
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Portfolio Schema
export const portfolios = pgTable("portfolios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tokenAddress: varchar("token_address").notNull(),
  tokenSymbol: varchar("token_symbol").notNull(),
  balance: text("balance").notNull(),
  usdValue: text("usd_value"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Price Alerts Schema
export const priceAlerts = pgTable("price_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tokenSymbol: varchar("token_symbol").notNull(),
  targetPrice: text("target_price").notNull(),
  condition: varchar("condition").notNull(), // 'above', 'below'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  type: true,
  fromToken: true,
  toToken: true,
  amount: true,
  txHash: true,
  status: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).pick({
  userId: true,
  tokenAddress: true,
  tokenSymbol: true,
  balance: true,
  usdValue: true,
});

export const insertPriceAlertSchema = createInsertSchema(priceAlerts).pick({
  userId: true,
  tokenSymbol: true,
  targetPrice: true,
  condition: true,
});

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;
export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPriceAlert = z.infer<typeof insertPriceAlertSchema>;
export type PriceAlert = typeof priceAlerts.$inferSelect;

// XP system removed to prevent deployment database issues
