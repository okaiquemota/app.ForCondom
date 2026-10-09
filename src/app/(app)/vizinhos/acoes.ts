"use server";

import { revalidatePath } from "next/cache";
import { mensagemDeErro, texto, type EstadoForm } from "@/lib/acao";
import { exigirMorador } from "@/lib/auth";

export async function recomendar(vendedorId: string, _: EstadoForm, form: FormData): Promise<EstadoForm> {
  const { supabase, userId } = await exigirMorador();
  const { error } = await supabase
    .from("recomendacoes")
    .insert({ autor_id: userId, vendedor_id: vendedorId, texto: texto(form, "texto") });
  if (error) return { erro: mensagemDeErro(error) };
  revalidatePath(`/vizinhos/${vendedorId}`);
  return { ok: "Obrigado pela recomendação!" };
}

export async function retirarRecomendacao(vendedorId: string) {
  const { supabase, userId } = await exigirMorador();
  await supabase.from("recomendacoes").delete().eq("autor_id", userId).eq("vendedor_id", vendedorId);
  revalidatePath(`/vizinhos/${vendedorId}`);
}
