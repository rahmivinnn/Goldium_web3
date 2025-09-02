import { useEffect, useRef, useState, useCallback } from 'react';

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

interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
  userId?: string;
}

interface UseWebSocketOptions {
  userId?: string;
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface UseWebSocketReturn {
  isConnected: boolean;
  isConnecting: boolean;
  prices: Map<string, PriceData>;
  notifications: NotificationData[];
  connect: () => void;
  disconnect: () => void;
  subscribeToPrices: (symbols: string[]) => void;
  unsubscribeFromPrices: (symbols: string[]) => void;
  subscribeToNotifications: () => void;
  clearNotifications: () => void;
  sendMessage: (message: any) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    userId,
    autoConnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [prices, setPrices] = useState<Map<string, PriceData>>(new Map());
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscribedSymbolsRef = useRef<Set<string>>(new Set());
  const isSubscribedToNotificationsRef = useRef(false);

  const getWebSocketUrl = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = import.meta.env.VITE_WS_PORT || '5000';
    return `${protocol}//${host}:${port}/ws`;
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  }, []);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case 'connected':
          console.log('✅ WebSocket connected');
          setIsConnected(true);
          setIsConnecting(false);
          reconnectAttemptsRef.current = 0;
          
          // Authenticate if userId is provided
          if (userId) {
            sendMessage({ type: 'authenticate', userId });
          }
          break;

        case 'authenticated':
          console.log('🔐 WebSocket authenticated for user:', message.userId);
          
          // Re-subscribe to previous subscriptions
          if (subscribedSymbolsRef.current.size > 0) {
            sendMessage({
              type: 'subscribe_prices',
              symbols: Array.from(subscribedSymbolsRef.current)
            });
          }
          
          if (isSubscribedToNotificationsRef.current) {
            sendMessage({ type: 'subscribe_notifications' });
          }
          break;

        case 'price_update':
          if (message.data) {
            setPrices(prev => {
              const newPrices = new Map(prev);
              newPrices.set(message.data.symbol, message.data);
              return newPrices;
            });
          }
          break;

        case 'notification':
          if (message.data) {
            setNotifications(prev => [message.data, ...prev].slice(0, 50)); // Keep last 50 notifications
          }
          break;

        case 'pong':
          // Handle ping/pong for connection health
          break;

        case 'error':
          console.error('WebSocket error:', message.message);
          break;

        default:
          console.log('Unknown WebSocket message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }, [userId, sendMessage]);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    if (isConnecting) {
      return; // Already connecting
    }

    setIsConnecting(true);
    
    try {
      const ws = new WebSocket(getWebSocketUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔌 WebSocket connection opened');
      };

      ws.onmessage = handleMessage;

      ws.onclose = (event) => {
        console.log('🔌 WebSocket connection closed:', event.code, event.reason);
        setIsConnected(false);
        setIsConnecting(false);
        
        // Attempt to reconnect if not a clean close
        if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`🔄 Attempting to reconnect (${reconnectAttemptsRef.current}/${maxReconnectAttempts})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsConnecting(false);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setIsConnecting(false);
    }
  }, [getWebSocketUrl, handleMessage, reconnectInterval, maxReconnectAttempts, isConnecting]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setIsConnecting(false);
    reconnectAttemptsRef.current = maxReconnectAttempts; // Prevent auto-reconnect
  }, [maxReconnectAttempts]);

  const subscribeToPrices = useCallback((symbols: string[]) => {
    symbols.forEach(symbol => subscribedSymbolsRef.current.add(symbol));
    sendMessage({ type: 'subscribe_prices', symbols });
  }, [sendMessage]);

  const unsubscribeFromPrices = useCallback((symbols: string[]) => {
    symbols.forEach(symbol => subscribedSymbolsRef.current.delete(symbol));
    sendMessage({ type: 'unsubscribe_prices', symbols });
  }, [sendMessage]);

  const subscribeToNotifications = useCallback(() => {
    isSubscribedToNotificationsRef.current = true;
    sendMessage({ type: 'subscribe_notifications' });
  }, [sendMessage]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  // Ping interval to keep connection alive
  useEffect(() => {
    if (!isConnected) return;

    const pingInterval = setInterval(() => {
      sendMessage({ type: 'ping' });
    }, 30000); // Ping every 30 seconds

    return () => clearInterval(pingInterval);
  }, [isConnected, sendMessage]);

  return {
    isConnected,
    isConnecting,
    prices,
    notifications,
    connect,
    disconnect,
    subscribeToPrices,
    unsubscribeFromPrices,
    subscribeToNotifications,
    clearNotifications,
    sendMessage
  };
}