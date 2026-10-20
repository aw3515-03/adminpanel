import { createClient } from "@/lib/supabase/server";

export default async function UsersPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, first_name, last_name, is_superadmin, created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-6 text-yellow-400">Users</h1>
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-zinc-800 text-left text-zinc-400">
            <th className="p-2">Email</th>
            <th className="p-2">Name</th>
            <th className="p-2">Admin</th>
            <th className="p-2">Joined</th>
          </tr>
        </thead>
        <tbody>
          {profiles?.map((p) => (
            <tr key={p.id} className="border-b border-zinc-900">
              <td className="p-2">{p.email}</td>
              <td className="p-2">{p.first_name} {p.last_name}</td>
              <td className="p-2">{p.is_superadmin ? "Yes" : "No"}</td>
              <td className="p-2">{new Date(p.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}