import { useRef, useEffect, useState } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';

export default function VideoCall({ socket, peerId }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const { localStream, remoteStream, startCall, endCall } = useWebRTC();
  const [callError, setCallError] = useState(null);
  const [calling, setCalling] = useState(false);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  async function handleStart() {
    setCallError(null);
    setCalling(true);
    try {
      await startCall(socket, peerId);
    } catch (err) {
      setCallError(err?.message || 'Could not start call.');
    } finally {
      setCalling(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-4">
        <video ref={localVideoRef} autoPlay muted className="w-1/2 rounded border" />
        <video ref={remoteVideoRef} autoPlay className="w-1/2 rounded border" />
      </div>
      {callError && (
        <p className="text-sm text-red-500">{callError}</p>
      )}
      <div className="flex gap-2">
        <button
          onClick={handleStart}
          disabled={!socket || !peerId || calling}
          className="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
        >
          {calling ? 'Starting…' : 'Start Call'}
        </button>
        <button onClick={endCall} className="px-4 py-2 bg-destructive text-destructive-foreground rounded">
          End Call
        </button>
      </div>
    </div>
  );
}
