import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket(url) {
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = io(url, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = s;
    setSocket(s);
    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));

    return () => s.disconnect();
  }, [url]);

  return { socket, connected };
}
