import React from 'react';

interface Props {
  score: number;
  maxScore?: number;
  statusText?: string;
  creditStatus?: string;
}

// Convert English numbers to Bengali numerals
export function toBengali(n: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/[0-9]/g, (w) => bnDigits[Number(w)]);
}

export const CreditScoreGauge: React.FC<Props> = ({
  score = 84,
  maxScore = 100,
  statusText = 'খুব ভালো',
  creditStatus = 'ভালো',
}) => {
  // Score clamped between 0 and 100
  const normalizedScore = Math.max(0, Math.min(100, (score / maxScore) * 100));
  // Needle angle: from -90deg (left, score 0) to +90deg (right, score 100)
  const angle = -90 + (normalizedScore / 100) * 180;

  return (
    <div id="credit-score-gauge-card" className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 flex flex-col items-center justify-center text-center">
      <div className="text-xs text-stone-500 font-medium mb-1">ক্রেডিট স্কোর</div>
      <div className="text-2xl font-bold text-stone-900 mb-2">{toBengali(score)}</div>

      <div className="relative w-44 h-24 flex items-end justify-center overflow-hidden">
        {/* SVG Semi-circle Arc */}
        <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible">
          {/* Background Gray Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Red/Poor Segment: 0 - 35% */}
          <path
            d="M 20 100 A 80 80 0 0 1 55 45"
            fill="none"
            stroke="#fca5a5"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Yellow/Moderate Segment: 36 - 70% */}
          <path
            d="M 60 41 A 80 80 0 0 1 140 41"
            fill="none"
            stroke="#fde047"
            strokeWidth="16"
          />

          {/* Green/Good Segment: 71 - 100% */}
          <path
            d="M 145 45 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#22c55e"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Needle pivot & arrow */}
          <g transform={`rotate(${angle}, 100, 100)`}>
            <line
              x1="100"
              y1="100"
              x2="155"
              y2="100"
              stroke="#1e293b"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="6" fill="#0f172a" />
          </g>
        </svg>
      </div>

      {/* Pill badge for status */}
      <div className="mt-2 inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        {creditStatus}
      </div>

      {/* Legend below gauge */}
      <div className="w-full mt-3 pt-2 border-t border-stone-100 grid grid-cols-3 text-[10px] text-stone-500 font-medium">
        <div className="flex items-center justify-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-400"></span>
          <span>০-৩৫ খারাপ</span>
        </div>
        <div className="flex items-center justify-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span>
          <span>৩৬-৭০ মাঝারি</span>
        </div>
        <div className="flex items-center justify-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>৭১-১০০ ভালো</span>
        </div>
      </div>
    </div>
  );
};
