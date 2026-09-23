import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BeatmapsetView } from "@/components/beatmapset-view";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  return { title: `Beatmap ${id}` };
}

export default async function BeatmapsetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  return <BeatmapsetView id={id} />;
}
