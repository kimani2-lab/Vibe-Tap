"use client"

import Image from "next/image"
import { useState, useEffect } from "react"

interface Project {
  id: number
  title: string
  description: string
  project_url: string
  cover_image: string
}

interface Profile {
  id: number
  slug: string
  full_name: string
  headline: string
  bio: string
  email: string
  phone: string
  avatar_url: string
  social_links: Record<string, string>
  projects: Project[]
}

export default function PortfolioViewer({ params }: { params: { slug: string } }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const apiRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/portfolios/${params.slug}/`,
          {
            cache: 'no-store',
          }
        )
        if (!apiRes.ok) throw new Error('Profile not found')
        const data = await apiRes.json()
        setProfile(data)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [params.slug])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="animate-pulse w-16 h-16 rounded-full bg-zinc-200 dark:bg-zinc-700 mb-4"></div>
        <p className="text-zinc-600">Loading portfolio...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-red-600">Portfolio not found.</p>
        <a href="/" className="mt-2 text-blue-600">Go home</a>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-zinc-600">No portfolio data.</p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950">
      <div className="max-w-portfolio mx-auto p-4 pb-6">
        {/* Profile Header */}
        <header className="text-center mb-6">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name}
              width={120}
              height={120}
              className="rounded-full mx-auto mb-3 object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-zinc-300 dark:bg-zinc-600 flex items-center justify-center text-zinc-50 text-3xl mb-3">
              {profile.full_name.charAt(0)}
            </div>
          )}
          <h1 className="text-2xl font-bold tracking-tight mb-1">{profile.full_name}</h1>
          <p className="text-zinc-500 text-sm leading-relaxed">{profile.headline}</p>
        </header>

        {/* Bio */}
        {profile.bio && (
          <p className="text-zinc-600 text-sm leading-relaxed mb-6">{profile.bio}</p>
        )}

        {/* Primary CTA: Save Contact */}
        <div className="mb-6">
          <button
            onClick={() => window.open(`/api/v1/portfolios/${profile.slug}/vcard/`, '_blank')}
            className="w-full bg-indigo-600 text-white py-3 rounded-full text-sm font-medium hover:bg-indigo-500 transition-colors"
            style={{ cursor: 'pointer' }}
          >
            Save Contact
          </button>
          <p className="text-zinc-500 text-xs mt-2">
            Opens native address book to save vCard
          </p>
        </div>

        {/* Interactive Links */}
        <div className="space-y-3 mb-6">
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center gap-2 text-blue-600 hover/underline text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22 6 12 13 2 6" />
              </svg>
              {profile.email}
            </a>
          )}
          {profile.phone && (
            <a
              href={`tel:${profile.phone}`}
              className="flex items-center gap-2 text-blue-600 hover/underline text-sm"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2 19.96 19.96 0 0 1 2 4.11 19.79 19.79 0 0 1 2 2v3.13" />
                <polyline points="16 18 22 12 16 6" />
              </svg>
              {profile.phone}
            </a>
          )}
          {profile.social_links && Object.keys(profile.social_links).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(profile.social_links).map(([key, url]) => (
                <a
                  key={key}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-indigo-600 hover/underline text-sm"
                >
                  {key}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Project Showcase */}
        {profile.projects.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Projects</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {profile.projects.map((project) => (
                <article
                  key={project.id}
                  className="group rounded-lg border bg-zinc-50 dark:bg-zinc-800 overflow-hidden hover/transform hover/translate-y-1 hover/transition-all duration-200"
                >
                  {project.cover_image && (
                    <Image
                      src={project.cover_image}
                      alt={project.title}
                      width={400}
                      height={200}
                      className="h-48 w-full object-cover"
                    />
                  )}
                  <div className="p-3">
                    <h3 className="line-clamp-2 font-medium mb-1">{project.title}</h3>
                    <p className="text-zinc-500 text-xs line-clamp-2">{project.description}</p>
                  </div>
                  <div className="p-3 border-t">
                    <a
                      href={project.project_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 text-sm hover/underline"
                    >
                      View Project
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

export async function generateParams() {
  // Generate params from the Django API
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/v1/portfolios/`, {
    cache: 'no-store',
  })
  const profiles = await res.json()
  return profiles.map((p: any) => ({ slug: p.slug }))
}