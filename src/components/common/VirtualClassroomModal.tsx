import React, { useState } from 'react';
import {
  X,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Hand,
  PhoneOff,
  Send,
  Users,
  MessageSquare,
  Sparkles,
  ShieldAlert,
  Smile,
} from 'lucide-react';
import { useToast } from './Toast';

interface VirtualClassroomModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const VirtualClassroomModal: React.FC<VirtualClassroomModalProps> = ({
  isOpen,
  onClose,
  className = 'React & Full-Stack Architecture Live Workshop',
}) => {
  const { showToast } = useToast();
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat');

  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Dr. Sarah Jenkins', text: 'Welcome everyone! We are starting the live code review session.', time: '10:01 AM', role: 'Instructor' },
    { id: 2, sender: 'Alex Rivera', text: 'Excited for today\'s topic on State Management!', time: '10:02 AM', role: 'Student' },
    { id: 3, sender: 'Priya Sharma', text: 'Can we ask questions about TypeScript interfaces?', time: '10:04 AM', role: 'Student' },
  ]);

  const [newMessage, setNewMessage] = useState('');

  if (!isOpen) return null;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setChatMessages(prev => [
      ...prev,
      {
        id: Date.now(),
        sender: 'You',
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        role: 'Student',
      },
    ]);
    setNewMessage('');
    showToast('Message sent to class chat', undefined, 'info');
  };

  const toggleHand = () => {
    setHandRaised(!handRaised);
    showToast(!handRaised ? 'Hand raised ✋' : 'Hand lowered', undefined, 'info');
  };

  const toggleScreen = () => {
    setScreenSharing(!screenSharing);
    showToast(!screenSharing ? 'Screen sharing activated 🖥️' : 'Screen sharing stopped', undefined, 'info');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0D0714] border border-[#6A1B9A]/40 rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden shadow-2xl shadow-purple-950/50">
        {/* Modal Header Bar */}
        <div className="px-6 py-4 border-b border-[#2A1A4A] flex items-center justify-between bg-[#140B24]">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-white flex items-center gap-2">
                <span>{className}</span>
                <span className="px-2 py-0.5 rounded-full bg-[#6A1B9A] text-white text-[10px] uppercase font-bold tracking-wider">
                  LIVE
                </span>
              </h3>
              <p className="text-xs text-slate-400">Instructor: Dr. Sarah Jenkins • 48 Participants Connected</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Main Stage & Classroom Body */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
          {/* Main Stage Video Screen */}
          <div className="flex-1 flex flex-col bg-[#050209] p-4 relative min-h-0">
            <div className="flex-1 relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#1B0D36] via-[#100624] to-[#080214] border border-[#2A1A4A] flex items-center justify-center">
              {/* Simulated Instructor Stage Screen */}
              <div className="text-center p-6 space-y-4">
                <div className="relative inline-block">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-[#6A1B9A] to-[#8E24AA] flex items-center justify-center text-white font-black text-3xl shadow-glow-purple mx-auto">
                    SJ
                  </div>
                  <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-[#0D0714] rounded-full"></span>
                </div>
                <div>
                  <h4 className="font-display font-bold text-xl text-white">Dr. Sarah Jenkins (Presenter)</h4>
                  <p className="text-xs text-brand-300 mt-1">Sharing Screen: "Advanced React & Component Optimization.pdf"</p>
                </div>

                {screenSharing && (
                  <div className="mt-4 p-4 rounded-xl bg-[#6A1B9A]/20 border border-[#6A1B9A]/50 text-xs text-purple-200">
                    🖥️ You are currently presenting your screen to 48 attendees.
                  </div>
                )}
              </div>

              {/* Watermark/Status Badge */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-2 border border-white/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>HD 1080p Stream</span>
              </div>
            </div>

            {/* Video Sub-Grid (Participants thumbnails at bottom of stage) */}
            <div className="h-24 mt-3 grid grid-cols-4 sm:grid-cols-6 gap-2">
              {[
                { name: 'Alex R.', initials: 'AR', bg: 'bg-purple-900' },
                { name: 'Priya S.', initials: 'PS', bg: 'bg-indigo-900' },
                { name: 'Michael K.', initials: 'MK', bg: 'bg-emerald-900' },
                { name: 'You', initials: 'YOU', bg: 'bg-[#6A1B9A]' },
              ].map((p, idx) => (
                <div key={idx} className={`rounded-xl ${p.bg} border border-[#2A1A4A] flex items-center justify-center relative p-2 overflow-hidden`}>
                  <div className="w-8 h-8 rounded-full bg-white/20 text-white font-bold text-xs flex items-center justify-center">
                    {p.initials}
                  </div>
                  <span className="absolute bottom-1 left-2 text-[10px] font-bold text-white truncate max-w-[80%]">
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Live Chat & Attendees Panel */}
          <div className="w-full lg:w-80 bg-[#120B20] border-t lg:border-t-0 lg:border-l border-[#2A1A4A] flex flex-col h-72 lg:h-auto">
            {/* Panel Tabs */}
            <div className="flex border-b border-[#2A1A4A]">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'chat'
                    ? 'text-white border-b-2 border-[#6A1B9A] bg-[#1C1033]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-[#8E24AA]" />
                <span>Live Chat</span>
              </button>
              <button
                onClick={() => setActiveTab('participants')}
                className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 transition-colors ${
                  activeTab === 'participants'
                    ? 'text-white border-b-2 border-[#6A1B9A] bg-[#1C1033]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-4 h-4 text-[#8E24AA]" />
                <span>Attendees (48)</span>
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'chat' ? (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 p-3 overflow-y-auto space-y-3">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className="p-2.5 rounded-xl bg-[#1A0E30] border border-[#2D1B4D] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-brand-300">{msg.sender}</span>
                        <span className="text-[10px] text-slate-500">{msg.time}</span>
                      </div>
                      <p className="text-xs text-slate-200">{msg.text}</p>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="p-3 border-t border-[#2A1A4A] flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    placeholder="Type message to class..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0A0612] border border-[#3D276B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6A1B9A]"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex-1 p-3 overflow-y-auto space-y-2">
                {['Dr. Sarah Jenkins (Instructor)', 'Alex Rivera', 'Priya Sharma', 'Michael Chen', 'Jessica Taylor', 'David Miller'].map((name, i) => (
                  <div key={i} className="p-2 rounded-xl bg-[#1A0E30] border border-[#2D1B4D] flex items-center justify-between">
                    <span className="text-xs text-white font-medium">{name}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">Online</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Classroom Controls Footer Bar */}
        <div className="p-4 bg-[#140B24] border-t border-[#2A1A4A] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setMicOn(!micOn);
                showToast(!micOn ? 'Microphone unmuted' : 'Microphone muted', undefined, 'info');
              }}
              className={`p-3 rounded-2xl transition-all ${
                micOn ? 'bg-[#6A1B9A] text-white hover:bg-[#8E24AA]' : 'bg-rose-900/60 text-rose-300 border border-rose-500/40'
              }`}
            >
              {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => {
                setVideoOn(!videoOn);
                showToast(!videoOn ? 'Camera turned on' : 'Camera turned off', undefined, 'info');
              }}
              className={`p-3 rounded-2xl transition-all ${
                videoOn ? 'bg-[#6A1B9A] text-white hover:bg-[#8E24AA]' : 'bg-rose-900/60 text-rose-300 border border-rose-500/40'
              }`}
            >
              {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              onClick={toggleScreen}
              className={`p-3 rounded-2xl transition-all ${
                screenSharing ? 'bg-amber-600 text-white' : 'bg-[#2A1A4A] text-slate-300 hover:text-white hover:bg-[#3E246B]'
              }`}
            >
              <Monitor className="w-5 h-5" />
            </button>

            <button
              onClick={toggleHand}
              className={`p-3 rounded-2xl transition-all ${
                handRaised ? 'bg-amber-500 text-white animate-bounce' : 'bg-[#2A1A4A] text-slate-300 hover:text-white hover:bg-[#3E246B]'
              }`}
            >
              <Hand className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={() => {
              onClose();
              showToast('Left virtual classroom session', undefined, 'info');
            }}
            className="px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-950/40 transition-all"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Leave Classroom</span>
          </button>
        </div>
      </div>
    </div>
  );
};
