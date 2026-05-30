export type WorkspaceColors = {
  primary: string;
  accent: string;
  bg: string;
  text: string;
};

export type Workspace = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  brand_colors: WorkspaceColors;
  industry: string;
  monthly_credit_limit: number;
};

export type WorkspaceStyle = {
  id: string;
  workspace_id: string;
  name: string;
  slug: string;
  description: string;
  template_prompt: string;
  sort_order: number;
};

export type ReferenceAsset = {
  id: string;
  workspace_id: string;
  image_url: string;
  style_slug: string | null;
  notes: string;
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
