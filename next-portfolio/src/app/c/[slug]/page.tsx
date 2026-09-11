"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

interface Project {
  id: number;
  title: string;
  description: string;
  project_url: string;
  cover_image: string;
}

interface Profile {
  id: number;
  slug: string;
  full_name: string;
  headline: string;
  bio: string;
  email: string;
  phone: string;
  avatar_url: string;
  social_links: Record<string, string>;
  projects: Project[];
}

export default function PortfolioViewer() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "";
  const backendBase = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const apiRes = await fetch(`${backendBase}/api/v1/portfolios/${slug}/`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        if (!apiRes.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        const data = await apiRes.json();
        setProfile(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [backendBase, slug]);

  useEffect(() => {
    if (!profile) return;

    const vCardUrl = `${backendBase}/api/vcard/${profile.slug}/`;
    fetch(vCardUrl, {
      credentials: "omit",
    });
  }, [backendBase, profile]);

  const finalAvatarUrl = useMemo(() => {
    if (!profile?.avatar_url) return null;
    const url = profile.avatar_url;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    return `${backendBase}${url.startsWith("/") ? "" : "/"}${url}`;
  }, [backendBase, profile?.avatar_url]);

  if (loading) {
    return <main className="min-h-screen ...">Loading profile…</main>;
  }

  if (notFound || !profile) {
    return <main className="min-h-screen ...">Profile not found.</main>;
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-6">
        <header className="flex items-center gap-4 text-left">
          <div className="w-24 h-24 shrink-0 rounded-full overflow-hidden border-2 border-indigo-500 bg-zinc-800 flex items-center justify-center relative">
            {finalAvatarUrl ? (
              <img
                src={finalAvatarUrl}
                alt={profile.full_name}
                className="w-full h-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                  const fallback = event.currentTarget.nextElementSibling as HTMLElement | null;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            ) : null}

            <div
              className="hidden w-full h-full items-center justify-center text-2xl font-bold text-zinc-500"
              style={{ display: finalAvatarUrl ? "none" : "flex" }}
            >
              {profile.full_name.slice(0, 1).toUpperCase()}
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-white break-words">{profile.full_name}</h1>
            {profile.headline && <p className="text-indigo-400 text-sm font-medium">{profile.headline}</p>}
          </div>
        </header>

        {profile.bio && (
          <p className="text-zinc-400 text-sm leading-relaxed text-center">"{profile.bio}"</p>
        )}

        <div>
          <button
            type="button"
            onClick={() => {
              const vCardUrl = `${backendBase}/api/vcard/${profile.slug}/`;
              fetch(vCardUrl, {
                credentials: "omit",
              });
            }}
            className="block w-full bg-indigo-600 hover:bg-indigo-500 text-white text-center py-3 rounded-xl text-sm font-medium transition-colors shadow-lg"
          >
            Save Contact
          </button>
          <p className="text-zinc-500 text-xs text-center mt-2">
            Opens native address book to save vCard
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t border-zinc-800/60 text-sm">
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="block text-indigo-400 hover:underline">
              ✉ {profile.email}
            </a>
          )}
          {profile.phone && (
            <a href={`tel:${profile.phone}`} className="block text-indigo-400 hover:underline">
              📞 {profile.phone}
            </a>
          )}
        </div>

        {profile.social_links && (
          <div className="flex flex-wrap gap-2 pt-2">
            {Object.entries(profile.social_links).map(([platform, url]) => (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-xs text-indigo-400 rounded-full capitalize transition border border-zinc-700/50"
              >
                {platform}
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}