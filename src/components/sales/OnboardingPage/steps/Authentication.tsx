import { useState, useRef } from "react";
import HeaderSteps from "../steps/HeaderSteps";

export default function Authentication() {
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleOtpChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKey = (e: any, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8">
      <HeaderSteps current={2} />

      <h2 className="text-xl font-semibold mb-6 text-center">
        Authentication
      </h2>

      <div className="p-6 bg-white rounded-xl shadow w-full">

        {/* Mobile Input */}
        <label className="block text-sm font-medium mb-2">Mobile Number</label>
        <input
          type="text"
          maxLength={10}
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="border p-3 rounded-lg w-full mb-4"
          placeholder="Enter Mobile Number"
        />

        <button className="w-full bg-indigo-600 text-white py-2 rounded-lg mb-6">
          Send OTP
        </button>

        {/* OTP Boxes */}
        <div className="flex justify-center gap-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, index)}
              onKeyDown={(e) => handleOtpKey(e, index)}
              className="w-10 h-10 text-center text-lg border 
                         rounded-md outline-none border-indigo-300
                         focus:ring-2 focus:ring-indigo-500"
            />
          ))}
        </div>

        <button className="w-full bg-green-600 text-white py-2 rounded-lg">
          Verify OTP
        </button>
      </div>
    </div>
  );
}
