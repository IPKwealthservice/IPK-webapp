import { AlertCircle, XCircle } from "lucide-react";

export default function ErrorPopup({ 
  open, 
  onClose, 
  message 
}: { 
  open: boolean; 
  onClose: () => void; 
  message?: string 
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-40 z-50 p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="bg-red-600 px-6 py-4 flex items-center gap-3">
          <AlertCircle className="text-white" size={24} />
          <h3 className="text-white font-semibold text-lg">Verification Failed</h3>
        </div>
        
        {/* Body */}
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
            <XCircle size={32} />
          </div>
          <p className="text-gray-600 font-medium">
            {message || "Invalid OTP! Please try again."}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex justify-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
