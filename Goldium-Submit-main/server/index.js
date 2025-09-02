var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  constructor() {
    this.users = /* @__PURE__ */ new Map();
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
};
var storage = new MemStorage();

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertPortfolioSchema: () => insertPortfolioSchema,
  insertPriceAlertSchema: () => insertPriceAlertSchema,
  insertTransactionSchema: () => insertTransactionSchema,
  insertUserSchema: () => insertUserSchema,
  portfolios: () => portfolios,
  priceAlerts: () => priceAlerts,
  transactions: () => transactions,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(),
  // 'swap', 'stake', 'send', 'receive'
  fromToken: varchar("from_token"),
  toToken: varchar("to_token"),
  amount: text("amount").notNull(),
  txHash: varchar("tx_hash").notNull(),
  status: varchar("status").notNull().default("pending"),
  // 'pending', 'confirmed', 'failed'
  timestamp: timestamp("timestamp").defaultNow().notNull()
});
var portfolios = pgTable("portfolios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tokenAddress: varchar("token_address").notNull(),
  tokenSymbol: varchar("token_symbol").notNull(),
  balance: text("balance").notNull(),
  usdValue: text("usd_value"),
  lastUpdated: timestamp("last_updated").defaultNow().notNull()
});
var priceAlerts = pgTable("price_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  tokenSymbol: varchar("token_symbol").notNull(),
  targetPrice: text("target_price").notNull(),
  condition: varchar("condition").notNull(),
  // 'above', 'below'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  type: true,
  fromToken: true,
  toToken: true,
  amount: true,
  txHash: true,
  status: true
});
var insertPortfolioSchema = createInsertSchema(portfolios).pick({
  userId: true,
  tokenAddress: true,
  tokenSymbol: true,
  balance: true,
  usdValue: true
});
var insertPriceAlertSchema = createInsertSchema(priceAlerts).pick({
  userId: true,
  tokenSymbol: true,
  targetPrice: true,
  condition: true
});

// server/db.ts
neonConfig.webSocketConstructor = ws;
var db;
var pool = null;
if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema: schema_exports });
    console.log("\u2705 Connected to PostgreSQL database");
  } catch (error) {
    console.warn("\u26A0\uFE0F Failed to connect to PostgreSQL, falling back to in-memory storage");
    db = null;
  }
} else {
  console.warn("\u26A0\uFE0F DATABASE_URL not set, using in-memory storage for development");
  db = null;
}

