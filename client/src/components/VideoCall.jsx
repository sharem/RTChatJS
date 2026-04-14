import { useRef } from 'react';
import { useWebRTC } from '../hooks/useWebRTC';

export default function VideoCall({ socket, peerId }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const { localStream, remoteStream, startCall, endCall } = useWebRTC();

  function handleStart() {
    startCall(socket, peerId);
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }

  if (remoteStream && remoteVideoRef.current) {
    remoteVideoRef.current.srcObject = remoteStream;
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-4">
        <video ref={localVideoRef} autoPlay muted className="w-1/2 rounded border" />
        <video ref={remoteVideoRef} autoPlay className="w-1/2 rounded border" />
      </div>
      <div className="flex gap-2">
        <button onClick={handleStart} className="px-4 py-2 bg-primary text-primary-foreground rounded">
          Start Call
        </button>
        <button onClick={endCall} className="px-4 py-2 bg-destructive text-destructive-foreground rounded">
          End Call
        </button>
      </div>
    </div>
  );
}
