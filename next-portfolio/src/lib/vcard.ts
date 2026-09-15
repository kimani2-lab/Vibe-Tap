export function downloadVCard(profile: {
  full_name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
}) {
  const vCardData = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${profile.full_name}`,
    `TITLE:${profile.headline}`,
    `EMAIL;TYPE=INTERNET,HOME:${profile.email}`,
    `TEL;TYPE=CELL:${profile.phone}`,
    `ADR;TYPE=HOME:;;${profile.location};;;;`,
    "END:VCARD",
  ].join("\n");

  const blob = new Blob([vCardData], { type: "text/vcard;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${profile.full_name.replace(/\s+/g, "_")}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
