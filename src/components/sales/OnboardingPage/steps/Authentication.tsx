import { useMutation } from "@apollo/client";
import { CheckCircle2, Phone, ShieldCheck } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { SEND_ONBOARDING_OTP, VERIFY_ONBOARDING_OTP } from "../../../../graphql/mutations/otp";
import ErrorPopup from "../components/ErrorPopup";
import HeaderSteps from "../components/HeaderSteps";
import SuccessPopup from "../components/SuccessPopup";

export default function Authentication() {
  const navigate = useNavigate();

  // ---------------- INPUT STATES ----------------
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ---------------- FEEDBACK STATES ----------------
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ---------------- MUTATIONS ----------------
  const [sendOtpMutation, { loading: sending }] = useMutation(SEND_ONBOARDING_OTP);
  const [verifyOtpMutation, { loading: verifying }] = useMutation(VERIFY_ONBOARDING_OTP);

  // ---------------- TIMER STATES ----------------
  const [timer, setTimer] = useState(0);
  const [otpSent, setOtpSent] = useState(false);

  // ---------------- COUNTDOWN EFFECT ----------------
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // ---------------- SEND OTP ----------------
  const handleSendOtp = async () => {
    if (!mobile || !/^\d{10}$/.test(mobile.replace(/\D/g, ""))) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    try {
      const { data } = await sendOtpMutation({
        variables: { input: { mobile } },
      });

      if (data?.sendOnboardingOtp?.success) {
        setOtpSent(true);
        setTimer(60);
        toast.success(data.sendOnboardingOtp.message || "OTP sent successfully!");
        setTimeout(() => inputRefs.current[0]?.focus(), 300);
      } else {
        toast.error(data?.sendOnboardingOtp?.message || "Failed to send OTP");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred while sending OTP");
    }
  };

  // ---------------- OTP BOX HANDLER ----------------
  const handleOtpChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ---------------- AUTO PASTE (SMS) ----------------
  const handlePaste = (e: React.ClipboardEvent) => {
    const paste = e.clipboardData.getData("text").trim().slice(0, 6);

    if (/^\d{6}$/.test(paste)) {
      const digits = paste.split("");
      setOtp(digits);
      setTimeout(() => inputRefs.current[5]?.focus(), 50);
    }
  };

  // ---------------- VERIFY OTP ----------------
  const handleVerifyOtp = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
      toast.error("Please enter the full 6-digit OTP");
      return;
    }

    try {
      const { data } = await verifyOtpMutation({
        variables: { input: { mobile, otp: fullOtp } },
      });

      if (data?.verifyOnboardingOtp?.success) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate("/sales/onboarding/process/risk-type");
        }, 1500);
      } else {
        setErrorMessage(data?.verifyOnboardingOtp?.message || "Invalid OTP");
        setShowError(true);
      }
    } catch (error: any) {
      setErrorMessage(error.message || "An error occurred during verification");
      setShowError(true);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-start pt-24 pb-12 px-4 md:px-0">
      {/* Header Steps */}
      <div className="w-full max-w-4xl mb-12">
        <HeaderSteps current={2} />
      </div>

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row">

        {/* Left Section - Phone Input */}
        <div className="flex-1 p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl mb-6">
            <Phone size={24} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome!</h2>
          <p className="text-gray-500 mb-8 max-w-xs">
            Enter your mobile number to securely access your onboarding application.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                  +91
                </span>
                <input
                  type="text"
                  placeholder="+91 XXXXXXXXXX"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full pl-14 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all duration-200 text-lg tracking-wider"
                />
              </div>
            </div>

            <button
              onClick={handleSendOtp}
              disabled={timer > 0 || sending}
              className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-md transition-all duration-300 transform active:scale-95
                ${timer > 0 || sending
                  ? "bg-gray-300 cursor-not-allowed shadow-none"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/20"
                }`}
            >
              {sending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Sending...
                </span>
              ) : timer > 0 ? (
                `Resend in ${formatTime(timer)}`
              ) : (
                "Send OTP"
              )}
            </button>
          </div>
        </div>

        {/* Right Section - OTP Verification */}
        <div className={`flex-1 p-8 md:p-12 flex flex-col justify-center transition-all duration-500 ${!otpSent ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
          <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl mb-6 font-bold">
            <ShieldCheck size={24} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Verify Code</h2>
          <p className="text-gray-500 mb-8">
            {otpSent
              ? `We've sent a 6-digit code to +91 ${mobile}`
              : "Please enter your mobile number first and request an OTP."
            }
          </p>

          <div className="space-y-8">
            <div className="flex justify-between gap-2 md:gap-3" onPaste={handlePaste}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  maxLength={1}
                  type="text"
                  inputMode="numeric"
                  className="w-full max-w-[50px] aspect-square text-center border-2 border-gray-100 bg-gray-50 rounded-xl text-2xl font-black text-indigo-600 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-200"
                  value={otp[i]}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  disabled={!otpSent || verifying}
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={!otpSent || verifying}
              className={`w-full py-4 rounded-2xl text-white font-bold text-lg shadow-md transition-all duration-300 transform active:scale-95
                ${!otpSent || verifying
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/20"
                }`}
            >
              {verifying ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Verifying...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 size={20} />
                  Verify & Continue
                </span>
              )}
            </button>

            {otpSent && timer === 0 && (
              <p className="text-center text-sm font-medium text-gray-400 mt-4">
                Didn't receive code? <button onClick={handleSendOtp} className="text-indigo-600 hover:underline font-bold">Try again</button>
              </p>
            )}
          </div>
        </div>

      </div>

      <SuccessPopup 
        open={showSuccess} 
        onClose={() => setShowSuccess(false)}
        message="Successfully Verified!" 
      />
      <ErrorPopup 
        open={showError} 
        onClose={() => setShowError(false)} 
        message={errorMessage} 
      />
    </div>
  );
}
