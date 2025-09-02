import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, Bell, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { cn } from '../lib/utils';

interface Notification {
  id: string;
  type: 'price_alert' | 'transaction' | 'portfolio' | 'system';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  data?: any;
}

interface NotificationsProps {
  className?: string;
  maxNotifications?: number;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export function RealTimeNotifications({ 
  className,
  maxNotifications = 5,
  autoHide = true,
  autoHideDelay = 10000
}: NotificationsProps) {
  const { isConnected, notifications: wsNotifications } = useWebSocket({
    autoConnect: true,
    reconnectInterval: 3000
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Process WebSocket notifications
  useEffect(() => {
    wsNotifications.forEach(wsNotification => {
      const notification: Notification = {
        id: `${Date.now()}-${Math.random()}`,
        type: wsNotification.type as Notification['type'],
        title: wsNotification.title,
        message: wsNotification.message,
        timestamp: Date.now(),
        read: false,
        priority: 'medium',
        data: wsNotification.data
      };

      setNotifications(prev => {
        const updated = [notification, ...prev].slice(0, maxNotifications);
        return updated;
      });

      setUnreadCount(prev => prev + 1);

      // Auto-hide notification
      if (autoHide) {
        setTimeout(() => {
          removeNotification(notification.id);
        }, autoHideDelay);
      }
    });
  }, [wsNotifications, maxNotifications, autoHide, autoHideDelay]);

  const removeNotification = (id: string) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(count => Math.max(0, count - 1));
      }
      return prev.filter(n => n.id !== id);
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => {
        if (notification.id === id && !notification.read) {
          setUnreadCount(count => Math.max(0, count - 1));
          return { ...notification, read: true };
        }
        return notification;
      })
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: Notification['type'], priority: Notification['priority']) => {
    switch (type) {
      case 'price_alert':
        return priority === 'high' ? 
          <TrendingUp className="w-4 h-4 text-green-400" /> : 
          <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'transaction':
        return <CheckCircle className="w-4 h-4 text-blue-400" />;
      case 'portfolio':
        return <Info className="w-4 h-4 text-purple-400" />;
      case 'system':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default:
        return <Bell className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-red-500/50 bg-red-900/20';
      case 'medium':
        return 'border-yellow-500/50 bg-yellow-900/20';
      case 'low':
        return 'border-blue-500/50 bg-blue-900/20';
      default:
        return 'border-gray-500/50 bg-gray-900/20';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 60000) {
      return 'Just now';
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`;
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h ago`;
    } else {
      return new Date(timestamp).toLocaleDateString();
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <Card className={cn('p-4 bg-gray-900/95 border-gray-700 backdrop-blur-sm', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {unreadCount}
            </Badge>
          )}
          {!isConnected && (
            <Badge variant="outline" className="text-xs text-gray-400">
              Offline
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-gray-400 hover:text-white"
            >
              Mark all read
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-xs text-gray-400 hover:text-white"
          >
            Clear all
          </Button>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={cn(
              'p-3 rounded-lg border transition-all duration-300 cursor-pointer',
              getPriorityColor(notification.priority),
              !notification.read && 'ring-1 ring-blue-500/30',
              'hover:bg-opacity-80'
            )}
            onClick={() => markAsRead(notification.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-0.5">
                  {getNotificationIcon(notification.type, notification.priority)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={cn(
                      'text-sm font-medium truncate',
                      notification.read ? 'text-gray-300' : 'text-white'
                    )}>
                      {notification.title}
                    </h4>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                    )}
                  </div>
                  
                  <p className={cn(
                    'text-sm break-words',
                    notification.read ? 'text-gray-400' : 'text-gray-200'
                  )}>
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(notification.timestamp)}
                    </span>
                    
                    <Badge 
                      variant="outline" 
                      className={cn(
                        'text-xs',
                        notification.priority === 'high' && 'border-red-500/50 text-red-400',
                        notification.priority === 'medium' && 'border-yellow-500/50 text-yellow-400',
                        notification.priority === 'low' && 'border-blue-500/50 text-blue-400'
                      )}
                    >
                      {notification.type.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(notification.id);
                }}
                className="text-gray-400 hover:text-white p-1 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}