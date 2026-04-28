import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket(url) {
  const socket = useMemo(
    () =>
      io(url, {
        autoConnect: false,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }),
    [url],
  );
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.disconnect();
    };
  }, [socket]);

  return { socket, connected };
}
