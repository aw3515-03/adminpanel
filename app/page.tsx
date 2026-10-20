import { createClient } from "@/lib/supabase/server";

export default async function Overview() {
  const supabase = await createClient();

  const [{ count: userCount }, { count: imageCount }, { count: captionCount }, { count: voteCount }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("images").select("*", { count: "exact", head: true }),
      supabase.from("captions").select("*", { count: "exact", head: true }),
      supabase.from("votes").select("*", { count: "exact", head: true }),
    ]);

  const { data: topCaptions } = await supabase
    .from("captions")
    .select("id, caption_text, votes(vote_type)")
    .limit(50);

  const ranked = (topCaptions ?? [])
    .map((c) => ({
      ...c,
      score: c.votes.filter((v: any) => v.vote_type === "up").length -
             c.votes.filter((v: any) => v.vote_type === "down").length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-8 text-yellow-400">Overview</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {[
          ["Users", userCount],
          ["Images", imageCount],
          ["Captions", captionCount],
          ["Votes", voteCount],
        ].map(([label, value]) => (
          <div key={label as string} className="border border-zinc-800 rounded-lg p-6 bg-zinc-950">
            <p className="text-zinc-400 text-sm mb-2">{label}</p>
            <p className="text-3xl font-bold text-yellow-400">{value}</p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4 text-yellow-400">Top 5 Captions by Score</h2>
      <div className="space-y-3">
        {ranked.map((c) => (
          <div key={c.id} className="border border-zinc-800 rounded p-4 bg-zinc-950 flex justify-between">
            <span>{c.caption_text}</span>
            <span className="text-yellow-400 font-bold">{c.score}</span>
          </div>
        ))}
      </div>
    </main>
  );
}