// server/routes.ts
import { eq, desc, and } from "drizzle-orm";
async function registerRoutes(app2) {
  app2.post("/api/solana-rpc", async (req, res) => {
    try {
      const rpcEndpoints = [
        "https://api.mainnet-beta.solana.com",
        "https://solana-mainnet.g.alchemy.com/v2/demo"
      ];
      let lastError;
      for (const endpoint of rpcEndpoints) {
        try {
          const response = await fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(req.body)
          });
          if (response.ok) {
            const data = await response.json();
            return res.json(data);
          } else {
            console.warn(`RPC ${endpoint} failed with status: ${response.status}`);
            lastError = `HTTP ${response.status}`;
            continue;
          }
        } catch (error) {
          console.warn(`Error with RPC ${endpoint}:`, error);
          lastError = error;
          continue;
        }
      }
      res.status(503).json({
        error: "All RPC endpoints failed",
        lastError: lastError?.toString()
      });
    } catch (error) {
      console.error("RPC proxy error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (!db) {
        const user2 = await storage.getUser(id);
        if (!user2) {
          return res.status(404).json({ error: "User not found" });
        }
        return res.json(user2);
      }
      const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
      if (user.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      const { password, ...userWithoutPassword } = user[0];
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/transactions", async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      if (!db) {
        const mockTransaction = {
          id: Date.now().toString(),
          ...validatedData,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        return res.status(201).json(mockTransaction);
      }
      const [transaction] = await db.insert(transactions).values(validatedData).returning();
      res.status(201).json(transaction);
    } catch (error) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ error: "Invalid transaction data" });
    }
  });
  app2.get("/api/transactions/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!db) {
        const mockTransactions = [
          {
            id: "1",
            userId,
            type: "buy",
            tokenAddress: "SOL",
            amount: "5.0",
            price: "190.50",
            status: "completed",
            timestamp: new Date(Date.now() - 36e5).toISOString()
          },
          {
            id: "2",
            userId,
            type: "swap",
            tokenAddress: "GOLD",
            amount: "200.0",
            price: "2.56",
            status: "completed",
            timestamp: new Date(Date.now() - 72e5).toISOString()
          }
        ];
        return res.json(mockTransactions);
      }
      const userTransactions = await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.timestamp));
      res.json(userTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.put("/api/transactions/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      if (!["pending", "confirmed", "failed"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }
      const [updatedTransaction] = await db.update(transactions).set({ status }).where(eq(transactions.id, id)).returning();
      if (!updatedTransaction) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.json(updatedTransaction);
    } catch (error) {
      console.error("Error updating transaction status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/portfolio", async (req, res) => {
    try {
      const validatedData = insertPortfolioSchema.parse(req.body);
      const [portfolio] = await db.insert(portfolios).values(validatedData).returning();
      res.status(201).json(portfolio);
    } catch (error) {
      console.error("Error creating portfolio entry:", error);
      res.status(400).json({ error: "Invalid portfolio data" });
    }
  });
  app2.get("/api/portfolio/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const userPortfolio = await db.select().from(portfolios).where(eq(portfolios.userId, userId)).orderBy(desc(portfolios.lastUpdated));
      res.json(userPortfolio);
    } catch (error) {
      console.error("Error fetching portfolio:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.put("/api/portfolio/:userId/:tokenAddress", async (req, res) => {
    try {
      const { userId, tokenAddress } = req.params;
      const { balance, usdValue } = req.body;
      const [updatedPortfolio] = await db.update(portfolios).set({
        balance,
        usdValue,
        lastUpdated: /* @__PURE__ */ new Date()
      }).where(and(
        eq(portfolios.userId, userId),
        eq(portfolios.tokenAddress, tokenAddress)
      )).returning();
      if (!updatedPortfolio) {
        return res.status(404).json({ error: "Portfolio entry not found" });
      }
      res.json(updatedPortfolio);
    } catch (error) {
      console.error("Error updating portfolio:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/price-alerts", async (req, res) => {
    try {
      const validatedData = insertPriceAlertSchema.parse(req.body);
      const [alert] = await db.insert(priceAlerts).values(validatedData).returning();
      res.status(201).json(alert);
    } catch (error) {
      console.error("Error creating price alert:", error);
      res.status(400).json({ error: "Invalid price alert data" });
    }
  });
  app2.get("/api/price-alerts/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const userAlerts = await db.select().from(priceAlerts).where(eq(priceAlerts.userId, userId)).orderBy(desc(priceAlerts.createdAt));
      res.json(userAlerts);
    } catch (error) {
      console.error("Error fetching price alerts:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/price-alerts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const [deletedAlert] = await db.delete(priceAlerts).where(eq(priceAlerts.id, id)).returning();
      if (!deletedAlert) {
        return res.status(404).json({ error: "Price alert not found" });
      }
      res.json({ message: "Price alert deleted successfully" });
    } catch (error) {
      console.error("Error deleting price alert:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/analytics/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const portfolio = await db.select().from(portfolios).where(eq(portfolios.userId, userId));
      const recentTransactions = await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.timestamp)).limit(10);
      const totalValue = portfolio.reduce((sum, item) => {
        return sum + parseFloat(item.usdValue || "0");
      }, 0);
      const transactionStats = recentTransactions.reduce((stats, tx) => {
        stats[tx.type] = (stats[tx.type] || 0) + 1;
        return stats;
      }, {});
      res.json({
        totalPortfolioValue: totalValue,
        portfolioItems: portfolio.length,
        recentTransactions: recentTransactions.length,
        transactionStats,
        lastActivity: recentTransactions[0]?.timestamp || null
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "node:url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { nodePolyfills } from "vite-plugin-node-polyfills";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    nodePolyfills({
      include: ["crypto", "stream", "util", "buffer"],
      globals: {
        Buffer: true,
        global: true,
        process: true
      }
    }),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "client", "src"),
      "@shared": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "shared"),
      "@assets": path.resolve(path.dirname(fileURLToPath(import.meta.url)), "attached_assets")
    }
  },
  define: {
    global: "globalThis"
  },
  optimizeDeps: {
    include: [
      "@solana/wallet-adapter-base",
      "@solana/wallet-adapter-react",
      "@solana/wallet-adapter-react-ui",
      "@solana/wallet-adapter-wallets",
      "@solana/web3.js"
    ]
  },
  root: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "client"),
  build: {
    outDir: path.resolve(path.dirname(fileURLToPath(import.meta.url)), "dist"),
    emptyOutDir: true,
    rollupOptions: {
      external: []
    }
  },
  server: {
    fs: {
      strict: false
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server }
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/websocket.ts
import { WebSocketServer, WebSocket } from "ws";
import { eq as eq2, and as and2 } from "drizzle-orm";
var WebSocketService = class {
  constructor(server) {
    this.clients = /* @__PURE__ */ new Map();
    this.priceCache = /* @__PURE__ */ new Map();
    this.priceUpdateInterval = null;
    this.wss = new WebSocketServer({
      server,
      path: "/ws"
    });
    this.setupWebSocketServer();
    this.startPriceUpdates();
  }
  setupWebSocketServer() {
    this.wss.on("connection", (ws2, request) => {
      console.log("\u{1F50C} New WebSocket connection");
      ws2.subscriptions = /* @__PURE__ */ new Set();
      ws2.on("message", async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(ws2, message);
        } catch (error) {
          console.error("Error handling WebSocket message:", error);
          ws2.send(JSON.stringify({
            type: "error",
            message: "Invalid message format"
          }));
        }
      });
      ws2.on("close", () => {
        console.log("\u{1F50C} WebSocket connection closed");
        if (ws2.userId) {
          this.clients.delete(ws2.userId);
        }
      });
      ws2.on("error", (error) => {
        console.error("WebSocket error:", error);
      });
      ws2.send(JSON.stringify({
        type: "connected",
        message: "Connected to Goldium DeFi Hub WebSocket"
      }));
    });
  }
  async handleMessage(ws2, message) {
    switch (message.type) {
      case "authenticate":
        ws2.userId = message.userId;
        this.clients.set(message.userId, ws2);
        ws2.send(JSON.stringify({
          type: "authenticated",
          userId: message.userId
        }));
        break;
      case "subscribe_prices":
        const symbols = message.symbols || [];
        symbols.forEach((symbol) => {
          ws2.subscriptions?.add(`price:${symbol}`);
        });
        symbols.forEach((symbol) => {
          const priceData = this.priceCache.get(symbol);
          if (priceData) {
            ws2.send(JSON.stringify({
              type: "price_update",
              data: priceData
            }));
          }
        });
        break;
      case "unsubscribe_prices":
        const unsubSymbols = message.symbols || [];
        unsubSymbols.forEach((symbol) => {
          ws2.subscriptions?.delete(`price:${symbol}`);
        });
        break;
      case "subscribe_notifications":
        if (ws2.userId) {
          ws2.subscriptions?.add(`notifications:${ws2.userId}`);
        }
        break;
      case "ping":
        ws2.send(JSON.stringify({ type: "pong" }));
        break;
      default:
        ws2.send(JSON.stringify({
          type: "error",
          message: "Unknown message type"
        }));
    }
  }
  startPriceUpdates() {
    this.priceUpdateInterval = setInterval(async () => {
      await this.fetchAndBroadcastPrices();
    }, 5e3);
  }
  async fetchAndBroadcastPrices() {
    try {
      const mockPrices = [
        { symbol: "SOL", price: 98.45 + (Math.random() - 0.5) * 2, change24h: 2.34 },
        { symbol: "GOLD", price: 1950.25 + (Math.random() - 0.5) * 10, change24h: -0.85 }
      ];
      for (const priceData of mockPrices) {
        const fullPriceData = {
          ...priceData,
          timestamp: Date.now()
        };
        this.priceCache.set(priceData.symbol, fullPriceData);
        this.broadcastPriceUpdate(fullPriceData);
        await this.checkPriceAlerts(fullPriceData);
      }
    } catch (error) {
      console.error("Error fetching prices:", error);
    }
  }
  broadcastPriceUpdate(priceData) {
    const message = JSON.stringify({
      type: "price_update",
      data: priceData
    });
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && client.subscriptions?.has(`price:${priceData.symbol}`)) {
        client.send(message);
      }
    });
  }
  async checkPriceAlerts(priceData) {
    try {
      if (!db) {
        return;
      }
      const alerts = await db.select().from(priceAlerts).where(and2(
        eq2(priceAlerts.tokenSymbol, priceData.symbol),
        eq2(priceAlerts.isActive, true)
      ));
      for (const alert of alerts) {
        const targetPrice = parseFloat(alert.targetPrice);
        const currentPrice = priceData.price;
        let triggered = false;
        if (alert.condition === "above" && currentPrice >= targetPrice) {
          triggered = true;
        } else if (alert.condition === "below" && currentPrice <= targetPrice) {
          triggered = true;
        }
        if (triggered) {
          await db.update(priceAlerts).set({ isActive: false }).where(eq2(priceAlerts.id, alert.id));
          const notification = {
            type: "price_alert",
            title: `Price Alert: ${alert.tokenSymbol}`,
            message: `${alert.tokenSymbol} is now ${alert.condition} $${targetPrice}. Current price: $${currentPrice.toFixed(2)}`,
            data: { alert, currentPrice },
            timestamp: Date.now()
          };
          this.sendNotificationToUser(alert.userId, notification);
        }
      }
    } catch (error) {
      console.error("Error checking price alerts:", error);
    }
  }
  sendNotificationToUser(userId, notification) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN && client.subscriptions?.has(`notifications:${userId}`)) {
      client.send(JSON.stringify({
        type: "notification",
        data: notification
      }));
    }
  }
  broadcastTransactionUpdate(userId, transaction) {
    const notification = {
      type: "transaction",
      title: "Transaction Update",
      message: `Transaction ${transaction.txHash} status: ${transaction.status}`,
      data: transaction,
      timestamp: Date.now()
    };
    this.sendNotificationToUser(userId, notification);
  }
  broadcastPortfolioUpdate(userId, portfolio) {
    const notification = {
      type: "portfolio_update",
      title: "Portfolio Updated",
      message: `Your ${portfolio.tokenSymbol} balance has been updated`,
      data: portfolio,
      timestamp: Date.now()
    };
    this.sendNotificationToUser(userId, notification);
  }
  getConnectedClients() {
    return this.clients.size;
  }
  close() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
    }
    this.wss.close();
  }
};
var wsService = null;
function initializeWebSocket(server) {
  wsService = new WebSocketService(server);
  console.log("\u{1F680} WebSocket server initialized");
  return wsService;
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  initializeWebSocket(server);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  const isProduction = process.env.NODE_ENV === "production" || process.env.REPLIT_DEPLOYMENT === "1" || process.env.ENVIRONMENT === "production";
  if (!isProduction) {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
