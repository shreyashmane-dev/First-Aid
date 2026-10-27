import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebase';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  addDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Send,
  ScreenShare,
  Activity,
  FileText,
  MessageSquare,
  Copy,
  Check,
  AlertCircle,
  Sparkles
} from 'lucide-react';

interface VideoConsultationRoomProps {
  meetingId: string;
  onEndCall: () => void;
}

interface ChatMsg {
  id: string;
  sender: string;
  role: string;
  text: string;
  time: string;
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
  {
    urls: [
      'turn:openrelay.metered.ca:80',
      'turn:openrelay.metered.ca:443',
      'turn:openrelay.metered.ca:443?transport=tcp'
    ],
    username: 'openrelayproject',
    credential: 'openrelayproject'
  }
];

export const VideoConsultationRoom: React.FC<VideoConsultationRoomProps> = ({ meetingId, onEndCall }) => {
  const { userRole, currentUser } = useAuth();
  const { medicalProfile, updateAppointmentStatus, appointments } = useApp();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'patient_info'>('chat');
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'initializing' | 'waiting' | 'connected'>('initializing');
  const [copiedMeetingLink, setCopiedMeetingLink] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [remoteName, setRemoteName] = useState<string>('');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const peerIdRef = useRef<string>(crypto.randomUUID());
  const makingOfferRef = useRef(false);
  const isPoliteRef = useRef(false);

  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome_msg',
      sender: 'System',
      role: 'system',
      text: `Live video room ready. Meeting ID: ${meetingId}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const currentAppointment = appointments.find(a => a.meetingId === meetingId) || appointments[0];
  const [consultationNotes, setConsultationNotes] = useState(
    currentAppointment?.consultationNotes || 'Patient consultation in progress. Vitals and condition reviewed.'
  );

  const displayName = currentUser?.displayName || (userRole === 'doctor' ? 'Doctor' : 'Patient');

  useEffect(() => {
    const timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getMeetingUrl = () => {
    const base = window.location.origin + window.location.pathname;
    return `${base}?meeting=${encodeURIComponent(meetingId)}`;
  };

  const bindLocalVideo = () => {
    const el = localVideoRef.current;
    if (el && localStreamRef.current) {
      el.srcObject = localStreamRef.current;
      el.muted = true;
      el.play().catch(() => undefined);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const unsubscribers: Array<() => void> = [];
    const peerId = peerIdRef.current;
    const pendingIce: RTCIceCandidateInit[] = [];
    let heartbeat: number | null = null;
    let ignoreOffer = false;

    const flushIce = async (pc: RTCPeerConnection) => {
      while (pendingIce.length > 0) {
        const candidate = pendingIce.shift();
        if (candidate) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
          } catch (err) {
            console.warn('ICE add note:', err);
          }
        }
      }
    };

    const setup = async () => {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: { echoCancellation: true, noiseSuppression: true }
        });
        setCameraError(null);
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          setCameraError('Camera permission was denied. Audio is live — allow camera and rejoin for video.');
          setIsVideoOn(false);
        } catch {
          setCameraError('Microphone and camera are blocked. Allow permissions in the browser, then rejoin the call.');
          stream = new MediaStream();
        }
      }

      if (cancelled) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      localStreamRef.current = stream;
      bindLocalVideo();

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS, iceCandidatePoolSize: 10 });
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      pc.ontrack = event => {
        const remote = event.streams[0];
        if (!remote) return;
        remoteStreamRef.current = remote;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remote;
          remoteVideoRef.current.play().catch(() => undefined);
        }
        setConnectionStatus('connected');
      };

      if (!db) {
        setCameraError('Firebase is not connected, so the other person cannot join this room.');
        setConnectionStatus('waiting');
        return;
      }

      const callDocRef = doc(db, 'calls', meetingId);
      const peerDocRef = doc(db, 'calls', meetingId, 'peers', peerId);
      const iceCol = collection(db, 'calls', meetingId, 'ice');
      const chatCol = collection(db, 'calls', meetingId, 'chat');

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          setConnectionStatus('connected');
          updateDoc(callDocRef, { status: 'connected', updatedAt: new Date().toISOString() }).catch(() => undefined);
        } else if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
          setConnectionStatus('waiting');
        }
      };

      const existingCall = await getDoc(callDocRef);
      const existingData = existingCall.data();
      const shouldReset = !existingCall.exists() || existingData?.ended || existingData?.status === 'ended';

      await setDoc(callDocRef, {
        status: 'ringing',
        startedBy: existingData?.startedBy && !shouldReset ? existingData.startedBy : userRole,
        startedByName: existingData?.startedByName && !shouldReset ? existingData.startedByName : displayName,
        startedByPeerId: existingData?.startedByPeerId && !shouldReset ? existingData.startedByPeerId : peerId,
        meetingId,
        updatedAt: new Date().toISOString(),
        ended: false,
        ...(shouldReset ? { offer: null, answer: null, offererPeerId: null } : {})
      }, { merge: true });

      await setDoc(peerDocRef, {
        peerId,
        role: userRole,
        name: displayName,
        joinedAt: Date.now(),
        aliveAt: Date.now()
      });

      heartbeat = window.setInterval(() => {
        updateDoc(peerDocRef, { aliveAt: Date.now() }).catch(() => undefined);
      }, 4000);

      pc.onicecandidate = event => {
        if (!event.candidate) return;
        addDoc(iceCol, { ...event.candidate.toJSON(), from: peerId }).catch(() => undefined);
      };

      const createOfferIfNeeded = async () => {
        if (makingOfferRef.current || pc.currentRemoteDescription || pc.signalingState !== 'stable') return;
        try {
          makingOfferRef.current = true;
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await setDoc(callDocRef, {
            offer: { type: offer.type, sdp: offer.sdp },
            offererPeerId: peerId,
            answer: null,
            status: 'ringing',
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.warn('Offer note:', err);
        } finally {
          makingOfferRef.current = false;
        }
      };

      unsubscribers.push(onSnapshot(collection(db, 'calls', meetingId, 'peers'), snapshot => {
        const now = Date.now();
        const live = snapshot.docs
          .map(d => d.data() as { peerId: string; name?: string; role?: string; aliveAt?: number })
          .filter(p => now - (p.aliveAt || 0) < 20000);

        const other = live.find(p => p.peerId !== peerId);
        if (other?.name) setRemoteName(other.name);

        const sorted = [...live].map(p => p.peerId).sort();
        isPoliteRef.current = sorted[0] !== peerId;

        if (!other) {
          setConnectionStatus(prev => (prev === 'connected' ? 'waiting' : prev === 'initializing' ? 'waiting' : prev));
          return;
        }

        // The peer with the smaller ID always creates the offer (avoids glare).
        if (!isPoliteRef.current) {
          void createOfferIfNeeded();
        }
      }));

      unsubscribers.push(onSnapshot(callDocRef, async snap => {
        const data = snap.data();
        if (!data || cancelled) return;
        if (data.ended) return;

        const offer = data.offer as RTCSessionDescriptionInit | undefined;
        const answer = data.answer as RTCSessionDescriptionInit | undefined;
        const offererPeerId = data.offererPeerId as string | undefined;

        const offerCollision = makingOfferRef.current || pc.signalingState !== 'stable';

        if (offer && offererPeerId && offererPeerId !== peerId) {
          ignoreOffer = !isPoliteRef.current && offerCollision;
          if (ignoreOffer) return;

          try {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            await flushIce(pc);
            const localAnswer = await pc.createAnswer();
            await pc.setLocalDescription(localAnswer);
            await updateDoc(callDocRef, {
              answer: { type: localAnswer.type, sdp: localAnswer.sdp },
              status: 'connecting',
              updatedAt: new Date().toISOString()
            });
          } catch (err) {
            console.warn('Answer note:', err);
          }
        }

        if (answer && offererPeerId === peerId && pc.signalingState === 'have-local-offer') {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            await flushIce(pc);
          } catch (err) {
            console.warn('Remote answer note:', err);
          }
        }
      }));

      unsubscribers.push(onSnapshot(iceCol, snapshot => {
        snapshot.docChanges().forEach(async change => {
          if (change.type !== 'added') return;
          const data = change.doc.data();
          if (data.from === peerId) return;
          const init: RTCIceCandidateInit = {
            candidate: data.candidate,
            sdpMid: data.sdpMid,
            sdpMLineIndex: data.sdpMLineIndex
          };
          if (pc.remoteDescription) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(init));
            } catch (err) {
              console.warn('ICE note:', err);
            }
          } else {
            pendingIce.push(init);
          }
        });
      }));

      unsubscribers.push(onSnapshot(chatCol, snapshot => {
        const msgs: ChatMsg[] = snapshot.docs
          .map(d => {
            const data = d.data();
            return {
              id: data.id || d.id,
              sender: data.sender,
              role: data.role,
              text: data.text,
              time: data.time
            } as ChatMsg;
          })
          .filter(m => m.text);
        if (msgs.length > 0) {
          setChatMessages(prev => {
            const system = prev.filter(m => m.role === 'system');
            const ids = new Set(system.map(m => m.id));
            return [...system, ...msgs.filter(m => !ids.has(m.id))];
          });
        }
      }));

      setConnectionStatus('waiting');
    };

    setup();

    return () => {
      cancelled = true;
      unsubscribers.forEach(u => u());
      if (heartbeat) window.clearInterval(heartbeat);
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      peerConnectionRef.current?.close();
      if (db) {
        deleteDoc(doc(db, 'calls', meetingId, 'peers', peerIdRef.current)).catch(() => undefined);
      }
    };
  }, [meetingId, userRole, displayName]);

  useEffect(() => {
    bindLocalVideo();
  }, [connectionStatus, isVideoOn]);

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setIsMicOn(prev => !prev);
  };

  const toggleVideo = () => {
    localStreamRef.current?.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
    });
    setIsVideoOn(prev => !prev);
  };

  const stopScreenShare = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === 'video');
    if (sender && videoTrack) sender.replaceTrack(videoTrack);
    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }
    setIsScreenSharing(false);
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
      return;
    }
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === 'video');
      if (sender) await sender.replaceTrack(screenTrack);
      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
      screenTrack.onended = () => stopScreenShare();
      setIsScreenSharing(true);
    } catch (err) {
      console.warn('Screen share cancelled:', err);
    }
  };

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(getMeetingUrl());
    setCopiedMeetingLink(true);
    setTimeout(() => setCopiedMeetingLink(false), 2500);
  };

  const handleSendMessage = async () => {
    if (!inputMsg.trim()) return;
    const newMsg: ChatMsg = {
      id: `chat_${Date.now()}`,
      sender: displayName,
      role: userRole,
      text: inputMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, newMsg]);
    setInputMsg('');
    if (db) {
      addDoc(collection(db, 'calls', meetingId, 'chat'), { ...newMsg, createdAt: serverTimestamp() }).catch(() => undefined);
    }
  };

  const handleEndCallInternal = async () => {
    if (currentAppointment) {
      updateAppointmentStatus(currentAppointment.appointmentId, 'completed', consultationNotes);
    }
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    peerConnectionRef.current?.close();
    if (db) {
      updateDoc(doc(db, 'calls', meetingId), {
        status: 'ended',
        ended: true,
        updatedAt: new Date().toISOString()
      }).catch(() => undefined);
      deleteDoc(doc(db, 'calls', meetingId, 'peers', peerIdRef.current)).catch(() => undefined);
    }
    onEndCall();
  };

  const retryCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: true
      });
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      localStreamRef.current = stream;
      stream.getTracks().forEach(track => {
        const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === track.kind);
        if (sender) sender.replaceTrack(track);
        else peerConnectionRef.current?.addTrack(track, stream);
      });
      bindLocalVideo();
      setCameraError(null);
      setIsVideoOn(true);
      setIsMicOn(true);
    } catch {
      setCameraError('Still unable to open the camera. Check browser permissions and try again.');
    }
  };

  const isConnected = connectionStatus === 'connected';
  const remoteLabel = remoteName
    || (userRole === 'doctor'
      ? `${currentAppointment?.patientName || 'Patient'} (Patient)`
      : `${currentAppointment?.doctorName || 'Doctor'} (${currentAppointment?.doctorSpecialization || 'Specialist'})`);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col text-white animate-fade-in font-sans">
      <div className="h-16 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
            <Video className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-sm text-white">Live Video Consultation</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-bold flex items-center gap-1 ${
                isConnected
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                {isConnected ? 'Connected' : 'Waiting for the other person'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Room ID: <strong className="font-mono text-emerald-300">{meetingId}</strong></span>
              <button
                onClick={copyMeetingLink}
                className="hover:text-white transition-colors cursor-pointer text-[11px] text-emerald-400 flex items-center gap-1"
                title="Copy invite link"
              >
                {copiedMeetingLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMeetingLink ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
              <span>•</span>
              <span className="text-emerald-400 font-mono font-bold">{formatDuration(callDuration)}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleEndCallInternal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer"
        >
          <PhoneOff className="w-4 h-4" />
          <span>End Call</span>
        </button>
      </div>

      {cameraError && (
        <div className="bg-amber-950/80 border-b border-amber-800/80 px-6 py-2 text-xs text-amber-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{cameraError}</span>
          </div>
          <button
            onClick={retryCamera}
            className="shrink-0 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold cursor-pointer"
          >
            Retry camera
          </button>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        <div className="lg:col-span-8 bg-slate-900 p-4 sm:p-6 flex flex-col justify-between relative border-r border-slate-800">
          <div className="relative flex-1 rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover ${isConnected ? 'block' : 'hidden'}`}
            />

            {!isConnected && (
              <div className="relative w-full h-full">
                <video
                  ref={el => {
                    localVideoRef.current = el;
                    if (el && localStreamRef.current) {
                      el.srcObject = localStreamRef.current;
                      el.play().catch(() => undefined);
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isVideoOn ? 'block' : 'hidden'}`}
                />

                {!isVideoOn && (
                  <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center text-slate-500 space-y-2">
                    <VideoOff className="w-12 h-12 text-rose-500" />
                    <span className="text-sm font-bold text-slate-400">Camera is off</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6 sm:p-8 space-y-4">
                  <div className="max-w-xl space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Your camera is live — waiting for the other person</span>
                    </div>
                    <h3 className="text-2xl font-black text-white">
                      {userRole === 'doctor' ? 'Waiting for the patient to join…' : 'Waiting for the doctor to join…'}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Stay in this room. When the {userRole === 'doctor' ? 'patient' : 'doctor'} opens the same video appointment, you will see and hear each other automatically.
                    </p>
                    <button
                      onClick={copyMeetingLink}
                      className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all cursor-pointer"
                    >
                      {copiedMeetingLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedMeetingLink ? 'Copied invite link' : 'Copy invite link'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {isConnected && (
              <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-2 shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{remoteLabel}</span>
              </div>
            )}

            {isConnected && (
              <div className="absolute bottom-4 right-4 w-44 sm:w-56 h-32 sm:h-40 rounded-2xl overflow-hidden border-2 border-emerald-500/80 shadow-2xl bg-slate-900">
                <video
                  ref={el => {
                    localVideoRef.current = el;
                    if (el && localStreamRef.current) {
                      el.srcObject = localStreamRef.current;
                      el.play().catch(() => undefined);
                    }
                  }}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${isVideoOn ? 'block' : 'hidden'}`}
                />
                {!isVideoOn && (
                  <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center text-slate-500 space-y-1">
                    <VideoOff className="w-8 h-8 text-rose-500" />
                    <span className="text-[10px] text-slate-400 font-bold">Camera off</span>
                  </div>
                )}
                <div className="absolute bottom-1.5 left-2 text-[10px] bg-slate-900/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-white font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>You ({displayName})</span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={toggleMic}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                isMicOn
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
              }`}
              title={isMicOn ? 'Mute' : 'Unmute'}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                isVideoOn
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
              }`}
              title={isVideoOn ? 'Turn camera off' : 'Turn camera on'}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>
            <button
              onClick={toggleScreenShare}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                isScreenSharing
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
              title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
            >
              <ScreenShare className="w-5 h-5" />
            </button>
            <button
              onClick={handleEndCallInternal}
              className="px-5 h-12 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-red-600/40 cursor-pointer"
            >
              <PhoneOff className="w-5 h-5" />
              <span>Leave</span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-4 bg-slate-900 flex flex-col h-full border-t lg:border-t-0 border-slate-800">
          <div className="flex items-center border-b border-slate-800 bg-slate-950 p-2 gap-1 text-xs">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'chat' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'notes' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Notes</span>
            </button>
            <button
              onClick={() => setActiveTab('patient_info')}
              className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'patient_info' ? 'bg-slate-800 text-emerald-400 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Patient</span>
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto text-xs">
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full justify-between space-y-4">
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {chatMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-2xl border space-y-1 ${
                        msg.role === 'system'
                          ? 'bg-slate-950/80 border-slate-800 text-slate-400 text-[11px]'
                          : msg.role === userRole
                            ? 'bg-emerald-950/60 border-emerald-800/80 ml-4'
                            : 'bg-slate-800/80 border-slate-700 mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] font-bold">
                        <span className={msg.role === 'doctor' ? 'text-emerald-400' : 'text-sky-400'}>{msg.sender}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{msg.time}</span>
                      </div>
                      <p className="text-slate-200">{msg.text}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    placeholder="Message the other person…"
                    value={inputMsg}
                    onChange={e => setInputMsg(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                <label className="font-bold text-white text-xs block">Clinical notes</label>
                <textarea
                  rows={10}
                  value={consultationNotes}
                  onChange={e => setConsultationNotes(e.target.value)}
                  readOnly={userRole !== 'doctor'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[11px] text-slate-400">
                  {userRole === 'doctor'
                    ? 'Notes are saved to the appointment when you end the call.'
                    : 'You can view the doctor’s notes during the visit.'}
                </p>
              </div>
            )}

            {activeTab === 'patient_info' && (
              <div className="space-y-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-slate-400">Patient:</span>
                  <span className="font-bold text-white">{currentAppointment?.patientName || 'Patient'}</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-slate-400">Blood group:</span>
                  <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-400 font-black border border-rose-500/40 rounded-lg">
                    {currentAppointment?.patientBloodGroup || medicalProfile.bloodGroup || '—'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Reason for call:</span>
                  <p className="text-white bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                    {currentAppointment?.reason || 'Video consultation'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Conditions:</span>
                  <p className="text-white bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                    {currentAppointment?.patientCondition || medicalProfile.medicalConditions.join(', ') || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Allergies:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(currentAppointment?.patientAllergies || medicalProfile.allergies).map((a, i) => (
                      <span key={i} className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[11px] font-semibold">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Medications:</span>
                  <p className="text-white bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                    {(currentAppointment?.patientMedications || medicalProfile.medications).join(', ') || '—'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
