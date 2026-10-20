import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const instant = false;

type ImageRow = {
  id: number;
  image_url: string;
  description: string | null;
  created_at: string;
  profiles: { email: string } | null;
};

export default async function MediaPage() {
  const supabase = await createClient();
  const { data: images } = await supabase
    .from("images")
    .select("id, image_url, description, created_at, profiles(email)")
    .order("created_at", { ascending: false })
    .returns<ImageRow[]>();

  return (
    <main className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-6 text-yellow-400">AI-Generated Media</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images?.map((img) => (
          <Link
            key={img.id}
            href={`/media/${img.id}`}
            className="border border-zinc-800 rounded overflow-hidden bg-zinc-950 hover:border-yellow-400"
          >
            <img src={img.image_url} alt="" className="w-full h-32 object-cover" />
            <p className="p-2 text-xs text-zinc-400 truncate">{img.profiles?.email}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}