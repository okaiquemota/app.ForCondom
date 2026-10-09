import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigirMorador } from "@/lib/auth";
import type { Anuncio } from "@/lib/tipos";
import { editarAnuncio } from "../../acoes";
import { FormAnuncio } from "../../form-anuncio";

export const metadata: Metadata = { title: "Editar anúncio" };

export default async function EditarAnuncio({ params }: PageProps<"/anuncios/[id]/editar">) {
  const { id } = await params;
  const { supabase, userId } = await exigirMorador();
  const { data: anuncio } = await supabase
    .from("anuncios")
    .select("*")
    .eq("id", id)
    .eq("autor_id", userId)
    .maybeSingle<Anuncio>();
  if (!anuncio || anuncio.status === "removido") notFound();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Editar anúncio</h1>
      <FormAnuncio acao={editarAnuncio.bind(null, id)} anuncio={anuncio} />
    </div>
  );
}
