// server/db.ts
//
// Centralized persistence layer. Every Admin Dashboard action (and every public-facing
// read) goes through one of these functions — nothing outside this file talks to
// Supabase directly. This replaces the old data/db.json + in-memory object approach,
// which could not survive Vercel's serverless, ephemeral filesystem.

import { supabase } from "./supabaseClient";
import { Category, Project, MediaAsset, ProjectStatus } from "../src/types";

// ── Row <-> Domain Type Mapping ──
// Supabase/Postgres columns are snake_case; our app's types are camelCase.

function rowToProject(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    category: row.category,
    description: row.description,
    longDescription: row.long_description,
    client: row.client ?? undefined,
    year: row.year ?? undefined,
    role: row.role ?? undefined,
    previewImage: row.preview_image ?? undefined,
    previewVideo: row.preview_video ?? undefined,
    heroImage: row.hero_image ?? undefined,
    heroVideo: row.hero_video ?? undefined,
    gallery: row.gallery ?? [],
    status: row.status,
    isFeatured: row.is_featured,
    views: row.views,
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
    seoKeywords: row.seo_keywords ?? undefined,
    seoOgImage: row.seo_og_image ?? undefined,
    sections: row.sections ?? [],
    createdAt: row.created_at,
  };
}

function projectToRow(p: Partial<Project>) {
  const row: Record<string, any> = {};
  if (p.name !== undefined) row.name = p.name;
  if (p.slug !== undefined) row.slug = p.slug;
  if (p.category !== undefined) row.category = p.category;
  if (p.description !== undefined) row.description = p.description;
  if (p.longDescription !== undefined) row.long_description = p.longDescription;
  if (p.client !== undefined) row.client = p.client;
  if (p.year !== undefined) row.year = p.year;
  if (p.role !== undefined) row.role = p.role;
  if (p.previewImage !== undefined) row.preview_image = p.previewImage;
  if (p.previewVideo !== undefined) row.preview_video = p.previewVideo;
  if (p.heroImage !== undefined) row.hero_image = p.heroImage;
  if (p.heroVideo !== undefined) row.hero_video = p.heroVideo;
  if (p.gallery !== undefined) row.gallery = p.gallery;
  if (p.status !== undefined) row.status = p.status;
  if (p.isFeatured !== undefined) row.is_featured = p.isFeatured;
  if (p.views !== undefined) row.views = p.views;
  if (p.seoTitle !== undefined) row.seo_title = p.seoTitle;
  if (p.seoDescription !== undefined) row.seo_description = p.seoDescription;
  if (p.seoKeywords !== undefined) row.seo_keywords = p.seoKeywords;
  if (p.seoOgImage !== undefined) row.seo_og_image = p.seoOgImage;
  if (p.sections !== undefined) row.sections = p.sections;
  return row;
}

function rowToCategory(row: any): Category {
  return { id: row.id, name: row.name, slug: row.slug };
}

function rowToMedia(row: any): MediaAsset {
  return {
    id: row.id,
    url: row.url,
    name: row.name,
    type: row.type,
    size: row.size ?? undefined,
    createdAt: row.created_at,
  };
}

function slugify(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function assertNoError(err: any, context: string) {
  if (err) {
    console.error(`[Database Error] ${context}:`, err);
    throw new Error(`${context}: ${err.message || err}`);
  }
}

// ── Categories ──

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("name");
  assertNoError(error, "getCategories");
  return (data ?? []).map(rowToCategory);
}

export async function createCategory(name: string): Promise<Category> {
  const id = "cat_" + Date.now();
  const slug = slugify(name);
  const { data, error } = await supabase
    .from("categories")
    .insert({ id, name, slug })
    .select()
    .single();
  assertNoError(error, "createCategory");
  return rowToCategory(data);
}

