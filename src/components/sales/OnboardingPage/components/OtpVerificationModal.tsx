import { useMutation } from '@apollo/client';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, RefreshCw, ShieldCheck, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { SEND_ONBOARDING_OTP, VERIFY_ONBOARDING_OTP } from '../../../../graphql/mutations/otp';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  mobile: string;
  onVerifySuccess: () => void;
}

export default function OtpVerificationModal({ isOpen, onClose, mobile, onVerifySuccess }: Props) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [sendOtp, { loading: sending }] = useMutation(SEND_ONBOARDING_OTP);
  const [verifyOtp, { loading: verifying }] = useMutation(VERIFY_ONBOARDING_OTP);

  useEffect(() => {
    if (isOpen) {
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      // Auto-focus first input after animation
      setTimeout(() => inputRefs.current[0]?.focus(), 500);
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: any;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      const { data } = await sendOtp({ variables: { input: { mobile } } });
      if (data?.sendOnboardingOtp?.success) {
        toast.success(data.sendOnboardingOtp.message || "OTP Resent Successfully");
        setTimer(60);
        setCanResend(false);
      } else {
        toast.error(data?.sendOnboardingOtp?.message || "Failed to resend OTP");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleVerify = async () => {
    const fullOtp = otp.join('');
    if (fullOtp.length < 6) {
      toast.warning("Please enter 6-digit OTP");
      return;
    }

    try {
      const { data } = await verifyOtp({
        variables: { input: { mobile, otp: fullOtp } }
      });

      if (data?.verifyOnboardingOtp?.success) {
        toast.success("Mobile Verified Successfully!");
        onVerifySuccess();
        onClose();
      } else {
        toast.error(data?.verifyOnboardingOtp?.message || "Invalid OTP");
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-3xl"
          >
            {/* Header / Accent bar */}
            <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            <button 
              onClick={onClose}
              className="absolute right-4 top-6 p-2 text-gray-400 transition-colors hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <div className="p-8">
              <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-2xl bg-indigo-50 text-indigo-600 ring-8 ring-indigo-50/50">
                  <ShieldCheck size={32} />
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900">Verify Your Number</h2>
                <p className="mt-2 text-gray-500">
                  We've sent a 6-digit verification code to
                </p>
                <div className="mt-1 font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-sm">
                  +91 {mobile.replace(/(\d{5})(\d{5})/, '$1 $2')}
                </div>
              </div>

              {/* OTP Input Group */}
              <div className="mt-8 flex justify-center gap-2 sm:gap-3">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    className="w-11 h-11 sm:w-14 sm:h-14 text-center text-xl font-bold border-2 rounded-xl bg-gray-50 border-gray-100 text-indigo-600 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200"
                    value={data}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 space-y-4">
                <button
                  onClick={handleVerify}
                  disabled={verifying}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-indigo-600 px-6 py-4 text-white font-bold transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                >
                  {verifying ? (
                    <RefreshCw className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <span>Verify & Continue</span>
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-gray-500">Didn't receive code?</span>
                  <button
                    onClick={handleResend}
                    disabled={!canResend || sending}
                    className={`font-bold transition-colors ${
                      canResend && !sending ? 'text-indigo-600 hover:text-indigo-800' : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {canResend ? (sending ? 'Sending...' : 'Resend Now') : `Resend in ${formatTime(timer)}`}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer shadow effect */}
            <div className="bg-gray-50 px-8 py-4 flex items-center justify-center gap-2 text-xs text-gray-400 border-t border-gray-100">
              <CheckCircle2 size={14} className="text-emerald-500" />
              Secure verification by FabInvest CRM
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
