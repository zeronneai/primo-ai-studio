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

export type ContentType = {
  slug: string;
  label: string;
  description: string;
  aspect_ratio: string; // ej. "4:5"
  dimensions: string; // ej. "1080x1350"
  aspect_label_en: string; // frase para el prompt de la IA
  icon_name: string; // nombre de icono lucide-react
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
  content_type_slug?: string;
};

export type ContentPillar = {
  slug: string; // "educacion", "demostracion", etc.
  label: string;
  color: string; // hex base; en la UI se usa ws-accent y variantes
};

export type ContentIdeaFormat =
  | "reel"
  | "carrusel"
  | "post"
  | "story"
  | "repost";

export type ContentIdea = {
  id: string;
  day: string; // "lunes", "martes", etc.
  pillar: string; // slug del pilar
  format: ContentIdeaFormat;
  title: string;
  hook: string;
  specs: string;
  steps: string[]; // guion / estructura
  caption: string;
  hashtags: string[];
  cta: string;
  suggested_style_slug?: string;
  suggested_image_title?: string;
};

export type WeeklyCalendar = {
  workspace_id: string;
  week_start: string; // ISO date del lunes de esa semana
  theme: string;
  theme_description: string;
  ideas: ContentIdea[];
  trends_used?: string[];
  generated_at: string;
};
