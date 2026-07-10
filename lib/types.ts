export type Plan = 'free' | 'pro';

export type DbUser = {
  id: string;
  email: string;
  name: string | null;
  plan: Plan;
  plan_expires_at: string | null;
  github_username: string | null;
  created_at: string;
};

export type PortfolioProject = {
  title: string;
  description: string;
  url?: string;
  tech: string[];
};

export type GeneratedProject = {
  title: string;
  description: string;
};

export type PortfolioCopy = {
  headline: string;
  tagline: string;
  bio: string;
  projects: GeneratedProject[];
};

export type DbPortfolio = {
  id: string;
  user_id: string;
  slug: string;
  is_published: boolean;
  custom_domain: string | null;
  stack: string[];
  experience_years: number | null;
  target_clients: string | null;
  personality: string | null;
  bio_raw: string | null;
  projects: PortfolioProject[];
  bio_generated: string | null;
  headline_generated: string | null;
  tagline_generated: string | null;
  copy_generated: PortfolioCopy | null;
  views_count: number;
  created_at: string;
  updated_at: string;
};

export type OutreachPlatform = 'upwork' | 'freelancer' | 'remoteok';
export type OutreachStatus = 'pending' | 'approved' | 'sent' | 'rejected';

export type DbOutreachJob = {
  id: string;
  user_id: string;
  portfolio_id: string | null;
  platform: OutreachPlatform;
  job_id: string;
  job_title: string | null;
  job_description: string | null;
  job_url: string | null;
  match_score: number | null;
  proposal_generated: string | null;
  status: OutreachStatus;
  created_at: string;
};

export type DbTestimonial = {
  id: string;
  portfolio_id: string;
  client_name: string | null;
  client_company: string | null;
  client_email: string | null;
  rating: number | null;
  content_raw: string | null;
  content_formatted: string | null;
  is_published: boolean;
  created_at: string;
};

export type DbAnalyticsEvent = {
  id: string;
  portfolio_id: string;
  visitor_ip: string | null;
  referrer: string | null;
  country: string | null;
  page_time_seconds: number | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      users: { Row: DbUser; Insert: Partial<DbUser>; Update: Partial<DbUser>; Relationships: [] };
      portfolios: {
        Row: DbPortfolio;
        Insert: Partial<DbPortfolio>;
        Update: Partial<DbPortfolio>;
        Relationships: [];
      };
      outreach_jobs: {
        Row: DbOutreachJob;
        Insert: Partial<DbOutreachJob>;
        Update: Partial<DbOutreachJob>;
        Relationships: [];
      };
      testimonials: {
        Row: DbTestimonial;
        Insert: Partial<DbTestimonial>;
        Update: Partial<DbTestimonial>;
        Relationships: [];
      };
      analytics: {
        Row: DbAnalyticsEvent;
        Insert: Partial<DbAnalyticsEvent>;
        Update: Partial<DbAnalyticsEvent>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
