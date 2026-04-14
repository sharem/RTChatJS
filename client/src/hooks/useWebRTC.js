import { useEffect, useRef, useState } from 'react';

export function useWebRTC() {
  const peerRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  async function startCall(socket, targetId) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);

    peerRef.current = new RTCPeerConnection();
    stream.getTracks().forEach((track) => peerRef.current.addTrack(track, stream));

    peerRef.current.ontrack = (event) => setRemoteStream(event.streams[0]);
    peerRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { to: targetId, candidate: event.candidate });
      }
    };

    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);
    socket.emit('offer', { to: targetId, offer });
  }

  async function answerCall(socket, offer, fromId) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);

    peerRef.current = new RTCPeerConnection();
    stream.getTracks().forEach((track) => peerRef.current.addTrack(track, stream));

    peerRef.current.ontrack = (event) => setRemoteStream(event.streams[0]);
    peerRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', { to: fromId, candidate: event.candidate });
      }
    };

    await peerRef.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerRef.current.createAnswer();
    await peerRef.current.setLocalDescription(answer);
    socket.emit('answer', { to: fromId, answer });
  }

  function endCall() {
    peerRef.current?.close();
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
    setRemoteStream(null);
  }

  return { localStream, remoteStream, startCall, answerCall, endCall };
}
