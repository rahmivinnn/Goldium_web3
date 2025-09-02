import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { db } from './db';
import { priceAlerts } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

interface WebSocketClient extends WebSocket {
  userId?: string;
  subscriptions?: Set<string>;
}

interface PriceData {
  symbol: string;
  price: number;
  change24h: number;
  timestamp: number;
}

interface NotificationData {
  type: 'price_alert' | 'transaction' | 'portfolio_update';
  title: string;
  message: string;
  data?: any;
  timestamp: number;
}

export class WebSocketService {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();
  private priceCache: Map<string, PriceData> = new Map();
  private priceUpdateInterval: NodeJS.Timeout | null = null;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws'
    });

    this.setupWebSocketServer();
    this.startPriceUpdates();
  }

  private setupWebSocketServer() {
    this.wss.on('connection', (ws: WebSocketClient, request) => {
      console.log('🔌 New WebSocket connection');
      
      ws.subscriptions = new Set();
      
      // Handle incoming messages
      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
          ws.send(JSON.stringify({ 
            type: 'error', 
            message: 'Invalid message format' 
          }));
        }
      });

      // Handle connection close
      ws.on('close', () => {
        console.log('🔌 WebSocket connection closed');
        if (ws.userId) {
          this.clients.delete(ws.userId);
        }
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        message: 'Connected to Goldium DeFi Hub WebSocket'
      }));
    });
  }

  private async handleMessage(ws: WebSocketClient, message: any) {
    switch (message.type) {
      case 'authenticate':
        ws.userId = message.userId;
        this.clients.set(message.userId, ws);
        ws.send(JSON.stringify({
          type: 'authenticated',
          userId: message.userId
        }));
        break;

      case 'subscribe_prices':
        const symbols = message.symbols || [];
        symbols.forEach((symbol: string) => {
          ws.subscriptions?.add(`price:${symbol}`);
        });
        
        // Send current prices for subscribed symbols
        symbols.forEach((symbol: string) => {
          const priceData = this.priceCache.get(symbol);
          if (priceData) {
            ws.send(JSON.stringify({
              type: 'price_update',
              data: priceData
            }));
          }
        });
        break;

      case 'unsubscribe_prices':
        const unsubSymbols = message.symbols || [];
        unsubSymbols.forEach((symbol: string) => {
          ws.subscriptions?.delete(`price:${symbol}`);
        });
        break;

      case 'subscribe_notifications':
        if (ws.userId) {
          ws.subscriptions?.add(`notifications:${ws.userId}`);
        }
        break;

      case 'ping':
        ws.send(JSON.stringify({ type: 'pong' }));
        break;

      default:
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Unknown message type'
        }));
    }
  }

  private startPriceUpdates() {
    // Simulate price updates every 5 seconds
    this.priceUpdateInterval = setInterval(async () => {
      await this.fetchAndBroadcastPrices();
    }, 5000);
  }

  private async fetchAndBroadcastPrices() {
    try {
      // Simulate fetching prices from external API
      const mockPrices = [
        { symbol: 'SOL', price: 98.45 + (Math.random() - 0.5) * 2, change24h: 2.34 },
        { symbol: 'GOLD', price: 1950.25 + (Math.random() - 0.5) * 10, change24h: -0.85 }
      ];

      for (const priceData of mockPrices) {
        const fullPriceData: PriceData = {
          ...priceData,
          timestamp: Date.now()
        };
        
        this.priceCache.set(priceData.symbol, fullPriceData);
        
        // Broadcast to subscribed clients
        this.broadcastPriceUpdate(fullPriceData);
        
        // Check price alerts
        await this.checkPriceAlerts(fullPriceData);
      }
    } catch (error) {
      console.error('Error fetching prices:', error);
    }
  }

  private broadcastPriceUpdate(priceData: PriceData) {
    const message = JSON.stringify({
      type: 'price_update',
      data: priceData
    });

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN && 
          client.subscriptions?.has(`price:${priceData.symbol}`)) {
        client.send(message);
      }
    });
  }

  private async checkPriceAlerts(priceData: PriceData) {
    try {
      if (!db) {
        // Skip price alerts when database is not available
        return;
      }
      
      const alerts = await db.select()
        .from(priceAlerts)
        .where(and(
          eq(priceAlerts.tokenSymbol, priceData.symbol),
          eq(priceAlerts.isActive, true)
        ));

      for (const alert of alerts) {
        const targetPrice = parseFloat(alert.targetPrice);
        const currentPrice = priceData.price;
        let triggered = false;

        if (alert.condition === 'above' && currentPrice >= targetPrice) {
          triggered = true;
        } else if (alert.condition === 'below' && currentPrice <= targetPrice) {
          triggered = true;
        }

        if (triggered) {
          // Deactivate the alert
          await db.update(priceAlerts)
            .set({ isActive: false })
            .where(eq(priceAlerts.id, alert.id));

          // Send notification
          const notification: NotificationData = {
            type: 'price_alert',
            title: `Price Alert: ${alert.tokenSymbol}`,
            message: `${alert.tokenSymbol} is now ${alert.condition} $${targetPrice}. Current price: $${currentPrice.toFixed(2)}`,
            data: { alert, currentPrice },
            timestamp: Date.now()
          };

          this.sendNotificationToUser(alert.userId, notification);
        }
      }
    } catch (error) {
      console.error('Error checking price alerts:', error);
    }
  }

  public sendNotificationToUser(userId: string, notification: NotificationData) {
    const client = this.clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN &&
        client.subscriptions?.has(`notifications:${userId}`)) {
      client.send(JSON.stringify({
        type: 'notification',
        data: notification
      }));
    }
  }

  public broadcastTransactionUpdate(userId: string, transaction: any) {
    const notification: NotificationData = {
      type: 'transaction',
      title: 'Transaction Update',
      message: `Transaction ${transaction.txHash} status: ${transaction.status}`,
      data: transaction,
      timestamp: Date.now()
    };

    this.sendNotificationToUser(userId, notification);
  }

  public broadcastPortfolioUpdate(userId: string, portfolio: any) {
    const notification: NotificationData = {
      type: 'portfolio_update',
      title: 'Portfolio Updated',
      message: `Your ${portfolio.tokenSymbol} balance has been updated`,
      data: portfolio,
      timestamp: Date.now()
    };

    this.sendNotificationToUser(userId, notification);
  }

  public getConnectedClients(): number {
    return this.clients.size;
  }

  public close() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
    }
    this.wss.close();
  }
}

export let wsService: WebSocketService | null = null;

export function initializeWebSocket(server: Server) {
  wsService = new WebSocketService(server);
  console.log('🚀 WebSocket server initialized');
  return wsService;
}