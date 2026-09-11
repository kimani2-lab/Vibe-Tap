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

const defaultProfile: Profile = {
  id: 1,
  slug: "Allan-kimani",
  full_name: "Allan kimani",
  headline: "FULL STACK SOFTWARE ENGINEER | BACKEND SPECIALIST",
  bio: "Fullstack Software Developer specializing in Python, Django REST Framework, Next.js, React, and Flutter. Passionate about building high-performance backend architectures, payment integrations, and modern web interfaces. Also experienced in building scalable mobile applications with Flutter and Dart, alongside robust Django backends. Skilled in database design, REST API engineering, and secure payment processing.",
  email: "kimania271@gmail.com",
  phone: "+254758288727",
  avatar_url:
    "https://img.magnific.com/free-photo/cartoon-man-wearing-glasses_23-2151136784.jpg?semt=ais_hybrid&w=740&q=80",
  social_links: {
    linkedin: "https://www.linkedin.com/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base%3BIpfK7DO%2FTvOhGr2JQvhMmQ%3D%3D",
    whatsapp: "https://wa.me/254758288727",
    github: "https://github.com/kimani2-lab",
    instagram: "https://www.instagram.com/blacksnowallynde/#",
  },
  projects: [],
};

const resolveApiBase = () =>
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

async function getProfileData(slug: string): Promise<Profile | null> {
  const normalizedSlug = slug?.trim();

  if (!normalizedSlug) {
    return null;
  }

  const apiBase = resolveApiBase().replace(/\/$/, "");
  const apiUrl = `${apiBase}/api/v1/portfolios/${encodeURIComponent(normalizedSlug)}/`;

  try {
    const response = await fetch(apiUrl, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (response.ok) {
      const data = await response.json();
      const mergedProfile = {
        ...defaultProfile,
        ...data,
        slug: data.slug || normalizedSlug,
        social_links: {
          ...defaultProfile.social_links,
          ...(data.social_links || {}),
        },
      } satisfies Profile;

      return mergedProfile;
    }

    if (normalizedSlug.toLowerCase() === "allan-kimani") {
      return defaultProfile;
    }

    return null;
  } catch (error) {
    if (normalizedSlug.toLowerCase() === "allan-kimani") {
      return defaultProfile;
    }
    return null;
  }
}

const socialPlatforms = [
  {
    key: "linkedin",
    label: "LinkedIn",
    path: "M6.94 8.5A1.56 1.56 0 1 1 6.94 5.4a1.56 1.56 0 0 1 0 3.1ZM5.5 9.7h2.9V19H5.5V9.7Zm5.02 0h2.78v1.26h.04c.39-.73 1.33-1.5 2.73-1.5 2.92 0 3.46 1.92 3.46 4.42V19h-2.9v-17.62c0-1.14-.02-2.6-1.58-2.6-1.59 0-1.83 1.24-1.83 2.52V19H10.52V9.7Z",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    path: "M12.04 2a9.96 9.96 0 0 0-8.59 15.16L2 22l5.01-1.32A9.97 9.97 0 1 0 12.04 2ZM8.87 7.76c.2-.2.5-.31.79-.31h.02c.24 0 .49.08.69.29l.87 1.05c.2.24.25.56.13.85-.12.3-.2.57-.38.83-.18.25-.37.5-.57.74-.17.21-.31.45-.15.8.21.43.95 1.79 2.14 2.8 1.47 1.25 2.78 1.46 3.29 1.56.4.08.65-.08.88-.28.27-.22.56-.46.86-.71.25-.2.54-.18.8-.04l1.01.64c.15.1.37.2.52.22.15.02.26 0 .38-.12.2-.22.84-1.09 1.01-1.43.12-.24.12-.44 0-.63-.15-.24-.68-.47-1.17-.86-.51-.4-1.1-.95-1.38-1.17-.37-.3-.8-.35-1.16-.15-.19.1-.33.26-.46.42-.17.21-.32.37-.52.52-.2.16-.45.11-.67-.03-.44-.28-.86-.58-1.28-.88-.33-.24-.68-.52-1-.75-.22-.17-.5-.2-.75-.09-.25.12-.7.52-1.07.86-.3.28-.64.56-.82.51-.16-.04-.42-.16-.76-.36-.29-.17-.62-.42-1-.76-.37-.34-.71-.73-.96-1.08-.18-.28-.15-.58.03-.84l.12-.18Z",
  },
  {
    key: "github",
    label: "GitHub",
    path: "M12 .5A12 12 0 0 0 8.21 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.74.08-.74 1.21.09 1.85 1.24 1.85 1.24 1.08 1.85 2.83 1.32 3.52 1 .11-.78.42-1.32.77-1.62-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.37 11.37 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.78.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.47 5.92.43.37.81 1.11.81 2.24v3.32c0 .32.21.7.83.58A12 12 0 0 0 12 .5Z",
  },
  {
    key: "instagram",
    label: "Instagram",
    path: "M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7Zm5 3.2A4.8 4.8 0 1 1 7.2 12 4.8 4.8 0 0 1 12 7.2Zm0 2A2.8 2.8 0 1 0 14.8 12 2.8 2.8 0 0 0 12 9.2Zm5.2-3.7a1.2 1.2 0 1 1-1.2 1.2 1.2 1.2 0 0 1 1.2-1.2Z",
  },
];

export default function PortfolioViewer() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "";
  const apiBase = resolveApiBase();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      const data = await getProfileData(slug);
      if (!isMounted) return;
      setProfile(data);
      setLoading(false);
    };

    if (slug) {
      loadProfile();
      return () => {
        isMounted = false;
      };
    }

    setProfile(defaultProfile);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    if (!profile) return;

    const vCardUrl = `${apiBase.replace(/\/$/, "")}/api/vcard/${encodeURIComponent(profile.slug)}/`;
    window.location.href = vCardUrl;
  }, [apiBase, profile]);

  const finalAvatarUrl = useMemo(() => {
    if (!profile?.avatar_url) return null;
    const url = profile.avatar_url;
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
      return url;
    }
    return `${apiBase.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
  }, [apiBase, profile?.avatar_url]);

  const socialLinks = useMemo(() => {
    return socialPlatforms
      .filter(({ key }) => !!profile?.social_links?.[key])
      .map(({ key, label, path }) => ({
        key,
        label,
        href: profile?.social_links?.[key] || "#",
        path,
      }));
  }, [profile]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black p-4 text-slate-900">
        <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl shadow-slate-900/20">
          <p className="text-center text-sm font-medium text-slate-600">Loading profile...</p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black p-4 text-slate-900">
        <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl shadow-slate-900/20">
          <p className="text-center text-sm font-medium text-slate-600">Profile not found.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl shadow-slate-900/25">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[2px]">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-white">
              {finalAvatarUrl ? (
                <img
                  src={finalAvatarUrl}
                  alt={profile.full_name}
                  className="h-full w-full rounded-full object-cover"
                  onError={(event) => {
                    const fallback = event.currentTarget.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.style.display = "flex";
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : null}
              <span
                className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-2xl font-bold text-transparent"
                style={{ display: finalAvatarUrl ? "none" : "inline-block" }}
              >
                {profile.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-900">
              {profile.full_name}
            </h1>
            {profile.headline && (
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {profile.headline}
              </p>
            )}
          </div>
        </div>

        {profile.bio && (
          <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50 p-4">
            <p className="text-sm leading-6 text-slate-700">{profile.bio}</p>

            <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 text-slate-700">
                  <path
                    d="M3 7.75A2.75 2.75 0 0 1 5.75 5h12.5A2.75 2.75 0 0 1 21 7.75v8.5A2.75 2.75 0 0 1 18.25 19H5.75A2.75 2.75 0 0 1 3 16.25v-8.5Zm2.12-.25 6.88 5.07a1.21 1.21 0 0 0 1.4 0l6.88-5.07H5.12Zm14.38 2.36-5.7 4.18a3.26 3.26 0 0 1-3.6 0L4.5 9.86v6.39c0 .66.54 1.2 1.2 1.2h12.6c.66 0 1.2-.54 1.2-1.2V9.86Z"
                    fill="currentColor"
                  />
                </svg>
                <a
                  href="mailto:kimania271@gmail.com"
                  className="text-xs font-medium text-slate-800 transition-colors hover:text-slate-600"
                >
                  kimania271@gmail.com
                </a>
              </div>

              <div className="mt-2 flex items-center gap-3">
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 text-slate-700">
                  <path
                    d="M6.6 10.8a15.82 15.82 0 0 0 6.6 6.6l2.2-2.2a1.1 1.1 0 0 1 1.1-.26c1.2.4 2.5.61 3.8.61a1.1 1.1 0 0 1 1.1 1.1V20a1.1 1.1 0 0 1-1.1 1.1C11.94 21.1 2.9 12.06 2.9 4.1A1.1 1.1 0 0 1 4 3h3.7a1.1 1.1 0 0 1 1.1 1.1c0 1.3.2 2.6.61 3.8a1.1 1.1 0 0 1-.26 1.1L6.6 10.8Z"
                    fill="currentColor"
                  />
                </svg>
                <a
                  href="tel:+254758288727"
                  className="text-xs font-medium text-slate-800 transition-colors hover:text-slate-600"
                >
                  +254 758 288 727
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <button
            type="button"
            onClick={() => {
              const vCardUrl = `${apiBase.replace(/\/$/, "")}/api/vcard/${encodeURIComponent(profile.slug)}/`;
              window.location.href = vCardUrl;
            }}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition-transform duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            Save Contact
          </button>
        </div>

        {socialLinks.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {socialLinks.map(({ key, label, href, path }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-2 py-2.5 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-200"
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4 fill-current">
                  <path d={path} />
                </svg>
                <span>{label}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
