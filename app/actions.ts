"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getResource } from "@/lib/resources";

type Result = { error?: string };
type Action = "create" | "update" | "delete";

async function authorize(slug: string, action: Action) {
  const resource = getResource(slug);
  if (!resource) return { error: "Unknown resource." } as const;

  const allowed =
    action === "create" ? resource.canCreate : action === "update" ? resource.canUpdate : resource.canDelete;
  if (!allowed) return { error: `${action} is not allowed on ${resource.title}.` } as const;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not logged in." } as const;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_superadmin) return { error: "Superadmin access required." } as const;

  return { resource, supabase } as const;
}

export async function createRow(slug: string, values: Record<string, unknown>): Promise<Result> {
  const auth = await authorize(slug, "create");
  if ("error" in auth) return { error: auth.error };

  const { error } = await auth.supabase.from(auth.resource.table).insert(values);
  if (error) return { error: error.message };

  revalidatePath(`/resources/${slug}`);
  return {};
}

export async function updateRow(
  slug: string,
  id: string | number,
  values: Record<string, unknown>
): Promise<Result> {
  const auth = await authorize(slug, "update");
  if ("error" in auth) return { error: auth.error };

  const idColumn = auth.resource.idColumn ?? "id";
  const rest = { ...values };
  delete rest[idColumn];

  const { error } = await auth.supabase.from(auth.resource.table).update(rest).eq(idColumn, id);
  if (error) return { error: error.message };

  revalidatePath(`/resources/${slug}`);
  return {};
}

export async function deleteRow(slug: string, id: string | number): Promise<Result> {
  const auth = await authorize(slug, "delete");
  if ("error" in auth) return { error: auth.error };

  const idColumn = auth.resource.idColumn ?? "id";
  const { error } = await auth.supabase.from(auth.resource.table).delete().eq(idColumn, id);
  if (error) return { error: error.message };

  revalidatePath(`/resources/${slug}`);
  return {};
}
