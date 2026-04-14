import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket(url) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = io(url, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(s);
    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));

    return () => s.disconnect();
  }, [url]);

  return { socket, connected };
}
