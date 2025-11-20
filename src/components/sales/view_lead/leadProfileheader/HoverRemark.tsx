import { Modal } from "@/components/ui/modal";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export function HoverPreviewCard({
  label,
  text,
  onViewMore,
}: {
  label: string;
  text: string;
  onViewMore: () => void;
}) {
  const preview = (text || "").trim();
  const empty = preview.length === 0;
  const [hover, setHover] = useState(false);
  return (
    <motion.div
      className="relative rounded-2xl border border-gray-100 bg-white p-4 text-sm dark:border-white/10 dark:bg-white/[0.03]"
      whileHover={{ y: -2, boxShadow: "0 8px 20px rgba(0,0,0,0.08)" }}
      onHoverStart={() => setHover(true)}
      onHoverEnd={() => setHover(false)}
      transition={{ type: "spring", stiffness: 250, damping: 20 }}
    >
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-white/60">{label}</div>
        <button
          type="button"
          onClick={onViewMore}
          className="inline-flex items-center rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 dark:border-white/10 dark:text-gray-200 dark:hover:border-emerald-300"
        >
          View
        </button>
      </div>
      <div className={`mt-2 line-clamp-2 whitespace-pre-wrap text-base ${empty ? "text-gray-400 dark:text-white/40" : "text-gray-800 dark:text-white/80"}`}>
        {empty ? "—" : preview}
      </div>
      {/* Hover popover (Framer Motion) */}
      <AnimatePresence>
        {!empty && hover && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: -4, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="pointer-events-none absolute inset-x-4 -bottom-2 z-20 origin-top rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-800 shadow-2xl dark:border-white/10 dark:bg-gray-900 dark:text-white/80"
          >
            <div className="max-h-40 overflow-auto whitespace-pre-wrap">
              {preview}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Modal for showing full Remark/Bio text.
 * (Updated sizes)
 */
export function RemarkBioModal({ title, isOpen, onClose, body }: { title: string; isOpen: boolean; onClose: () => void; body: string }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-[720px] m-4">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        <div className="mt-3 max-h-[60vh] overflow-auto whitespace-pre-wrap text-base text-gray-800 dark:text-white/80">
          {body?.trim() ? body : "—"}
        </div>
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/[0.06]"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
