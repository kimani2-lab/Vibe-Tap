import { redirect } from "next/navigation";

interface LegacyAgentRedirectProps {
  params: Promise<{
    agentname: string;
  }>;
}

export default async function LegacyAgentRedirect({ params }: LegacyAgentRedirectProps) {
  const { agentname } = await params;
  const normalizedSlug = agentname.trim().toLowerCase();

  redirect(`/c/${encodeURIComponent(normalizedSlug)}`);
}
