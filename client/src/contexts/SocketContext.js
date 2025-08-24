import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Create socket connection
    const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
      auth: {
        token
      },
      transports: ['websocket', 'polling']
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
      
      // Join user's personal room
      newSocket.emit('join-user', user.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    // Challenge events
    newSocket.on('new-challenge', (data) => {
      if (data.challenger !== user.id) {
        toast.success(`New ${data.game} challenge available!`, {
          icon: '🎮',
        });
      }
    });

    newSocket.on('challenge-accepted', (data) => {
      toast.success('Your challenge has been accepted!', {
        icon: '✅',
      });
    });

    newSocket.on('match-update', (data) => {
      toast.success('Match status updated!', {
        icon: '⚡',
      });
    });

    // Helpline events
    newSocket.on('helpline-response', (data) => {
      toast.success('New message from support!', {
        icon: '💬',
      });
    });

    // Withdrawal events
    newSocket.on('withdrawal-updated', (data) => {
      toast.success(data.message, {
        icon: '💰',
      });
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user, token]);

  // Socket methods
  const emit = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  };

  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const value = {
    socket,
    connected,
    emit,
    on,
    off,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
