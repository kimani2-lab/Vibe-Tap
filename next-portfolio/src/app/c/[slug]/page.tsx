import { notFound } from "next/navigation";
import AgentProfileCard, { AgentData } from "@/components/AgentProfileCard";
import LegacyPortfolioCard, { LegacyProfile } from "@/components/LegacyPortfolioCard";

interface ResolverError {
  status: number;
  message: string;
}

interface AgentResolverData {
  profile_type?: string;
  agent_id?: string | null;
  [key: string]: unknown;
}

const apiBase = () =>
  (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000").replace(/\/$/, "");

async function fetchResolver(identifier: string): Promise<{ data?: AgentResolverData; error?: ResolverError }> {
  const response = await fetch(`${apiBase()}/api/v1/agent/${encodeURIComponent(identifier)}/`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (response.ok) {
    return { data: await response.json() };
  }

  if (response.status === 403) {
    return { error: { status: 403, message: "This NFC card has been reported lost or deactivated." } };
  }

  if (response.status !== 404) {
    return { error: { status: response.status, message: "The profile service is temporarily unavailable." } };
  }

  return {};
}

function isAgentProfile(data: unknown): data is AgentResolverData {
  if (!data || typeof data !== "object") return false;
  const candidate = data as Partial<AgentResolverData>;
  return candidate.profile_type === "AGENT" || typeof candidate.agent_id === "string";
}

function LockedCardNotice({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <section role="alert" className="w-full max-w-md rounded-3xl border border-rose-400/30 bg-slate-900 p-7 text-center shadow-2xl shadow-black/40">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/15 text-2xl text-rose-300" aria-hidden="true">!</div>
        <h1 className="mt-5 text-xl font-semibold text-white">Card locked</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">{message}</p>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Please contact the issuing supervisor</p>
      </section>
    </main>
  );
}

export default async function AgentResolverPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resolver = await fetchResolver(slug);

  if (resolver.error?.status === 403) {
    return <LockedCardNotice message={resolver.error.message} />;
  }

  if (resolver.error && resolver.error.status !== 404) {
    return <LockedCardNotice message={resolver.error.message} />;
  }

  if (resolver.data) {
    if (isAgentProfile(resolver.data)) {
      return <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-950"><AgentProfileCard agent={resolver.data as unknown as AgentData} /></main>;
    }

    return <LegacyPortfolioCard profile={resolver.data as LegacyProfile} apiBase={apiBase()} />;
  }

  notFound();
}