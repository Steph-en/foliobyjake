/**
 * Shared Type Definitions for Jake Amponsah Portfolio & Admin CMS
 */

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export type ProjectStatus = 'draft' | 'published' | 'archive';

export interface CaseStudySection {
  id: string;
  type: 'text' | 'side-by-side' | 'asymmetric-split';
  content: {
    textHeader?: string;
    textBody?: string;
    images?: string[]; // Array of image/video URLs
    layoutType?: 'asymmetric-left' | 'asymmetric-right' | 'equal'; // For grid splits
  };
  order: number;
}

export interface Project {
  id: number;
  name: string;
  slug: string;
  category: string; // Dynamic name matches or links to Category
  description: string;
  longDescription: string;
  client?: string;
  year?: string;
  role?: string;
  previewImage?: string;
  previewVideo?: string;
  heroImage?: string;
  heroVideo?: string;
  gallery: string[];
  status: ProjectStatus;
  isFeatured: boolean;
  views: number;
  // SEO Fields
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  seoOgImage?: string;
  // Dynamic case studies
  sections?: CaseStudySection[];
  createdAt?: string;
}

export interface AnalyticsSummary {
  totalProjects: number;
  featuredProjects: number;
  totalViews: number;
  contactRequests: number;
  viewsOverTime: { date: string; views: number }[];
  projectViews: { name: string; views: number }[];
  categoryViews: { category: string; views: number }[];
}

export interface MediaAsset {
  id: string;
  url: string;
  name: string;
  type: 'image' | 'video';
  size?: string;
  createdAt: string;
}