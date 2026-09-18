import { notFound } from "next/navigation";
import AgentProfileCard, { AgentData } from "@/components/AgentProfileCard";
import LegacyPortfolioCard, { LegacyProfile } from "@/components/LegacyPortfolioCard";
import PortfolioProfileCard, { PortfolioData } from "@/components/PortfolioProfileCard";
import { findProfile } from "@/lib/data";

// This route is intentionally dynamic and uncached so agent updates from the live Django/PostgreSQL backend
// are reflected on every request without a Vercel rebuild or manual cache clear.
export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    },
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

async function fetchPortfolio(identifier: string): Promise<PortfolioData | undefined> {
  const response = await fetch(`${apiBase()}/api/v1/portfolios/${encodeURIComponent(identifier)}/`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
    },
  });

  if (!response.ok) return undefined;

  const data = await response.json();
  return {
    slug: data.slug,
    full_name: data.full_name,
    headline: data.headline || data.title || "",
    email: data.email,
    phone: data.phone,
    location: data.location || "",
    avatar_url: data.avatar_url,
    socials: Object.entries(data.social_links || {}).map(([name, url]) => ({ name, url: String(url) })),
    projects: (data.projects || []).map((project: { title: string; description: string; project_url?: string; tech?: string[] }) => ({
      title: project.title,
      desc: project.description,
      tech: project.tech || [],
      link: project.project_url,
    })),
  };
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
  const cleanSlug = slug.trim().toLowerCase().replace(/_/g, "-");

  // Local profiles are compile-time baked into lib/data.ts and therefore require a code change + redeploy
  // to reflect changes. The API-resolved path below is the one that supports instant live updates.
  const localProfile = findProfile(cleanSlug);

  if (localProfile?.type === "portfolio") {
    const portfolio: PortfolioData = {
      full_name: localProfile.full_name,
      slug: localProfile.slug,
      headline: localProfile.headline,
      email: localProfile.email,
      phone: localProfile.phone,
      location: localProfile.location,
      avatar_url: localProfile.avatar_url,
      socials: Object.entries(localProfile.social_links || {}).map(([name, url]) => ({ name, url })),
      projects: (localProfile.projects || []).map((project) => ({
        title: project.title,
        desc: project.description,
        tech: project.tech,
        link: project.project_url,
      })),
    };

    return <PortfolioProfileCard profile={portfolio} />;
  }

  if (localProfile?.type === "agent") {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_20%,#111722_0%,#080a0f_46%,#05070b_100%)] p-4">
        <div className="pointer-events-none absolute -left-10 -top-12 h-36 w-36 -rotate-45 opacity-90" aria-hidden="true">
          <div className="absolute left-0 top-5 h-2 w-44 bg-[#2563eb]" />
          <div className="absolute left-0 top-11 h-2 w-44 bg-[#e11d48]" />
          <div className="absolute left-0 top-[68px] h-1.5 w-36 bg-[#2563eb]" />
        </div>
        <div className="pointer-events-none absolute -right-48 -top-48 h-[520px] w-[520px] rounded-full border border-white/[0.035]" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-32 -top-32 h-[380px] w-[380px] rounded-full border border-white/[0.025]" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-72 -left-72 h-[620px] w-[620px] rounded-full border border-cyan-400/[0.13] shadow-[0_0_70px_rgba(0,163,224,0.08)]" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-56 -left-56 h-[470px] w-[470px] rounded-full border border-blue-500/[0.08]" aria-hidden="true" />
        <div className="pointer-events-none absolute right-8 top-1/3 grid grid-cols-4 gap-2 opacity-60" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, index) => <span key={`profile-dot-${index}`} className="h-1.5 w-1.5 rounded-full bg-cyan-400" />)}
        </div>
        <div className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rotate-[-45deg] opacity-80" aria-hidden="true">
          <div className="absolute bottom-5 right-0 h-2 w-40 bg-[#2563eb]" />
          <div className="absolute bottom-11 right-0 h-2 w-40 bg-[#e11d48]" />
        </div>
        <AgentProfileCard
          agent={{
            agent_id: localProfile.agent_id || localProfile.slug,
            slug: localProfile.slug,
            full_name: localProfile.full_name,
            headline: localProfile.headline,
            phone: localProfile.phone,
            email: localProfile.email,
            avatar_url: localProfile.avatar_url,
            is_verified: localProfile.is_verified ?? false,
            referral_code: localProfile.referral_code || "",
            services_offered: localProfile.services_offered || [],
            app_download_url: localProfile.app_download_url || "#",
            payment_url: localProfile.payment_url,
          }}
        />
      </main>
    );
  }

  const resolver = await fetchResolver(cleanSlug);

  if (resolver.error?.status === 403) {
    return <LockedCardNotice message={resolver.error.message} />;
  }

  if (resolver.error && resolver.error.status !== 404) {
    return <LockedCardNotice message={resolver.error.message} />;
  }

  if (resolver.data) {
    if (isAgentProfile(resolver.data)) {
      const apiAgent = resolver.data as AgentResolverData & {
        sasapay_checkout_url?: string | null;
      };

      return (
        <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_50%_20%,#111722_0%,#080a0f_46%,#05070b_100%)] p-4">
          <div className="pointer-events-none absolute -left-10 -top-12 h-36 w-36 -rotate-45 opacity-90" aria-hidden="true">
            <div className="absolute left-0 top-5 h-2 w-44 bg-[#2563eb]" />
            <div className="absolute left-0 top-11 h-2 w-44 bg-[#e11d48]" />
            <div className="absolute left-0 top-[68px] h-1.5 w-36 bg-[#2563eb]" />
          </div>
          <div className="pointer-events-none absolute -right-48 -top-48 h-[520px] w-[520px] rounded-full border border-white/[0.035]" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-72 -left-72 h-[620px] w-[620px] rounded-full border border-cyan-400/[0.13] shadow-[0_0_70px_rgba(0,163,224,0.08)]" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-56 -left-56 h-[470px] w-[470px] rounded-full border border-blue-500/[0.08]" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-56 -left-56 h-[470px] w-[470px] rounded-full border border-blue-500/[0.08]" aria-hidden="true" />
          <div className="pointer-events-none absolute right-8 top-1/3 grid grid-cols-4 gap-2 opacity-60" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, index) => <span key={`profile-dot-${index}`} className="h-1.5 w-1.5 rounded-full bg-cyan-400" />)}
          </div>
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rotate-[-45deg] opacity-80" aria-hidden="true">
            <div className="absolute bottom-5 right-0 h-2 w-40 bg-[#2563eb]" />
            <div className="absolute bottom-11 right-0 h-2 w-40 bg-[#e11d48]" />
          </div>
          <AgentProfileCard
            agent={{
              ...(apiAgent as unknown as AgentData),
              payment_url: apiAgent.sasapay_checkout_url ?? undefined,
            }}
          />
        </main>
      );
    }

    return <LegacyPortfolioCard profile={resolver.data as LegacyProfile} apiBase={apiBase()} />;
  }

  const portfolio = await fetchPortfolio(cleanSlug);
  if (portfolio) return <PortfolioProfileCard profile={portfolio} />;

  notFound();
}