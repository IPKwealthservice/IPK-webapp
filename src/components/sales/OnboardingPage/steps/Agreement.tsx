import React, { useMemo, useRef, useState } from "react";
import HeaderSteps from "../components/HeaderSteps";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

type ClientProfile = {
  fullName?: string;
  firstName?: string;
  lastName?: string;
};

export default function Agreement() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Try to get client name from route state first (best)
  // Example when navigating here:
  // navigate("/sales/onboarding/process/agreement", { state: { clientProfile: { fullName: "John Doe" } } })
  type AgreementLocationState = {
  clientProfile?: ClientProfile;
};

const routeProfile =
  (location.state as AgreementLocationState | null)?.clientProfile;


  // ✅ fallback: localStorage (if you store profile there)
  const localProfile = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("clientProfile") || "{}") as ClientProfile;
    } catch {
      return {} as ClientProfile;
    }
  }, []);

  const clientName = useMemo(() => {
    const full =
      routeProfile?.fullName ||
      localProfile?.fullName ||
      [routeProfile?.firstName || localProfile?.firstName, routeProfile?.lastName || localProfile?.lastName]
        .filter(Boolean)
        .join(" ");

    return full?.trim() ? full : "Client";
  }, [routeProfile, localProfile]);

  const [agreed, setAgreed] = useState(false);

  // ✅ Signature pad
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const getCanvasCtx = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    return { canvas, ctx };
  };

  const resizeCanvasForHiDPI = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#111827"; // slate-900
  };

  React.useEffect(() => {
    // Make signature pad crisp
    resizeCanvasForHiDPI();
    // Re-resize on window resize
    const onResize = () => resizeCanvasForHiDPI();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const getPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = getCanvasCtx();
    if (!c) return;
    const { ctx } = c;
    const p = getPoint(e);
    setIsDrawing(true);
    setHasSignature(true);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const c = getCanvasCtx();
    if (!c) return;
    const { ctx } = c;
    const p = getPoint(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const handlePointerUp = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    // re-apply stroke settings after clear
    resizeCanvasForHiDPI();
  };

  const signatureDataUrl = () => {
    const canvas = canvasRef.current;
    if (!canvas) return "";
    return canvas.toDataURL("image/png");
  };

  const agreementText = useMemo(() => {
    const today = new Date();
    const dateStr = today.toLocaleDateString();
    return `AGREEMENT

This Agreement is entered into on ${dateStr} between IPK Wealth and ${clientName} (“Client”).

1. Purpose
Client agrees to provide accurate information for onboarding, compliance, and account opening.

2. Client Declarations
Client confirms all details submitted are true, complete, and updated as required.

3. Consent & Communication
Client authorizes IPK Wealth to contact via phone, email, and messaging apps for onboarding updates and service communication.

4. Data Processing
Client consents to the processing and storage of submitted information for onboarding and related regulatory obligations.

5. Acceptance
By signing below, Client acknowledges and accepts all terms stated in this Agreement.`;
  }, [clientName]);

  const generatePdf = () => {
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const margin = 48;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - margin * 2;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Onboarding Agreement", margin, 64);

    // Client line
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Client Name: ${clientName}`, margin, 92);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, 110);

    // Agreement body
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(agreementText, maxWidth);
    doc.text(lines, margin, 140);

    // Signature area
    const sig = signatureDataUrl();
    const sigY = 690;
    doc.setDrawColor(120);
    doc.line(margin, sigY, margin + 240, sigY); // signature line
    doc.text("Client Signature", margin, sigY + 18);

    if (sig) {
      // Add signature image
      // Keep within box
      doc.addImage(sig, "PNG", margin, sigY - 70, 240, 60);
    }

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("Generated by IPK CRM", margin, 820);

    const fileName = `Agreement-${clientName.replace(/\s+/g, "_")}.pdf`;
    doc.save(fileName);
    return fileName;
  };

  const handleWhatsAppShare = () => {
    // WhatsApp Web cannot auto-attach a local file from browser.
    // Best UX: generate/download first, then open WhatsApp with prefilled message.
    const message = encodeURIComponent(
      `Hi ${clientName}, your onboarding agreement PDF is ready.\n\nPlease find the downloaded PDF and attach it here:\nAgreement-${clientName.replace(/\s+/g, "_")}.pdf`
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  const canProceed = agreed && hasSignature;

  return (
    <div className="mobile-padding tablet-padding desktop-padding">
      {/* ✅ Keep HeaderSteps as you requested */}
      <div className="flex justify-center mb-6">
        <HeaderSteps current={5} />
      </div>

      {/* Page Card */}
      <div className="max-w-4xl mx-auto bg-white border rounded-2xl shadow-sm">
        {/* Title bar */}
        <div className="px-6 py-5 border-b">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">Agreement</h2>
              <p className="text-gray-600 mt-1">
                Please review the agreement carefully and sign below to continue.
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-500">Client</p>
              <p className="text-sm font-semibold text-gray-900">{clientName}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Agreement preview */}
          <div className="rounded-xl border bg-gray-50">
            <div className="px-4 py-3 border-b bg-white rounded-t-xl flex items-center justify-between">
              <p className="text-sm font-medium text-gray-800">Agreement Terms</p>
              <p className="text-xs text-gray-500">
                Date: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="p-4 h-72 overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-6 font-sans">
                {agreementText}
              </pre>
            </div>
          </div>

          {/* Consent */}
          <div className="flex items-start gap-3">
            <input
              id="agree"
              type="checkbox"
              className="mt-1 w-5 h-5"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <label htmlFor="agree" className="text-sm text-gray-800 cursor-pointer">
              I have read and agree to the terms and conditions stated above.
            </label>
          </div>

          {/* Signature */}
          <div className="rounded-xl border">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">E-Signature</p>
                <p className="text-xs text-gray-500">
                  Draw your signature in the box below.
                </p>
              </div>

              <button
                type="button"
                onClick={clearSignature}
                className="text-sm px-3 py-1.5 rounded-lg border hover:bg-gray-50"
              >
                Clear
              </button>
            </div>

            <div className="p-4">
              <div className="rounded-lg border bg-white">
                <canvas
                  ref={canvasRef}
                  className="w-full h-40 touch-none"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                />
              </div>

              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-gray-500">
                  Signed by: <span className="font-medium text-gray-700">{clientName}</span>
                </p>
                {!hasSignature && (
                  <p className="text-xs text-red-600">Signature is required.</p>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={generatePdf}
                disabled={!agreed}
                className={`px-4 py-2 rounded-lg border font-medium ${
                  agreed ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"
                }`}
                title={!agreed ? "Please accept agreement first" : "Download PDF"}
              >
                Download PDF
              </button>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                disabled={!agreed}
                className={`px-4 py-2 rounded-lg border font-medium ${
                  agreed ? "hover:bg-gray-50" : "opacity-50 cursor-not-allowed"
                }`}
                title={!agreed ? "Please accept agreement first" : "Share via WhatsApp"}
              >
                Share to WhatsApp
              </button>
            </div>

            <button
              onClick={() => navigate("/sales/onboarding/process/e-sign")}
              disabled={!canProceed}
              className={`px-6 py-2 rounded-lg font-medium text-white ${
                canProceed
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-indigo-300 cursor-not-allowed"
              }`}
              title={!canProceed ? "Accept agreement and add signature to continue" : "Next"}
            >
              Next
            </button>
          </div>

          {/* Helper note */}
          <div className="text-xs text-gray-500">
            Note: WhatsApp sharing opens with a pre-filled message. Due to browser limitations,
            you’ll need to manually attach the downloaded PDF in WhatsApp.
          </div>
        </div>
      </div>
    </div>
  );
}
