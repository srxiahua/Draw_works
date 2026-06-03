export function RabbitMascot({ className }: { className?: string }) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <svg
        viewBox="0 0 200 220"
        className="mascot-bounce h-40 w-40 md:h-48 md:w-48"
        aria-hidden
      >
        <defs>
          <linearGradient id="earGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbcfe8" />
            <stop offset="100%" stopColor="#f9a8d4" />
          </linearGradient>
          <linearGradient id="faceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff5f7" />
            <stop offset="100%" stopColor="#fce7f3" />
          </linearGradient>
        </defs>
        {/* 左耳 */}
        <ellipse cx="62" cy="52" rx="22" ry="48" fill="url(#earGrad)" transform="rotate(-12 62 52)" />
        <ellipse cx="62" cy="52" rx="12" ry="32" fill="#fda4af" opacity="0.5" transform="rotate(-12 62 52)" />
        {/* 右耳 */}
        <ellipse cx="138" cy="52" rx="22" ry="48" fill="url(#earGrad)" transform="rotate(12 138 52)" />
        <ellipse cx="138" cy="52" rx="12" ry="32" fill="#fda4af" opacity="0.5" transform="rotate(12 138 52)" />
        {/* 脸 */}
        <ellipse cx="100" cy="118" rx="68" ry="62" fill="url(#faceGrad)" stroke="#f9a8d4" strokeWidth="2" />
        {/* 眼睛 */}
        <ellipse cx="78" cy="112" rx="10" ry="12" fill="#4c1d95" />
        <ellipse cx="122" cy="112" rx="10" ry="12" fill="#4c1d95" />
        <circle cx="81" cy="108" r="3.5" fill="white" />
        <circle cx="125" cy="108" r="3.5" fill="white" />
        {/* 腮红 */}
        <ellipse cx="62" cy="128" rx="12" ry="7" fill="#fb7185" opacity="0.45" />
        <ellipse cx="138" cy="128" rx="12" ry="7" fill="#fb7185" opacity="0.45" />
        {/* 鼻子 */}
        <ellipse cx="100" cy="128" rx="5" ry="4" fill="#f472b6" />
        {/* 嘴 */}
        <path d="M 92 136 Q 100 144 108 136" fill="none" stroke="#be185d" strokeWidth="2" strokeLinecap="round" />
        {/* 画笔 */}
        <rect x="148" y="150" width="8" height="36" rx="3" fill="#a78bfa" transform="rotate(25 152 168)" />
        <polygon points="152,186 156,198 148,198" fill="#fbbf24" transform="rotate(25 152 192)" />
        {/* 小星星 */}
        <text x="36" y="90" fontSize="18" fill="#fde047">✦</text>
        <text x="158" y="78" fontSize="14" fill="#c4b5fd">★</text>
      </svg>
    </div>
  );
}
