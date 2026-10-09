"use server";

import { revalidatePath } from "next/cache";
import { mensagemDeErro, texto, type EstadoForm } from "@/lib/acao";
import { exigirMorador } from "@/lib/auth";
import { normalizarWhatsapp } from "@/lib/formato";

export async function salvarPerfil(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  try {
    const { supabase, userId } = await exigirMorador();
    const { error } = await supabase
      .from("perfis")
      .update({
        nome: texto(form, "nome"),
        whatsapp: normalizarWhatsapp(texto(form, "whatsapp")),
        mostrar_apto: form.get("mostrar_apto") === "on",
        bio: texto(form, "bio"),
        vitrine_nome: texto(form, "vitrine_nome") || null,
        vitrine_descricao: texto(form, "vitrine_descricao"),
        horarios: texto(form, "horarios"),
      })
      .eq("id", userId);
    if (error) return { erro: mensagemDeErro(error) };
  } catch (e) {
    return { erro: mensagemDeErro(e) };
  }
  revalidatePath("/", "layout");
  return { ok: "Perfil salvo." };
}
