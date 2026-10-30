import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getResource } from "@/lib/resources";
import ResourceManager from "@/components/ResourceManager";

export const instant = false;

export default async function ResourcePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const resource = getResource(slug);
  if (!resource) notFound();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(resource.table)
    .select("*")
    .order(resource.orderBy ?? resource.idColumn ?? "id", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4 text-yellow-400">{resource.title}</h1>
        <p className="text-red-400">
          Error loading {resource.table}: {error.message}
        </p>
      </main>
    );
  }

  return <ResourceManager resource={resource} rows={(data ?? []) as Record<string, unknown>[]} />;
}