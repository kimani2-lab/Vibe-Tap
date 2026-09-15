import SupervisorRegisterForm from "@/components/SupervisorRegisterForm";

export const metadata = {
  title: "Register Agent | SasaPay",
  description: "Supervisor portal for registering SasaPay agents and NFC cards.",
};

export default function SupervisorRegisterPage() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[#001b5e] via-[#00318b] to-[#001040] p-4 sm:p-8">
      <div className="pointer-events-none absolute -left-12 -top-12 h-40 w-40 -rotate-45">
        <div className="mb-2 h-6 w-full bg-[#e61c24] shadow-lg shadow-red-950/40" />
        <div className="h-8 w-full bg-[#00a3e0] shadow-lg shadow-cyan-950/40" />
      </div>

      <div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 -rotate-45">
        <div className="mb-2 h-8 w-full bg-[#00a3e0] shadow-lg shadow-cyan-950/40" />
        <div className="h-6 w-full bg-[#e61c24] shadow-lg shadow-red-950/40" />
      </div>

      <div className="pointer-events-none absolute -bottom-72 -left-56 h-[620px] w-[620px] rounded-full border border-[#40c4ff]/30 shadow-[0_0_70px_rgba(0,163,224,0.24)]" />
      <div className="pointer-events-none absolute -bottom-80 -left-40 h-[520px] w-[520px] rounded-full border border-[#00a3e0]/20" />
      <div className="pointer-events-none absolute -bottom-72 -right-56 h-[620px] w-[620px] rounded-full border border-[#40c4ff]/25 shadow-[0_0_70px_rgba(0,163,224,0.18)]" />
      <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full border border-blue-400/20" />

      <div className="pointer-events-none absolute right-12 top-8 grid grid-cols-4 gap-2 opacity-40" aria-hidden="true">
        {Array.from({ length: 16 }).map((_, index) => <span key={`top-right-${index}`} className="h-1.5 w-1.5 rounded-full bg-cyan-300" />)}
      </div>
      <div className="pointer-events-none absolute bottom-12 left-12 grid grid-cols-4 gap-2 opacity-40" aria-hidden="true">
        {Array.from({ length: 16 }).map((_, index) => <span key={`bottom-left-${index}`} className="h-1.5 w-1.5 rounded-full bg-cyan-300" />)}
      </div>

      <div className="absolute left-8 top-8 z-20 flex items-center gap-2 sm:left-12 sm:top-10">
        <img src="/sasapay-mark.svg" alt="SasaPay symbol" className="h-10 w-10 shrink-0 object-contain" />
        <span className="text-2xl font-black tracking-tight text-white">Sasa<span className="text-[#e61c24]">Pay</span></span>
        <span className="border-l border-cyan-400/40 pl-2 text-[10px] italic text-cyan-200">every coin counts</span>
      </div>

      <div className="relative z-10 mt-16 w-full max-w-2xl sm:mt-10">
        <SupervisorRegisterForm />
      </div>
    </main>
  );
}