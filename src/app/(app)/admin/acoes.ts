"use server";

import { revalidatePath } from "next/cache";
import { mensagemDeErro, texto, type EstadoForm } from "@/lib/acao";
import { exigirSindico } from "@/lib/auth";
import type { Papel, StatusDenuncia, StatusMorador } from "@/lib/tipos";

export async function moderarMorador(perfilId: string, status: StatusMorador) {
  const { supabase } = await exigirSindico();
  await supabase.rpc("moderar_morador", { p_perfil: perfilId, p_status: status });
  revalidatePath("/admin");
}

export async function definirPapel(perfilId: string, papel: Papel) {
  const { supabase } = await exigirSindico();
  await supabase.rpc("definir_papel", { p_perfil: perfilId, p_papel: papel });
  revalidatePath("/admin");
}

export async function tratarDenuncia(id: string, status: StatusDenuncia) {
  const { supabase } = await exigirSindico();
  await supabase.from("denuncias").update({ status }).eq("id", id);
  revalidatePath("/admin");
}

export async function salvarRegras(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const { supabase, condominio } = await exigirSindico();
  const { error } = await supabase
    .from("condominios")
    .update({ regras: texto(form, "regras") })
    .eq("id", condominio.id);
  if (error) return { erro: mensagemDeErro(error) };
  revalidatePath("/regras");
  return { ok: "Regras salvas." };
}

export async function novoConvite() {
  const { supabase } = await exigirSindico();
  await supabase.rpc("gerar_novo_convite");
  revalidatePath("/admin");
}
