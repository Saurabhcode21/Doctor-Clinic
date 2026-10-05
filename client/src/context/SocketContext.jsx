import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { playChime, playYourTurnAlert } from '../utils/audio';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [queueStatus, setQueueStatus] = useState({
    currentToken: 'A-021',
    currentPatient: null,
    totalToday: 0,
    waitingCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    queueList: []
  });
  const [lastNotification, setLastNotification] = useState(null);

  useEffect(() => {
    // In dev with Vite proxy or production
    const socketUrl = window.location.origin;
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      timeout: 10000
    });

    newSocket.on('connect', () => {
      console.log('Connected to Clinic Realtime Queue Socket');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Clinic Socket');
      setConnected(false);
    });

    newSocket.on('queue:status', (data) => {
      setQueueStatus(data);
    });

    newSocket.on('queue:updated', (data) => {
      console.log('Realtime Queue update received:', data.action);
      if (data.queue) {
        setQueueStatus(data.queue);
      }
      if (data.action === 'call_next') {
        playChime();
      }
    });

    newSocket.on('queue:announce', (data) => {
      playChime();
      setLastNotification(`Now Calling Token ${data.currentToken}`);
    });

    newSocket.on('patient:called', (data) => {
      playYourTurnAlert();
      setLastNotification(`🔔 It's your turn! (Token ${data.tokenNumber})`);
    });

    setSocket(newSocket);

    // Initial fetch from REST as backup
    fetch('/api/queue/status')
      .then(res => res.json())
      .then(data => {
        if (data && data.currentToken) {
          setQueueStatus(data);
        }
      })
      .catch(err => console.log('REST queue fetch note:', err));

    return () => {
      newSocket.close();
    };
  }, []);

  const refreshQueue = async () => {
    try {
      const res = await fetch('/api/queue/status');
      const data = await res.json();
      setQueueStatus(data);
    } catch (e) {
      console.error('Queue refresh error:', e);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, connected, queueStatus, lastNotification, refreshQueue }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
