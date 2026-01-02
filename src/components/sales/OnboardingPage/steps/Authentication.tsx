import React, { useState, useEffect, useRef } from "react";
import HeaderSteps from "../components/HeaderSteps";
import { useNavigate } from "react-router-dom";

export default function Authentication() {
  const navigate = useNavigate();

  // ---------------- INPUT STATES ----------------
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const inputRefs = useRef<any[]>([]);

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
  const handleSendOtp = () => {
    if (!mobile || mobile.length < 10) {
      alert("Enter a valid Mobile Number");
      return;
    }

    setOtpSent(true);
    setTimer(30);
    alert("OTP sent successfully!");

    setTimeout(() => inputRefs.current[0]?.focus(), 300);
  };

  // ---------------- OTP BOX HANDLER ----------------
  const handleOtpChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e: any, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);

      inputRefs.current[index - 1].focus();
    }
  };

  // ---------------- AUTO PASTE (SMS) ----------------
  const handlePaste = (e: any) => {
    const paste = e.clipboardData.getData("text").slice(0, 4);

    if (/^\d{4}$/.test(paste)) {
      const digits = paste.split("");
      setOtp(digits);

      digits.forEach((digit: any, i: any) => {
        inputRefs.current[i].value = digit;
      });

      setTimeout(() => inputRefs.current[3]?.focus(), 50);
    }
  };

  // ---------------- VERIFY OTP ----------------
  const handleVerifyOtp = () => {
    const fullOtp = otp.join("");
    if (fullOtp.length < 4) {
      alert("Enter full 4-digit OTP");
      return;
    }

    alert("OTP Verified!");
    navigate("/sales/onboarding/process/risk-type");
  };

  return (
      <div className="mobile-padding tablet-padding desktop-padding">

      {/* Step Header */}
      <div className="flex justify-center mb-6">
        <HeaderSteps current={2} />
      </div>

      {/* White Card Box */}
      

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">

          {/* ---------------- LEFT: Send OTP ---------------- */}
          <div>
            <h2 className="text-3xl font-semibold mb-2">Welcome!!</h2>
            <p className="text-gray-600 mb-8">
              Secure login to access your onboarding
            </p>

            <label className="block text-sm font-medium mb-1">
              📞 Mobile Number
            </label>

            <input
              type="text"
              placeholder="+91 XXXXXXXXXX"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full border border-indigo-300 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <button
              onClick={handleSendOtp}
              disabled={timer > 0}
              className={`mt-6 px-6 py-2 rounded-md text-white transition 
                ${
                  timer > 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
            >
              {timer > 0 ? `Resend in ${formatTime(timer)}` : "Send OTP"}
            </button>
          </div>

          {/* ---------------- RIGHT: OTP UI ---------------- */}
          <div>
            <h2 className="text-xl font-semibold mb-1">Verify your number</h2>

            <p className="text-gray-600 mb-4 text-sm">
              {otpSent
                ? "OTP sent to your Mobile Number"
                : "Enter your mobile number and click Send OTP"}
            </p>

            {/* OTP BOXES */}
            <div className="flex gap-4" onPaste={handlePaste}>
              {[0, 1, 2, 3].map((i) => (
                <input
                  key={i}
                  //ref={(el) => (inputRefs.current[i] = el)}
                  maxLength={1}
                  type="text"
                  inputMode="numeric"
                  className="w-12 h-12 text-center border border-indigo-400 rounded-lg text-xl font-semibold focus:ring-2 focus:ring-indigo-600 outline-none"
                  value={otp[i]}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleKeyDown(e, i)}
                  disabled={!otpSent}
                />
              ))}
            </div>

            <button
              onClick={handleVerifyOtp}
              disabled={!otpSent}
              className={`mt-6 px-6 py-2 rounded-md text-white transition 
                ${
                  !otpSent
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
            >
              Verify OTP
            </button>

            {otpSent && (
              <p className="text-gray-500 text-xs mt-4">
                {timer > 0
                  ? `Resend OTP in ${formatTime(timer)}`
                  : "You can resend now."}
              </p>
            )}
          </div>

        </div>
      </div>
    //</div>
  );
}
