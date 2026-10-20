"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";


export default function MediaDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [image, setImage] = useState<any>(null);
  const [captions, setCaptions] = useState<any[]>([]);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: img } = await supabase.from("images").select("*").eq("id", id).single();
      const { data: caps } = await supabase.from("captions").select("*").eq("image_id", id);
      setImage(img);
      setCaptions(caps ?? []);
    }
    load();
  }, [id]);

  const updateCaption = async (captionId: number, text: string) => {
    const supabase = createClient();
    await supabase.from("captions").update({ caption_text: text }).eq("id", captionId);
  };

  const deleteCaption = async (captionId: number) => {
    const supabase = createClient();
    await supabase.from("captions").delete().eq("id", captionId);
    setCaptions((prev) => prev.filter((c) => c.id !== captionId));
  };

  const deleteImage = async () => {
    const supabase = createClient();
    await supabase.from("images").delete().eq("id", id); // captions cascade via FK
    router.push("/media");
  };

  if (!image) return <p className="p-8 text-white bg-black min-h-screen">Loading...</p>;

  return (
    <main className="p-8">
      <h1 className="text-xl font-bold mb-4 text-yellow-400">Media Detail</h1>
      <img src={image.image_url} alt="" className="w-64 rounded mb-6" />
      <p className="text-zinc-400 mb-6">{image.description}</p>

      <h2 className="font-semibold mb-2 text-yellow-400">Captions</h2>
      {captions.map((c) => (
        <div key={c.id} className="mb-3 flex gap-2 items-center">
          <input
            defaultValue={c.caption_text}
            onBlur={(e) => updateCaption(c.id, e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded p-2"
          />
          <button onClick={() => deleteCaption(c.id)} className="text-red-400">Delete</button>
        </div>
      ))}

      <button
        onClick={deleteImage}
        className="mt-6 px-4 py-2 bg-red-600 rounded font-semibold"
      >
        Delete Image
      </button>
    </main>
  );
}