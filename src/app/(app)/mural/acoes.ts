"use server";

import { revalidatePath } from "next/cache";
import { mensagemDeErro, texto, type EstadoForm } from "@/lib/acao";
import { exigirSindico } from "@/lib/auth";

export async function publicarAviso(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const { supabase, userId } = await exigirSindico();
  const { error } = await supabase.from("avisos").insert({
    autor_id: userId,
    titulo: texto(form, "titulo"),
    corpo: texto(form, "corpo"),
    fixado: form.get("fixado") === "on",
  });
  if (error) return { erro: mensagemDeErro(error) };
  revalidatePath("/mural");
  revalidatePath("/inicio");
  return { ok: "Aviso publicado." };
}

export async function alternarFixado(id: string, fixado: boolean) {
  const { supabase } = await exigirSindico();
  await supabase.from("avisos").update({ fixado }).eq("id", id);
  revalidatePath("/mural");
  revalidatePath("/inicio");
}

export async function apagarAviso(id: string) {
  const { supabase } = await exigirSindico();
  await supabase.from("avisos").delete().eq("id", id);
  revalidatePath("/mural");
  revalidatePath("/inicio");
}
