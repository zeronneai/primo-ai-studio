export type WorkspaceColors = {
  primary: string; // color principal de marca
  accent: string; // color de acción/CTA
  accentSecondary: string; // variante / acento secundario
  bg: string; // background general (muy oscuro, tinta primaria)
  surface: string; // cards/superficies
  border: string; // bordes
  text: string; // texto principal
  textMuted: string; // texto secundario
};

export type Workspace = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  brand_colors: WorkspaceColors;
  industry: string;
  monthly_credit_limit: number;
  system_prompt?: string;
  is_custom?: boolean;
};

export type WorkspaceStyle = {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  description: string;
  template_prompt: string;
  sort_order: number;
  is_custom?: boolean;
};

export type MemberRole = "owner" | "member";

export type WorkspaceMember = {
  email: string;
  workspace_id: string;
  role: MemberRole;
  added_at: string;
};

export type ReferenceAnalysis = {
  dominant_colors: string[];
  composition: string;
  lighting_style: string;
  mood: string;
  typography_style: string;
  recurring_elements: string[];
  quality_score: number; // 1-10
};

export type ReferenceAsset = {
  id: string;
  workspace_id: string;
  image_url: string;
  style_slug: string | null;
  notes: string;
  is_user_uploaded?: boolean;
  analysis?: ReferenceAnalysis | null;
  created_at?: string;
};

export type Generation = {
  id: string;
  workspace_id: string;
  source_image_url: string | null;
  title: string;
  context: string;
  scene_description: string;
  prompts: Record<string, string>;
  generated_images: Record<string, string>;
  created_at: string;
};
