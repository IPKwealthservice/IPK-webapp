import { useState } from "react";

export default function Onboarding() {
  const [step, setStep] = useState(1);

  const steps = [
    {
      title: "Welcome",
      description: "Let’s get you started with a quick setup.",
    },
    {
      title: "Personal Info",
      description: "Tell us a bit about yourself.",
    },
    {
      title: "Finish",
      description: "You’re all set. Let’s go!",
    },
  ];

  const nextStep = () => setStep((prev) => Math.min(prev + 1, steps.length));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col md:flex-row">
        
        {/* LEFT PANEL */}
        <div className="md:w-1/2 bg-indigo-600 text-white p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Onboarding
            </h1>
            <p className="mt-2 text-indigo-100">
              Step {step} of {steps.length}
            </p>
          </div>

          {/* Progress */}
          <div className="mt-8 space-y-4">
            {steps.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 flex items-center justify-center rounded-full border-2 
                  ${
                    step >= i + 1
                      ? "bg-white text-indigo-600 border-white"
                      : "border-indigo-300 text-indigo-300"
                  }`}
                >
                  {i + 1}
                </div>
                <span
                  className={`text-sm ${
                    step >= i + 1 ? "text-white" : "text-indigo-300"
                  }`}
                >
                  {s.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="md:w-1/2 p-6 sm:p-8 lg:p-12">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            {steps[step - 1].title}
          </h2>
          <p className="mt-2 text-gray-500">
            {steps[step - 1].description}
          </p>

          {/* STEP CONTENT */}
          <div className="mt-6">
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-gray-600">
                  This onboarding will help you set up your account quickly.
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <p className="text-green-600 font-medium">
                  🎉 Setup complete!
                </p>
                <p className="text-gray-600">
                  You can now start using the application.
                </p>
              </div>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="mt-8 flex justify-between">
            <button
              onClick={prevStep}
              disabled={step === 1}
              className={`px-6 py-2 rounded-lg text-sm font-medium
                ${
                  step === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              Back
            </button>

            <button
              onClick={nextStep}
              className="px-6 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
            >
              {step === steps.length ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