export async function updateCategory(id: string, name: string): Promise<Category> {
  const { data: existing, error: findErr } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();
  assertNoError(findErr, "updateCategory (lookup)");
  if (!existing) throw new Error("Category not found");

  const trimmed = name.trim();
  const oldName = existing.name;

  if (trimmed && trimmed !== oldName) {
    const slug = slugify(trimmed);
    const { data, error } = await supabase
      .from("categories")
      .update({ name: trimmed, slug })
      .eq("id", id)
      .select()
      .single();
    assertNoError(error, "updateCategory");

    // Cascading update: any project referencing the old category name follows the rename
    const { error: cascadeErr } = await supabase
      .from("projects")
      .update({ category: trimmed })
      .eq("category", oldName);
    assertNoError(cascadeErr, "updateCategory (cascade to projects)");

    return rowToCategory(data);
  }

  return rowToCategory(existing);
}

export async function deleteCategory(id: string): Promise<void> {
  const { data: existing, error: findErr } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();
  assertNoError(findErr, "deleteCategory (lookup)");
  if (!existing) throw new Error("Category not found");

  const { data: remaining, error: remainingErr } = await supabase
    .from("categories")
    .select("name")
    .neq("id", id)
    .order("name")
    .limit(1);
  assertNoError(remainingErr, "deleteCategory (fallback lookup)");
  const fallbackName = remaining?.[0]?.name || "Graphic Design";

  const { error: cascadeErr } = await supabase
    .from("projects")
    .update({ category: fallbackName })
    .eq("category", existing.name);
  assertNoError(cascadeErr, "deleteCategory (cascade to projects)");

  const { error } = await supabase.from("categories").delete().eq("id", id);
  assertNoError(error, "deleteCategory");
}

// ── Projects ──

export async function getProjects(view: string | undefined): Promise<Project[]> {
  let query = supabase.from("projects").select("*").order("sort_order", { ascending: true });
  if (view !== "admin") {
    query = query.eq("status", "published");
  }
  const { data, error } = await query;
  assertNoError(error, "getProjects");
  return (data ?? []).map(rowToProject);
}

export async function getProject(id: number): Promise<Project | null> {
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  assertNoError(error, "getProject");
  return data ? rowToProject(data) : null;
}

export async function incrementProjectViews(id: number): Promise<Project | null> {
  const current = await getProject(id);
  if (!current) return null;
  const { data, error } = await supabase
    .from("projects")
    .update({ views: (current.views || 0) + 1 })
    .eq("id", id)
    .select()
    .single();
  assertNoError(error, "incrementProjectViews");
  return rowToProject(data);
}

async function nextProjectId(): Promise<number> {
  const { data, error } = await supabase
    .from("projects")
    .select("id")
    .order("id", { ascending: false })
    .limit(1);
  assertNoError(error, "nextProjectId");
  return (data?.[0]?.id ?? 0) + 1;
}

async function nextSortOrder(): Promise<number> {
  // New projects go to the front, mirroring the old unshift() behavior.
  const { data, error } = await supabase
    .from("projects")
    .select("sort_order")
    .order("sort_order", { ascending: true })
    .limit(1);
  assertNoError(error, "nextSortOrder");
  return (data?.[0]?.sort_order ?? 0) - 1;
}

export async function createProject(input: Partial<Project> & { name: string }): Promise<Project> {
  if (!input.name) throw new Error("Project name is required");

  const id = await nextProjectId();
  const sort_order = await nextSortOrder();
  const slug = input.slug || slugify(input.name);

  const row = {
    id,
    name: input.name,
    slug,
    category: input.category || "Graphic Design",
    description: input.description || "",
    long_description: input.longDescription || "",
    client: input.client || "",
    year: input.year || "",
    role: input.role || "",
    preview_image: input.previewImage || "",
    preview_video: input.previewVideo || "",
    hero_image: input.heroImage || "",
    hero_video: input.heroVideo || "",
    gallery: input.gallery || [],
    status: input.status || "draft",
    is_featured: !!input.isFeatured,
    views: 0,
    seo_title: input.seoTitle || "",
    seo_description: input.seoDescription || "",
    seo_keywords: input.seoKeywords || "",
    sections: input.sections || [],
    sort_order,
  };

  const { data, error } = await supabase.from("projects").insert(row).select().single();
  assertNoError(error, "createProject");
  return rowToProject(data);
}

