import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import type { Condominio, Perfil } from "./tipos";

// Usuário logado + perfil (null se ainda não entrou em um condomínio).
export const obterSessao = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return null;

  const { data: perfil } = await supabase
    .from("perfis")
    .select("*")
    .eq("id", userId)
    .maybeSingle<Perfil>();

  return { supabase, userId, email: data.claims.email as string | undefined, perfil };
});

// Garante morador aprovado; redireciona para o passo certo do onboarding.
export async function exigirMorador() {
  const sessao = await obterSessao();
  if (!sessao) redirect("/entrar");
  if (!sessao.perfil) redirect("/onboarding");
  if (sessao.perfil.status !== "aprovado") redirect("/aguardando");

  const { data: condominio } = await sessao.supabase
    .from("condominios")
    .select("*")
    .eq("id", sessao.perfil.condominio_id)
    .single<Condominio>();

  return { ...sessao, perfil: sessao.perfil, condominio: condominio! };
}

export async function exigirSindico() {
  const sessao = await exigirMorador();
  if (sessao.perfil.papel !== "sindico") redirect("/inicio");
  return sessao;
}
