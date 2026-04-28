import { useEffect, useRef, useState } from 'react';

export function useWebRTC(socket) {
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  useEffect(() => {
    if (!socket) return;

    async function handleAnswer(payload) {
      if (!payload || typeof payload !== 'object') return;
      const { answer } = payload;
      if (peerRef.current) {
        try {
          await peerRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (error) {
          console.error('Failed to set remote description from answer event:', error);
        }
      }
    }

    async function handleIceCandidate(payload) {
      if (!payload || typeof payload !== 'object') return;
      const { candidate } = payload;
      if (peerRef.current && candidate) {
        try {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error('Failed to add ICE candidate:', error);
        }
      }
    }

    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);

    return () => {
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
    };
  }, [socket]);

  async function startCall(targetId) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
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

  async function answerCall(offer, fromId) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
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
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
  }

  useEffect(() => () => {
    peerRef.current?.close();
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  return { localStream, remoteStream, startCall, answerCall, endCall };
}
