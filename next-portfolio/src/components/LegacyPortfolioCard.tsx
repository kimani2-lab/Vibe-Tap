"use client";

import { useState } from "react";

export interface LegacyProject {
  id: number;
  title: string;
  description: string;
  project_url: string;
  cover_image: string;
}

export interface LegacyProfile {
  id: number;
  slug: string;
  full_name: string;
  headline: string;
  bio: string;
  email: string;
  phone: string;
  avatar_url: string;
  social_links: Record<string, string>;
  projects: LegacyProject[];
}

export default function LegacyPortfolioCard({ profile, apiBase }: { profile: LegacyProfile; apiBase: string }) {
  const [showProjects, setShowProjects] = useState(false);
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=4338ca&color=fff&bold=true&size=256`;
  const avatarUrl = profile.avatar_url || fallbackAvatar;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <article className="w-full max-w-md rounded-[30px] border border-slate-200 bg-white p-6 shadow-2xl shadow-black/30">
        <div className="flex items-center gap-4">
          <img src={avatarUrl} alt={profile.full_name} onError={(event) => { event.currentTarget.src = fallbackAvatar; }} className="h-16 w-16 rounded-full object-cover ring-4 ring-indigo-100" />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-slate-950">{profile.full_name}</h1>
            {profile.headline ? <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">{profile.headline}</p> : null}
          </div>
        </div>

        {profile.bio ? <p className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{profile.bio}</p> : null}

        <section className="mt-6" aria-labelledby="portfolio-projects-heading">
          <div className="flex items-center justify-between">
            <h2 id="portfolio-projects-heading" className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Projects</h2>
            <span className="text-xs text-slate-400">{profile.projects.length}</span>
          </div>
          {profile.projects.length ? (
            <>
              <button type="button" onClick={() => setShowProjects((visible) => !visible)} aria-expanded={showProjects} className="mt-3 flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-3 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-50">
                {showProjects ? "Hide projects" : "View projects"}
                <span aria-hidden="true">{showProjects ? "^" : "->"}</span>
              </button>
              {showProjects ? <div className="mt-3 space-y-3">{profile.projects.map((project) => <div key={project.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-900">{project.title}</h3><p className="mt-1 text-sm leading-5 text-slate-600">{project.description}</p></div>{project.project_url ? <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="shrink-0 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white">Open</a> : null}</div></div>)}</div> : null}
            </>
          ) : <p className="mt-3 rounded-2xl border border-dashed border-slate-300 px-4 py-5 text-center text-sm text-slate-500">No projects added yet.</p>}
        </section>

        <button type="button" onClick={() => window.open(`${apiBase.replace(/\/$/, "")}/api/vcard/${encodeURIComponent(profile.slug)}/`, "_blank", "noopener,noreferrer")} className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-105">Save Contact</button>
        <div className="mt-4 flex gap-4 text-xs font-medium text-slate-500"><a href={`mailto:${profile.email}`}>{profile.email}</a><a href={`tel:${profile.phone}`}>{profile.phone}</a></div>
      </article>
    </main>
  );
}
