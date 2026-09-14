import SupervisorRegisterForm from "@/components/SupervisorRegisterForm";

export const metadata = {
  title: "Register Agent | SasaPay",
  description: "Supervisor portal for registering SasaPay agents and NFC cards.",
};

export default function SupervisorRegisterPage() {
  return (
    <main className="relative min-h-screen bg-[#020617] px-4 py-8 overflow-hidden">
      <div className="flex items-center justify-center">
        <div className="max-w-sm w-full bg-[#002b2b] rounded-[32px] border border-slate-800 overflow-hidden shadow-2xl">
          <header className="h-44 bg-white relative p-4 flex justify-between items-start">
            <div>
              <img src="/sasapay-logo.png" alt="SasaPay" className="h-7 w-auto" />
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">
                Authorized Agent Network
              </p>
            </div>
            <span className="bg-[#002b2b] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Verified
            </span>
          </header>

          <div className="bg-[#002b2b] px-6 pb-6 pt-2 rounded-t-[28px] relative -mt-4">
            <div className="flex justify-between items-end -mt-14 mb-4">
              <div className="w-24 h-24 rounded-full border-4 border-[#002b2b] overflow-hidden bg-slate-800 shadow-lg relative z-10">
                <img
                  src="/placeholder-avatar.png"
                  alt="Agent avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Verified Agent
              </span>
            </div>

            <div className="space-y-1 mb-6">
              <p className="text-xs font-mono font-bold text-cyan-400">AG-8821</p>
              <h1 className="text-2xl font-extrabold text-white">Agent Name</h1>
              <p className="text-sm text-slate-300">SasaPay Authorized Agent</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md">
        <SupervisorRegisterForm />
      </div>
    </main>
  );
}