import { createClient } from "@/lib/supabase/server";

type Vote = {
  id: number;
  vote_type: string;
  created_at: string;
  profiles: { email: string } | null;
  captions: { caption_text: string } | null;
};

export default async function VotesPage() {
  const supabase = await createClient();
  const { data: votes } = await supabase
    .from("votes")
    .select("id, vote_type, created_at, profiles(email), captions(caption_text)")
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<Vote[]>();

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-6 text-yellow-400">Votes</h1>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-left text-zinc-400">
            <th className="p-2">User</th>
            <th className="p-2">Caption</th>
            <th className="p-2">Vote</th>
            <th className="p-2">When</th>
          </tr>
        </thead>
        <tbody>
          {votes?.map((v) => (
            <tr key={v.id} className="border-b border-zinc-900">
              <td className="p-2">{v.profiles?.email}</td>
              <td className="p-2">{v.captions?.caption_text}</td>
              <td className="p-2">{v.vote_type === "up" ? "👍" : "👎"}</td>
              <td className="p-2">{new Date(v.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}