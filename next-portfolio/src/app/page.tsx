const socialLinks = [
  {
    label: "GitHub",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
        <path d="M12 .5A12 12 0 0 0 8.21 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.74.08-.74 1.21.09 1.85 1.24 1.85 1.24 1.08 1.85 2.83 1.32 3.52 1 .11-.78.42-1.32.77-1.62-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.37 11.37 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.78.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.47 5.92.43.37.81 1.11.81 2.24v3.32c0 .32.21.7.83.58A12 12 0 0 0 12 .5Z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
        <path d="M6.94 8.5A1.56 1.56 0 1 1 6.94 5.4a1.56 1.56 0 0 1 0 3.1ZM5.5 9.7h2.9V19H5.5V9.7Zm5.02 0h2.78v1.26h.04c.39-.73 1.33-1.5 2.73-1.5 2.92 0 3.46 1.92 3.46 4.42V19h-2.9v-17.62c0-1.14-.02-2.6-1.58-2.6-1.59 0-1.83 1.24-1.83 2.52V19H10.52V9.7Z" />
      </svg>
    ),
  },
  {
    label: "Email",
    href: "mailto:hello@allan.dev",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
        <path d="M3 6.75A2.75 2.75 0 0 1 5.75 4h12.5A2.75 2.75 0 0 1 21 6.75v10.5A2.75 2.75 0 0 1 18.25 20H5.75A2.75 2.75 0 0 1 3 17.25V6.75Zm2.12-.74 6.88 5.07a1.21 1.21 0 0 0 1.4 0l6.88-5.07H5.12Zm14.38 2.27-5.7 4.19a3.26 3.26 0 0 1-3.6 0L4.5 8.28v9.47c0 .66.54 1.2 1.2 1.2h12.6c.66 0 1.2-.54 1.2-1.2V8.28Z" />
      </svg>
    ),
  },
];

function NetworkBackground() {
  const points = [
    [110, 90], [260, 160], [180, 280], [320, 350], [510, 220], [720, 270], [870, 170],
    [930, 380], [760, 480], [610, 620], [440, 580], [300, 660], [190, 520], [120, 390],
    [440, 180], [660, 110], [830, 290], [600, 430], [360, 470], [250, 210], [720, 630],
  ];

  return (
    <svg
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full opacity-80"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="plexusGlow" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
          <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.72" />
        </linearGradient>
      </defs>

      {points.map((point, index) => {
        const [x, y] = point;
        return (
          <g key={`${x}-${y}-${index}`}>
            <circle cx={x} cy={y} r="2.4" fill="#7dd3fc" opacity="0.9" />
            {points.slice(index + 1).map(([x2, y2], nextIndex) => {
              const distance = Math.hypot(x2 - x, y2 - y);
              if (distance > 220) return null;
              return (
                <line
                  key={`${x}-${y}-${x2}-${y2}-${nextIndex}`}
                  x1={x}
                  y1={y}
                  x2={x2}
                  y2={y2}
                  stroke="url(#plexusGlow)"
                  strokeOpacity={0.16 + (220 - distance) / 550}
                  strokeWidth="1.1"
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),transparent_38%),radial-gradient(circle_at_bottom,_rgba(168,85,247,0.12),transparent_35%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(15,23,42,0.96),rgba(2,6,23,0.94))]" />
      <NetworkBackground />
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(125, 211, 252, 0.24) 1px, transparent 1.2px)",
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-[430px] rounded-[30px] border border-white/40 bg-white/80 shadow-[0_35px_90px_rgba(15,23,42,0.65)] backdrop-blur-2xl">
          <div className="px-6 pb-2 pt-7">
            <div className="flex flex-col items-center">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-slate-950/5 ring-4 ring-violet-400/60 shadow-[0_0_28px_rgba(139,92,246,0.7)]">
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-violet-500 via-indigo-500 to-cyan-400 opacity-90 blur-[2px]" />
                <img
                  src="https://img.magnific.com/free-photo/cartoon-man-wearing-glasses_23-2151136784.jpg?semt=ais_hybrid&w=740&q=80"
                  alt="Allan kimani"
                  className="relative h-[calc(100%-12px)] w-[calc(100%-12px)] rounded-full object-cover"
                />
              </div>

              <div className="mt-5 text-center">
                <h1 className="text-[2.3rem] font-semibold leading-[0.9] tracking-[-0.08em] text-slate-950">
                  Vibe~Tap
                </h1>
                <p className="mt-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-violet-600">
                  Software Engineer
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 pt-1">
            <button
              type="button"
              className="group relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-violet-600 px-5 py-3.5 text-base font-medium text-white shadow-[0_16px_32px_rgba(59,130,246,0.45)] transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
            >
              <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
              <span className="relative">Save Contact</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3 px-6 pb-6">
            {socialLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100/80 px-2 py-2.5 text-[0.68rem] font-medium tracking-[0.06em] text-slate-700 shadow-sm transition-colors hover:bg-slate-200/80"
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
