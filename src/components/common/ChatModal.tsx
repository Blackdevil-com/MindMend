import React, { useState } from 'react';
import { X, Send, Search, Paperclip, CheckCheck, Smile, UserCheck, ShieldCheck } from 'lucide-react';
import { useToast } from './Toast';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
  const { showToast } = useToast();
  const [selectedContact, setSelectedContact] = useState({
    id: 1,
    name: 'Dr. Sarah Jenkins',
    role: 'Lead Full-Stack Trainer',
    avatar: 'SJ',
    online: true,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [inputMsg, setInputMsg] = useState('');

  const [messages, setMessages] = useState<Record<number, Array<{ id: number; text: string; sender: string; time: string; isSelf: boolean }>>>({
    1: [
      { id: 1, text: 'Hello! Do you have any questions regarding yesterday\'s React architecture assignment?', sender: 'Dr. Sarah Jenkins', time: '09:30 AM', isSelf: false },
      { id: 2, text: 'Hi Ma\'am! Yes, I was trying to optimize the state updates in custom hooks.', sender: 'You', time: '09:32 AM', isSelf: true },
      { id: 3, text: 'Great question! Make sure to use useMemo and useCallback where appropriate. I\'ll review your submission shortly.', sender: 'Dr. Sarah Jenkins', time: '09:35 AM', isSelf: false },
    ],
    2: [
      { id: 1, text: 'Your batch attendance report for July has been finalized.', sender: 'Academic Office', time: 'Yesterday', isSelf: false },
    ],
  });

  if (!isOpen) return null;

  const contacts = [
    { id: 1, name: 'Dr. Sarah Jenkins', role: 'Lead Trainer', avatar: 'SJ', online: true, unread: 0 },
    { id: 2, name: 'Academic Desk', role: 'Staff Support', avatar: 'AD', online: true, unread: 1 },
    { id: 3, name: 'Alex Rivera', role: 'Peer Student', avatar: 'AR', online: false, unread: 0 },
    { id: 4, name: 'Placement Cell', role: 'Career Team', avatar: 'PC', online: true, unread: 0 },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const contactId = selectedContact.id;
    const newMsgObj = {
      id: Date.now(),
      text: inputMsg,
      sender: 'You',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
    };

    setMessages(prev => ({
      ...prev,
      [contactId]: [...(prev[contactId] || []), newMsgObj],
    }));

    setInputMsg('');
    showToast('Message sent', undefined, 'success');

    // Simulate auto response after 1 flex second
    setTimeout(() => {
      setMessages(prev => ({
        ...prev,
        [contactId]: [
          ...(prev[contactId] || []),
          {
            id: Date.now() + 1,
            text: 'Thanks for reaching out! I will get back to you shortly.',
            sender: selectedContact.name,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSelf: false,
          },
        ],
      }));
    }, 1200);
  };

  const activeMsgs = messages[selectedContact.id] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0D0714] border border-[#6A1B9A]/40 rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2A1A4A] bg-[#140B24] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#6A1B9A] flex items-center justify-center text-white font-bold text-sm">
              💬
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white">MindMend Messenger & Discussions</h3>
              <p className="text-xs text-slate-400">Direct Messages & Trainer Assistance</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          {/* Contact List */}
          <div className="w-72 bg-[#120B20] border-r border-[#2A1A4A] flex flex-col p-3 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0A0612] border border-[#2A1A4A] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6A1B9A]"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
              {contacts.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedContact(c)}
                  className={`w-full p-3 rounded-2xl flex items-center gap-3 transition-all text-left ${
                    selectedContact.id === c.id
                      ? 'bg-[#6A1B9A] text-white shadow-glow-purple'
                      : 'hover:bg-[#1C1033] text-slate-300'
                  }`}
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center justify-center border border-white/10">
                      {c.avatar}
                    </div>
                    {c.online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#120B20]"></span>}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs truncate">{c.name}</p>
                    <p className="text-[10px] opacity-80 truncate">{c.role}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Chat Conversation Area */}
          <div className="flex-1 flex flex-col bg-[#080311]">
            {/* Conversation Header */}
            <div className="p-4 border-b border-[#2A1A4A] bg-[#100720] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#6A1B9A] text-white font-bold text-xs flex items-center justify-center">
                  {selectedContact.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">{selectedContact.name}</h4>
                  <span className="text-[10px] text-emerald-400 font-semibold">• Active Now</span>
                </div>
              </div>
            </div>

            {/* Message History */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {activeMsgs.map(m => (
                <div key={m.id} className={`flex flex-col ${m.isSelf ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`max-w-[75%] p-3.5 rounded-2xl text-xs space-y-1 ${
                      m.isSelf
                        ? 'bg-[#6A1B9A] text-white rounded-br-none shadow-md'
                        : 'bg-[#1C1033] text-slate-200 border border-[#2A1A4A] rounded-bl-none'
                    }`}
                  >
                    <p className="leading-relaxed">{m.text}</p>
                    <span className="text-[9px] opacity-70 block text-right">{m.time}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-[#2A1A4A] bg-[#100720] flex gap-2">
              <input
                type="text"
                value={inputMsg}
                onChange={e => setInputMsg(e.target.value)}
                placeholder={`Message ${selectedContact.name}...`}
                className="flex-1 px-4 py-2.5 rounded-xl bg-[#0A0612] border border-[#3D276B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#6A1B9A]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white text-xs font-bold transition-all shadow-glow-sm flex items-center gap-1.5"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
