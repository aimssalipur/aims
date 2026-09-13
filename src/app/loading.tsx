import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/95 backdrop-blur-2xl select-none">
      {/* Soft brand glow background */}
      <div className="absolute w-80 h-80 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col items-center max-w-sm w-full px-6 text-center">
        {/* Animated SVG Medical Kit with Blinkit Bounce */}
        <div className="relative flex flex-col items-center mb-5">
          <div className="blinkit-bounce-icon relative">
            <svg
              viewBox="0 0 160 150"
              className="w-24 h-24 sm:w-28 sm:h-28 drop-shadow-xl"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="loadBagGrad" x1="20" y1="40" x2="140" y2="140" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1E3A8A" />
                  <stop offset="60%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#1D4ED8" />
                </linearGradient>
                <linearGradient id="loadBorderGrad" x1="30" y1="40" x2="130" y2="140" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#60A5FA" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>

              {/* Bag Handle */}
              <path
                d="M58 46V30C58 20 68 14 80 14C92 14 102 20 102 30V46"
                stroke="#F59E0B"
                strokeWidth="6.5"
                strokeLinecap="round"
              />

              {/* Main Medical Kit Body */}
              <rect
                x="20"
                y="44"
                width="120"
                height="92"
                rx="26"
                fill="url(#loadBagGrad)"
                stroke="url(#loadBorderGrad)"
                strokeWidth="3.5"
              />

              {/* Cross Emblem */}
              <rect x="71" y="68" width="18" height="48" rx="5" fill="white" />
              <rect x="56" y="83" width="48" height="18" rx="5" fill="white" />
              <rect x="74" y="71" width="12" height="42" rx="3" fill="#10B981" />
              <rect x="59" y="86" width="42" height="12" rx="3" fill="#10B981" />

              {/* Glowing Heartbeat */}
              <path
                d="M26 116H46L54 106L62 126L72 98L81 122L89 110L96 118H134"
                stroke="#F59E0B"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {/* Animated Floor Shadow */}
          <div className="blinkit-shadow h-2 w-16 bg-slate-400/30 rounded-full blur-xs mt-1" />
        </div>

        {/* Brand & Loading Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 shadow-xs mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
            Loading AIMS Salipur...
          </span>
        </div>

        {/* Candy Striped Progress Bar */}
        <div className="w-48 sm:w-56 h-2 bg-slate-200/80 rounded-full overflow-hidden p-0.5 shadow-inner relative border border-slate-200">
          <div className="h-full rounded-full w-2/3 bg-gradient-to-r from-aims-navy via-aims-green to-aims-gold relative overflow-hidden animate-[loadFill_1.2s_ease-in-out_infinite_alternate]">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.3)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.3)_50%,rgba(255,255,255,0.3)_75%,transparent_75%,transparent)] bg-[length:14px_14px]" />
          </div>
        </div>

        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2.5">
          Odisha&apos;s #1 Nursing Academy
        </p>
      </div>

      <style>{`
        .blinkit-bounce-icon {
          animation: blinkitBounce 0.75s cubic-bezier(0.28, 0.84, 0.42, 1) infinite alternate;
        }

        .blinkit-shadow {
          animation: blinkitShadow 0.75s cubic-bezier(0.28, 0.84, 0.42, 1) infinite alternate;
        }

        @keyframes blinkitBounce {
          0% {
            transform: translateY(0) scale(1.08, 0.92);
          }
          100% {
            transform: translateY(-20px) scale(0.92, 1.08);
          }
        }

        @keyframes blinkitShadow {
          0% {
            transform: scale(1.15);
            opacity: 0.6;
          }
          100% {
            transform: scale(0.65);
            opacity: 0.2;
          }
        }

        @keyframes loadFill {
          0% {
            width: 25%;
          }
          100% {
            width: 85%;
          }
        }
      `}</style>
    </div>
  );
}
