import { useRef, useEffect, useState } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';

export default function VideoCall({ socket, peerId, incomingCall, onEnd }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const { localStream, remoteStream, startCall, answerCall, endCall } = useWebRTC(socket);
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

  // Auto-answer when this component mounts for an incoming call
  useEffect(() => {
    if (!incomingCall) return;
    setCalling(true);
    answerCall(incomingCall.offer, incomingCall.fromId)
      .catch((err) => setCallError(err?.message || 'Could not answer call.'))
      .finally(() => setCalling(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleStart() {
    setCallError(null);
    setCalling(true);
    try {
      await startCall(peerId);
    } catch (err) {
      setCallError(err?.message || 'Could not start call.');
    } finally {
      setCalling(false);
    }
  }

  function handleEnd() {
    endCall();
    onEnd?.();
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
        {!incomingCall && (
          <button
            onClick={handleStart}
            disabled={!socket || !peerId || calling}
            className="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
          >
            {calling ? 'Starting…' : 'Start Call'}
          </button>
        )}
        {incomingCall && calling && (
          <span className="px-4 py-2 text-sm text-zinc-500">Connecting…</span>
        )}
        <button onClick={handleEnd} className="px-4 py-2 bg-destructive text-destructive-foreground rounded">
          End Call
        </button>
      </div>
    </div>
  );
}
