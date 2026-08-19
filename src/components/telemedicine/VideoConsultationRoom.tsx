import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  Send
} from 'lucide-react';

interface VideoConsultationRoomProps {
  meetingId: string;
  onEndCall: () => void;
}

export const VideoConsultationRoom: React.FC<VideoConsultationRoomProps> = ({ meetingId, onEndCall }) => {
  const { userRole } = useAuth();
  const { medicalProfile, updateAppointmentStatus, appointments } = useApp();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'patient_info'>('chat');

  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string; time: string }>>([
    { sender: 'Dr. Rajesh Sharma', text: 'Hello! I can see your ECG readings. How are you feeling right now?', time: '15:01' }
  ]);
  const [inputMsg, setInputMsg] = useState('');
  const [consultationNotes, setConsultationNotes] = useState('Patient reported mild exertional chest pressure. ECG normal sinus rhythm.');

  const handleSendMessage = () => {
    if (!inputMsg.trim()) return;
    setChatMessages(prev => [
      ...prev,
      {
        sender: userRole === 'doctor' ? 'Dr. Rajesh Sharma' : 'Patient (Sarah)',
        text: inputMsg.trim(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setInputMsg('');
  };

  const currentAppointment = appointments.find(a => a.meetingId === meetingId) || appointments[0];

  const handleEndCallInternal = () => {
    if (currentAppointment) {
      updateAppointmentStatus(currentAppointment.appointmentId, 'completed', consultationNotes);
    }
    onEndCall();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col text-white animate-fade-in">
      {/* Top Header */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/90 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-sm text-white flex items-center gap-2">
              Telemedicine Consultation Room
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                Encrypted Session
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Meeting ID: <span className="font-mono text-emerald-300 font-bold">{meetingId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleEndCallInternal}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Consultation</span>
          </button>
        </div>
      </div>

      {/* Main Video & Sidebar Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left 8 Cols: Video Viewport */}
        <div className="lg:col-span-8 bg-slate-900 p-6 flex flex-col justify-between relative border-r border-slate-800">
          {/* Main Doctor Remote Video Stream */}
          <div className="relative flex-1 rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center">
            {isVideoOn ? (
              <img
                src={
                  userRole === 'doctor'
                    ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
                    : 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=800&q=80'
                }
                alt="Video Stream"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center space-y-2">
                <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                  <VideoOff className="w-10 h-10" />
                </div>
                <p className="text-xs text-slate-400">Camera is toggled off</p>
              </div>
            )}

            {/* Remote Peer Name Badge */}
            <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{userRole === 'doctor' ? 'Sarah Jenkins (Patient)' : 'Dr. Rajesh Sharma (Cardiologist)'}</span>
            </div>

            {/* Self PIP Thumbnail Camera */}
            <div className="absolute bottom-4 right-4 w-40 h-28 rounded-2xl overflow-hidden border-2 border-emerald-500/60 shadow-2xl bg-slate-900">
              <img
                src={
                  userRole === 'doctor'
                    ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=400&q=80'
                    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
                }
                alt="Self PIP"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 left-2 text-[9px] bg-slate-900/80 px-1.5 py-0.5 rounded text-white font-mono">
                You ({userRole})
              </div>
            </div>
          </div>

          {/* Floating Control Bar */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                isMicOn
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  : 'bg-red-600 text-white shadow-lg shadow-red-600/30'
              }`}
              title="Toggle Microphone"
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                isVideoOn
                  ? 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                  : 'bg-red-600 text-white shadow-lg shadow-red-600/30'
              }`}
              title="Toggle Video"
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              onClick={handleEndCallInternal}
              className="w-14 h-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg cursor-pointer"
              title="Leave Room"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Right 4 Cols: Chat / Consultation Notes / Medical Profile */}
        <div className="lg:col-span-4 bg-slate-900 flex flex-col h-full">
          {/* Sidebar Tabs */}
          <div className="flex items-center border-b border-slate-800 bg-slate-950 p-2 gap-1 text-xs">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'chat' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Live Chat
            </button>
            <button
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'notes' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Doctor Notes
            </button>
            <button
              onClick={() => setActiveTab('patient_info')}
              className={`flex-1 py-2 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'patient_info' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              Patient File
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
            {activeTab === 'chat' && (
              <div className="flex flex-col h-full justify-between space-y-4">
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
                        <span>{msg.sender}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{msg.time}</span>
                      </div>
                      <p className="text-slate-200">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    placeholder="Type message to doctor..."
                    value={inputMsg}
                    onChange={(e) => setInputMsg(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="font-bold text-white text-xs block">Consultation Summary & Prescription</label>
                  <textarea
                    rows={8}
                    value={consultationNotes}
                    onChange={(e) => setConsultationNotes(e.target.value)}
                    readOnly={userRole !== 'doctor'}
                    placeholder="Doctor writes clinical observations & prescription notes..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-3 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {userRole === 'doctor' && (
                  <p className="text-[11px] text-emerald-400">
                    ✓ Notes will automatically sync to patient record upon ending call.
                  </p>
                )}
              </div>
            )}

            {activeTab === 'patient_info' && (
              <div className="space-y-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-slate-400">Patient Name:</span>
                  <span className="font-bold text-white">Sarah Jenkins (34y F)</span>
                </div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                  <span className="text-slate-400">Blood Group:</span>
                  <span className="px-2 py-0.5 bg-red-600/20 text-red-400 font-bold border border-red-500/40 rounded">
                    {medicalProfile.bloodGroup}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Authorized Allergies:</span>
                  <div className="flex flex-wrap gap-1">
                    {medicalProfile.allergies.map((a, i) => (
                      <span key={i} className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded text-[11px]">
                        ⚠️ {a}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">Current Medications:</span>
                  <p className="text-white text-[11px]">{medicalProfile.medications.join(', ')}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
