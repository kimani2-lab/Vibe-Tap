export interface ProfileData {
  type: "agent" | "portfolio";
  slug: string;
  agent_id?: string;
  full_name: string;
  headline: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  location: string;
  bio: string;
  social_links?: Record<string, string>;
  projects?: {
    title: string;
    description: string;
    project_url?: string;
    tech: string[];
  }[];
  skills: {
    backend: string[];
    frontend: string[];
    databases: string[];
    tools: string[];
  };
  is_verified?: boolean;
  referral_code?: string;
  services_offered?: {
    category_name: string;
    slug: string;
    description: string;
  }[];
  app_download_url?: string;
  payment_url?: string;
}

export interface SasaPayProduct {
  name: string;
  slug: string;
  target: string;
  app_store_url: string;
  play_store_url: string;
  web_url: string;
}

export const SASAPAY_APP_STORE_MAIN = "https://apps.apple.com/ke/app/sasapay/id1592972561";
export const SASAPAY_PLAY_STORE_MAIN = "https://play.google.com/store/apps/details?id=ke.co.sasapay.sasapay_app&pcampaignid=web_share";

export const sasaPayProducts: SasaPayProduct[] = [
  {
    name: "SasaPay P2P",
    slug: "p2p",
    target: "Individual users & Students",
    app_store_url: "https://apps.apple.com/ke/app/sasapay/id1592972561",
    play_store_url: "https://play.google.com/store/apps/details?id=ke.co.sasapay.sasapay_app&pcampaignid=web_share",
    web_url: "https://play.google.com/store/apps/details?id=ke.co.sasapay.sasapay_app",
  },
  {
    name: "SasaMat",
    slug: "sasamat",
    target: "Commuters & Transport Operators",
    app_store_url: "https://apps.apple.com/ke/app/sasamat/id6745812035",
    play_store_url: "https://play.google.com/store/apps/details?id=ke.co.sasapay.sasamat&hl=en",
    web_url: "https://www.sasapay.co.ke/products/sasamat",
  },
  {
    name: "SasaFarm",
    slug: "sasafarm",
    target: "Farmers & Agri-Businesses",
    app_store_url: "https://apps.apple.com/ke/app/mali-yetu/id6739787578",
    play_store_url: "https://play.google.com/store/apps/details?id=ke.co.viewtech.sasafarm.sasafarm&pcampaignid=web_share",
    web_url: "https://www.sasapay.co.ke/products/maliyetu",
  },
  {
    name: "SasaPay Merchants",
    slug: "merchants",
    target: "Small to Large Retailers",
    app_store_url: "https://apps.apple.com/ke/app/sasapay-merchant/id1665824938",
    play_store_url: "https://play.google.com/store/apps/details?id=ke.co.viewtech.sasapay_merchant&pcampaignid=web_share",
    web_url: "https://merchants.sasapay.app/auth/register",
  },
  {
    name: "Sasa POS",
    slug: "pos",
    target: "Retailers & Businesses",
    app_store_url: "https://apps.apple.com/ke/app/sasa-pos/id1665824939",
    play_store_url: "https://play.google.com/store/apps/details?id=ke.co.viewtech.sasapos&pcampaignid=web_share",
    web_url: "https://www.sasapay.co.ke/products/sasapos",
  },
  {
    name: "Tunza fund",
    slug: "tunza-fund",
    target: "Tunza Fund helps you take care of the people who matter — with automated, scheduled money transfers to beneficiaries",
    app_store_url: "https://apps.apple.com/ke/app/tunza-fund/id6748521344",
    play_store_url: "https://play.google.com/store/apps/details?id=ke.co.viewtech.tunza",
    web_url: "https://play.google.com/store/apps/details?id=ke.co.viewtech.tunza"
  },
  {
    name: "Sasa Escrow",
    slug: "sasapay-escrow",
    target: "Sasa Escrow is a secure and reliable platform for managing transactions between buyers and sellers, ensuring that funds are held safely until both parties fulfill their obligations.",
    app_store_url: "https://apps.apple.com/ke/app/sasaescrow/id6786309621",
    play_store_url: "https://play.google.com/store/apps/details?id=com.sasapay.escrow&pcampaignid=web_share",
    web_url: "https://www.sasapay.co.ke/products/sasaescrow"
  },
  {
    name: "Sasa skool",
    slug: "sasaskool",
    target: "Sasa Skool is a platform designed to give parents peace of mind by providing real-time visibility into their child’s journey to and from school.",
    app_store_url: "https://apps.apple.com/ke/app/sasaskool/id6786309622",
    play_store_url: "https://play.google.com/store/apps/details?id=com.tracker.parents&pcampaignid=web_share",
    web_url: "https://play.google.com/store/apps/details?id=com.tracker.parents&pcampaignid=web_share"
  },
  {
    name: "Maisha fund",
    slug: "maisha-fund",
    target: "Maisha Fund is a platform that allows users to create and manage savings groups, enabling them to pool their resources and achieve their financial goals together.",
    app_store_url: "https://apps.apple.com/ke/app/maisha-fund/id6748013250",
    play_store_url: "https://play.google.com/store/apps/details?id=ke.co.viewtech.maisha",
    web_url: "https://play.google.com/store/apps/details?id=ke.co.viewtech.maisha"
  },
  {
    name: "Sacco Point",
    slug: "sacco-point",
    target: "Sacco Point is a platform that provides a convenient and secure way for members of savings and credit cooperatives (SACCOs) to access their accounts, make transactions, and stay informed about their financial activities.",
    app_store_url: "https://apps.apple.com/ke/app/sacco-point/id6748013251",
    play_store_url: "https://play.google.com/store/apps/details?id=com.viewtech.walletpoint",
    web_url: "https://play.google.com/store/apps/details?id=ke.co.viewtech.saccopoint"
  }
];

