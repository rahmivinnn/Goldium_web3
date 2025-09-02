import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { 
  insertTransactionSchema, 
  insertPortfolioSchema, 
  insertPriceAlertSchema,
  transactions,
  portfolios,
  priceAlerts,
  users
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Solana RPC proxy to avoid CORS issues
  app.post('/api/solana-rpc', async (req, res) => {
    try {
      const rpcEndpoints = [
        'https://api.mainnet-beta.solana.com',
        'https://solana-mainnet.g.alchemy.com/v2/demo'
      ];

      let lastError;
      for (const endpoint of rpcEndpoints) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
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
        error: 'All RPC endpoints failed', 
        lastError: lastError?.toString() 
      });
    } catch (error) {
      console.error('RPC proxy error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // User Management Routes
  app.get('/api/users/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!db) {
        // Fallback to in-memory storage
        const user = await storage.getUser(id);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        return res.json(user);
      }
      
      const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
      
      if (user.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user[0];
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Transaction History Routes
  app.post('/api/transactions', async (req, res) => {
    try {
      const validatedData = insertTransactionSchema.parse(req.body);
      
      if (!db) {
        // Fallback: return mock transaction for development
        const mockTransaction = {
          id: Date.now().toString(),
          ...validatedData,
          createdAt: new Date().toISOString()
        };
        return res.status(201).json(mockTransaction);
      }
      
      const [transaction] = await db.insert(transactions).values(validatedData).returning();
      res.status(201).json(transaction);
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(400).json({ error: 'Invalid transaction data' });
    }
  });

  app.get('/api/transactions/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!db) {
        // Fallback: return mock transactions for development
        const mockTransactions = [
          {
            id: '1',
            userId: userId,
            type: 'buy',
            tokenAddress: 'SOL',
            amount: '5.0',
            price: '190.50',
            status: 'completed',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: '2',
            userId: userId,
            type: 'swap',
            tokenAddress: 'GOLD',
            amount: '200.0',
            price: '2.56',
            status: 'completed',
            timestamp: new Date(Date.now() - 7200000).toISOString()
          }
        ];
        return res.json(mockTransactions);
      }
      
      const userTransactions = await db.select()
        .from(transactions)
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.timestamp));
      
      res.json(userTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/transactions/:id/status', async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['pending', 'confirmed', 'failed'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      
      const [updatedTransaction] = await db.update(transactions)
        .set({ status })
        .where(eq(transactions.id, id))
        .returning();
      
      if (!updatedTransaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }
      
      res.json(updatedTransaction);
    } catch (error) {
      console.error('Error updating transaction status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Portfolio Management Routes
  app.post('/api/portfolio', async (req, res) => {
    try {
      const validatedData = insertPortfolioSchema.parse(req.body);
      const [portfolio] = await db.insert(portfolios).values(validatedData).returning();
      res.status(201).json(portfolio);
    } catch (error) {
      console.error('Error creating portfolio entry:', error);
      res.status(400).json({ error: 'Invalid portfolio data' });
    }
  });

  app.get('/api/portfolio/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const userPortfolio = await db.select()
        .from(portfolios)
        .where(eq(portfolios.userId, userId))
        .orderBy(desc(portfolios.lastUpdated));
      
      res.json(userPortfolio);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/portfolio/:userId/:tokenAddress', async (req, res) => {
    try {
      const { userId, tokenAddress } = req.params;
      const { balance, usdValue } = req.body;
      
      const [updatedPortfolio] = await db.update(portfolios)
        .set({ 
          balance, 
          usdValue, 
          lastUpdated: new Date() 
        })
        .where(and(
          eq(portfolios.userId, userId),
          eq(portfolios.tokenAddress, tokenAddress)
        ))
        .returning();
      
      if (!updatedPortfolio) {
        return res.status(404).json({ error: 'Portfolio entry not found' });
      }
      
      res.json(updatedPortfolio);
    } catch (error) {
      console.error('Error updating portfolio:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Price Alerts Routes
  app.post('/api/price-alerts', async (req, res) => {
    try {
      const validatedData = insertPriceAlertSchema.parse(req.body);
      const [alert] = await db.insert(priceAlerts).values(validatedData).returning();
      res.status(201).json(alert);
    } catch (error) {
      console.error('Error creating price alert:', error);
      res.status(400).json({ error: 'Invalid price alert data' });
    }
  });

  app.get('/api/price-alerts/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const userAlerts = await db.select()
        .from(priceAlerts)
        .where(eq(priceAlerts.userId, userId))
        .orderBy(desc(priceAlerts.createdAt));
      
      res.json(userAlerts);
    } catch (error) {
      console.error('Error fetching price alerts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/price-alerts/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const [deletedAlert] = await db.delete(priceAlerts)
        .where(eq(priceAlerts.id, id))
        .returning();
      
      if (!deletedAlert) {
        return res.status(404).json({ error: 'Price alert not found' });
      }
      
      res.json({ message: 'Price alert deleted successfully' });
    } catch (error) {
      console.error('Error deleting price alert:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Analytics Routes
  app.get('/api/analytics/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      // Get portfolio summary
      const portfolio = await db.select()
        .from(portfolios)
        .where(eq(portfolios.userId, userId));
      
      // Get recent transactions
      const recentTransactions = await db.select()
        .from(transactions)
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.timestamp))
        .limit(10);
      
      // Calculate total portfolio value
      const totalValue = portfolio.reduce((sum, item) => {
        return sum + (parseFloat(item.usdValue || '0'));
      }, 0);
      
      // Count transactions by type
      const transactionStats = recentTransactions.reduce((stats, tx) => {
        stats[tx.type] = (stats[tx.type] || 0) + 1;
        return stats;
      }, {} as Record<string, number>);
      
      res.json({
        totalPortfolioValue: totalValue,
        portfolioItems: portfolio.length,
        recentTransactions: recentTransactions.length,
        transactionStats,
        lastActivity: recentTransactions[0]?.timestamp || null
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // XP System Routes
  // XP system removed to prevent deployment issues

  const httpServer = createServer(app);
  return httpServer;
}
