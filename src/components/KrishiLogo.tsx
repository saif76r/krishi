import React, { useState } from 'react';

interface Props {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const KrishiLogo: React.FC<Props> = ({ size = 'md', showText = true }) => {
  const [imgError, setImgError] = useState(false);

  const sizeMap = {
    sm: { box: 'w-10 h-10', text: 'text-sm' },
    md: { box: 'w-16 h-16', text: 'text-lg' },
    lg: { box: 'w-24 h-24', text: 'text-2xl' },
    xl: { box: 'w-32 h-32', text: 'text-3xl' },
  };

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <div className={`relative ${sizeMap[size].box} flex items-center justify-center rounded-full overflow-hidden`}>
        {!imgError ? (
          <img
            src="/public/src/krishilogo.jpg"
            alt="krishi Guide"
            className="w-full h-full object-cover rounded-full"
            onError={() => {
              // Try fallback path or vector
              setImgError(true);
            }}
          />
        ) : (
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Circular green leafy wreath */}
            <g fill="none" stroke="#22c55e" strokeWidth="2.5">
              <circle cx="50" cy="50" r="40" strokeDasharray="6 3" strokeOpacity="0.3" />
            </g>
            {/* Leaves surrounding */}
            <g fill="#22c55e">
              <path d="M 22 45 C 16 40, 16 30, 26 34 C 23 38, 22 42, 22 45 Z" />
              <path d="M 18 55 C 12 52, 12 42, 22 46 C 20 49, 19 52, 18 55 Z" />
              <path d="M 22 68 C 18 64, 18 55, 27 58 C 24 62, 23 65, 22 68 Z" />
              <path d="M 30 78 C 24 78, 22 68, 32 70 C 31 74, 30 76, 30 78 Z" />
              <path d="M 45 86 C 40 90, 30 84, 40 80 C 42 82, 43 84, 45 86 Z" />
              <path d="M 55 86 C 60 90, 70 84, 60 80 C 58 82, 57 84, 55 86 Z" />
              <path d="M 70 78 C 76 78, 78 68, 68 70 C 69 74, 70 76, 70 78 Z" />
              <path d="M 78 68 C 82 64, 82 55, 73 58 C 76 62, 77 65, 78 68 Z" />
              <path d="M 82 55 C 88 52, 88 42, 78 46 C 80 49, 81 52, 82 55 Z" />
              <path d="M 78 45 C 84 40, 84 30, 74 34 C 77 38, 78 42, 78 45 Z" />
              <path d="M 35 22 C 30 16, 40 12, 42 22 C 39 22, 37 22, 35 22 Z" />
              <path d="M 65 22 C 70 16, 60 12, 58 22 C 61 22, 63 22, 65 22 Z" />
            </g>

            {/* Rice stalk / wheat stem */}
            <path d="M 35 70 Q 40 40 50 25" fill="none" stroke="#15803d" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 40 70 Q 45 45 60 30" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" />

            {/* Golden rice grains */}
            <g fill="#eab308">
              <ellipse cx="44" cy="30" rx="3.5" ry="6" transform="rotate(-30 44 30)" />
              <ellipse cx="49" cy="24" rx="3.5" ry="6" transform="rotate(-15 49 24)" />
              <ellipse cx="53" cy="20" rx="3" ry="5.5" transform="rotate(10 53 20)" />
              <ellipse cx="42" cy="38" rx="3.5" ry="6" transform="rotate(-40 42 38)" />
              <ellipse cx="54" cy="32" rx="3.5" ry="6" transform="rotate(25 54 32)" />
              <ellipse cx="60" cy="28" rx="3.5" ry="6" transform="rotate(35 60 28)" />
              <ellipse cx="66" cy="26" rx="3" ry="5" transform="rotate(45 66 26)" />
            </g>

            {/* Central krishi GUIDE text */}
            <text x="50" y="60" textAnchor="middle" fill="#15803d" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
              krishi
            </text>
            <text x="50" y="68" textAnchor="middle" fill="#16a34a" fontSize="5.5" fontWeight="600" letterSpacing="0.5" fontFamily="sans-serif">
              GUIDE
            </text>
          </svg>
        )}
      </div>
      {showText && (
        <div className={`mt-1 font-bold text-emerald-700 tracking-tight flex items-center gap-1 ${sizeMap[size].text}`}>
          <span>krishi</span>
          <span className="text-emerald-900 font-extrabold">Guide</span>
        </div>
      )}
    </div>
  );
};
