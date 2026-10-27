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
  Sparkles,
  RefreshCw
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

// Low-latency public Google STUN and OpenRelay TURN servers for NAT traversal
const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
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
  ],
  iceCandidatePoolSize: 10
};

// Safe ID generator that never fails in insecure/older mobile contexts
const generateId = () => {
  return 'id_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
};

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

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome_msg',
      sender: 'System Telemedicine',
      role: 'system',
      text: `Encrypted WebRTC consultation active for room ${meetingId}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const currentAppointment = appointments.find(a => a.meetingId === meetingId) || appointments[0];
  const otherPartyName = userRole === 'doctor'
    ? (currentAppointment?.patientName || 'Sarah Jenkins')
    : (currentAppointment?.doctorName || 'Dr. Rajesh Sharma');

  const otherPartyRole = userRole === 'doctor' ? 'Patient' : 'Doctor';

  const [consultationNotes, setConsultationNotes] = useState(
    currentAppointment?.consultationNotes || 'Patient consultation in progress. Vitals and condition reviewed.'
  );

  const displayName = currentUser?.displayName || (userRole === 'doctor' ? 'Dr. Rajesh Sharma' : 'Patient');

  // Timer
  useEffect(() => {
    let interval: any = null;
    if (connectionStatus === 'connected') {
      interval = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [connectionStatus]);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getMeetingUrl = () => {
    const base = window.location.origin + window.location.pathname;
    return `${base}?meeting=${encodeURIComponent(meetingId)}`;
  };

  const bindLocalVideo = (stream: MediaStream) => {
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.muted = true;
      localVideoRef.current.play().catch(() => undefined);
    }
  };

  // Main WebRTC Lifecycle & Firestore Signaling Handshake
  useEffect(() => {
    let isCancelled = false;
    const unsubscribers: Array<() => void> = [];
    let localStream: MediaStream | null = null;
    let pc: RTCPeerConnection | null = null;

    const setupCall = async () => {
      // 1. Acquire Local Camera and Microphone
      try {
        localStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: { echoCancellation: true, noiseSuppression: true }
        });
        setCameraError(null);
      } catch (err: any) {
        console.warn('Primary getUserMedia warning:', err);
        try {
          // Fallback to audio-only if video blocked
          localStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          setCameraError('Camera was unavailable or blocked. Continuing with live audio.');
          setIsVideoOn(false);
        } catch (audioErr: any) {
          console.warn('Audio fallback also failed:', audioErr);
          setCameraError('Camera and microphone blocked. Please allow browser permissions.');
          localStream = new MediaStream();
        }
      }

      if (isCancelled) {
        localStream.getTracks().forEach(t => t.stop());
        return;
      }

      localStreamRef.current = localStream;
      bindLocalVideo(localStream);

      // 2. Initialize WebRTC Peer Connection
      pc = new RTCPeerConnection(RTC_CONFIG);
      peerConnectionRef.current = pc;

      // Add local tracks to PeerConnection
      localStream.getTracks().forEach(track => {
        pc!.addTrack(track, localStream!);
      });

      // Handle receiving remote tracks
      const remoteStream = new MediaStream();
      remoteStreamRef.current = remoteStream;

      pc.ontrack = (event) => {
        event.streams[0].getTracks().forEach(track => {
          remoteStream.addTrack(track);
        });
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play().catch(() => undefined);
        }
        setConnectionStatus('connected');
      };

      pc.oniceconnectionstatechange = () => {
        if (pc?.iceConnectionState === 'connected' || pc?.iceConnectionState === 'completed') {
          setConnectionStatus('connected');
        } else if (pc?.iceConnectionState === 'disconnected' || pc?.iceConnectionState === 'failed') {
          setConnectionStatus('waiting');
        }
      };

      if (!db) {
        setCameraError('Firestore database is not connected.');
        return;
      }

      const callDocRef = doc(db, 'calls', meetingId);
      const offerCandidatesCol = collection(db, 'calls', meetingId, 'offerCandidates');
      const answerCandidatesCol = collection(db, 'calls', meetingId, 'answerCandidates');
      const chatCol = collection(db, 'calls', meetingId, 'chat');

      // Candidate queue to ensure candidates arriving before remote description are never dropped
      let isRemoteDescriptionSet = false;
      const candidateQueue: RTCIceCandidateInit[] = [];

      const addCandidateSafely = async (cand: RTCIceCandidateInit) => {
        if (isRemoteDescriptionSet && pc?.remoteDescription) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(cand));
          } catch (e) {
            console.warn('addIceCandidate note:', e);
          }
        } else {
          candidateQueue.push(cand);
        }
      };

      const flushCandidateQueue = async () => {
        isRemoteDescriptionSet = true;
        while (candidateQueue.length > 0) {
          const cand = candidateQueue.shift();
          if (cand && pc) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(cand));
            } catch (e) {
              console.warn('flush candidate note:', e);
            }
          }
        }
      };

      // 3. Inspect existing call state in Firestore
      const callSnap = await getDoc(callDocRef);
      const callData = callSnap.data();

      // Check if there is an active offer from the other participant created recently
      const hasActiveOffer = callSnap.exists() &&
        callData?.offer &&
        !callData?.ended &&
        callData?.status !== 'ended' &&
        callData?.startedBy !== userRole;

      if (hasActiveOffer) {
        // ==========================================
        // 📞 ROLE: CALLEE (Answerer - Patient joins Doctor's call)
        // ==========================================
        const sessionId = callData.sessionId || 'sess_1';

        // Callee sends candidates to answerCandidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            addDoc(answerCandidatesCol, {
              ...event.candidate.toJSON(),
              sessionId
            }).catch(() => undefined);
          }
        };

        // Apply Offer
        await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
        await flushCandidateQueue();

        // Create Answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        await updateDoc(callDocRef, {
          answer: { type: answer.type, sdp: answer.sdp },
          status: 'connected',
          calleeRole: userRole,
          calleeName: displayName,
          updatedAt: new Date().toISOString()
        });

        // Listen for Caller's ICE candidates
        const unsubOfferCand = onSnapshot(offerCandidatesCol, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              if (!data.sessionId || data.sessionId === sessionId) {
                addCandidateSafely(data as RTCIceCandidateInit);
              }
            }
          });
        });
        unsubscribers.push(unsubOfferCand);

        // Listen for call termination
        const unsubCall = onSnapshot(callDocRef, (snap) => {
          const d = snap.data();
          if (d?.ended || d?.status === 'ended') {
            setConnectionStatus('waiting');
          }
        });
        unsubscribers.push(unsubCall);

        setConnectionStatus('waiting');
      } else {
        // ==========================================
        // 📞 ROLE: CALLER (Offerer - Doctor starts the call)
        // ==========================================
        const sessionId = generateId();

        // Caller sends candidates to offerCandidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            addDoc(offerCandidatesCol, {
              ...event.candidate.toJSON(),
              sessionId
            }).catch(() => undefined);
          }
        };

        // Create Offer
        const offer = await pc.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        });
        await pc.setLocalDescription(offer);

        await setDoc(callDocRef, {
          meetingId,
          sessionId,
          status: 'ringing',
          startedBy: userRole,
          startedByName: displayName,
          callerRole: userRole,
          callerName: displayName,
          offer: { type: offer.type, sdp: offer.sdp },
          answer: null,
          ended: false,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString()
        });

        // Listen for Callee's Answer
        const unsubCall = onSnapshot(callDocRef, async (snap) => {
          const d = snap.data();
          if (d?.answer && pc && !pc.currentRemoteDescription) {
            await pc.setRemoteDescription(new RTCSessionDescription(d.answer));
            await flushCandidateQueue();
            setConnectionStatus('connected');
          }
          if (d?.ended || d?.status === 'ended') {
            setConnectionStatus('waiting');
          }
        });
        unsubscribers.push(unsubCall);

        // Listen for Callee's ICE candidates
        const unsubAnsCand = onSnapshot(answerCandidatesCol, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data();
              if (!data.sessionId || data.sessionId === sessionId) {
                addCandidateSafely(data as RTCIceCandidateInit);
              }
            }
          });
        });
        unsubscribers.push(unsubAnsCand);

        setConnectionStatus('waiting');
      }

      // 4. In-Call Chat Synchronizer
      const unsubChat = onSnapshot(chatCol, (snapshot) => {
        const msgs: ChatMsg[] = snapshot.docs
          .map(d => ({
            id: d.id,
            ...d.data()
          } as ChatMsg))
          .filter(m => m.text);

        if (msgs.length > 0) {
          setChatMessages(prev => {
            const system = prev.filter(m => m.role === 'system');
            const ids = new Set(system.map(m => m.id));
            return [...system, ...msgs.filter(m => !ids.has(m.id))];
          });
        }
      });
      unsubscribers.push(unsubChat);
    };

    setupCall();

    return () => {
      isCancelled = true;
      unsubscribers.forEach(u => u());
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
      }
      if (pc) {
        pc.close();
      }
    };
  }, [meetingId, userRole, displayName]);

  // Controls: Mute Microphone
  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMicOn(prev => !prev);
    }
  };

  // Controls: Pause Camera
  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(prev => !prev);
    }
  };

  // Controls: Flip Camera (Front / Back on Mobile)
  const flipCamera = async () => {
    if (!localStreamRef.current) return;
    try {
      const currentTrack = localStreamRef.current.getVideoTracks()[0];
      const currentMode = currentTrack.getSettings().facingMode;
      const nextMode = currentMode === 'environment' ? 'user' : 'environment';

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: nextMode } },
        audio: false
      });
      const newTrack = newStream.getVideoTracks()[0];

      if (peerConnectionRef.current) {
        const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(newTrack);
        }
      }

      currentTrack.stop();
      localStreamRef.current.removeTrack(currentTrack);
      localStreamRef.current.addTrack(newTrack);
      bindLocalVideo(localStreamRef.current);
    } catch (e) {
      console.warn('Flip camera note:', e);
    }
  };

  // Controls: Screen Share
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Revert back to webcam
      try {
        const camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        const camTrack = camStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(camTrack);
        if (localStreamRef.current) {
          const old = localStreamRef.current.getVideoTracks()[0];
          if (old) old.stop();
          localStreamRef.current.removeTrack(old);
          localStreamRef.current.addTrack(camTrack);
          bindLocalVideo(localStreamRef.current);
        }
        setIsScreenSharing(false);
      } catch (e) {
        console.warn(e);
      }
      return;
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = peerConnectionRef.current?.getSenders().find(s => s.track?.kind === 'video');
      if (sender) sender.replaceTrack(screenTrack);
      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;

      screenTrack.onended = () => {
        setIsScreenSharing(false);
        if (localStreamRef.current) bindLocalVideo(localStreamRef.current);
      };
      setIsScreenSharing(true);
    } catch (err) {
      console.warn('Screen share note:', err);
    }
  };

  // End Call
  const handleEndCallInternal = async () => {
    if (currentAppointment) {
      updateAppointmentStatus(currentAppointment.appointmentId, 'completed', consultationNotes);
    }
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    peerConnectionRef.current?.close();

    if (db) {
      try {
        await updateDoc(doc(db, 'calls', meetingId), {
          status: 'ended',
          ended: true,
          updatedAt: new Date().toISOString()
        });
      } catch (e) {
        console.warn('End call update note:', e);
      }
    }
    onEndCall();
  };

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(getMeetingUrl());
    setCopiedMeetingLink(true);
    setTimeout(() => setCopiedMeetingLink(false), 2500);
  };

  const handleSendMessage = async () => {
    if (!inputMsg.trim()) return;
    const newMsg = {
      sender: displayName,
      role: userRole,
      text: inputMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: serverTimestamp()
    };
    setInputMsg('');
    if (db) {
      addDoc(collection(db, 'calls', meetingId, 'chat'), newMsg).catch(() => undefined);
    }
  };

  const isConnected = connectionStatus === 'connected';

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col text-white animate-fade-in font-sans select-none">
      {/* 🔝 HEADER BAR */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
            <Video className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-sm text-white">Live Video Consultation</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-bold flex items-center gap-1.5 ${
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
      </header>

      {/* Permissions / Notice banner */}
      {cameraError && (
        <div className="bg-amber-950/80 border-b border-amber-800/80 px-6 py-2 text-xs text-amber-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* 📹 MAIN STAGE & SIDE PANEL */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* LEFT: VIDEO STAGE */}
        <div className="lg:col-span-8 bg-slate-900 p-4 sm:p-6 flex flex-col justify-between relative border-r border-slate-800">
          <div className="relative flex-1 rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center">
            {/* 🌟 REMOTE VIDEO FEED (FULL SCREEN WHEN CONNECTED) */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover ${isConnected ? 'block' : 'hidden'}`}
            />

            {/* ⏳ WAITING SCREEN (SHOWS LOCAL CAMERA IN FULL STAGE) */}
            {!isConnected && (
              <div className="relative w-full h-full">
                <video
                  ref={localVideoRef}
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
                      <span>Your camera is live — waiting for {otherPartyName}</span>
                    </div>
                    <h3 className="text-2xl font-black text-white">
                      {userRole === 'doctor' ? `Calling ${otherPartyName}...` : `Connecting to ${otherPartyName}...`}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Stay in this room. When the {otherPartyRole.toLowerCase()} opens the same video appointment, the two-way live video and audio will connect automatically.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Remote Peer Name Badge (when connected) */}
            {isConnected && (
              <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-2 shadow-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span>{otherPartyName} ({otherPartyRole})</span>
              </div>
            )}

            {/* 👤 LOCAL PICTURE-IN-PICTURE (WHEN CONNECTED TO REMOTE PEER) */}
            {isConnected && (
              <div className="absolute bottom-4 right-4 w-44 sm:w-56 h-32 sm:h-40 rounded-2xl overflow-hidden border-2 border-emerald-500/80 shadow-2xl bg-slate-900 z-10">
                <video
                  ref={localVideoRef}
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

          {/* 🎛️ CONTROLS BAR */}
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={toggleMic}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                isMicOn
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
              }`}
              title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
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
              title={isVideoOn ? 'Turn Camera Off' : 'Turn Camera On'}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              onClick={flipCamera}
              className="w-12 h-12 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-lg"
              title="Flip Camera (Front/Rear on Mobile)"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <button
              onClick={toggleScreenShare}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                isScreenSharing
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
              title={isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
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

        {/* RIGHT: TABS (CHAT, NOTES, PATIENT INFO) */}
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
              <span>Patient Info</span>
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto text-xs">
            {/* TAB 1: REAL-TIME IN-CALL CHAT */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full justify-between space-y-4">
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {chatMessages.map((msg) => (
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
                        <span className={msg.role === 'doctor' ? 'text-emerald-400' : 'text-sky-400'}>
                          {msg.sender}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{msg.time}</span>
                      </div>
                      <p className="text-slate-200">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    placeholder="Type in encrypted call..."
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
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

            {/* TAB 2: DOCTOR CLINICAL NOTES */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="font-bold text-white text-xs block">
                    Clinical Examination & Prescription
                  </label>
                  <textarea
                    rows={10}
                    value={consultationNotes}
                    onChange={(e) => setConsultationNotes(e.target.value)}
                    readOnly={userRole !== 'doctor'}
                    placeholder="Doctor records clinical observations, diagnosis, and medications..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {userRole === 'doctor' ? (
                  <p className="text-[11px] text-emerald-400">
                    ✓ Clinical notes will automatically be saved to the appointment upon ending the consultation.
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    ℹ️ You can view doctor's official clinical notes and prescription summary in real time.
                  </p>
                )}
              </div>
            )}

            {/* TAB 3: PATIENT CONDITION FILE */}
            {activeTab === 'patient_info' && (
              <div className="space-y-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-slate-400">Patient:</span>
                  <span className="font-bold text-white">
                    {currentAppointment?.patientName || 'Sarah Jenkins'}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-slate-400">Blood Group:</span>
                  <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-400 font-black border border-rose-500/40 rounded-lg">
                    {currentAppointment?.patientBloodGroup || medicalProfile.bloodGroup || 'O+'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Chief Reason:</span>
                  <p className="text-white bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                    {currentAppointment?.reason || 'Chest Tightness Follow-up & ECG Check'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Reported Condition:</span>
                  <p className="text-white bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                    {currentAppointment?.patientCondition || 'Mild Asthma, Exertional Chest Tightness'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Allergies:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(currentAppointment?.patientAllergies || medicalProfile.allergies).map((a, i) => (
                      <span key={i} className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded text-[11px] font-semibold">
                        ⚠️ {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Medications:</span>
                  <p className="text-white bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                    {(currentAppointment?.patientMedications || medicalProfile.medications).join(', ')}
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
