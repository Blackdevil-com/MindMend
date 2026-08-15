import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, CheckCircle2, Sparkles, Lock, ArrowRight } from 'lucide-react';
import { useToast } from './Toast';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName?: string;
  price?: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  planName = 'MindMend VIP All-Access Membership',
  price = '₹4,999',
}) => {
  const { showToast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'wallet'>('card');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('•••');
  const [upiId, setUpiId] = useState('student@okaxis');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      showToast('Payment successful! Welcome to VIP Access 🎉', undefined, 'success');
    }, 1500);
  };

  const resetAndClose = () => {
    setIsSuccess(false);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white border border-purple-100 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-purple-100 bg-[#FAFAFE] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#6A1B9A] flex items-center justify-center text-white font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-slate-900">VIP Membership Upgrade</h3>
              <p className="text-xs text-purple-600">Secure 256-Bit Encrypted Checkout</p>
            </div>
          </div>
          <button onClick={resetAndClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-purple-50">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-[#6A1B9A]/10 border-2 border-[#6A1B9A] text-[#6A1B9A] flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h4 className="font-display font-black text-2xl text-slate-900">Enrollment Confirmed!</h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto">
                You now have full VIP access to all 50+ enterprise courses, live mentorship sessions, and mock tests.
              </p>
            </div>
            <button
              onClick={resetAndClose}
              className="w-full py-3 rounded-2xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white font-bold text-xs transition-all shadow-glow-purple"
            >
              Start Learning Now
            </button>
          </div>
        ) : (
          <form onSubmit={handlePaymentSubmit} className="p-6 space-y-6">
            {/* Order Summary Box */}
            <div className="p-4 rounded-2xl bg-[#F5EFFB] border border-purple-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6A1B9A]">Plan Selected</span>
                <h4 className="font-bold text-sm text-slate-900">{planName}</h4>
                <p className="text-[11px] text-slate-500">Includes Certificate & Live Class Access</p>
              </div>
              <div className="text-right">
                <span className="font-display font-black text-xl text-slate-900">{price}</span>
                <span className="text-[10px] text-emerald-600 block font-bold">Save 40% Today</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Select Payment Gateway</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'card', label: 'Credit/Debit Card', icon: CreditCard },
                  { id: 'upi', label: 'UPI / QR', icon: ShieldCheck },
                  { id: 'wallet', label: 'NetBanking', icon: Lock },
                ].map(m => {
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === m.id
                          ? 'bg-[#6A1B9A] text-white border-[#8E24AA] shadow-glow-sm'
                          : 'bg-[#FAFAFE] text-slate-500 border-purple-200 hover:bg-purple-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-[11px]">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Form Fields */}
            {paymentMethod === 'card' ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-purple-200 text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">Expiry Date</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={e => setExpiry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-purple-200 text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">CVV / CVC</label>
                    <input
                      type="password"
                      value={cvv}
                      onChange={e => setCvv(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-purple-200 text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Virtual Payment Address (VPA / UPI ID)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="e.g. mobile@upi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-purple-200 text-xs text-slate-900 focus:outline-none focus:border-[#6A1B9A]"
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 rounded-2xl bg-[#6A1B9A] hover:bg-[#8E24AA] text-white font-bold text-xs shadow-glow-purple transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Pay {price} & Unlock Access</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
