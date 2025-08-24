import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { helplineAPI } from '../services/api';

const HelplineContext = createContext();

export const useHelpline = () => {
  const context = useContext(HelplineContext);
  if (!context) {
    throw new Error('useHelpline must be used within a HelplineProvider');
  }
  return context;
};

export const HelplineProvider = ({ children }) => {
  const { user } = useAuth();
  const { socket, on, off } = useSocket();
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Load messages on mount
  useEffect(() => {
    if (user) {
      loadMessages();
    }
  }, [user]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
      if (message.isFromAdmin) {
        setUnreadCount(prev => prev + 1);
      }
    };

    on('helpline-response', handleNewMessage);

    return () => {
      off('helpline-response', handleNewMessage);
    };
  }, [socket, on, off]);

  // Load messages
  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await helplineAPI.getMessages();
      setMessages(response);
      
      // Count unread messages
      const unread = response.filter(msg => msg.isFromAdmin && !msg.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async (message, messageType = 'text', attachment = null) => {
    try {
      const response = await helplineAPI.sendMessage(message, messageType, attachment);
      setMessages(prev => [...prev, response]);
      return response;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  };

  // Mark messages as read
  const markAsRead = async () => {
    try {
      await helplineAPI.markAsRead();
      setMessages(prev => 
        prev.map(msg => 
          msg.isFromAdmin && !msg.isRead 
            ? { ...msg, isRead: true, readAt: new Date() }
            : msg
        )
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  // Clear messages
  const clearMessages = () => {
    setMessages([]);
    setUnreadCount(0);
  };

  const value = {
    messages,
    unreadCount,
    loading,
    sendMessage,
    markAsRead,
    clearMessages,
    loadMessages,
  };

  return (
    <HelplineContext.Provider value={value}>
      {children}
    </HelplineContext.Provider>
  );
};
