"use client";

import { useMemo, useState, useTransition } from "react";
import { createRow, updateRow, deleteRow } from "@/app/actions";
import type { FieldType, Resource } from "@/lib/resources";

type Row = Record<string, unknown>;
type Field = { key: string; type: FieldType; readOnly: boolean };
type Form = Record<string, string | boolean>;

const SYSTEM_COLUMN = /^(id|created.*|modified.*|updated.*)$/i;

function inferFields(rows: Row[], resource: Resource): Field[] {
  if (resource.fields) {
    return resource.fields.map((f) => ({
      key: f.key,
      type: f.type ?? "text",
      readOnly: f.readOnly ?? false,
    }));
  }

  const keys: string[] = [];
  const sample: Record<string, unknown> = {};
  for (const row of rows) {
    for (const [k, v] of Object.entries(row)) {
      if (!keys.includes(k)) keys.push(k);
      if (sample[k] == null && v != null) sample[k] = v;
    }
  }

  const idColumn = resource.idColumn ?? "id";
  return keys.map((key) => {
    const v = sample[key];
    let type: FieldType = "text";
    if (typeof v === "number") type = "number";
    else if (typeof v === "boolean") type = "boolean";
    else if (v && typeof v === "object") type = "json";
    else if (typeof v === "string" && v.length > 80) type = "textarea";
    return { key, type, readOnly: key === idColumn || SYSTEM_COLUMN.test(key) };
  });
}

function toForm(fields: Field[], row?: Row): Form {
  const form: Form = {};
  for (const f of fields) {
    const v = row?.[f.key];
    if (f.type === "boolean") form[f.key] = Boolean(v);
    else if (f.type === "json") form[f.key] = v == null ? "" : JSON.stringify(v, null, 2);
    else form[f.key] = v == null ? "" : String(v);
  }
  return form;
}

function fromForm(fields: Field[], form: Form): Row {
  const out: Row = {};
  for (const f of fields) {
    if (f.readOnly) continue;
    const raw = form[f.key];
    if (f.type === "boolean") out[f.key] = raw;
    else if (f.type === "number") out[f.key] = raw === "" ? null : Number(raw);
    else if (f.type === "json") out[f.key] = raw === "" ? null : JSON.parse(raw as string);
    else out[f.key] = raw === "" ? null : raw;
  }
  return out;
}

function display(v: unknown) {
  if (v == null) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export default function ResourceManager({ resource, rows }: { resource: Resource; rows: Row[] }) {
  const idColumn = resource.idColumn ?? "id";
  const fields = useMemo(() => inferFields(rows, resource), [rows, resource]);
  const columns = fields.slice(0, 7);

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Row | "new" | null>(null);
  const [form, setForm] = useState<Form>({});
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const isNew = selected === "new";
  const editable = isNew ? !!resource.canCreate : !!resource.canUpdate;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => JSON.stringify(r).toLowerCase().includes(q));
  }, [rows, query]);

  const open = (row: Row | "new") => {
    setSelected(row);
    setForm(toForm(fields, row === "new" ? undefined : row));
    setError(null);
  };
  const close = () => setSelected(null);

  const submit = () => {
    if (!selected) return;
    setError(null);

    let values: Row;
    try {
      values = fromForm(fields, form);
    } catch {
      setError("One of the JSON fields isn't valid JSON.");
      return;
    }

    startTransition(async () => {
      const res = isNew
        ? await createRow(resource.slug, values)
        : await updateRow(resource.slug, (selected as Row)[idColumn] as string | number, values);
      if (res.error) setError(res.error);
      else close();
    });
  };

  const remove = () => {
    if (!selected || isNew) return;
    if (!confirm("Delete this row? This can't be undone.")) return;

    startTransition(async () => {
      const res = await deleteRow(resource.slug, (selected as Row)[idColumn] as string | number);
      if (res.error) setError(res.error);
      else close();
    });
  };

  const modalFields = fields.filter((f) => !isNew || !f.readOnly);

  return (
    <main className="p-8 text-white">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold text-yellow-400">{resource.title}</h1>
        {resource.canCreate && (
          <button
            onClick={() => open("new")}
            className="px-4 py-2 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-300"
          >
            New
          </button>
        )}
      </div>
      <p className="text-sm text-zinc-500 mb-6">
        Showing {filtered.length} of {rows.length} (latest 200 rows)
      </p>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="w-full max-w-md mb-6 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-sm"
      />

      <div className="overflow-x-auto border border-zinc-800 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left text-zinc-400 bg-zinc-950">
              {columns.map((f) => (
                <th key={f.key} className="p-3 font-medium whitespace-nowrap">
                  {f.key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr
                key={String(row[idColumn] ?? i)}
                onClick={() => open(row)}
                className="border-b border-zinc-900 hover:bg-zinc-900 cursor-pointer"
              >
                {columns.map((f) => (
                  <td key={f.key} className="p-3 max-w-xs truncate">
                    {display(row[f.key])}
                  </td>
                ))}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={Math.max(columns.length, 1)} className="p-6 text-center text-zinc-500">
                  No rows found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={close}
        >
          <div
            className="bg-zinc-900 border border-zinc-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-yellow-400 mb-4">
              {isNew ? `New ${resource.title}` : resource.title}
            </h2>

            {modalFields.length === 0 && (
              <p className="text-sm text-zinc-400 mb-4">
                This table is empty, so its columns can&apos;t be detected. Add a <code>fields</code> list for
                this resource in <code>lib/resources.ts</code>.
              </p>
            )}

            <div className="flex flex-col gap-4">
              {modalFields.map((f) => {
                const disabled = f.readOnly || !editable;
                const base =
                  "w-full bg-zinc-950 border border-zinc-700 rounded px-3 py-2 text-sm disabled:opacity-60";
                return (
                  <label key={f.key} className="flex flex-col gap-1 text-sm">
                    <span className="text-zinc-400">{f.key}</span>
                    {f.type === "boolean" ? (
                      <input
                        type="checkbox"
                        checked={Boolean(form[f.key])}
                        disabled={disabled}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
                        className="w-5 h-5"
                      />
                    ) : f.type === "textarea" || f.type === "json" ? (
                      <textarea
                        rows={f.type === "json" ? 6 : 4}
                        value={String(form[f.key] ?? "")}
                        disabled={disabled}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        className={`${base} ${f.type === "json" ? "font-mono" : ""}`}
                      />
                    ) : (
                      <input
                        type={f.type === "number" ? "number" : "text"}
                        value={String(form[f.key] ?? "")}
                        disabled={disabled}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        className={base}
                      />
                    )}
                  </label>
                );
              })}
            </div>

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

            <div className="flex items-center justify-between mt-6">
              <div>
                {!isNew && resource.canDelete && (
                  <button
                    onClick={remove}
                    disabled={pending}
                    className="px-4 py-2 rounded bg-red-600 text-white font-semibold disabled:opacity-50"
                  >
                    Delete
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={close}
                  className="px-4 py-2 rounded border border-zinc-500 text-zinc-200 hover:bg-zinc-800"
                >
                  {editable ? "Cancel" : "Close"}
                </button>
                {editable && (
                  <button
                    onClick={submit}
                    disabled={pending}
                    className="px-4 py-2 rounded bg-yellow-400 text-black font-semibold hover:bg-yellow-300 disabled:opacity-50"
                  >
                    {pending ? "Saving..." : "Save"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}