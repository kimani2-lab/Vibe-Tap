import { redirect } from "next/navigation";
import { findProfile } from "@/lib/data";

interface LegacyAgentRedirectProps {
  params: Promise<{
    agentname: string;
  }>;
}

export default async function LegacyAgentRedirect({ params }: LegacyAgentRedirectProps) {
  const { agentname } = await params;
  const localProfile = findProfile(agentname);

  if (localProfile) {
    redirect(`/c/${encodeURIComponent(localProfile.slug)}`);
  }

  const normalizedSlug = decodeURIComponent(agentname).trim().toLowerCase();
  redirect(`/c/${encodeURIComponent(normalizedSlug)}`);
}
