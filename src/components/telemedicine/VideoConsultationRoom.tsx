import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
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
  AlertCircle
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

export const VideoConsultationRoom: React.FC<VideoConsultationRoomProps> = ({ meetingId, onEndCall }) => {
  const { userRole, currentUser } = useAuth();
  const { medicalProfile, updateAppointmentStatus, appointments } = useApp();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'patient_info'>('chat');
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'initializing' | 'waiting' | 'connected'>('initializing');
  const [copiedMeetingId, setCopiedMeetingId] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Video element references
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // WebRTC references
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  // Chat & Notes state
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome_msg',
      sender: 'System Telemedicine Bot',
      role: 'system',
      text: `Encrypted WebRTC consultation room established. Meeting ID: ${meetingId}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const currentAppointment = appointments.find(a => a.meetingId === meetingId) || appointments[0];
  const [consultationNotes, setConsultationNotes] = useState(
    currentAppointment?.consultationNotes || 'Patient consultation in progress. Vitals reviewed.'
  );

  // Call timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Initialize Real Video Capture & WebRTC Signaling
  useEffect(() => {
    let isCancelled = false;

    // Helper to generate simulated video canvas if real webcam is not available or blocked
    const createSimulatedMediaStream = (): MediaStream => {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d')!;
      let frame = 0;

      const draw = () => {
        frame++;
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, '#022c22');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        const radius = 40 + Math.sin(frame * 0.05) * 8;
        ctx.arc(canvas.width / 2, canvas.height / 2 - 20, radius, 0, Math.PI * 2);
        ctx.fillStyle = userRole === 'doctor' ? '#10b981' : '#0ea5e9';
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(currentUser?.displayName || (userRole === 'doctor' ? 'Dr. Rajesh Sharma' : 'Patient'), canvas.width / 2, canvas.height / 2 + 50);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px system-ui, sans-serif';
        ctx.fillText('Live Telemedicine Video Feed', canvas.width / 2, canvas.height / 2 + 75);

        requestAnimationFrame(draw);
      };
      draw();

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const dest = audioCtx.createMediaStreamDestination();

      const videoStream = canvas.captureStream(25);
      const combinedStream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...dest.stream.getAudioTracks()
      ]);
      return combinedStream;
    };

    const setupMediaAndWebRTC = async () => {
      let stream: MediaStream;

      try {
        // Attempt real user webcam and microphone
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user'
          },
          audio: true
        });
        setCameraError(null);
      } catch (err: any) {
        console.warn('Real webcam not found or permission denied, using live synthetic canvas stream:', err);
        setCameraError('Webcam unavailable or permission blocked. Using live simulated video feed.');
        stream = createSimulatedMediaStream();
      }

      if (isCancelled) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Initialize WebRTC RTCPeerConnection
      const configuration: RTCConfiguration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      };

      const pc = new RTCPeerConnection(configuration);
      peerConnectionRef.current = pc;

      // Add local tracks to WebRTC peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      // Handle receiving remote tracks
      pc.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          remoteStreamRef.current = event.streams[0];
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = event.streams[0];
          }
          setConnectionStatus('connected');
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'connected') {
          setConnectionStatus('connected');
        } else if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
          setConnectionStatus('waiting');
        }
      };

      // Set up BroadcastChannel for peer communication between tabs/windows on the same meeting ID
      const channelName = `firstaid_video_${meetingId}`;
      const channel = new BroadcastChannel(channelName);
      broadcastChannelRef.current = channel;

      // Listen for ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          channel.postMessage({
            type: 'ice-candidate',
            candidate: event.candidate,
            senderRole: userRole
          });
        }
      };

      // Handle signaling messages over BroadcastChannel
      channel.onmessage = async (event) => {
        const data = event.data;
        if (!data || data.senderRole === userRole) return;

        try {
          if (data.type === 'peer-joined') {
            setConnectionStatus('connected');
            // If we are doctor or first peer, create offer
            if (userRole === 'doctor') {
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              channel.postMessage({
                type: 'offer',
                sdp: offer,
                senderRole: userRole
              });
            }
          } else if (data.type === 'offer') {
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            channel.postMessage({
              type: 'answer',
              sdp: answer,
              senderRole: userRole
            });
            setConnectionStatus('connected');
          } else if (data.type === 'answer') {
            await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
            setConnectionStatus('connected');
          } else if (data.type === 'ice-candidate') {
            if (pc.remoteDescription) {
              await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
          } else if (data.type === 'chat-message') {
            setChatMessages(prev => [...prev, data.message]);
          }
        } catch (signalingErr) {
          console.warn('WebRTC signaling event note:', signalingErr);
        }
      };

      // Announce peer arrival
      channel.postMessage({
        type: 'peer-joined',
        senderRole: userRole
      });

      setConnectionStatus('waiting');
    };

    setupMediaAndWebRTC();

    return () => {
      isCancelled = true;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, [meetingId, userRole]);

  // Toggle Microphone
  const toggleMic = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMicOn(!isMicOn);
    }
  };

  // Toggle Camera
  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOn(!isVideoOn);
    }
  };

  // Toggle Screen Sharing
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screenStream.getVideoTracks()[0];

        if (peerConnectionRef.current) {
          const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.warn('Screen share cancelled or not allowed:', err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = () => {
    if (localStreamRef.current && localVideoRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (peerConnectionRef.current) {
        const sender = peerConnectionRef.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender && videoTrack) {
          sender.replaceTrack(videoTrack);
        }
      }
      localVideoRef.current.srcObject = localStreamRef.current;
    }
    setIsScreenSharing(false);
  };

  // Send In-Call Chat Message
  const handleSendMessage = () => {
    if (!inputMsg.trim()) return;

    const newMsg: ChatMsg = {
      id: `chat_${Date.now()}`,
      sender: currentUser?.displayName || (userRole === 'doctor' ? 'Dr. Rajesh Sharma' : 'Patient'),
      role: userRole,
      text: inputMsg.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMsg]);

    // Broadcast to peer
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'chat-message',
        message: newMsg,
        senderRole: userRole
      });
    }

    setInputMsg('');
  };

  const handleEndCallInternal = () => {
    if (currentAppointment) {
      updateAppointmentStatus(currentAppointment.appointmentId, 'completed', consultationNotes);
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
    }
    onEndCall();
  };

  const copyMeetingId = () => {
    navigator.clipboard.writeText(meetingId);
    setCopiedMeetingId(true);
    setTimeout(() => setCopiedMeetingId(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col text-white animate-fade-in font-sans">
      {/* 🔝 TOP HEADER BAR */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30">
            <Video className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-sm text-white">Live Telemedicine Video Consultation</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                WebRTC Real-Time
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Room ID: <strong className="font-mono text-emerald-300">{meetingId}</strong></span>
              <button
                onClick={copyMeetingId}
                className="hover:text-white transition-colors cursor-pointer"
                title="Copy Room ID"
              >
                {copiedMeetingId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <span>•</span>
              <span className="text-emerald-400 font-mono font-bold">⏱️ {formatDuration(callDuration)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection status indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
            <span className={`w-2.5 h-2.5 rounded-full ${
              connectionStatus === 'connected' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'
            }`} />
            <span className="text-slate-300 font-medium">
              {connectionStatus === 'connected' ? 'Connected (2-Way Live Stream)' : 'Waiting for Peer to Join...'}
            </span>
          </div>

          <button
            onClick={handleEndCallInternal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Call</span>
          </button>
        </div>
      </div>

      {/* Camera warning banner if no physical camera found */}
      {cameraError && (
        <div className="bg-amber-950/80 border-b border-amber-800/80 px-6 py-2 text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{cameraError}</span>
          </div>
          <span className="text-[10px] text-amber-400 font-mono uppercase font-bold">Live Stream Active</span>
        </div>
      )}

      {/* 📺 MAIN VIDEO STAGE & SIDEBAR */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left 8 Cols: Real Video Viewport */}
        <div className="lg:col-span-8 bg-slate-900 p-4 sm:p-6 flex flex-col justify-between relative border-r border-slate-800">
          {/* Main Remote Video Stream Stage */}
          <div className="relative flex-1 rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center">
            {/* REAL REMOTE VIDEO ELEMENT */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover ${connectionStatus === 'connected' ? 'block' : 'hidden'}`}
            />

            {/* Waiting for remote peer overlay */}
            {connectionStatus !== 'connected' && (
              <div className="text-center space-y-4 p-6 max-w-md">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto animate-pulse shadow-inner">
                  <Video className="w-10 h-10" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">
                    {userRole === 'doctor' ? 'Waiting for Patient to Connect...' : 'Waiting for Doctor to Join...'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Both parties join using Meeting ID: <strong className="font-mono text-emerald-300">{meetingId}</strong>.
                    When testing in two tabs/windows, both streams connect live over WebRTC.
                  </p>
                </div>
                <button
                  onClick={copyMeetingId}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold rounded-xl border border-slate-700 transition-all cursor-pointer"
                >
                  {copiedMeetingId ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedMeetingId ? 'Copied Meeting ID!' : 'Copy Meeting Invite ID'}</span>
                </button>
              </div>
            )}

            {/* Remote Peer Name Badge */}
            <div className="absolute top-4 left-4 bg-slate-900/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-2 shadow-lg">
              <span className={`w-2.5 h-2.5 rounded-full ${
                connectionStatus === 'connected' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'
              }`} />
              <span>
                {userRole === 'doctor'
                  ? `${currentAppointment?.patientName || 'Sarah Jenkins'} (Patient)`
                  : `${currentAppointment?.doctorName || 'Dr. Rajesh Sharma'} (${currentAppointment?.doctorSpecialization || 'Doctor'})`}
              </span>
            </div>

            {/* 👤 REAL LOCAL SELF CAMERA PIP (PICTURE-IN-PICTURE) */}
            <div className="absolute bottom-4 right-4 w-44 sm:w-56 h-32 sm:h-40 rounded-2xl overflow-hidden border-2 border-emerald-500/80 shadow-2xl bg-slate-900">
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
                  <span className="text-[10px] text-slate-400 font-bold">Camera Paused</span>
                </div>
              )}

              <div className="absolute bottom-1.5 left-2 text-[10px] bg-slate-900/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-white font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>You ({currentUser?.displayName || userRole})</span>
              </div>
            </div>
          </div>

          {/* 🎛️ FLOATING REAL-TIME MEDIA CONTROL BAR */}
          <div className="mt-4 flex items-center justify-center gap-3">
            {/* Mic Toggle */}
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

            {/* Video Toggle */}
            <button
              onClick={toggleVideo}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                isVideoOn
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
              }`}
              title={isVideoOn ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            {/* Screen Share Toggle */}
            <button
              onClick={toggleScreenShare}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer shadow-lg ${
                isScreenSharing
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
              title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen / Medical Reports'}
            >
              <ScreenShare className="w-5 h-5" />
            </button>

            {/* End Call Button */}
            <button
              onClick={handleEndCallInternal}
              className="px-5 h-12 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-red-600/40 cursor-pointer"
              title="Leave Room"
            >
              <PhoneOff className="w-5 h-5" />
              <span>Leave Room</span>
            </button>
          </div>
        </div>

        {/* Right 4 Cols: Live Chat / Clinical Notes / Patient Condition File */}
        <div className="lg:col-span-4 bg-slate-900 flex flex-col h-full border-t lg:border-t-0 border-slate-800">
          {/* Tab Navigation */}
          <div className="flex items-center border-b border-slate-800 bg-slate-950 p-2 gap-1 text-xs">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'chat'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Live Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'notes'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Doctor Notes</span>
            </button>

            <button
              onClick={() => setActiveTab('patient_info')}
              className={`flex-1 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'patient_info'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Patient Condition</span>
            </button>
          </div>

          {/* Tab Content Body */}
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
                    placeholder="Type message in encrypted call..."
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
                    Clinical Examination & Prescription Summary
                  </label>
                  <textarea
                    rows={10}
                    value={consultationNotes}
                    onChange={(e) => setConsultationNotes(e.target.value)}
                    readOnly={userRole !== 'doctor'}
                    placeholder="Doctor records clinical observations, vitals examined, diagnosis, and medications..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {userRole === 'doctor' ? (
                  <p className="text-[11px] text-emerald-400">
                    ✓ Clinical notes will automatically be saved to the patient's appointment record upon ending the consultation.
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
                  <span className="text-slate-400 block mb-1">Chief Reason for Call:</span>
                  <p className="text-white bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                    {currentAppointment?.reason || 'Chest Tightness Follow-up & ECG Check'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-400 block mb-1">Diagnosed Condition:</span>
                  <p className="text-white bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                    {currentAppointment?.patientCondition || medicalProfile.medicalConditions.join(', ') || 'Mild Asthma'}
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
                  <span className="text-slate-400 block mb-1">Current Medications:</span>
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