export const profiles: ProfileData[] = [
  {
    type: "portfolio",
    slug: "allan-kimani",
    full_name: "Allan Kimani",
    headline: "Fullstack software engineer | backend developer",
    email: "kimania271@gmail.com",
    phone: "0758288727",
    location: "Nairobi, Kenya",
    avatar_url: "https://img.magnific.com/free-photo/cartoon-man-wearing-glasses_23-2151136784.jpg?semt=ais_hybrid&w=740&q=80",
    bio: "Fullstack Software Developer specializing in Python, Django REST Framework, Next.js, React, and Flutter. Passionate about building high-performance backend architectures, payment integrations, and modern web interfaces. Also experienced in building scalable mobile applications with Flutter and Dart, alongside robust Django backends. Skilled in database design, REST API engineering, and secure payment processing.",
    social_links: {
      linkedin: "https://www.linkedin.com/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base%3BIpfK7DO%2FTvOhGr2JQvhMmQ%3D%3D",
      whatsapp: "https://wa.me/254758288727",
      github: "https://github.com/kimani2-lab",
      instagram: "https://www.instagram.com/blacksnowallynde/#",
    },
    projects: [
      {
        title: "Vibe~Tap",
        description: "A social media platform for sharing music and discovering new artists.",
        project_url: "https://github.com/kimani2-lab/Vibe-Tap.git",
        tech: ["Django", "React", "PostgreSQL"],
      },
      {
        title: "Sasatime",
        description: "A time management application for organizing tasks and schedules.",
        project_url: "https://github.com/micymike/sasaTime.git",
        tech: ["Flutter", "Dart", "Django"],
      },
      {
        title: "Kikapu",
        description: "A community-driven platform for sharing local news and events.",
        project_url: "https://github.com/leonkoome4-rgb/kikapu.git",
        tech: ["Python", "REST API", "React"],
      },
      {
        title: "Deliveroo",
        description: "A food delivery application for ordering and managing restaurant orders.",
        project_url: "https://github.com/mosweta-school/Deliveroo.git",
        tech: ["Flutter", "Dart", "REST API"],
      },
    ],
    skills: {
      backend: ["Python", "Django", "Django REST Framework", "Flask", "NestJS"],
      frontend: ["JavaScript", "React", "Next.js", "Flutter", "Dart", "Tailwind CSS"],
      databases: ["PostgreSQL", "SQLite", "Redis"],
      tools: ["Linux (Ubuntu)", "Docker", "Electron", "Git", "Postman"],
    },
  },
  {
    type: "agent",
    slug: "jey-zawadi",
    agent_id: "AG-100",
    full_name: "Jey Zawadi",
    headline: "SasaPay Authorized Agent",
    email: "jey211@gmail.com",
    phone: "+254758288727",
    location: "Nairobi, Kenya",
    avatar_url: "https://t4.ftcdn.net/jpg/09/61/69/75/360_F_961697523_EFd1m8P4tdcwB0TYvlQAagqKR1xHSuwk.jpg",
    is_verified: true,
    referral_code: "REF-D6A9AA",
    services_offered: [
      { category_name: "Agent registration", slug: "agent-registration", description: "Agent onboarding and digital onboarding support for new SasaPay users." },
      { category_name: "Merchant onboarding", slug: "merchant-onboarding", description: "Support for merchant sign-up, onboarding, and payment setup." },
      { category_name: "NFC programming", slug: "nfc-programming", description: "Card programming and credential issuance for agent and merchant workflows." },
    ],
    app_download_url: "https://play.google.com/store/apps/details?id=ke.co.sasapay.sasapay_app",
    payment_url: "https://checkout.sasapay.app/297df614-473a-4c05-b152-2168d7fee668?00020101021128280008ke.go.qr021225479133145253034045802KE5916Vincent++Obunga+6007NAIROBI610200821220260917093063047FD2=",
    bio: "",
    skills: { backend: [], frontend: [], databases: [], tools: [] },
  },
  {
    type: "agent",
    slug: "phryshawn-zawadi",
    agent_id: "AGENT-102",
    full_name: "Phryshawn Zawadi",
    headline: "SasaPay Authorized Agent",
    email: "phryshawn@sasapay.co.ke",
    phone: "+254712345678",
    location: "Nairobi, Kenya",
    avatar_url: "https://images.unsplash.com/photo-1593359863503-f598684c806f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dGVjaCUyMGdpcmx8ZW58MHx8MHx8fDA%3D",
    is_verified: true,
    referral_code: "phryshawn111",
    services_offered: [{"category_name": "Person to person transfers", "slug": "p2p-transfers", "description": "Instant wallet-to-wallet funds transfers between individual SasaPay users."}, {"category_name": "SasaPay enterprise", "slug": "sasapay-enterprise", "description": "Customized digital payment architectures and bulk disbursement solutions for large corporations."}, {"category_name": "Merchant and B2B business", "slug": "merchant-b2b", "description": "Payment collection tools, API integrations, and business-to-business settlement services."}, {"category_name": "PSV fare service", "slug": "psv-fare-service", "description": "SasaMat contactless fare collection solution for public service vehicle operators and commuters."}, {"category_name": "Retail business", "slug": "retail-business", "description": "Till numbers and paybill solutions tailored for point-of-sale retail merchants."}, {"category_name": "Agency business", "slug": "agency-business", "description": "Agent network platform enabling deposit, withdrawal, and customer onboarding services."}],
    app_download_url: "https://play.google.com/store/apps/details?id=ke.co.sasapay.sasapay_app",
    payment_url: "https://checkout.sasapay.app/297df614-473a-4c05-b152-2168d7fee668?00020101021128280008ke.go.qr021225479133145253034045802KE5916Vincent++Obunga+6007NAIROBI610200821220260917093063047FD2=",
    bio: "",
    skills: { backend: [], frontend: [], databases: [], tools: [] },
  },
];

export function findProfile(identifier: string): ProfileData | undefined {
  const normalizedIdentifier = decodeURIComponent(identifier).trim().toLowerCase();
  return profiles.find(
    (profile) =>
      profile.slug.toLowerCase() === normalizedIdentifier ||
      profile.agent_id?.toLowerCase() === normalizedIdentifier,
  );
}
