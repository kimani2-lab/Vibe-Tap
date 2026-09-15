import { notFound } from "next/navigation";
import AgentProfileCard, { AgentData } from "@/components/AgentProfileCard";
import LegacyPortfolioCard, { LegacyProfile } from "@/components/LegacyPortfolioCard";
import PortfolioProfileCard, { PortfolioData } from "@/components/PortfolioProfileCard";
import { findProfile } from "@/lib/data";

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

async function fetchPortfolio(identifier: string): Promise<PortfolioData | undefined> {
  const response = await fetch(`${apiBase()}/api/v1/portfolios/${encodeURIComponent(identifier)}/`, {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) return undefined;

  const data = await response.json();
  return {
    slug: data.slug,
    full_name: data.full_name,
    headline: data.headline,
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
  const localProfile = findProfile(slug);

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
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
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
          }}
        />
      </main>
    );
  }

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

  const portfolio = await fetchPortfolio(slug);
  if (portfolio) return <PortfolioProfileCard profile={portfolio} />;

  notFound();
}