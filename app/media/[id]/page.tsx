import MediaDetailClient from "./MediaDetailClient";

export const instant = false;

export default async function MediaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MediaDetailClient id={id} />;
}