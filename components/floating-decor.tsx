export function FloatingDecor() {
  const items = [
    { char: "✦", top: "8%", left: "6%", delay: "0s", size: "text-lg" },
    { char: "★", top: "15%", right: "8%", delay: "1.2s", size: "text-xl" },
    { char: "🌸", top: "35%", left: "3%", delay: "0.6s", size: "text-2xl" },
    { char: "✧", top: "55%", right: "4%", delay: "2s", size: "text-lg" },
    { char: "🌸", top: "72%", left: "10%", delay: "1.8s", size: "text-xl" },
    { char: "★", top: "85%", right: "12%", delay: "0.3s", size: "text-lg" },
  ];

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {items.map((item, i) => (
        <span
          key={i}
          className={`float-decor absolute ${item.size} opacity-40`}
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
            animationDelay: item.delay,
          }}
        >
          {item.char}
        </span>
      ))}
    </div>
  );
}
