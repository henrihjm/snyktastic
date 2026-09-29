import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getModule, MODULES } from "@/content";
import { ModuleView } from "@/components/ModuleView";

export const dynamicParams = false;

export function generateStaticParams() {
  return MODULES.map((m) => ({ id: m.id.toLowerCase() }));
}

export async function generateMetadata({ params }: PageProps<"/m/[id]">): Promise<Metadata> {
  const mod = getModule((await params).id);
  return { title: mod ? `${mod.id} ${mod.title} · Synktastic` : "Synktastic" };
}

export default async function ModulePage({ params }: PageProps<"/m/[id]">) {
  const { id } = await params;
  const mod = getModule(id);
  if (!mod) notFound();
  const i = MODULES.indexOf(mod);
  return <ModuleView mod={mod} nextId={MODULES[i + 1]?.id} />;
}
