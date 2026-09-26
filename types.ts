export type Profile = {
  id: string;
  user_id: string;
  username: string;
  full_name: string | null;
  company_name: string | null;
  profession: string | null;
  bio: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  tiktok: string | null;
  twitter: string | null;
  youtube: string | null;
  pinterest: string | null;
  whatsapp: string | null;
  yelp: string | null;
  google_reviews: string | null;
  google_place_id: string | null;
  google_rating: number | null;
  google_rating_count: number | null;
  show_google_rating: boolean;
  projects_section_enabled: boolean;
  projects_section_name: string;
  service_area: string | null;
  profile_photo_url: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Service = {
  id: string;
  profile_id: string;
  name: string;
  created_at: string;
};

export type PortfolioItem = {
  id: string;
  profile_id: string;
  kind: "single" | "compare";
  image_url: string | null;
  before_image_url: string | null;
  after_image_url: string | null;
  caption: string | null;
  sort_order: number;
  created_at: string;
};

export type FullProfile = Profile & {
  services: Service[];
  portfolio_items: PortfolioItem[];
};

// ---------------------------------------------------------------
// Smart Contact Card
// ---------------------------------------------------------------
export type ContactPhone = { id: string; label: string; number: string };
export type ContactEmail = { id: string; label: string; email: string };
export type ContactWebsite = { id: string; label: string; url: string };
export type ContactAddress = {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};
export type SocialPlatform = "linkedin" | "instagram" | "facebook" | "twitter" | "tiktok" | "youtube" | "other";
export type MessagingPlatform = "whatsapp" | "telegram" | "signal" | "discord" | "other";
export type ContactSocial = { id: string; platform: SocialPlatform; value: string };
export type ContactMessaging = { id: string; platform: MessagingPlatform; value: string };
export type ContactCustomField = { id: string; label: string; value: string };

export type ContactCard = {
  id: string;
  profile_id: string;
  photo_url: string | null;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  job_title: string | null;
  birthday: string | null;
  notes: string | null;
  phones: ContactPhone[];
  emails: ContactEmail[];
  websites: ContactWebsite[];
  addresses: ContactAddress[];
  socials: ContactSocial[];
  messaging: ContactMessaging[];
  custom_fields: ContactCustomField[];
  created_at: string;
  updated_at: string;
};

// ---------------------------------------------------------------
// Projects / Portfolio (the richer "proof of work" section)
// ---------------------------------------------------------------
export type ProjectCustomField = { id: string; label: string; value: string };

export type Project = {
  id: string;
  profile_id: string;
  title: string;
  cover_image_url: string | null;
  gallery_images: string[];
  short_description: string | null;
  full_description: string | null;
  status: string | null;
  location: string | null;
  project_date: string | null;
  external_link_url: string | null;
  external_link_label: string | null;
  custom_fields: ProjectCustomField[];
  is_public: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};
