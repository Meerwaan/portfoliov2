export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://mwn-tech.com").replace(/\/$/, "");

export const site = {
  name: "Merwan Laouini",
  signature: "mwn",
  url: SITE_URL,
  // TODO(merwan): confirm the public contact email and LinkedIn URL before launch.
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "merwanlaouini@gmail.com",
  github: "https://github.com/Meerwaan",
  linkedin: process.env.NEXT_PUBLIC_LINKEDIN_URL ?? "https://www.linkedin.com/in/merwan-laouini",
  cvPath: "/CV_MerwanLaouini.pdf",
  location: { locality: "Sèvres", region: "Île-de-France", country: "FR" },
  timeZone: "Europe/Paris",
} as const;
