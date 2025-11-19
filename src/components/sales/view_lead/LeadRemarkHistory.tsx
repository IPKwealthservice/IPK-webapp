import { useMemo } from 'react';
import { BookMarked, User, Calendar } from 'lucide-react';
import { formatDateDisplay, formatRelative } from './interface/utils';
import type { RemarkEntry } from './interface/leadInteraction';

type Props = {
  remarks: RemarkEntry[];
  isLoading?: boolean;
  onRemarkClick?: (remark: RemarkEntry) => void;
};

export default function LeadRemarkHistory({
  remarks,
  isLoading = false,
  onRemarkClick,
}: Props) {
  // Sort remarks by date (newest first)
  const sortedRemarks = useMemo(() => {
    return [...(remarks || [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [remarks]);

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white">
          Remark History
        </h2>
        <div className="mt-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-gray-100 animate-pulse dark:bg-white/10" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.03] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-200 p-5 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-base font-semibold text-gray-800 dark:text-white">
              Remark History
            </h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-white/60 mt-1">
            Complete audit trail of all saved remarks with author information
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800 dark:bg-amber-500/20 dark:text-amber-200">
          {remarks.length} remarks
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        {remarks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-6 text-center text-sm text-gray-500 dark:border-white/10 dark:bg-white/5">
            <BookMarked className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p>No remarks saved yet.</p>
            <p className="text-xs mt-1">Add a note to begin tracking remarks.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedRemarks.map((remark, idx) => (
              <RemarkCard
                key={remark.id || `remark-${idx}`}
                remark={remark}
                isLatest={idx === 0}
                onClick={() => onRemarkClick?.(remark)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function RemarkCard({
  remark,
  isLatest = false,
  onClick,
}: {
  remark: RemarkEntry;
  isLatest?: boolean;
  onClick: () => void;
}) {
  const relativeTime = formatRelative(remark.createdAt);
  const fullDate = formatDateDisplay(remark.createdAt);

  return (
    <div
      className={`group cursor-pointer rounded-lg border-2 p-4 transition-all ${
        isLatest
          ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-500/40 dark:bg-emerald-500/10'
          : 'border-gray-100 bg-gray-50/50 hover:border-emerald-200 hover:bg-emerald-50/30 dark:border-white/10 dark:bg-white/5 dark:hover:border-emerald-400/30 dark:hover:bg-emerald-500/10'
      }`}
      onClick={onClick}
    >
      {isLatest && (
        <div className="mb-2 inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white">
          Latest
        </div>
      )}

      {/* Author and timestamp */}
      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600">
            <User className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-semibold text-gray-800 dark:text-white">
            {remark.author}
          </span>
        </div>

        <span className="text-gray-400 dark:text-white/30">·</span>

        <div className="flex items-center gap-1 text-gray-600 dark:text-white/70">
          <Calendar className="h-3.5 w-3.5" />
          <span title={fullDate}>{relativeTime}</span>
        </div>

        {remark.associatedInteractionId && (
          <>
            <span className="text-gray-400 dark:text-white/30">·</span>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
              Interaction
            </span>
          </>
        )}
      </div>

      {/* Remark text */}
      <div className="rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/80">
        <p className="whitespace-pre-wrap break-words leading-relaxed">
          {remark.text}
        </p>
      </div>

      {/* Update info if available */}
      {remark.updatedAt && remark.updatedAt !== remark.createdAt && (
        <div className="mt-2 text-xs text-gray-500 dark:text-white/60 italic">
          Last updated {formatRelative(remark.updatedAt)}
        </div>
      )}
    </div>
  );
}