export async function updateProject(id: number, patch: Partial<Project>): Promise<Project | null> {
  const row = projectToRow(patch);
  if (Object.keys(row).length === 0) return getProject(id);

  const { data, error } = await supabase
    .from("projects")
    .update(row)
    .eq("id", id)
    .select()
    .maybeSingle();
  assertNoError(error, "updateProject");
  return data ? rowToProject(data) : null;
}

export async function updateProjectStatus(id: number, status: ProjectStatus): Promise<Project | null> {
  return updateProject(id, { status });
}

export async function duplicateProject(id: number): Promise<Project | null> {
  const original = await getProject(id);
  if (!original) return null;

  const newId = await nextProjectId();
  const sort_order = await nextSortOrder();

  const row = {
    ...projectToRow(original),
    id: newId,
    name: `${original.name} (Copy)`,
    slug: `${original.slug}-copy-${newId}`,
    is_featured: false,
    views: 0,
    status: "draft",
    sort_order,
  };

  const { data, error } = await supabase.from("projects").insert(row).select().single();
  assertNoError(error, "duplicateProject");
  return rowToProject(data);
}

export async function deleteProject(id: number): Promise<boolean> {
  const { error, count } = await supabase.from("projects").delete({ count: "exact" }).eq("id", id);
  assertNoError(error, "deleteProject");
  return (count ?? 0) > 0;
}

export async function reorderProjects(orderedIds: number[]): Promise<Project[]> {
  // Assign sort_order 0..n-1 in the requested order; anything not mentioned keeps its
  // relative order and is appended after.
  const all = await getProjects("admin");
  const idSet = new Set(orderedIds);
  const finalOrder = [
    ...orderedIds,
    ...all.filter((p) => !idSet.has(p.id)).map((p) => p.id),
  ];

  await Promise.all(
    finalOrder.map((id, index) =>
      supabase.from("projects").update({ sort_order: index }).eq("id", id)
    )
  );

  return getProjects("admin");
}

// ── Media ──

export async function getMedia(): Promise<MediaAsset[]> {
  const { data, error } = await supabase.from("media").select("*").order("created_at", { ascending: false });
  assertNoError(error, "getMedia");
  return (data ?? []).map(rowToMedia);
}

export async function addMedia(input: { url: string; name: string; type?: "image" | "video"; size?: string }): Promise<MediaAsset> {
  const id = "m_" + Date.now();
  const type = input.type || (input.url.includes("/video/") || input.url.endsWith(".mp4") ? "video" : "image");
  const row = { id, url: input.url, name: input.name, type, size: input.size || "Custom Sync" };

  const { data, error } = await supabase.from("media").insert(row).select().single();
  assertNoError(error, "addMedia");
  return rowToMedia(data);
}

export async function removeMedia(id: string): Promise<boolean> {
  const { error, count } = await supabase.from("media").delete({ count: "exact" }).eq("id", id);
  assertNoError(error, "removeMedia");
  return (count ?? 0) > 0;
}

// ── Settings / Analytics ──

export async function incrementContacts(): Promise<number> {
  const { data, error } = await supabase.from("app_settings").select("value").eq("key", "contacts_count").single();
  assertNoError(error, "incrementContacts (read)");
  const current = typeof data?.value === "number" ? data.value : 0;
  const next = current + 1;

  const { error: writeErr } = await supabase
    .from("app_settings")
    .update({ value: next })
    .eq("key", "contacts_count");
  assertNoError(writeErr, "incrementContacts (write)");

  return next;
}

export async function getContactsCount(): Promise<number> {
  const { data, error } = await supabase.from("app_settings").select("value").eq("key", "contacts_count").single();
  assertNoError(error, "getContactsCount");
  return typeof data?.value === "number" ? data.value : 0;
}
