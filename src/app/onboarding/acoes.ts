"use server";

import { redirect } from "next/navigation";
import { mensagemDeErro, texto, type EstadoForm } from "@/lib/acao";
import { normalizarWhatsapp } from "@/lib/formato";
import { createClient } from "@/lib/supabase/server";

function dadosMorador(form: FormData) {
  return {
    p_nome_morador: texto(form, "nome"),
    p_torre: texto(form, "torre"),
    p_apto: texto(form, "apto"),
    p_whatsapp: normalizarWhatsapp(texto(form, "whatsapp")) ?? "",
  };
}

export async function entrarNoCondominio(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("entrar_condominio", {
      p_codigo: texto(form, "codigo"),
      ...dadosMorador(form),
    });
    if (error) return { erro: mensagemDeErro(error) };
  } catch (e) {
    return { erro: mensagemDeErro(e) };
  }
  redirect("/aguardando");
}

export async function criarCondominio(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.rpc("criar_condominio", {
      p_nome: texto(form, "condominio"),
      p_cidade: texto(form, "cidade"),
      ...dadosMorador(form),
    });
    if (error) return { erro: mensagemDeErro(error) };
  } catch (e) {
    return { erro: mensagemDeErro(e) };
  }
  redirect("/admin");
}
